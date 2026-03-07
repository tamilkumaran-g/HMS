import React from "react";
import { PieChart } from "lucide-react";

const BedStatusChart = ({ data }) => {
  console.log("BedStatusChart data:", data);

  if (!data || (!data.available && !data.occupied && !data.cleaning)) {
    console.log("BedStatusChart - No data, returning null");
    return null;
  }

  const total = data.available + data.occupied + data.cleaning;
  const availablePct = (data.available / total) * 100;
  const occupiedPct = (data.occupied / total) * 100;
  const cleaningPct = (data.cleaning / total) * 100;

  console.log("Chart percentages:", { availablePct, occupiedPct, cleaningPct });

  // Calculate conic gradient stops
  const availableEnd = availablePct;
  const occupiedEnd = availableEnd + occupiedPct;
  const cleaningEnd = occupiedEnd + cleaningPct;

  return (
    <section className="rounded-3xl border border-white/10 bg-white/5 p-6 text-white">
      <div className="mb-4">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <PieChart className="w-5 h-5" /> Bed Status Overview
        </h2>
        <p className="text-sm text-slate-300">
          Real-time status across all hospitals
        </p>
      </div>

      {/* Donut Chart using CSS conic-gradient */}
      <div className="flex items-center justify-center mb-6 bg-slate-800/50 p-8 rounded-2xl">
        <div className="relative w-56 h-56 rounded-full flex items-center justify-center shadow-2xl">
          {/* Outer donut ring with colors */}
          <div
            className="absolute inset-0 rounded-full transition-all duration-500 shadow-lg"
            style={{
              background: `conic-gradient(
                from 270deg,
                rgb(16 185 129) 0% ${availableEnd}%,
                rgb(244 63 94) ${availableEnd}% ${occupiedEnd}%,
                rgb(245 158 11) ${occupiedEnd}% 100%
              )`,
            }}
          />
          {/* Inner circle to create donut hole */}
          <div className="absolute inset-14 rounded-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 shadow-inner" />
          {/* Center text */}
          <div className="relative z-10 flex flex-col items-center justify-center">
            <p className="text-5xl font-bold bg-gradient-to-br from-white to-slate-300 bg-clip-text text-transparent">
              {total}
            </p>
            <p className="text-xs text-slate-400 mt-1">Total Beds</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-2xl bg-emerald-500/15 p-4 border border-emerald-500/30">
          <p className="text-xs uppercase tracking-[0.1em] text-emerald-200">
            Available
          </p>
          <p className="text-2xl font-bold text-emerald-400 mt-2">
            {data.available}
          </p>
          <p className="text-xs text-emerald-300 mt-1">
            {availablePct.toFixed(1)}%
          </p>
        </div>
        <div className="rounded-2xl bg-rose-500/15 p-4 border border-rose-500/30">
          <p className="text-xs uppercase tracking-[0.1em] text-rose-200">
            Occupied
          </p>
          <p className="text-2xl font-bold text-rose-400 mt-2">
            {data.occupied}
          </p>
          <p className="text-xs text-rose-300 mt-1">
            {occupiedPct.toFixed(1)}%
          </p>
        </div>
        <div className="rounded-2xl bg-amber-500/15 p-4 border border-amber-500/30">
          <p className="text-xs uppercase tracking-[0.1em] text-amber-200">
            Cleaning
          </p>
          <p className="text-2xl font-bold text-amber-400 mt-2">
            {data.cleaning}
          </p>
          <p className="text-xs text-amber-300 mt-1">
            {cleaningPct.toFixed(1)}%
          </p>
        </div>
      </div>
    </section>
  );
};

export default BedStatusChart;
