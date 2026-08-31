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
      <div className="flex min-h-[70vh] items-center justify-center px-4 py-8 sm:px-6">
        <div className="w-full max-w-md rounded-2xl border border-slate-200/80 bg-white/80 p-5 shadow-[0_18px_45px_rgba(15,23,42,0.10)] backdrop-blur-xl dark:border-slate-700 dark:bg-slate-900/80 dark:shadow-[0_20px_50px_rgba(2,6,23,0.7)] sm:p-7">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Verify your email</h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
            We need to know which address to verify. Log in again to continue.
          </p>
          <Link to="/login" className="mt-5 inline-flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 px-4 py-3 text-sm font-semibold text-white shadow-[0_12px_25px_rgba(79,70,229,0.3)] transition hover:translate-y-[-1px]">
            Go to login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4 py-8 sm:px-6">
      <div className="w-full max-w-md rounded-2xl border border-slate-200/80 bg-white/80 p-5 shadow-[0_18px_45px_rgba(15,23,42,0.10)] backdrop-blur-xl dark:border-slate-700 dark:bg-slate-900/80 dark:shadow-[0_20px_50px_rgba(2,6,23,0.7)] sm:p-7">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Verify your email</h1>

        <div className="mt-5 space-y-3">
          <Alert type="success" message={notice} />
          <Alert message={error} />
        </div>

        <div className="mt-5">
          <OtpForm
            sentTo={email}
            onSubmit={handleVerify}
            onResend={handleResend}
            submitLabel="Verify email"
            busyLabel="Verifying code…"
            busy={verifying}
            resending={resending}
          />
        </div>

        {!isAuthenticated && (
          <p className="mt-4 text-center text-sm text-slate-600 dark:text-slate-300">
            <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-300 dark:hover:text-indigo-200">Back to login</Link>
          </p>
        )}
        {isAuthenticated && (
          <p className="mt-4 text-center text-sm text-slate-600 dark:text-slate-300">
            <Link to="/profile" className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-300 dark:hover:text-indigo-200">Back to profile</Link>
          </p>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail;
