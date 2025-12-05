import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { authAPI } from "./api";
import "./Auth.css";

export default function Login({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await authAPI.login(username, password);
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("username", response.data.username);
      onLogin(response.data.token, response.data.username);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.error || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="container d-flex justify-content-center align-items-center min-vh-100">
        <div className="card shadow-lg auth-card">
          <div className="card-body p-5">
            <h2 className="card-title text-center mb-4 fw-bold">Expense Tracker</h2>
            <h5 className="text-center text-muted mb-4">Login to your account</h5>

            {error && (
              <div className="alert alert-danger alert-dismissible fade show" role="alert">
                {error}
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setError("")}
                ></button>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label htmlFor="username" className="form-label">
                  Username
                </label>
                <input
                  id="username"
                  type="text"
                  className="form-control form-control-lg"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>

              <div className="mb-3">
                <label htmlFor="password" className="form-label">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  className="form-control form-control-lg"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-lg w-100 mb-3"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                    Logging in...
                  </>
                ) : (
                  "Login"
                )}
              </button>
            </form>

            <hr />

            <p className="text-center text-muted">
              Don't have an account?{" "}
              <Link to="/register" className="text-decoration-none fw-bold">
                Register here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
