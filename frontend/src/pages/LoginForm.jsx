import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../services/authService";
import { SessionContext } from "../services/SessionContext";
import VideoBackground from "../components/VideoBackground";

function LoginForm() {
  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login: contextLogin } = useContext(SessionContext);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsLoading(true);
    try {
      const response = await login(form.email, form.password);
      if (response.token) {
        const userData = {
          id: response.user.userId,
          email: response.user.email,
          name: response.user.name,
        };
        contextLogin(userData, response.token);
        setSuccess("Login successful!");
        setTimeout(() => {
          navigate("/dashboard");
        }, 1000);
      }
    } catch (err) {
      setError(err.response?.data?.error || "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <VideoBackground>
      <div className="max-w-md mx-auto mt-10 p-8 border rounded-xl shadow-lg bg-white">
        <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">
          Welcome Back
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
              type="email"
              name="email"
              placeholder="Email Address"
              value={form.email}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
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
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-800 transition font-semibold shadow-md cursor-pointer"
          >
            {isLoading ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    </VideoBackground>
  );
}

export default LoginForm;
