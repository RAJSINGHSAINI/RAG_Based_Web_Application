import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import Alert from "../components/Alert.jsx";
import OtpForm from "../components/OtpForm.jsx";

/**
 * Serves two entry points:
 *  - straight after signup (not logged in), where success sends you to /login
 *  - from the Profile page (logged in), where success sends you back to /profile
 */
const VerifyEmail = () => {
  const { verifyEmail, resendVerificationOtp, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // The email arrives from signup/login, or from the signed-in user.
  const email = location.state?.email || user?.email || "";

  const [notice, setNotice] = useState(location.state?.notice || "");
  const [error, setError] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);

  const handleVerify = async (otp) => {
    setError("");
    setNotice("");
    setVerifying(true);
    const result = await verifyEmail({ email, otp });
    setVerifying(false);

    if (!result.success) {
      setError(result.message);
      return;
    }

    if (isAuthenticated) {
      navigate("/profile", { replace: true, state: { notice: "Email verified." } });
    } else {
      navigate("/login", {
        replace: true,
        state: { notice: "Email verified. You can log in now." },
      });
    }
  };

  const handleResend = async () => {
    setError("");
    setNotice("");
    setResending(true);
    const result = await resendVerificationOtp(email);
    setResending(false);

    if (result.success) setNotice(result.message);
    else setError(result.message);
  };

  if (!email) {
    return (
      <div className="auth-shell">
        <div className="card">
          <h1>Verify your email</h1>
          <p className="muted">
            We need to know which address to verify. Log in again to continue.
          </p>
          <Link to="/login" className="btn btn-primary">
            Go to login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-shell">
      <div className="card">
        <h1>Verify your email</h1>

        <Alert type="success" message={notice} />
        <Alert message={error} />

        <OtpForm
          sentTo={email}
          onSubmit={handleVerify}
          onResend={handleResend}
          submitLabel="Verify email"
          busyLabel="Verifying code…"
          busy={verifying}
          resending={resending}
        />

        {!isAuthenticated && (
          <p className="card-foot">
            <Link to="/login">Back to login</Link>
          </p>
        )}
        {isAuthenticated && (
          <p className="card-foot">
            <Link to="/profile">Back to profile</Link>
          </p>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail;
