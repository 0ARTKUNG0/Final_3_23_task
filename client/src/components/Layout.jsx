import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import KeyboardShortcuts from "./KeyboardShortcuts";
import useAuthStore from "../store/useAuthStore";

export default function Layout() {
  const { authUser } = useAuthStore();

  return (
    <div className="min-h-screen bg-[#0a0a0a] bg-grid-pattern relative">
      {authUser && <Navbar />}
      <div className="relative z-10">
        <Outlet />
      </div>
      {authUser && <KeyboardShortcuts />}
    </div>
  );
}
