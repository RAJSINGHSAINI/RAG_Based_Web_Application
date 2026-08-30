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
    // Digits only, six at most — matches what the server accepts.
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
    <form onSubmit={handleSubmit} noValidate>
      {sentTo && (
        <p className="muted">
          We sent a 6-digit code to <strong>{sentTo}</strong>. It expires in 10
          minutes.
        </p>
      )}

      <div className="field">
        <label htmlFor="otp">6-digit code</label>
        <input
          id="otp"
          className="otp-input"
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          placeholder="000000"
          value={otp}
          onChange={handleChange}
          disabled={busy}
          autoFocus
        />
        {localError && <span className="field-error">{localError}</span>}
      </div>

      <button type="submit" className="btn btn-primary" disabled={busy}>
        {busy ? busyLabel : submitLabel}
      </button>

      {onResend && (
        <button
          type="button"
          className="btn btn-link"
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
