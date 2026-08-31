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
    <div className="flex min-h-[70vh] items-center justify-center px-4 py-8 sm:px-6">
      <div className="w-full max-w-md rounded-2xl border border-slate-200/80 bg-white/80 p-5 shadow-[0_18px_45px_rgba(15,23,42,0.10)] backdrop-blur-xl dark:border-slate-700 dark:bg-slate-900/80 dark:shadow-[0_20px_50px_rgba(2,6,23,0.7)] sm:p-7">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Enter your code</h1>

        <div className="mt-5 space-y-3">
          <Alert type="success" message={notice} />
          <Alert message={error} />
        </div>

        <div className="mt-5">
          <OtpForm
            sentTo={email}
            onSubmit={handleVerify}
            onResend={handleResend}
            submitLabel="Verify code"
            busyLabel="Verifying code…"
            busy={verifying}
            resending={resending}
          />
        </div>

        <p className="mt-4 text-center text-sm text-slate-600 dark:text-slate-300">
          <Link to="/forgot-password" className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-300 dark:hover:text-indigo-200">Use a different email</Link>
        </p>
      </div>
    </div>
  );
};

export default VerifyForgotPasswordOTP;
