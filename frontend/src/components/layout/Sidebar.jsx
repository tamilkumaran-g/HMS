import React from "react";
import { NavLink } from "react-router-dom";
import { motion as Motion } from "framer-motion";
import {
  LayoutDashboard,
  BedDouble,
  UserPlus,
  Stethoscope,
  Bell,
  Hospital,
  PanelLeftClose,
  Activity,
} from "lucide-react";
import Badge from "../ui/Badge";

const navItems = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/bed-booking", label: "Bed Booking", icon: BedDouble },
  { to: "/admission", label: "New Admission", icon: UserPlus },
  { to: "/doctors", label: "Doctors", icon: Stethoscope },
  { to: "/notifications", label: "Notifications", icon: Bell },
];

const Sidebar = ({ isOpen, onClose, pendingCount = 0 }) => {
  return (
    <>
      {isOpen ? (
        <button
          className="fixed inset-0 z-40 bg-slate-900/30 md:hidden"
          onClick={onClose}
          aria-label="Close sidebar overlay"
        />
      ) : null}

      <Motion.aside
        initial={{ x: -24, opacity: 0 }}
        animate={{ x: isOpen ? 0 : -320, opacity: isOpen ? 1 : 0 }}
        transition={{ duration: 0.22, ease: "easeOut" }}
        className="fixed left-0 top-0 z-50 flex h-screen w-72 shrink-0 flex-col border-r border-slate-200 bg-white md:sticky md:top-0 md:z-auto md:h-auto md:min-h-screen md:translate-x-0 md:opacity-100"
      >
        {/* Brand header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-5">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-indigo-600 p-2 shadow-md shadow-indigo-200">
              <Hospital className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-800">HMS Digital Twin</p>
              <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">AI Coordination</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg border border-slate-200 bg-slate-50 p-1.5 text-slate-500 md:hidden"
            aria-label="Close sidebar"
          >
            <PanelLeftClose className="h-4 w-4" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 overflow-y-auto px-4 py-4">
          <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">Navigation</p>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={onClose}
                className={({ isActive }) =>
                  `group flex items-center justify-between rounded-xl border px-3 py-2.5 text-sm transition ${
                    isActive
                      ? "border-indigo-100 bg-indigo-50 text-indigo-700 font-medium"
                      : "border-transparent text-slate-600 hover:border-slate-100 hover:bg-slate-50"
                  }`
                }
              >
                <span className="flex items-center gap-2.5">
                  <Icon className="h-4 w-4" />
                  {item.label}
                </span>

                {item.to === "/notifications" && pendingCount > 0 ? (
                  <Badge tone="danger" className="px-2 py-0.5">
                    {pendingCount}
                  </Badge>
                ) : null}
              </NavLink>
            );
          })}
        </nav>

        {/* Sidebar footer */}
        <div className="border-t border-slate-100 px-5 py-4">
          <div className="flex items-center gap-2 rounded-xl bg-indigo-50 px-3 py-2.5">
            <Activity className="h-4 w-4 text-indigo-500" />
            <div>
              <p className="text-xs font-semibold text-indigo-700">System Active</p>
              <p className="text-[10px] text-indigo-500">Real-time sync enabled</p>
            </div>
          </div>
        </div>
      </Motion.aside>
    </>
  );
};

export default Sidebar;
