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
    <div className="page">
      <div className="card">
        <h1>Change email</h1>
        <p className="muted">
          Current email: <strong>{user?.email}</strong>
        </p>

        <Alert type="success" message={notice} />
        <Alert message={error} />

        {step === "email" ? (
          <form onSubmit={handleSendCode} noValidate>
            <div className="field">
              <label htmlFor="newEmail">New email address</label>
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
              />
              {fieldError && <span className="field-error">{fieldError}</span>}
            </div>

            <div className="button-row">
              <button type="submit" className="btn btn-primary" disabled={sending}>
                {sending ? "Sending code…" : "Send code"}
              </button>
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => navigate("/profile")}
                disabled={sending}
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <>
            <OtpForm
              sentTo={newEmail}
              onSubmit={handleVerify}
              onResend={handleResend}
              submitLabel="Change email"
              busyLabel="Changing email…"
              busy={verifying}
              resending={sending}
            />
            <button
              type="button"
              className="btn btn-link"
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
