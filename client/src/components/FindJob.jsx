import React, { useEffect, useState } from "react";
import JobCard from "./JobCard";
import { useNavigate } from "react-router-dom";

const FindJob = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchJobs = async () => {
    try {
      const res = await fetch("http://localhost:5000/find-job", {
        credentials: "include",
      });
      const allJobs = await res.json();

      const resApplied = await fetch("http://localhost:5000/job-seeker-profile", {
        credentials: "include",
      });
      const profile = await resApplied.json();
      const appliedJobIds = profile.data.jobs.map((j) => j.job_id);

      const jobsWithStatus = allJobs.map((job) => ({
        ...job,
        applied: appliedJobIds.includes(job.job_id),
      }));

      setJobs(jobsWithStatus);
    } catch (err) {
      console.error("Failed to load jobs:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async (job_id) => {
    try {
      const res = await fetch("http://localhost:5000/job-apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ job_id }),
      });

      const data = await res.json();
      if (data.success) {
        fetchJobs(); 
      } else {
        alert(data.message);
      }
    } catch (err) {
      console.error("Apply failed:", err.message);
    }
  };
  const handleLogout = async () => {
    const confirmLogout = window.confirm("Are you sure you want to log out?");
    if (confirmLogout) {
      try {
        const res = await fetch("http://localhost:5000/logout", {
          method: "GET",
          credentials: "include",
        });
        const data = await res.json();
        if (data.success) {
          navigate("/");
        }
      } catch (err) {
        console.error("Logout failed: ", err.message);
      }
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  if (loading) return <div className="text-center mt-10">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Fixed Header */}
      <div className="fixed top-0 left-0 w-full bg-white shadow z-50 flex justify-between items-center px-6 py-3">
        <h1 className="text-xl font-bold text-indigo-700">Job Portal</h1>
        <div className="space-x-4">
          <button
            onClick={() => navigate("/job-seeker-profile")}
            className="px-4 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            My Profile
          </button>
          <button
            onClick={handleLogout}
            className="px-4 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="pt-20 p-6 max-w-4xl mx-auto space-y-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Available Jobs</h2>
        {jobs.length > 0 ? (
          jobs.map((job) => (
            <JobCard key={job.job_id} job={job} onApply={handleApply} />
          ))
        ) : (
          <div className="text-gray-600 italic">No jobs available.</div>
        )}
      </div>
    </div>
  );
};

export default FindJob;
