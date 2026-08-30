import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import Alert from "../components/Alert.jsx";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const Signup = () => {
  const { signup } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
    setFieldErrors((previous) => ({ ...previous, [name]: "" }));
    setServerError("");
  };

  // Fast feedback only. The server runs the same rules again, because a form
  // is not a security boundary.
  const validate = () => {
    const errors = {};

    if (!form.fullName.trim()) errors.fullName = "Full name is required";
    else if (form.fullName.trim().length < 2)
      errors.fullName = "Full name must be at least 2 characters";

    if (!form.email.trim()) errors.email = "Email address is required";
    else if (!EMAIL_PATTERN.test(form.email.trim()))
      errors.email = "Enter a valid email address";

    if (!form.password) errors.password = "Password is required";
    else if (form.password.length < 8)
      errors.password = "Password must be at least 8 characters";

    if (!form.confirmPassword)
      errors.confirmPassword = "Confirm your password";
    else if (form.password !== form.confirmPassword)
      errors.confirmPassword = "Passwords do not match";

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    const result = await signup(form);
    setSubmitting(false);

    if (!result.success) {
      setServerError(result.message);
      return;
    }

    // Signup does not log anyone in — the email has to be verified first.
    navigate("/verify-email", {
      replace: true,
      state: { email: form.email.trim().toLowerCase(), notice: result.message },
    });
  };

  return (
    <div className="auth-shell">
      <div className="card">
        <h1>Create your account</h1>
        <p className="muted">
          We will email you a 6-digit code to confirm your email address.
        </p>

        <Alert message={serverError} />

        <form onSubmit={handleSubmit} noValidate>
          <div className="field">
            <label htmlFor="fullName">Full name</label>
            <input
              id="fullName"
              name="fullName"
              type="text"
              autoComplete="name"
              value={form.fullName}
              onChange={handleChange}
              disabled={submitting}
            />
            {fieldErrors.fullName && (
              <span className="field-error">{fieldErrors.fullName}</span>
            )}
          </div>

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
            <label htmlFor="confirmPassword">Confirm password</label>
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
            {submitting ? "Creating account…" : "Create account"}
          </button>
        </form>

        <p className="card-foot">
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
