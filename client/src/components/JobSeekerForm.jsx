import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const JobSeekerForm = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    college: "",
    degree: "",
    graduation_year: "",
    resume: null,
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const checkJobSeekerProfile = async () => {
      try {
        const res = await fetch("http://localhost:5000/check/job-seeker", {
          credentials: "include",
        });
        const data = await res.json();
        if (data.exists) {
          navigate("/job-seeker-profile");
        }
      } catch (err) {
        console.error("Failed to check job seeker profile", err);
      }
    };
    checkJobSeekerProfile();
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type !== "application/pdf") {
      alert("Only PDF files are allowed.");
      return;
    }
    if (file && file.size > 5 * 1024 * 1024) {
      alert("File size should not exceed 5MB.");
      return;
    }
    setFormData((prev) => ({ ...prev, resume: file }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.resume) {
      alert("Please upload your resume (PDF only).");
      return;
    }

    setLoading(true);
    const body = new FormData();
    body.append("name", formData.name);
    body.append("college", formData.college);
    body.append("degree", formData.degree);
    body.append("graduation_year", formData.graduation_year);
    body.append("resume", formData.resume);

    try {
      const res = await fetch("http://localhost:5000/job-seeker-form", {
        method: "POST",
        credentials: "include",
        body,
      });
      const data = await res.json();
      if (data.Success === "true") {
        navigate("/job-seeker-profile");
      } else {
        alert("Failed to submit form.");
      }
    } catch (err) {
      console.error("Submission error:", err);
      alert("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="p-4 bg-white shadow-sm">
        <h1 className="text-xl font-bold text-gray-800">
          AI-Powered Resume Ranking and Hiring System
        </h1>
      </header>

      <main className="flex-grow flex items-center justify-center p-4">
        <form
          onSubmit={handleSubmit}
          className="max-w-md w-full bg-white p-6 rounded-lg shadow-md space-y-4"
        >
          <h2 className="text-2xl font-semibold text-center mb-2">
            Job Seeker Form
          </h2>

          <input
            type="text"
            name="name"
            placeholder="Full Name"
            value={formData.name}
            onChange={handleChange}
            className="w-full p-2 border rounded-md"
            required
          />
          <input
            type="text"
            name="college"
            placeholder="College"
            value={formData.college}
            onChange={handleChange}
            className="w-full p-2 border rounded-md"
            required
          />
          <input
            type="text"
            name="degree"
            placeholder="Degree"
            value={formData.degree}
            onChange={handleChange}
            className="w-full p-2 border rounded-md"
            required
          />
          <input
            type="number"
            name="graduation_year"
            placeholder="Graduation Year"
            value={formData.graduation_year}
            onChange={handleChange}
            className="w-full p-2 border rounded-md"
            required
          />
          <input
            type="file"
            accept="application/pdf"
            onChange={handleFileChange}
            className="w-full"
            required
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
      </main>

      <footer className="p-4 text-center text-sm text-gray-500">
        © {new Date().getFullYear()} AI-Powered Resume Ranking and Hiring System
      </footer>
    </div>
  );
};

export default JobSeekerForm;
