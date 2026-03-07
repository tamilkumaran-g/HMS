import React from "react";

const CapacityChart = ({ data }) => {
  if (!data || data.length === 0) {
    return null;
  }

  const maxCapacity = Math.max(...data.map((d) => d.total));

  return (
    <section className="rounded-3xl border border-white/10 bg-white/5 p-6 text-white">
      <div className="mb-6">
        <h2 className="text-xl font-semibold">Total Bed Capacity</h2>
        <p className="text-sm text-slate-300">
          Hospital bed counts and utilization
        </p>
      </div>

      {/* Vertical Grouped Bar Chart */}
      <div className="h-64 flex items-end justify-around gap-6 mb-6">
        {data.map((item, idx) => {
          const totalHeight = (item.total / maxCapacity) * 100;
          const availableHeight = (item.available / maxCapacity) * 100;
          const occupiedHeight = totalHeight - availableHeight;

          return (
            <div key={idx} className="flex-1 flex flex-col items-center gap-2">
              {/* Hospital name */}
              <div className="text-xs font-medium text-slate-400 text-center min-h-8">
                {item.name.split(" ")[0]}
              </div>
              {/* Bars container */}
              <div className="w-full flex gap-2 items-end justify-center flex-1">
                {/* Available bar */}
                <div className="flex flex-col items-center gap-1 flex-1">
                  <span className="text-xs font-semibold text-emerald-400">
                    {item.available}
                  </span>
                  <div
                    className="w-full bg-gradient-to-t from-emerald-500 to-emerald-400 rounded-t-lg transition-all duration-500 hover:scale-105 shadow-lg"
                    style={{ height: `${availableHeight}%`, minHeight: "8px" }}
                  />
                </div>
                {/* Total bar */}
                <div className="flex flex-col items-center gap-1 flex-1">
                  <span className="text-xs font-semibold text-blue-400">
                    {item.total}
                  </span>
                  <div
                    className="w-full bg-gradient-to-t from-blue-500 to-blue-400 rounded-t-lg transition-all duration-500 hover:scale-105 shadow-lg"
                    style={{ height: `${totalHeight}%`, minHeight: "8px" }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 pt-4 border-t border-white/10">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-gradient-to-br from-emerald-500 to-emerald-400"></div>
          <span className="text-sm text-slate-300">Available</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-gradient-to-br from-blue-500 to-blue-400"></div>
          <span className="text-sm text-slate-300">Total Capacity</span>
        </div>
      </div>

      {/* Detailed stats */}
      <div className="grid grid-cols-3 gap-3 mt-4">
        {data.map((item, idx) => (
          <div
            key={idx}
            className="rounded-xl bg-white/5 p-3 border border-white/10"
          >
            <p className="text-xs text-slate-400 truncate">{item.name}</p>
            <div className="mt-2 flex justify-between items-baseline">
              <span className="text-lg font-bold text-emerald-400">
                {item.available}
              </span>
              <span className="text-xs text-slate-500">/</span>
              <span className="text-lg font-bold text-blue-400">
                {item.total}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {((item.available / item.total) * 100).toFixed(0)}% available
            </p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default CapacityChart;
