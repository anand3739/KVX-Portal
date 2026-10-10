import { useState, useEffect, useRef } from "react";
import { ArrowUp, ArrowDown } from "lucide-react";

const StatCard = ({
  title,
  value,
  change,
  icon: Icon,
  color = "blue",
  trend = "up",
  subtitle,
  onClick,
  loading = false,
  sparkData,
}) => {
  const [displayValue, setDisplayValue] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);
  const cardRef = useRef(null);

  const colorClasses = {
    blue: "from-blue-500 to-blue-600",
    green: "from-green-500 to-green-600",
    purple: "from-purple-500 to-purple-600",
    orange: "from-orange-500 to-orange-600",
    red: "from-red-500 to-red-600",
    indigo: "from-indigo-500 to-indigo-600",
  };

  const sparkColors = {
    blue: "#3b82f6",
    green: "#10b981",
    purple: "#8b5cf6",
    orange: "#f97316",
    red: "#ef4444",
    indigo: "#6366f1",
  };

  // Animated count-up for numeric values
  useEffect(() => {
    if (hasAnimated || loading) return;
    const numericValue = typeof value === "number" ? value : parseFloat(value);
    if (isNaN(numericValue)) {
      setDisplayValue(value);
      setHasAnimated(true);
      return;
    }

    const duration = 800;
    const steps = 30;
    const increment = numericValue / steps;
    let current = 0;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      current = Math.min(current + increment, numericValue);
      setDisplayValue(
        Number.isInteger(numericValue)
          ? Math.round(current)
          : Math.round(current * 10) / 10
      );
      if (step >= steps) {
        setDisplayValue(numericValue);
        setHasAnimated(true);
        clearInterval(timer);
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [value, loading, hasAnimated]);

  // Render sparkline SVG
  const renderSparkline = () => {
    if (!sparkData || sparkData.length < 2) return null;
    const width = 80;
    const height = 28;
    const max = Math.max(...sparkData);
    const min = Math.min(...sparkData);
    const range = max - min || 1;

    const points = sparkData
      .map((d, i) => {
        const x = (i / (sparkData.length - 1)) * width;
        const y = height - ((d - min) / range) * height;
        return `${x},${y}`;
      })
      .join(" ");

    return (
      <svg width={width} height={height} className="mt-2 opacity-60">
        <polyline
          fill="none"
          stroke={sparkColors[color] || sparkColors.blue}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={points}
        />
      </svg>
    );
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-soft p-6 animate-pulse">
        <div className="flex items-start justify-between mb-4">
          <div className="h-12 w-12 bg-gray-200 rounded-xl" />
          <div className="h-6 w-16 bg-gray-200 rounded-full" />
        </div>
        <div className="h-4 w-24 bg-gray-200 rounded mb-2" />
        <div className="h-8 w-16 bg-gray-200 rounded" />
      </div>
    );
  }

  return (
    <div
      ref={cardRef}
      onClick={onClick}
      className={`bg-white rounded-2xl shadow-soft p-6 hover:shadow-medium transition-all duration-200 group ${
        onClick ? "cursor-pointer" : ""
      }`}
    >
      <div className="flex items-start justify-between mb-4">
        <div
          className={`p-3 bg-gradient-to-br ${colorClasses[color]} rounded-xl text-white shadow-lg`}
        >
          <Icon className="h-6 w-6" />
        </div>
        {change !== undefined && (
          <div
            className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium
            ${trend === "up" ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"}`}
          >
            {trend === "up" ? (
              <ArrowUp className="h-3 w-3" />
            ) : (
              <ArrowDown className="h-3 w-3" />
            )}
            <span>{change}%</span>
          </div>
        )}
      </div>

      <h3 className="text-sm font-medium text-gray-500 mb-1">{title}</h3>
      <div className="flex items-end justify-between">
        <p className="text-2xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
          {typeof displayValue === "number" ? displayValue.toLocaleString() : value}
        </p>
        {renderSparkline()}
      </div>
      {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
    </div>
  );
};

export default StatCard;