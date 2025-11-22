import React from "react";
import { motion } from "framer-motion";

function LandingPage() {
  return (
    <div className="relative min-h-screen overflow-hidden">
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute top-0 left-0 w-full h-full object-cover z-0"
      >
        <source src="/bgvideo.mp4" type="video/mp4" />
      </video>

      <div className="absolute inset-0 bg-black/30 z-0"></div>

      <div className="relative z-10 bg-transparent flex flex-row items-center justify-around px-6 min-h-screen ">
        <div className="text-center mb-10">
          <img
            src="/logoSmartPlantCare.png"
            alt="SmartPlantCare Logo"
            className="w-72 lg:w-96 rounded-2xl transition-transform duration-500 hover:scale-110 cursor-pointer"
            style={{
              filter: `
          drop-shadow(2px 0 0 white)
          drop-shadow(-2px 0 0 white)
          drop-shadow(0 2px 0 white)
          drop-shadow(0 -2px 0 white)
        `,
            }}
          />
          <h1 className="text-4xl font-extrabold text-white drop-shadow-lg cursor-pointer">
            SmartPlantCare
          </h1>

          <p className="text-lg text-gray-200 mt-2 drop-shadow cursor-pointer">
            Intelligent Plant Monitoring & Care System
          </p>

          <button className="mt-6 px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-full shadow-lg transition cursor-pointer">
            Explore Demo
          </button>
        </div>
      </div>
    </div>
  );
}

export default LandingPage;
