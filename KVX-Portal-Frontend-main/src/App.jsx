import AppRoutes from "./routes/AppRoutes";
import { Toaster } from "react-hot-toast";
import FloatingChat from "./components/common/FloatingChat";
import BackgroundGraphics from "./components/common/BackgroundGraphics";

function App() {
  return (
    <>
      <BackgroundGraphics />
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
        }}
      />
      <AppRoutes />
      <FloatingChat />
    </>
  );
}

export default App;