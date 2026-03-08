import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Route, Routes } from "react-router-dom";
import "./App.css";
import BedStatusChart from "./components/BedStatusChart";
import BedTypeChart from "./components/BedTypeChart";
import BedBookingInterface from "./components/BedBookingInterface";
import NewAdmission from "./components/NewAdmission";
import BedAllocationNotifications from "./components/BedAllocationNotifications";
import ErrorBoundary from "./components/ErrorBoundary";
import LoginPage from "./components/LoginPage";
import PrivateRoute from "./components/PrivateRoute";
import DoctorAvailability from "./components/DoctorAvailability";
import DashboardShell from "./components/layout/DashboardShell";
import AnimatedContainer, { AnimatedChild } from "./components/ui/AnimatedContainer";
import StatCard from "./components/ui/StatCard";
import Card from "./components/ui/Card";
import Skeleton from "./components/ui/Skeleton";
import Badge from "./components/ui/Badge";
import { useHospitalData } from "./hooks/useHospitalData";
import {
  admitPatient,
  approveNotification,
  bookBed,
  dischargeBed,
  setBedAvailable,
  getNotifications,
  rejectNotification,
} from "./api/client";
import { useToast } from "./components/ui/useToast";
import {
  Activity,
  BedDouble,
  Building2,
  CircleCheck,
  CircleX,
  RefreshCw,
} from "lucide-react";

// Authenticated Dashboard Component
const AuthenticatedDashboard = () => {
  const { hospitals, beds, loading, error, refreshData } = useHospitalData();
  const toast = useToast();
  const [admitLoading, setAdmitLoading] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [notificationsLoading, setNotificationsLoading] = useState(false);

  const stats = useMemo(() => {
    return hospitals.map((hospital) => {
      const hospitalBeds = beds.filter(
        (bed) => bed.hospital_id === hospital.id,
      );
      const available = hospitalBeds.filter(
        (bed) => bed.status === "available",
      ).length;
      const total = hospitalBeds.length;
      const occupancy = total
        ? Math.round((1 - available / total) * 1000) / 10
        : 0;

      return {
        id: hospital.id,
        name: hospital.name,
        available,
        total,
        occupancy,
      };
    });
  }, [hospitals, beds]);

  const bedStatusData = useMemo(() => {
    const available = beds.filter((b) => b.status === "available").length;
    const occupied = beds.filter((b) => b.status === "occupied").length;
    const cleaning = beds.filter((b) => b.status === "cleaning").length;
    return { available, occupied, cleaning };
  }, [beds]);

  const bedTypeData = useMemo(() => {
    const types = {};
    beds.forEach((bed) => {
      const type = bed.bed_type || "Unknown";
      if (!types[type]) {
        types[type] = { type, count: 0, hospitals: {} };
      }
      types[type].count++;

      const hospitalId = bed.hospital_id;
      const hospital = hospitals.find((h) => h.id === hospitalId);
      if (!types[type].hospitals[hospitalId]) {
        types[type].hospitals[hospitalId] = {
          name: hospital?.name || "Unknown",
          count: 0,
        };
      }
      types[type].hospitals[hospitalId].count++;
    });
    return Object.values(types).map((t) => ({
      ...t,
      hospitals: Object.values(t.hospitals),
    }));
  }, [beds, hospitals]);

  const loadNotifications = useCallback(async (showLoading = false) => {
    if (showLoading) setNotificationsLoading(true);
    try {
      const data = await getNotifications();
      const incoming = data.notifications || [];
      setNotifications((prev) => {
        if (JSON.stringify(prev) === JSON.stringify(incoming)) return prev;
        return incoming;
      });
    } catch {
      // Silent fail to avoid noisy UI for transient polling errors
    } finally {
      if (showLoading) setNotificationsLoading(false);
    }
  }, []);

  const [admissionNotifDismissed, setAdmissionNotifDismissed] = useState(false);
  const prevNotifCount = React.useRef(notifications.length);

  useEffect(() => {
    if (notifications.length > prevNotifCount.current) {
      setAdmissionNotifDismissed(false);
    }
    prevNotifCount.current = notifications.length;
  }, [notifications.length]);

  useEffect(() => {
    loadNotifications(true);
    const intervalId = setInterval(() => loadNotifications(false), 10000);
    return () => clearInterval(intervalId);
  }, [loadNotifications]);

  const handleAdmit = async (payload) => {
    setAdmitLoading(true);
    try {
      const result = await admitPatient(payload);
      if (result.allocation?.requires_approval) {
        toast.info(result.message || "Request sent to destination hospital for approval.");
      } else {
        toast.success(result.message || "Admission processed successfully!");
      }
      await refreshData();
      await loadNotifications();
      return result;
    } catch (err) {
      toast.error(err?.message || "Admission failed");
    } finally {
      setAdmitLoading(false);
    }
  };

  const handleBookBed = async (bookingData) => {
    setBookingLoading(true);
    try {
      const result = await bookBed(bookingData);
      if (result.success) {
        toast.success("Bed booked successfully! The dashboard will update shortly.");
        await refreshData();
      } else {
        toast.error(result.message || "Booking failed");
      }
    } catch (err) {
      toast.error(err?.message || "Booking failed");
    } finally {
      setBookingLoading(false);
    }
  };

  const handleDischargeBed = async (bedId) => {
    setBookingLoading(true);
    try {
      const result = await dischargeBed(bedId);
      if (result.success) {
        toast.success("Patient discharged. Bed is now marked for cleaning.");
        await refreshData();
      }
    } catch (err) {
      toast.error(err?.message || "Discharge failed");
    } finally {
      setBookingLoading(false);
    }
  };

  const handleMarkAvailable = async (bedId) => {
    setBookingLoading(true);
    try {
      const result = await setBedAvailable(bedId);
      if (result.success) {
        toast.success("Bed is now available for new patients.");
        await refreshData();
      }
    } catch (err) {
      toast.error(err?.message || "Failed to update bed status");
    } finally {
      setBookingLoading(false);
    }
  };

  const handleApproveNotification = async (notificationId) => {
    setNotificationsLoading(true);
    try {
      console.log(`📙 Approving notification: ${notificationId}`);
      const result = await approveNotification(notificationId);
      console.log("✅ Approval response:", result);
      toast.success("Notification approved successfully");
      await refreshData();
      await loadNotifications();
    } catch (err) {
      console.error("❌ Approval failed:", err);
      toast.error(`Failed to approve: ${err.message}`);
    } finally {
      setNotificationsLoading(false);
    }
  };

  const handleRejectNotification = async (notificationId) => {
    setNotificationsLoading(true);
    try {
      console.log(`🗑️ Rejecting notification: ${notificationId}`);
      const result = await rejectNotification(notificationId);
      console.log("✅ Rejection response:", result);
      toast.success("Notification rejected");
      await refreshData();
      await loadNotifications();
    } catch (err) {
      console.error("❌ Rejection failed:", err);
      toast.error(`Failed to reject: ${err.message}`);
    } finally {
      setNotificationsLoading(false);
    }
  };

  const totals = useMemo(() => {
    const total = beds.length;
    const available = bedStatusData.available;
    const occupied = bedStatusData.occupied;
    const cleaning = bedStatusData.cleaning;
    const occupancyPct = total ? Math.round((occupied / total) * 100) : 0;
    return { total, available, occupied, cleaning, occupancyPct };
  }, [beds, bedStatusData]);

  const DashboardPage = () => (
    <AnimatedContainer className="space-y-6">
      <AnimatedChild>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          <StatCard
            title="Total Beds"
            value={totals.total}
            icon={BedDouble}
            delta="Live Network Capacity"
            tone="primary"
          />
          <StatCard
            title="Available"
            value={totals.available}
            icon={CircleCheck}
            delta="Ready for Allocation"
            tone="success"
          />
          <StatCard
            title="Occupied"
            value={totals.occupied}
            icon={CircleX}
            delta="Currently Assigned"
            tone="danger"
          />
          <StatCard
            title="Cleaning"
            value={totals.cleaning}
            icon={RefreshCw}
            delta="Turnover in Progress"
            tone="warning"
          />
          <StatCard
            title="Occupancy"
            value={totals.occupancyPct}
            suffix="%"
            icon={Activity}
            delta="Network Utilization"
            tone="accent"
          />
        </div>
      </AnimatedChild>

      <AnimatedChild>
        <div className="grid gap-6 xl:grid-cols-[1.1fr_1fr]">
          <BedStatusChart data={bedStatusData} />
          <BedTypeChart data={bedTypeData} />
        </div>
      </AnimatedChild>

      <AnimatedChild>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {stats.map((hospital) => (
            <Card key={hospital.id} className="soft-shadow">
              <div className="mb-4 flex items-start justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Hospital</p>
                  <h3 className="mt-1 text-lg font-semibold text-slate-800">{hospital.name}</h3>
                </div>
                <div className="rounded-xl border border-indigo-100 bg-indigo-50 p-2 text-indigo-600">
                  <Building2 className="h-4 w-4" />
                </div>
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between text-slate-500">
                  <span>Available Beds</span>
                  <span className="font-semibold text-green-600">{hospital.available}</span>
                </div>
                <div className="flex items-center justify-between text-slate-500">
                  <span>Total Beds</span>
                  <span className="font-semibold text-slate-800">{hospital.total}</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-indigo-500 transition-all duration-500"
                    style={{ width: `${hospital.occupancy}%` }}
                  />
                </div>
                <div className="pt-1">
                  <Badge tone={hospital.occupancy > 80 ? "danger" : hospital.occupancy > 60 ? "warning" : "success"}>
                    Occupancy {hospital.occupancy}%
                  </Badge>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </AnimatedChild>
    </AnimatedContainer>
  );

  const BookingPage = () => (
    <AnimatedContainer className="space-y-6">
      <AnimatedChild>
        <BedBookingInterface
          hospitals={hospitals}
          beds={beds}
          onBookBed={handleBookBed}
          onDischargeBed={handleDischargeBed}
          onMarkAvailable={handleMarkAvailable}
          loading={bookingLoading}
        />
      </AnimatedChild>
    </AnimatedContainer>
  );

  const AdmissionPage = () => (
    <AnimatedContainer className="space-y-6">
      <AnimatedChild>
        <BedAllocationNotifications
          visible={notifications.length > 0 && !admissionNotifDismissed}
          notifications={notifications}
          onApprove={handleApproveNotification}
          onReject={handleRejectNotification}
          loading={notificationsLoading}
          asPanel={false}
          onClose={() => setAdmissionNotifDismissed(true)}
        />
      </AnimatedChild>

      <AnimatedChild>
        <NewAdmission
          hospitals={hospitals}
          onSubmit={handleAdmit}
          loading={admitLoading}
        />
      </AnimatedChild>
    </AnimatedContainer>
  );

  const NotificationsPage = () => (
    <AnimatedContainer className="space-y-6">
      <AnimatedChild>
        <BedAllocationNotifications
          visible
          notifications={notifications}
          onApprove={handleApproveNotification}
          onReject={handleRejectNotification}
          loading={notificationsLoading}
          asPanel
        />
      </AnimatedChild>
    </AnimatedContainer>
  );

  return (
    <DashboardShell pendingCount={notifications.length}>
      {error && hospitals.length === 0 ? (
        <div className="glass-card mb-6 rounded-2xl border border-red-200 px-4 py-3 text-sm text-red-700">
          Backend error: {error}
        </div>
      ) : null}

      {loading ? (
        <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          {Array.from({ length: 5 }).map((_, idx) => (
            <Skeleton key={idx} className="h-36" />
          ))}
        </div>
      ) : null}

      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/bed-booking" element={<BookingPage />} />
        <Route path="/admission" element={<AdmissionPage />} />
        <Route path="/doctors" element={<DoctorAvailability />} />
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="*" element={<DashboardPage />} />
      </Routes>
    </DashboardShell>
  );
};

// Main App Component
const App = () => {
  return (
    <ErrorBoundary>
      <Routes>
        {/* Public route - Login */}
        <Route path="/login" element={<LoginPage />} />

        {/* Protected routes */}
        <Route
          path="/*"
          element={
            <PrivateRoute>
              <AuthenticatedDashboard />
            </PrivateRoute>
          }
        />
      </Routes>
    </ErrorBoundary>
  );
};

export default App;
