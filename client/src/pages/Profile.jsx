import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import Alert from "../components/Alert.jsx";

const Profile = () => {
  const { user, updateProfile, resendVerificationOtp } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [editing, setEditing] = useState(false);
  const [fullName, setFullName] = useState(user?.fullName || "");
  const [fieldError, setFieldError] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState(location.state?.notice || "");
  const [saving, setSaving] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);

  // Keep the input in step with context after an update elsewhere.
  useEffect(() => {
    if (!editing) setFullName(user?.fullName || "");
  }, [user?.fullName, editing]);

  const startEditing = () => {
    setEditing(true);
    setError("");
    setNotice("");
  };

  const cancelEditing = () => {
    setEditing(false);
    setFullName(user?.fullName || "");
    setFieldError("");
    setError("");
  };

  const handleSave = async (event) => {
    event.preventDefault();

    if (!fullName.trim()) {
      setFieldError("Full name is required");
      return;
    }
    if (fullName.trim().length < 2) {
      setFieldError("Full name must be at least 2 characters");
      return;
    }

    setFieldError("");
    setError("");
    setSaving(true);
    const result = await updateProfile({ fullName: fullName.trim() });
    setSaving(false);

    if (!result.success) {
      setError(result.message);
      return;
    }

    // Context already holds the new user, so the navbar updates too.
    setEditing(false);
    setNotice(result.message);
  };

  // Sends a fresh code, then hands over to the shared verification screen.
  const handleVerifyEmail = async () => {
    setError("");
    setNotice("");
    setSendingOtp(true);
    const result = await resendVerificationOtp(user.email);
    setSendingOtp(false);

    if (!result.success) {
      setError(result.message);
      return;
    }

    navigate("/verify-email", {
      state: { email: user.email, notice: result.message },
    });
  };

  return (
    <div className="w-full max-w-3xl px-4 py-8 sm:px-6">
      <div className="rounded-3xl border border-slate-200/80 bg-white/80 p-5 shadow-[0_18px_45px_rgba(15,23,42,0.10)] backdrop-blur-xl dark:border-slate-700 dark:bg-slate-900/80 dark:shadow-[0_20px_50px_rgba(2,6,23,0.7)] sm:p-7">
        <div className="mb-5 flex items-start justify-between gap-3">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Profile</h1>
          {!editing && (
            <button type="button" className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:hover:bg-slate-800" onClick={startEditing}>
              Edit
            </button>
          )}
        </div>

        <div className="space-y-3">
          <Alert type="success" message={notice} />
          <Alert message={error} />
        </div>

        <form onSubmit={handleSave} noValidate className="mt-5 space-y-4">
          <div className="space-y-2">
            <label htmlFor="fullName" className="block text-sm font-semibold text-slate-700 dark:text-slate-200">Full name</label>
            <input
              id="fullName"
              type="text"
              value={fullName}
              onChange={(event) => {
                setFullName(event.target.value);
                setFieldError("");
              }}
              readOnly={!editing}
              disabled={saving}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-slate-900 focus:border-indigo-400 focus:outline-none focus:ring-4 focus:ring-indigo-100 disabled:cursor-not-allowed disabled:opacity-70 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:ring-indigo-500/20"
            />
            {fieldError && <span className="block text-sm text-rose-600 dark:text-rose-400">{fieldError}</span>}
          </div>

          <div className="space-y-2">
            <label htmlFor="email" className="block text-sm font-semibold text-slate-700 dark:text-slate-200">Email</label>
            <input id="email" type="email" value={user?.email || ""} readOnly className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-slate-600 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300" />
            <span className="block text-xs text-slate-500 dark:text-slate-400">
              Changing your email needs a code sent to the new address.
            </span>
          </div>

          <div className="space-y-2">
            <span className="block text-sm font-semibold text-slate-700 dark:text-slate-200">Status</span>
            <p>
              <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${user?.isVerified ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300" : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300"}`}>
                {user?.isVerified ? "Verified" : "Not verified"}
              </span>
            </p>
          </div>

          {editing && (
            <div className="flex flex-col gap-3 sm:flex-row">
              <button type="submit" className="flex-1 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 px-4 py-3 text-sm font-semibold text-white shadow-[0_12px_25px_rgba(79,70,229,0.3)] transition hover:translate-y-[-1px] disabled:cursor-not-allowed disabled:opacity-70" disabled={saving}>
                {saving ? "Saving…" : "Save changes"}
              </button>
              <button
                type="button"
                className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:hover:bg-slate-800"
                onClick={cancelEditing}
                disabled={saving}
              >
                Cancel
              </button>
            </div>
          )}
        </form>

        {!editing && (
          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            {!user?.isVerified && (
              <button
                type="button"
                className="flex-1 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 px-4 py-3 text-sm font-semibold text-white shadow-[0_12px_25px_rgba(79,70,229,0.3)] transition hover:translate-y-[-1px] disabled:cursor-not-allowed disabled:opacity-70"
                onClick={handleVerifyEmail}
                disabled={sendingOtp}
              >
                {sendingOtp ? "Sending code…" : "Verify email"}
              </button>
            )}
            <button
              type="button"
              className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:hover:bg-slate-800"
              onClick={() => navigate("/change-email")}
            >
              Change email
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
