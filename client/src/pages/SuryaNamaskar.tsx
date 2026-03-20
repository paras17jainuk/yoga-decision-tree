/*
 * Design: Earth & Breath — Organic Modernism
 * Surya Namaskar: Dedicated practice page for Sun Salutation sequences
 * Features: Surya Namaskar A (12 steps) and B (Ashtanga), step-by-step guided flow,
 * contraindications, timer, breathing cues, transition video mode
 */
import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sun,
  Play,
  Pause,
  SkipForward,
  RotateCcw,
  ChevronRight,
  ChevronLeft,
  AlertTriangle,
  Clock,
  Wind,
  ArrowLeft,
  Check,
  Volume2,
  VolumeX,
  Leaf,
  Info,
  Film,
  Image as ImageIcon,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import { asanaImages } from "@/data/asanaImages";
import { suryaATransitionVideos, suryaBTransitionVideos } from "@/data/transitionVideos";
import { Switch } from "@/components/ui/switch";

/* ── Surya Namaskar A Steps ── */
interface FlowStep {
  name: string;
  sanskrit: string;
  imageKey: string;
  breath: "Inhale" | "Exhale" | "Hold" | "Normal";
  duration: number; // seconds
  instruction: string;
  tips: string;
}

const SURYA_A: FlowStep[] = [
  {
    name: "Prayer Pose",
    sanskrit: "Pranamasana",
    imageKey: "pranamasana",
    breath: "Normal",
    duration: 5,
    instruction: "Stand at the front of your mat with feet together. Bring palms together at heart center. Ground through all four corners of your feet.",
    tips: "Close your eyes, set an intention for your practice. Feel the weight evenly distributed.",
  },
  {
    name: "Raised Arms Pose",
    sanskrit: "Hasta Uttanasana",
    imageKey: "urdhva_hastasana",
    breath: "Inhale",
    duration: 5,
    instruction: "Sweep arms overhead, arching gently back. Reach fingertips toward the sky, lengthening the entire front body.",
    tips: "Keep shoulders away from ears. Only arch back as far as comfortable — avoid compressing the lower back.",
  },
  {
    name: "Standing Forward Bend",
    sanskrit: "Uttanasana",
    imageKey: "uttanasana",
    breath: "Exhale",
    duration: 5,
    instruction: "Fold forward from the hips, bringing hands to the floor or shins. Let the head hang heavy, releasing the neck.",
    tips: "Bend knees generously if hamstrings are tight. The goal is to fold from the hips, not round the back.",
  },
  {
    name: "Equestrian Pose",
    sanskrit: "Ashwa Sanchalanasana",
    imageKey: "ashwa_sanchalanasana_mirrored",
    breath: "Inhale",
    duration: 5,
    instruction: "Step the right foot back into a deep lunge. Drop the back knee to the mat. Hands flat on the floor framing the front foot. Look up, opening the chest.",
    tips: "Keep front knee directly over the ankle. Press hips forward and down for a deep hip flexor stretch.",
  },
  {
    name: "Plank Pose",
    sanskrit: "Dandasana / Phalakasana",
    imageKey: "phalakasana_v2",
    breath: "Hold",
    duration: 5,
    instruction: "Step the left foot back to meet the right, forming a straight line from head to heels. Engage the core.",
    tips: "Don't let hips sag or pike up. Spread fingers wide, press firmly through the palms.",
  },
  {
    name: "Eight-Limbed Salute",
    sanskrit: "Ashtanga Namaskara",
    imageKey: "ashtanga_namaskara",
    breath: "Exhale",
    duration: 5,
    instruction: "Lower knees, chest, and chin to the floor. Keep hips slightly elevated. Eight points touch the ground: two feet, two knees, two hands, chest, chin.",
    tips: "This is a modified lowering. If you're more advanced, you can do Chaturanga Dandasana (low plank) instead.",
  },
  {
    name: "Cobra Pose",
    sanskrit: "Bhujangasana",
    imageKey: "bhujangasana_mirrored",
    breath: "Inhale",
    duration: 5,
    instruction: "Slide forward and rise up into Cobra. Press hands into the mat, lift the chest. Keep elbows slightly bent and close to the body.",
    tips: "Use back muscles more than arm strength. Keep shoulders rolled back and down. Don't force the backbend.",
  },
  {
    name: "Downward-Facing Dog",
    sanskrit: "Adho Mukha Svanasana",
    imageKey: "adho_mukha_svanasana",
    breath: "Exhale",
    duration: 8,
    instruction: "Tuck toes, lift hips up and back into an inverted V-shape. Press heels toward the floor, straighten the legs as much as comfortable.",
    tips: "Pedal the feet to warm up calves. Keep a micro-bend in knees if hamstrings are tight. Spread fingers wide.",
  },
  {
    name: "Equestrian Pose",
    sanskrit: "Ashwa Sanchalanasana",
    imageKey: "ashwa_sanchalanasana_mirrored",
    breath: "Inhale",
    duration: 5,
    instruction: "Step the right foot forward between the hands into a lunge. Drop the back knee. Hands flat on the floor. Look up, opening the chest.",
    tips: "Use your hand to help guide the foot forward if needed. This mirrors step 4 on the opposite side.",
  },
  {
    name: "Standing Forward Bend",
    sanskrit: "Uttanasana",
    imageKey: "uttanasana",
    breath: "Exhale",
    duration: 5,
    instruction: "Step the left foot forward to meet the right. Fold forward, releasing the head and neck.",
    tips: "Let gravity do the work. Shake the head gently 'yes' and 'no' to release neck tension.",
  },
  {
    name: "Raised Arms Pose",
    sanskrit: "Hasta Uttanasana",
    imageKey: "urdhva_hastasana",
    breath: "Inhale",
    duration: 5,
    instruction: "Rise up with a flat back, sweep arms overhead. Gentle backbend, reaching fingertips to the sky.",
    tips: "Engage your core as you rise to protect the lower back. Move with control, not momentum.",
  },
  {
    name: "Prayer Pose",
    sanskrit: "Pranamasana",
    imageKey: "pranamasana",
    breath: "Exhale",
    duration: 5,
    instruction: "Return to standing with palms together at heart center. Take a moment to notice the effects of the round.",
    tips: "One full round is complete. Pause here for 2-3 breaths before beginning the next round.",
  },
];

/* ── Surya Namaskar B Steps ── */
const SURYA_B: FlowStep[] = [
  {
    name: "Chair Pose",
    sanskrit: "Utkatasana",
    imageKey: "utkatasana",
    breath: "Inhale",
    duration: 5,
    instruction: "From standing, bend knees deeply and sweep arms overhead. Sit back as if into an imaginary chair. Weight in the heels.",
    tips: "Keep knees behind toes. Draw the belly in. Shoulders relaxed away from ears.",
  },
  {
    name: "Standing Forward Fold",
    sanskrit: "Uttanasana",
    imageKey: "uttanasana",
    breath: "Exhale",
    duration: 4,
    instruction: "Straighten legs and fold forward, bringing hands to the floor. Release the head and neck.",
    tips: "Bend knees if needed. Let the upper body be heavy.",
  },
  {
    name: "Half Standing Forward Fold",
    sanskrit: "Ardha Uttanasana",
    imageKey: "ardha_uttanasana",
    breath: "Inhale",
    duration: 3,
    instruction: "Lift halfway, lengthening the spine. Fingertips on shins or floor, gaze slightly forward.",
    tips: "Create a flat back. Engage the core to support the spine.",
  },
  {
    name: "Four-Limbed Staff Pose",
    sanskrit: "Chaturanga Dandasana",
    imageKey: "chaturanga_dandasana",
    breath: "Exhale",
    duration: 4,
    instruction: "Step or jump back, lower halfway down with elbows hugging the ribs. Body is one straight line.",
    tips: "Modify by lowering knees first. Elbows should be at 90 degrees, not flaring out.",
  },
  {
    name: "Upward-Facing Dog",
    sanskrit: "Urdhva Mukha Svanasana",
    imageKey: "urdhva_mukha_svanasana",
    breath: "Inhale",
    duration: 4,
    instruction: "Press through hands, straighten arms, lift chest and thighs off the floor. Roll shoulders back, gaze slightly up.",
    tips: "Tops of feet press into the mat. Only hands and tops of feet touch the ground. Modify with Cobra if needed.",
  },
  {
    name: "Downward-Facing Dog",
    sanskrit: "Adho Mukha Svanasana",
    imageKey: "adho_mukha_svanasana",
    breath: "Exhale",
    duration: 5,
    instruction: "Lift hips up and back into Downward Dog. Press heels toward the floor, lengthen through the spine.",
    tips: "Hold for 5 breaths in a traditional Ashtanga practice. Spread fingers wide.",
  },
  {
    name: "Warrior I (Right)",
    sanskrit: "Virabhadrasana I",
    imageKey: "virabhadrasana_i",
    breath: "Inhale",
    duration: 5,
    instruction: "Step right foot forward between hands. Rise up, arms overhead. Back foot angled at 45 degrees, hips squared forward.",
    tips: "Front knee over ankle. Reach strongly through the fingertips. Ground through the back heel.",
  },
  {
    name: "Four-Limbed Staff Pose",
    sanskrit: "Chaturanga Dandasana",
    imageKey: "chaturanga_dandasana",
    breath: "Exhale",
    duration: 4,
    instruction: "Place hands down, step back and lower through Chaturanga. Elbows hug the ribs.",
    tips: "Move with control. Modify with knees down if needed.",
  },
  {
    name: "Upward-Facing Dog",
    sanskrit: "Urdhva Mukha Svanasana",
    imageKey: "urdhva_mukha_svanasana",
    breath: "Inhale",
    duration: 4,
    instruction: "Flow forward into Upward Dog. Open the chest, roll shoulders back.",
    tips: "Keep the legs active and lifted off the mat.",
  },
  {
    name: "Downward-Facing Dog",
    sanskrit: "Adho Mukha Svanasana",
    imageKey: "adho_mukha_svanasana",
    breath: "Exhale",
    duration: 5,
    instruction: "Press back into Downward Dog. Lengthen the spine, press heels down.",
    tips: "This is the transition point before the left side.",
  },
  {
    name: "Warrior I (Left)",
    sanskrit: "Virabhadrasana I",
    imageKey: "virabhadrasana_i",
    breath: "Inhale",
    duration: 5,
    instruction: "Step left foot forward between hands. Rise up, arms overhead. Back foot angled at 45 degrees.",
    tips: "Mirror the right side exactly. Check that hips are squared forward.",
  },
  {
    name: "Four-Limbed Staff Pose",
    sanskrit: "Chaturanga Dandasana",
    imageKey: "chaturanga_dandasana",
    breath: "Exhale",
    duration: 4,
    instruction: "Hands down, step back, lower through Chaturanga.",
    tips: "Maintain core engagement throughout the transition.",
  },
  {
    name: "Upward-Facing Dog",
    sanskrit: "Urdhva Mukha Svanasana",
    imageKey: "urdhva_mukha_svanasana",
    breath: "Inhale",
    duration: 4,
    instruction: "Flow into Upward Dog. Chest lifted, shoulders back.",
    tips: "Press firmly through the hands to lift the torso.",
  },
  {
    name: "Downward-Facing Dog",
    sanskrit: "Adho Mukha Svanasana",
    imageKey: "adho_mukha_svanasana",
    breath: "Exhale",
    duration: 8,
    instruction: "Hold Downward Dog for 5 breaths. This is the longest hold in the sequence — use it to recenter.",
    tips: "Spread fingers wide. Rotate upper arms outward. Press the mat away from you.",
  },
  {
    name: "Half Standing Forward Fold",
    sanskrit: "Ardha Uttanasana",
    imageKey: "ardha_uttanasana",
    breath: "Inhale",
    duration: 3,
    instruction: "Step or jump feet to hands. Lift halfway with a flat back.",
    tips: "Engage the core as you transition forward.",
  },
  {
    name: "Standing Forward Fold",
    sanskrit: "Uttanasana",
    imageKey: "uttanasana",
    breath: "Exhale",
    duration: 4,
    instruction: "Fold forward completely. Release the head and neck.",
    tips: "Let the exhale deepen the fold naturally.",
  },
  {
    name: "Chair Pose",
    sanskrit: "Utkatasana",
    imageKey: "utkatasana",
    breath: "Inhale",
    duration: 5,
    instruction: "Bend knees, sweep arms up into Chair Pose. Sit back, weight in heels.",
    tips: "This is the closing posture mirroring the opening.",
  },
  {
    name: "Mountain Pose",
    sanskrit: "Tadasana / Samasthiti",
    imageKey: "tadasana",
    breath: "Exhale",
    duration: 5,
    instruction: "Straighten legs, bring arms to sides. Stand tall in Mountain Pose. One round of Surya Namaskar B is complete.",
    tips: "Pause for 2-3 breaths. Notice the warmth and energy in the body.",
  },
];

const CONTRAINDICATIONS = [
  { condition: "Back Injury", detail: "The spine undergoes repeated flexion and extension. Avoid if you have a herniated disc, acute back pain, or recent back surgery." },
  { condition: "Pregnancy", detail: "Pressure on the abdomen and back makes this unsuitable during pregnancy. Consult your doctor for modified sequences." },
  { condition: "High Blood Pressure", detail: "The rapid transitions and inversions can spike blood pressure. Practice very slowly or avoid entirely." },
  { condition: "Heart Conditions", detail: "The cardiovascular demand of continuous rounds can be too intense. Get physician clearance first." },
  { condition: "Wrist Injury", detail: "Multiple weight-bearing poses (Plank, Cobra, Downward Dog) put significant stress on the wrists." },
  { condition: "Severe Arthritis", detail: "Knee stiffness and joint inflammation make the lunges and weight-bearing transitions risky." },
  { condition: "Hernia", detail: "The forward bends and core engagement can aggravate hernias. Avoid until fully healed." },
  { condition: "General Weakness / Fatigue", detail: "This is an energetic sequence. If you're recovering from illness or very fatigued, rest instead." },
];

const breathColors: Record<string, string> = {
  Inhale: "text-forest bg-sage-light/60",
  Exhale: "text-terracotta bg-terracotta-light/40",
  Hold: "text-gold-dark bg-gold-light/50",
  Normal: "text-muted-foreground bg-cream-dark/50",
};

/* ── Transition Video Component ── */
// durationSeconds: if provided, adjusts playback rate so video fills the timer duration
function TransitionVideo({ src, className, durationSeconds }: { src: string; className?: string; durationSeconds?: number }) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.load();

    const handleLoaded = () => {
      // Adjust playback rate to match the step timer duration
      if (durationSeconds && video.duration && video.duration > 0) {
        const rate = video.duration / durationSeconds;
        // Clamp rate between 0.1x and 4x (browser limits)
        video.playbackRate = Math.max(0.1, Math.min(4, rate));
      } else {
        video.playbackRate = 1;
      }
      video.play().catch(() => {});
    };

    video.addEventListener("loadedmetadata", handleLoaded);
    return () => video.removeEventListener("loadedmetadata", handleLoaded);
  }, [src, durationSeconds]);

  return (
    <video
      ref={videoRef}
      src={src}
      className={className}
      muted
      playsInline
      preload="auto"
    />
  );
}

export default function SuryaNamaskar() {
  const [selectedFlow, setSelectedFlow] = useState<"A" | "B">("A");
  const [mode, setMode] = useState<"learn" | "practice">("learn");
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [rounds, setRounds] = useState(3);
  const [currentRound, setCurrentRound] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showContraindications, setShowContraindications] = useState(false);
  const [transitionMode, setTransitionMode] = useState(true); // ON by default
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const audioRef = useRef<AudioContext | null>(null);

  const steps = selectedFlow === "A" ? SURYA_A : SURYA_B;
  const currentStep = steps[currentStepIndex];

  // Transition videos available for both Surya A and B
  const currentVideos = selectedFlow === "A" ? suryaATransitionVideos : suryaBTransitionVideos;
  const hasTransitionVideo = currentStepIndex < currentVideos.length;
  const showVideo = transitionMode && hasTransitionVideo;

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

  // Timer for practice mode
  useEffect(() => {
    if (!isPlaying || mode !== "practice") return;

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          // Move to next step
          const nextIndex = currentStepIndex + 1;
          if (nextIndex >= steps.length) {
            // Round complete
            if (currentRound < rounds) {
              setCurrentRound((r) => r + 1);
              setCurrentStepIndex(0);
              playBell();
              return steps[0].duration;
            } else {
              // All rounds complete
              setIsPlaying(false);
              playBell();
              return 0;
            }
          } else {
            setCurrentStepIndex(nextIndex);
            playBell();
            return steps[nextIndex].duration;
          }
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, mode, currentStepIndex, steps, currentRound, rounds, playBell]);

  const startPractice = () => {
    setMode("practice");
    setCurrentStepIndex(0);
    setCurrentRound(1);
    setTimeLeft(steps[0].duration);
    setIsPlaying(true);
    playBell();
  };

  const togglePause = () => setIsPlaying(!isPlaying);

  const nextStep = () => {
    const nextIndex = currentStepIndex + 1;
    if (nextIndex >= steps.length) {
      if (currentRound < rounds) {
        setCurrentRound((r) => r + 1);
        setCurrentStepIndex(0);
        setTimeLeft(steps[0].duration);
      }
    } else {
      setCurrentStepIndex(nextIndex);
      setTimeLeft(steps[nextIndex].duration);
    }
    playBell();
  };

  const prevStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
      setTimeLeft(steps[currentStepIndex - 1].duration);
    }
  };

  const resetPractice = () => {
    setIsPlaying(false);
    setCurrentStepIndex(0);
    setCurrentRound(1);
    setMode("learn");
    setTimeLeft(0);
  };

  const totalTime = steps.reduce((s, st) => s + st.duration, 0) * rounds;

  /* ── Render helper: Image or Video for a step ── */
  const renderStepMedia = (stepIndex: number, step: FlowStep, size: "sm" | "lg", inPracticeMode?: boolean) => {
    // Videos ONLY in practice mode, never in learn mode or thumbnails
    const vids = selectedFlow === "A" ? suryaATransitionVideos : suryaBTransitionVideos;
    const isVideoAvailable = inPracticeMode && transitionMode && stepIndex < vids.length;

    if (isVideoAvailable && size === "lg") {
      const videoUrl = vids[stepIndex];
      return (
        <TransitionVideo
          src={videoUrl}
          className="w-full h-full object-cover rounded-xl"
          durationSeconds={step.duration}
        />
      );
    }

    // Static image for learn mode, thumbnails, and fallback
    if (asanaImages[step.imageKey]) {
      return (
        <img
          src={asanaImages[step.imageKey]}
          alt={step.name}
          className={`w-full h-full object-contain ${size === "sm" ? "p-1.5" : "p-4"}`}
          loading="lazy"
        />
      );
    }
    return <Leaf className={`${size === "sm" ? "w-6 h-6" : "w-12 h-12"} text-forest/20`} />;
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="relative pt-24 pb-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-gold-light/30 via-background to-sage-light/20" />
        <div className="relative z-10 container max-w-5xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="flex items-center justify-center gap-2 mb-4">
              <Sun className="w-6 h-6 text-gold-dark" />
              <span className="text-sm font-medium text-gold-dark uppercase tracking-wider">
                Sun Salutation Practice
              </span>
            </div>
            <h1 className="font-serif text-4xl md:text-6xl font-bold text-foreground mb-4">
              Surya Namaskar
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
              A flowing sequence of poses synchronized with breath — the foundation of every yoga practice.
              Energizes the body, calms the mind, and builds strength and flexibility.
            </p>

            {/* Flow selector */}
            <div className="flex items-center justify-center gap-3 mb-6">
              <button
                onClick={() => { setSelectedFlow("A"); setCurrentStepIndex(0); setMode("learn"); setIsPlaying(false); }}
                className={`px-6 py-3 rounded-full font-semibold text-sm transition-all ${
                  selectedFlow === "A"
                    ? "bg-forest text-cream shadow-lg"
                    : "bg-cream-dark text-muted-foreground hover:bg-border"
                }`}
              >
                <Sun className="w-4 h-4 inline mr-2" />
                Surya Namaskar A
                <span className="ml-2 text-xs opacity-70">12 steps</span>
              </button>
              <button
                onClick={() => { setSelectedFlow("B"); setCurrentStepIndex(0); setMode("learn"); setIsPlaying(false); }}
                className={`px-6 py-3 rounded-full font-semibold text-sm transition-all ${
                  selectedFlow === "B"
                    ? "bg-forest text-cream shadow-lg"
                    : "bg-cream-dark text-muted-foreground hover:bg-border"
                }`}
              >
                <Sun className="w-4 h-4 inline mr-2" />
                Surya Namaskar B
                <span className="ml-2 text-xs opacity-70">18 steps</span>
              </button>
            </div>

            {/* Transition Mode toggle + Contraindications */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <div className="flex items-center gap-2.5 bg-card border border-border rounded-full px-4 py-2">
                <Film className={`w-4 h-4 ${transitionMode ? "text-forest" : "text-muted-foreground"}`} />
                <span className="text-sm font-medium text-foreground">Transition Videos</span>
                <Switch
                  checked={transitionMode}
                  onCheckedChange={setTransitionMode}
                />
              </div>
              <button
                onClick={() => setShowContraindications(!showContraindications)}
                className="inline-flex items-center gap-2 text-sm text-rose hover:text-rose/80 transition-colors"
              >
                <AlertTriangle className="w-4 h-4" />
                {showContraindications ? "Hide" : "View"} Contraindications
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Contraindications panel */}
      <AnimatePresence>
        {showContraindications && (
          <motion.section
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="container max-w-4xl mx-auto px-4 pb-8">
              <div className="bg-rose-light/20 border border-rose/20 rounded-2xl p-6">
                <h3 className="font-serif text-lg font-semibold text-rose mb-4 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" />
                  Who Should Avoid or Modify Surya Namaskar
                </h3>
                <div className="grid sm:grid-cols-2 gap-3">
                  {CONTRAINDICATIONS.map((c) => (
                    <div key={c.condition} className="bg-white/60 rounded-xl p-4">
                      <h4 className="font-semibold text-foreground text-sm mb-1">{c.condition}</h4>
                      <p className="text-xs text-muted-foreground leading-relaxed">{c.detail}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* Main content */}
      <section className="pb-24">
        <div className="container max-w-5xl mx-auto px-4">
          {mode === "learn" ? (
            /* ── LEARN MODE ── */
            <div>
              {/* Start practice button */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10">
                <div className="flex items-center gap-3">
                  <span className="text-sm text-muted-foreground">Rounds:</span>
                  <div className="flex items-center gap-1">
                    {[1, 3, 5, 7, 12].map((r) => (
                      <button
                        key={r}
                        onClick={() => setRounds(r)}
                        className={`w-9 h-9 rounded-full text-sm font-medium transition-all ${
                          rounds === r
                            ? "bg-forest text-cream"
                            : "bg-cream-dark text-muted-foreground hover:bg-border"
                        }`}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>
                <span className="text-xs text-muted-foreground">
                  ~{Math.ceil(totalTime / 60)} min total
                </span>
                <button
                  onClick={startPractice}
                  className="flex items-center gap-2 px-8 py-3.5 bg-forest text-cream font-semibold rounded-full hover:bg-forest-light transition-all shadow-lg"
                >
                  <Play className="w-5 h-5" />
                  Start Guided Practice
                </button>
              </div>

              {/* Step-by-step cards */}
              <div className="space-y-4">
                {steps.map((step, i) => {
                  return (
                    <motion.div
                      key={`${selectedFlow}-${i}-${transitionMode}`}
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
                          {renderStepMedia(i, step, "sm")}
                        </div>

                        {/* Content */}
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-serif text-lg font-semibold text-foreground">{step.name}</h3>
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${breathColors[step.breath]}`}>
                              <Wind className="w-3 h-3 inline mr-1" />
                              {step.breath}
                            </span>

                          </div>
                          <p className="text-xs text-muted-foreground italic mb-2">{step.sanskrit}</p>
                          <p className="text-sm text-foreground/80 leading-relaxed">{step.instruction}</p>
                          <p className="text-xs text-muted-foreground mt-2 flex items-start gap-1">
                            <Info className="w-3 h-3 mt-0.5 shrink-0" />
                            {step.tips}
                          </p>
                        </div>

                        {/* Duration */}
                        <div className="text-right shrink-0">
                          <span className="text-xs text-muted-foreground">{step.duration}s</span>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          ) : (
            /* ── PRACTICE MODE ── */
            <div>
              {/* Back to learn */}
              <button
                onClick={resetPractice}
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Overview
              </button>

              {/* Progress bar */}
              <div className="mb-8">
                <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
                  <span>Round {currentRound} of {rounds}</span>
                  <span>Step {currentStepIndex + 1} of {steps.length}</span>
                </div>
                <div className="h-2 bg-cream-dark rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-forest rounded-full"
                    animate={{
                      width: `${(((currentRound - 1) * steps.length + currentStepIndex + 1) / (rounds * steps.length)) * 100}%`,
                    }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              </div>

              {/* Current step card */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={`${currentRound}-${currentStepIndex}`}
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  transition={{ duration: 0.3 }}
                  className="bg-card border-2 border-forest/20 rounded-3xl p-8 mb-8"
                >
                  <div className="flex flex-col md:flex-row items-center gap-8">
                    {/* Large image or video */}
                    <div className="w-56 h-56 md:w-72 md:h-72 rounded-2xl overflow-hidden bg-white border border-border/50 flex items-center justify-center shrink-0">
                      {renderStepMedia(currentStepIndex, currentStep, "lg", true)}
                    </div>

                    {/* Step info */}
                    <div className="flex-1 text-center md:text-left">
                      <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
                        <span className="text-sm font-bold text-forest bg-sage-light/60 px-3 py-1 rounded-full">
                          Step {currentStepIndex + 1}
                        </span>
                        <span className={`text-sm px-3 py-1 rounded-full font-medium ${breathColors[currentStep.breath]}`}>
                          <Wind className="w-3.5 h-3.5 inline mr-1" />
                          {currentStep.breath}
                        </span>
                        {showVideo && (
                          <span className="text-sm px-3 py-1 rounded-full font-medium text-forest bg-sage-light/60">
                            <Film className="w-3.5 h-3.5 inline mr-1" />
                            Transition
                          </span>
                        )}
                      </div>
                      <h2 className="font-serif text-3xl font-bold text-foreground mb-1">
                        {currentStep.name}
                      </h2>
                      <p className="text-sm text-muted-foreground italic mb-4">{currentStep.sanskrit}</p>
                      <p className="text-foreground/80 leading-relaxed mb-3">{currentStep.instruction}</p>
                      <p className="text-sm text-muted-foreground flex items-start gap-1.5 justify-center md:justify-start">
                        <Info className="w-4 h-4 mt-0.5 shrink-0" />
                        {currentStep.tips}
                      </p>

                      {/* Timer */}
                      <div className="mt-6 flex items-center justify-center md:justify-start gap-4">
                        <div className="text-4xl font-mono font-bold text-forest">
                          {timeLeft}s
                        </div>
                        <div className="h-3 flex-1 max-w-48 bg-cream-dark rounded-full overflow-hidden">
                          <motion.div
                            className="h-full bg-forest rounded-full"
                            animate={{
                              width: `${((currentStep.duration - timeLeft) / currentStep.duration) * 100}%`,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* Controls */}
              <div className="flex items-center justify-center gap-4">
                <button
                  onClick={prevStep}
                  disabled={currentStepIndex === 0 && currentRound === 1}
                  className="w-12 h-12 rounded-full bg-cream-dark flex items-center justify-center hover:bg-border transition-colors disabled:opacity-30"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={togglePause}
                  className="w-16 h-16 rounded-full bg-forest text-cream flex items-center justify-center hover:bg-forest-light transition-colors shadow-lg"
                >
                  {isPlaying ? <Pause className="w-7 h-7" /> : <Play className="w-7 h-7 ml-1" />}
                </button>
                <button
                  onClick={nextStep}
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
                  onClick={resetPractice}
                  className="w-10 h-10 rounded-full bg-cream-dark flex items-center justify-center hover:bg-border transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>

              {/* Step thumbnails */}
              <div className="mt-8 flex gap-2 overflow-x-auto pb-2">
                {steps.map((step, i) => {
                  return (
                    <button
                      key={i}
                      onClick={() => {
                        setCurrentStepIndex(i);
                        setTimeLeft(steps[i].duration);
                      }}
                      className={`shrink-0 w-14 h-14 rounded-xl border-2 overflow-hidden flex items-center justify-center transition-all relative ${
                        i === currentStepIndex
                          ? "border-forest bg-sage-light/50 scale-110"
                          : i < currentStepIndex
                          ? "border-forest/30 bg-sage-light/20 opacity-60"
                          : "border-border bg-white"
                      }`}
                    >
                      {asanaImages[step.imageKey] ? (
                        <img
                          src={asanaImages[step.imageKey]}
                          alt={step.name}
                          className="w-full h-full object-contain p-1"
                        />
                      ) : (
                        <span className="text-xs font-bold text-forest">{i + 1}</span>
                      )}
                      {i < currentStepIndex && (
                        <div className="absolute inset-0 bg-forest/10 flex items-center justify-center">
                          <Check className="w-4 h-4 text-forest" />
                        </div>
                      )}

                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
