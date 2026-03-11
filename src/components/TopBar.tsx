"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut, User, ChevronDown, Activity, LayoutDashboard, Globe, Settings, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface TopBarProps {
  user: {
    id?: string;
    name?: string | null;
    email?: string | null;
  };
}

const navItems = [
  { href: "/dashboard", label: "Pulpit", icon: LayoutDashboard },
  { href: "/monitors", label: "Monitory", icon: Globe },
  { href: "/settings", label: "Ustawienia", icon: Settings },
];

export default function TopBar({ user }: TopBarProps) {
  const pathname = usePathname();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="flex items-center justify-between h-16 px-6 bg-slate-900 border-b border-slate-800 flex-shrink-0">
      {/* Mobile logo */}
      <div className="lg:hidden flex items-center gap-3">
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="text-slate-400 hover:text-white transition-colors mr-2"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
        <div className="flex items-center justify-center w-8 h-8 bg-blue-600 rounded-lg">
          <Activity className="w-4 h-4 text-white" />
        </div>
        <span className="text-white font-bold">WebMonitor</span>
      </div>

      {/* Desktop breadcrumb - spacer */}
      <div className="hidden lg:block" />

      {/* User menu */}
      <div className="relative">
        <button
          onClick={() => setUserMenuOpen(!userMenuOpen)}
          className="flex items-center gap-2 pl-3 pr-2 py-1.5 rounded-lg hover:bg-slate-800 transition-all"
        >
          <div className="w-7 h-7 rounded-full bg-blue-600/20 border border-blue-500/30 flex items-center justify-center flex-shrink-0">
            <User className="w-3.5 h-3.5 text-blue-400" />
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-sm font-medium text-white leading-tight">
              {user.name || user.email?.split("@")[0]}
            </p>
            <p className="text-xs text-slate-500 leading-tight">{user.email}</p>
          </div>
          <ChevronDown className={cn("w-4 h-4 text-slate-400 transition-transform", userMenuOpen && "rotate-180")} />
        </button>

        {userMenuOpen && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setUserMenuOpen(false)} />
            <div className="absolute right-0 top-full mt-2 w-56 bg-slate-800 border border-slate-700 rounded-xl shadow-xl z-20 overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-700">
                <p className="text-sm font-medium text-white">{user.name || "Użytkownik"}</p>
                <p className="text-xs text-slate-400 truncate">{user.email}</p>
              </div>
              <div className="p-1">
                <button
                  onClick={() => signOut({ callbackUrl: "/login" })}
                  className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Wyloguj się
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden absolute top-16 left-0 right-0 bg-slate-900 border-b border-slate-800 z-50 shadow-xl">
          <nav className="p-3 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.href === "/monitors"
                  ? pathname.startsWith("/monitors")
                  : pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                    isActive
                      ? "bg-blue-600/15 text-blue-400"
                      : "text-slate-400 hover:text-white hover:bg-slate-800"
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      )}
    </header>
  );
}
