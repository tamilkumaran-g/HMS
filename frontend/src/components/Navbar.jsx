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
        ? "border-white/40 bg-white/20 text-white"
        : "border-white/15 bg-white/5 text-slate-200 hover:bg-white/15"
    }`;

  const handleLogout = () => {
    // Clear all auth data
    localStorage.clear();
    // Redirect to login
    navigate("/login");
  };

  return (
    <nav className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-white/10 bg-white/5 px-6 py-4">
      {/* Left side - Hospital info */}
      <div className="flex flex-col gap-1">
        <div className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-300">
          {hospitalName}
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span className="capitalize">{username}</span>
          <span>•</span>
          <span
            className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
              role === "full_access"
                ? "bg-green-500/20 text-green-300"
                : "bg-blue-500/20 text-blue-300"
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
          className="inline-flex items-center rounded-full border border-red-500/30 bg-red-500/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-red-300 transition hover:bg-red-500/20"
        >
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
