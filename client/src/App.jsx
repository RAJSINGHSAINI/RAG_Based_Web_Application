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

const App = () => {
  const { isAuthenticated } = useAuth();

  return (
    <>
      {/* The navbar only belongs to the signed-in part of the app. */}
      {isAuthenticated && <Navbar />}

      <main>
        <Routes>
          {/* Signed-out only: an authenticated visitor is sent to Home. */}
          <Route element={<PublicRoute />}>
            <Route path="/signup" element={<Signup />} />
            <Route path="/login" element={<Login />} />
          </Route>

          {/* Reachable either way: verification and password reset. */}
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/verify-forgot-password" element={<VerifyForgotPasswordOTP />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* Requires a valid session cookie. */}
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<Home />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/change-email" element={<ChangeEmail />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </>
  );
};

export default App;
