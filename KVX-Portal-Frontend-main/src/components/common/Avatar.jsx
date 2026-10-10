const Avatar = ({
  name,
  src,
  size = "md",
  status,
  color,
  className = "",
}) => {
  const sizeClasses = {
    xs: "h-6 w-6 text-[10px]",
    sm: "h-8 w-8 text-xs",
    md: "h-10 w-10 text-sm",
    lg: "h-12 w-12 text-base",
    xl: "h-16 w-16 text-lg",
  };

  const statusDotSizes = {
    xs: "h-1.5 w-1.5 border",
    sm: "h-2 w-2 border",
    md: "h-2.5 w-2.5 border-2",
    lg: "h-3 w-3 border-2",
    xl: "h-3.5 w-3.5 border-2",
  };

  const statusColors = {
    online: "bg-emerald-500",
    offline: "bg-gray-400",
    busy: "bg-red-500",
    away: "bg-amber-500",
  };

  const bgColors = {
    blue: "bg-gradient-to-br from-blue-500 to-blue-600",
    green: "bg-gradient-to-br from-emerald-500 to-emerald-600",
    purple: "bg-gradient-to-br from-purple-500 to-purple-600",
    orange: "bg-gradient-to-br from-orange-500 to-orange-600",
    red: "bg-gradient-to-br from-red-500 to-red-600",
    indigo: "bg-gradient-to-br from-indigo-500 to-indigo-600",
    amber: "bg-gradient-to-br from-amber-500 to-amber-600",
    gray: "bg-gradient-to-br from-gray-700 to-gray-900",
  };

  const getInitials = () => {
    if (!name) return "?";
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }
    return parts[0][0].toUpperCase();
  };

  // Deterministic color from name if not specified
  const getColor = () => {
    if (color) return bgColors[color] || bgColors.gray;
    if (!name) return bgColors.gray;
    const colorKeys = Object.keys(bgColors);
    const hash = name
      .split("")
      .reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return bgColors[colorKeys[hash % colorKeys.length]];
  };

  return (
    <div className={`relative inline-flex shrink-0 ${className}`}>
      {src ? (
        <img
          src={src}
          alt={name || "Avatar"}
          className={`${sizeClasses[size]} rounded-full object-cover ring-2 ring-white`}
          onError={(e) => {
            e.target.style.display = "none";
            e.target.nextSibling.style.display = "flex";
          }}
        />
      ) : null}
      <div
        className={`${sizeClasses[size]} rounded-full ${getColor()} flex items-center justify-center text-white font-semibold ring-2 ring-white`}
        style={src ? { display: "none" } : {}}
      >
        {getInitials()}
      </div>
      {status && (
        <span
          className={`absolute bottom-0 right-0 ${statusDotSizes[size]} ${statusColors[status] || statusColors.offline} border-white rounded-full`}
        />
      )}
    </div>
  );
};

export default Avatar;
