import { LogOut, CheckSquare, LayoutDashboard, Calendar } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import useAuthStore from "../store/useAuthStore";

export default function Navbar() {
  const { authUser, logout } = useAuthStore();
  const { pathname } = useLocation();

  const navLinks = [
    { to: "/", label: "Dashboard", icon: LayoutDashboard },
    { to: "/calendar", label: "Calendar", icon: Calendar },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-[#0a0a0a]/95 backdrop-blur-sm border-b border-[#1e1e1e] px-6 py-3">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        {/* Left: Logo + Nav pills */}
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-2 text-white no-underline">
            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center">
              <CheckSquare size={20} className="text-black" />
            </div>
          </Link>

          <div className="hidden sm:flex items-center gap-2">
            {navLinks.map((link) => {
              const isActive = pathname === link.to;
              const Icon = link.icon;
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm no-underline transition-all ${
                    isActive
                      ? "bg-lime-400 text-black font-medium border border-lime-400"
                      : "bg-[#1e1e1e] border border-[#2e2e2e] text-white hover:border-[#3e3e3e]"
                  }`}
                >
                  <Icon size={14} />
                  {link.label}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Right: User info */}
        {authUser && (
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-white leading-tight">{authUser.fullName}</p>
                <p className="text-xs text-gray-500">@{authUser.fullName?.split(" ")[0]?.toLowerCase()}</p>
              </div>
              <img
                src={authUser.profilePic}
                alt={authUser.fullName}
                className="w-9 h-9 rounded-full object-cover border-2 border-[#2e2e2e]"
              />
            </div>
            <button
              onClick={logout}
              className="p-2 rounded-full text-gray-500 hover:text-orange-400 hover:bg-[#1a1a1a] transition-all duration-200"
              title="Logout"
            >
              <LogOut size={18} />
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
