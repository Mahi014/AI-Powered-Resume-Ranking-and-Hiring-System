import React, { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";

const ShowApplicants = () => {
  const { job_id } = useParams();
  const navigate = useNavigate();
  const [applicants, setApplicants] = useState([]);
  const [jobDetails, setJobDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [ranking, setRanking] = useState(false);
  const [rankingMsg, setRankingMsg] = useState(
    "Ranking resumes — this may take a moment..."
  );

  useEffect(() => {
    fetchApplicantsAndJob();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [job_id]);

  const fetchApplicantsAndJob = async () => {
    setLoading(true);
    try {
      const [appRes, jobRes] = await Promise.all([
        fetch(`http://localhost:5000/job/${job_id}/applicants`, {
          credentials: "include",
        }),
        fetch(`http://localhost:5000/job/${job_id}`, {
          credentials: "include",
        }),
      ]);

      const appData = await appRes.json();
      const jobData = await jobRes.json();

      if (appData.success && Array.isArray(appData.applicants)) {
        // normalize status to lowercase and fallback to applied
        const normalized = appData.applicants.map((a) => ({
          ...a,
          status: a.status ? a.status.toLowerCase() : "applied",
        }));
        setApplicants(normalized);
      } else {
        setApplicants([]);
      }

      if (jobData.success) {
        setJobDetails(jobData.job);
      } else {
        setJobDetails(null);
      }
    } catch (err) {
      console.error("Error fetching data:", err);
      setApplicants([]);
      setJobDetails(null);
    } finally {
      setLoading(false);
    }
  };

  // Sort applicants: ranked (rank>0) asc, then unranked by name
  const sortedApplicants = useMemo(() => {
    const copy = (applicants || []).slice();
    copy.sort((a, b) => {
      const ra = a.rank ?? 0;
      const rb = b.rank ?? 0;
      if (ra === 0 && rb === 0) {
        return (a.name || "").localeCompare(b.name || "");
      }
      if (ra === 0) return 1;
      if (rb === 0) return -1;
      return ra - rb;
    });
    return copy;
  }, [applicants]);

  const rankResumes = async () => {
    if (ranking) return;
    setRanking(true);
    setRankingMsg("Ranking resumes — this may take a moment. Please wait...");
    try {
      const res = await fetch(
        `http://localhost:8000/api/jobs/${job_id}/rank`,
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
        }
      );
      const data = await res.json();
      if (data && data.success) {
        const topCount = data.ranked_count ?? 0;
        const topPreview = Array.isArray(data.top)
          ? data.top.slice(0, 3)
          : [];
        const previewStr = topPreview
          .map((t) => `${t.job_seeker_id}(rank:${t.rank ?? "-"})`)
          .join(", ");
        await fetchApplicantsAndJob();
        alert(
          `Ranking finished. Ranked ${topCount} applicants. Top: ${
            previewStr || "N/A"
          }`
        );
      } else {
        console.error("Ranking API returned failure:", data);
        alert("Ranking failed. See console for details.");
      }
    } catch (err) {
      console.error("Error calling ranking API:", err);
      alert(
        "Error invoking ranking service. Check server logs and CORS settings."
      );
    } finally {
      setRanking(false);
    }
  };

  const viewReport = async () => {
    const reportUrl = `http://localhost:8000/api/jobs/${job_id}/report`;
    try {
      const newWin = window.open(reportUrl, "_blank", "noopener,noreferrer");
      if (newWin) return;
    } catch (err) {
      console.warn("Direct open failed, falling back to fetch:", err);
    }
    try {
      const res = await fetch(reportUrl, { credentials: "include" });
      if (!res.ok) {
        throw new Error(`Report fetch failed: ${res.status} ${res.statusText}`);
      }

      const contentType = res.headers.get("content-type") || "";

      if (contentType.includes("text/html")) {
        const htmlText = await res.text();
        const w = window.open("", "_blank");
        if (!w) {
          document.open();
          document.write(htmlText);
          document.close();
          return;
        }
        w.document.open();
        w.document.write(htmlText);
        w.document.close();
        return;
      }
      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);
      const cd = res.headers.get("content-disposition") || "";
      let filename = `job_${job_id}_report.xlsx`;
      const match = /filename="?(.*?)"?($|;)/.exec(cd);
      if (match && match[1]) filename = match[1];

      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(blobUrl), 60_000);
    } catch (err) {
      console.error("Failed to fetch/open report:", err);
      alert(
        "Could not open report. Check server logs and CORS/auth settings."
      );
    }
  };

  const handleStatusChange = async (application_id, newStatus) => {
    try {
      // optimistic update: update UI immediately
      setApplicants((prev) =>
        prev.map((a) =>
          a.application_id === application_id ? { ...a, status: newStatus } : a
        )
      );

      const res = await fetch(
        `http://localhost:5000/applications/${application_id}/status`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ status: newStatus }),
        }
      );

      const data = await res.json();
      if (!data.success) {
        // revert (reload) on failure
        await fetchApplicantsAndJob();
        alert(data.message || "Failed to update status");
        return;
      }

      // success already applied to local state
    } catch (err) {
      console.error("Failed to update status:", err);
      alert("Error updating status. Check console/logs.");
      // revert on error
      await fetchApplicantsAndJob();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 text-slate-100">
        <header className="w-full border-b border-white/5 bg-slate-950/70 backdrop-blur">
          <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-9 w-9 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center text-xl font-bold shadow-lg shadow-blue-500/30">
                AI
              </div>
              <div className="flex flex-col">
                <span className="font-semibold text-sm sm:text-base">
                  Applicants
                </span>
                <span className="text-xs text-slate-400">
                  Loading applicants and job details...
                </span>
              </div>
            </div>
          </div>
        </header>
        <main className="flex-grow flex items-center justify-center px-4">
          <div className="flex flex-col items-center gap-3">
            <span className="h-8 w-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            <p className="text-sm text-slate-300">Loading...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 text-slate-100">
      {/* Header */}
      <header className="w-full border-b border-white/5 bg-slate-950/80 backdrop-blur px-4 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3 max-w-6xl mx-auto w-full">
          <div className="flex items-center gap-2 flex-1">
            <div className="h-9 w-9 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center text-xl font-bold shadow-lg shadow-blue-500/30">
              AI
            </div>
            <div className="flex flex-col">
              <span className="font-semibold text-sm sm:text-base">
                Applicants
              </span>
              <span className="text-xs text-slate-400">
                Review, rank, and manage candidates
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={rankResumes}
              disabled={ranking}
              className={`rounded-xl px-4 py-2 text-xs sm:text-sm font-medium text-white shadow-md transition-transform ${
                ranking
                  ? "bg-slate-600 cursor-not-allowed"
                  : "bg-gradient-to-r from-emerald-500 to-teal-500 hover:scale-[1.02] active:scale-95 shadow-emerald-500/40"
              }`}
            >
              {ranking ? "Ranking..." : "Rank Resumes"}
            </button>

            <button
              onClick={viewReport}
              className="rounded-xl bg-gradient-to-r from-indigo-500 to-blue-600 px-4 py-2 text-xs sm:text-sm font-medium text-white shadow-md shadow-blue-500/40 hover:scale-[1.02] active:scale-95 transition-transform"
            >
              View Report
            </button>

            <button
              onClick={() => navigate(-1)}
              className="rounded-xl border border-white/20 bg-slate-900/80 px-3 py-2 text-xs sm:text-sm font-medium text-slate-100 hover:bg-slate-800 hover:border-blue-400/70 transition-transform hover:scale-[1.02] active:scale-95"
            >
              Back
            </button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 px-4 sm:px-6 py-10">
        <div className="max-w-5xl mx-auto space-y-6">
          {/* Job details */}
          <div className="bg-slate-900/70 border border-white/10 rounded-2xl shadow-2xl shadow-blue-500/20 p-6 sm:p-8 backdrop-blur">
            {jobDetails ? (
              <>
                <h2 className="text-2xl sm:text-3xl font-semibold text-slate-50 mb-2">
                  {jobDetails.job_title}
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 mb-1">
                  Role:{" "}
                  <span className="font-medium text-slate-100">
                    {jobDetails.job_role}
                  </span>
                </p>
                <p className="text-xs sm:text-sm text-slate-400">
                  This job description is used by the AI engine (TF-IDF, cosine
                  similarity, skills) to rank resumes.
                </p>
                <p className="mt-3 text-sm sm:text-base text-slate-200 whitespace-pre-line">
                  {jobDetails.job_description}
                </p>
              </>
            ) : (
              <p className="text-sm text-slate-300 text-center">
                Job details not found.
              </p>
            )}
          </div>

          {/* Applicants list */}
          <div className="bg-slate-900/70 border border-white/10 rounded-2xl shadow-xl shadow-blue-500/10 p-6 sm:p-8 backdrop-blur">
            {sortedApplicants.length > 0 ? (
              <ul className="space-y-5">
                {sortedApplicants.map((applicant) => (
                  <li
                    key={applicant.job_seeker_id}
                    className="p-4 sm:p-5 rounded-xl border border-white/10 bg-slate-950/70 shadow-md shadow-slate-950/60 flex flex-col sm:flex-row justify-between gap-4"
                  >
                    <div className="space-y-2">
                      <h3 className="text-lg sm:text-xl font-semibold text-slate-50">
                        {applicant.name}
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-300">
                        🎓 {applicant.degree || "—"}{" "}
                        {applicant.college
                          ? `from ${applicant.college}`
                          : ""}
                      </p>
                      <p className="text-xs sm:text-sm text-slate-300">
                        📅 Graduation Year:{" "}
                        {applicant.graduation_year || "—"}
                      </p>
                      <a
                        href={`http://localhost:5000/resume/${applicant.job_seeker_id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-xs sm:text-sm text-blue-300 hover:text-blue-200 hover:underline font-medium"
                      >
                        View Resume ({applicant.resume_name || "resume"})
                      </a>
                    </div>

                    <div className="flex flex-col items-start sm:items-end gap-3">
                      {/* Rank */}
                      <div className="text-right">
                        <div className="text-xs text-slate-400 mb-1">
                          Rank
                        </div>
                        <div className="text-2xl font-bold">
                          {applicant.rank && applicant.rank > 0 ? (
                            <span className="text-emerald-300">
                              {applicant.rank}
                            </span>
                          ) : (
                            <span className="text-slate-500 text-base">
                              Not ranked
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Status dropdown */}
                      <div className="mt-1">
                        <label className="block text-xs text-slate-400 mb-1">
                          Status
                        </label>
                        <select
                          value={applicant.status || "applied"}
                          onChange={(e) =>
                            handleStatusChange(
                              applicant.application_id,
                              e.target.value
                            )
                          }
                          className="text-xs sm:text-sm bg-slate-950/80 border border-white/20 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500/70 focus:border-blue-500/70 text-slate-100"
                        >
                          <option value="applied">Applied</option>
                          <option value="rejected">Rejected</option>
                          <option value="selected">Selected</option>
                        </select>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-slate-300 text-center">
                No applicants for this job yet.
              </p>
            )}
          </div>
        </div>
      </main>

      {/* Ranking overlay */}
      {ranking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div className="relative bg-slate-950/90 border border-white/10 rounded-2xl p-6 sm:p-7 shadow-2xl shadow-emerald-500/30 max-w-md w-full mx-4">
            <div className="flex items-center space-x-4">
              {/* spinner */}
              <span className="h-10 w-10 border-2 border-emerald-400/40 border-t-emerald-400 rounded-full animate-spin" />
              <div>
                <h3 className="text-lg font-semibold text-slate-50">
                  Ranking in progress
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 mt-1">
                  {rankingMsg}
                </p>
              </div>
            </div>
            <div className="mt-6 text-right">
              <button
                onClick={() => {}}
                disabled
                className="rounded-xl bg-slate-800/80 text-xs sm:text-sm text-slate-300 px-4 py-2 cursor-wait"
              >
                Please wait…
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShowApplicants;
