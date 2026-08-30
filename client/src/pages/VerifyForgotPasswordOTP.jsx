import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import Alert from "../components/Alert.jsx";
import OtpForm from "../components/OtpForm.jsx";

/**
 * Step 2 of 3: check the code.
 *
 * On success the API hands back a short-lived resetToken. We carry it to the
 * next screen in router state — it is a single-use token for one password
 * change, not a session credential, and it never touches localStorage.
 */
const VerifyForgotPasswordOTP = () => {
  const { verifyForgotPasswordOtp, forgotPassword } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const email = location.state?.email;

  const [notice, setNotice] = useState(location.state?.notice || "");
  const [error, setError] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);

  // Someone landed here directly, so there is nothing to verify.
  if (!email) return <Navigate to="/forgot-password" replace />;

  const handleVerify = async (otp) => {
    setError("");
    setNotice("");
    setVerifying(true);
    const result = await verifyForgotPasswordOtp({ email, otp });
    setVerifying(false);

    if (!result.success) {
      setError(result.message);
      return;
    }

    navigate("/reset-password", {
      replace: true,
      state: { email, resetToken: result.resetToken },
    });
  };

  const handleResend = async () => {
    setError("");
    setNotice("");
    setResending(true);
    const result = await forgotPassword(email);
    setResending(false);

    if (result.success) setNotice(result.message);
    else setError(result.message);
  };

  return (
    <div className="auth-shell">
      <div className="card">
        <h1>Enter your code</h1>

        <Alert type="success" message={notice} />
        <Alert message={error} />

        <OtpForm
          sentTo={email}
          onSubmit={handleVerify}
          onResend={handleResend}
          submitLabel="Verify code"
          busyLabel="Verifying code…"
          busy={verifying}
          resending={resending}
        />

        <p className="card-foot">
          <Link to="/forgot-password">Use a different email</Link>
        </p>
      </div>
    </div>
  );
};

export default VerifyForgotPasswordOTP;
