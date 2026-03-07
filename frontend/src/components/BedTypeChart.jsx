import React from "react";

const BedTypeChart = ({ data }) => {
  if (!data || data.length === 0) {
    return null;
  }

  const maxCount = Math.max(...data.map((item) => item.count));
  const colors = [
    "from-blue-500 to-cyan-500",
    "from-purple-500 to-pink-500",
    "from-orange-500 to-amber-500",
  ];

  return (
    <section className="rounded-3xl border border-white/10 bg-white/5 p-6 text-white">
      <div className="mb-6">
        <h2 className="text-xl font-semibold">Bed Distribution by Type</h2>
        <p className="text-sm text-slate-300">
          Breakdown across ICU, General, Emergency
        </p>
      </div>

      {/* Vertical Bar Chart */}
      <div className="h-64 flex items-end justify-around gap-8 mb-6 px-4">
        {data.map((item, idx) => {
          const heightPercent = (item.count / maxCount) * 100;
          return (
            <div key={idx} className="flex-1 flex flex-col items-center gap-3">
              {/* Value label */}
              <div className="text-2xl font-bold text-amber-400">
                {item.count}
              </div>
              {/* Bar */}
              <div className="w-full flex flex-col items-center justify-end flex-1">
                <div
                  className={`w-full bg-gradient-to-t ${colors[idx % colors.length]} rounded-t-xl transition-all duration-500 hover:scale-105 shadow-lg relative group`}
                  style={{ height: `${heightPercent}%`, minHeight: "20px" }}
                >
                  {/* Tooltip on hover */}
                  <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 px-2 py-1 rounded text-xs whitespace-nowrap">
                    {item.count} beds
                  </div>
                </div>
              </div>
              {/* Label */}
              <div className="text-center">
                <p className="font-semibold text-sm">{item.type}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Hospital breakdown */}
      <div className="grid gap-3 pt-4 border-t border-white/10">
        {data.map((item, idx) => (
          <div key={idx} className="rounded-2xl bg-white/5 p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-sm">{item.type}</span>
              <span className="text-sm text-slate-400">
                {item.hospitals.length} hospitals
              </span>
            </div>
            <div className="flex gap-2 flex-wrap">
              {item.hospitals.map((hosp, hidx) => (
                <span
                  key={hidx}
                  className="px-2 py-1 rounded-lg bg-white/10 text-xs"
                  title={`${hosp.name}: ${hosp.count} beds`}
                >
                  {hosp.name.split(" ")[0]}: {hosp.count}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default BedTypeChart;
