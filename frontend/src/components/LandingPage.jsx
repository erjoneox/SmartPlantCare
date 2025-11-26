import React from "react";
import { motion } from "framer-motion";
import VideoBackground from "../components/VideoBackground";

function LandingPage() {
  return (
    <VideoBackground>
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
          <div className="text-center mb-10 flex flex-col items-center justify-between h-96">
            <img
              src="/logoSmartPlantCare.png"
              alt="SmartPlantCare Logo"
              className="w-56 lg:w-56 rounded-2xl transition-transform duration-500 hover:scale-110 cursor-pointer"
              style={{
                filter: `
          drop-shadow(2px 0 0 white)
          drop-shadow(-2px 0 0 white)
          drop-shadow(0 2px 0 white)
          drop-shadow(0 -2px 0 white)
        `,
              }}
            />
            <h1
              className="text-4xl font-extrabold text-white cursor-pointer 
             transition-transform duration-300 hover:scale-105 animate-fade-up"
              style={{
                filter: `
      drop-shadow(2px 2px 0 green)
      drop-shadow(-2px -2px 0 green)
    `,
              }}
            >
              SmartPlantCare
            </h1>

            <p
              className="text-lg text-gray-200 mt-2 drop-shadow cursor-pointer
              transition-colors duration-300 hover:text-white animate-fade-up [animation-delay:.2s]"
            >
              Intelligent Plant Monitoring & Care System
            </p>

            <button
              className="mt-6 px-6 py-3 bg-green-500 hover:bg-green-600 text-white 
                   rounded-full cursor-pointer shadow-lg transition-transform duration-300 
                   hover:scale-110 hover:shadow-2xl animate-fade-up [animation-delay:.4s]"
            >
              Explore Demo
            </button>
          </div>
        </div>
      </div>
    </VideoBackground>
  );
}

export default LandingPage;
