import { Routes, Route, Navigate } from "react-router-dom";
import "./index.css";
import Login from "./pages/Auth/Login";
import Register from "./pages/Auth/Register";
import Dashboard from "./pages/StudentDashboard/Dashboard";
import FacultyAdminDashboard from "./pages/DepartmentDashboard/FacultyAdminDashboard";
import UniAdminDashboard from "./pages/UniversityDashboard/UniAdminDashboard";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <Routes>
      {/* Default → Login */}
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* Login/Register → only if NOT logged in */}
      <Route
        path="/login"
        element={
          <ProtectedRoute requireAuth={false}>
            <Login />
          </ProtectedRoute>
        }
      />
      <Route
        path="/register"
        element={
          <ProtectedRoute requireAuth={false}>
            <Register />
          </ProtectedRoute>
        }
      />

      {/* Dashboard → only if logged in */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />


      {/* Faculty Admin Dashboard */}
      <Route
        path="/faculty-dashboard"
        element={
          <ProtectedRoute>
            <FacultyAdminDashboard />
          </ProtectedRoute>
        }
      />

      {/* University Admin Dashboard */}
      <Route
        path="/university-dashboard/*"
        element={
          <ProtectedRoute allowedRoles={["uni_admin"]}>
            <UniAdminDashboard />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;
