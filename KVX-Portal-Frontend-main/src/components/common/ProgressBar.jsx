import { useState, useEffect } from "react";

const ProgressBar = ({
  value = 0,
  max = 100,
  label,
  showPercentage = true,
  color = "blue",
  size = "md",
  animated = true,
  className = "",
}) => {
  const [width, setWidth] = useState(0);
  const percentage = Math.min(Math.round((value / max) * 100), 100);

  useEffect(() => {
    if (animated) {
      const timer = setTimeout(() => setWidth(percentage), 100);
      return () => clearTimeout(timer);
    } else {
      setWidth(percentage);
    }
  }, [percentage, animated]);

  const colorClasses = {
    blue: "from-blue-500 to-blue-600",
    green: "from-emerald-500 to-emerald-600",
    purple: "from-purple-500 to-purple-600",
    orange: "from-orange-500 to-orange-600",
    red: "from-red-500 to-red-600",
    indigo: "from-indigo-500 to-indigo-600",
    amber: "from-amber-500 to-amber-600",
    pink: "from-pink-500 to-pink-600",
  };

  const bgColorClasses = {
    blue: "bg-blue-100",
    green: "bg-emerald-100",
    purple: "bg-purple-100",
    orange: "bg-orange-100",
    red: "bg-red-100",
    indigo: "bg-indigo-100",
    amber: "bg-amber-100",
    pink: "bg-pink-100",
  };

  const sizeClasses = {
    sm: "h-1.5",
    md: "h-2.5",
    lg: "h-4",
  };

  return (
    <div className={`w-full ${className}`}>
      {(label || showPercentage) && (
        <div className="flex items-center justify-between mb-1.5">
          {label && (
            <span className="text-sm font-medium text-gray-700">{label}</span>
          )}
          {showPercentage && (
            <span className="text-sm font-semibold text-gray-600">
              {percentage}%
            </span>
          )}
        </div>
      )}
      <div
        className={`w-full ${bgColorClasses[color] || bgColorClasses.blue} rounded-full overflow-hidden ${sizeClasses[size]}`}
      >
        <div
          className={`${sizeClasses[size]} bg-gradient-to-r ${colorClasses[color] || colorClasses.blue} rounded-full transition-all duration-700 ease-out`}
          style={{ width: `${width}%` }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;
