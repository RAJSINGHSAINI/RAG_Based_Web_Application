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
    <div className="page">
      <div className="card">
        <div className="card-head">
          <h1>Profile</h1>
          {!editing && (
            <button type="button" className="btn btn-ghost" onClick={startEditing}>
              Edit
            </button>
          )}
        </div>

        <Alert type="success" message={notice} />
        <Alert message={error} />

        <form onSubmit={handleSave} noValidate>
          <div className="field">
            <label htmlFor="fullName">Full name</label>
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
            />
            {fieldError && <span className="field-error">{fieldError}</span>}
          </div>

          <div className="field">
            <label htmlFor="email">Email</label>
            <input id="email" type="email" value={user?.email || ""} readOnly />
            <span className="hint">
              Changing your email needs a code sent to the new address.
            </span>
          </div>

          <div className="field">
            <span className="label-text">Status</span>
            <p>
              <span className={`badge ${user?.isVerified ? "badge-ok" : "badge-warn"}`}>
                {user?.isVerified ? "Verified" : "Not verified"}
              </span>
            </p>
          </div>

          {editing && (
            <div className="button-row">
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? "Saving…" : "Save changes"}
              </button>
              <button
                type="button"
                className="btn btn-ghost"
                onClick={cancelEditing}
                disabled={saving}
              >
                Cancel
              </button>
            </div>
          )}
        </form>

        {!editing && (
          <div className="button-row">
            {!user?.isVerified && (
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleVerifyEmail}
                disabled={sendingOtp}
              >
                {sendingOtp ? "Sending code…" : "Verify email"}
              </button>
            )}
            <button
              type="button"
              className="btn btn-ghost"
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
