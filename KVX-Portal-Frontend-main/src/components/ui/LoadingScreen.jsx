const LoadingScreen = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="text-center">
        <div className="relative">
          <div className="h-24 w-24 rounded-full border-t-4 border-b-4 border-blue-600 animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-16 w-16 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-full animate-pulse"></div>
          </div>
        </div>
        <h2 className="mt-8 text-2xl font-semibold text-gray-700">KRAVIX TECH</h2>
        <p className="mt-2 text-gray-500">Loading your portal...</p>
      </div>
    </div>
  );
};

export default LoadingScreen;