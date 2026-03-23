import { useEffect } from "react";
import { Toaster } from "react-hot-toast";
import useAuthStore from "./store/useAuthStore";
import AppRouter from "./router/AppRouter";

export default function App() {
  const { checkAuth, isCheckingAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-2 border-lime-400/30 border-t-lime-400 rounded-full animate-spin" />
          <p className="text-gray-500 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <AppRouter />
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: {
            background: "#161616",
            color: "#e5e5e5",
            border: "1px solid #2a2a2a",
            borderRadius: "12px",
          },
          success: {
            iconTheme: { primary: "#a3e635", secondary: "#0a0a0a" },
          },
          error: {
            iconTheme: { primary: "#f97316", secondary: "#0a0a0a" },
          },
        }}
      />
    </>
  );
}
