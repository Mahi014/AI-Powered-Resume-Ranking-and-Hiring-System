# app/routes.py
import io
import html as html_lib
from datetime import datetime

from fastapi import APIRouter, HTTPException, Path as FPath, Request, Query
from fastapi.responses import StreamingResponse, HTMLResponse

import pandas as pd

from .db import fetch_job_and_applicants, update_ranks
from .extractors import extract_text_from_bytes
from .ranker import compute_scores_from_texts
from .config import SKILL_BOOST_WEIGHT, TOP_K

router = APIRouter()


@router.post("/api/jobs/{job_id}/rank")
def rank_job_resumes(job_id: int = FPath(..., description="Job ID to rank")):
    """
    Rank all applicants for a job and persist ranks into job_applied.rank
    """
    job, apps = fetch_job_and_applicants(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    if not apps:
        return {"success": True, "message": "No applicants to rank", "ranked": []}

    # Build resume texts for scoring
    resumes_texts = []
    for row in apps:
        jsid = row["job_seeker_id"]
        rname = row.get("resume_name") or f"resume_{jsid}.pdf"
        rdata = row.get("resume_data")
        raw_text = ""
        if rdata:
            try:
                bytes_data = rdata.tobytes() if isinstance(rdata, memoryview) else bytes(rdata)
                raw_text = extract_text_from_bytes(rname, bytes_data)
            except Exception as e:
                print(f"[WARN] failed extracting resume for job_seeker_id={jsid}: {e}")
                raw_text = ""
        resumes_texts.append({"job_seeker_id": jsid, "resume_name": rname, "text": raw_text})

    # Compute scores
    jd_text = job.get("job_description") or ""
    ranked = compute_scores_from_texts(jd_text, resumes_texts, cfg_skill_weight=SKILL_BOOST_WEIGHT)

    # Persist ranks: best -> 1, next -> 2, ...
    ordered_jsids = [int(r["job_seeker_id"]) for r in ranked]
    update_ranks(job_id, ordered_jsids)

    # Prepare top-K response
    top_k = min(TOP_K, len(ranked))
    response_rows = []
    for i in range(top_k):
        r = ranked[i]
        response_rows.append({
            "rank": i + 1,
            "job_seeker_id": r["job_seeker_id"],
            "resume_name": r["resume_name"],
            "score": r["score"],
            "cosine_score": r["cosine_score"],
            "skill_ratio": r["skill_ratio"],
            "matched_skills": r["matched_skills"][:10]
        })

    return {"success": True, "job_id": job_id, "ranked_count": len(ranked), "top": response_rows}


@router.get("/api/jobs/{job_id}/report")
def get_job_report(
    request: Request,
    job_id: int = FPath(..., description="Job ID to create report for"),
    download: int = Query(0, description="Set to 1 to download Excel file instead of HTML view"),
):
    """
    If ?download=1 return an Excel file (StreamingResponse).
    Otherwise render a friendly HTML page showing the report (no download).
    """
    job, apps = fetch_job_and_applicants(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    # Build resume texts (extract text) then compute scores (same logic as ranking)
    resumes_texts = []
    for row in apps:
        jsid = row["job_seeker_id"]
        rname = row.get("resume_name") or f"resume_{jsid}.pdf"
        rdata = row.get("resume_data")
        raw_text = ""
        if rdata:
            try:
                bytes_data = rdata.tobytes() if isinstance(rdata, memoryview) else bytes(rdata)
                raw_text = extract_text_from_bytes(rname, bytes_data)
            except Exception as e:
                print(f"[WARN] failed extracting resume for job_seeker_id={jsid}: {e}")
                raw_text = ""
        resumes_texts.append({"job_seeker_id": jsid, "resume_name": rname, "text": raw_text})

    jd_text = job.get("job_description") or ""
    ranked = compute_scores_from_texts(jd_text, resumes_texts, cfg_skill_weight=SKILL_BOOST_WEIGHT)

    # Map job_seeker_id -> computed score row for easy lookup
    score_map = {r["job_seeker_id"]: r for r in ranked}

    # Build rows (include stored rank from DB and computed metrics)
    rows = []
    for row in apps:
        jsid = row["job_seeker_id"]
        score_row = score_map.get(jsid, {})
        rows.append({
            "rank": row.get("rank", 0),
            "job_seeker_id": jsid,
            "name": row.get("name") or "",
            "degree": row.get("degree") or "",
            "college": row.get("college") or "",
            "graduation_year": row.get("graduation_year") or "",
            "resume_name": row.get("resume_name") or "",
            "score": score_row.get("score"),
            "cosine_score": score_row.get("cosine_score"),
            "skill_ratio": score_row.get("skill_ratio"),
            "matched_skills": ",".join(score_row.get("matched_skills", []))
        })

    # If download requested -> return Excel (StreamingResponse)
    if download and int(download) == 1:
        # Construct DataFrame in preferred column order
        df = pd.DataFrame(rows, columns=[
            "rank", "job_seeker_id", "name", "degree", "college", "graduation_year",
            "resume_name", "score", "cosine_score", "skill_ratio", "matched_skills"
        ])
        # sort by rank (rank 0 at bottom), then by score desc
        df["rank_sort"] = df["rank"].apply(lambda x: x if (x and x > 0) else 10 ** 9)
        df = df.sort_values(by=["rank_sort", "score"], ascending=[True, False]).drop(columns=["rank_sort"])

        buf = io.BytesIO()
        with pd.ExcelWriter(buf, engine="xlsxwriter") as writer:
            df.to_excel(writer, index=False, sheet_name="report")
            workbook = writer.book
            worksheet = writer.sheets["report"]
            for i, col in enumerate(df.columns):
                col_width = max(df[col].astype(str).map(len).max(), len(col)) + 2
                worksheet.set_column(i, i, min(col_width, 50))
        buf.seek(0)
        filename = f"job_{job_id}_report.xlsx"
        return StreamingResponse(
            buf,
            media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            headers={"Content-Disposition": f'attachment; filename="{filename}"'}
        )

    # Otherwise render HTML report (inline viewing)
    # Sort rows: ranked ascending, unranked last, then by score desc
    def sort_key(r):
        rank = r.get("rank") or 0
        rank_sort = rank if (rank and rank > 0) else 10 ** 9
        score = r.get("score") or 0.0
        return (rank_sort, -score)

    rows_sorted = sorted(rows, key=sort_key)

    # Build HTML table rows with inline styles
    table_rows_html = []
    td_base = "padding:8px 10px;border-bottom:1px solid #1f2937;font-size:12px;color:#e5e7eb;"
    td_num = td_base + "text-align:right;font-variant-numeric:tabular-nums;"
    for r in rows_sorted:
        resume_link = f"http://localhost:5000/resume/{r['job_seeker_id']}"  # Node resume preview route
        table_rows_html.append(
            "<tr>"
            f"<td style='{td_num}'>{html_lib.escape(str(r.get('rank', '')))}</td>"
            f"<td style='{td_base}'>{html_lib.escape(str(r.get('job_seeker_id', '')))}</td>"
            f"<td style='{td_base}'>{html_lib.escape(r.get('name',''))}</td>"
            f"<td style='{td_base}'>{html_lib.escape(r.get('degree',''))}</td>"
            f"<td style='{td_base}'>{html_lib.escape(r.get('college',''))}</td>"
            f"<td style='{td_num}'>{html_lib.escape(str(r.get('graduation_year','')))}</td>"
            f"<td style='{td_base}'>"
            f"<a href='{resume_link}' target='_blank' rel='noopener noreferrer' "
            "style='color:#38bdf8;text-decoration:none;font-weight:500;'>"
            f"{html_lib.escape(r.get('resume_name',''))}</a></td>"
            f"<td style='{td_num}'>{'' if r.get('score') is None else format(r.get('score'), '.4f')}</td>"
            f"<td style='{td_num}'>{'' if r.get('cosine_score') is None else format(r.get('cosine_score'), '.4f')}</td>"
            f"<td style='{td_num}'>{'' if r.get('skill_ratio') is None else format(r.get('skill_ratio'), '.4f')}</td>"
            f"<td style='{td_base}'>{html_lib.escape(r.get('matched_skills',''))}</td>"
            "</tr>"
        )

    job_title = html_lib.escape(job.get("job_title", ""))
    job_role = html_lib.escape(job.get("job_role", ""))
    generated_at = datetime.utcnow().strftime("%Y-%m-%d %H:%M:%SZ")

    html_content = f"""
    <!doctype html>
    <html>
    <head>
      <meta charset="utf-8" />
      <title>Job {job_id} - Applicant Report</title>
      <meta name="viewport" content="width=device-width, initial-scale=1" />
    </head>
    <body style="margin:0;background:#020617;background-image:radial-gradient(circle at top,#1d4ed8 0,#020617 55%,#000000 100%);font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;color:#e5e7eb;">
      <div style='min-height:100vh;display:flex;align-items:flex-start;justify-content:center;padding:16px;box-sizing:border-box;'>
        <div style="width:100%;max-width:1200px;margin:16px auto;background:linear-gradient(145deg,#020617 0%,#020617 35%,#020617 100%);border-radius:18px;box-shadow:0 30px 80px rgba(15,23,42,0.9);border:1px solid rgba(148,163,184,0.35);padding:22px 20px 24px 20px;box-sizing:border-box;position:relative;overflow:hidden;">
          
          <!-- subtle glow accent -->
          <div style='position:absolute;inset:auto -80px -120px auto;width:260px;height:260px;background:radial-gradient(circle,#1d4ed8 0,transparent 60%);opacity:0.25;pointer-events:none;'></div>

          <!-- Header -->
          <div style="position:relative;display:flex;flex-wrap:wrap;align-items:flex-start;justify-content:space-between;gap:16px;margin-bottom:18px;">
            <div style="display:flex;flex-direction:column;gap:8px;min-width:0;">
              <div style="display:flex;align-items:center;gap:10px;">
                <div style="height:34px;width:34px;border-radius:9999px;background-image:linear-gradient(to bottom right,#3b82f6,#22c55e);display:flex;align-items:center;justify-content:center;font-weight:700;font-size:15px;color:white;box-shadow:0 15px 40px rgba(34,197,94,0.7);">
                  AI
                </div>
                <div style="display:flex;flex-direction:column;">
                  <span style="font-size:15px;font-weight:600;color:#f9fafb;">Applicant Report</span>
                  <span style="font-size:11px;color:#9ca3af;">AI-powered resume ranking • TF-IDF • Skill matching</span>
                </div>
              </div>

              <div style="margin-top:6px;">
                <div style="font-size:19px;font-weight:600;color:#e5e7eb;margin-bottom:4px;word-break:break-word;">
                  {job_title}
                </div>
                <div style="font-size:12px;color:#9ca3af;">
                  Role:
                  <span style="color:#e5e7eb;font-weight:500;"> {job_role}</span>
                  <span style="color:#4b5563;"> &nbsp;•&nbsp; </span>
                  Job ID:
                  <span style="color:#e5e7eb;font-weight:500;"> {job_id}</span>
                  <span style="color:#4b5563;"> &nbsp;•&nbsp; </span>
                  Generated:
                  <span style="color:#e5e7eb;font-weight:500;"> {generated_at}</span>
                </div>
                <div style="font-size:11px;color:#6b7280;margin-top:4px;">
                  Scoring model: cosine similarity + skill boost (weight = {SKILL_BOOST_WEIGHT})
                </div>
              </div>
            </div>

            <div style="display:flex;flex-direction:column;align-items:flex-end;gap:6px;min-width:220px;">
              <div style="display:flex;flex-wrap:wrap;gap:8px;justify-content:flex-end;">
                <a href="/api/jobs/{job_id}/report?download=1"
                   style="display:inline-block;padding:8px 14px;border-radius:9999px;background-image:linear-gradient(to right,#6366f1,#22c55e);color:white;text-decoration:none;font-size:12px;font-weight:500;box-shadow:0 16px 35px rgba(79,70,229,0.7);">
                  Download Excel
                </a>
                <a href="javascript:window.print()"
                   style="display:inline-block;padding:8px 14px;border-radius:9999px;background:#020617;color:#e5e7eb;text-decoration:none;font-size:12px;font-weight:500;border:1px solid rgba(148,163,184,0.7);">
                  Print
                </a>
              </div>
              <div style="margin-top:4px;font-size:11px;color:#6b7280;text-align:right;max-width:230px;">
                Tip: export to Excel for deeper analysis or sharing with your hiring team.
              </div>
            </div>
          </div>

          <!-- Table container -->
          <div style="position:relative;margin-top:4px;border-radius:14px;background:rgba(15,23,42,0.96);border:1px solid rgba(55,65,81,0.9);overflow:hidden;">
            <div style="max-height:75vh;overflow:auto;">
              <table style="width:100%;border-collapse:collapse;font-size:12px;">
                <thead>
                  <tr>
                    <th style="position:sticky;top:0;z-index:1;padding:8px 10px;background:#020617;border-bottom:1px solid #1f2937;text-align:right;color:#e5e7eb;font-weight:600;white-space:nowrap;">Rank</th>
                    <th style="position:sticky;top:0;z-index:1;padding:8px 10px;background:#020617;border-bottom:1px solid #1f2937;text-align:left;color:#e5e7eb;font-weight:600;white-space:nowrap;">Seeker ID</th>
                    <th style="position:sticky;top:0;z-index:1;padding:8px 10px;background:#020617;border-bottom:1px solid #1f2937;text-align:left;color:#e5e7eb;font-weight:600;">Name</th>
                    <th style="position:sticky;top:0;z-index:1;padding:8px 10px;background:#020617;border-bottom:1px solid #1f2937;text-align:left;color:#e5e7eb;font-weight:600;">Degree</th>
                    <th style="position:sticky;top:0;z-index:1;padding:8px 10px;background:#020617;border-bottom:1px solid #1f2937;text-align:left;color:#e5e7eb;font-weight:600;">College</th>
                    <th style="position:sticky;top:0;z-index:1;padding:8px 10px;background:#020617;border-bottom:1px solid #1f2937;text-align:right;color:#e5e7eb;font-weight:600;white-space:nowrap;">Graduation Year</th>
                    <th style="position:sticky;top:0;z-index:1;padding:8px 10px;background:#020617;border-bottom:1px solid #1f2937;text-align:left;color:#e5e7eb;font-weight:600;">Resume</th>
                    <th style="position:sticky;top:0;z-index:1;padding:8px 10px;background:#020617;border-bottom:1px solid #1f2937;text-align:right;color:#e5e7eb;font-weight:600;white-space:nowrap;">Score</th>
                    <th style="position:sticky;top:0;z-index:1;padding:8px 10px;background:#020617;border-bottom:1px solid #1f2937;text-align:right;color:#e5e7eb;font-weight:600;white-space:nowrap;">Cosine</th>
                    <th style="position:sticky;top:0;z-index:1;padding:8px 10px;background:#020617;border-bottom:1px solid #1f2937;text-align:right;color:#e5e7eb;font-weight:600;white-space:nowrap;">Skill ratio</th>
                    <th style="position:sticky;top:0;z-index:1;padding:8px 10px;background:#020617;border-bottom:1px solid #1f2937;text-align:left;color:#e5e7eb;font-weight:600;">Matched skills</th>
                  </tr>
                </thead>
                <tbody>
                  {"".join(table_rows_html) if table_rows_html else "<tr><td colspan='11' style='padding:14px 10px;text-align:center;color:#9ca3af;'>No applicants found.</td></tr>"}
                </tbody>
              </table>
            </div>
            <div style="padding:8px 12px;border-top:1px solid #1f2937;font-size:11px;color:#6b7280;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:6px;background:linear-gradient(to right,#020617,#020617);">
              <span>Ranked candidates appear first. Unranked applicants are grouped at the bottom.</span>
              <span style="color:#4b5563;">Powered by your FastAPI resume ranking engine.</span>
            </div>
          </div>
        </div>
      </div>
    </body>
    </html>
    """

    return HTMLResponse(content=html_content, status_code=200)


@router.get("/health")
def health():
    return {"status": "ok"}
