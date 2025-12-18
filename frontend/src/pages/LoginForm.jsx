import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../services/authService";
import { SessionContext } from "../services/SessionContext";
import VideoBackground from "../components/VideoBackground";

function LoginForm() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login: contextLogin } = useContext(SessionContext);
  const navigate = useNavigate();

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

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
        setSuccess("Welcome back! Entering jungle...");
        setTimeout(() => navigate("/dashboard"), 1000);
      }
    } catch (err) {
      setError(err.response?.data?.error || "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <VideoBackground>
      <div className="flex items-center justify-center min-h-screen px-4 font-poppins">
        {/* Glassmorphism Card */}
        <div className="max-w-md w-full bg-white/10 backdrop-blur-xl p-10 rounded-[2.5rem] shadow-2xl relative z-10 border border-white/20">
          {/* Logo & Header */}
          <div className="flex flex-col items-center mb-10">
            <div className="w-23 h-23 rounded-3xl flex items-center justify-center  transform hover:rotate-12 transition-transform duration-300">
              <img
                src="/logoSmartPlantCareNoText.PNG"
                alt="Logo"
                className="w-23 h-auto"
              />
            </div>
            <h2 className="text-3xl font-black text-white tracking-tight text-center">
              Welcome Back.
            </h2>
            <p className="text-green-100/60 text-sm mt-1 font-medium italic">
              Your plants missed you!
            </p>
          </div>

          {/* Alert Messages */}
          {error && (
            <div className="mb-6 bg-red-500/20 border border-red-500/50 text-red-200 text-xs font-bold py-3 px-4 rounded-2xl text-center animate-shake">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-6 bg-green-500/20 border border-green-500/50 text-green-200 text-xs font-bold py-3 px-4 rounded-2xl text-center">
              🌿 {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="group">
              <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-green-300 mb-2 ml-1">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
                className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-green-400 text-white placeholder-white/20 transition-all focus:bg-white/10"
                placeholder="hello@plantcare.com"
              />
            </div>

            <div className="group">
              <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-green-300 mb-2 ml-1">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                required
                className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-green-400 text-white placeholder-white/20 transition-all focus:bg-white/10"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-linear-to-r from-green-400 to-green-600 text-white py-4 rounded-2xl hover:from-green-500 hover:to-green-700 transform hover:-translate-y-1 transition-all duration-300 font-black uppercase tracking-widest text-xs shadow-[0_10px_20px_rgba(74,222,128,0.2)] cursor-pointer active:scale-95 disabled:opacity-50"
            >
              {isLoading ? "Verifying..." : "Sign In"}
            </button>
          </form>

          {/* Footer Navigation */}
          <div className="mt-10 text-center">
            <p className="text-white/40 text-xs font-medium">
              Don't have an account?{" "}
              <a
                href="/register"
                className="text-green-400 hover:text-green-300 font-black transition-colors ml-1 uppercase tracking-tighter"
              >
                Create Account
              </a>
            </p>
          </div>
        </div>
      </div>
    </VideoBackground>
  );
}

export default LoginForm;
