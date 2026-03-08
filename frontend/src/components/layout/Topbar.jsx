import React from "react";
import { Bell, LogOut, Menu, Hospital, User } from "lucide-react";
import Badge from "../ui/Badge";
import Button from "../ui/Button";

const Topbar = ({ onToggleSidebar, pendingCount = 0, onLogout }) => {
  const hospitalName = localStorage.getItem("hospital_name") || "Unknown Hospital";
  const username = localStorage.getItem("username") || "Admin";
  const role = localStorage.getItem("role") || "view_only";

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/80 px-4 py-3 backdrop-blur-md sm:px-6">
      {/* Mobile branding bar */}
      <div className="mb-2 flex items-center gap-3 md:hidden">
        <button
          onClick={onToggleSidebar}
          className="rounded-lg border border-slate-200 bg-white p-2 text-slate-600 shadow-sm"
          aria-label="Open sidebar"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-2">
          <div className="rounded-lg bg-indigo-600 p-1.5 shadow-sm shadow-indigo-200">
            <Hospital className="h-4 w-4 text-white" />
          </div>
          <span className="text-sm font-bold text-slate-800">HMS Digital Twin</span>
        </div>

        <div className="ml-auto flex items-center gap-2">
          {pendingCount > 0 ? (
            <div className="relative">
              <Bell className="h-5 w-5 text-slate-500" />
              <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white">
                {pendingCount}
              </span>
            </div>
          ) : null}
          <button
            onClick={onLogout}
            className="rounded-lg border border-slate-200 bg-white p-2 text-slate-500"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Mobile hospital info */}
      <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-3 py-2 md:hidden">
        <div>
          <p className="text-[10px] uppercase tracking-[0.15em] text-slate-400">Current Facility</p>
          <p className="text-sm font-semibold text-slate-700">{hospitalName}</p>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <User className="h-3.5 w-3.5" />
          {username}
        </div>
      </div>

      {/* Desktop topbar */}
      <div className="hidden items-center justify-between gap-4 md:flex">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Current Facility</p>
          <p className="text-base font-semibold text-slate-800">{hospitalName}</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
            <Bell className="h-4 w-4 text-indigo-500" />
            <span className="text-xs text-slate-600">Notifications</span>
            <Badge tone={pendingCount > 0 ? "danger" : "accent"}>{pendingCount}</Badge>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-right">
            <p className="text-xs font-semibold text-slate-800">{username}</p>
            <p className="text-[11px] uppercase tracking-[0.12em] text-slate-400">
              {role === "full_access" ? "Full Access" : "View Only"}
            </p>
          </div>

          <Button variant="secondary" className="px-3 py-2" onClick={onLogout}>
            <span className="flex items-center gap-2">
              <LogOut className="h-4 w-4" /> Logout
            </span>
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Topbar;
