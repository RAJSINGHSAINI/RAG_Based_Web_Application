import { useEffect, useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";

import Navbar from "./components/Navbar.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import PublicRoute from "./components/PublicRoute.jsx";
import { useAuth } from "./context/AuthContext.jsx";

import Signup from "./pages/Signup.jsx";
import Login from "./pages/Login.jsx";
import VerifyEmail from "./pages/VerifyEmail.jsx";
import ForgotPassword from "./pages/ForgotPassword.jsx";
import VerifyForgotPasswordOTP from "./pages/VerifyForgotPasswordOTP.jsx";
import ResetPassword from "./pages/ResetPassword.jsx";
import Home from "./pages/Home.jsx";
import Profile from "./pages/Profile.jsx";
import ChangeEmail from "./pages/ChangeEmail.jsx";

const ThemeToggle = ({ theme, onToggleTheme }) => (
  <button
    type="button"
    className={`relative inline-flex h-7 w-12 items-center rounded-full border transition-all duration-300 ${
      theme === "dark"
        ? "border-indigo-400/60 bg-indigo-500 shadow-[0_0_18px_rgba(99,102,241,0.35)]"
        : "border-slate-200 bg-slate-200"
    }`}
    aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
    aria-pressed={theme === "dark"}
    onClick={onToggleTheme}
  >
    <span
      className={`absolute left-1 flex h-5 w-5 items-center justify-center rounded-full bg-white text-[10px] shadow-md transition-transform duration-300 ${
        theme === "dark" ? "translate-x-5 text-amber-500" : "translate-x-0 text-slate-500"
      }`}
      aria-hidden="true"
    >
      {theme === "dark" ? "☀" : "☾"}
    </span>
  </button>
);

const App = () => {
  const { isAuthenticated } = useAuth();
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem("auth-theme");
    return savedTheme || "light";
  });

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem("auth-theme", theme);
  }, [theme]);

  const handleToggleTheme = () => {
    setTheme((currentTheme) => (currentTheme === "light" ? "dark" : "light"));
  };

  return (
    <div className="min-h-[100dvh] max-h-[100dvh] overflow-hidden bg-slate-100 text-slate-900 transition-colors duration-300 dark:bg-slate-950 dark:text-slate-100">
      {/* min-h-[100dvh] max-h-[100dvh] keeps the whole app pinned to the real mobile viewport height instead of a taller 100vh estimate. */}
      {!isAuthenticated && (
        <div className="fixed right-4 top-4 z-50 sm:right-5 sm:top-5">
          <ThemeToggle theme={theme} onToggleTheme={handleToggleTheme} />
        </div>
      )}

      <div className="flex min-h-[100dvh] max-h-[100dvh] flex-col overflow-hidden">
        {isAuthenticated && <Navbar theme={theme} onToggleTheme={handleToggleTheme} />}

        <main className="mx-auto flex w-full max-w-7xl flex-1 items-center justify-center overflow-y-auto px-4 py-4 sm:px-6 md:py-8 lg:px-8">
          {/* overflow-y-auto keeps the page content scrollable without letting the root body overflow vertically on mobile browsers. */}
          <Routes>
            <Route element={<PublicRoute />}>
              <Route path="/signup" element={<Signup />} />
              <Route path="/login" element={<Login />} />
            </Route>

            <Route path="/verify-email" element={<VerifyEmail />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/verify-forgot-password" element={<VerifyForgotPasswordOTP />} />
            <Route path="/reset-password" element={<ResetPassword />} />

            <Route element={<ProtectedRoute />}>
              <Route path="/" element={<Home />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/change-email" element={<ChangeEmail />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default App;
