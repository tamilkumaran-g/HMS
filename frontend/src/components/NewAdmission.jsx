import React, { useState } from "react";
import { AnimatePresence, motion as Motion } from "framer-motion";
import {
  AlertCircle,
  CheckCircle,
  Clock,
  Hospital,
  MapPin,
  Send,
  Stethoscope,
  Sparkles,
  User,
  Activity,
  BedDouble,
} from "lucide-react";
import Card from "./ui/Card";
import Button from "./ui/Button";
import Badge from "./ui/Badge";

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-slate-800 placeholder-slate-400 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 transition";

const NewAdmission = ({ hospitals, loading, onSubmit }) => {
  const [patientName, setPatientName] = useState("");
  const [medicalCondition, setMedicalCondition] = useState("General");
  const [preferredBedType, setPreferredBedType] = useState("ICU");
  const [hospitalId, setHospitalId] = useState("");
  const [urgency, setUrgency] = useState("normal");
  const [latitude, setLatitude] = useState("13.08");
  const [longitude, setLongitude] = useState("80.27");
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const effectiveHospitalId = hospitalId || hospitals[0]?.id || "";

  const canSubmit =
    patientName.trim().length > 1 &&
    !!medicalCondition &&
    !!urgency &&
    !!effectiveHospitalId &&
    !!preferredBedType;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitted(true);

    try {
      const response = await onSubmit({
        name: patientName.trim(),
        condition: medicalCondition,
        bed_type: preferredBedType,
        hospital_id: effectiveHospitalId,
        urgency,
        location: {
          lat: parseFloat(latitude),
          lng: parseFloat(longitude),
        },
      });

      setResult(response);

      if (response.success) {
        setTimeout(() => {
          setPatientName("");
          setMedicalCondition("General");
          setPreferredBedType("ICU");
          setHospitalId("");
          setUrgency("normal");
          setLatitude("13.08");
          setLongitude("80.27");
          setSubmitted(false);
        }, 1800);
      }
    } catch (err) {
      setError(err.message || "Failed to submit admission");
      setSubmitted(false);
    }
  };

  return (
    <div className="space-y-5">
      <Card className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">
              AI Patient Admission
            </h1>
            <p className="text-sm text-slate-500">
              Fill in the patient details below for intelligent bed allocation
            </p>
          </div>
          <Badge tone="accent" className="px-3 py-1">
            <Sparkles className="mr-1 h-3.5 w-3.5" /> AI Powered
          </Badge>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Patient Details Section */}
          <div className="space-y-4">
            <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-slate-500">
              <User className="h-4 w-4" /> Patient Details
            </h3>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <label className="block sm:col-span-2 lg:col-span-1">
                <span className="mb-2 block text-sm font-medium text-slate-600">
                  Patient Name *
                </span>
                <input
                  type="text"
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  placeholder="Enter full patient name"
                  className={inputClass}
                  required
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-600">
                  <MapPin className="mr-1 inline h-3.5 w-3.5" />
                  Latitude
                </span>
                <input
                  type="number"
                  step="0.01"
                  value={latitude}
                  onChange={(e) => setLatitude(e.target.value)}
                  className={inputClass}
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-600">
                  <MapPin className="mr-1 inline h-3.5 w-3.5" />
                  Longitude
                </span>
                <input
                  type="number"
                  step="0.01"
                  value={longitude}
                  onChange={(e) => setLongitude(e.target.value)}
                  className={inputClass}
                />
              </label>
            </div>
          </div>

          <hr className="border-slate-100" />

          {/* Clinical Info Section */}
          <div className="space-y-4">
            <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-slate-500">
              <Activity className="h-4 w-4" /> Clinical Information
            </h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-600">
                  Medical Condition
                </span>
                <select
                  value={medicalCondition}
                  onChange={(e) => setMedicalCondition(e.target.value)}
                  className={inputClass}
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
                <span className="mb-2 block text-sm font-medium text-slate-600">
                  Urgency Level
                </span>
                <select
                  value={urgency}
                  onChange={(e) => setUrgency(e.target.value)}
                  className={inputClass}
                >
                  <option value="low">Low (Routine)</option>
                  <option value="normal">Normal (Standard)</option>
                  <option value="high">High (Urgent)</option>
                  <option value="critical">Critical (Emergency)</option>
                </select>
              </label>
            </div>
          </div>

          <hr className="border-slate-100" />

          {/* Hospital Preference Section */}
          <div className="space-y-4">
            <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-slate-500">
              <BedDouble className="h-4 w-4" /> Hospital & Bed Preference
            </h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-600">
                  Preferred Hospital *
                </span>
                <select
                  value={effectiveHospitalId}
                  onChange={(e) => setHospitalId(e.target.value)}
                  required
                  className={inputClass}
                >
                  {hospitals.map((h) => (
                    <option key={h.id} value={h.id}>
                      {h.name}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-600">
                  Preferred Bed Type
                </span>
                <select
                  value={preferredBedType}
                  onChange={(e) => setPreferredBedType(e.target.value)}
                  className={inputClass}
                >
                  <option>ICU</option>
                  <option>General</option>
                  <option>Emergency</option>
                </select>
              </label>
            </div>
          </div>

          <div className="flex justify-end border-t border-slate-100 pt-4">
            <Button
              type="submit"
              disabled={loading || submitted || !canSubmit}
              className="min-w-48"
            >
              <span className="flex items-center gap-2">
                <Send className="h-4 w-4" />
                {loading || submitted ? "Processing..." : "Submit Admission"}
              </span>
            </Button>
          </div>
        </form>
      </Card>

      {error ? (
        <div className="glass-card rounded-2xl border border-red-200 p-4 text-sm text-red-700">
          <p className="flex items-center gap-2 font-semibold">
            <AlertCircle className="h-4 w-4" /> Admission Error
          </p>
          <p className="mt-1">{error}</p>
        </div>
      ) : null}

      <AnimatePresence>
        {result?.success ? (
          <Motion.div
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.28 }}
            className="glass-card rounded-2xl border border-green-200 p-5"
          >
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <p className="flex items-center gap-2 text-green-700">
                  <CheckCircle className="h-5 w-5 text-green-600" /> Admission
                  Processed
                </p>
                <p className="mt-1 text-sm text-green-600">{result.message}</p>
              </div>
              <Badge tone="success">AI Allocation</Badge>
            </div>

            {result.allocation ? (
              <div className="grid gap-4 lg:grid-cols-3">
                <Card
                  asMotion={false}
                  className="border border-slate-200 bg-slate-50"
                >
                  <p className="text-xs uppercase tracking-[0.13em] text-slate-400">
                    Hospital Recommendation
                  </p>
                  <p className="mt-2 flex items-center gap-2 text-lg font-semibold text-slate-800">
                    <Hospital className="h-5 w-5 text-indigo-500" />
                    {result.allocation.hospital_name}
                  </p>
                  <p className="mt-2 text-sm text-slate-500">
                    Bed: {result.allocation.bed_id || "Pending approval"}
                  </p>
                  {result.allocation.requires_approval ? (
                    <p className="mt-3 flex items-center gap-2 text-sm text-amber-600">
                      <Clock className="h-4 w-4" /> Awaiting destination
                      hospital approval
                    </p>
                  ) : null}
                </Card>

                <Card
                  asMotion={false}
                  className="border border-slate-200 bg-slate-50"
                >
                  <p className="text-xs uppercase tracking-[0.13em] text-slate-400">
                    AI Score Breakdown
                  </p>
                  <p className="mt-2 flex items-center gap-2 text-lg font-semibold text-indigo-600">
                    <Sparkles className="h-5 w-5" />
                    {result.allocation.allocation_score?.toFixed(1) ||
                      "N/A"}
                    /100
                  </p>
                  <div className="mt-3 space-y-1 text-xs text-slate-500">
                    {result.allocation.reasoning?.clinical ? (
                      <p>
                        Clinical:{" "}
                        {result.allocation.reasoning.clinical.score?.toFixed(0)}{" "}
                        / 40
                      </p>
                    ) : null}
                    {result.allocation.reasoning?.proximity ? (
                      <p>
                        Proximity:{" "}
                        {result.allocation.reasoning.proximity.score?.toFixed(0)}{" "}
                        / 30
                      </p>
                    ) : null}
                    {result.allocation.reasoning?.capacity ? (
                      <p>
                        Capacity:{" "}
                        {result.allocation.reasoning.capacity.score?.toFixed(0)}{" "}
                        / 20
                      </p>
                    ) : null}
                    {result.allocation.reasoning?.cost ? (
                      <p>
                        Cost:{" "}
                        {result.allocation.reasoning.cost.score?.toFixed(0)} / 10
                      </p>
                    ) : null}
                  </div>
                </Card>

                <Card
                  asMotion={false}
                  className="border border-slate-200 bg-slate-50"
                >
                  <p className="text-xs uppercase tracking-[0.13em] text-slate-400">
                    Doctor Recommendation
                  </p>
                  {result.allocation.recommended_doctor ? (
                    <>
                      <p className="mt-2 flex items-center gap-2 text-lg font-semibold text-slate-800">
                        <Stethoscope className="h-5 w-5 text-indigo-500" />
                        {result.allocation.recommended_doctor.name}
                      </p>
                      <p className="mt-1 text-sm text-slate-500">
                        {result.allocation.recommended_doctor.specialization}
                      </p>
                      <p className="mt-2 text-xs text-slate-400">
                        Experience:{" "}
                        {result.allocation.recommended_doctor.experience_years ||
                          "N/A"}{" "}
                        years
                      </p>
                    </>
                  ) : (
                    <p className="mt-2 text-sm text-amber-600">
                      No doctors currently available in required department.
                    </p>
                  )}
                </Card>
              </div>
            ) : null}
          </Motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
};

export default NewAdmission;
