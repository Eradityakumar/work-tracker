"use client";

import { useTheme } from "next-themes";
import { Sun, Moon, Search, Sparkles, Menu, Bell, User as UserIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface NavbarProps {
  user: any;
  onOpenSearch: () => void;
  onOpenMobileMenu?: () => void;
  onGenerateReport?: () => void;
}

export function Navbar({
  user,
  onOpenSearch,
  onOpenMobileMenu,
  onGenerateReport,
}: NavbarProps) {
  const { theme, setTheme } = useTheme();

  return (
    <header className="h-14 border-b border-border bg-card/40 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-3">
        {onOpenMobileMenu && (
          <button
            onClick={onOpenMobileMenu}
            className="md:hidden p-2 rounded-lg text-muted-foreground hover:bg-accent"
          >
            <Menu className="h-5 w-5" />
          </button>
        )}

        {/* Global Search trigger bar */}
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

      <div className="flex items-center gap-2.5">
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
            <span className="text-xs font-semibold text-foreground">
              {user.name}
            </span>
          </div>
        )}
      </div>
    </header>
  );
}
