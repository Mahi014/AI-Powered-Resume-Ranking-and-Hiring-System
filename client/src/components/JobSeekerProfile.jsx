import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const JobSeekerProfile = () => {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const navigate = useNavigate();

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
    let isMounted = true;

    const fetchProfile = async () => {
      try {
        const res = await fetch("http://localhost:5000/job-seeker-profile", {
          credentials: "include",
        });
        const data = await res.json();

        if (!data.exists && isMounted) {
          navigate("/job-seeker-form");
        } else if (isMounted) {
          setProfile(data.data);
        }
      } catch (err) {
        console.error("Failed to load profile:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchProfile();

    return () => {
      isMounted = false;
    };
  }, [navigate]);

  if (loading) return <div className="text-center mt-10">Loading...</div>;
  if (!profile) return <div className="text-center mt-10 text-red-500">Failed to load profile.</div>;

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Fixed Header */}
      <header className="fixed top-0 left-0 w-full bg-white shadow-md z-50 px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-gray-800">Job Seeker Dashboard</h1>
        <div className="flex gap-3">
          <button
            onClick={() => navigate("/find-job")}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition"
          >
            🔍 Find Jobs
          </button>
          <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md transition"
          >
            🚪 Logout
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-28 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto bg-white p-6 rounded-lg shadow-md">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">
            Job Seeker Profile
          </h1>

          <p className="text-gray-700 mb-2"><strong>Name:</strong> {profile.name}</p>
          <p className="text-gray-700 mb-2"><strong>College:</strong> {profile.college}</p>
          <p className="text-gray-700 mb-2"><strong>Degree:</strong> {profile.degree}</p>
          <p className="text-gray-700 mb-2"><strong>Graduation Year:</strong> {profile.graduation_year}</p>
          <p className="text-gray-700 mb-2"><strong>Resume:</strong> {profile.resume_name}</p>

          <div className="mb-6">
            <a
              href="http://localhost:5000/job-seeker-resume"
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-600 font-medium hover:underline"
            >
              📄 View Resume
            </a>
          </div>

          <h2 className="text-xl font-semibold text-blue-600 mb-4">
            Jobs You've Applied To
          </h2>

          {Array.isArray(profile.jobs) && profile.jobs.length > 0 ? (
            <ul className="space-y-4">
              {profile.jobs.map((job) => (
                <li
                  key={job.application_id}
                  className="p-4 border rounded-md shadow-sm bg-gray-50"
                >
                  <h3 className="text-lg font-semibold text-gray-800">{job.job_title}</h3>
                  <p className="text-gray-600 mb-1">{job.job_description}</p>
                  <span className="inline-block text-sm text-gray-500 bg-gray-200 px-2 py-1 rounded">
                    Role: {job.job_role}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-600 italic">You haven't applied for any jobs yet.</p>
          )}
        </div>
      </main>
    </div>
  );
};

export default JobSeekerProfile;
