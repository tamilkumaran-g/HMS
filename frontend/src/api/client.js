const DEFAULT_BACKEND_URL = "http://localhost:8000";

export const BACKEND_URL =
  import.meta.env.VITE_BACKEND_URL || DEFAULT_BACKEND_URL;

/**
 * Get authentication headers with JWT token if available
 */
const getAuthHeaders = () => {
  const token = localStorage.getItem("access_token");
  const headers = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  return headers;
};

const jsonFetch = async (path, options = {}) => {
  const response = await fetch(`${BACKEND_URL}${path}`, {
    headers: getAuthHeaders(),
    ...options,
  });

  const contentType = response.headers.get("content-type") || "";
  const isJson = contentType.includes("application/json");

  if (!response.ok) {
    let message = `Request failed (${response.status})`;
    if (isJson) {
      const body = await response.json();
      message = body.detail || body.message || JSON.stringify(body);
    } else {
      const text = await response.text();
      if (text) message = text;
    }

    // If unauthorized or forbidden, clear auth data and redirect to login
    if (response.status === 401 || response.status === 403) {
      localStorage.clear();
      window.location.href = "/login";
    }

    throw new Error(message);
  }

  return isJson ? response.json() : {};
};

export const getHospitals = async () => {
  const data = await jsonFetch("/api/hospitals");
  return data.hospitals || data || [];
};

export const getBeds = async () => {
  const data = await jsonFetch("/api/beds");
  return data.beds || data || [];
};

export const admitPatient = async (payload) =>
  jsonFetch("/api/admit_patient", {
    method: "POST",
    body: JSON.stringify(payload),
  });

export const bookBed = async (payload) =>
  jsonFetch("/api/book_bed", {
    method: "POST",
    body: JSON.stringify(payload),
  });

export const getNotifications = async () => jsonFetch("/api/notifications");

export const approveNotification = async (notificationId) =>
  jsonFetch(`/api/notifications/${notificationId}/approve`, {
    method: "POST",
  });

export const rejectNotification = async (notificationId) =>
  jsonFetch(`/api/notifications/${notificationId}/reject`, {
    method: "POST",
  });

export const getDoctors = async (params = {}) => {
  const searchParams = new URLSearchParams();
  if (params.hospital_id) searchParams.append("hospital_id", params.hospital_id);
  if (params.specialization) searchParams.append("specialization", params.specialization);
  if (params.available_only) searchParams.append("available_only", "true");
  
  const queryString = searchParams.toString();
  const path = `/api/doctors${queryString ? `?${queryString}` : ''}`;
  
  const data = await jsonFetch(path);
  return data.doctors || [];
};
