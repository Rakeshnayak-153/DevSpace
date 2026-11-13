import React from 'react';

import { useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import api from "../api/axios.js";

export default function Settings() {
  const { user, setUser } = useAuth();

  const [form, setForm] = useState({
    name: user.name || "",
    bio: user.bio || "",
    avatarUrl: user.avatarUrl || "",
  });

  const [done, setDone] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = async (e) => {
    e.preventDefault();

    try {
      const { data } = await api.put("/users/me", form);
      setUser(data.user);
      setDone(true);
    } catch (error) {
      console.error("Profile update failed:", error);
      alert(error.response?.data?.message || "Profile update failed.");
    }
  };

  return (
    <main className="auth">
      <div className="auth-box wide">
        <h1>Profile settings</h1>

        <form onSubmit={handleSave}>
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Your name"
            required
          />

          <textarea
            name="bio"
            value={form.bio}
            maxLength={200}
            onChange={handleChange}
            placeholder="Short bio"
          />

          <input
            name="avatarUrl"
            value={form.avatarUrl}
            onChange={handleChange}
            placeholder="Avatar URL"
          />

          <button className="primary" type="submit">
            Save changes
          </button>

          {done && <p className="success">Profile updated.</p>}
        </form>
      </div>
    </main>
  );
}
