"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Clock,
  Calendar,
  Sparkles,
  FileText,
  FolderLock,
  BookOpen,
  BarChart3,
  Search,
  Users,
  BrainCircuit,
  LogOut,
  ChevronRight,
  ShieldCheck,
  PlusCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface SidebarProps {
  user: {
    name: string;
    email: string;
    role: string;
    department: string;
    designation: string;
  } | null;
  onOpenQuickTask?: () => void;
  onLogout?: () => void;
}

export function Sidebar({ user, onOpenQuickTask, onLogout }: SidebarProps) {
  const pathname = usePathname();

  const navItems = [
    { label: "Work Tracker", href: "/work-logs", icon: Clock },
    { label: "Day Timeline", href: "/timeline", icon: Clock, badge: "Live" },
    { label: "Calendar", href: "/calendar", icon: Calendar },
    { label: "Search", href: "/search", icon: Search },
  ];

  return (
    <aside className="w-64 flex-shrink-0 border-r border-border bg-card/60 backdrop-blur-md flex flex-col h-screen sticky top-0">
      {/* Brand Header */}
      <div className="p-5 border-b border-border flex items-center justify-between">
        <Link href="/work-logs" className="flex items-center gap-2.5 group">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-primary via-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-md shadow-primary/20 group-hover:scale-105 transition-transform">
            <Clock className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-base tracking-tight text-foreground">
                WorkTrail
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground">Personal Work Tracker</p>
          </div>
        </Link>
      </div>

      {/* Quick Add Task Button */}
      <div className="p-3 border-b border-border/50">
        <button
          onClick={onOpenQuickTask}
          className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold shadow-sm transition-all active:scale-95"
        >
          <PlusCircle className="h-4 w-4" />
          <span>+ Log Work Entry</span>
        </button>
      </div>

      {/* Navigation List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        <div>
          <div className="px-2 pb-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70">
            Workspace
          </div>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all group",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-sm shadow-primary/20 font-semibold"
                      : "text-muted-foreground hover:bg-accent hover:text-foreground"
                  )}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon
                      className={cn(
                        "h-4 w-4 transition-transform group-hover:scale-110",
                        isActive ? "text-primary-foreground" : "text-muted-foreground"
                      )}
                    />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={cn(
                        "text-[9px] px-1.5 py-0.2 rounded font-semibold uppercase",
                        isActive
                          ? "bg-white/20 text-white"
                          : "bg-muted text-muted-foreground"
                      )}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* User Profile Footer */}
      <div className="p-3 border-t border-border bg-muted/20">
        <div className="flex items-center justify-between gap-2 p-2 rounded-lg bg-card/60 border border-border/60">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-primary to-indigo-500 text-white font-bold text-xs flex items-center justify-center flex-shrink-0">
              {user?.name ? user.name.slice(0, 2).toUpperCase() : "WT"}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-semibold text-foreground truncate">
                {user?.name || "Employee"}
              </p>
              <p className="text-[10px] text-muted-foreground truncate">
                {user?.designation || user?.department || "Team Member"}
              </p>
            </div>
          </div>
          <button
            onClick={onLogout}
            title="Log Out"
            className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
