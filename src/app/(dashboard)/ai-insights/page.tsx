"use client";

import * as React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  BrainCircuit,
  Sparkles,
  Zap,
  Clock,
  ShieldCheck,
  TrendingUp,
  Target,
  RefreshCw,
  Lightbulb,
} from "lucide-react";
import { toast } from "sonner";

export default function AIInsightsPage() {
  const [data, setData] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);

  const fetchInsights = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/ai/insights");
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (e) {
      console.error(e);
      toast.error("Failed to fetch AI insights");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchInsights();
  }, [fetchInsights]);

  if (loading) {
    return (
      <div className="text-center py-20 text-xs text-muted-foreground">
        Synthesizing behavioral work patterns with AI engine...
      </div>
    );
  }

  const breakdown = data?.breakdown || {
    deepWorkHours: 0,
    meetingHours: 0,
    operationsHours: 0,
    totalHours: 0,
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              AI Work Pattern Insights
            </h1>
            <Badge variant="outline" className="text-[10px] text-purple-600 border-purple-500/30">
              <Sparkles className="h-3 w-3 mr-1" />
              Machine Intelligence
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">
            Algorithmic analysis of your work rhythm, context-switching overhead, and cognitive focus.
          </p>
        </div>

        <Button
          onClick={fetchInsights}
          size="sm"
          variant="outline"
          className="text-xs flex items-center gap-1.5"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          <span>Re-analyze Patterns</span>
        </Button>
      </div>

      {/* Focus Index & Peak Window Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Focus Score */}
        <Card className="p-5 border-purple-500/30 bg-gradient-to-br from-card via-purple-500/5 to-card shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Deep Work Focus Score
            </span>
            <Target className="h-4 w-4 text-purple-500" />
          </div>
          <div className="text-3xl font-black text-foreground">
            {data?.focusScore || 88}
            <span className="text-sm font-normal text-muted-foreground">/100</span>
          </div>
          <p className="text-xs text-purple-600 dark:text-purple-400 font-semibold mt-1">
            High deep-work efficiency
          </p>
        </Card>

        {/* Peak Execution Window */}
        <Card className="p-5 border-blue-500/30 bg-gradient-to-br from-card via-blue-500/5 to-card shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Prime Execution Window
            </span>
            <Zap className="h-4 w-4 text-amber-500" />
          </div>
          <div className="text-xl font-black text-foreground">
            {data?.peakHour || "10:00 AM – 12:30 PM"}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Highest deliverable completion density
          </p>
        </Card>

        {/* Deep Work vs Meetings Ratio */}
        <Card className="p-5 border-emerald-500/30 bg-gradient-to-br from-card via-emerald-500/5 to-card shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Deep Work vs Meeting
            </span>
            <Clock className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="text-xl font-black text-foreground">
            {breakdown.deepWorkHours}h / {breakdown.meetingHours}h
          </div>
          <p className="text-xs text-emerald-600 font-semibold mt-1">
            Optimal balance achieved
          </p>
        </Card>
      </div>

      {/* Time Allocation Breakdown Visualizer */}
      <Card className="p-5 shadow-xs space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          Work Allocation Composition
        </h3>
        <div className="w-full h-4 rounded-full bg-muted overflow-hidden flex">
          <div
            style={{
              width: `${(breakdown.deepWorkHours / (breakdown.totalHours || 1)) * 100}%`,
            }}
            className="bg-primary h-full transition-all"
            title={`Development & Design: ${breakdown.deepWorkHours} hrs`}
          />
          <div
            style={{
              width: `${(breakdown.meetingHours / (breakdown.totalHours || 1)) * 100}%`,
            }}
            className="bg-purple-500 h-full transition-all"
            title={`Meetings & Syncs: ${breakdown.meetingHours} hrs`}
          />
          <div
            style={{
              width: `${(breakdown.operationsHours / (breakdown.totalHours || 1)) * 100}%`,
            }}
            className="bg-amber-500 h-full transition-all"
            title={`Operations & Documentation: ${breakdown.operationsHours} hrs`}
          />
        </div>

        <div className="flex flex-wrap items-center gap-4 text-xs pt-1">
          <div className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-full bg-primary" />
            <span className="text-muted-foreground">
              Deep Work & Development: <strong>{breakdown.deepWorkHours} hrs</strong>
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-full bg-purple-500" />
            <span className="text-muted-foreground">
              Meetings & Collaboration: <strong>{breakdown.meetingHours} hrs</strong>
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-full bg-amber-500" />
            <span className="text-muted-foreground">
              Operations & Docs: <strong>{breakdown.operationsHours} hrs</strong>
            </span>
          </div>
        </div>
      </Card>

      {/* AI Recommendations Cards */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
          <Lightbulb className="h-4 w-4 text-amber-500" />
          <span>Productivity & Velocity Recommendations</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {data?.insights?.map((item: any) => (
            <Card key={item.id} className="p-4 shadow-xs space-y-2 hover:border-primary/40 transition-colors">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-foreground">
                  {item.title}
                </span>
                <Badge variant="secondary" className="text-[10px]">
                  {item.badge}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {item.description}
              </p>
              <div className="pt-2 border-t border-border/50 text-[11px] font-mono font-bold text-primary">
                Metric: {item.metric}
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
