import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import Alert from "../components/Alert.jsx";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [form, setForm] = useState({ email: "", password: "" });
  const [fieldErrors, setFieldErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // A message handed over by another page, e.g. after a password reset.
  const notice = location.state?.notice;

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
    setFieldErrors((previous) => ({ ...previous, [name]: "" }));
    setServerError("");
  };

  const validate = () => {
    const errors = {};

    if (!form.email.trim()) errors.email = "Email address is required";
    else if (!EMAIL_PATTERN.test(form.email.trim()))
      errors.email = "Enter a valid email address";

    if (!form.password) errors.password = "Password is required";

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    const result = await login(form);
    setSubmitting(false);

    if (result.success) {
      // The JWT is already in the HTTP-only cookie at this point.
      const destination = location.state?.from || "/";
      navigate(destination, { replace: true });
      return;
    }

    // The account exists but the email is still unverified.
    if (result.requiresVerification) {
      navigate("/verify-email", {
        state: {
          email: result.email || form.email.trim().toLowerCase(),
          notice: result.message,
        },
      });
      return;
    }

    setServerError(result.message);
  };

  return (
    <div className="auth-shell">
      <div className="card">
        <h1>Log in</h1>
        <p className="muted">Welcome back.</p>

        <Alert type="success" message={notice} />
        <Alert message={serverError} />

        <form onSubmit={handleSubmit} noValidate>
          <div className="field">
            <label htmlFor="email">Email address</label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              value={form.email}
              onChange={handleChange}
              disabled={submitting}
            />
            {fieldErrors.email && (
              <span className="field-error">{fieldErrors.email}</span>
            )}
          </div>

          <div className="field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              value={form.password}
              onChange={handleChange}
              disabled={submitting}
            />
            {fieldErrors.password && (
              <span className="field-error">{fieldErrors.password}</span>
            )}
          </div>

          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? "Logging in…" : "Log in"}
          </button>
        </form>

        <p className="card-foot">
          <Link to="/forgot-password">Forgot password?</Link>
        </p>
        <p className="card-foot">
          Don&apos;t have an account? <Link to="/signup">Sign up</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
