import React, { useState, useEffect } from "react";
import { AlertCircle, Send, CheckCircle, Clock } from "lucide-react";

const NewAdmission = ({ hospitals, loading, onSubmit }) => {
  // Initialize hospitalId from first hospital, or use empty string as fallback
  const defaultHospitalId =
    hospitals && hospitals.length > 0 ? hospitals[0].id : "";

  const [patientName, setPatientName] = useState("");
  const [medicalCondition, setMedicalCondition] = useState("General");
  const [preferredBedType, setPreferredBedType] = useState("ICU");
  const [hospitalId, setHospitalId] = useState(defaultHospitalId);
  const [urgency, setUrgency] = useState("normal");
  const [latitude, setLatitude] = useState("13.08");
  const [longitude, setLongitude] = useState("80.27");
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  // Update hospitalId when hospitals list changes
  useEffect(() => {
    if (hospitals && hospitals.length > 0) {
      setHospitalId(hospitals[0].id);
    }
  }, [hospitals]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitted(true);

    try {
      const response = await onSubmit({
        name: patientName.trim(),
        condition: medicalCondition,
        bed_type: preferredBedType,
        hospital_id: hospitalId,
        urgency: urgency,
        location: {
          lat: parseFloat(latitude),
          lng: parseFloat(longitude),
        },
      });

      setResult(response);

      // Reset form after successful submission
      if (response.success) {
        setTimeout(() => {
          setPatientName("");
          setMedicalCondition("General");
          setPreferredBedType("ICU");
          setHospitalId(hospitals[0]?.id || "");
          setUrgency("normal");
          setLatitude("13.08");
          setLongitude("80.27");
          setSubmitted(false);
        }, 3000);
      }
    } catch (err) {
      setError(err.message || "Failed to submit admission");
      setSubmitted(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            New Patient Admission
          </h1>
          <p className="text-slate-300">
            AI-powered bed allocation with inter-hospital coordination
          </p>
        </div>

        {/* Success Message with AI Scoring */}
        {result?.success && (
          <div className="mb-6 rounded-2xl border border-emerald-400/30 bg-emerald-500/10 p-6 space-y-4">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-6 h-6 text-emerald-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold text-emerald-100">
                  Admission Processed
                </p>
                <p className="text-sm text-emerald-300/90 mt-1">
                  {result.message}
                </p>
                {result.allocation && (
                  <div className="mt-4 space-y-3">
                    {/* Bed Allocation Details */}
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-emerald-400 font-medium">
                          Allocated Bed
                        </p>
                        <p className="text-emerald-200">
                          {result.allocation.bed_id}
                        </p>
                      </div>
                      <div>
                        <p className="text-emerald-400 font-medium">Hospital</p>
                        <p className="text-emerald-200">
                          {result.allocation.hospital_name}
                        </p>
                      </div>
                    </div>

                    {/* Recommended Doctor */}
                    {result.allocation.recommended_doctor ? (
                      <div className="mt-4 p-3 bg-blue-900/20 rounded-lg border border-blue-500/30">
                        <p className="text-blue-300 font-medium text-sm mb-2 flex items-center gap-2">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          Recommended Doctor
                        </p>
                        <div className="space-y-1 text-xs">
                          {result.allocation.recommended_doctor.name && (
                            <div className="flex justify-between">
                              <span className="text-blue-200">Name:</span>
                              <span className="text-blue-100 font-medium">{result.allocation.recommended_doctor.name}</span>
                            </div>
                          )}
                          {result.allocation.recommended_doctor.specialization && (
                            <div className="flex justify-between">
                              <span className="text-blue-200">Specialization:</span>
                              <span className="text-blue-100">{result.allocation.recommended_doctor.specialization}</span>
                            </div>
                          )}
                          {result.allocation.recommended_doctor.experience_years !== undefined && (
                            <div className="flex justify-between">
                              <span className="text-blue-200">Experience:</span>
                              <span className="text-blue-100">{result.allocation.recommended_doctor.experience_years} years</span>
                            </div>
                          )}
                          {result.allocation.recommended_doctor.score !== null && (
                            <div className="flex justify-between">
                              <span className="text-blue-200">Doctor Score:</span>
                              <span className="text-blue-100 font-semibold">{result.allocation.recommended_doctor.score}</span>
                            </div>
                          )}
                          {result.allocation.recommended_doctor.phone && (
                            <div className="flex justify-between">
                              <span className="text-blue-200">Contact:</span>
                              <span className="text-blue-100">{result.allocation.recommended_doctor.phone}</span>
                            </div>
                          )}
                          {result.allocation.recommended_doctor.available_slots !== undefined && (
                            <div className="flex justify-between">
                              <span className="text-blue-200">Available Slots:</span>
                              <span className="text-blue-100">{result.allocation.recommended_doctor.available_slots}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="mt-4 p-3 bg-amber-900/20 rounded-lg border border-amber-500/30">
                        <p className="text-amber-300 font-medium text-sm flex items-center gap-2">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          No doctors currently available in the required department
                        </p>
                      </div>
                    )}

                    {/* AI Scoring Breakdown */}
                    {result.allocation.reasoning && (
                      <div className="mt-4 pt-3 border-t border-emerald-400/20">
                        <p className="text-emerald-300 font-medium text-sm mb-3">
                          AI Allocation Score:{" "}
                          {result.allocation.allocation_score?.toFixed(1) ||
                            "N/A"}
                          /100
                        </p>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          {result.allocation.reasoning.clinical && (
                            <div className="bg-emerald-900/20 rounded px-2 py-1 border border-emerald-500/20">
                              <p className="text-emerald-300 font-medium">
                                Clinical Match
                              </p>
                              <p className="text-emerald-200">
                                {result.allocation.reasoning.clinical.reason}
                              </p>
                              <p className="text-emerald-400 mt-1">
                                {result.allocation.reasoning.clinical.score.toFixed(
                                  0,
                                )}
                                /40 pts
                              </p>
                            </div>
                          )}
                          {result.allocation.reasoning.proximity && (
                            <div className="bg-emerald-900/20 rounded px-2 py-1 border border-emerald-500/20">
                              <p className="text-emerald-300 font-medium">
                                Proximity
                              </p>
                              <p className="text-emerald-200">
                                {result.allocation.reasoning.proximity.reason}
                              </p>
                              <p className="text-emerald-400 mt-1">
                                {result.allocation.reasoning.proximity.score.toFixed(
                                  0,
                                )}
                                /30 pts
                              </p>
                            </div>
                          )}
                          {result.allocation.reasoning.capacity && (
                            <div className="bg-emerald-900/20 rounded px-2 py-1 border border-emerald-500/20">
                              <p className="text-emerald-300 font-medium">
                                Capacity
                              </p>
                              <p className="text-emerald-200">
                                {result.allocation.reasoning.capacity.reason}
                              </p>
                              <p className="text-emerald-400 mt-1">
                                {result.allocation.reasoning.capacity.score.toFixed(
                                  0,
                                )}
                                /20 pts
                              </p>
                            </div>
                          )}
                          {result.allocation.reasoning.cost && (
                            <div className="bg-emerald-900/20 rounded px-2 py-1 border border-emerald-500/20">
                              <p className="text-emerald-300 font-medium">
                                Cost
                              </p>
                              <p className="text-emerald-200">
                                {result.allocation.reasoning.cost.reason}
                              </p>
                              <p className="text-emerald-400 mt-1">
                                {result.allocation.reasoning.cost.score.toFixed(
                                  0,
                                )}
                                /10 pts
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Warning if not preferred hospital */}
                    {!result.allocation.was_preferred_hospital &&
                      result.allocation.note && (
                        <div className="mt-3 p-2 bg-amber-900/20 rounded border border-amber-500/20">
                          <p className="text-amber-200 text-xs">
                            {result.allocation.note}
                          </p>
                        </div>
                      )}

                    {/* Approval Status */}
                    {result.allocation.requires_approval && (
                      <p className="text-amber-300 text-sm flex items-center gap-2">
                        <Clock className="w-4 h-4" />⏳ Awaiting approval from{" "}
                        {result.allocation.hospital_name}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 rounded-2xl border border-rose-400/30 bg-rose-500/10 p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-rose-100">{error}</p>
          </div>
        )}

        {/* Main Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Patient Information Section */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-lg font-semibold text-white mb-4">
              Patient Information
            </h2>

            <div className="space-y-4">
              <label className="block">
                <span className="text-sm font-medium text-slate-200 mb-2 block">
                  Patient Name *
                </span>
                <input
                  type="text"
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  placeholder="Enter full patient name"
                  required
                  className="w-full rounded-lg border border-white/10 bg-slate-950/50 px-4 py-2 text-white placeholder-slate-400 focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
                />
              </label>

              <label className="block">
                <span className="text-sm font-medium text-slate-200 mb-2 block">
                  Medical Condition
                </span>
                <select
                  value={medicalCondition}
                  onChange={(e) => setMedicalCondition(e.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-slate-950/50 px-4 py-2 text-white focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
                >
                  <option>General</option>
                  <option>Cardiology</option>
                  <option>Neurology</option>
                  <option>Orthopedics</option>
                  <option>Pediatrics</option>
                  <option>Emergency</option>
                </select>
              </label>

              <label className="block">
                <span className="text-sm font-medium text-slate-200 mb-2 block">
                  Urgency Level
                </span>
                <select
                  value={urgency}
                  onChange={(e) => setUrgency(e.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-slate-950/50 px-4 py-2 text-white focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
                >
                  <option value="low">Low (Routine)</option>
                  <option value="normal">Normal (Standard)</option>
                  <option value="high">High (Urgent)</option>
                  <option value="critical">Critical (Emergency)</option>
                </select>
              </label>
            </div>
          </div>

          {/* Bed Allocation Preferences */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-lg font-semibold text-white mb-4">
              Bed Allocation Preferences
            </h2>

            <div className="space-y-4">
              <label className="block">
                <span className="text-sm font-medium text-slate-200 mb-2 block">
                  Preferred Hospital *
                </span>
                <select
                  value={hospitalId}
                  onChange={(e) => setHospitalId(e.target.value)}
                  required
                  className="w-full rounded-lg border border-white/10 bg-slate-950/50 px-4 py-2 text-white focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
                >
                  {hospitals.map((h) => (
                    <option key={h.id} value={h.id}>
                      {h.name}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="text-sm font-medium text-slate-200 mb-2 block">
                  Preferred Bed Type
                </span>
                <select
                  value={preferredBedType}
                  onChange={(e) => setPreferredBedType(e.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-slate-950/50 px-4 py-2 text-white focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
                >
                  <option>ICU</option>
                  <option>General</option>
                  <option>Emergency</option>
                </select>
              </label>
            </div>
          </div>

          {/* Location Information */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-lg font-semibold text-white mb-4">
              Patient Location
            </h2>
            <p className="text-sm text-slate-400 mb-4">
              Latitude and Longitude for patient's current location (used for
              distance calculation)
            </p>

            <div className="grid grid-cols-2 gap-4">
              <label className="block">
                <span className="text-sm font-medium text-slate-200 mb-2 block">
                  Latitude
                </span>
                <input
                  type="number"
                  step="0.01"
                  value={latitude}
                  onChange={(e) => setLatitude(e.target.value)}
                  placeholder="13.08"
                  className="w-full rounded-lg border border-white/10 bg-slate-950/50 px-4 py-2 text-white placeholder-slate-400 focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
                />
              </label>

              <label className="block">
                <span className="text-sm font-medium text-slate-200 mb-2 block">
                  Longitude
                </span>
                <input
                  type="number"
                  step="0.01"
                  value={longitude}
                  onChange={(e) => setLongitude(e.target.value)}
                  placeholder="80.27"
                  className="w-full rounded-lg border border-white/10 bg-slate-950/50 px-4 py-2 text-white placeholder-slate-400 focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
                />
              </label>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={
              loading || submitted || !patientName.trim() || !hospitalId
            }
            className="w-full rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-3 text-center font-semibold text-white transition hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <Send className="w-5 h-5" />
            {loading || submitted
              ? "Processing Admission..."
              : "Submit Admission Request"}
          </button>
        </form>

        {/* Info Box */}
        <div className="mt-8 rounded-xl border border-blue-400/20 bg-blue-500/10 p-4">
          <p className="text-sm text-blue-100">
            ℹ️ The AI agent will automatically find the best available bed. If
            beds are not available in your preferred hospital, a request will be
            sent to other hospitals for approval.
          </p>
        </div>
      </div>
    </div>
  );
};

export default NewAdmission;
