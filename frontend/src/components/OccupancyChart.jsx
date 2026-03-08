import React from "react";

const OccupancyChart = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <section className="rounded-3xl border border-slate-200 bg-white p-6 text-slate-800">
        <div className="mb-4">
          <h2 className="text-xl font-semibold">Occupancy Snapshot</h2>
          <p className="text-sm text-slate-500">
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
    <section className="rounded-3xl border border-slate-200 bg-white p-6 text-slate-800">
      <div className="mb-4">
        <h2 className="text-xl font-semibold">Occupancy Snapshot</h2>
        <p className="text-sm text-slate-500">
          Current percentage of occupied beds
        </p>
      </div>
      <div className="space-y-4">
        {data.map((item, idx) => (
          <div key={idx} className="flex flex-col gap-2">
            <div className="flex justify-between text-sm">
              <span className="font-medium text-slate-700">{item.name}</span>
              <span className="text-indigo-600 font-semibold">{item.occupancy}%</span>
            </div>
            <div className="h-8 w-full bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-linear-to-r from-indigo-500 to-indigo-600 rounded-full transition-all duration-300"
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
