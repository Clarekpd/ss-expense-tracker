import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { authAPI } from "./api";
import "./Auth.css";

export default function Register({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    try {
      await authAPI.signup(username, password);
      const loginResponse = await authAPI.login(username, password);
      localStorage.setItem("token", loginResponse.data.token);
      localStorage.setItem("username", loginResponse.data.username);
      onLogin(loginResponse.data.token, loginResponse.data.username);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.error || "Registration failed");
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
            <h5 className="text-center text-muted mb-4">Create a new account</h5>

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
                  placeholder="Choose a username"
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
                  placeholder="At least 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <div className="mb-3">
                <label htmlFor="confirmPassword" className="form-label">
                  Confirm Password
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  className="form-control form-control-lg"
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>

              <button
                type="submit"
                className="btn btn-success btn-lg w-100 mb-3"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                    Creating account...
                  </>
                ) : (
                  "Register"
                )}
              </button>
            </form>

            <hr />

            <p className="text-center text-muted">
              Already have an account?{" "}
              <Link to="/login" className="text-decoration-none fw-bold">
                Login here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
