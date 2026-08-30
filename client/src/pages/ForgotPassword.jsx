import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import Alert from "../components/Alert.jsx";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Step 1 of 3: ask for the email and send a code to it. */
const ForgotPassword = () => {
  const { forgotPassword } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [fieldError, setFieldError] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    const trimmed = email.trim().toLowerCase();

    if (!trimmed) {
      setFieldError("Email address is required");
      return;
    }
    if (!EMAIL_PATTERN.test(trimmed)) {
      setFieldError("Enter a valid email address");
      return;
    }

    setFieldError("");
    setError("");
    setSubmitting(true);
    const result = await forgotPassword(trimmed);
    setSubmitting(false);

    if (!result.success) {
      setError(result.message);
      return;
    }

    // The API deliberately answers the same way whether or not the account
    // exists, so we always move to the code screen.
    navigate("/verify-forgot-password", {
      state: { email: trimmed, notice: result.message },
    });
  };

  return (
    <div className="auth-shell">
      <div className="card">
        <h1>Forgot password</h1>
        <p className="muted">
          Enter the email on your account and we will send a 6-digit code.
        </p>

        <Alert message={error} />

        <form onSubmit={handleSubmit} noValidate>
          <div className="field">
            <label htmlFor="email">Email address</label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
                setFieldError("");
              }}
              disabled={submitting}
            />
            {fieldError && <span className="field-error">{fieldError}</span>}
          </div>

          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? "Sending code…" : "Send code"}
          </button>
        </form>

        <p className="card-foot">
          <Link to="/login">Back to login</Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;
