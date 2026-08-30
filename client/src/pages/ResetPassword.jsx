import { useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import Alert from "../components/Alert.jsx";

/** Step 3 of 3: set the new password using the token from step 2. */
const ResetPassword = () => {
  const { resetPassword } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const email = location.state?.email;
  const resetToken = location.state?.resetToken;

  const [form, setForm] = useState({ password: "", confirmPassword: "" });
  const [fieldErrors, setFieldErrors] = useState({});
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // No verified code means no reset. Start the flow again.
  if (!email || !resetToken) return <Navigate to="/forgot-password" replace />;

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
    setFieldErrors((previous) => ({ ...previous, [name]: "" }));
    setError("");
  };

  const validate = () => {
    const errors = {};

    if (!form.password) errors.password = "Password is required";
    else if (form.password.length < 8)
      errors.password = "Password must be at least 8 characters";

    if (!form.confirmPassword) errors.confirmPassword = "Confirm your password";
    else if (form.password !== form.confirmPassword)
      errors.confirmPassword = "Passwords do not match";

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    const result = await resetPassword({
      email,
      resetToken,
      password: form.password,
      confirmPassword: form.confirmPassword,
    });
    setSubmitting(false);

    if (!result.success) {
      setError(result.message);
      return;
    }

    navigate("/login", { replace: true, state: { notice: result.message } });
  };

  return (
    <div className="auth-shell">
      <div className="card">
        <h1>Choose a new password</h1>
        <p className="muted">
          For <strong>{email}</strong>
        </p>

        <Alert message={error} />

        <form onSubmit={handleSubmit} noValidate>
          <div className="field">
            <label htmlFor="password">New password</label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              value={form.password}
              onChange={handleChange}
              disabled={submitting}
            />
            <span className="hint">At least 8 characters.</span>
            {fieldErrors.password && (
              <span className="field-error">{fieldErrors.password}</span>
            )}
          </div>

          <div className="field">
            <label htmlFor="confirmPassword">Confirm new password</label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              value={form.confirmPassword}
              onChange={handleChange}
              disabled={submitting}
            />
            {fieldErrors.confirmPassword && (
              <span className="field-error">{fieldErrors.confirmPassword}</span>
            )}
          </div>

          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? "Saving…" : "Save new password"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
