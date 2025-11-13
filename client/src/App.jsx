import React from 'react';
import LandingPage from "./components/LandingPage";
import Role from "./components/Role";
import JobSeekerForm from "./components/JobSeekerForm";
import EmployerForm from "./components/EmployerForm";
import AddJob from "./components/AddJob";
import FindJob from "./components/FindJob";
import EmployerProfile from "./components/EmployerProfile";
import JobSeekerProfile from "./components/JobSeekerProfile";
import ShowApplicants from "./components/ShowApplicants";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const [status, setStatus] = React.useState({ loading: true });

  React.useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch("http://localhost:5000/auth/status", {
          credentials: "include",
        });
        const data = await response.json();

        if (!data.authenticated) {
          setStatus({ loading: false, authorized: false });
          return;
        }

        const role = data.user.role;

        const hasAccess = allowedRoles.includes(role);
        setStatus({ loading: false, authorized: hasAccess });
      } catch {
        setStatus({ loading: false, authorized: false });
      }
    };

    checkAuth();
  }, [allowedRoles]);

  if (status.loading) return <div>Loading...</div>;
  return status.authorized ? children : <Navigate to="/" replace />;
};

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />

        <Route
          path="/choose-role" element={<Role />}/>

          
        <Route
          path="/job-seeker-form"
          element={
            <ProtectedRoute allowedRoles={["job seeker"]}>
              <JobSeekerForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/employer-form"
          element={
            <ProtectedRoute allowedRoles={["employer"]}>
              <EmployerForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/job-seeker-profile"
          element={
            <ProtectedRoute allowedRoles={["job seeker"]}>
              <JobSeekerProfile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/employer-profile"
          element={
            <ProtectedRoute allowedRoles={["employer"]}>
              <EmployerProfile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/find-job"
          element={
            <ProtectedRoute allowedRoles={["job seeker"]}>
              <FindJob />
            </ProtectedRoute>
          }
        />
        <Route
          path="/add-job"
          element={
            <ProtectedRoute allowedRoles={["employer"]}>
              <AddJob />
            </ProtectedRoute>
          }
        />
        <Route
          path="/job/:job_id/applicants"
          element={
            <ProtectedRoute allowedRoles={["employer"]}>
              <ShowApplicants />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
};

export default App;
