import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import Spinner from "./Spinner.jsx";

/**
 * Guards the signed-in pages.
 *
 * The loading check matters: on a hard refresh, /api/auth/me has not answered
 * yet, so redirecting immediately would kick a logged-in user to /login for a
 * moment. We wait for the answer first.
 */
const ProtectedRoute = () => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) return <Spinner label="Checking your session…" />;

  if (!isAuthenticated) {
    // Remember where they were headed so login can send them back.
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
