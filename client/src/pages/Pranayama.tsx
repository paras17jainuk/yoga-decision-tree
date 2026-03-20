/*
 * Design: Earth & Breath — Organic Modernism
 * Pranayama: Guided breathing exercises with animated visual timers
 * 6 techniques: Ujjayi, Kapalabhati, Nadi Shodhana, Bhramari, Sitali, Bhastrika
 * Features: Animated breathing circle, inhale/hold/exhale phases, round counter,
 * configurable rounds, sound cues, session tracking
 */
import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Wind,
  Play,
  Pause,
  RotateCcw,
  ArrowLeft,
  Volume2,
  VolumeX,
  AlertTriangle,
  Clock,
  Info,
  ChevronRight,
  Minus,
  Plus,
  Leaf,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import { asanaImages } from "@/data/asanaImages";
import { addSessionToHistory } from "@/lib/cookies";

/* ── Types ── */
interface BreathPhase {
  type: "inhale" | "exhale" | "hold" | "rest";
  duration: number; // seconds
  label: string;
}

interface PranayamaTechnique {
  id: string;
  name: string;
  sanskrit: string;
  imageKey: string;
  description: string;
  benefits: string[];
  contraindications: string[];
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  defaultRounds: number;
  maxRounds: number;
  phases: BreathPhase[];
  instructions: string[];
  color: string;
  bgColor: string;
}

/* ── Technique Data ── */
const TECHNIQUES: PranayamaTechnique[] = [
  {
    id: "ujjayi",
    name: "Ujjayi Breath",
    sanskrit: "Ujjayi Pranayama",
    imageKey: "ujjayi_pranayama",
    description: "The 'Victorious Breath' or 'Ocean Breath.' A slow, deep breathing technique where you gently constrict the back of the throat to create a soft ocean-like sound. The foundation of most yoga practices.",
    benefits: [
      "Calms the nervous system",
      "Increases oxygen absorption",
      "Builds internal heat",
      "Improves concentration and focus",
      "Reduces blood pressure",
    ],
    contraindications: [
      "Avoid if you have a sore throat or throat infection",
      "Those with very low blood pressure should practice gently",
    ],
    difficulty: "Beginner",
    defaultRounds: 10,
    maxRounds: 20,
    phases: [
      { type: "inhale", duration: 4, label: "Inhale through nose" },
      { type: "exhale", duration: 6, label: "Exhale through nose (ocean sound)" },
    ],
    instructions: [
      "Sit comfortably with a tall spine",
      "Gently constrict the back of your throat (like fogging a mirror)",
      "Inhale slowly through the nose for 4 counts",
      "Exhale slowly through the nose for 6 counts, maintaining the throat constriction",
      "The breath should sound like gentle ocean waves",
    ],
    color: "text-forest",
    bgColor: "bg-sage-light/50 border-sage/30",
  },
  {
    id: "kapalabhati",
    name: "Skull Shining Breath",
    sanskrit: "Kapalabhati Pranayama",
    imageKey: "kapalabhati_pranayama",
    description: "A powerful cleansing breath that involves rapid, forceful exhalations followed by passive inhalations. Known as 'Skull Shining Breath' because it clears the mind and energizes the body.",
    benefits: [
      "Detoxifies the lungs and blood",
      "Strengthens abdominal muscles",
      "Increases energy and alertness",
      "Improves digestion",
      "Clears nasal passages",
    ],
    contraindications: [
      "Avoid during pregnancy",
      "Not recommended for high blood pressure",
      "Avoid with heart disease or stroke history",
      "Skip if you have epilepsy or hernia",
      "Avoid during menstruation (some traditions)",
    ],
    difficulty: "Intermediate",
    defaultRounds: 3,
    maxRounds: 5,
    phases: [
      { type: "exhale", duration: 1, label: "Forceful exhale (pump belly)" },
      { type: "inhale", duration: 1, label: "Passive inhale (belly relaxes)" },
      { type: "exhale", duration: 1, label: "Forceful exhale" },
      { type: "inhale", duration: 1, label: "Passive inhale" },
      { type: "exhale", duration: 1, label: "Forceful exhale" },
      { type: "inhale", duration: 1, label: "Passive inhale" },
      { type: "exhale", duration: 1, label: "Forceful exhale" },
      { type: "inhale", duration: 1, label: "Passive inhale" },
      { type: "exhale", duration: 1, label: "Forceful exhale" },
      { type: "inhale", duration: 1, label: "Passive inhale" },
      { type: "exhale", duration: 1, label: "Forceful exhale" },
      { type: "inhale", duration: 1, label: "Passive inhale" },
      { type: "exhale", duration: 1, label: "Forceful exhale" },
      { type: "inhale", duration: 1, label: "Passive inhale" },
      { type: "exhale", duration: 1, label: "Forceful exhale" },
      { type: "inhale", duration: 1, label: "Passive inhale" },
      { type: "exhale", duration: 1, label: "Forceful exhale" },
      { type: "inhale", duration: 1, label: "Passive inhale" },
      { type: "exhale", duration: 1, label: "Forceful exhale" },
      { type: "inhale", duration: 1, label: "Passive inhale" },
      { type: "rest", duration: 10, label: "Rest — breathe normally" },
    ],
    instructions: [
      "Sit tall with hands on knees",
      "Take a deep breath in",
      "Exhale sharply through the nose by contracting the belly",
      "Let the inhale happen passively as the belly relaxes",
      "Repeat 20 rapid pumps per round",
      "Rest and breathe normally between rounds",
    ],
    color: "text-terracotta",
    bgColor: "bg-terracotta-light/40 border-terracotta/30",
  },
  {
    id: "nadi_shodhana",
    name: "Alternate Nostril Breathing",
    sanskrit: "Nadi Shodhana",
    imageKey: "nadi_shodhana",
    description: "A balancing breath that alternates between left and right nostrils. 'Nadi' means channel and 'Shodhana' means purification. This technique harmonizes the left and right hemispheres of the brain.",
    benefits: [
      "Balances the nervous system",
      "Reduces anxiety and stress",
      "Harmonizes brain hemispheres",
      "Improves respiratory function",
      "Promotes mental clarity and calm",
    ],
    contraindications: [
      "Avoid if you have a cold or blocked nose",
      "Those with severe anxiety should start with shorter sessions",
      "Avoid breath retention if you have heart conditions",
    ],
    difficulty: "Beginner",
    defaultRounds: 8,
    maxRounds: 15,
    phases: [
      { type: "inhale", duration: 4, label: "Inhale through LEFT nostril" },
      { type: "hold", duration: 2, label: "Hold (close both nostrils)" },
      { type: "exhale", duration: 4, label: "Exhale through RIGHT nostril" },
      { type: "inhale", duration: 4, label: "Inhale through RIGHT nostril" },
      { type: "hold", duration: 2, label: "Hold (close both nostrils)" },
      { type: "exhale", duration: 4, label: "Exhale through LEFT nostril" },
    ],
    instructions: [
      "Sit comfortably, left hand on left knee in chin mudra",
      "Use right thumb to close right nostril",
      "Inhale through left nostril for 4 counts",
      "Close both nostrils, hold for 2 counts",
      "Release right nostril, exhale for 4 counts",
      "Inhale through right nostril for 4 counts",
      "Close both, hold for 2 counts",
      "Release left nostril, exhale for 4 counts",
      "This completes one full round",
    ],
    color: "text-forest",
    bgColor: "bg-sage-light/50 border-sage/30",
  },
  {
    id: "bhramari",
    name: "Bee Breath",
    sanskrit: "Bhramari Pranayama",
    imageKey: "brahmari_pranayama",
    description: "A calming breath where you create a humming sound like a bee during exhalation. The vibration soothes the nervous system and is one of the most effective techniques for instant stress relief.",
    benefits: [
      "Instantly calms the mind",
      "Reduces anger and anxiety",
      "Lowers blood pressure",
      "Relieves tension headaches",
      "Improves concentration",
      "Beneficial for insomnia",
    ],
    contraindications: [
      "Avoid if you have an ear infection",
      "Do not practice lying down",
      "Those with very low blood pressure should be cautious",
    ],
    difficulty: "Beginner",
    defaultRounds: 7,
    maxRounds: 12,
    phases: [
      { type: "inhale", duration: 4, label: "Deep inhale through nose" },
      { type: "exhale", duration: 8, label: "Exhale with humming 'mmm' sound" },
    ],
    instructions: [
      "Sit comfortably with eyes closed",
      "Place index fingers on the tragus (ear cartilage)",
      "Inhale deeply through the nose for 4 counts",
      "While exhaling, gently press the tragus and make a humming sound",
      "Feel the vibration throughout your head and chest",
      "The humming should be smooth and steady",
    ],
    color: "text-rose",
    bgColor: "bg-rose-light/40 border-rose/30",
  },
  {
    id: "sitali",
    name: "Cooling Breath",
    sanskrit: "Sitali Pranayama",
    imageKey: "sitali_pranayama",
    description: "A cooling breath where you inhale through a curled tongue (or through the teeth if you can't curl your tongue). Excellent for reducing body heat, calming pitta dosha, and managing anger.",
    benefits: [
      "Cools the body temperature",
      "Reduces excess heat and pitta",
      "Calms anger and agitation",
      "Reduces fever and hot flashes",
      "Quenches thirst",
      "Soothes the digestive system",
    ],
    contraindications: [
      "Avoid in cold weather or if you feel cold",
      "Not recommended for those with asthma or respiratory congestion",
      "Avoid if you have very low blood pressure",
    ],
    difficulty: "Beginner",
    defaultRounds: 8,
    maxRounds: 15,
    phases: [
      { type: "inhale", duration: 4, label: "Inhale through curled tongue" },
      { type: "hold", duration: 2, label: "Close mouth, hold briefly" },
      { type: "exhale", duration: 6, label: "Exhale slowly through nose" },
    ],
    instructions: [
      "Sit comfortably with a tall spine",
      "Curl your tongue into a tube shape (or clench teeth and inhale through them)",
      "Inhale slowly through the curled tongue for 4 counts",
      "Close the mouth and hold for 2 counts",
      "Exhale slowly through the nose for 6 counts",
      "Feel the cooling sensation on the tongue and throat",
    ],
    color: "text-forest",
    bgColor: "bg-sage-light/50 border-sage/30",
  },
  {
    id: "bhastrika",
    name: "Bellows Breath",
    sanskrit: "Bhastrika Pranayama",
    imageKey: "bhastrika_pranayama_v2",
    description: "A powerful, energizing breath that involves forceful inhalations AND exhalations, like a bellows stoking a fire. More intense than Kapalabhati, it builds tremendous internal heat and energy.",
    benefits: [
      "Dramatically increases energy",
      "Strengthens the lungs",
      "Boosts metabolism",
      "Clears energy blockages",
      "Improves digestion",
      "Enhances mental clarity",
    ],
    contraindications: [
      "Avoid during pregnancy",
      "Not for high blood pressure or heart conditions",
      "Avoid with epilepsy or seizure disorders",
      "Skip if you have hernia or ulcers",
      "Avoid on a full stomach",
      "Not recommended for beginners without guidance",
    ],
    difficulty: "Advanced",
    defaultRounds: 3,
    maxRounds: 5,
    phases: [
      { type: "inhale", duration: 1, label: "Forceful inhale (expand belly)" },
      { type: "exhale", duration: 1, label: "Forceful exhale (contract belly)" },
      { type: "inhale", duration: 1, label: "Forceful inhale" },
      { type: "exhale", duration: 1, label: "Forceful exhale" },
      { type: "inhale", duration: 1, label: "Forceful inhale" },
      { type: "exhale", duration: 1, label: "Forceful exhale" },
      { type: "inhale", duration: 1, label: "Forceful inhale" },
      { type: "exhale", duration: 1, label: "Forceful exhale" },
      { type: "inhale", duration: 1, label: "Forceful inhale" },
      { type: "exhale", duration: 1, label: "Forceful exhale" },
      { type: "inhale", duration: 1, label: "Forceful inhale" },
      { type: "exhale", duration: 1, label: "Forceful exhale" },
      { type: "inhale", duration: 1, label: "Forceful inhale" },
      { type: "exhale", duration: 1, label: "Forceful exhale" },
      { type: "inhale", duration: 1, label: "Forceful inhale" },
      { type: "exhale", duration: 1, label: "Forceful exhale" },
      { type: "inhale", duration: 1, label: "Forceful inhale" },
      { type: "exhale", duration: 1, label: "Forceful exhale" },
      { type: "inhale", duration: 1, label: "Forceful inhale" },
      { type: "exhale", duration: 1, label: "Forceful exhale" },
      { type: "inhale", duration: 5, label: "Deep inhale — hold" },
      { type: "hold", duration: 5, label: "Retain breath" },
      { type: "exhale", duration: 5, label: "Slow, complete exhale" },
      { type: "rest", duration: 8, label: "Rest — breathe normally" },
    ],
    instructions: [
      "Sit tall with fists on knees",
      "Take a deep breath to prepare",
      "Begin forceful, equal inhales and exhales through the nose",
      "Both inhale and exhale are active and powerful",
      "Arms can pump up on inhale, down on exhale",
      "After 20 pumps, take a deep inhale and hold",
      "Exhale slowly and rest before the next round",
    ],
    color: "text-terracotta",
    bgColor: "bg-terracotta-light/40 border-terracotta/30",
  },
];

const difficultyColors: Record<string, string> = {
  Beginner: "bg-sage-light/60 text-forest",
  Intermediate: "bg-gold-light/60 text-gold-dark",
  Advanced: "bg-terracotta-light/60 text-terracotta",
};

const phaseColors: Record<string, { ring: string; bg: string; text: string }> = {
  inhale: { ring: "border-forest", bg: "bg-sage-light/60", text: "text-forest" },
  exhale: { ring: "border-terracotta", bg: "bg-terracotta-light/40", text: "text-terracotta" },
  hold: { ring: "border-gold", bg: "bg-gold-light/50", text: "text-gold-dark" },
  rest: { ring: "border-sage", bg: "bg-cream-dark/50", text: "text-muted-foreground" },
};

export default function Pranayama() {
  const [selectedTechnique, setSelectedTechnique] = useState<PranayamaTechnique | null>(null);
  const [mode, setMode] = useState<"browse" | "info" | "practice">("browse");
  const [rounds, setRounds] = useState(10);
  const [currentRound, setCurrentRound] = useState(0);
  const [currentPhaseIndex, setCurrentPhaseIndex] = useState(0);
  const [phaseTimeLeft, setPhaseTimeLeft] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showContraindications, setShowContraindications] = useState(false);
  const [practiceStartTime, setPracticeStartTime] = useState<number | null>(null);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const audioRef = useRef<AudioContext | null>(null);

  const currentPhase = selectedTechnique?.phases[currentPhaseIndex];

  const totalRoundDuration = useMemo(() => {
    if (!selectedTechnique) return 0;
    return selectedTechnique.phases.reduce((sum, p) => sum + p.duration, 0);
  }, [selectedTechnique]);

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
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.0);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 1.0);
    } catch { /* ignore */ }
  }, [soundEnabled]);

  const playTick = useCallback(() => {
    if (!soundEnabled) return;
    try {
      if (!audioRef.current) audioRef.current = new AudioContext();
      const ctx = audioRef.current;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = 880;
      osc.type = "sine";
      gain.gain.setValueAtTime(0.05, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.1);
    } catch { /* ignore */ }
  }, [soundEnabled]);

  // Timer logic
  useEffect(() => {
    if (!isPlaying || !selectedTechnique || isComplete) return;

    timerRef.current = setInterval(() => {
      setPhaseTimeLeft((prev) => {
        if (prev <= 1) {
          // Move to next phase
          const nextPhase = currentPhaseIndex + 1;
          if (nextPhase >= selectedTechnique.phases.length) {
            // Round complete
            const nextRound = currentRound + 1;
            if (nextRound >= rounds) {
              // All rounds complete
              setIsPlaying(false);
              setIsComplete(true);
              playBell();
              // Save session
              if (practiceStartTime) {
                const elapsed = Math.round((Date.now() - practiceStartTime) / 60000);
                addSessionToHistory({
                  id: `pranayama_${Date.now()}`,
                  completedAt: Date.now(),
                  durationMinutes: Math.round((totalRoundDuration * rounds) / 60),
                  actualMinutes: Math.max(1, elapsed),
                  asanaCount: 1,
                  asanaIds: [selectedTechnique.id],
                  conditions: [],
                  severity: null,
                  type: "custom",
                });
              }
              return 0;
            }
            setCurrentRound(nextRound);
            setCurrentPhaseIndex(0);
            playBell();
            return selectedTechnique.phases[0].duration;
          }
          setCurrentPhaseIndex(nextPhase);
          if (selectedTechnique.phases[nextPhase].type !== selectedTechnique.phases[currentPhaseIndex].type) {
            playTick();
          }
          return selectedTechnique.phases[nextPhase].duration;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, selectedTechnique, currentPhaseIndex, currentRound, rounds, isComplete, playBell, playTick, totalRoundDuration, practiceStartTime]);

  const selectTechnique = (t: PranayamaTechnique) => {
    setSelectedTechnique(t);
    setRounds(t.defaultRounds);
    setMode("info");
    resetPractice();
  };

  const startPractice = () => {
    setMode("practice");
    setCurrentRound(0);
    setCurrentPhaseIndex(0);
    setPhaseTimeLeft(selectedTechnique!.phases[0].duration);
    setIsPlaying(true);
    setIsComplete(false);
    setPracticeStartTime(Date.now());
  };

  const resetPractice = () => {
    setIsPlaying(false);
    setIsComplete(false);
    setCurrentRound(0);
    setCurrentPhaseIndex(0);
    setPhaseTimeLeft(0);
    setPracticeStartTime(null);
  };

  const goBack = () => {
    if (mode === "practice") {
      resetPractice();
      setMode("info");
    } else if (mode === "info") {
      setSelectedTechnique(null);
      setMode("browse");
    }
  };

  // Breathing circle scale based on phase
  const breathScale = currentPhase?.type === "inhale" ? 1.4 : currentPhase?.type === "exhale" ? 0.7 : 1.0;
  const phaseProgress = currentPhase ? 1 - (phaseTimeLeft / currentPhase.duration) : 0;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="pt-20 pb-16">
        <AnimatePresence mode="wait">
          {mode === "browse" ? (
            <motion.div
              key="browse"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="container max-w-6xl mx-auto px-4"
            >
              {/* Header */}
              <div className="text-center mb-12 pt-8">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-sage-light/50 rounded-full text-forest text-sm font-medium mb-4"
                >
                  <Wind className="w-4 h-4" />
                  Pranayama — Breath Control
                </motion.div>
                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="font-serif text-4xl md:text-5xl font-bold text-foreground mb-4"
                >
                  Guided Breathing Exercises
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-muted-foreground text-lg max-w-2xl mx-auto"
                >
                  Pranayama is the yogic science of breath control. These techniques regulate
                  prana (life force energy) to calm the mind, energize the body, and prepare
                  for meditation.
                </motion.p>
              </div>

              {/* Technique Cards */}
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {TECHNIQUES.map((t, i) => (
                  <motion.button
                    key={t.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 + i * 0.05 }}
                    onClick={() => selectTechnique(t)}
                    className={`text-left p-6 rounded-2xl border-2 ${t.bgColor} hover:shadow-lg transition-all duration-300 group`}
                  >
                    <div className="flex items-start gap-4 mb-4">
                      <div className="w-16 h-16 rounded-xl bg-white/80 flex items-center justify-center overflow-hidden flex-shrink-0">
                        <img
                          src={asanaImages[t.imageKey]}
                          alt={t.name}
                          className="w-14 h-14 object-contain"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-serif text-lg font-semibold text-foreground group-hover:text-forest transition-colors">
                          {t.name}
                        </h3>
                        <p className="text-sm text-muted-foreground italic">{t.sanskrit}</p>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{t.description}</p>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-xs px-2 py-1 rounded-full ${difficultyColors[t.difficulty]}`}>
                        {t.difficulty}
                      </span>
                      <span className="text-xs px-2 py-1 rounded-full bg-cream-dark/50 text-muted-foreground">
                        {t.defaultRounds} rounds
                      </span>
                      <span className="text-xs px-2 py-1 rounded-full bg-cream-dark/50 text-muted-foreground">
                        ~{Math.round((t.phases.reduce((s, p) => s + p.duration, 0) * t.defaultRounds) / 60)} min
                      </span>
                    </div>
                    <div className="mt-4 flex items-center gap-1 text-sm text-forest font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                      Learn & Practice <ChevronRight className="w-4 h-4" />
                    </div>
                  </motion.button>
                ))}
              </div>

              {/* General Pranayama Safety */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="mt-12 p-6 bg-gold-light/30 border border-gold/30 rounded-2xl"
              >
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-gold-dark mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-serif text-lg font-semibold text-foreground mb-2">
                      General Pranayama Safety
                    </h3>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>Always practice on an empty stomach (wait 2-3 hours after eating)</li>
                      <li>Never force the breath — if you feel dizzy, stop and breathe normally</li>
                      <li>Start with fewer rounds and gradually increase</li>
                      <li>Practice in a well-ventilated space</li>
                      <li>Consult a doctor if you have respiratory or cardiovascular conditions</li>
                      <li>Pregnant women should only practice gentle techniques (Ujjayi, Nadi Shodhana)</li>
                    </ul>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          ) : mode === "info" && selectedTechnique ? (
            <motion.div
              key="info"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              className="container max-w-4xl mx-auto px-4 pt-4"
            >
              {/* Back button */}
              <button onClick={goBack} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
                <ArrowLeft className="w-4 h-4" /> Back to techniques
              </button>

              {/* Technique header */}
              <div className="flex flex-col md:flex-row gap-8 mb-8">
                <div className="w-40 h-40 rounded-2xl bg-white border border-border overflow-hidden flex-shrink-0 mx-auto md:mx-0">
                  <img
                    src={asanaImages[selectedTechnique.imageKey]}
                    alt={selectedTechnique.name}
                    className="w-full h-full object-contain p-2"
                  />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`text-xs px-2 py-1 rounded-full ${difficultyColors[selectedTechnique.difficulty]}`}>
                      {selectedTechnique.difficulty}
                    </span>
                  </div>
                  <h1 className="font-serif text-3xl font-bold text-foreground mb-1">
                    {selectedTechnique.name}
                  </h1>
                  <p className="text-muted-foreground italic mb-3">{selectedTechnique.sanskrit}</p>
                  <p className="text-foreground/80">{selectedTechnique.description}</p>
                </div>
              </div>

              {/* Benefits */}
              <div className="mb-6 p-5 bg-sage-light/30 border border-sage/20 rounded-xl">
                <h3 className="font-serif text-lg font-semibold text-forest mb-3 flex items-center gap-2">
                  <Leaf className="w-4 h-4" /> Benefits
                </h3>
                <ul className="grid md:grid-cols-2 gap-2">
                  {selectedTechnique.benefits.map((b, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-foreground/80">
                      <span className="w-1.5 h-1.5 rounded-full bg-forest mt-1.5 flex-shrink-0" />
                      {b}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Instructions */}
              <div className="mb-6 p-5 bg-card border border-border rounded-xl">
                <h3 className="font-serif text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
                  <Info className="w-4 h-4" /> How to Practice
                </h3>
                <ol className="space-y-2">
                  {selectedTechnique.instructions.map((inst, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-foreground/80">
                      <span className="w-6 h-6 rounded-full bg-sage-light flex items-center justify-center text-xs font-semibold text-forest flex-shrink-0">
                        {i + 1}
                      </span>
                      {inst}
                    </li>
                  ))}
                </ol>
              </div>

              {/* Contraindications */}
              {selectedTechnique.contraindications.length > 0 && (
                <div className="mb-8 p-5 bg-gold-light/30 border border-gold/30 rounded-xl">
                  <h3 className="font-serif text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-gold-dark" /> Contraindications
                  </h3>
                  <ul className="space-y-1">
                    {selectedTechnique.contraindications.map((c, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-foreground/80">
                        <span className="w-1.5 h-1.5 rounded-full bg-gold-dark mt-1.5 flex-shrink-0" />
                        {c}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Rounds selector + Start */}
              <div className="flex flex-col sm:flex-row items-center gap-6 p-6 bg-card border border-border rounded-2xl">
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium text-foreground">Rounds:</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setRounds(Math.max(1, rounds - 1))}
                      className="w-8 h-8 rounded-full bg-sage-light flex items-center justify-center hover:bg-sage transition-colors"
                    >
                      <Minus className="w-4 h-4 text-forest" />
                    </button>
                    <span className="w-10 text-center text-xl font-semibold text-foreground">{rounds}</span>
                    <button
                      onClick={() => setRounds(Math.min(selectedTechnique.maxRounds, rounds + 1))}
                      className="w-8 h-8 rounded-full bg-sage-light flex items-center justify-center hover:bg-sage transition-colors"
                    >
                      <Plus className="w-4 h-4 text-forest" />
                    </button>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    ~{Math.round((totalRoundDuration * rounds) / 60)} min
                  </span>
                </div>
                <button
                  onClick={startPractice}
                  className="flex items-center gap-2 px-8 py-3 bg-forest text-cream rounded-full font-semibold hover:bg-forest-light transition-colors"
                >
                  <Play className="w-5 h-5" /> Start Practice
                </button>
              </div>
            </motion.div>
          ) : mode === "practice" && selectedTechnique ? (
            <motion.div
              key="practice"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="container max-w-3xl mx-auto px-4 pt-4"
            >
              {/* Top bar */}
              <div className="flex items-center justify-between mb-8">
                <button onClick={goBack} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setSoundEnabled(!soundEnabled)}
                    className="p-2 rounded-full hover:bg-sage-light transition-colors"
                  >
                    {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Title */}
              <div className="text-center mb-6">
                <h2 className="font-serif text-2xl font-bold text-foreground">{selectedTechnique.name}</h2>
                <p className="text-sm text-muted-foreground italic">{selectedTechnique.sanskrit}</p>
              </div>

              {/* Round counter */}
              <div className="flex items-center justify-center gap-2 mb-8">
                {Array.from({ length: rounds }).map((_, i) => (
                  <div
                    key={i}
                    className={`w-3 h-3 rounded-full transition-all duration-300 ${
                      i < currentRound
                        ? "bg-forest scale-100"
                        : i === currentRound && isPlaying
                        ? "bg-forest/60 scale-125"
                        : "bg-border"
                    }`}
                  />
                ))}
                <span className="ml-3 text-sm text-muted-foreground">
                  Round {currentRound + 1} / {rounds}
                </span>
              </div>

              {/* Breathing Circle */}
              {!isComplete ? (
                <div className="flex flex-col items-center mb-8">
                  <div className="relative w-64 h-64 flex items-center justify-center mb-6">
                    {/* Outer ring - progress */}
                    <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
                      <circle
                        cx="50" cy="50" r="46"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        className="text-border"
                      />
                      <circle
                        cx="50" cy="50" r="46"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeDasharray={`${2 * Math.PI * 46}`}
                        strokeDashoffset={`${2 * Math.PI * 46 * (1 - phaseProgress)}`}
                        strokeLinecap="round"
                        className={phaseColors[currentPhase?.type || "rest"].text}
                        style={{ transition: "stroke-dashoffset 0.3s ease" }}
                      />
                    </svg>

                    {/* Breathing circle */}
                    <motion.div
                      animate={{
                        scale: isPlaying ? breathScale : 1,
                      }}
                      transition={{
                        duration: currentPhase?.duration || 2,
                        ease: "easeInOut",
                      }}
                      className={`w-40 h-40 rounded-full border-4 ${
                        phaseColors[currentPhase?.type || "rest"].ring
                      } ${phaseColors[currentPhase?.type || "rest"].bg} flex items-center justify-center`}
                    >
                      <div className="text-center">
                        <div className={`text-4xl font-bold ${phaseColors[currentPhase?.type || "rest"].text}`}>
                          {phaseTimeLeft}
                        </div>
                        <div className={`text-sm font-medium ${phaseColors[currentPhase?.type || "rest"].text} capitalize`}>
                          {currentPhase?.type || "ready"}
                        </div>
                      </div>
                    </motion.div>
                  </div>

                  {/* Phase instruction */}
                  <AnimatePresence mode="wait">
                    <motion.p
                      key={currentPhaseIndex}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="text-center text-foreground/80 font-medium mb-8 h-6"
                    >
                      {currentPhase?.label || "Get ready..."}
                    </motion.p>
                  </AnimatePresence>

                  {/* Controls */}
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => {
                        resetPractice();
                        startPractice();
                      }}
                      className="p-3 rounded-full bg-cream-dark hover:bg-sage-light transition-colors"
                    >
                      <RotateCcw className="w-5 h-5 text-foreground" />
                    </button>
                    <button
                      onClick={() => setIsPlaying(!isPlaying)}
                      className="w-16 h-16 rounded-full bg-forest text-cream flex items-center justify-center hover:bg-forest-light transition-colors"
                    >
                      {isPlaying ? <Pause className="w-7 h-7" /> : <Play className="w-7 h-7 ml-1" />}
                    </button>
                  </div>
                </div>
              ) : (
                /* Completion screen */
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-12"
                >
                  <div className="w-20 h-20 rounded-full bg-sage-light flex items-center justify-center mx-auto mb-6">
                    <Wind className="w-10 h-10 text-forest" />
                  </div>
                  <h3 className="font-serif text-2xl font-bold text-foreground mb-2">
                    Practice Complete
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    You completed {rounds} rounds of {selectedTechnique.name}.
                    Take a moment to notice how you feel.
                  </p>
                  <div className="flex items-center justify-center gap-4">
                    <button
                      onClick={() => {
                        resetPractice();
                        startPractice();
                      }}
                      className="px-6 py-3 bg-sage-light text-forest rounded-full font-medium hover:bg-sage transition-colors"
                    >
                      Practice Again
                    </button>
                    <button
                      onClick={() => {
                        resetPractice();
                        setMode("browse");
                        setSelectedTechnique(null);
                      }}
                      className="px-6 py-3 bg-forest text-cream rounded-full font-medium hover:bg-forest-light transition-colors"
                    >
                      All Techniques
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Technique image (small) */}
              {!isComplete && (
                <div className="flex justify-center mt-4">
                  <div className="w-24 h-24 rounded-xl bg-white border border-border overflow-hidden">
                    <img
                      src={asanaImages[selectedTechnique.imageKey]}
                      alt={selectedTechnique.name}
                      className="w-full h-full object-contain p-1"
                    />
                  </div>
                </div>
              )}
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </div>
  );
}
