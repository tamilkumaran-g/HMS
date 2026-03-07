import React from "react";

const NegotiationLog = ({ result }) => {
  if (!result) return null;

  const statusBadge = (status) => {
    if (status === "approved") return "approved";
    if (status === "rejected") return "rejected";
    return "pending";
  };

  return (
    <section className="rounded-3xl border border-white/10 bg-white/5 p-6 text-white">
      <h2 className="text-xl font-semibold">AI Negotiation Log</h2>
      <div className="mt-4 space-y-3">
        {(result.negotiation_log || []).map((log, idx) => (
          <div
            key={`${log.agent}-${idx}`}
            className="flex items-center justify-between rounded-2xl bg-white/10 px-4 py-3"
          >
            <div>
              <p className="text-sm font-semibold">{log.agent}</p>
              <p className="text-xs text-slate-300">{log.message}</p>
            </div>
            <span className="rounded-full border border-white/15 px-3 py-1 text-xs capitalize">
              {statusBadge(log.status)}
            </span>
          </div>
        ))}
      </div>
      {result.success && result.bed ? (
        <div className="mt-4 rounded-2xl bg-emerald-500/15 px-4 py-3 text-emerald-100">
          Bed {result.bed.id} allocated at{" "}
          {result.hospital?.name || "selected hospital"}.
        </div>
      ) : null}
    </section>
  );
};

export default NegotiationLog;
