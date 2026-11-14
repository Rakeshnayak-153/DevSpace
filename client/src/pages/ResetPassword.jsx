
import React, { useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../api/axios.js";
import { Auth } from "./Login.jsx";

export default function ResetPassword() {
  const { token } = useParams();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);

    try {
      const response = await api.post("/auth/reset-password", {
        token,
        password,
      });

      setMessage(response.data.message);
      setPassword("");
      setConfirmPassword("");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Password reset failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Auth
      title="Create New Password"
      subtitle="Choose a strong password for your DevSpace account."
    >
      <form onSubmit={submit}>
        {error && <div className="error">{error}</div>}
        {message && <div className="success">{message}</div>}

        {!message && (
          <>
            <input
              type="password"
              placeholder="New password (6+ characters)"
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <input
              type="password"
              placeholder="Confirm new password"
              minLength={6}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />

            <button className="primary" disabled={loading}>
              {loading ? "Updating..." : "Reset Password"}
            </button>
          </>
        )}

        {message && <p><Link to="/login">Go to Login</Link></p>}
      </form>
    </Auth>
  );
}
