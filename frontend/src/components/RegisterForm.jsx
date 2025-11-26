import React, { useState } from "react";
import { register } from "../services/authService";
import VideoBackground from "../components/VideoBackground";

function RegisterForm() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "user",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    try {
      await register(form.name, form.email, form.password, form.role);
      setSuccess("Registration successful! You can now login.");
      setForm({ name: "", email: "", password: "", role: "user" });
    } catch (err) {
      setError(err.response?.data?.error || "Registration failed");
    }
  };

  return (
    <VideoBackground>
      // Modernized Register Form
      <div className="max-w-md mx-auto mt-10 p-8 border rounded-xl shadow-lg bg-white">
        <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">
          Create Account
        </h2>
        {error && (
          <p className="text-red-500 mb-4 text-center bg-red-50 p-2 rounded">
            {error}
          </p>
        )}
        {success && (
          <p className="text-green-500 mb-4 text-center bg-green-50 p-2 rounded">
            {success}
          </p>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <input
              type="text"
              name="name"
              placeholder="Full Name"
              value={form.name}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            />
          </div>

          <div className="relative">
            <input
              type="email"
              name="email"
              placeholder="Email Address"
              value={form.email}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            />
          </div>

          <div className="relative">
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            />
          </div>

          {/*default "user */}
          <button
            type="submit"
            className="w-full bg-linear-to-r from-blue-600 to-blue-700 text-white py-3 rounded-lg hover:from-blue-700 hover:to-blue-800 transition font-semibold shadow-md"
          >
            Register
          </button>
        </form>
      </div>
    </VideoBackground>
  );
}

export default RegisterForm;
