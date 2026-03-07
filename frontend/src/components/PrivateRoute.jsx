import React from "react";
import { Navigate } from "react-router-dom";

/**
 * PrivateRoute component to protect routes that require authentication.
 * Checks if user has a valid access token in localStorage.
 * If not authenticated, redirects to login page.
 */
const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem("access_token");

  // If no token, redirect to login
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // If authenticated, render the protected component
  return children;
};

export default PrivateRoute;
