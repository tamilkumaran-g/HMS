import React from "react";

const tones = {
  default: "bg-slate-100 text-slate-600 border-slate-200",
  primary: "bg-indigo-50 text-indigo-700 border-indigo-200",
  success: "bg-green-50 text-green-700 border-green-200",
  warning: "bg-amber-50 text-amber-700 border-amber-200",
  danger: "bg-red-50 text-red-700 border-red-200",
  accent: "bg-sky-50 text-sky-700 border-sky-200",
};

const Badge = ({ children, tone = "default", className = "" }) => {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${tones[tone] || tones.default} ${className}`}
    >
      {children}
    </span>
  );
};

export default Badge;
