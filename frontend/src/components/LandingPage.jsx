import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import VideoBackground from "../components/VideoBackground";

function LandingPage() {
  const navigate = useNavigate();

  return (
    <VideoBackground>
      <div className="absolute inset-0 bg-black/40 z-0"></div>

      <div className="relative z-10 min-h-screen flex flex-col font-poppins">
        {/* --- HERO SECTION --- */}
        <div className="flex-1 flex flex-col items-center justify-center text-center px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-3xl"
          >
            <span className="inline-block px-4 py-1.5 bg-green-500/20 border border-green-400/30 rounded-full text-green-300 text-[10px] font-black uppercase tracking-[0.3em] mb-6">
              The Future of Indoor Gardening
            </span>

            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-white leading-[1.1] tracking-tight mb-8">
              Grow smarter, <br />
              <span className="text-transparent bg-clip-text bg-linear-to-r from-green-300 to-lime-300">
                not harder.
              </span>
            </h1>

            <p className="text-lg md:text-xl text-green-50/70 font-medium max-w-2xl mx-auto mb-10 leading-relaxed">
              Automate your plant care with real-time monitoring and intelligent
              data. Your indoor jungle deserves premium attention.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={() => navigate("/register")}
                className="w-full sm:w-auto px-10 py-5 bg-green-500 hover:bg-green-400 text-white font-black uppercase tracking-widest text-xs rounded-2xl shadow-[0_20px_40px_rgba(34,197,94,0.3)] transition-all hover:-translate-y-1 active:scale-95 cursor-pointer"
              >
                Get Started Free
              </button>
            </div>
          </motion.div>
        </div>

        {/* --- BOTTOM STATS --- */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-8 px-8 py-12 max-w-5xl mx-auto w-full border-t border-white/10 mt-10"
        >
          {[
            { label: "Active Users", val: "10k+" },
            { label: "Plants Saved", val: "50k+" },
            { label: "Accuracy", val: "99.9%" },
            { label: "Success Rate", val: "100%" },
          ].map((stat, i) => (
            <div key={i} className="text-center">
              <p className="text-white text-2xl font-black">{stat.val}</p>
              <p className="text-green-400 text-[10px] font-bold uppercase tracking-widest mt-1">
                {stat.label}
              </p>
            </div>
          ))}
        </motion.div>
      </div>
    </VideoBackground>
  );
}

export default LandingPage;
