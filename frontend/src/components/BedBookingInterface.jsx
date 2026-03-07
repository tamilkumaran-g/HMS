import React, { useState } from "react";
import { BedDouble, AlertCircle, Lock, Eye } from "lucide-react";
import BedGrid from "./BedGrid";

const BedBookingInterface = ({ hospitals, beds, onBookBed, loading }) => {
  // Get role and hospital from localStorage
  const role = localStorage.getItem("role") || "view_only";
  const storedHospitalId = localStorage.getItem("hospital_id");
  const ownHospitalId = storedHospitalId || hospitals[0]?.id;
  const isViewOnly = role === "view_only";
  // Debug logging
  React.useEffect(() => {
    console.log("BedBookingInterface Debug:");
    console.log("  Stored Hospital ID:", storedHospitalId);
    console.log("  Own Hospital ID:", ownHospitalId);
    console.log(
      "  All Hospitals:",
      hospitals.map((h) => ({ id: h.id, name: h.name })),
    );
    console.log("  Role:", role);
  }, [storedHospitalId, ownHospitalId, hospitals, role]);
  const [selectedWardType, setSelectedWardType] = useState("ICU");
  const [selectedBedId, setSelectedBedId] = useState(null);
  const [selectedBedData, setSelectedBedData] = useState(null);
  const [patientName, setPatientName] = useState("");
  const [patientCondition, setPatientCondition] = useState("General");

  const wardTypes = ["ICU", "General", "Emergency"];

  // Separate hospitals
  const ownHospital = hospitals.find((h) => h.id === ownHospitalId);
  const otherHospitals = hospitals.filter((h) => h.id !== ownHospitalId);

  // Filter beds for own hospital and selected ward type
  const ownHospitalBeds = beds.filter(
    (bed) =>
      bed.hospital_id === ownHospitalId && bed.bed_type === selectedWardType,
  );

  // Calculate vacancy stats for all hospitals
  const getHospitalStats = (hospitalId) => {
    const hospitalBeds = beds.filter((b) => b.hospital_id === hospitalId);
    return {
      total: hospitalBeds.length,
      available: hospitalBeds.filter((b) => b.status === "available").length,
      occupied: hospitalBeds.filter((b) => b.status === "occupied").length,
      cleaning: hospitalBeds.filter((b) => b.status === "cleaning").length,
    };
  };

  const handleSelectBed = (bedId, bedData) => {
    if (selectedBedId === bedId) {
      setSelectedBedId(null);
      setSelectedBedData(null);
    } else {
      setSelectedBedId(bedId);
      setSelectedBedData(bedData);
    }
  };

  const handleBookBed = async () => {
    if (!selectedBedData || isViewOnly || !patientName.trim()) return;
    await onBookBed({
      bedId: selectedBedId,
      hospital: ownHospital,
      bedType: selectedWardType,
      bed: selectedBedData,
      patientName: patientName.trim(),
      patientCondition: patientCondition,
    });
    setSelectedBedId(null);
    setSelectedBedData(null);
    setPatientName("");
    setPatientCondition("General");
  };

  return (
    <section className="rounded-3xl border border-white/10 bg-white/5 p-6 text-white space-y-6">
      <div>
        <h2 className="text-2xl font-semibold flex items-center gap-2">
          <BedDouble className="w-6 h-6" /> Hospital Bed Management
        </h2>
        <p className="text-sm text-slate-300 mt-1">
          Manage beds across your hospital network
        </p>
      </div>

      {/* ========== YOUR HOSPITAL - BOOKABLE SECTION ========== */}
      {ownHospital && (
        <div className="rounded-2xl border-2 border-blue-400/50 bg-blue-500/10 p-6">
          <div className="flex items-center gap-2 mb-4">
            <BedDouble className="w-5 h-5 text-blue-400" />
            <h3 className="text-xl font-semibold text-blue-200">
              {ownHospital.name}
            </h3>
            <span className="ml-auto text-xs font-semibold bg-blue-500/30 px-3 py-1 rounded-full">
              YOUR HOSPITAL
            </span>
          </div>

          {/* View Only Warning */}
          {isViewOnly && (
            <div className="mb-4 rounded-xl border border-orange-400/30 bg-orange-500/15 p-3 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-orange-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-orange-200">
                  View-Only Role
                </p>
                <p className="text-xs text-orange-300/80">
                  You can view bed availability but cannot make bookings.
                </p>
              </div>
            </div>
          )}

          {/* Ward Type Selection */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Ward Type</label>
            <div className="grid grid-cols-3 gap-2">
              {wardTypes.map((ward) => (
                <button
                  key={ward}
                  onClick={() => setSelectedWardType(ward)}
                  className={`rounded-lg px-3 py-2 text-sm font-medium transition-all border ${
                    selectedWardType === ward
                      ? "bg-blue-500/30 border-blue-400 text-blue-100"
                      : "bg-white/10 border-white/20 hover:bg-white/15"
                  }`}
                >
                  {ward}
                </button>
              ))}
            </div>
          </div>

          {/* Bed Grid */}
          <div className="bg-slate-950/50 rounded-xl p-3 mb-4">
            <BedGrid
              beds={ownHospitalBeds}
              wardType={selectedWardType}
              selectedBedId={selectedBedId}
              onSelectBed={handleSelectBed}
              hospitalName={ownHospital.name}
            />
          </div>

          {/* Selected Bed Info & Patient Details */}
          {selectedBedData && (
            <div className="rounded-xl border border-amber-400/30 bg-amber-500/15 p-4 space-y-4">
              {/* Bed Info */}
              <div className="space-y-2">
                <p className="text-xs text-slate-300">Selected Bed:</p>
                <div className="flex items-center gap-2">
                  <BedDouble className="w-6 h-6 text-amber-400" />
                  <div>
                    <p className="font-semibold">{selectedBedId}</p>
                    <p className="text-xs text-slate-400">{selectedWardType}</p>
                  </div>
                </div>
              </div>

              {/* Patient Details Form */}
              <div className="border-t border-amber-400/20 pt-3 space-y-3">
                <p className="text-xs font-semibold text-amber-200">
                  Patient Information
                </p>

                <label className="grid gap-2 text-sm">
                  <span className="text-slate-200">Patient Name *</span>
                  <input
                    type="text"
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                    placeholder="Enter patient full name"
                    className="rounded-lg border border-amber-400/30 bg-slate-900/50 px-3 py-2 text-white placeholder-slate-400 focus:outline-none focus:border-amber-400"
                    required
                  />
                </label>

                <label className="grid gap-2 text-sm">
                  <span className="text-slate-200">Medical Condition</span>
                  <select
                    value={patientCondition}
                    onChange={(e) => setPatientCondition(e.target.value)}
                    className="rounded-lg border border-amber-400/30 bg-slate-900/50 px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                  >
                    <option>General</option>
                    <option>Cardiology</option>
                    <option>Neurology</option>
                    <option>Orthopedics</option>
                    <option>Pediatrics</option>
                  </select>
                </label>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => {
                    setSelectedBedId(null);
                    setSelectedBedData(null);
                    setPatientName("");
                    setPatientCondition("General");
                  }}
                  className="flex-1 rounded-lg bg-white/10 px-3 py-2 text-sm font-semibold text-white transition hover:bg-white/15 border border-white/20"
                >
                  Cancel
                </button>
                <button
                  onClick={handleBookBed}
                  disabled={loading || isViewOnly || !patientName.trim()}
                  title={
                    !patientName.trim()
                      ? "Enter patient name to book"
                      : isViewOnly
                        ? "Booking is restricted for your role"
                        : "Confirm booking"
                  }
                  className={`flex-1 rounded-lg px-3 py-2 text-sm font-semibold transition ${
                    !patientName.trim() || isViewOnly
                      ? "bg-gray-500/30 text-gray-400 cursor-not-allowed"
                      : "bg-gradient-to-r from-emerald-400 to-emerald-500 text-slate-900 hover:from-emerald-300 hover:to-emerald-400"
                  } disabled:opacity-60 disabled:cursor-not-allowed`}
                >
                  {loading ? "Booking..." : "Confirm Booking"}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========== OTHER HOSPITALS - VACANCY VIEW ========== */}
      {otherHospitals.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold flex items-center gap-2 text-slate-200">
            <Eye className="w-5 h-5" /> Other Hospitals - Vacancy Info
          </h3>
          {otherHospitals.map((hospital) => {
            const stats = getHospitalStats(hospital.id);
            const occupancyRate = (
              ((stats.total - stats.available) / stats.total) *
              100
            ).toFixed(1);
            return (
              <div
                key={hospital.id}
                className="rounded-xl border border-slate-400/20 bg-slate-950/30 p-4 hover:bg-slate-950/50 transition"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Lock className="w-4 h-4 text-slate-400" />
                    <h4 className="font-semibold text-slate-100">
                      {hospital.name}
                    </h4>
                  </div>
                  <span className="text-xs font-semibold bg-slate-700/50 px-2 py-1 rounded">
                    Read-Only
                  </span>
                </div>

                <div className="grid grid-cols-4 gap-2 text-sm">
                  <div className="rounded-lg bg-slate-900/50 p-2">
                    <p className="text-xs text-slate-400">Available</p>
                    <p className="text-lg font-bold text-emerald-400">
                      {stats.available}
                    </p>
                  </div>
                  <div className="rounded-lg bg-slate-900/50 p-2">
                    <p className="text-xs text-slate-400">Occupied</p>
                    <p className="text-lg font-bold text-rose-400">
                      {stats.occupied}
                    </p>
                  </div>
                  <div className="rounded-lg bg-slate-900/50 p-2">
                    <p className="text-xs text-slate-400">Cleaning</p>
                    <p className="text-lg font-bold text-yellow-400">
                      {stats.cleaning}
                    </p>
                  </div>
                  <div className="rounded-lg bg-slate-900/50 p-2">
                    <p className="text-xs text-slate-400">Occupancy</p>
                    <p className="text-lg font-bold text-blue-400">
                      {occupancyRate}%
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};

export default BedBookingInterface;
