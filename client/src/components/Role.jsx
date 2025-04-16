import React, { useState,useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Role = () => {
    const navigate = useNavigate();

    useEffect(() => {
        fetch("http://localhost:5000/auth/status", { credentials: "include" })
        .then(res => res.json())
        .then(data => {
            if (data.authenticated && data.user.role === "job seeker") {
              navigate("/job-seeker-form");
            }
            else if(data.authenticated && data.user.role === "employer"){
    
              navigate("/employer-form");
            }
            else if(data.authenticated && data.user.role === "none"){
              //current page
            }
            else{
              navigate("/");
            }

        });
  }, [navigate]);
  
  const [selectedRole, setSelectedRole] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!selectedRole) {
      alert("Please select a role before submitting.");
      return;
    }

    const confirmChoice = window.confirm(
      `Are you sure you want to choose '${selectedRole}'? This action cannot be undone.`
    );

    if (!confirmChoice) return;

    setLoading(true);

    try {
      const response = await fetch("http://localhost:5000/choose-role", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ role: selectedRole }),
      });

      const data = await response.json();

      if (data.Success === "true") {
        if (selectedRole === "job seeker") {
          navigate("/job-seeker-form");
        } else if (selectedRole === "employer") {
          navigate("/employer-form");
        }
      } else {
        alert("Failed to set role. Please try again.");
      }
    } catch (err) {
      console.error("Error choosing role:", err);
      alert("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="p-4 bg-white shadow-sm">
        <h1 className="text-xl font-bold text-gray-800">
          AI-Powered Resume Ranking and Hiring System
        </h1>
      </header>

      {/* Main Content */}
      <main className="flex-grow flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold text-center mb-4">Choose Your Role</h2>
          <p className="text-red-600 text-sm text-center mb-6">
            ⚠️ Please choose your role carefully. This choice is permanent and cannot be changed later.
          </p>

          <select
            disabled={loading}
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="w-full mb-4 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <option value="">-- Select Role --</option>
            <option value="job seeker">Job Seeker</option>
            <option value="employer">Employer</option>
          </select>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className={`block w-full p-3 ${
              loading ? "bg-gray-400" : "bg-blue-500 hover:bg-blue-600"
            } text-white text-center rounded-md transition`}
          >
            {loading ? "Submitting..." : "Confirm Role"}
          </button>
        </div>
      </main>

      {/* Footer */}
      <footer className="p-4 text-center text-sm text-gray-500">
        © {new Date().getFullYear()} AI-Powered Resume Ranking and Hiring System
      </footer>
    </div>
  );
};

export default Role;
