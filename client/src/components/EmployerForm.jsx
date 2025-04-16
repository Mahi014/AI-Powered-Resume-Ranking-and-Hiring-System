import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const EmployerForm = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    company: "",
    post: "",
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const checkEmployerProfile = async () => {
      try {
        const res = await fetch("http://localhost:5000/check/employer", {
          credentials: "include",
        });
        const data = await res.json();

        if (data.exists) {
          navigate("/employer-profile");
        }
      } catch (err) {
        console.error("Failed to check employer profile", err);
      }
    };

    checkEmployerProfile();
  }, [navigate]);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { name, company, post } = formData;

    if (!name || !company || !post) {
      alert("Please fill in all fields.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("http://localhost:5000/job-employer-form", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ name, company, post }),
      });

      const data = await response.json();

      if (data.Success === "true") {
        navigate("/employer-profile");
      } else {
        alert("Failed to submit employer info. Try again.");
      }
    } catch (err) {
      console.error("Submission error:", err);
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
          <h2 className="text-2xl font-semibold text-center mb-4">Employer Details</h2>
          <p className="text-gray-600 text-center mb-6">
            Please fill in your company details to continue.
          </p>

          <form onSubmit={handleSubmit}>
            <input
              type="text"
              name="name"
              placeholder="Your Name"
              value={formData.name}
              onChange={handleChange}
              className="w-full mb-4 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
            />

            <input
              type="text"
              name="company"
              placeholder="Company Name"
              value={formData.company}
              onChange={handleChange}
              className="w-full mb-4 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
            />

            <input
              type="text"
              name="post"
              placeholder="Your Post/Designation"
              value={formData.post}
              onChange={handleChange}
              className="w-full mb-6 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
            />

            <button
              type="submit"
              disabled={loading}
              className={`block w-full p-3 ${
                loading ? "bg-gray-400" : "bg-blue-500 hover:bg-blue-600"
              } text-white text-center rounded-md transition`}
            >
              {loading ? "Submitting..." : "Submit"}
            </button>
          </form>
        </div>
      </main>

      {/* Footer */}
      <footer className="p-4 text-center text-sm text-gray-500">
        © {new Date().getFullYear()} AI-Powered Resume Ranking and Hiring System
      </footer>
    </div>
  );
};

export default EmployerForm;
