/*
 * Design: Earth & Breath — Organic Modernism
 * Dashboard: Session history visualization with stats, charts, streaks, and top asanas
 * Uses localStorage-based history data from cookies.ts analytics helpers
 */
import { useState, useMemo } from "react";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  Clock,
  Flame,
  Trophy,
  Calendar,
  TrendingUp,
  Leaf,
  Trash2,
  Activity,
  Target,
  Sparkles,
  ArrowRight,
  BarChart3,
  History,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import { getAsanaById } from "@/data/engine";
import { asanaImages } from "@/data/asanaImages";
import {
  loadSessionHistory,
  clearSessionHistory,
  calculateStreakData,
  getWeeklyData,
  getMonthlyData,
  getMostPracticedAsanas,
  type SessionHistoryEntry,
} from "@/lib/cookies";

const PIE_COLORS = [
  "oklch(0.35 0.08 155)", // forest
  "oklch(0.62 0.12 45)",  // terracotta
  "oklch(0.78 0.10 85)",  // gold
  "oklch(0.72 0.08 15)",  // rose
  "oklch(0.45 0.08 155)", // forest-light
  "oklch(0.72 0.10 45)",  // terracotta-light
  "oklch(0.75 0.06 155)", // sage
  "oklch(0.88 0.06 85)",  // gold-light
];

function formatDate(ts: number): string {
  const d = new Date(ts);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatTimeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return formatDate(ts);
}

function StatCard({
  icon: Icon,
  label,
  value,
  subtitle,
  color = "forest",
  delay = 0,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  subtitle?: string;
  color?: string;
  delay?: number;
}) {
  const colorMap: Record<string, { bg: string; icon: string; ring: string }> = {
    forest: { bg: "bg-forest/10", icon: "text-forest", ring: "border-forest/20" },
    terracotta: { bg: "bg-terracotta/10", icon: "text-terracotta", ring: "border-terracotta/20" },
    gold: { bg: "bg-gold/10", icon: "text-gold-dark", ring: "border-gold/20" },
    rose: { bg: "bg-rose/10", icon: "text-rose", ring: "border-rose/20" },
  };
  const c = colorMap[color] || colorMap.forest;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className={`bg-card border ${c.ring} rounded-2xl p-5 flex items-start gap-4`}
    >
      <div className={`w-12 h-12 rounded-xl ${c.bg} flex items-center justify-center shrink-0`}>
        <Icon className={`w-6 h-6 ${c.icon}`} />
      </div>
      <div>
        <p className="text-sm text-muted-foreground font-medium">{label}</p>
        <p className="text-2xl font-serif font-bold text-foreground mt-0.5">{value}</p>
        {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
      </div>
    </motion.div>
  );
}

function EmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center py-20"
    >
      <div className="w-24 h-24 rounded-full bg-sage-light/50 flex items-center justify-center mx-auto mb-6">
        <Leaf className="w-12 h-12 text-forest/40" />
      </div>
      <h2 className="font-serif text-2xl font-bold text-foreground mb-3">
        No Practice Sessions Yet
      </h2>
      <p className="text-muted-foreground max-w-md mx-auto mb-8 leading-relaxed">
        Complete your first yoga session to start tracking your progress. Take the assessment
        to get personalized recommendations, then start a guided session.
      </p>
      <Link href="/">
        <motion.span
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          className="inline-flex items-center gap-2 px-6 py-3 bg-forest text-cream font-semibold rounded-full hover:bg-forest-light transition-colors"
        >
          Take Assessment
          <ArrowRight className="w-4 h-4" />
        </motion.span>
      </Link>
    </motion.div>
  );
}

function SessionHistoryCard({ entry, index }: { entry: SessionHistoryEntry; index: number }) {
  const typeLabels: Record<string, { label: string; color: string }> = {
    assessment: { label: "Assessment Session", color: "bg-forest/10 text-forest" },
    surya_namaskar: { label: "Surya Namaskar", color: "bg-gold/10 text-gold-dark" },
    vinyasa: { label: "Vinyasa Flow", color: "bg-terracotta/10 text-terracotta" },
    custom: { label: "Custom Session", color: "bg-sage-light text-forest" },
  };
  const typeInfo = typeLabels[entry.type] || typeLabels.assessment;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className="bg-card border border-border rounded-xl p-4 hover:border-forest/20 transition-all"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-forest/10 flex items-center justify-center">
            <Activity className="w-4 h-4 text-forest" />
          </div>
          <div>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${typeInfo.color}`}>
              {typeInfo.label}
            </span>
            <p className="text-xs text-muted-foreground mt-0.5">{formatTimeAgo(entry.completedAt)}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm font-semibold text-foreground">{entry.actualMinutes || entry.durationMinutes} min</p>
          <p className="text-xs text-muted-foreground">{entry.asanaCount} poses</p>
        </div>
      </div>

      {/* Asana thumbnails */}
      {entry.asanaIds.length > 0 && (
        <div className="flex gap-1.5 overflow-x-auto pb-1">
          {entry.asanaIds.slice(0, 8).map((id, i) => {
            const asana = getAsanaById(id);
            const imgUrl = asanaImages[id as keyof typeof asanaImages];
            return (
              <div
                key={`${id}-${i}`}
                className="w-8 h-8 rounded-lg bg-white border border-border/50 shrink-0 overflow-hidden flex items-center justify-center"
                title={asana?.english_name || id}
              >
                {imgUrl ? (
                  <img src={imgUrl} alt="" className="w-full h-full object-contain p-0.5" />
                ) : (
                  <Leaf className="w-3 h-3 text-sage" />
                )}
              </div>
            );
          })}
          {entry.asanaIds.length > 8 && (
            <div className="w-8 h-8 rounded-lg bg-sage-light/50 border border-border/50 shrink-0 flex items-center justify-center">
              <span className="text-[10px] font-medium text-muted-foreground">
                +{entry.asanaIds.length - 8}
              </span>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}

export default function Dashboard() {
  const [history, setHistory] = useState<SessionHistoryEntry[]>(() => loadSessionHistory());
  const [showConfirmClear, setShowConfirmClear] = useState(false);
  const [chartView, setChartView] = useState<"weekly" | "monthly">("weekly");

  const streakData = useMemo(() => calculateStreakData(history), [history]);
  const weeklyData = useMemo(() => getWeeklyData(history), [history]);
  const monthlyData = useMemo(() => getMonthlyData(history), [history]);
  const topAsanas = useMemo(() => getMostPracticedAsanas(history), [history]);

  const totalMinutes = useMemo(
    () => history.reduce((sum, e) => sum + (e.actualMinutes || e.durationMinutes), 0),
    [history]
  );
  const totalSessions = history.length;
  const avgDuration = totalSessions > 0 ? Math.round(totalMinutes / totalSessions) : 0;
  const totalAsanas = useMemo(
    () => history.reduce((sum, e) => sum + e.asanaCount, 0),
    [history]
  );
  const uniqueAsanas = useMemo(
    () => new Set(history.flatMap((e) => e.asanaIds)).size,
    [history]
  );

  const chartData = chartView === "weekly" ? weeklyData : monthlyData;
  const chartXKey = chartView === "weekly" ? "day" : "week";

  // Pie chart data for session types
  const sessionTypeData = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const e of history) {
      counts[e.type] = (counts[e.type] || 0) + 1;
    }
    const labels: Record<string, string> = {
      assessment: "Assessment",
      surya_namaskar: "Surya Namaskar",
      vinyasa: "Vinyasa",
      custom: "Custom",
    };
    return Object.entries(counts).map(([type, count]) => ({
      name: labels[type] || type,
      value: count,
    }));
  }, [history]);

  const handleClearHistory = () => {
    clearSessionHistory();
    setHistory([]);
    setShowConfirmClear(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="pt-24 pb-10 bg-gradient-to-b from-sage-light/30 to-background">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
          >
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-forest/10 flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-forest" />
                </div>
                <h1 className="font-serif text-3xl md:text-4xl font-bold text-foreground">
                  Practice Dashboard
                </h1>
              </div>
              <p className="text-muted-foreground ml-[52px]">
                Track your yoga journey, streaks, and progress over time.
              </p>
            </div>

            {history.length > 0 && (
              <div className="flex items-center gap-2">
                {!showConfirmClear ? (
                  <button
                    onClick={() => setShowConfirmClear(true)}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-muted-foreground hover:text-destructive border border-border rounded-full hover:border-destructive/30 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    Clear History
                  </button>
                ) : (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleClearHistory}
                      className="px-4 py-2 text-sm text-cream bg-destructive rounded-full hover:bg-destructive/90 transition-colors"
                    >
                      Confirm Clear
                    </button>
                    <button
                      onClick={() => setShowConfirmClear(false)}
                      className="px-4 py-2 text-sm text-muted-foreground border border-border rounded-full hover:bg-muted transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </div>
      </section>

      <div className="container pb-20">
        {history.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="space-y-8">
            {/* Stat cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                icon={Clock}
                label="Total Practice"
                value={totalMinutes >= 60 ? `${Math.floor(totalMinutes / 60)}h ${totalMinutes % 60}m` : `${totalMinutes}m`}
                subtitle={`${totalSessions} sessions`}
                color="forest"
                delay={0}
              />
              <StatCard
                icon={Flame}
                label="Current Streak"
                value={`${streakData.currentStreak} day${streakData.currentStreak !== 1 ? "s" : ""}`}
                subtitle={`Best: ${streakData.longestStreak} days`}
                color="terracotta"
                delay={0.1}
              />
              <StatCard
                icon={Target}
                label="Avg Session"
                value={`${avgDuration} min`}
                subtitle={`${totalAsanas} total poses`}
                color="gold"
                delay={0.2}
              />
              <StatCard
                icon={Sparkles}
                label="Unique Asanas"
                value={uniqueAsanas}
                subtitle={`of 71 total`}
                color="rose"
                delay={0.3}
              />
            </div>

            {/* Charts row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Activity chart */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="lg:col-span-2 bg-card border border-border rounded-2xl p-6"
              >
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="font-serif text-lg font-bold text-foreground">Practice Activity</h3>
                    <p className="text-sm text-muted-foreground">Minutes practiced over time</p>
                  </div>
                  <div className="flex bg-muted rounded-full p-1">
                    <button
                      onClick={() => setChartView("weekly")}
                      className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${
                        chartView === "weekly"
                          ? "bg-forest text-cream"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      7 Days
                    </button>
                    <button
                      onClick={() => setChartView("monthly")}
                      className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${
                        chartView === "monthly"
                          ? "bg-forest text-cream"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      4 Weeks
                    </button>
                  </div>
                </div>

                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="forestGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="oklch(0.35 0.08 155)" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="oklch(0.35 0.08 155)" stopOpacity={0.02} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.92 0.02 90)" />
                      <XAxis
                        dataKey={chartXKey}
                        tick={{ fontSize: 12, fill: "oklch(0.55 0.02 90)" }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis
                        tick={{ fontSize: 12, fill: "oklch(0.55 0.02 90)" }}
                        axisLine={false}
                        tickLine={false}
                        unit="m"
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "oklch(0.96 0.02 90)",
                          border: "1px solid oklch(0.92 0.02 90)",
                          borderRadius: "12px",
                          fontSize: "13px",
                          boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                        }}
                        formatter={(value: number) => [`${value} min`, "Practice Time"]}
                      />
                      <Area
                        type="monotone"
                        dataKey="minutes"
                        stroke="oklch(0.35 0.08 155)"
                        strokeWidth={2.5}
                        fill="url(#forestGradient)"
                        dot={{ r: 4, fill: "oklch(0.35 0.08 155)", strokeWidth: 2, stroke: "white" }}
                        activeDot={{ r: 6, fill: "oklch(0.35 0.08 155)", strokeWidth: 2, stroke: "white" }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                {/* Sessions count bar below */}
                <div className="mt-4 pt-4 border-t border-border">
                  <p className="text-xs text-muted-foreground mb-2 font-medium">Sessions per period</p>
                  <div className="h-20">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData} margin={{ top: 0, right: 5, left: -20, bottom: 0 }}>
                        <XAxis dataKey={chartXKey} hide />
                        <YAxis hide />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "oklch(0.96 0.02 90)",
                            border: "1px solid oklch(0.92 0.02 90)",
                            borderRadius: "12px",
                            fontSize: "13px",
                          }}
                          formatter={(value: number) => [`${value}`, "Sessions"]}
                        />
                        <Bar
                          dataKey="sessions"
                          fill="oklch(0.62 0.12 45)"
                          radius={[6, 6, 0, 0]}
                          maxBarSize={40}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </motion.div>

              {/* Right column: Session types pie + streak */}
              <div className="space-y-6">
                {/* Session types pie chart */}
                {sessionTypeData.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-card border border-border rounded-2xl p-6"
                  >
                    <h3 className="font-serif text-lg font-bold text-foreground mb-1">Session Types</h3>
                    <p className="text-sm text-muted-foreground mb-4">Breakdown of your practice</p>
                    <div className="h-44 flex items-center justify-center">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={sessionTypeData}
                            cx="50%"
                            cy="50%"
                            innerRadius={45}
                            outerRadius={70}
                            paddingAngle={3}
                            dataKey="value"
                          >
                            {sessionTypeData.map((_, i) => (
                              <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "oklch(0.96 0.02 90)",
                              border: "1px solid oklch(0.92 0.02 90)",
                              borderRadius: "12px",
                              fontSize: "13px",
                            }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="flex flex-wrap gap-3 justify-center">
                      {sessionTypeData.map((entry, i) => (
                        <div key={entry.name} className="flex items-center gap-1.5">
                          <div
                            className="w-2.5 h-2.5 rounded-full"
                            style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }}
                          />
                          <span className="text-xs text-muted-foreground">{entry.name}</span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Streak card */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="bg-gradient-to-br from-forest to-forest-light rounded-2xl p-6 text-cream"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <Flame className="w-6 h-6 text-gold" />
                    <h3 className="font-serif text-lg font-bold">Practice Streak</h3>
                  </div>
                  <div className="flex items-end gap-6">
                    <div>
                      <p className="text-4xl font-serif font-bold text-gold">
                        {streakData.currentStreak}
                      </p>
                      <p className="text-sm text-cream/70">current days</p>
                    </div>
                    <div className="border-l border-cream/20 pl-6">
                      <p className="text-2xl font-serif font-bold">
                        {streakData.longestStreak}
                      </p>
                      <p className="text-sm text-cream/70">best streak</p>
                    </div>
                  </div>
                  {streakData.lastPracticeDate && (
                    <p className="text-xs text-cream/50 mt-4">
                      Last practice: {streakData.lastPracticeDate}
                    </p>
                  )}
                </motion.div>
              </div>
            </div>

            {/* Most practiced asanas */}
            {topAsanas.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-card border border-border rounded-2xl p-6"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-gold/10 flex items-center justify-center">
                    <Trophy className="w-5 h-5 text-gold-dark" />
                  </div>
                  <div>
                    <h3 className="font-serif text-lg font-bold text-foreground">Most Practiced Asanas</h3>
                    <p className="text-sm text-muted-foreground">Your top poses across all sessions</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                  {topAsanas.map((item, i) => {
                    const asana = getAsanaById(item.asanaId);
                    const imgUrl = asanaImages[item.asanaId as keyof typeof asanaImages];
                    if (!asana) return null;

                    return (
                      <Link key={item.asanaId} href={`/asana/${item.asanaId}`}>
                        <motion.div
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: i * 0.05 }}
                          className="bg-background border border-border rounded-xl p-3 text-center hover:border-forest/30 hover:shadow-md transition-all group"
                        >
                          <div className="relative">
                            {i < 3 && (
                              <div className={`absolute -top-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold z-10 ${
                                i === 0
                                  ? "bg-gold text-forest-dark"
                                  : i === 1
                                  ? "bg-cream-dark text-foreground"
                                  : "bg-terracotta-light text-terracotta"
                              }`}>
                                {i + 1}
                              </div>
                            )}
                            <div className="w-16 h-16 mx-auto rounded-xl bg-white border border-border/50 overflow-hidden flex items-center justify-center mb-2">
                              {imgUrl ? (
                                <img
                                  src={imgUrl}
                                  alt={asana.english_name}
                                  className="w-full h-full object-contain p-1 group-hover:scale-110 transition-transform"
                                />
                              ) : (
                                <Leaf className="w-6 h-6 text-sage" />
                              )}
                            </div>
                          </div>
                          <p className="text-xs font-medium text-foreground truncate">
                            {asana.english_name}
                          </p>
                          <p className="text-[10px] text-muted-foreground mt-0.5">
                            {item.count} time{item.count !== 1 ? "s" : ""}
                          </p>
                        </motion.div>
                      </Link>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* Session history list */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-forest/10 flex items-center justify-center">
                  <History className="w-5 h-5 text-forest" />
                </div>
                <div>
                  <h3 className="font-serif text-lg font-bold text-foreground">Recent Sessions</h3>
                  <p className="text-sm text-muted-foreground">Your last {Math.min(history.length, 50)} practice sessions</p>
                </div>
              </div>

              <div className="space-y-3">
                {[...history]
                  .sort((a, b) => b.completedAt - a.completedAt)
                  .slice(0, 20)
                  .map((entry, i) => (
                    <SessionHistoryCard key={entry.id} entry={entry} index={i} />
                  ))}
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}
