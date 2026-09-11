"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Clock,
  Calendar,
  Menu,
  Plus,
  Mic,
  LayoutDashboard,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface BottomNavProps {
  onOpenQuickTask: () => void;
  onOpenMobileMenu: () => void;
}

export function BottomNav({ onOpenQuickTask, onOpenMobileMenu }: BottomNavProps) {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-card/95 backdrop-blur-xl border-t border-border px-2 py-1.5 flex items-center justify-around pb-[max(0.6rem,env(safe-area-inset-bottom))] shadow-2xl">
      {/* Tracker Tab */}
      <Link
        href="/work-logs"
        className={cn(
          "flex flex-col items-center justify-center min-w-[56px] py-1 px-2 rounded-xl text-[10px] font-semibold transition-all active:scale-95",
          pathname === "/work-logs"
            ? "text-primary"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        <Clock className={cn("h-5 w-5 mb-0.5", pathname === "/work-logs" ? "text-primary stroke-[2.5]" : "")} />
        <span>Tracker</span>
      </Link>

      {/* Timeline Tab */}
      <Link
        href="/timeline"
        className={cn(
          "flex flex-col items-center justify-center min-w-[56px] py-1 px-2 rounded-xl text-[10px] font-semibold transition-all active:scale-95",
          pathname === "/timeline"
            ? "text-primary"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        <LayoutDashboard className={cn("h-5 w-5 mb-0.5", pathname === "/timeline" ? "text-primary stroke-[2.5]" : "")} />
        <span>Timeline</span>
      </Link>

      {/* Center Action Button: Quick Log + Voice Speak */}
      <div className="relative -top-3">
        <button
          onClick={onOpenQuickTask}
          className="relative flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-tr from-primary via-indigo-600 to-purple-600 text-white shadow-lg shadow-primary/30 active:scale-90 transition-transform focus:outline-none focus:ring-4 focus:ring-primary/20"
          title="Quick Speak & Log Task"
          aria-label="Add task or speak"
        >
          <div className="absolute inset-0 rounded-full bg-primary/30 animate-ping opacity-25" />
          <div className="flex items-center justify-center relative">
            <Plus className="h-5 w-5 stroke-[2.5]" />
            <Mic className="h-3 w-3 absolute -bottom-1 -right-1 text-white bg-red-500 rounded-full p-0.5" />
          </div>
        </button>
      </div>

      {/* Calendar Tab */}
      <Link
        href="/calendar"
        className={cn(
          "flex flex-col items-center justify-center min-w-[56px] py-1 px-2 rounded-xl text-[10px] font-semibold transition-all active:scale-95",
          pathname === "/calendar"
            ? "text-primary"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        <Calendar className={cn("h-5 w-5 mb-0.5", pathname === "/calendar" ? "text-primary stroke-[2.5]" : "")} />
        <span>Calendar</span>
      </Link>

      {/* More / Menu Drawer */}
      <button
        onClick={onOpenMobileMenu}
        className="flex flex-col items-center justify-center min-w-[56px] py-1 px-2 rounded-xl text-[10px] font-semibold text-muted-foreground hover:text-foreground transition-all active:scale-95"
      >
        <Menu className="h-5 w-5 mb-0.5" />
        <span>Menu</span>
      </button>
    </nav>
  );
}
