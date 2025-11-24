import React from "react";

const statusBadgeClass = (status) => {
  switch ((status || "applied").toLowerCase()) {
    case "rejected":
      return "text-red-700 bg-red-100";
    case "selected":
      return "text-blue-800 bg-blue-100";
    case "applied":
    default:
      return "text-green-800 bg-green-100";
  }
};

const humanStatus = (status) => {
  if (!status) return "Applied";
  const s = status.replace(/_/g, " ");
  return s.charAt(0).toUpperCase() + s.slice(1);
};

const JobCard = ({ job, onApply }) => {
  return (
    <div className="p-4 border rounded-md shadow-sm bg-gray-50">
      <h3 className="text-lg font-semibold text-gray-800">{job.job_title}</h3>
      <p className="text-gray-600 mb-1">{job.job_description}</p>
      <p className="text-sm text-gray-500 mb-2">Company: {job.company}</p>
      <span className="inline-block text-sm text-gray-500 bg-gray-200 px-2 py-1 rounded mr-4">
        Role: {job.job_role}
      </span>

      {job.applied ? (
        <div className="inline-flex items-center gap-2">
          <span className={`ml-2 inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusBadgeClass(job.status)}`}>
            {humanStatus(job.status)}
          </span>
          <span className="text-gray-500 text-sm"> (Application submitted)</span>
        </div>
      ) : (
        <button
          onClick={() => onApply(job.job_id)}
          className="ml-4 px-4 py-1 text-sm bg-indigo-600 text-white rounded hover:bg-indigo-700"
        >
          Apply
        </button>
      )}
    </div>
  );
};

export default JobCard;
