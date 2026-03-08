import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion as Motion, AnimatePresence } from "framer-motion";
import {
  BedDouble,
  UserPlus,
  Bell,
  Stethoscope,
  Activity,
  CircleCheck,
  CircleX,
  RefreshCw,
  Building2,
  SprayCan,
  ArrowUpRight,
  Sparkles,
  TrendingUp,
  ChevronRight,
} from "lucide-react";
import "../styles/bento.css";

/* ── Framer Motion variants ─────────────────── */
const stagger = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.08 },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 18, scale: 0.97 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
  },
};

/* ── Animated number counter ────────────────── */
const AnimatedNumber = ({ value, suffix = "" }) => {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const target = Number(value) || 0;
    let raf = null;
    let start = null;
    const duration = 700;

    const tick = (ts) => {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      setDisplay(Math.round(target * progress));
      if (progress < 1) raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => { if (raf) cancelAnimationFrame(raf); };
  }, [value]);

  return (
    <span className="bento-stat-value">
      {display}
      {suffix && <span className="bento-stat-suffix">{suffix}</span>}
    </span>
  );
};

/* ── Single Bento Card wrapper ──────────────── */
const BentoCard = ({ children, className = "", span = "", onClick }) => (
  <Motion.div
    variants={fadeUp}
    whileHover={{ y: -4, scale: 1.008 }}
    whileTap={onClick ? { scale: 0.98 } : {}}
    transition={{ type: "spring", stiffness: 400, damping: 28 }}
    className={`bento-card ${span} ${className}`}
    onClick={onClick}
    style={onClick ? { cursor: "pointer" } : undefined}
  >
    {children}
  </Motion.div>
);

/* ── Card Header helper ─────────────────────── */
const CardHeader = ({ icon: Icon, iconTone = "primary", title, subtitle }) => (
  <div className="bento-card-header">
    <div>
      <h3>{title}</h3>
      {subtitle && <p>{subtitle}</p>}
    </div>
    <div className={`bento-icon bento-icon-${iconTone}`}>
      <Icon size={20} />
    </div>
  </div>
);

/* ── Main BentoDashboard ─────────────────────── */
const BentoDashboard = ({
  totals,
  bedStatusData,
  bedTypeData,
  stats,
  notifications,
}) => {
  const navigate = useNavigate();
  const pendingNotifs = (notifications || []).filter(
    (n) => n.status === "pending",
  ).length;

  return (
    <Motion.div
      className="bento-grid"
      variants={stagger}
      initial="hidden"
      animate="show"
    >
      {/* ─── Row 1: Stat cards ──────────────────── */}

      {/* 1 · Total Beds */}
      <BentoCard>
        <CardHeader
          icon={BedDouble}
          iconTone="primary"
          title="Total Beds"
          subtitle="Network capacity"
        />
        <AnimatedNumber value={totals.total} />
      </BentoCard>

      {/* 2 · Available */}
      <BentoCard>
        <CardHeader
          icon={CircleCheck}
          iconTone="success"
          title="Available"
          subtitle="Ready for allocation"
        />
        <div className="flex items-end gap-3">
          <AnimatedNumber value={totals.available} />
          <span className="bento-mini-badge bento-mini-badge-success mb-1">
            <span
              className="bento-pulse-dot"
              style={{ background: "#16a34a" }}
            />
            Live
          </span>
        </div>
      </BentoCard>

      {/* 3 · Occupied */}
      <BentoCard>
        <CardHeader
          icon={CircleX}
          iconTone="danger"
          title="Occupied"
          subtitle="Currently assigned"
        />
        <AnimatedNumber value={totals.occupied} />
      </BentoCard>

      {/* 4 · Occupancy % */}
      <BentoCard>
        <CardHeader
          icon={Activity}
          iconTone="accent"
          title="Occupancy"
          subtitle="Network utilization"
        />
        <AnimatedNumber value={totals.occupancyPct} suffix="%" />
        <div className="bento-progress-track mt-3">
          <div
            className="bento-progress-fill"
            style={{
              width: `${totals.occupancyPct}%`,
              background:
                totals.occupancyPct > 80
                  ? "#dc2626"
                  : totals.occupancyPct > 60
                    ? "#d97706"
                    : "#16a34a",
            }}
          />
        </div>
      </BentoCard>

      {/* ─── Row 2: Feature cards ───────────────── */}

      {/* 5 · Quick Actions (span 2) */}
      <BentoCard span="bento-span-2">
        <CardHeader
          icon={Sparkles}
          iconTone="primary"
          title="Quick Actions"
          subtitle="Hospital operations"
        />
        <div className="bento-link-list">
          <a
            className="bento-link-item"
            onClick={() => navigate("/admission")}
          >
            <UserPlus size={16} />
            New Admission
            <ArrowUpRight size={14} style={{ marginLeft: "auto", opacity: 0.4 }} />
          </a>
          <a
            className="bento-link-item"
            onClick={() => navigate("/bed-booking")}
          >
            <BedDouble size={16} />
            Bed Booking
            <ArrowUpRight size={14} style={{ marginLeft: "auto", opacity: 0.4 }} />
          </a>
          <a
            className="bento-link-item"
            onClick={() => navigate("/doctors")}
          >
            <Stethoscope size={16} />
            Doctor Management
            <ArrowUpRight size={14} style={{ marginLeft: "auto", opacity: 0.4 }} />
          </a>
          <a
            className="bento-link-item"
            onClick={() => navigate("/notifications")}
          >
            <Bell size={16} />
            Notifications
            {pendingNotifs > 0 && (
              <span className="bento-mini-badge bento-mini-badge-danger ml-auto">
                {pendingNotifs}
              </span>
            )}
          </a>
        </div>
      </BentoCard>

      {/* 6 · Bed Status Breakdown (span 2) */}
      <BentoCard span="bento-span-2">
        <CardHeader
          icon={BedDouble}
          iconTone="neutral"
          title="Bed Availability"
          subtitle="Status breakdown across network"
        />
        <div className="mt-1 space-y-4">
          {/* Donut-style visual */}
          <div className="flex items-center gap-6">
            {/* Mini donut */}
            <div className="relative shrink-0" style={{ width: 90, height: 90 }}>
              <svg viewBox="0 0 36 36" className="h-full w-full" style={{ transform: "rotate(-90deg)" }}>
                {(() => {
                  const total = bedStatusData.available + bedStatusData.occupied + bedStatusData.cleaning || 1;
                  const avail = (bedStatusData.available / total) * 100;
                  const occ = (bedStatusData.occupied / total) * 100;
                  const clean = (bedStatusData.cleaning / total) * 100;
                  return (
                    <>
                      <circle cx="18" cy="18" r="15.9" fill="none" stroke="#dcfce7" strokeWidth="3.2"
                        strokeDasharray={`${avail} ${100 - avail}`} strokeDashoffset="0" />
                      <circle cx="18" cy="18" r="15.9" fill="none" stroke="#fee2e2" strokeWidth="3.2"
                        strokeDasharray={`${occ} ${100 - occ}`} strokeDashoffset={`${-avail}`} />
                      <circle cx="18" cy="18" r="15.9" fill="none" stroke="#fef3c7" strokeWidth="3.2"
                        strokeDasharray={`${clean} ${100 - clean}`} strokeDashoffset={`${-(avail + occ)}`} />
                    </>
                  );
                })()}
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-slate-700">
                {bedStatusData.available + bedStatusData.occupied + bedStatusData.cleaning}
              </span>
            </div>

            {/* Legend */}
            <div className="flex flex-col gap-2.5 text-sm">
              <div className="flex items-center gap-2">
                <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: "#16a34a" }} />
                <span className="text-slate-500">Available</span>
                <span className="ml-auto font-semibold text-slate-800 pl-4">{bedStatusData.available}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: "#dc2626" }} />
                <span className="text-slate-500">Occupied</span>
                <span className="ml-auto font-semibold text-slate-800 pl-4">{bedStatusData.occupied}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: "#d97706" }} />
                <span className="text-slate-500">Cleaning</span>
                <span className="ml-auto font-semibold text-slate-800 pl-4">{bedStatusData.cleaning}</span>
              </div>
            </div>
          </div>
        </div>
      </BentoCard>

      {/* ─── Row 3: Hospitals + extras ──────────── */}

      {/* 7 · Hospitals Overview (span 3) */}
      <BentoCard span="bento-span-3">
        <CardHeader
          icon={Building2}
          iconTone="primary"
          title="Hospital Network"
          subtitle="Per-hospital bed utilization"
        />
        <div className="space-y-0">
          {stats.map((hospital) => (
            <div key={hospital.id} className="bento-hospital-row">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-50 text-slate-500">
                  <Building2 size={14} />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-700">{hospital.name}</p>
                  <p className="text-xs text-slate-400">
                    {hospital.available} of {hospital.total} beds open
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="hidden sm:block" style={{ width: 80 }}>
                  <div className="bento-progress-track">
                    <div
                      className="bento-progress-fill"
                      style={{
                        width: `${hospital.occupancy}%`,
                        background:
                          hospital.occupancy > 80
                            ? "#dc2626"
                            : hospital.occupancy > 60
                              ? "#d97706"
                              : "#16a34a",
                      }}
                    />
                  </div>
                </div>
                <span
                  className={`bento-mini-badge ${hospital.occupancy > 80 ? "bento-mini-badge-danger" : hospital.occupancy > 60 ? "bento-mini-badge-warning" : "bento-mini-badge-success"}`}
                >
                  {hospital.occupancy}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </BentoCard>

      {/* 8 · Notifications & Cleaning (span 1) */}
      <BentoCard>
        <CardHeader
          icon={Bell}
          iconTone="warning"
          title="Alerts"
          subtitle="Pending actions"
        />
        <div className="space-y-3">
          {/* Notifications count */}
          <div
            className="bento-link-item"
            onClick={() => navigate("/notifications")}
          >
            <Bell size={16} className="text-amber-500" />
            <div className="flex-1">
              <p className="text-sm font-medium text-slate-700">Notifications</p>
              <p className="text-xs text-slate-400">
                {pendingNotifs} pending
              </p>
            </div>
            <ChevronRight size={14} className="text-slate-300" />
          </div>

          {/* Cleaning status */}
          <div
            className="bento-link-item"
            onClick={() => navigate("/bed-booking")}
          >
            <SprayCan size={16} className="text-amber-500" />
            <div className="flex-1">
              <p className="text-sm font-medium text-slate-700">Bed Cleaning</p>
              <p className="text-xs text-slate-400">
                {totals.cleaning} in progress
              </p>
            </div>
            <ChevronRight size={14} className="text-slate-300" />
          </div>

          {/* Quick status */}
          <div className="bento-link-item" style={{ cursor: "default" }}>
            <RefreshCw size={16} className="text-indigo-400" />
            <div className="flex-1">
              <p className="text-sm font-medium text-slate-700">System</p>
              <p className="text-xs text-slate-400">All services online</p>
            </div>
            <span
              className="bento-pulse-dot"
              style={{ background: "#16a34a" }}
            />
          </div>
        </div>
      </BentoCard>

      {/* ─── Row 4: Bed Type + Analytics ────────── */}

      {/* 9 · Bed Types (span 2) */}
      <BentoCard span="bento-span-2">
        <CardHeader
          icon={BedDouble}
          iconTone="accent"
          title="Bed Types"
          subtitle="Distribution by category"
        />
        <div className="mt-1 space-y-3">
          {bedTypeData.map((type) => {
            const max = Math.max(...bedTypeData.map((t) => t.count), 1);
            const pct = Math.round((type.count / max) * 100);
            return (
              <div key={type.type}>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className="font-medium text-slate-600">{type.type}</span>
                  <span className="text-xs font-semibold text-slate-800">{type.count}</span>
                </div>
                <div className="bento-progress-track">
                  <Motion.div
                    className="bento-progress-fill"
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
                    style={{
                      background:
                        type.type === "ICU"
                          ? "#4f46e5"
                          : type.type === "Emergency"
                            ? "#dc2626"
                            : "#0ea5e9",
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </BentoCard>

      {/* 10 · Network Analytics summary (span 2) */}
      <BentoCard span="bento-span-2">
        <CardHeader
          icon={TrendingUp}
          iconTone="success"
          title="Network Analytics"
          subtitle="Live performance snapshot"
        />
        <div className="grid grid-cols-2 gap-4 mt-1">
          <div className="rounded-xl bg-slate-50 p-3 text-center">
            <p className="text-2xl font-bold text-slate-800">{stats.length}</p>
            <p className="mt-1 text-xs text-slate-400">Hospitals</p>
          </div>
          <div className="rounded-xl bg-slate-50 p-3 text-center">
            <p className="text-2xl font-bold text-green-600">{totals.available}</p>
            <p className="mt-1 text-xs text-slate-400">Open Beds</p>
          </div>
          <div className="rounded-xl bg-slate-50 p-3 text-center">
            <p className="text-2xl font-bold text-red-500">{totals.occupied}</p>
            <p className="mt-1 text-xs text-slate-400">In Use</p>
          </div>
          <div className="rounded-xl bg-slate-50 p-3 text-center">
            <p className="text-2xl font-bold text-amber-500">{totals.cleaning}</p>
            <p className="mt-1 text-xs text-slate-400">Cleaning</p>
          </div>
        </div>
      </BentoCard>
    </Motion.div>
  );
};

export default BentoDashboard;
