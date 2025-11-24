import React from "react";

const statusBadgeClass = (status) => {
  switch ((status || "applied").toLowerCase()) {
    case "rejected":
      return "text-red-300 bg-red-500/10 border border-red-500/40";
    case "selected":
      return "text-emerald-300 bg-emerald-500/10 border border-emerald-500/40";
    case "applied":
    default:
      return "text-blue-300 bg-blue-500/10 border border-blue-500/40";
  }
};

const humanStatus = (status) => {
  if (!status) return "Applied";
  const s = status.replace(/_/g, " ");
  return s.charAt(0).toUpperCase() + s.slice(1);
};

const JobCard = ({ job, onApply }) => {
  return (
    <div className="rounded-xl border border-white/10 bg-slate-950/70 p-4 sm:p-5 shadow-md shadow-slate-950/60 flex flex-col gap-3">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div className="space-y-1.5">
          <h3 className="text-lg sm:text-xl font-semibold text-slate-50">
            {job.job_title}
          </h3>
          <p className="text-xs sm:text-sm text-slate-300">
            {job.job_description}
          </p>
          <p className="text-xs sm:text-sm text-slate-400">
            Company:{" "}
            <span className="text-slate-100 font-medium">{job.company}</span>
          </p>
          <span className="inline-flex items-center text-xs sm:text-sm text-slate-200 bg-slate-800/80 px-2.5 py-1 rounded-full">
            Role: <span className="ml-1 font-medium">{job.job_role}</span>
          </span>
        </div>

        <div className="flex flex-col items-start sm:items-end gap-2">
          {job.applied ? (
            <div className="inline-flex items-center gap-2">
              <span
                className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium ${statusBadgeClass(
                  job.status
                )}`}
              >
                {humanStatus(job.status)}
              </span>
              <span className="text-[0.7rem] sm:text-xs text-slate-400">
                Application submitted
              </span>
            </div>
          ) : (
            <button
              onClick={() => onApply(job.job_id)}
              className="rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 px-4 py-2 text-xs sm:text-sm font-medium text-white shadow-md shadow-blue-500/40 hover:scale-[1.02] active:scale-95 transition-transform"
            >
              Apply
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default JobCard;
