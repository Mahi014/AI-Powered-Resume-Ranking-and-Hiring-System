import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

const ShowApplicants = () => {
  const { job_id } = useParams();
  const navigate = useNavigate();
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchApplicants = async () => {
      try {
        const res = await fetch(`http://localhost:5000/job/${job_id}/applicants`, {
          credentials: "include",
        });
        const data = await res.json();

        if (data.success) {
          setApplicants(data.applicants);
        } else {
          console.error("Failed to fetch applicants");
        }
      } catch (err) {
        console.error("Error fetching applicants:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchApplicants();
  }, [job_id]);

  if (loading) return <div className="text-center mt-10">Loading applicants...</div>;

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Header */}
      <header className="w-full bg-white shadow-md px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-gray-800">Applicants</h1>
        <button
          onClick={() => navigate(-1)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-md transition"
        >
          Back
        </button>
      </header>

      {/* Main content with extra top spacing */}
      <main className="flex-1 px-4 sm:px-6 py-10"> {/* increased top padding */}
        <div className="max-w-3xl mx-auto bg-white p-8 rounded-lg shadow-md">
          {applicants.length > 0 ? (
            <ul className="space-y-5">
              {applicants.map((applicant) => (
                <li
                  key={applicant.job_seeker_id}
                  className="p-5 border rounded-md shadow-sm bg-gray-50"
                >
                  <h3 className="text-lg font-semibold text-gray-800">
                    {applicant.name}
                  </h3>
                  <p className="text-gray-600">
                    🎓 {applicant.degree} from {applicant.college}
                  </p>
                  <p className="text-gray-600">
                    📅 Graduation Year: {applicant.graduation_year}
                  </p>
                  <a
                    href={`http://localhost:5000/resume/${applicant.job_seeker_id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline font-medium"
                  >
                    View Resume ({applicant.resume_name})
                  </a>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-600 text-center">
              No applicants for this job yet.
            </p>
          )}
        </div>
      </main>
    </div>
  );
};

export default ShowApplicants;
