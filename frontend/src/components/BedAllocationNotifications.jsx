import React, { useState, useEffect } from "react";
import { Bell, CheckCircle, XCircle, Clock, AlertCircle } from "lucide-react";
import { getDoctors } from "../api/client";

const BedAllocationNotifications = ({
  visible,
  notifications,
  onApprove,
  onReject,
  loading,
}) => {
  const [expandedId, setExpandedId] = useState(null);
  const [doctorsByNotification, setDoctorsByNotification] = useState({});
  const [loadingDoctors, setLoadingDoctors] = useState({});

  // Fetch doctors for a specific notification when it's expanded
  useEffect(() => {
    const fetchDoctorsForNotification = async (notif) => {
      if (!notif.to_hospital_id) return;

      // Map condition to specialization
      const conditionToSpecialization = {
        "cardiac": "Cardiology",
        "cardiology": "Cardiology",
        "heart": "Cardiology",
        "brain": "Neurology",
        "neuro": "Neurology",
        "bone": "Orthopedics",
        "orthopedic": "Orthopedics",
        "child": "Pediatrics",
        "pediatric": "Pediatrics",
        "emergency": "Emergency Medicine",
        "general": "General Medicine",
      };

      const specialization = conditionToSpecialization[notif.condition?.toLowerCase()?.trim()] || "General Medicine";

      setLoadingDoctors(prev => ({ ...prev, [notif.id]: true }));
      try {
        const doctors = await getDoctors({
          hospital_id: notif.to_hospital_id,
          specialization: specialization,
          available_only: true,
        });
        
        setDoctorsByNotification(prev => ({
          ...prev,
          [notif.id]: doctors,
        }));

        // Note: Auto-reject logic disabled - user can manually reject if needed
        // Users can see in the UI if no doctors are available
      } catch (err) {
        console.error("Failed to fetch doctors:", err);
        setDoctorsByNotification(prev => ({
          ...prev,
          [notif.id]: [],
        }));
      } finally {
        setLoadingDoctors(prev => ({ ...prev, [notif.id]: false }));
      }
    };

    // Fetch doctors for expanded notification
    if (expandedId) {
      const notif = notifications.find(n => n.id === expandedId);
      if (notif && !doctorsByNotification[expandedId]) {
        fetchDoctorsForNotification(notif);
      }
    }
  }, [expandedId, notifications, doctorsByNotification]);

  if (!visible || !notifications || notifications.length === 0) {
    return null;
  }

  return (
    <div className="fixed right-6 top-24 w-96 max-h-96 overflow-y-auto space-y-3 z-50">
      <div className="flex items-center gap-2 px-4 py-2 bg-blue-500/20 rounded-lg border border-blue-400/30">
        <Bell className="w-5 h-5 text-blue-400" />
        <span className="text-sm font-semibold text-blue-100">
          {notifications.length} Pending Request
          {notifications.length !== 1 ? "s" : ""}
        </span>
      </div>

      {notifications.map((notif) => (
        <div
          key={notif.id}
          className="rounded-lg border border-white/10 bg-slate-900/80 p-4 space-y-3 backdrop-blur"
        >
          {/* Status Badge */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {notif.status === "pending" && (
                <>
                  <Clock className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-semibold text-amber-300">
                    Awaiting Approval
                  </span>
                </>
              )}
              {notif.status === "approved" && (
                <>
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-semibold text-emerald-300">
                    Approved
                  </span>
                </>
              )}
              {notif.status === "rejected" && (
                <>
                  <XCircle className="w-4 h-4 text-rose-400" />
                  <span className="text-xs font-semibold text-rose-300">
                    Rejected
                  </span>
                </>
              )}
            </div>
            <button
              onClick={() =>
                setExpandedId(expandedId === notif.id ? null : notif.id)
              }
              className="text-xs text-slate-400 hover:text-slate-200"
            >
              {expandedId === notif.id ? "▼" : "▶"}
            </button>
          </div>

          {/* Patient & Request Info */}
          <div className="space-y-2 text-sm">
            <div>
              <p className="text-slate-400">Patient</p>
              <p className="font-semibold text-white">{notif.patient_name}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-slate-400 text-xs">From Hospital</p>
                <p className="font-medium text-blue-300">
                  {notif.from_hospital_name}
                </p>
              </div>
              <div>
                <p className="text-slate-400 text-xs">To Hospital (Receiver)</p>
                <p className="font-medium text-green-300">
                  {notif.to_hospital_name}
                </p>
              </div>
            </div>
          </div>

          {/* Expanded Details */}
          {expandedId === notif.id && (
            <div className="border-t border-white/10 pt-3 space-y-3 text-xs">
              <div>
                <p className="text-slate-400">Condition</p>
                <p className="text-slate-200">{notif.condition}</p>
              </div>
              <div>
                <p className="text-slate-400">Urgency</p>
                <p
                  className={`font-semibold ${
                    notif.urgency === "critical"
                      ? "text-rose-400"
                      : notif.urgency === "high"
                        ? "text-amber-400"
                        : "text-emerald-400"
                  }`}
                >
                  {notif.urgency.toUpperCase()}
                </p>
              </div>
              <div>
                <p className="text-slate-400">Requested At</p>
                <p className="text-slate-200">
                  {new Date(notif.created_at).toLocaleString()}
                </p>
              </div>

              {/* Available Doctors Section */}
              <div className="border-t border-white/10 pt-3">
                <p className="text-slate-300 font-semibold mb-2">Available Doctors</p>
                
                {loadingDoctors[notif.id] ? (
                  <div className="text-center py-2 text-slate-400">
                    Loading doctors...
                  </div>
                ) : doctorsByNotification[notif.id]?.length > 0 ? (
                  <div className="space-y-2">
                    {doctorsByNotification[notif.id].map((doctor) => (
                      <div
                        key={doctor.id}
                        className="rounded bg-emerald-900/20 border border-emerald-500/30 p-2"
                      >
                        <div className="flex justify-between items-start mb-1">
                          <p className="font-semibold text-emerald-300">
                            {doctor.name}
                          </p>
                          {doctor.score !== null && (
                            <span className="text-emerald-400 font-bold text-xs bg-emerald-900/40 px-2 py-0.5 rounded">
                              Score: {doctor.score?.toFixed(1) || 'N/A'}
                            </span>
                          )}
                        </div>
                        <div className="grid grid-cols-2 gap-1 text-slate-300 text-xs">
                          <div>
                            <p className="text-slate-400">Specialty</p>
                            <p>{doctor.specialization}</p>
                          </div>
                          <div>
                            <p className="text-slate-400">Experience</p>
                            <p>{doctor.experience_years} years</p>
                          </div>
                          {doctor.available_slots !== undefined && (
                            <div>
                              <p className="text-slate-400">Slots</p>
                              <p>{doctor.available_slots}</p>
                            </div>
                          )}
                          {doctor.phone && (
                            <div>
                              <p className="text-slate-400">Contact</p>
                              <p>{doctor.phone}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-2 px-2 rounded bg-rose-900/20 border border-rose-500/30">
                    <p className="text-rose-300 font-medium">
                      ⚠️ No doctors available for this department
                    </p>
                    <p className="text-rose-200 text-xs mt-1">
                      Request will be automatically rejected
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          {notif.status === "pending" && (
            <div className="border-t border-white/10 pt-3 flex gap-2">
              <button
                onClick={() => {
                  console.log(`📙 Approve button clicked for notification ${notif.id}`, notif);
                  onApprove(notif.id);
                }}
                disabled={loading}
                title={`Approve this request from ${notif.from_hospital_name} for ${notif.to_hospital_name}`}
                className="flex-1 rounded-lg bg-emerald-500/30 px-3 py-2 text-xs font-semibold text-emerald-200 hover:bg-emerald-500/40 disabled:opacity-50 border border-emerald-400/30"
              >
                ✓ Approve
              </button>
              <button
                onClick={() => {
                  console.log(`🗑️ Reject button clicked for notification ${notif.id}`, notif);
                  onReject(notif.id);
                }}
                disabled={loading}
                title={`Reject this request from ${notif.from_hospital_name} for ${notif.to_hospital_name}`}
                className="flex-1 rounded-lg bg-rose-500/30 px-3 py-2 text-xs font-semibold text-rose-200 hover:bg-rose-500/40 disabled:opacity-50 border border-rose-400/30"
              >
                ✕ Reject
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default BedAllocationNotifications;
