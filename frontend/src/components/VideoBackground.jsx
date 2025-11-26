import React from "react";

const VideoBackground = ({ children }) => {
  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Video */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute top-0 left-0 w-full h-full object-cover z-0"
      >
        <source src="/bgvideo.mp4" type="video/mp4" />
      </video>

      {/* Optional dark overlay */}
      <div className="absolute inset-0 bg-black/30 z-0"></div>

      {/* Content goes here */}
      <div className="relative z-10">{children}</div>
    </div>
  );
};

export default VideoBackground;
