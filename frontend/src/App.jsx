import { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";
import Navigation from "./components/Navigation";
import Login from "./Login";
import Register from "./Register";
import Dashboard from "./Dashboard";
import ExpenseManager from "./ExpenseManager";

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

  return (
    <Router>
      {isLoggedIn && <Navigation username={username} onLogout={handleLogout} />}
      <Routes>
        <Route path="/login" element={!isLoggedIn ? <Login onLogin={handleLogin} /> : <Navigate to="/" />} />
        <Route path="/register" element={!isLoggedIn ? <Register onLogin={handleLogin} /> : <Navigate to="/" />} />
        <Route path="/" element={isLoggedIn ? <Dashboard /> : <Navigate to="/login" />} />
        <Route path="/expenses" element={isLoggedIn ? <ExpenseManager /> : <Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;
