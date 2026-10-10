const StatusBadge = ({ status, size = "md", className = "" }) => {
  const normalized = (status || "").toLowerCase().replace(/[\s_-]+/g, "");

  const variants = {
    // Green
    active: "bg-emerald-100 text-emerald-700",
    approved: "bg-emerald-100 text-emerald-700",
    completed: "bg-emerald-100 text-emerald-700",
    success: "bg-emerald-100 text-emerald-700",
    selected: "bg-emerald-100 text-emerald-700",
    paid: "bg-emerald-100 text-emerald-700",
    resolved: "bg-emerald-100 text-emerald-700",

    // Yellow / Amber
    pending: "bg-amber-100 text-amber-700",
    inprogress: "bg-amber-100 text-amber-700",
    review: "bg-amber-100 text-amber-700",
    processing: "bg-amber-100 text-amber-700",
    warning: "bg-amber-100 text-amber-700",
    onhold: "bg-amber-100 text-amber-700",

    // Red
    inactive: "bg-red-100 text-red-700",
    rejected: "bg-red-100 text-red-700",
    failed: "bg-red-100 text-red-700",
    overdue: "bg-red-100 text-red-700",
    terminated: "bg-red-100 text-red-700",
    cancelled: "bg-red-100 text-red-700",
    error: "bg-red-100 text-red-700",

    // Blue
    interview: "bg-blue-100 text-blue-700",
    shortlisted: "bg-blue-100 text-blue-700",
    scheduled: "bg-blue-100 text-blue-700",
    open: "bg-blue-100 text-blue-700",
    new: "bg-blue-100 text-blue-700",
    info: "bg-blue-100 text-blue-700",

    // Purple
    applied: "bg-purple-100 text-purple-700",
    draft: "bg-purple-100 text-purple-700",
    archived: "bg-purple-100 text-purple-700",

    // Gray
    unknown: "bg-gray-100 text-gray-700",
    na: "bg-gray-100 text-gray-700",
    closed: "bg-gray-100 text-gray-700",
  };

  const sizeClasses = {
    sm: "px-2 py-0.5 text-[10px]",
    md: "px-2.5 py-1 text-xs",
    lg: "px-3 py-1.5 text-sm",
  };

  const classes =
    variants[normalized] || "bg-gray-100 text-gray-700";

  // Capitalize first letter of each word
  const displayText = (status || "Unknown")
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full whitespace-nowrap ${sizeClasses[size]} ${classes} ${className}`}
    >
      {displayText}
    </span>
  );
};

export default StatusBadge;
