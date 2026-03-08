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
    <section className="rounded-3xl border border-slate-200 bg-white p-6">
      <h2 className="text-xl font-semibold text-slate-800">New Admission</h2>
      <p className="text-sm text-slate-500">Start an AI-guided bed search.</p>
      <form className="mt-4 grid gap-4" onSubmit={handleSubmit}>
        <label className="grid gap-2 text-sm">
          Patient name
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-800"
            required
          />
        </label>
        <label className="grid gap-2 text-sm">
          Condition
          <select
            value={condition}
            onChange={(event) => setCondition(event.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-800"
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
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-800"
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
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-800"
            />
          </label>
          <label className="grid gap-2 text-sm">
            Longitude
            <input
              type="number"
              step="0.001"
              value={lng}
              onChange={(event) => setLng(event.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-800"
            />
          </label>
        </div>
        <button
          type="submit"
          className="rounded-2xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
          disabled={loading}
        >
          {loading ? "Negotiating..." : "Find Bed"}
        </button>
        {error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
            {error}
          </div>
        ) : null}
      </form>
    </section>
  );
};

export default AdmissionForm;
