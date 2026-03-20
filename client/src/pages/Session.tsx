/*
 * Design: Earth & Breath — Organic Modernism
 * Session: Redesigned to match Surya Namaskar flow style
 * Learn mode: step-by-step cards with images, breathing cues, tips
 * Practice mode: large pose card, timer bar, thumbnails strip, controls
 */
import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useLocation, useSearch } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play,
  Pause,
  SkipForward,
  RotateCcw,
  Clock,
  Check,
  ChevronRight,
  ChevronLeft,
  Timer,
  Leaf,
  ArrowLeft,
  Volume2,
  VolumeX,
  Minus,
  Plus,
  AlertTriangle,
  Info,
  Wind,
  X,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import { getAsanaById, generateRecommendations } from "@/data/engine";
import { asanaImages } from "@/data/asanaImages";
import type { Asana, Severity } from "@/data/types";
import {
  SessionData,
  SessionAsana,
  saveSession,
  loadSession,
  clearSession,
  saveSessionHistory,
  loadSessionHistory,
} from "@/lib/cookies";

function generateSessionId() {
  return `s_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

function distributeTime(asanas: Asana[], totalMinutes: number): SessionAsana[] {
  const totalSeconds = totalMinutes * 60;
  const hasSavasana = totalMinutes >= 10;
  const savasanaTime = hasSavasana ? 120 : 0;
  const practiceTime = totalSeconds - savasanaTime;

  const mainAsanas = hasSavasana
    ? asanas.filter((a) => a.id !== "savasana")
    : asanas;

  const perAsana = Math.max(30, Math.floor(practiceTime / Math.max(mainAsanas.length, 1)));
  const result: SessionAsana[] = mainAsanas.map((a) => ({
    asanaId: a.id,
    durationSeconds: perAsana,
    completed: false,
  }));

  let remaining = practiceTime - perAsana * mainAsanas.length;
  for (let i = 0; i < result.length && remaining > 0; i++) {
    const extra = Math.min(15, remaining);
    result[i].durationSeconds += extra;
    remaining -= extra;
  }

  if (hasSavasana) {
    result.push({
      asanaId: "savasana",
      durationSeconds: savasanaTime,
      completed: false,
    });
  }

  return result;
}

// Determine a breathing cue based on asana type
function getBreathCue(asana: Asana): { label: string; color: string } {
  const type = asana.type;
  const name = asana.english_name.toLowerCase();
  if (type === "pranayama") return { label: "Breathe", color: "text-forest bg-sage-light/60" };
  if (name.includes("corpse") || name.includes("savasana") || name.includes("relaxation"))
    return { label: "Relax", color: "text-muted-foreground bg-cream-dark/50" };
  if (type === "backbend" || name.includes("cobra") || name.includes("upward") || name.includes("bridge") || name.includes("camel"))
    return { label: "Inhale", color: "text-forest bg-sage-light/60" };
  if (type === "forward_bend" || name.includes("fold") || name.includes("child") || name.includes("seated"))
    return { label: "Exhale", color: "text-terracotta bg-terracotta-light/40" };
  if (type === "inversion") return { label: "Hold", color: "text-gold-dark bg-gold-light/50" };
  return { label: "Breathe", color: "text-forest bg-sage-light/60" };
}

export default function Session() {
  const [, navigate] = useLocation();
  const search = useSearch();
  const params = useMemo(() => new URLSearchParams(search), [search]);

  const conditionIds = useMemo(
    () => (params.get("conditions") || "").split(",").filter(Boolean),
    [params]
  );
  const severity = (params.get("severity") as Severity) || null;

  const recommendedAsanas = useMemo(() => {
    if (conditionIds.length === 0) return [];
    const results = generateRecommendations(conditionIds, severity);
    return results.recommended
      .map((r) => r.asana)
      .filter((a) => a.type !== "pranayama");
  }, [conditionIds, severity]);

  // Session state
  const [session, setSession] = useState<SessionData | null>(null);
  const [phase, setPhase] = useState<"setup" | "active" | "complete">("setup");
  const [durationMinutes, setDurationMinutes] = useState(30);
  const [currentTime, setCurrentTime] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const audioRef = useRef<AudioContext | null>(null);
  const thumbnailsRef = useRef<HTMLDivElement>(null);

  // Load existing session from cookies on mount
  useEffect(() => {
    const saved = loadSession();
    if (saved && saved.status !== "completed") {
      setSession(saved);
      setPhase("active");
      setDurationMinutes(saved.durationMinutes);
      setCurrentTime(0);
      setIsPaused(saved.status === "paused");
    }
  }, []);

  // Play a gentle bell sound
  const playBell = useCallback(() => {
    if (!soundEnabled) return;
    try {
      if (!audioRef.current) audioRef.current = new AudioContext();
      const ctx = audioRef.current;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = 528;
      osc.type = "sine";
      gain.gain.setValueAtTime(0.25, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.2);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 1.2);
    } catch { /* ignore */ }
  }, [soundEnabled]);

  // Start a new session
  const startSession = useCallback(() => {
    const asanasForSession = recommendedAsanas.slice(0, Math.min(recommendedAsanas.length, 15));
    if (asanasForSession.length === 0) return;

    const sessionAsanas = distributeTime(asanasForSession, durationMinutes);
    const newSession: SessionData = {
      id: generateSessionId(),
      startedAt: Date.now(),
      durationMinutes,
      asanas: sessionAsanas,
      status: "active",
      currentAsanaIndex: 0,
      elapsedSeconds: 0,
    };

    setSession(newSession);
    saveSession(newSession);
    setPhase("active");
    setCurrentTime(0);
    setIsPaused(false);
    playBell();
  }, [recommendedAsanas, durationMinutes, playBell]);

  // Timer logic
  useEffect(() => {
    if (phase !== "active" || isPaused || !session) return;

    timerRef.current = setInterval(() => {
      setCurrentTime((prev) => {
        const next = prev + 1;
        const currentAsana = session.asanas[session.currentAsanaIndex];
        if (!currentAsana) return prev;

        if (next >= currentAsana.durationSeconds) {
          const updatedAsanas = [...session.asanas];
          updatedAsanas[session.currentAsanaIndex] = {
            ...updatedAsanas[session.currentAsanaIndex],
            completed: true,
          };

          const nextIndex = session.currentAsanaIndex + 1;
          if (nextIndex >= session.asanas.length) {
            const completedSession: SessionData = {
              ...session,
              asanas: updatedAsanas,
              status: "completed",
              currentAsanaIndex: session.asanas.length - 1,
              elapsedSeconds: session.elapsedSeconds + next,
            };
            setSession(completedSession);
            saveSession(completedSession);
            setPhase("complete");
            playBell();

            const history = loadSessionHistory();
            history.push({
              completedAt: Date.now(),
              durationMinutes: session.durationMinutes,
              asanaCount: session.asanas.length,
            });
            saveSessionHistory(history);
            return 0;
          }

          const updatedSession: SessionData = {
            ...session,
            asanas: updatedAsanas,
            currentAsanaIndex: nextIndex,
            elapsedSeconds: session.elapsedSeconds + next,
          };
          setSession(updatedSession);
          saveSession(updatedSession);
          playBell();
          return 0;
        }

        if (next % 10 === 0) {
          const updatedSession: SessionData = {
            ...session,
            elapsedSeconds: session.elapsedSeconds + 10,
          };
          saveSession(updatedSession);
        }

        return next;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [phase, isPaused, session, playBell]);

  const togglePause = useCallback(() => {
    if (!session) return;
    const newPaused = !isPaused;
    setIsPaused(newPaused);
    const updated = { ...session, status: newPaused ? "paused" as const : "active" as const };
    setSession(updated);
    saveSession(updated);
  }, [session, isPaused]);

  const skipAsana = useCallback(() => {
    if (!session) return;
    const updatedAsanas = [...session.asanas];
    updatedAsanas[session.currentAsanaIndex] = {
      ...updatedAsanas[session.currentAsanaIndex],
      completed: true,
    };

    const nextIndex = session.currentAsanaIndex + 1;
    if (nextIndex >= session.asanas.length) {
      const completedSession: SessionData = {
        ...session,
        asanas: updatedAsanas,
        status: "completed",
        currentAsanaIndex: session.asanas.length - 1,
      };
      setSession(completedSession);
      saveSession(completedSession);
      setPhase("complete");
      playBell();
      return;
    }

    const updated: SessionData = {
      ...session,
      asanas: updatedAsanas,
      currentAsanaIndex: nextIndex,
    };
    setSession(updated);
    saveSession(updated);
    setCurrentTime(0);
    playBell();
  }, [session, playBell]);

  const prevAsana = useCallback(() => {
    if (!session || session.currentAsanaIndex === 0) return;
    const prevIndex = session.currentAsanaIndex - 1;
    const updated: SessionData = {
      ...session,
      currentAsanaIndex: prevIndex,
    };
    setSession(updated);
    saveSession(updated);
    setCurrentTime(0);
    playBell();
  }, [session, playBell]);

  const endSession = useCallback(() => {
    clearSession();
    setSession(null);
    setPhase("setup");
    setCurrentTime(0);
  }, []);

  // Current asana info
  const currentAsanaData = useMemo(() => {
    if (!session || phase !== "active") return null;
    const sa = session.asanas[session.currentAsanaIndex];
    if (!sa) return null;
    return getAsanaById(sa.asanaId);
  }, [session, phase]);

  const currentSessionAsana = session?.asanas[session.currentAsanaIndex];
  const progress = currentSessionAsana
    ? Math.min((currentTime / currentSessionAsana.durationSeconds) * 100, 100)
    : 0;
  const totalProgress = session
    ? ((session.currentAsanaIndex + progress / 100) / session.asanas.length) * 100
    : 0;

  // Auto-scroll thumbnails to current pose
  useEffect(() => {
    if (session && thumbnailsRef.current) {
      const thumb = thumbnailsRef.current.children[session.currentAsanaIndex] as HTMLElement;
      if (thumb) {
        thumb.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
      }
    }
  }, [session?.currentAsanaIndex]);

  // Build step data for learn mode
  const sessionSteps = useMemo(() => {
    return recommendedAsanas.slice(0, 15).map((asana) => {
      const breath = getBreathCue(asana);
      return { asana, breath };
    });
  }, [recommendedAsanas]);

  const totalTime = useMemo(() => {
    const perAsana = Math.floor((durationMinutes * 60) / Math.max(sessionSteps.length, 1));
    return sessionSteps.length * perAsana + (durationMinutes >= 10 ? 120 : 0);
  }, [durationMinutes, sessionSteps]);

  // No conditions selected
  if (conditionIds.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-24 container max-w-2xl mx-auto px-4 text-center">
          <h2 className="font-serif text-3xl font-semibold mb-4">No Conditions Selected</h2>
          <p className="text-muted-foreground mb-8">
            Please complete the assessment first to get personalized yoga recommendations for your session.
          </p>
          <button
            onClick={() => navigate("/")}
            className="inline-flex items-center gap-2 px-6 py-3 bg-forest text-cream rounded-full font-semibold"
          >
            <ArrowLeft className="w-4 h-4" />
            Start Assessment
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <AnimatePresence mode="wait">
        {/* ═══════════════ SETUP / LEARN MODE ═══════════════ */}
        {phase === "setup" && (
          <motion.div
            key="setup"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: -20 }}
          >
            {/* Hero */}
            <section className="relative pt-24 pb-12 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-sage-light/30 via-background to-gold-light/20" />
              <div className="relative z-10 container max-w-5xl mx-auto px-4">
                <motion.button
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  onClick={() => navigate(`/results?${search}`)}
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to Recommendations
                </motion.button>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center"
                >
                  <div className="flex items-center justify-center gap-2 mb-4">
                    <Timer className="w-6 h-6 text-forest" />
                    <span className="text-sm font-medium text-forest uppercase tracking-wider">
                      Guided Practice Session
                    </span>
                  </div>
                  <h1 className="font-serif text-4xl md:text-6xl font-bold text-foreground mb-4">
                    Your Yoga Session
                  </h1>
                  <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
                    A personalized sequence of {sessionSteps.length} poses based on your assessment,
                    perfectly timed to your schedule. Each pose includes detailed instructions and breathing cues.
                  </p>
                </motion.div>
              </div>
            </section>

            {/* Duration + Start Practice controls */}
            <section className="pb-6">
              <div className="container max-w-5xl mx-auto px-4">
                <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-8">
                  {/* Duration selector */}
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-muted-foreground">Duration:</span>
                    <button
                      onClick={() => setDurationMinutes(Math.max(5, durationMinutes - 5))}
                      className="w-9 h-9 rounded-full bg-cream-dark flex items-center justify-center hover:bg-border transition-colors"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="font-serif text-3xl font-bold text-forest tabular-nums w-16 text-center">
                      {durationMinutes}
                    </span>
                    <span className="text-sm text-muted-foreground">min</span>
                    <button
                      onClick={() => setDurationMinutes(Math.min(120, durationMinutes + 5))}
                      className="w-9 h-9 rounded-full bg-cream-dark flex items-center justify-center hover:bg-border transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Quick presets */}
                  <div className="flex items-center gap-1">
                    {[10, 15, 20, 30, 45, 60].map((min) => (
                      <button
                        key={min}
                        onClick={() => setDurationMinutes(min)}
                        className={`w-9 h-9 rounded-full text-sm font-medium transition-all ${
                          durationMinutes === min
                            ? "bg-forest text-cream"
                            : "bg-cream-dark text-muted-foreground hover:bg-border"
                        }`}
                      >
                        {min}
                      </button>
                    ))}
                  </div>

                  <span className="text-xs text-muted-foreground">
                    ~{Math.ceil(totalTime / 60)} min total
                    {durationMinutes >= 10 && " (incl. 2 min Savasana)"}
                  </span>

                  <button
                    onClick={startSession}
                    className="flex items-center gap-2 px-8 py-3.5 bg-forest text-cream font-semibold rounded-full hover:bg-forest-light transition-all shadow-lg"
                  >
                    <Play className="w-5 h-5" />
                    Start Guided Practice
                  </button>
                </div>
              </div>
            </section>

            {/* Step-by-step cards (learn mode, like Surya Namaskar) */}
            <section className="pb-24">
              <div className="container max-w-5xl mx-auto px-4">
                <div className="space-y-4">
                  {sessionSteps.map(({ asana, breath }, i) => (
                    <motion.div
                      key={asana.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.04 }}
                      className="bg-card border border-border rounded-2xl p-5 hover:border-forest/20 transition-all"
                    >
                      <div className="flex items-start gap-4">
                        {/* Step number */}
                        <div className="w-10 h-10 rounded-full bg-forest/10 flex items-center justify-center shrink-0">
                          <span className="text-sm font-bold text-forest">{i + 1}</span>
                        </div>

                        {/* Image */}
                        <div className="w-16 h-16 rounded-xl overflow-hidden bg-white border border-border/50 shrink-0 flex items-center justify-center">
                          {asanaImages[asana.id] ? (
                            <img
                              src={asanaImages[asana.id]}
                              alt={asana.english_name}
                              className="w-full h-full object-contain p-1.5"
                              loading="lazy"
                            />
                          ) : (
                            <Leaf className="w-6 h-6 text-forest/20" />
                          )}
                        </div>

                        {/* Content */}
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-serif text-lg font-semibold text-foreground">
                              {asana.english_name}
                            </h3>
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${breath.color}`}>
                              <Wind className="w-3 h-3 inline mr-1" />
                              {breath.label}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground italic mb-2">
                            {asana.sanskrit_name}
                          </p>
                          <p className="text-sm text-foreground/80 leading-relaxed">
                            {asana.description.split(".").slice(0, 2).join(".") + "."}
                          </p>
                          {asana.precautions && (
                            <p className="text-xs text-muted-foreground mt-2 flex items-start gap-1">
                              <Info className="w-3 h-3 mt-0.5 shrink-0" />
                              {asana.precautions}
                            </p>
                          )}
                        </div>

                        {/* Duration estimate */}
                        <div className="text-right shrink-0">
                          <span className="text-xs text-muted-foreground">
                            ~{Math.floor((durationMinutes * 60) / Math.max(sessionSteps.length, 1))}s
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  ))}

                  {/* Savasana at end */}
                  {durationMinutes >= 10 && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: sessionSteps.length * 0.04 }}
                      className="bg-card border-2 border-forest/10 rounded-2xl p-5"
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-full bg-forest/10 flex items-center justify-center shrink-0">
                          <span className="text-sm font-bold text-forest">{sessionSteps.length + 1}</span>
                        </div>
                        <div className="w-16 h-16 rounded-xl overflow-hidden bg-white border border-border/50 shrink-0 flex items-center justify-center">
                          {asanaImages["savasana"] ? (
                            <img
                              src={asanaImages["savasana"]}
                              alt="Savasana"
                              className="w-full h-full object-contain p-1.5"
                              loading="lazy"
                            />
                          ) : (
                            <Leaf className="w-6 h-6 text-forest/20" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-serif text-lg font-semibold text-foreground">
                              Savasana (Final Rest)
                            </h3>
                            <span className="text-xs px-2 py-0.5 rounded-full font-medium text-muted-foreground bg-cream-dark/50">
                              <Wind className="w-3 h-3 inline mr-1" />
                              Relax
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground italic mb-2">Corpse Pose</p>
                          <p className="text-sm text-foreground/80 leading-relaxed">
                            Lie flat on your back with arms at your sides, palms facing up. Close your eyes and let your body completely relax. Focus on your breath and allow all tension to melt away.
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="text-xs text-forest font-medium">2:00</span>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>
            </section>
          </motion.div>
        )}

        {/* ═══════════════ ACTIVE / PRACTICE MODE ═══════════════ */}
        {phase === "active" && session && currentAsanaData && currentSessionAsana && (
          <motion.div
            key="active"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="pt-20 pb-8 min-h-screen flex flex-col"
          >
            {/* Back to overview + progress bar */}
            <div className="container max-w-5xl mx-auto px-4 mt-4 mb-4">
              <button
                onClick={endSession}
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Overview
              </button>

              <div className="mb-2">
                <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
                  <span>
                    Pose {session.currentAsanaIndex + 1} of {session.asanas.length}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {formatTime(
                      session.asanas
                        .slice(session.currentAsanaIndex)
                        .reduce((sum, a) => sum + a.durationSeconds, 0) - currentTime
                    )}{" "}
                    remaining
                  </span>
                </div>
                <div className="h-2 bg-cream-dark rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-forest rounded-full"
                    animate={{ width: `${totalProgress}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
              </div>
            </div>

            {/* Current step card (Surya Namaskar style) */}
            <div className="container max-w-5xl mx-auto px-4 flex-1 flex flex-col">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentAsanaData.id + "-" + session.currentAsanaIndex}
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  transition={{ duration: 0.3 }}
                  className="bg-card border-2 border-forest/20 rounded-3xl p-8 mb-8"
                >
                  <div className="flex flex-col md:flex-row items-center gap-8">
                    {/* Large image */}
                    <div className="w-40 h-40 md:w-56 md:h-56 rounded-2xl overflow-hidden bg-white border border-border/50 flex items-center justify-center shrink-0">
                      {asanaImages[currentAsanaData.id] ? (
                        <img
                          src={asanaImages[currentAsanaData.id]}
                          alt={currentAsanaData.english_name}
                          className="w-full h-full object-contain p-4"
                        />
                      ) : (
                        <Leaf className="w-12 h-12 text-forest/20" />
                      )}
                    </div>

                    {/* Step info */}
                    <div className="flex-1 text-center md:text-left">
                      <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
                        <span className="text-sm font-bold text-forest bg-sage-light/60 px-3 py-1 rounded-full">
                          Pose {session.currentAsanaIndex + 1}
                        </span>
                        {(() => {
                          const breath = getBreathCue(currentAsanaData);
                          return (
                            <span className={`text-sm px-3 py-1 rounded-full font-medium ${breath.color}`}>
                              <Wind className="w-3.5 h-3.5 inline mr-1" />
                              {breath.label}
                            </span>
                          );
                        })()}
                      </div>
                      <h2 className="font-serif text-3xl font-bold text-foreground mb-1">
                        {currentAsanaData.english_name}
                      </h2>
                      <p className="text-sm text-muted-foreground italic mb-4">
                        {currentAsanaData.sanskrit_name}
                      </p>
                      <p className="text-foreground/80 leading-relaxed mb-3">
                        {currentAsanaData.description.split(".").slice(0, 3).join(".") + "."}
                      </p>
                      {currentAsanaData.precautions && (
                        <p className="text-sm text-muted-foreground flex items-start gap-1.5 justify-center md:justify-start">
                          <Info className="w-4 h-4 mt-0.5 shrink-0" />
                          {currentAsanaData.precautions}
                        </p>
                      )}

                      {/* Timer bar */}
                      <div className="mt-6 flex items-center justify-center md:justify-start gap-4">
                        <div className="text-4xl font-mono font-bold text-forest tabular-nums">
                          {formatTime(Math.max(0, currentSessionAsana.durationSeconds - currentTime))}
                        </div>
                        <div className="h-3 flex-1 max-w-48 bg-cream-dark rounded-full overflow-hidden">
                          <motion.div
                            className="h-full bg-forest rounded-full"
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 0.5 }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* Controls */}
              <div className="flex items-center justify-center gap-4 mb-8">
                <button
                  onClick={prevAsana}
                  disabled={session.currentAsanaIndex === 0}
                  className="w-12 h-12 rounded-full bg-cream-dark flex items-center justify-center hover:bg-border transition-colors disabled:opacity-30"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={togglePause}
                  className="w-16 h-16 rounded-full bg-forest text-cream flex items-center justify-center hover:bg-forest-light transition-colors shadow-lg"
                >
                  {isPaused ? <Play className="w-7 h-7 ml-1" /> : <Pause className="w-7 h-7" />}
                </button>
                <button
                  onClick={skipAsana}
                  className="w-12 h-12 rounded-full bg-cream-dark flex items-center justify-center hover:bg-border transition-colors"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setSoundEnabled(!soundEnabled)}
                  className="w-10 h-10 rounded-full bg-cream-dark flex items-center justify-center hover:bg-border transition-colors"
                >
                  {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                </button>
                <button
                  onClick={endSession}
                  className="w-10 h-10 rounded-full bg-cream-dark flex items-center justify-center hover:bg-border transition-colors"
                  title="End session"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>

              {/* Step thumbnails strip */}
              <div ref={thumbnailsRef} className="flex gap-2 overflow-x-auto pb-4">
                {session.asanas.map((sa, i) => {
                  const asana = getAsanaById(sa.asanaId);
                  const isCurrent = i === session.currentAsanaIndex;
                  const isCompleted = sa.completed;
                  return (
                    <button
                      key={`${sa.asanaId}-${i}`}
                      onClick={() => {
                        if (!session) return;
                        const updated: SessionData = { ...session, currentAsanaIndex: i };
                        setSession(updated);
                        saveSession(updated);
                        setCurrentTime(0);
                      }}
                      className={`shrink-0 w-14 h-14 rounded-xl border-2 overflow-hidden flex items-center justify-center transition-all relative ${
                        isCurrent
                          ? "border-forest bg-sage-light/50 scale-110"
                          : isCompleted
                          ? "border-forest/30 bg-sage-light/20 opacity-60"
                          : "border-border bg-white"
                      }`}
                    >
                      {asanaImages[sa.asanaId] ? (
                        <img
                          src={asanaImages[sa.asanaId]}
                          alt={asana?.english_name || ""}
                          className="w-full h-full object-contain p-1"
                        />
                      ) : (
                        <span className="text-xs font-bold text-forest">{i + 1}</span>
                      )}
                      {isCompleted && (
                        <div className="absolute inset-0 bg-forest/10 flex items-center justify-center">
                          <Check className="w-4 h-4 text-forest" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}

        {/* ═══════════════ COMPLETE PHASE ═══════════════ */}
        {phase === "complete" && (
          <motion.div
            key="complete"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="pt-24 pb-16"
          >
            <div className="container max-w-2xl mx-auto px-4 text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", bounce: 0.4, delay: 0.2 }}
                className="w-24 h-24 rounded-full bg-forest/10 flex items-center justify-center mx-auto mb-6"
              >
                <Check className="w-12 h-12 text-forest" />
              </motion.div>

              <h1 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-3">
                Namaste
              </h1>
              <p className="text-lg text-muted-foreground mb-8">
                You've completed your {session?.durationMinutes}-minute yoga session with{" "}
                {session?.asanas.length} poses. Well done!
              </p>

              {/* Session summary */}
              {session && (
                <div className="bg-card border border-border rounded-3xl p-6 mb-8 text-left">
                  <h3 className="font-serif text-lg font-semibold mb-4">Session Summary</h3>
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="text-center p-3 bg-sage-light/30 rounded-xl">
                      <p className="font-serif text-2xl font-bold text-forest">{session.durationMinutes}</p>
                      <p className="text-xs text-muted-foreground">Minutes</p>
                    </div>
                    <div className="text-center p-3 bg-sage-light/30 rounded-xl">
                      <p className="font-serif text-2xl font-bold text-forest">{session.asanas.length}</p>
                      <p className="text-xs text-muted-foreground">Poses</p>
                    </div>
                    <div className="text-center p-3 bg-sage-light/30 rounded-xl">
                      <p className="font-serif text-2xl font-bold text-forest">
                        {session.asanas.filter((a) => a.completed).length}
                      </p>
                      <p className="text-xs text-muted-foreground">Completed</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {session.asanas.map((sa, i) => {
                      const asana = getAsanaById(sa.asanaId);
                      return (
                        <div
                          key={`${sa.asanaId}-${i}`}
                          className="flex items-center gap-3 py-2 border-b border-border/30 last:border-0"
                        >
                          <div className="w-8 h-8 rounded-lg overflow-hidden bg-white flex items-center justify-center shrink-0">
                            {asanaImages[sa.asanaId] ? (
                              <img
                                src={asanaImages[sa.asanaId]}
                                alt=""
                                className="w-full h-full object-contain p-0.5"
                              />
                            ) : (
                              <Leaf className="w-3 h-3 text-forest/30" />
                            )}
                          </div>
                          <span className="text-sm font-medium flex-1">
                            {asana?.english_name || sa.asanaId}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {formatTime(sa.durationSeconds)}
                          </span>
                          {sa.completed && <Check className="w-4 h-4 text-forest" />}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  onClick={() => {
                    clearSession();
                    setSession(null);
                    setPhase("setup");
                  }}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-forest text-cream rounded-full font-semibold"
                >
                  <RotateCcw className="w-4 h-4" />
                  New Session
                </button>
                <button
                  onClick={() => navigate(`/results?${search}`)}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-cream-dark text-foreground rounded-full font-medium"
                >
                  Back to Recommendations
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
