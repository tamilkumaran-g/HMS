import React from "react";
import { motion as Motion } from "framer-motion";
import { PieChart, CircleCheck, CircleX, RefreshCw } from "lucide-react";
import Card from "./ui/Card";

const BedStatusChart = ({ data }) => {
  if (!data || (!data.available && !data.occupied && !data.cleaning)) {
    return null;
  }

  const total = data.available + data.occupied + data.cleaning;
  const availablePct = (data.available / total) * 100;
  const occupiedPct = (data.occupied / total) * 100;
  const cleaningPct = (data.cleaning / total) * 100;

  const availableEnd = availablePct;
  const occupiedEnd = availableEnd + occupiedPct;

  const items = [
    {
      label: "Available",
      value: data.available,
      pct: availablePct,
      tone: "text-green-700",
      border: "border-green-200",
      bg: "bg-green-50",
      icon: CircleCheck,
    },
    {
      label: "Occupied",
      value: data.occupied,
      pct: occupiedPct,
      tone: "text-red-700",
      border: "border-red-200",
      bg: "bg-red-50",
      icon: CircleX,
    },
    {
      label: "Cleaning",
      value: data.cleaning,
      pct: cleaningPct,
      tone: "text-amber-700",
      border: "border-amber-200",
      bg: "bg-amber-50",
      icon: RefreshCw,
    },
  ];

  return (
    <Card className="rounded-3xl p-6" asMotion={false}>
      <div className="mb-4">
        <h2 className="flex items-center gap-2 text-xl font-semibold text-slate-800">
          <PieChart className="w-5 h-5" /> Bed Status Overview
        </h2>
        <p className="text-sm text-slate-500">Real-time status across all hospitals</p>
      </div>

      <div className="mb-6 flex items-center justify-center rounded-2xl border border-slate-100 bg-slate-50 p-4 sm:p-8">
        <Motion.div
          className="relative flex h-40 w-40 items-center justify-center rounded-full shadow-2xl sm:h-56 sm:w-56"
          initial={{ scale: 0.92, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          <Motion.div
            className="absolute inset-0 rounded-full shadow-lg"
            style={{
              background: `conic-gradient(
                from 270deg,
                rgb(16 185 129) 0% ${availableEnd}%,
                rgb(244 63 94) ${availableEnd}% ${occupiedEnd}%,
                rgb(245 158 11) ${occupiedEnd}% 100%
              )`,
            }}
            initial={{ rotate: -15 }}
            animate={{ rotate: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          />
          <div className="absolute inset-10 rounded-full bg-white shadow-inner sm:inset-14" />
          <div className="relative z-10 flex flex-col items-center justify-center">
            <p className="text-3xl font-bold text-slate-800 sm:text-5xl">
              {total}
            </p>
            <p className="text-xs text-slate-400 mt-1">Total Beds</p>
          </div>
        </Motion.div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.label} className={`rounded-2xl border p-4 ${item.bg} ${item.border}`}>
              <p className={`flex items-center gap-2 text-xs uppercase tracking-widest ${item.tone}`}>
                <Icon className="h-4 w-4" /> {item.label}
              </p>
              <p className={`mt-2 text-2xl font-bold ${item.tone}`}>{item.value}</p>
              <p className={`mt-1 text-xs ${item.tone}`}>{item.pct.toFixed(1)}%</p>
            </div>
          );
        })}
      </div>
    </Card>
  );
};

export default BedStatusChart;
