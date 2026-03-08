import React, { useState } from "react";
import { BedDouble, AlertCircle, Eye, Building2 } from "lucide-react";
import BedGrid from "./BedGrid";
import BedDetailModal from "./BedDetailModal";
import Card from "./ui/Card";
import Badge from "./ui/Badge";
import Button from "./ui/Button";

const BedBookingInterface = ({
  hospitals,
  beds,
  onBookBed,
  onDischargeBed,
  onMarkAvailable,
  loading,
}) => {
  const role = localStorage.getItem("role") || "view_only";
  const storedHospitalId = localStorage.getItem("hospital_id");
  const ownHospitalId = storedHospitalId || hospitals[0]?.id;
  const isViewOnly = role === "view_only";
  const isAdmin = role === "full_access";
  const [selectedWardType, setSelectedWardType] = useState("ICU");
  const [selectedBedId, setSelectedBedId] = useState(null);
  const [selectedBedData, setSelectedBedData] = useState(null);
  const [detailBed, setDetailBed] = useState(null);
  const [patientName, setPatientName] = useState("");
  const [patientCondition, setPatientCondition] = useState("General");

  const wardTypes = ["ICU", "General", "Emergency"];

  const ownHospital = hospitals.find((h) => h.id === ownHospitalId);
  const otherHospitals = hospitals.filter((h) => h.id !== ownHospitalId);

  const ownHospitalBeds = beds.filter(
    (bed) =>
      bed.hospital_id === ownHospitalId && bed.bed_type === selectedWardType,
  );

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
    if (bedData.status === "available") {
      // For available beds, toggle selection for booking
      if (selectedBedId === bedId) {
        setSelectedBedId(null);
        setSelectedBedData(null);
      } else {
        setSelectedBedId(bedId);
        setSelectedBedData(bedData);
      }
    } else {
      // For occupied/cleaning beds, open detail modal
      setDetailBed(bedData);
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

  const handleDischarge = async (bedId) => {
    if (onDischargeBed) {
      await onDischargeBed(bedId);
      setDetailBed(null);
    }
  };

  const handleMarkAvailable = async (bedId) => {
    if (onMarkAvailable) {
      await onMarkAvailable(bedId);
      setDetailBed(null);
    }
  };

  return (
    <section className="space-y-6">
      <div>
        <h2 className="flex items-center gap-2 text-2xl font-semibold text-slate-800">
          <BedDouble className="w-6 h-6" /> Hospital Bed Management
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Click any bed to view details, book available beds, or manage
          occupied/cleaning beds.
        </p>
      </div>

      {ownHospital && (
        <Card className="space-y-4 rounded-2xl border border-indigo-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <BedDouble className="w-5 h-5 text-indigo-600" />
            <h3 className="text-xl font-semibold text-indigo-700">
              {ownHospital.name}
            </h3>
            <span className="ml-auto rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-700">
              YOUR HOSPITAL
            </span>
          </div>

          {isViewOnly && (
            <div className="mb-4 rounded-xl border border-orange-200 bg-orange-50 p-3 flex items-start gap-2">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-orange-500" />
              <div>
                <p className="text-xs font-semibold text-orange-700">
                  View-Only Role
                </p>
                <p className="text-xs text-orange-600">
                  You can view bed availability but cannot make bookings.
                </p>
              </div>
            </div>
          )}

          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Ward Type
            </label>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
              {wardTypes.map((ward) => (
                <button
                  key={ward}
                  onClick={() => {
                    setSelectedWardType(ward);
                    setSelectedBedId(null);
                    setSelectedBedData(null);
                  }}
                  className={`rounded-lg px-3 py-2 text-sm font-medium transition-all border ${
                    selectedWardType === ward
                      ? "border-indigo-400 bg-indigo-50 text-indigo-700"
                      : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  {ward}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 mb-4">
            <BedGrid
              beds={ownHospitalBeds}
              wardType={selectedWardType}
              selectedBedId={selectedBedId}
              onSelectBed={handleSelectBed}
              hospitalName={ownHospital.name}
            />
          </div>

          {selectedBedData && (
            <div className="space-y-4 rounded-xl border border-indigo-200 bg-indigo-50 p-4">
              <div className="space-y-2">
                <p className="text-xs text-slate-500">Selected Bed:</p>
                <div className="flex items-center gap-2">
                  <BedDouble className="w-6 h-6 text-indigo-600" />
                  <div>
                    <p className="font-semibold text-slate-800">
                      {selectedBedId}
                    </p>
                    <p className="text-xs text-slate-400">
                      {selectedWardType}
                    </p>
                  </div>
                </div>
              </div>

              <div className="border-t border-indigo-200 pt-3 space-y-3">
                <p className="text-xs font-semibold text-indigo-700">
                  Patient Information
                </p>

                <label className="grid gap-2 text-sm">
                  <span className="text-slate-600">Patient Name *</span>
                  <input
                    type="text"
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                    placeholder="Enter patient full name"
                    className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                    required
                  />
                </label>

                <label className="grid gap-2 text-sm">
                  <span className="text-slate-600">Medical Condition</span>
                  <select
                    value={patientCondition}
                    onChange={(e) => setPatientCondition(e.target.value)}
                    className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-800 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                  >
                    <option>General</option>
                    <option>Cardiology</option>
                    <option>Neurology</option>
                    <option>Orthopedics</option>
                    <option>Pediatrics</option>
                  </select>
                </label>
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  onClick={() => {
                    setSelectedBedId(null);
                    setSelectedBedData(null);
                    setPatientName("");
                    setPatientCondition("General");
                  }}
                  variant="secondary"
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleBookBed}
                  disabled={loading || isViewOnly || !patientName.trim()}
                  title={
                    !patientName.trim()
                      ? "Enter patient name to book"
                      : isViewOnly
                        ? "Booking is restricted for your role"
                        : "Confirm booking"
                  }
                  variant="success"
                  className="flex-1"
                >
                  {loading ? "Booking..." : "Confirm Booking"}
                </Button>
              </div>
            </div>
          )}
        </Card>
      )}

      {otherHospitals.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold flex items-center gap-2 text-slate-700">
            <Eye className="w-5 h-5" /> Other Hospitals - Vacancy Info
          </h3>
          {otherHospitals.map((hospital) => {
            const stats = getHospitalStats(hospital.id);
            const occupancyRate = stats.total
              ? (
                  ((stats.total - stats.available) / stats.total) *
                  100
                ).toFixed(1)
              : "0.0";
            return (
              <Card
                key={hospital.id}
                className="rounded-xl border border-slate-200 p-4"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-indigo-500" />
                    <h4 className="font-semibold text-slate-700">
                      {hospital.name}
                    </h4>
                  </div>
                  <Badge tone="default" className="px-2 py-1">
                    Read-Only
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-2 text-sm sm:grid-cols-4">
                  <div className="rounded-lg bg-slate-50 p-2">
                    <p className="text-xs text-slate-400">Available</p>
                    <p className="text-lg font-bold text-green-600">
                      {stats.available}
                    </p>
                  </div>
                  <div className="rounded-lg bg-slate-50 p-2">
                    <p className="text-xs text-slate-400">Occupied</p>
                    <p className="text-lg font-bold text-red-600">
                      {stats.occupied}
                    </p>
                  </div>
                  <div className="rounded-lg bg-slate-50 p-2">
                    <p className="text-xs text-slate-400">Cleaning</p>
                    <p className="text-lg font-bold text-amber-600">
                      {stats.cleaning}
                    </p>
                  </div>
                  <div className="rounded-lg bg-slate-50 p-2">
                    <p className="text-xs text-slate-400">Occupancy</p>
                    <p className="text-lg font-bold text-indigo-600">
                      {occupancyRate}%
                    </p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Bed Detail Modal */}
      <BedDetailModal
        open={!!detailBed}
        bed={detailBed}
        onClose={() => setDetailBed(null)}
        onDischarge={handleDischarge}
        onMarkAvailable={handleMarkAvailable}
        isAdmin={isAdmin}
        loading={loading}
      />
    </section>
  );
};

export default BedBookingInterface;
