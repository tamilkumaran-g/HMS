import React from "react";
import MetricCard from "./MetricCard";

const MetricsRow = ({ stats }) => {
  return (
    <section className="grid gap-4 md:grid-cols-3">
      {stats.map((stat) => (
        <MetricCard key={stat.id} {...stat} />
      ))}
    </section>
  );
};

export default MetricsRow;
