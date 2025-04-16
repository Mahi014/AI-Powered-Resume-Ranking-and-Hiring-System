import React from 'react';

const LandingPage = () => {
  const handleGoogleLogin = () => {
    window.location.href = "http://localhost:5000/auth/google";
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
          <h2 className="text-2xl font-semibold text-center mb-4">
            Smart Resume Ranking
          </h2>
          <p className="text-gray-600 text-center mb-6">
            Automatically analyze and rank job applicant resumes with AI
          </p>

          <button
            onClick={handleGoogleLogin}
            className="block w-full p-3 bg-blue-500 hover:bg-blue-600 text-white text-center rounded-md transition"
          >
            Continue with Google
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

export default LandingPage;
