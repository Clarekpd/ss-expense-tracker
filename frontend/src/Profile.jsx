import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { authAPI } from "./api";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const res = await authAPI.getUser();
        if (mounted) setUser(res.data);
      } catch (err) {
        setError(err.response?.data?.error || "Failed to load profile");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();
    return () => (mounted = false);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    navigate("/login");
  };

  if (loading) return <div className="container mt-5">Loading profile…</div>;

  return (
    <div className="container mt-5 mb-5">
      <div className="card mx-auto" style={{ maxWidth: 640 }}>
        <div className="card-header">
          <h5 className="mb-0">Profile</h5>
        </div>
        <div className="card-body">
          {error && <div className="alert alert-danger">{error}</div>}

          {user ? (
            <div>
              <div className="mb-3">
                <strong>Username:</strong>
                <div className="mt-1">{user.username}</div>
              </div>

              <div className="mb-3">
                <strong>User ID:</strong>
                <div className="mt-1 text-muted small">{user.userId}</div>
              </div>

              <div className="d-flex gap-2">
                <button className="btn btn-secondary" onClick={() => navigate('/change-password')}>Change password</button>
                <button className="btn btn-outline-danger" onClick={handleLogout}>Logout</button>
                <button className="btn btn-outline-secondary ms-auto" onClick={() => navigate('/')}>Back to Dashboard</button>
              </div>
            </div>
          ) : (
            <div className="text-muted">No profile information available.</div>
          )}
        </div>
      </div>
    </div>
  );
}
