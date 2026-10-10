import { useLocation, Link } from "react-router-dom";
import { ChevronRight, Home } from "lucide-react";

const Breadcrumbs = ({ className = "" }) => {
  const location = useLocation();

  const pathnames = location.pathname
    .split("/")
    .filter((x) => x && !x.match(/^\d+$/)); // filter out numeric IDs

  const formatLabel = (segment) => {
    return segment
      .replace(/-/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());
  };

  if (pathnames.length <= 1) return null;

  return (
    <nav className={`flex items-center space-x-1 text-sm mb-6 ${className}`} aria-label="Breadcrumb">
      <Link
        to={`/${pathnames[0]}/dashboard`}
        className="flex items-center text-gray-400 hover:text-gray-600 transition-colors"
      >
        <Home className="h-4 w-4" />
      </Link>
      {pathnames.map((segment, index) => {
        const routeTo = `/${pathnames.slice(0, index + 1).join("/")}`;
        const isLast = index === pathnames.length - 1;

        return (
          <div key={routeTo} className="flex items-center">
            <ChevronRight className="h-4 w-4 text-gray-300 mx-1" />
            {isLast ? (
              <span className="font-medium text-gray-900">
                {formatLabel(segment)}
              </span>
            ) : (
              <Link
                to={routeTo}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                {formatLabel(segment)}
              </Link>
            )}
          </div>
        );
      })}
    </nav>
  );
};

export default Breadcrumbs;
