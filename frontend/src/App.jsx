import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";
import Navigation from "./components/Navigation";
import { authAPI } from "./api";
import Login from "./Login";
import Register from "./Register";
import Dashboard from "./Dashboard";
import ExpenseManager from "./ExpenseManager";
import ChangePassword from "./ChangePassword";
import Profile from "./Profile";

function App() {
  const [token, setToken] = useState(() => localStorage.getItem("token"));
  const [username, setUsername] = useState(() => localStorage.getItem("username"));

  const handleLogin = (newToken, newUsername) => {
    localStorage.setItem("token", newToken);
    localStorage.setItem("username", newUsername);
    setToken(newToken);
    setUsername(newUsername);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    setToken(null);
    setUsername(null);
  };

  const isLoggedIn = !!token;

  // When the app boots and we have a token but not a username, try fetching the
  // user profile so UI components like Navigation have the correct username.
  useEffect(() => {
    let mounted = true;
    if (!token) return; // nothing to fetch

    // If we already have a username stored, don't refetch immediately
    if (username) return;

    (async () => {
      try {
        const res = await authAPI.getUser();
        if (!mounted) return;
        if (res?.data?.username) {
          setUsername(res.data.username);
          localStorage.setItem("username", res.data.username);
        }
      } catch (err) {
        // token may be invalid/expired — clear auth and let route protection redirect
        console.warn("Failed to load user profile, clearing local auth state", err?.response?.data || err?.message);
        localStorage.removeItem("token");
        localStorage.removeItem("username");
        if (mounted) {
          setToken(null);
          setUsername(null);
        }
      }
    })();

    return () => (mounted = false);
  }, [token]);

  return (
    <Router>
      {/* Global guard: if any button is clicked while not logged in, send user to /login */}
      <AuthClickGuard isLoggedIn={isLoggedIn} />
      {isLoggedIn && <Navigation username={username} onLogout={handleLogout} />}
      <Routes>
        <Route path="/login" element={!isLoggedIn ? <Login onLogin={handleLogin} /> : <Navigate to="/" />} />
        <Route path="/register" element={!isLoggedIn ? <Register onLogin={handleLogin} /> : <Navigate to="/" />} />
        <Route path="/" element={isLoggedIn ? <Dashboard /> : <Navigate to="/login" />} />
        <Route path="/expenses" element={isLoggedIn ? <ExpenseManager /> : <Navigate to="/login" />} />
        <Route path="/change-password" element={isLoggedIn ? <ChangePassword /> : <Navigate to="/login" />} />
        <Route path="/profile" element={isLoggedIn ? <Profile /> : <Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

function AuthClickGuard({ isLoggedIn }) {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handler = (e) => {
      if (isLoggedIn) return;
      // Only handle real button clicks (includes buttons inside forms)
      const btn = e.target.closest && e.target.closest("button");
      if (!btn) return;
      // If we're already on login/register, do nothing
      if (location.pathname === "/login" || location.pathname === "/register") return;
      navigate("/login");
    };

    document.addEventListener("click", handler, true);
    return () => document.removeEventListener("click", handler, true);
  }, [isLoggedIn, location.pathname, navigate]);

  return null;
}

export default App;
