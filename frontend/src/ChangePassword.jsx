import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authAPI } from "./api";

export default function ChangePassword() {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!oldPassword || !newPassword || !confirmPassword) {
      setError("All fields are required");
      return;
    }

    if (newPassword.length < 6) {
      setError("New password must be at least 6 characters");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("New password and confirmation do not match");
      return;
    }

    setLoading(true);
    try {
      await authAPI.changePassword(oldPassword, newPassword);
      setSuccess("Password changed — you'll need to sign in again.");
      // Clear local token and force re-login
      localStorage.removeItem("token");
      localStorage.removeItem("username");
      setTimeout(() => navigate("/login"), 1200);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to change password");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-5 mb-5">
      <div className="card mx-auto" style={{ maxWidth: 540 }}>
        <div className="card-header">
          <h5 className="mb-0">Change Password</h5>
        </div>
        <div className="card-body">
          {error && <div className="alert alert-danger">{error}</div>}
          {success && <div className="alert alert-success">{success}</div>}

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label">Current password</label>
              <input type="password" className="form-control" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} />
            </div>
            <div className="mb-3">
              <label className="form-label">New password</label>
              <input type="password" className="form-control" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
            </div>
            <div className="mb-3">
              <label className="form-label">Confirm new password</label>
              <input type="password" className="form-control" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
            </div>

            <div className="d-flex gap-2">
              <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Saving...' : 'Change Password'}</button>
              <button type="button" className="btn btn-outline-secondary" onClick={() => navigate('/')} >Cancel</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
