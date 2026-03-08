import React from "react";

const NegotiationLog = ({ result }) => {
  if (!result) return null;

  const statusBadge = (status) => {
    if (status === "approved") return "approved";
    if (status === "rejected") return "rejected";
    return "pending";
  };

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 text-slate-800">
      <h2 className="text-xl font-semibold">AI Negotiation Log</h2>
      <div className="mt-4 space-y-3">
        {(result.negotiation_log || []).map((log, idx) => (
          <div
            key={`${log.agent}-${idx}`}
            className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3"
          >
            <div>
              <p className="text-sm font-semibold text-slate-700">{log.agent}</p>
              <p className="text-xs text-slate-500">{log.message}</p>
            </div>
            <span className="rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-xs capitalize text-slate-600">
              {statusBadge(log.status)}
            </span>
          </div>
        ))}
      </div>
      {result.success && result.bed ? (
        <div className="mt-4 rounded-2xl bg-green-50 border border-green-200 px-4 py-3 text-green-700">
          Bed {result.bed.id} allocated at{" "}
          {result.hospital?.name || "selected hospital"}.
        </div>
      ) : null}
    </section>
  );
};

export default NegotiationLog;
