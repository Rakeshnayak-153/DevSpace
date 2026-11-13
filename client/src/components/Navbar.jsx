
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function Navbar() {
  const { user, logout } = useAuth();
  const nav = useNavigate();

  const handleLogout = () => {
    logout();
    nav("/");
  };

  return (
    <header className="nav">
      <Link className="brand" to="/">
        DevSpace
      </Link>

      <nav>
        <Link to="/tags">Tags</Link>

        {user ? (
          <>
            <Link to="/dashboard">Dashboard</Link>
            <Link to="/bookmarks">Bookmarks 🔖</Link>
            <Link className="btn" to="/editor/new">
              Write
            </Link>
            <button type="button" onClick={handleLogout}>
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link className="btn" to="/register">
              Get Started
            </Link>
          </>
        )}
      </nav>
    </header>
  );
}
