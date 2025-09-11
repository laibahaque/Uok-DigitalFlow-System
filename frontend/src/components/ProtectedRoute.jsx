import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/authContext";

const ProtectedRoute = ({ children, requireAuth = true, allowedRoles = null }) => {
  const { user } = useContext(AuthContext);

  if (requireAuth && !user) {
    return <Navigate to="/login" replace />;
  }

  if (!requireAuth && user) {
    if (user.role === "student") return <Navigate to="/dashboard" replace />;
    if (user.role === "uni_admin") return <Navigate to="/university-dashboard" replace />;
    if (user.role === "dept_admin") return <Navigate to="/faculty-dashboard" replace />;
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
