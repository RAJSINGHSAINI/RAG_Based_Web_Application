import { useState } from "react";

/**
 * The 6-digit code form, reused by email verification, forgot password and
 * change email. Only the labels and the submit handler differ between them.
 */
const OtpForm = ({
  sentTo,
  onSubmit,
  onResend,
  submitLabel = "Verify code",
  busyLabel = "Verifying…",
  busy = false,
  resending = false,
}) => {
  const [otp, setOtp] = useState("");
  const [localError, setLocalError] = useState("");

  const handleChange = (event) => {
    const digits = event.target.value.replace(/\D/g, "").slice(0, 6);
    setOtp(digits);
    if (localError) setLocalError("");
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (otp.length !== 6) {
      setLocalError("Enter all 6 digits of the code");
      return;
    }

    onSubmit(otp);
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      {sentTo && (
        <p className="text-sm text-slate-600 dark:text-slate-300">
          We sent a 6-digit code to <strong className="font-semibold text-slate-900 dark:text-white">{sentTo}</strong>. It expires in 10 minutes.
        </p>
      )}

      <div className="space-y-2">
        <label htmlFor="otp" className="block text-sm font-semibold text-slate-700 dark:text-slate-200">
          6-digit code
        </label>
        <input
          id="otp"
          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-center text-2xl font-semibold tracking-[0.5rem] text-slate-900 placeholder:text-slate-400 focus:border-indigo-400 focus:outline-none focus:ring-4 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:ring-indigo-500/20"
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          placeholder="000000"
          value={otp}
          onChange={handleChange}
          disabled={busy}
          autoFocus
        />
        {localError && <span className="block text-sm text-rose-600 dark:text-rose-400">{localError}</span>}
      </div>

      <button
        type="submit"
        className="w-full rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 px-4 py-3 text-sm font-semibold text-white shadow-[0_12px_25px_rgba(79,70,229,0.3)] transition hover:translate-y-[-1px] disabled:cursor-not-allowed disabled:opacity-70"
        disabled={busy}
      >
        {busy ? busyLabel : submitLabel}
      </button>

      {onResend && (
        <button
          type="button"
          className="w-full rounded-xl border border-transparent px-2 py-2 text-sm font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-300 dark:hover:text-indigo-200"
          onClick={onResend}
          disabled={busy || resending}
        >
          {resending ? "Sending…" : "Send a new code"}
        </button>
      )}
    </form>
  );
};

export default OtpForm;
