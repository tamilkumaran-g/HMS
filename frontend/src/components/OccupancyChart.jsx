import React from "react";

const OccupancyChart = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <section className="rounded-3xl border border-white/10 bg-white/5 p-6 text-white">
        <div className="mb-4">
          <h2 className="text-xl font-semibold">Occupancy Snapshot</h2>
          <p className="text-sm text-slate-300">
            Current percentage of occupied beds
          </p>
        </div>
        <div className="h-64 flex items-center justify-center text-slate-400">
          Loading chart...
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-3xl border border-white/10 bg-white/5 p-6 text-white">
      <div className="mb-4">
        <h2 className="text-xl font-semibold">Occupancy Snapshot</h2>
        <p className="text-sm text-slate-300">
          Current percentage of occupied beds
        </p>
      </div>
      <div className="space-y-4">
        {data.map((item, idx) => (
          <div key={idx} className="flex flex-col gap-2">
            <div className="flex justify-between text-sm">
              <span className="font-medium">{item.name}</span>
              <span className="text-amber-400">{item.occupancy}%</span>
            </div>
            <div className="h-8 w-full bg-slate-700/40 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full transition-all duration-300"
                style={{ width: `${item.occupancy}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default OccupancyChart;
