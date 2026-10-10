import { useState, useEffect } from "react";
import { Briefcase } from "lucide-react";

const TIPS = [
  "Tip: Use Quick Actions in the header for fast access",
  "Tip: Press ESC to close any modal dialog",
  "Tip: Click column headers to sort table data",
  "Tip: Export your data to CSV with the download button",
  "Tip: Check your notifications for important updates",
  "Tip: Use breadcrumbs to navigate between pages",
  "Tip: Your dashboard updates in real-time",
];

const LoadingScreen = () => {
  const [tipIndex, setTipIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  // Cycle tips
  useEffect(() => {
    const interval = setInterval(() => {
      setTipIndex((prev) => (prev + 1) % TIPS.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Simulated progress
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) return prev;
        return prev + Math.random() * 15;
      });
    }, 400);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center z-50">
      <div className="text-center max-w-sm">
        {/* Animated Logo */}
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full blur-xl opacity-30 animate-pulse" />
          <div className="relative h-24 w-24 mx-auto bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-2xl animate-bounce">
            <Briefcase className="h-12 w-12 text-white" />
          </div>
        </div>

        {/* Loading Text */}
        <h2 className="text-2xl font-bold text-gray-900 mb-2">KRAVIX TECH</h2>
        <p className="text-gray-500 mb-6">Enterprise Portal</p>

        {/* Progress Bar */}
        <div className="w-64 mx-auto mb-2">
          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-600 to-purple-600 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
          <p className="text-xs text-gray-400 mt-2">
            {Math.round(Math.min(progress, 100))}%
          </p>
        </div>

        {/* Loading Dots */}
        <div className="flex justify-center space-x-2 mt-4 mb-6">
          <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" />
          <div
            className="w-2 h-2 bg-purple-600 rounded-full animate-pulse"
            style={{ animationDelay: "75ms" }}
          />
          <div
            className="w-2 h-2 bg-pink-600 rounded-full animate-pulse"
            style={{ animationDelay: "150ms" }}
          />
        </div>

        {/* Rotating Tips */}
        <div className="h-5">
          <p
            key={tipIndex}
            className="text-xs text-gray-400 animate-fadeIn"
          >
            {TIPS[tipIndex]}
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;