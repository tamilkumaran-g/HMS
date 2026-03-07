import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Route, Routes } from "react-router-dom";
import "./App.css";
import Header from "./components/Header";
import Navbar from "./components/Navbar";
import MetricsRow from "./components/MetricsRow";
import BedStatusChart from "./components/BedStatusChart";
import BedTypeChart from "./components/BedTypeChart";
import CapacityChart from "./components/CapacityChart";
import BedBookingInterface from "./components/BedBookingInterface";
import AdmissionForm from "./components/AdmissionForm";
import NewAdmission from "./components/NewAdmission";
import BedAllocationNotifications from "./components/BedAllocationNotifications";
import NegotiationLog from "./components/NegotiationLog";
import ErrorBoundary from "./components/ErrorBoundary";
import LoginPage from "./components/LoginPage";
import PrivateRoute from "./components/PrivateRoute";
import DoctorAvailability from "./components/DoctorAvailability";
import { useHospitalData } from "./hooks/useHospitalData";
import {
  admitPatient,
  approveNotification,
  bookBed,
  getNotifications,
  rejectNotification,
} from "./api/client";

// Authenticated Dashboard Component
const AuthenticatedDashboard = () => {
  const { hospitals, beds, loading, error, refreshData } = useHospitalData();
  const [admitResult, setAdmitResult] = useState(null);
  const [admitLoading, setAdmitLoading] = useState(false);
  const [admitError, setAdmitError] = useState("");
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingMessage, setBookingMessage] = useState("");
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

  const capacityData = stats;

  const loadNotifications = useCallback(async () => {
    setNotificationsLoading(true);
    try {
      const data = await getNotifications();
      setNotifications(data.notifications || []);
    } catch {
      // Silent fail to avoid noisy UI for transient polling errors
    } finally {
      setNotificationsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadNotifications();
    // Disabled auto-refresh to prevent page refreshing during bed allocation
    // const intervalId = setInterval(loadNotifications, 5000);
    // return () => clearInterval(intervalId);
  }, [loadNotifications]);

  const handleAdmit = async (payload) => {
    setAdmitLoading(true);
    setAdmitError("");
    try {
      const result = await admitPatient(payload);
      setAdmitResult(result);
      await refreshData();
      await loadNotifications();
    } catch (err) {
      setAdmitError(err?.message || "Admission failed");
    } finally {
      setAdmitLoading(false);
    }
  };

  const handleBookBed = async (bookingData) => {
    setBookingLoading(true);
    setBookingMessage("");
    try {
      const result = await bookBed(bookingData);
      if (result.success) {
        setBookingMessage(
          "✅ Bed booked successfully! The dashboard will update shortly.",
        );
        await refreshData();
        setTimeout(() => {
          setBookingMessage("");
        }, 3000);
      } else {
        setBookingMessage(`❌ ${result.message}`);
      }
    } catch (err) {
      setBookingMessage(`❌ ${err?.message || "Booking failed"}`);
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
      await refreshData();
      await loadNotifications();
    } catch (err) {
      console.error("❌ Approval failed:", err);
      alert(`Failed to approve: ${err.message}`);
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
      await refreshData();
      await loadNotifications();
    } catch (err) {
      console.error("❌ Rejection failed:", err);
      alert(`Failed to reject: ${err.message}`);
    } finally {
      setNotificationsLoading(false);
    }
  };

  const DashboardPage = () => (
    <>
      <MetricsRow stats={stats} />

      <div className="grid gap-6 lg:grid-cols-1">
        <BedStatusChart data={bedStatusData} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <CapacityChart data={capacityData} />
        <BedTypeChart data={bedTypeData} />
      </div>

      {/* Admission form merged into BedBookingInterface - commenting out */}
      {/* <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
        <AdmissionForm
          onAdmit={handleAdmit}
          loading={admitLoading}
          error={admitError}
        />
        <NegotiationLog result={admitResult} />
      </div> */}
    </>
  );

  const BookingPage = () => (
    <>
      <div className="grid gap-6 lg:grid-cols-1">
        <BedBookingInterface
          hospitals={hospitals}
          beds={beds}
          onBookBed={handleBookBed}
          loading={bookingLoading}
        />
        {bookingMessage && (
          <div className="rounded-2xl border border-emerald-400/30 bg-emerald-500/15 px-4 py-3 text-sm text-emerald-100">
            {bookingMessage}
          </div>
        )}
      </div>
    </>
  );

  const AdmissionPage = () => (
    <>
      <div className="grid gap-6 lg:grid-cols-1">
        <BedAllocationNotifications
          visible={notifications.length > 0}
          notifications={notifications}
          onApprove={handleApproveNotification}
          onReject={handleRejectNotification}
          loading={notificationsLoading}
        />
        <NewAdmission
          hospitals={hospitals}
          onSubmit={handleAdmit}
          loading={admitLoading}
        />
        {admitError && (
          <div className="rounded-2xl border border-rose-400/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
            {admitError}
          </div>
        )}
        {admitResult && (
          <div className="rounded-2xl border border-emerald-400/30 bg-emerald-500/15 px-4 py-3 text-sm text-emerald-100">
            <strong>Allocation Result:</strong>
            <p>Patient: {admitResult.allocation?.patient_name}</p>
            <p>Bed: {admitResult.allocation?.bed_id || "Pending approval"}</p>
            <p>Hospital: {admitResult.allocation?.hospital_name}</p>
          </div>
        )}
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-app px-4 py-8 text-white">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
        <Navbar />
        <Header />

        {error && hospitals.length === 0 ? (
          <div className="rounded-2xl border border-rose-400/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
            Backend error: {error}
          </div>
        ) : null}

        {loading ? (
          <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200">
            Syncing hospital data...
          </div>
        ) : null}

        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/bed-booking" element={<BookingPage />} />
          <Route path="/admission" element={<AdmissionPage />} />
          <Route path="/doctors" element={<DoctorAvailability />} />
          <Route path="*" element={<DashboardPage />} />
        </Routes>
      </div>
    </div>
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
