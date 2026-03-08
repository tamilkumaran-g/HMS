import React from "react";

const MetricCard = ({ name, available, total, occupancy }) => {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 text-slate-800 shadow-sm">
      <p className="text-sm uppercase tracking-[0.2em] text-slate-500">
        {name}
      </p>
      <div className="mt-4 flex items-end justify-between">
        <div>
          <p className="text-3xl font-semibold">
            {available}/{total}
          </p>
          <p className="text-xs text-slate-500">Available beds</p>
        </div>
        <div className="rounded-full bg-indigo-50 px-3 py-1 text-xs text-indigo-600">
          {occupancy}% occupied
        </div>
      </div>
    </div>
  );
};

export default MetricCard;
