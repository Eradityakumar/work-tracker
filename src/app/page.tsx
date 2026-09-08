import Link from "next/link";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import {
  Sparkles,
  Clock,
  FolderLock,
  FileText,
  BarChart3,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default async function HomePage() {
  const session = await getSession();
  if (session) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-between selection:bg-primary/20">
      {/* Navbar */}
      <header className="border-b border-border/40 backdrop-blur-md sticky top-0 z-40 bg-background/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-primary to-purple-600 flex items-center justify-center text-white shadow-md shadow-primary/20">
              <Sparkles className="h-5 w-5" />
            </div>
            <span className="font-extrabold text-lg tracking-tight">WorkTrail AI</span>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-xs font-semibold px-3 py-1.5 rounded-lg text-muted-foreground hover:text-foreground transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              className="text-xs font-semibold px-4 py-2 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm transition-all"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 max-w-5xl mx-auto px-4 py-16 sm:py-24 text-center space-y-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/30 bg-primary/10 text-primary text-xs font-semibold">
          <Sparkles className="h-3.5 w-3.5" />
          <span>Next-Gen Employee Work Tracker & AI Reporting Platform</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-foreground max-w-3xl mx-auto leading-tight">
          Track everything you do.{" "}
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-indigo-500 to-purple-500">
            Let AI write the reports.
          </span>
        </h1>

        <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          Log daily tasks chronologically, attach screenshots and documents as proof, maintain personal reflections, and export executive Daily, Weekly, and Monthly reports in seconds.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
          <Link
            href="/login"
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-bold shadow-lg shadow-primary/25 flex items-center justify-center gap-2 transition-all active:scale-95"
          >
            <span>Launch Live Demo</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/signup"
            className="w-full sm:w-auto px-6 py-3 rounded-xl border border-border bg-card hover:bg-accent text-foreground text-sm font-semibold transition-all"
          >
            Create Account
          </Link>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-16 text-left">
          <div className="p-5 rounded-2xl border border-border bg-card shadow-xs space-y-2">
            <div className="h-9 w-9 rounded-lg bg-blue-500/10 text-blue-600 flex items-center justify-center">
              <Clock className="h-5 w-5" />
            </div>
            <h3 className="text-sm font-bold text-foreground">Visual Day Timeline</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Chronological schedule of tasks, duration calculations, and category breakdowns.
            </p>
          </div>

          <div className="p-5 rounded-2xl border border-border bg-card shadow-xs space-y-2">
            <div className="h-9 w-9 rounded-lg bg-purple-500/10 text-purple-600 flex items-center justify-center">
              <FolderLock className="h-5 w-5" />
            </div>
            <h3 className="text-sm font-bold text-foreground">Evidence Vault & OCR</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Attach screenshots, PDFs, Word, and Excel files with automated AI OCR text parsing.
            </p>
          </div>

          <div className="p-5 rounded-2xl border border-border bg-card shadow-xs space-y-2">
            <div className="h-9 w-9 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
              <FileText className="h-5 w-5" />
            </div>
            <h3 className="text-sm font-bold text-foreground">AI Reports & Export</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Generate Daily, Weekly, and Monthly executive reports with single-click PDF & Excel exports.
            </p>
          </div>

          <div className="p-5 rounded-2xl border border-border bg-card shadow-xs space-y-2">
            <div className="h-9 w-9 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center">
              <BarChart3 className="h-5 w-5" />
            </div>
            <h3 className="text-sm font-bold text-foreground">Admin & Velocity</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Track team activities, deep work vs meetings ratio, and individual employee dossier cards.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/40 py-6 text-center text-xs text-muted-foreground">
        <p>© 2025 WorkTrail AI. Enterprise Personal Work Tracker & Reporting Engine.</p>
      </footer>
    </div>
  );
}
