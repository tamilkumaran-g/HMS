import React, { useState } from "react";

const AdmissionForm = ({ onAdmit, loading, error }) => {
  const [name, setName] = useState("John Doe");
  const [condition, setCondition] = useState("Cardiology");
  const [bedType, setBedType] = useState("ICU");
  const [lat, setLat] = useState(13.08);
  const [lng, setLng] = useState(80.27);

  const handleSubmit = async (event) => {
    event.preventDefault();
    await onAdmit({
      name,
      condition,
      bed_type: bedType,
      location: { lat: Number(lat), lng: Number(lng) },
      urgency: "normal",
    });
  };

  return (
    <section className="rounded-3xl border border-white/10 bg-white/5 p-6 text-white">
      <h2 className="text-xl font-semibold">New Admission</h2>
      <p className="text-sm text-slate-300">Start an AI-guided bed search.</p>
      <form className="mt-4 grid gap-4" onSubmit={handleSubmit}>
        <label className="grid gap-2 text-sm">
          Patient name
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="rounded-xl border border-white/10 bg-slate-950/40 px-3 py-2 text-white"
            required
          />
        </label>
        <label className="grid gap-2 text-sm">
          Condition
          <select
            value={condition}
            onChange={(event) => setCondition(event.target.value)}
            className="rounded-xl border border-white/10 bg-slate-950/40 px-3 py-2 text-white"
          >
            <option>Cardiology</option>
            <option>Neurology</option>
            <option>Orthopedics</option>
            <option>Pediatrics</option>
            <option>General</option>
          </select>
        </label>
        <label className="grid gap-2 text-sm">
          Bed type
          <select
            value={bedType}
            onChange={(event) => setBedType(event.target.value)}
            className="rounded-xl border border-white/10 bg-slate-950/40 px-3 py-2 text-white"
          >
            <option>ICU</option>
            <option>General</option>
            <option>Emergency</option>
          </select>
        </label>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="grid gap-2 text-sm">
            Latitude
            <input
              type="number"
              step="0.001"
              value={lat}
              onChange={(event) => setLat(event.target.value)}
              className="rounded-xl border border-white/10 bg-slate-950/40 px-3 py-2 text-white"
            />
          </label>
          <label className="grid gap-2 text-sm">
            Longitude
            <input
              type="number"
              step="0.001"
              value={lng}
              onChange={(event) => setLng(event.target.value)}
              className="rounded-xl border border-white/10 bg-slate-950/40 px-3 py-2 text-white"
            />
          </label>
        </div>
        <button
          type="submit"
          className="rounded-2xl bg-amber-400 px-4 py-3 text-sm font-semibold text-slate-900 transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-60"
          disabled={loading}
        >
          {loading ? "Negotiating..." : "Find Bed"}
        </button>
        {error ? (
          <div className="rounded-xl border border-rose-400/30 bg-rose-500/10 px-3 py-2 text-xs text-rose-100">
            {error}
          </div>
        ) : null}
      </form>
    </section>
  );
};

export default AdmissionForm;
