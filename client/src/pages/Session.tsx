/*
 * Design: Earth & Breath — Organic Modernism
 * Session: Cookie-based yoga session with timer, asana scheduling
 * Start session → configure duration → auto-divide into asana blocks → guided practice
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
  Timer,
  Leaf,
  ArrowLeft,
  Volume2,
  VolumeX,
  Settings,
  X,
  Minus,
  Plus,
  AlertTriangle,
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
  // Reserve 2 min for savasana at end if total >= 10 min
  const hasSavasana = totalMinutes >= 10;
  const savasanaTime = hasSavasana ? 120 : 0;
  const practiceTime = totalSeconds - savasanaTime;

  // Filter out savasana from main list if we're adding it at end
  const mainAsanas = hasSavasana
    ? asanas.filter((a) => a.id !== "savasana")
    : asanas;

  const perAsana = Math.max(30, Math.floor(practiceTime / Math.max(mainAsanas.length, 1)));
  const result: SessionAsana[] = mainAsanas.map((a) => ({
    asanaId: a.id,
    durationSeconds: perAsana,
    completed: false,
  }));

  // Distribute remaining time to first few asanas
  let remaining = practiceTime - perAsana * mainAsanas.length;
  for (let i = 0; i < result.length && remaining > 0; i++) {
    const extra = Math.min(15, remaining);
    result[i].durationSeconds += extra;
    remaining -= extra;
  }

  // Add savasana at the end
  if (hasSavasana) {
    result.push({
      asanaId: "savasana",
      durationSeconds: savasanaTime,
      completed: false,
    });
  }

  return result;
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

  // Get recommended asanas from the engine
  const recommendedAsanas = useMemo(() => {
    if (conditionIds.length === 0) return [];
    const results = generateRecommendations(conditionIds, severity);
    return results.recommended
      .map((r) => r.asana)
      .filter((a) => a.type !== "pranayama"); // Filter out breathing exercises for main session
  }, [conditionIds, severity]);

  // Session state
  const [session, setSession] = useState<SessionData | null>(null);
  const [phase, setPhase] = useState<"setup" | "active" | "complete">("setup");
  const [durationMinutes, setDurationMinutes] = useState(30);
  const [currentTime, setCurrentTime] = useState(0); // seconds elapsed in current asana
  const [isPaused, setIsPaused] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const audioRef = useRef<AudioContext | null>(null);

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
      if (!audioRef.current) {
        audioRef.current = new AudioContext();
      }
      const ctx = audioRef.current;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = 528; // Solfeggio frequency
      osc.type = "sine";
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.5);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 1.5);
    } catch {
      // Audio not supported
    }
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
          // Move to next asana
          const updatedAsanas = [...session.asanas];
          updatedAsanas[session.currentAsanaIndex] = {
            ...updatedAsanas[session.currentAsanaIndex],
            completed: true,
          };

          const nextIndex = session.currentAsanaIndex + 1;
          if (nextIndex >= session.asanas.length) {
            // Session complete
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

            // Save to history
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

        // Periodic save every 10 seconds
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

  // Pause/resume
  const togglePause = useCallback(() => {
    if (!session) return;
    const newPaused = !isPaused;
    setIsPaused(newPaused);
    const updated = { ...session, status: newPaused ? "paused" as const : "active" as const };
    setSession(updated);
    saveSession(updated);
  }, [session, isPaused]);

  // Skip to next asana
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

  // End session
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
        {/* SETUP PHASE */}
        {phase === "setup" && (
          <motion.div
            key="setup"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: -20 }}
            className="pt-24 pb-16"
          >
            <div className="container max-w-3xl mx-auto px-4">
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
                transition={{ delay: 0.1 }}
                className="text-center mb-12"
              >
                <div className="w-16 h-16 rounded-full bg-forest/10 flex items-center justify-center mx-auto mb-4">
                  <Timer className="w-8 h-8 text-forest" />
                </div>
                <h1 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-3">
                  Start Your Session
                </h1>
                <p className="text-muted-foreground text-lg max-w-lg mx-auto">
                  We'll create a guided practice from your recommended asanas, perfectly timed to your schedule.
                </p>
              </motion.div>

              {/* Duration selector */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-card border border-border rounded-3xl p-8 mb-8"
              >
                <h2 className="font-serif text-xl font-semibold mb-6 text-center">
                  Session Duration
                </h2>

                <div className="flex items-center justify-center gap-6 mb-6">
                  <button
                    onClick={() => setDurationMinutes(Math.max(5, durationMinutes - 5))}
                    className="w-12 h-12 rounded-full bg-sage-light flex items-center justify-center hover:bg-sage transition-colors"
                  >
                    <Minus className="w-5 h-5 text-forest-dark" />
                  </button>

                  <div className="text-center">
                    <span className="font-serif text-6xl font-bold text-forest tabular-nums">
                      {durationMinutes}
                    </span>
                    <p className="text-sm text-muted-foreground mt-1">minutes</p>
                  </div>

                  <button
                    onClick={() => setDurationMinutes(Math.min(120, durationMinutes + 5))}
                    className="w-12 h-12 rounded-full bg-sage-light flex items-center justify-center hover:bg-sage transition-colors"
                  >
                    <Plus className="w-5 h-5 text-forest-dark" />
                  </button>
                </div>

                {/* Quick presets */}
                <div className="flex justify-center gap-2 mb-6">
                  {[10, 15, 20, 30, 45, 60].map((min) => (
                    <button
                      key={min}
                      onClick={() => setDurationMinutes(min)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                        durationMinutes === min
                          ? "bg-forest text-cream"
                          : "bg-sage-light text-forest-dark hover:bg-sage"
                      }`}
                    >
                      {min}m
                    </button>
                  ))}
                </div>

                <div className="text-center text-sm text-muted-foreground">
                  <p>
                    {recommendedAsanas.length} recommended asanas available
                    {recommendedAsanas.length > 15 && " (top 15 will be used)"}
                  </p>
                  <p className="mt-1">
                    ~{Math.floor((durationMinutes * 60) / Math.min(recommendedAsanas.length, 15))}s per asana
                    {durationMinutes >= 10 && " + 2 min Savasana"}
                  </p>
                </div>
              </motion.div>

              {/* Asana preview */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-card border border-border rounded-3xl p-6 mb-8"
              >
                <h3 className="font-serif text-lg font-semibold mb-4">Session Preview</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {recommendedAsanas.slice(0, 15).map((asana, i) => (
                    <div
                      key={asana.id}
                      className="flex flex-col items-center gap-2 p-3 bg-sage-light/30 rounded-xl"
                    >
                      <div className="w-16 h-16 rounded-xl overflow-hidden bg-white flex items-center justify-center">
                        {asanaImages[asana.id] ? (
                          <img
                            src={asanaImages[asana.id]}
                            alt={asana.english_name}
                            className="w-full h-full object-contain p-1"
                          />
                        ) : (
                          <Leaf className="w-6 h-6 text-forest/30" />
                        )}
                      </div>
                      <span className="text-xs text-center font-medium text-foreground/80 leading-tight">
                        {asana.english_name}
                      </span>
                      <span className="text-[10px] text-muted-foreground">#{i + 1}</span>
                    </div>
                  ))}
                  {durationMinutes >= 10 && (
                    <div className="flex flex-col items-center gap-2 p-3 bg-forest/5 rounded-xl border border-forest/10">
                      <div className="w-16 h-16 rounded-xl overflow-hidden bg-white flex items-center justify-center">
                        {asanaImages["savasana"] ? (
                          <img
                            src={asanaImages["savasana"]}
                            alt="Savasana"
                            className="w-full h-full object-contain p-1"
                          />
                        ) : (
                          <Leaf className="w-6 h-6 text-forest/30" />
                        )}
                      </div>
                      <span className="text-xs text-center font-medium text-foreground/80 leading-tight">
                        Savasana
                      </span>
                      <span className="text-[10px] text-forest">Final Rest</span>
                    </div>
                  )}
                </div>
              </motion.div>

              {/* Start button */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-center"
              >
                <button
                  onClick={startSession}
                  className="inline-flex items-center gap-3 px-10 py-4 bg-forest text-cream text-lg font-semibold rounded-full hover:bg-forest-light transition-all shadow-lg hover:shadow-xl"
                >
                  <Play className="w-6 h-6" />
                  Begin Session
                </button>
              </motion.div>
            </div>
          </motion.div>
        )}

        {/* ACTIVE SESSION PHASE */}
        {phase === "active" && session && currentAsanaData && currentSessionAsana && (
          <motion.div
            key="active"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="pt-20 pb-8 min-h-screen flex flex-col"
          >
            {/* Top progress bar */}
            <div className="fixed top-16 left-0 right-0 z-40 bg-cream/80 backdrop-blur-sm border-b border-border">
              <div className="h-1 bg-sage-light">
                <motion.div
                  className="h-full bg-forest"
                  animate={{ width: `${totalProgress}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
              <div className="container flex items-center justify-between py-2 text-xs text-muted-foreground">
                <span>
                  Pose {session.currentAsanaIndex + 1} of {session.asanas.length}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {formatTime(
                    session.asanas
                      .slice(session.currentAsanaIndex)
                      .reduce((sum, a) => sum + a.durationSeconds, 0) - currentTime
                  )}{" "}
                  remaining
                </span>
              </div>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center px-4 mt-12">
              {/* Current asana display */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentAsanaData.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.4 }}
                  className="text-center max-w-lg w-full"
                >
                  {/* Asana image */}
                  <div className="w-48 h-48 md:w-64 md:h-64 mx-auto mb-6 rounded-3xl overflow-hidden bg-white shadow-lg border border-sage/20">
                    {asanaImages[currentAsanaData.id] ? (
                      <img
                        src={asanaImages[currentAsanaData.id]}
                        alt={currentAsanaData.english_name}
                        className="w-full h-full object-contain p-4"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Leaf className="w-16 h-16 text-forest/20" />
                      </div>
                    )}
                  </div>

                  {/* Asana name */}
                  <p className="text-sm text-forest font-medium uppercase tracking-wider mb-1">
                    {currentAsanaData.sanskrit_name}
                  </p>
                  <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-2">
                    {currentAsanaData.english_name}
                  </h2>
                  <p className="text-sm text-muted-foreground mb-8 max-w-md mx-auto leading-relaxed">
                    {currentAsanaData.description.split(".").slice(0, 2).join(".") + "."}
                  </p>

                  {/* Circular timer */}
                  <div className="relative w-40 h-40 mx-auto mb-8">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                      <circle
                        cx="60"
                        cy="60"
                        r="54"
                        fill="none"
                        stroke="oklch(0.88 0.04 155)"
                        strokeWidth="6"
                      />
                      <circle
                        cx="60"
                        cy="60"
                        r="54"
                        fill="none"
                        stroke="oklch(0.35 0.08 155)"
                        strokeWidth="6"
                        strokeLinecap="round"
                        strokeDasharray={`${2 * Math.PI * 54}`}
                        strokeDashoffset={`${2 * Math.PI * 54 * (1 - progress / 100)}`}
                        className="transition-all duration-1000 ease-linear"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="font-serif text-3xl font-bold text-foreground tabular-nums">
                        {formatTime(
                          Math.max(0, currentSessionAsana.durationSeconds - currentTime)
                        )}
                      </span>
                      <span className="text-xs text-muted-foreground">remaining</span>
                    </div>
                  </div>

                  {/* Controls */}
                  <div className="flex items-center justify-center gap-4">
                    <button
                      onClick={() => setSoundEnabled(!soundEnabled)}
                      className="w-12 h-12 rounded-full bg-sage-light flex items-center justify-center hover:bg-sage transition-colors"
                      title={soundEnabled ? "Mute" : "Unmute"}
                    >
                      {soundEnabled ? (
                        <Volume2 className="w-5 h-5 text-forest-dark" />
                      ) : (
                        <VolumeX className="w-5 h-5 text-muted-foreground" />
                      )}
                    </button>

                    <button
                      onClick={togglePause}
                      className="w-16 h-16 rounded-full bg-forest text-cream flex items-center justify-center hover:bg-forest-light transition-colors shadow-lg"
                    >
                      {isPaused ? (
                        <Play className="w-7 h-7 ml-0.5" />
                      ) : (
                        <Pause className="w-7 h-7" />
                      )}
                    </button>

                    <button
                      onClick={skipAsana}
                      className="w-12 h-12 rounded-full bg-sage-light flex items-center justify-center hover:bg-sage transition-colors"
                      title="Skip to next"
                    >
                      <SkipForward className="w-5 h-5 text-forest-dark" />
                    </button>
                  </div>

                  {/* End session button */}
                  <button
                    onClick={endSession}
                    className="mt-6 text-sm text-muted-foreground hover:text-rose transition-colors flex items-center gap-1.5 mx-auto"
                  >
                    <X className="w-4 h-4" />
                    End Session
                  </button>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Bottom asana timeline */}
            <div className="container max-w-4xl mx-auto px-4 mt-auto">
              <div className="bg-card border border-border rounded-2xl p-4 overflow-x-auto">
                <div className="flex gap-2 min-w-max">
                  {session.asanas.map((sa, i) => {
                    const asana = getAsanaById(sa.asanaId);
                    const isCurrent = i === session.currentAsanaIndex;
                    const isCompleted = sa.completed;
                    return (
                      <div
                        key={`${sa.asanaId}-${i}`}
                        className={`flex flex-col items-center gap-1.5 px-3 py-2 rounded-xl transition-all min-w-[72px] ${
                          isCurrent
                            ? "bg-forest/10 border border-forest/30"
                            : isCompleted
                            ? "bg-sage-light/50 opacity-60"
                            : "opacity-40"
                        }`}
                      >
                        <div className="w-10 h-10 rounded-lg overflow-hidden bg-white flex items-center justify-center">
                          {asanaImages[sa.asanaId] ? (
                            <img
                              src={asanaImages[sa.asanaId]}
                              alt={asana?.english_name || ""}
                              className="w-full h-full object-contain p-0.5"
                            />
                          ) : (
                            <Leaf className="w-4 h-4 text-forest/30" />
                          )}
                        </div>
                        <span className="text-[10px] font-medium text-center leading-tight max-w-[64px] truncate">
                          {asana?.english_name || sa.asanaId}
                        </span>
                        {isCompleted && (
                          <Check className="w-3 h-3 text-forest" />
                        )}
                        {isCurrent && (
                          <div className="w-1.5 h-1.5 rounded-full bg-forest animate-pulse" />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* COMPLETE PHASE */}
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
                  className="inline-flex items-center gap-2 px-6 py-3 bg-sage-light text-forest-dark rounded-full font-medium"
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
