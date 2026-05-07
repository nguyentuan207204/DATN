// Application-wide constants

// User roles
export const ROLES = {
  ADMIN: "admin",
  DOCTOR: "doctor",
  NURSE: "nurse",
  RECEPTIONIST: "receptionist",
  PATIENT: "patient",
};

// Appointment statuses
export const APPOINTMENT_STATUS = {
  PENDING: "pending",
  CONFIRMED: "confirmed",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
};

// API base URL (fallback if not set in .env)
export const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000";

// Pagination defaults
export const DEFAULT_PAGE_SIZE = 10;
