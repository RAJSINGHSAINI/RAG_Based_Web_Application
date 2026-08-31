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
    <div className="flex min-h-[70vh] items-center justify-center px-4 py-8 sm:px-6">
      <div className="w-full max-w-md rounded-2xl border border-slate-200/80 bg-white/80 p-5 shadow-[0_18px_45px_rgba(15,23,42,0.10)] backdrop-blur-xl dark:border-slate-700 dark:bg-slate-900/80 dark:shadow-[0_20px_50px_rgba(2,6,23,0.7)] sm:p-7">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Forgot password</h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
          Enter the email on your account and we will send a 6-digit code.
        </p>

        <div className="mt-5">
          <Alert message={error} />
        </div>

        <form onSubmit={handleSubmit} noValidate className="mt-5 space-y-4">
          <div className="space-y-2">
            <label htmlFor="email" className="block text-sm font-semibold text-slate-700 dark:text-slate-200">Email address</label>
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
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-slate-900 placeholder:text-slate-400 focus:border-indigo-400 focus:outline-none focus:ring-4 focus:ring-indigo-100 disabled:cursor-not-allowed disabled:opacity-70 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:ring-indigo-500/20"
            />
            {fieldError && <span className="block text-sm text-rose-600 dark:text-rose-400">{fieldError}</span>}
          </div>

          <button
            type="submit"
            className="w-full rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 px-4 py-3 text-sm font-semibold text-white shadow-[0_12px_25px_rgba(79,70,229,0.3)] transition hover:translate-y-[-1px] disabled:cursor-not-allowed disabled:opacity-70"
            disabled={submitting}
          >
            {submitting ? "Sending code…" : "Send code"}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-slate-600 dark:text-slate-300">
          <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-300 dark:hover:text-indigo-200">Back to login</Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;
