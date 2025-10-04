import React, { useContext } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { AuthContext } from "../context/authContext";

const ProtectedRoute = ({ children, requireAuth = true, allowedRoles = null }) => {
  const { user } = useContext(AuthContext);
  const location = useLocation();

  // ❌ If route requires auth but user is not logged in → go to login
  if (requireAuth && !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // ❌ If user already logged in and tries to visit /login or /register → redirect to dashboard
  if (!requireAuth && user) {
    if (user.role === "student") return <Navigate to="/dashboard" replace />;
    if (user.role === "faculty-admin") return <Navigate to="/faculty-dashboard" replace />;
    if (user.role === "university-admin") return <Navigate to="/university-dashboard" replace />;
    return <Navigate to="/login" replace />;
  }

  // 🚫 If route has role restriction but user role not allowed
  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
