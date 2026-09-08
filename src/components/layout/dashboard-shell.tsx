"use client";

import * as React from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { Navbar } from "@/components/layout/navbar";
import { TaskFormModal } from "@/components/work-logs/task-form-modal";
import { ReportGeneratorModal } from "@/components/reports/report-generator-modal";
import { SearchModal } from "@/components/search/search-modal";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { X } from "lucide-react";

interface DashboardShellProps {
  children: React.ReactNode;
}

export const DashboardContext = React.createContext<{
  openTaskModal: (task?: any, defaultDate?: string) => void;
  openReportModal: (type?: "DAILY" | "WEEKLY" | "MONTHLY") => void;
  openSearchModal: () => void;
  refreshTrigger: number;
  triggerRefresh: () => void;
  user: any;
}>({
  openTaskModal: () => {},
  openReportModal: () => {},
  openSearchModal: () => {},
  refreshTrigger: 0,
  triggerRefresh: () => {},
  user: null,
});

export function DashboardShell({ children }: DashboardShellProps) {
  const [user, setUser] = React.useState<any>(null);
  const [isTaskModalOpen, setIsTaskModalOpen] = React.useState(false);
  const [editingTask, setEditingTask] = React.useState<any>(null);
  const [defaultTaskDate, setDefaultTaskDate] = React.useState<string | undefined>(undefined);

  const [isReportModalOpen, setIsReportModalOpen] = React.useState(false);
  const [reportType, setReportType] = React.useState<"DAILY" | "WEEKLY" | "MONTHLY">("DAILY");

  const [isSearchModalOpen, setIsSearchModalOpen] = React.useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const [refreshTrigger, setRefreshTrigger] = React.useState(0);

  const router = useRouter();

  const triggerRefresh = () => setRefreshTrigger((prev) => prev + 1);

  React.useEffect(() => {
    // Fetch current user session
    fetch("/api/auth/me")
      .then((res) => {
        if (!res.ok) {
          router.push("/login");
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (data?.user) {
          setUser(data.user);
        }
      })
      .catch(() => router.push("/login"));

    // Global shortcut ⌘K / Ctrl+K
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsSearchModalOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [router]);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      toast.success("Logged out successfully");
      router.push("/login");
    } catch (e) {
      router.push("/login");
    }
  };

  const openTaskModal = (task?: any, defaultDate?: string) => {
    setEditingTask(task || null);
    setDefaultTaskDate(defaultDate);
    setIsTaskModalOpen(true);
  };

  const openReportModal = (type: "DAILY" | "WEEKLY" | "MONTHLY" = "DAILY") => {
    setReportType(type);
    setIsReportModalOpen(true);
  };

  return (
    <DashboardContext.Provider
      value={{
        openTaskModal,
        openReportModal,
        openSearchModal: () => setIsSearchModalOpen(true),
        refreshTrigger,
        triggerRefresh,
        user,
      }}
    >
      <div className="flex h-screen overflow-hidden bg-background">
        {/* Desktop Sidebar */}
        <div className="hidden md:block">
          <Sidebar
            user={user}
            onOpenQuickTask={() => openTaskModal()}
            onLogout={handleLogout}
          />
        </div>

        {/* Mobile Drawer */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-50 md:hidden flex">
            <div
              className="fixed inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <div className="relative z-50 w-64 bg-background h-full shadow-2xl flex flex-col">
              <div className="p-3 flex justify-end">
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-1 rounded-md text-muted-foreground hover:text-foreground"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto">
                <Sidebar
                  user={user}
                  onOpenQuickTask={() => {
                    setIsMobileMenuOpen(false);
                    openTaskModal();
                  }}
                  onLogout={handleLogout}
                />
              </div>
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <Navbar
            user={user}
            onOpenSearch={() => setIsSearchModalOpen(true)}
            onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
          />
          <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8">
            {children}
          </main>
        </div>

        {/* Modals */}
        <TaskFormModal
          isOpen={isTaskModalOpen}
          onClose={() => setIsTaskModalOpen(false)}
          onSaved={triggerRefresh}
          initialTask={editingTask}
          defaultDate={defaultTaskDate}
        />

        <SearchModal
          isOpen={isSearchModalOpen}
          onClose={() => setIsSearchModalOpen(false)}
        />
      </div>
    </DashboardContext.Provider>
  );
}
