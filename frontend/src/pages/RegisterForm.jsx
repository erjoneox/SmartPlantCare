import React, { useState } from "react";
import { register } from "../services/authService";
import VideoBackground from "../components/VideoBackground";

function RegisterForm() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "user",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      await register(form.name, form.email, form.password, form.role);
      setSuccess("Account created! Welcome to the jungle.");
      setForm({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        role: "user",
      });
    } catch (err) {
      setError(err.response?.data?.error || "Registration failed");
    }
  };

  return (
    <VideoBackground>
      <div className="flex items-center justify-center min-h-screen px-4 font-poppins">
        {/* Main Card */}
        <div className="max-w-md w-full bg-white/10 backdrop-blur-xl p-10 rounded-[2.5rem] shadow-2xl relative z-10 border border-white/20">
          {/* Logo Section */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-23 h-23 rounded-3xl flex items-center justify-center  transform hover:rotate-12 transition-transform duration-300">
              <img
                src="/logoSmartPlantCareNoText.PNG"
                alt="Logo"
                className="w-23 h-auto"
              />
            </div>
            <h2 className="text-3xl font-black text-white tracking-tight text-center">
              Grow with us.
            </h2>
            <p className="text-green-100/60 text-sm mt-1 font-medium italic">
              Start your digital garden today
            </p>
          </div>

          {/* Feedback Messages */}
          {error && (
            <div className="mb-6 bg-red-500/20 border border-red-500/50 text-red-200 text-xs font-bold py-3 px-4 rounded-2xl animate-pulse text-center">
              ⚠️ {error}
            </div>
          )}

          {success && (
            <div className="mb-6 bg-green-500/20 border border-green-500/50 text-green-200 text-xs font-bold py-3 px-4 rounded-2xl text-center">
              🌱 {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="group">
              <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-green-300 mb-2 ml-1">
                Full Name
              </label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                className="w-full px-5 py-3.5 bg-white/5 border border-white/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-green-400 text-white placeholder-white/30 transition-all focus:bg-white/10"
                placeholder="John Doe"
              />
            </div>

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
                className="w-full px-5 py-3.5 bg-white/5 border border-white/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-green-400 text-white placeholder-white/30 transition-all focus:bg-white/10"
                placeholder="john@example.com"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-green-300 mb-2 ml-1">
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  required
                  className="w-full px-5 py-3.5 bg-white/5 border border-white/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-green-400 text-white placeholder-white/30 transition-all focus:bg-white/10"
                  placeholder="••••••"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-green-300 mb-2 ml-1">
                  Confirm
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  required
                  className="w-full px-5 py-3.5 bg-white/5 border border-white/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-green-400 text-white placeholder-white/30 transition-all focus:bg-white/10"
                  placeholder="••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-linear-to-r from-green-400 to-green-600 text-white py-4 rounded-2xl hover:from-green-500 hover:to-green-700 transform hover:-translate-y-1 transition-all duration-300 font-black uppercase tracking-widest text-xs shadow-[0_10px_20px_rgba(74,222,128,0.3)] cursor-pointer active:scale-95 mt-4"
            >
              Create Account
            </button>
          </form>

          {/* Footer Link */}
          <div className="mt-8 text-center">
            <p className="text-white/50 text-xs font-medium">
              Already a member?{" "}
              <a
                href="/login"
                className="text-green-400 hover:text-green-300 font-black transition-colors ml-1"
              >
                SIGN IN
              </a>
            </p>
          </div>
        </div>
      </div>
    </VideoBackground>
  );
}

export default RegisterForm;
