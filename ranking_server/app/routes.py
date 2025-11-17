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
        df['rank_sort'] = df['rank'].apply(lambda x: x if (x and x > 0) else 10 ** 9)
        df = df.sort_values(by=['rank_sort', 'score'], ascending=[True, False]).drop(columns=['rank_sort'])

        buf = io.BytesIO()
        with pd.ExcelWriter(buf, engine="xlsxwriter") as writer:
            df.to_excel(writer, index=False, sheet_name="report")
            workbook = writer.book
            worksheet = writer.sheets['report']
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

    # Build HTML table rows (escape values)
    table_rows_html = []
    for r in rows_sorted:
        resume_link = f"http://localhost:5000/resume/{r['job_seeker_id']}"  # Node resume preview route
        table_rows_html.append(
            "<tr>"
            f"<td class='num'>{html_lib.escape(str(r.get('rank', '')))}</td>"
            f"<td>{html_lib.escape(str(r.get('job_seeker_id', '')))}</td>"
            f"<td>{html_lib.escape(r.get('name',''))}</td>"
            f"<td>{html_lib.escape(r.get('degree',''))}</td>"
            f"<td>{html_lib.escape(r.get('college',''))}</td>"
            f"<td>{html_lib.escape(str(r.get('graduation_year','')))}</td>"
            f"<td><a href='{resume_link}' target='_blank' rel='noopener noreferrer'>{html_lib.escape(r.get('resume_name',''))}</a></td>"
            f"<td class='num'>{'' if r.get('score') is None else format(r.get('score'), '.4f')}</td>"
            f"<td class='num'>{'' if r.get('cosine_score') is None else format(r.get('cosine_score'), '.4f')}</td>"
            f"<td class='num'>{'' if r.get('skill_ratio') is None else format(r.get('skill_ratio'), '.4f')}</td>"
            f"<td>{html_lib.escape(r.get('matched_skills',''))}</td>"
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
      <style>
        body {{ font-family: -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial; margin: 18px; background:#f7fafc; color:#1f2937; }}
        .card {{ background:white; border-radius:8px; padding:18px; box-shadow:0 6px 18px rgba(15,23,42,0.08); max-width:1200px; margin: auto; }}
        h1 {{ margin:0 0 6px 0; font-size:20px; }}
        .meta {{ color:#6b7280; margin-bottom:12px; }}
        table {{ width:100%; border-collapse: collapse; font-size:13px; }}
        th, td {{ padding:8px 10px; border-bottom:1px solid #e5e7eb; text-align:left; }}
        th {{ background:#f3f4f6; color:#111827; position:sticky; top:0; }}
        td.num {{ text-align:right; font-feature-settings: 'tnum'; }}
        tr:hover td {{ background:#fffaf0; }}
        .controls {{ display:flex; gap:8px; margin-bottom:12px; }}
        .btn {{ display:inline-block; padding:8px 12px; border-radius:6px; background:#4f46e5; color:white; text-decoration:none; }}
        .btn-secondary {{ background:#6b7280; }}
        .small {{ font-size:12px; color:#6b7280; }}
        @media (max-width:800px) {{
          table {{ font-size:12px; }}
          .card {{ padding:10px; }}
        }}
      </style>
    </head>
    <body>
      <div class="card">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
          <div>
            <h1>Applicant Report — {job_title}</h1>
            <div class="meta">Role: {job_role} &nbsp;•&nbsp; Job ID: {job_id} &nbsp;•&nbsp; Generated: {generated_at}</div>
            <div class="small">Scoring: TF-IDF cosine + skill boost (weight = {SKILL_BOOST_WEIGHT})</div>
          </div>
          <div style="text-align:right">
            <a class="btn" href="/api/jobs/{job_id}/report?download=1">Download Excel</a>
            <a class="btn btn-secondary" href="javascript:window.print()">Print</a>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th style="width:60px">Rank</th>
              <th style="width:90px">Seeker ID</th>
              <th>Name</th>
              <th>Degree</th>
              <th>College</th>
              <th style="width:110px">Graduation Year</th>
              <th>Resume</th>
              <th style="width:90px">Score</th>
              <th style="width:110px">Cosine</th>
              <th style="width:100px">Skill ratio</th>
              <th>Matched skills</th>
            </tr>
          </thead>
          <tbody>
            {"".join(table_rows_html) if table_rows_html else "<tr><td colspan='11' style='text-align:center;padding:16px'>No applicants found.</td></tr>"}
          </tbody>
        </table>
      </div>
    </body>
    </html>
    """

    return HTMLResponse(content=html_content, status_code=200)


@router.get("/health")
def health():
    return {"status": "ok"}
