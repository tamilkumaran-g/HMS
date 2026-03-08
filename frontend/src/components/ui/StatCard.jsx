import React, { useEffect, useState } from "react";
import { motion as Motion } from "framer-motion";
import Card from "./Card";
import Badge from "./Badge";

const StatCard = ({ title, value, delta, tone = "primary", icon: Icon, suffix = "" }) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const target = Number(value) || 0;
    let raf = null;
    let start = null;
    const duration = 700;

    const tick = (timestamp) => {
      if (!start) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      setDisplayValue(Math.round(target * progress));
      if (progress < 1) {
        raf = requestAnimationFrame(tick);
      }
    };

    raf = requestAnimationFrame(tick);
    return () => {
      if (raf) cancelAnimationFrame(raf);
    };
  }, [value]);

  return (
    <Card className="soft-shadow" glow={tone}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">{title}</p>
          <Motion.p
            className="mt-3 text-3xl font-bold text-slate-800"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {displayValue}
            {suffix}
          </Motion.p>
        </div>
        <div className="rounded-xl border border-indigo-100 bg-indigo-50 p-2 text-indigo-600">
          {Icon ? <Icon className="h-5 w-5" /> : null}
        </div>
      </div>
      {delta ? (
        <div className="mt-4">
          <Badge tone={tone}>{delta}</Badge>
        </div>
      ) : null}
    </Card>
  );
};

export default StatCard;
