import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const AddJob = () => {
  const navigate = useNavigate();
  const [job, setJob] = useState({
    job_title: "",
    job_description: "",
    job_role: "",
  });

  const handleChange = (e) => {
    setJob({ ...job, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch("http://localhost:5000/add-job", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(job),
      });

      const data = await res.json();
      if (data.Success === "true") {
        alert("Job added successfully");
        navigate("/employer-profile");
      } else {
        alert("Failed to add job");
      }
    } catch (err) {
      console.error("Error adding job:", err);
      alert("Server error");
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
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Fixed Header */}
      <div className="fixed top-0 left-0 w-full bg-white shadow z-50 flex justify-between items-center px-6 py-3">
        <h1 className="text-xl font-bold text-indigo-700">Employer Dashboard</h1>
        <div className="space-x-4">
          <button
            onClick={() => navigate("/employer-profile")}
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

      {/* Form Content */}
      <div className="pt-20 p-6 max-w-2xl mx-auto bg-white rounded shadow-md">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Add New Job</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700 font-medium">Job Title</label>
            <input
              type="text"
              name="job_title"
              value={job.job_title}
              onChange={handleChange}
              required
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label className="block text-gray-700 font-medium">Job Description</label>
            <textarea
              name="job_description"
              value={job.job_description}
              onChange={handleChange}
              required
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label className="block text-gray-700 font-medium">Job Role</label>
            <input
              type="text"
              name="job_role"
              value={job.job_role}
              onChange={handleChange}
              required
              className="w-full p-2 border rounded"
            />
          </div>
          <button
            type="submit"
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            Post Job
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddJob;
