import axios from "axios";

/**
 * One Axios instance for the whole app, so the base URL and the cookie setting
 * live in a single place.
 *
 * withCredentials: true is what makes the browser attach the HTTP-only
 * accessToken cookie to every request and accept the Set-Cookie coming back.
 * Without it the session would silently never work.
 *
 * There is no Authorization header anywhere in this app — the cookie is the
 * only credential, and React cannot read it.
 */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

/** Pulls the API's message out of an Axios error, with a readable fallback. */
export const getErrorMessage = (error) =>
  error?.response?.data?.message ||
  "Could not reach the server. Check that it is running and try again.";

export default api;
