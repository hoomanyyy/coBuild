import axios from "axios";

export const BASE_URL = "http://localhost:5000";

const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  timeout: 15000,
  headers: { "Content-Type": "application/json" },
});

export function getErrorMessage(err, fallback = "Something went wrong.") {
  if (err && err.response && err.response.data) {
    return err.response.data.error || fallback;
  }
  if (err && err.request) {
    return "Cannot connect to the server.";
  }
  return fallback;
}

export function isUnauthorized(err) {
  return Boolean(err && err.response && err.response.status === 401);
}

export default api;