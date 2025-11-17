import React, { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";

const ShowApplicants = () => {
  const { job_id } = useParams();
  const navigate = useNavigate();
  const [applicants, setApplicants] = useState([]);
  const [jobDetails, setJobDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [ranking, setRanking] = useState(false);
  const [rankingMsg, setRankingMsg] = useState("Ranking resumes — this may take a moment...");

  useEffect(() => {
    fetchApplicantsAndJob();
  }, [job_id]);

  const fetchApplicantsAndJob = async () => {
    setLoading(true);
    try {
      const [appRes, jobRes] = await Promise.all([
        fetch(`http://localhost:5000/job/${job_id}/applicants`, { credentials: "include" }),
        fetch(`http://localhost:5000/job/${job_id}`, { credentials: "include" }),
      ]);

      const appData = await appRes.json();
      const jobData = await jobRes.json();

      if (appData.success && Array.isArray(appData.applicants)) {
        setApplicants(appData.applicants);
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
      const res = await fetch(`http://localhost:8000/api/jobs/${job_id}/rank`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      if (data && data.success) {
        const topCount = data.ranked_count ?? 0;
        const topPreview = Array.isArray(data.top) ? data.top.slice(0, 3) : [];
        const previewStr = topPreview.map(t => `${t.job_seeker_id}(rank:${t.rank ?? "-"})`).join(", ");
        // Refresh applicants to pick up updated ja.rank
        await fetchApplicantsAndJob();
        alert(`Ranking finished. Ranked ${topCount} applicants. Top: ${previewStr || "N/A"}`);
      } else {
        console.error("Ranking API returned failure:", data);
        alert("Ranking failed. See console for details.");
      }
    } catch (err) {
      console.error("Error calling ranking API:", err);
      alert("Error invoking ranking service. Check server logs and CORS settings.");
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
      alert("Could not open report. Check server logs and CORS/auth settings.");
    }
  };

  if (loading) return <div className="text-center mt-10">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Header */}
      <header className="w-full bg-white shadow-md px-6 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <h1 className="text-xl font-bold text-gray-800">Applicants</h1>
          <button
            onClick={() => navigate(-1)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition"
          >
            Back
          </button>
        </div>

        <div className="flex items-center">
          <button
            onClick={rankResumes}
            disabled={ranking}
            className={`mr-3 ${ranking ? "bg-gray-400 hover:bg-gray-400" : "bg-green-600 hover:bg-green-700"} text-white px-4 py-2 rounded-md transition`}
          >
            {ranking ? "Ranking..." : "Rank Resumes"}
          </button>

          <button
            onClick={viewReport}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md transition"
          >
            View Report
          </button>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 px-4 sm:px-6 py-10">
        <div className="max-w-3xl mx-auto bg-white p-8 rounded-lg shadow-md space-y-6">
          {/* Job details */}
          {jobDetails ? (
            <div className="border-b pb-4">
              <h2 className="text-2xl font-bold text-gray-800">{jobDetails.job_title}</h2>
              <p className="text-gray-700 mt-2">
                <strong>Role:</strong> {jobDetails.job_role}
              </p>
              <p className="text-gray-600 mt-1">{jobDetails.job_description}</p>
            </div>
          ) : (
            <p className="text-gray-600 text-center">Job details not found.</p>
          )}

          {/* Applicants list */}
          {sortedApplicants.length > 0 ? (
            <ul className="space-y-5">
              {sortedApplicants.map((applicant) => (
                <li
                  key={applicant.job_seeker_id}
                  className="p-5 border rounded-md shadow-sm bg-gray-50 flex justify-between items-start"
                >
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">{applicant.name}</h3>
                    <p className="text-gray-600">
                      🎓 {applicant.degree || "—"} {applicant.college ? `from ${applicant.college}` : ""}
                    </p>
                    <p className="text-gray-600">📅 Graduation Year: {applicant.graduation_year || "—"}</p>
                    <a
                      href={`http://localhost:5000/resume/${applicant.job_seeker_id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline font-medium"
                    >
                      View Resume ({applicant.resume_name || "resume"})
                    </a>
                  </div>

                  <div className="text-right">
                    <div className="text-sm text-gray-500">Rank</div>
                    <div className="mt-1 text-2xl font-bold text-gray-800">
                      {applicant.rank && applicant.rank > 0 ? applicant.rank : <span className="text-gray-400">Not ranked</span>}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-600 text-center">No applicants for this job yet.</p>
          )}
        </div>
      </main>

      {/* Ranking overlay */}
      {ranking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black opacity-40"></div>
          <div className="relative bg-white rounded-lg p-6 shadow-xl max-w-md w-full mx-4">
            <div className="flex items-center space-x-4">
              {/* spinner */}
              <svg className="animate-spin h-10 w-10 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
              </svg>

              <div>
                <h3 className="text-lg font-semibold text-gray-800">Ranking in progress</h3>
                <p className="text-sm text-gray-600 mt-1">{rankingMsg}</p>
              </div>
            </div>
            <div className="mt-6 text-right">
              <button
                onClick={() => {}}
                disabled
                className="bg-gray-300 text-gray-700 px-3 py-1 rounded"
              >
                Please wait
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShowApplicants;
