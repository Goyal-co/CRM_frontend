import React from 'react';

const VideoLoader = ({ 
  message = "Loading...", 
  className = "",
  size = "medium" 
}) => {
  const sizeClasses = {
    small: "w-64 h-64",
    medium: "w-96 h-96", 
    large: "w-[32rem] h-[32rem]",
    fullscreen: "w-full h-full"
  };

  return (
    <div className={`flex flex-col items-center justify-center p-8 ${className}`}>
      <div className={`${sizeClasses[size]} mb-4 rounded-lg overflow-hidden shadow-lg`}>
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover"
        >
          <source src="/vecteezy_excellent-sectoral-animations-from-each-other_29096767.mp4" type="video/mp4" />
          {/* Fallback for browsers that don't support video */}
          <div className="w-full h-full bg-gradient-to-r from-blue-400 to-purple-500 animate-pulse rounded-lg flex items-center justify-center">
            <div className="text-white text-xl font-semibold">Loading...</div>
          </div>
        </video>
      </div>
      <p className="text-gray-600 text-lg font-medium animate-pulse">{message}</p>
    </div>
  );
};

export default VideoLoader;
