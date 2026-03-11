"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Activity, LayoutDashboard, Globe, Settings, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Pulpit", icon: LayoutDashboard },
  { href: "/monitors", label: "Monitory", icon: Globe },
  { href: "/settings", label: "Ustawienia", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex w-64 flex-col bg-slate-900 border-r border-slate-800">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-800">
        <div className="flex items-center justify-center w-9 h-9 bg-blue-600 rounded-lg shadow-lg shadow-blue-500/25 flex-shrink-0">
          <Activity className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-white font-bold text-base leading-tight">WebMonitor</h1>
          <p className="text-slate-500 text-xs">Monitor stron</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
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
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group",
                isActive
                  ? "bg-blue-600/15 text-blue-400 border border-blue-500/20"
                  : "text-slate-400 hover:text-white hover:bg-slate-800"
              )}
            >
              <Icon className={cn("w-4 h-4 flex-shrink-0", isActive ? "text-blue-400" : "text-slate-500 group-hover:text-white")} />
              <span>{item.label}</span>
              {isActive && <ChevronRight className="w-3 h-3 ml-auto text-blue-500" />}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-slate-800">
        <p className="text-xs text-slate-600">WebMonitor v1.0</p>
      </div>
    </aside>
  );
}
