import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import Alert from "../components/Alert.jsx";
import OtpForm from "../components/OtpForm.jsx";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/**
 * Two steps on one page: enter the new address, then the code sent to it.
 * The account's email only changes when the second step succeeds.
 */
const ChangeEmail = () => {
  const { user, requestChangeEmail, verifyChangeEmail } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState("email"); // "email" | "otp"
  const [newEmail, setNewEmail] = useState("");
  const [fieldError, setFieldError] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);

  const handleSendCode = async (event) => {
    event.preventDefault();

    const trimmed = newEmail.trim().toLowerCase();

    if (!trimmed) {
      setFieldError("Enter the new email address");
      return;
    }
    if (!EMAIL_PATTERN.test(trimmed)) {
      setFieldError("Enter a valid email address");
      return;
    }
    if (trimmed === user?.email) {
      setFieldError("That is already your email address");
      return;
    }

    setFieldError("");
    setError("");
    setNotice("");
    setSending(true);
    const result = await requestChangeEmail(trimmed);
    setSending(false);

    if (!result.success) {
      setError(result.message);
      return;
    }

    setNewEmail(trimmed);
    setNotice(result.message);
    setStep("otp");
  };

  const handleResend = async () => {
    setError("");
    setNotice("");
    setSending(true);
    // Requesting again replaces the pending code, so the old one stops working.
    const result = await requestChangeEmail(newEmail);
    setSending(false);

    if (result.success) setNotice(result.message);
    else setError(result.message);
  };

  const handleVerify = async (otp) => {
    setError("");
    setNotice("");
    setVerifying(true);
    const result = await verifyChangeEmail(otp);
    setVerifying(false);

    if (!result.success) {
      setError(result.message);
      return;
    }

    // Context now holds the new email, so the profile shows it right away.
    navigate("/profile", { replace: true, state: { notice: result.message } });
  };

  return (
    <div className="w-full max-w-xl px-4 py-8 sm:px-6">
      <div className="rounded-3xl border border-slate-200/80 bg-white/80 p-5 shadow-[0_18px_45px_rgba(15,23,42,0.10)] backdrop-blur-xl dark:border-slate-700 dark:bg-slate-900/80 dark:shadow-[0_20px_50px_rgba(2,6,23,0.7)] sm:p-7">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Change email</h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
          Current email: <strong className="font-semibold text-slate-900 dark:text-white">{user?.email}</strong>
        </p>

        <div className="mt-5 space-y-3">
          <Alert type="success" message={notice} />
          <Alert message={error} />
        </div>

        {step === "email" ? (
          <form onSubmit={handleSendCode} noValidate className="mt-5 space-y-4">
            <div className="space-y-2">
              <label htmlFor="newEmail" className="block text-sm font-semibold text-slate-700 dark:text-slate-200">New email address</label>
              <input
                id="newEmail"
                type="email"
                autoComplete="email"
                value={newEmail}
                onChange={(event) => {
                  setNewEmail(event.target.value);
                  setFieldError("");
                }}
                disabled={sending}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-slate-900 placeholder:text-slate-400 focus:border-indigo-400 focus:outline-none focus:ring-4 focus:ring-indigo-100 disabled:cursor-not-allowed disabled:opacity-70 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:ring-indigo-500/20"
              />
              {fieldError && <span className="block text-sm text-rose-600 dark:text-rose-400">{fieldError}</span>}
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <button type="submit" className="flex-1 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 px-4 py-3 text-sm font-semibold text-white shadow-[0_12px_25px_rgba(79,70,229,0.3)] transition hover:translate-y-[-1px] disabled:cursor-not-allowed disabled:opacity-70" disabled={sending}>
                {sending ? "Sending code…" : "Send code"}
              </button>
              <button
                type="button"
                className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:hover:bg-slate-800"
                onClick={() => navigate("/profile")}
                disabled={sending}
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <>
            <div className="mt-5">
              <OtpForm
                sentTo={newEmail}
                onSubmit={handleVerify}
                onResend={handleResend}
                submitLabel="Change email"
                busyLabel="Changing email…"
                busy={verifying}
                resending={sending}
              />
            </div>
            <button
              type="button"
              className="mt-3 w-full rounded-xl border border-transparent px-2 py-2 text-sm font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-300 dark:hover:text-indigo-200"
              onClick={() => {
                setStep("email");
                setNotice("");
                setError("");
              }}
              disabled={verifying}
            >
              Use a different address
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default ChangeEmail;
