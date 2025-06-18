"use client";
import { useState, useEffect } from "react";

const Loading = ({ fullScreen = true, message = "" }) => {
  const [currentLetter, setCurrentLetter] = useState(0);
  const letters = ["b", "d", "q", "p"];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentLetter((prev) => (prev + 1) % letters.length);
    }, 120);

    return () => clearInterval(interval);
  }, []);

  const baseClasses = "flex flex-col items-center justify-center";
  const containerClasses = fullScreen
    ? `${baseClasses} min-h-screen fixed inset-0 bg-white/95 z-50`
    : `${baseClasses} h-64`;

  return (
    <div className={containerClasses}>
      <div className="text-6xl font-bold text-gray-800 mb-4 font-mono">
        {letters[currentLetter]}
      </div>
      {message && <p className="text-gray-600 text-lg">{message}</p>}
    </div>
  );
};

export default Loading;
