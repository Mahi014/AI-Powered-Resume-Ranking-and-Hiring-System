import React from "react";

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
        <span className="text-green-600 font-semibold">✅ Already Applied</span>
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
