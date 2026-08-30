import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import Spinner from "./Spinner.jsx";

/** Keeps already-signed-in users away from /login and /signup. */
const PublicRoute = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return <Spinner label="Checking your session…" />;

  if (isAuthenticated) return <Navigate to="/" replace />;

  return <Outlet />;
};

export default PublicRoute;
