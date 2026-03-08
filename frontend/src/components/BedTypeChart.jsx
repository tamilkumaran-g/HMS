import React from "react";
import { motion as Motion } from "framer-motion";
import Card from "./ui/Card";

const BedTypeChart = ({ data }) => {
  if (!data || data.length === 0) {
    return null;
  }

  const maxCount = Math.max(...data.map((item) => item.count));
  const colors = [
    "from-indigo-400 to-indigo-600",
    "from-sky-400 to-sky-600",
    "from-amber-400 to-amber-600",
  ];

  return (
    <Card className="rounded-3xl p-6" asMotion={false}>
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-slate-800">Bed Distribution by Type</h2>
        <p className="text-sm text-slate-500">
          Breakdown across ICU, General, Emergency
        </p>
      </div>

      <div className="h-64 flex items-end justify-around gap-8 mb-6 px-4">
        {data.map((item, idx) => {
          const heightPercent = (item.count / maxCount) * 100;
          return (
            <div key={idx} className="flex-1 flex flex-col items-center gap-3">
              <div className="text-2xl font-bold text-indigo-600">
                {item.count}
              </div>
              <div className="w-full flex flex-col items-center justify-end flex-1">
                <Motion.div
                  className={`w-full bg-linear-to-t ${colors[idx % colors.length]} rounded-t-xl transition-all duration-500 hover:scale-105 shadow-lg relative group`}
                  style={{ minHeight: "20px" }}
                  initial={{ height: "0%", opacity: 0.6 }}
                  animate={{ height: `${heightPercent}%`, opacity: 1 }}
                  transition={{ duration: 0.45, delay: idx * 0.08, ease: "easeOut" }}
                >
                  <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-white border border-slate-200 shadow-md px-2 py-1 rounded text-xs whitespace-nowrap text-slate-700">
                    {item.count} beds
                  </div>
                </Motion.div>
              </div>
              <div className="text-center">
                <p className="font-semibold text-sm">{item.type}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid gap-3 pt-4 border-t border-slate-100">
        {data.map((item, idx) => (
          <div key={idx} className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-sm text-slate-700">{item.type}</span>
              <span className="text-sm text-slate-400">
                {item.hospitals.length} hospitals
              </span>
            </div>
            <div className="flex gap-2 flex-wrap">
              {item.hospitals.map((hosp, hidx) => (
                <span
                  key={hidx}
                  className="px-2 py-1 rounded-lg bg-white border border-slate-200 text-xs text-slate-600"
                  title={`${hosp.name}: ${hosp.count} beds`}
                >
                  {hosp.name.split(" ")[0]}: {hosp.count}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default BedTypeChart;
