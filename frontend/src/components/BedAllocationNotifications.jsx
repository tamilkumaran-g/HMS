import React, { useState, useEffect } from "react";
import { AnimatePresence, motion as Motion } from "framer-motion";
import {
  Bell,
  CheckCircle,
  XCircle,
  Clock,
  Stethoscope,
  Building2,
  BedDouble,
  Calendar,
} from "lucide-react";
import { getDoctors } from "../api/client";
import Card from "./ui/Card";
import Badge from "./ui/Badge";
import Button from "./ui/Button";

const BedAllocationNotifications = ({
  visible,
  notifications,
  onApprove,
  onReject,
  loading,
  asPanel = false,
  onClose,
}) => {
  const [expandedId, setExpandedId] = useState(null);
  const [doctorsByNotification, setDoctorsByNotification] = useState({});
  const [loadingDoctors, setLoadingDoctors] = useState({});

  useEffect(() => {
    const fetchDoctorsForNotification = async (notif) => {
      if (!notif.to_hospital_id) return;

      const conditionToSpecialization = {
        cardiac: "Cardiology",
        cardiology: "Cardiology",
        heart: "Cardiology",
        brain: "Neurology",
        neuro: "Neurology",
        bone: "Orthopedics",
        orthopedic: "Orthopedics",
        child: "Pediatrics",
        pediatric: "Pediatrics",
        emergency: "Emergency Medicine",
        general: "General Medicine",
      };

      const specialization =
        conditionToSpecialization[notif.condition?.toLowerCase()?.trim()] ||
        "General Medicine";

      setLoadingDoctors((prev) => ({ ...prev, [notif.id]: true }));
      try {
        const doctors = await getDoctors({
          hospital_id: notif.to_hospital_id,
          specialization: specialization,
          available_only: true,
        });

        setDoctorsByNotification((prev) => ({
          ...prev,
          [notif.id]: doctors,
        }));
      } catch (err) {
        console.error("Failed to fetch doctors:", err);
        setDoctorsByNotification((prev) => ({
          ...prev,
          [notif.id]: [],
        }));
      } finally {
        setLoadingDoctors((prev) => ({ ...prev, [notif.id]: false }));
      }
    };

    if (expandedId) {
      const notif = notifications.find((n) => n.id === expandedId);
      if (notif && !doctorsByNotification[expandedId]) {
        fetchDoctorsForNotification(notif);
      }
    }
  }, [expandedId, notifications, doctorsByNotification]);

  if (!visible || !notifications) {
    return null;
  }

  const urgencyTone = (urgency) => {
    if (urgency === "critical") return "danger";
    if (urgency === "high") return "warning";
    return "accent";
  };

  const formatTimestamp = (ts) => {
    if (!ts) return "N/A";
    const date = new Date(ts);
    const now = new Date();
    const diffMs = now - date;
    const diffMin = Math.floor(diffMs / 60000);
    const diffHr = Math.floor(diffMin / 60);

    if (diffMin < 1) return "Just now";
    if (diffMin < 60) return `${diffMin}m ago`;
    if (diffHr < 24) return `${diffHr}h ago`;
    return date.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const Wrapper = asPanel ? Motion.aside : Motion.div;

  return (
    <Wrapper
      initial={{ opacity: 0, x: asPanel ? 32 : 0, y: asPanel ? 0 : 10 }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      transition={{ duration: 0.24, ease: "easeOut" }}
      className={
        asPanel
          ? "glass-card max-h-[70vh] space-y-3 overflow-y-auto rounded-2xl p-4 scrollbar-thin"
          : "fixed right-4 top-24 z-50 max-h-[70vh] w-[92vw] max-w-md space-y-3 overflow-y-auto scrollbar-thin"
      }
    >
      <div className="flex items-center gap-2 rounded-lg border border-indigo-200 bg-indigo-50 px-4 py-2">
        <Bell className="w-5 h-5 text-indigo-600" />
        <span className="flex-1 text-sm font-semibold text-indigo-700">
          {notifications.length} Pending Request
          {notifications.length !== 1 ? "s" : ""}
        </span>
        {onClose && (
          <button
            onClick={onClose}
            className="rounded-md p-0.5 text-indigo-400 hover:bg-indigo-100 hover:text-indigo-600 transition-colors"
            aria-label="Dismiss notifications"
          >
            <XCircle className="h-4 w-4" />
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <Card
          asMotion={false}
          className="border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500"
        >
          No pending requests right now.
        </Card>
      ) : null}

      {notifications.map((notif, idx) => (
        <Motion.div
          key={notif.id}
          initial={{ opacity: 0, x: asPanel ? 18 : 10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: idx * 0.04, duration: 0.2 }}
        >
          <Card className="space-y-3 rounded-xl border border-slate-200 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {notif.status === "pending" ? (
                  <Clock className="h-4 w-4 text-amber-500" />
                ) : notif.status === "approved" ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-500" />
                )}

                <p className="text-sm font-semibold text-slate-800">
                  {notif.patient_name}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Badge tone={urgencyTone(notif.urgency)}>
                  {(notif.urgency || "normal").toUpperCase()}
                </Badge>

                <button
                  onClick={() =>
                    setExpandedId(expandedId === notif.id ? null : notif.id)
                  }
                  className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-xs text-slate-600 hover:bg-slate-100"
                >
                  {expandedId === notif.id ? "Hide" : "Details"}
                </button>
              </div>
            </div>

            {/* Compact info row with timestamp */}
            <div className="grid grid-cols-3 gap-3 text-xs">
              <div>
                <p className="flex items-center gap-1 text-slate-400">
                  <Building2 className="h-3 w-3" /> From
                </p>
                <p className="font-medium text-indigo-600">
                  {notif.from_hospital_name}
                </p>
              </div>
              <div>
                <p className="flex items-center gap-1 text-slate-400">
                  <Building2 className="h-3 w-3" /> To
                </p>
                <p className="font-medium text-green-600">
                  {notif.to_hospital_name}
                </p>
              </div>
              <div>
                <p className="flex items-center gap-1 text-slate-400">
                  <Calendar className="h-3 w-3" /> Time
                </p>
                <p className="font-medium text-slate-600">
                  {formatTimestamp(notif.created_at)}
                </p>
              </div>
            </div>

            <AnimatePresence>
              {expandedId === notif.id ? (
                <Motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-3 overflow-hidden border-t border-slate-100 pt-3 text-xs"
                >
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="flex items-center gap-1 text-slate-400">
                        <Stethoscope className="h-3 w-3" /> Condition
                      </p>
                      <p className="text-slate-700">{notif.condition}</p>
                    </div>
                    <div>
                      <p className="flex items-center gap-1 text-slate-400">
                        <BedDouble className="h-3 w-3" /> Bed Type
                      </p>
                      <p className="text-slate-700">
                        {notif.bed_type || "N/A"}
                      </p>
                    </div>
                  </div>

                  <div>
                    <p className="text-slate-400">Requested At</p>
                    <p className="text-slate-700">
                      {new Date(notif.created_at).toLocaleString()}
                    </p>
                  </div>

                  <div className="space-y-2 rounded-lg border border-slate-200 bg-slate-50 p-2">
                    <p className="font-semibold text-slate-700">
                      Available Doctors
                    </p>

                    {loadingDoctors[notif.id] ? (
                      <p className="py-1 text-slate-400">
                        Loading doctors...
                      </p>
                    ) : doctorsByNotification[notif.id]?.length > 0 ? (
                      doctorsByNotification[notif.id]
                        .slice(0, 3)
                        .map((doctor) => (
                          <div
                            key={doctor.id}
                            className="rounded border border-green-200 bg-green-50 p-2"
                          >
                            <div className="mb-1 flex items-center justify-between gap-2">
                              <p className="font-semibold text-green-700">
                                {doctor.name}
                              </p>
                              {doctor.score !== null ? (
                                <Badge tone="success">
                                  Score {doctor.score?.toFixed(1) || "N/A"}
                                </Badge>
                              ) : null}
                            </div>
                            <p className="text-slate-500">
                              {doctor.specialization}
                            </p>
                          </div>
                        ))
                    ) : (
                      <div className="rounded border border-red-200 bg-red-50 p-2 text-red-700">
                        <p className="font-medium">
                          No doctors available for this department.
                        </p>
                      </div>
                    )}
                  </div>
                </Motion.div>
              ) : null}
            </AnimatePresence>

            {notif.status === "pending" ? (
              <div className="flex gap-2 border-t border-slate-100 pt-3">
                <Button
                  onClick={() => onApprove(notif.id)}
                  disabled={loading}
                  variant="success"
                  className="flex-1 py-2 text-xs"
                >
                  Approve
                </Button>
                <Button
                  onClick={() => onReject(notif.id)}
                  disabled={loading}
                  variant="danger"
                  className="flex-1 py-2 text-xs"
                >
                  Reject
                </Button>
              </div>
            ) : null}
          </Card>
        </Motion.div>
      ))}
    </Wrapper>
  );
};

export default BedAllocationNotifications;
