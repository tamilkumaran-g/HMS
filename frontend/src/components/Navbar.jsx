import React from "react";
import { NavLink, useNavigate } from "react-router-dom";

const Navbar = () => {
  const navigate = useNavigate();

  // Get user info from localStorage
  const hospitalName =
    localStorage.getItem("hospital_name") || "Unknown Hospital";
  const role = localStorage.getItem("role") || "unknown";
  const username = localStorage.getItem("username") || "Admin";

  const linkClass = ({ isActive }) =>
    `inline-flex items-center rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] transition ${
      isActive
        ? "border-indigo-200 bg-indigo-50 text-indigo-700"
        : "border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100"
    }`;

  const handleLogout = () => {
    // Clear all auth data
    localStorage.clear();
    // Redirect to login
    navigate("/login");
  };

  return (
    <nav className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-slate-200 bg-white px-6 py-4">
      {/* Left side - Hospital info */}
      <div className="flex flex-col gap-1">
        <div className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-700">
          {hospitalName}
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <span className="capitalize">{username}</span>
          <span>•</span>
          <span
            className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
              role === "full_access"
                ? "bg-green-50 text-green-700"
                : "bg-blue-50 text-blue-700"
            }`}
          >
            {role === "full_access" ? "Full Access" : "View Only"}
          </span>
        </div>
      </div>

      {/* Right side - Navigation links */}
      <div className="flex flex-wrap gap-3 items-center">
        <NavLink to="/" className={linkClass}>
          Dashboard
        </NavLink>
        <NavLink to="/bed-booking" className={linkClass}>
          Bed Booking
        </NavLink>
        <NavLink to="/admission" className={linkClass}>
          New Admission
        </NavLink>
        <NavLink to="/doctors" className={linkClass}>
          Doctors
        </NavLink>

        {/* Logout button */}
        <button
          onClick={handleLogout}
          className="inline-flex items-center rounded-full border border-red-200 bg-red-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-red-600 transition hover:bg-red-100"
        >
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
