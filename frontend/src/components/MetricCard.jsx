import React from "react";

const MetricCard = ({ name, available, total, occupancy }) => {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/10 p-5 text-white shadow-lg">
      <p className="text-sm uppercase tracking-[0.2em] text-slate-200">
        {name}
      </p>
      <div className="mt-4 flex items-end justify-between">
        <div>
          <p className="text-3xl font-semibold">
            {available}/{total}
          </p>
          <p className="text-xs text-slate-300">Available beds</p>
        </div>
        <div className="rounded-full bg-white/10 px-3 py-1 text-xs">
          {occupancy}% occupied
        </div>
      </div>
    </div>
  );
};

export default MetricCard;
