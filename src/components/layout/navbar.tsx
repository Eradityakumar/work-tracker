"use client";

import { useTheme } from "next-themes";
import { Sun, Moon, Search, Sparkles, Menu, Bell, User as UserIcon, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface NavbarProps {
  user: any;
  onOpenSearch: () => void;
  onOpenMobileMenu?: () => void;
  onGenerateReport?: () => void;
  onLogout?: () => void;
}

export function Navbar({
  user,
  onOpenSearch,
  onOpenMobileMenu,
  onGenerateReport,
  onLogout,
}: NavbarProps) {
  const { theme, setTheme } = useTheme();

  return (
    <header className="h-14 border-b border-border bg-card/60 backdrop-blur-md px-3 sm:px-6 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-2 sm:gap-3">
        {onOpenMobileMenu && (
          <button
            onClick={onOpenMobileMenu}
            className="md:hidden p-2 rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground active:scale-95 transition-all"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>
        )}

        {/* Brand identity on mobile */}
        <div className="flex md:hidden items-center gap-1.5 font-bold text-sm tracking-tight text-foreground">
          <div className="h-7 w-7 rounded-lg bg-gradient-to-tr from-primary to-indigo-600 flex items-center justify-center text-white text-xs shadow-sm">
            WT
          </div>
          <span>WorkTrail</span>
        </div>

        {/* Global Search trigger bar (desktop/tablet) */}
        <button
          onClick={onOpenSearch}
          className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border bg-background/70 text-muted-foreground text-xs hover:border-primary/50 transition-colors w-64 md:w-80 justify-between group shadow-sm"
        >
          <div className="flex items-center gap-2">
            <Search className="h-3.5 w-3.5 group-hover:text-primary transition-colors" />
            <span className="truncate">Search tasks, files, journals...</span>
          </div>
          <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-medium bg-muted rounded border border-border text-muted-foreground">
            ⌘K
          </kbd>
        </button>
      </div>

      <div className="flex items-center gap-1.5 sm:gap-2.5">
        {/* Mobile Search Button */}
        <button
          onClick={onOpenSearch}
          className="sm:hidden p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          title="Search"
          aria-label="Search"
        >
          <Search className="h-4 w-4" />
        </button>

        {/* Theme Toggle */}
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          title="Toggle Theme"
        >
          {theme === "dark" ? (
            <Sun className="h-4 w-4 text-amber-400" />
          ) : (
            <Moon className="h-4 w-4 text-slate-700" />
          )}
        </button>

        {/* User Name */}
        {user && (
          <div className="flex items-center gap-2 pl-2 border-l border-border">
            <span className="text-xs font-semibold text-foreground max-w-[100px] sm:max-w-none truncate hidden xs:inline sm:inline">
              {user.name}
            </span>
          </div>
        )}

        {/* Prominent Logout Button for Phone & Desktop */}
        {onLogout && (
          <button
            onClick={onLogout}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold text-rose-600 dark:text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/25 transition-all active:scale-95 shadow-xs"
            title="Log Out of WorkTrail"
            aria-label="Log Out"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span className="text-[11px]">Logout</span>
          </button>
        )}
      </div>
    </header>
  );
}
