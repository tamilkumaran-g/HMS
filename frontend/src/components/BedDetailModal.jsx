import React from "react";
import {
  BedDouble,
  User,
  SprayCan,
  Stethoscope,
  Calendar,
  LogOut,
  CheckCircle,
  Clock,
} from "lucide-react";
import Modal from "./ui/Modal";
import Button from "./ui/Button";
import Badge from "./ui/Badge";

const statusConfig = {
  available: { tone: "success", label: "Available", icon: BedDouble },
  occupied: { tone: "danger", label: "Occupied", icon: User },
  cleaning: { tone: "warning", label: "Cleaning", icon: SprayCan },
};

const BedDetailModal = ({
  open,
  bed,
  onClose,
  onDischarge,
  onMarkAvailable,
  isAdmin,
  loading,
}) => {
  if (!bed) return null;

  const config = statusConfig[bed.status] || statusConfig.available;
  const StatusIcon = config.icon;

  return (
    <Modal open={open} title={`Bed ${bed.id}`} onClose={onClose}>
      <div className="space-y-4">
        {/* Status Badge */}
        <div className="flex items-center gap-3">
          <div
            className={`flex h-12 w-12 items-center justify-center rounded-xl ${
              bed.status === "available"
                ? "bg-green-100"
                : bed.status === "occupied"
                  ? "bg-red-100"
                  : "bg-amber-100"
            }`}
          >
            <StatusIcon
              className={`h-6 w-6 ${
                bed.status === "available"
                  ? "text-green-600"
                  : bed.status === "occupied"
                    ? "text-red-600"
                    : "text-amber-600"
              }`}
            />
          </div>
          <div>
            <p className="text-lg font-semibold text-slate-800">{bed.id}</p>
            <Badge tone={config.tone}>{config.label}</Badge>
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
            <p className="text-xs text-slate-400">Bed Type</p>
            <p className="mt-1 text-sm font-semibold text-slate-700">
              {bed.bed_type || "N/A"}
            </p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
            <p className="text-xs text-slate-400">Status</p>
            <p className="mt-1 text-sm font-semibold text-slate-700 capitalize">
              {bed.status}
            </p>
          </div>
        </div>

        {/* Patient details when occupied */}
        {bed.status === "occupied" && (
          <div className="space-y-3 rounded-xl border border-red-200 bg-red-50 p-4">
            <p className="flex items-center gap-2 text-sm font-semibold text-red-700">
              <Stethoscope className="h-4 w-4" /> Patient Information
            </p>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-xs text-red-400">Patient Name</p>
                <p className="font-medium text-red-700">
                  {bed.occupant || "Unknown"}
                </p>
              </div>
              <div>
                <p className="text-xs text-red-400">Bed ID</p>
                <p className="font-medium text-red-700">{bed.id}</p>
              </div>
              {bed.updated_at && (
                <div className="col-span-2">
                  <p className="text-xs text-red-400">
                    <Calendar className="mr-1 inline h-3 w-3" />
                    Last Updated
                  </p>
                  <p className="font-medium text-red-700">
                    {new Date(bed.updated_at).toLocaleString()}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Cleaning details */}
        {bed.status === "cleaning" && (
          <div className="space-y-2 rounded-xl border border-amber-200 bg-amber-50 p-4">
            <p className="flex items-center gap-2 text-sm font-semibold text-amber-700">
              <Clock className="h-4 w-4" /> Cleaning In Progress
            </p>
            {bed.eta_clean ? (
              <p className="text-sm text-amber-600">
                Estimated completion: {bed.eta_clean} minutes
              </p>
            ) : null}
          </div>
        )}

        {/* Admin Actions */}
        {isAdmin && (
          <div className="space-y-2 border-t border-slate-100 pt-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Admin Actions
            </p>

            {bed.status === "occupied" && (
              <Button
                onClick={() => onDischarge(bed.id)}
                disabled={loading}
                variant="danger"
                className="w-full"
              >
                <span className="flex items-center justify-center gap-2">
                  <LogOut className="h-4 w-4" />
                  {loading ? "Processing..." : "Discharge Patient"}
                </span>
              </Button>
            )}

            {bed.status === "cleaning" && (
              <Button
                onClick={() => onMarkAvailable(bed.id)}
                disabled={loading}
                variant="success"
                className="w-full"
              >
                <span className="flex items-center justify-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  {loading ? "Processing..." : "Mark as Available"}
                </span>
              </Button>
            )}

            {bed.status === "available" && (
              <p className="text-center text-sm text-green-600">
                This bed is ready for new patients.
              </p>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
};

export default BedDetailModal;
