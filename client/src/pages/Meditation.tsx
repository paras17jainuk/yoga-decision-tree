/*
 * Design: Earth & Breath — Organic Modernism
 * Meditation: Guided meditation techniques with timers
 * Techniques: Mindfulness, Body Scan, Loving-Kindness, Walking Meditation,
 * Yoga Nidra, Trataka (Candle Gazing)
 * Features: Configurable timer, ambient bell, guided prompts, session tracking
 */
import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Brain,
  Play,
  Pause,
  RotateCcw,
  ArrowLeft,
  Volume2,
  VolumeX,
  AlertTriangle,
  Clock,
  ChevronRight,
  Minus,
  Plus,
  Leaf,
  Heart,
  Eye,
  Footprints,
  Moon,
  Flame,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import { asanaImages } from "@/data/asanaImages";
import { addSessionToHistory } from "@/lib/cookies";

/* ── Types ── */
interface GuidedPrompt {
  time: number; // seconds into the session when this prompt appears
  text: string;
}

interface MeditationTechnique {
  id: string;
  name: string;
  subtitle: string;
  imageKey: string;
  description: string;
  benefits: string[];
  contraindications: string[];
  defaultMinutes: number;
  minMinutes: number;
  maxMinutes: number;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  posture: string;
  guidedPrompts: GuidedPrompt[];
  instructions: string[];
}

/* ── Technique Data ── */
const TECHNIQUES: MeditationTechnique[] = [
  {
    id: "mindfulness",
    name: "Mindfulness Meditation",
    subtitle: "Present Moment Awareness",
    imageKey: "meditation_seated",
    description: "The foundational meditation practice. Simply observe your breath and thoughts without judgment. When the mind wanders, gently return attention to the breath. This builds the 'muscle' of awareness.",
    benefits: [
      "Reduces stress and anxiety",
      "Improves focus and attention span",
      "Enhances emotional regulation",
      "Lowers blood pressure",
      "Improves sleep quality",
      "Increases self-awareness",
    ],
    contraindications: [
      "Those with severe trauma may need guidance from a therapist",
      "If meditation increases anxiety, try shorter sessions or walking meditation instead",
    ],
    defaultMinutes: 10,
    minMinutes: 3,
    maxMinutes: 60,
    icon: <Brain className="w-5 h-5" />,
    color: "text-forest",
    bgColor: "bg-sage-light/50 border-sage/30",
    posture: "Sit comfortably with spine erect. Hands on knees or in lap. Eyes gently closed or soft gaze downward.",
    guidedPrompts: [
      { time: 0, text: "Find a comfortable seated position. Close your eyes gently." },
      { time: 10, text: "Take three deep breaths to settle in." },
      { time: 25, text: "Now let the breath return to its natural rhythm." },
      { time: 40, text: "Bring your attention to the sensation of breathing at the nostrils." },
      { time: 70, text: "Notice the cool air entering, the warm air leaving." },
      { time: 120, text: "When thoughts arise, simply notice them and return to the breath." },
      { time: 180, text: "You are not trying to stop thoughts. Just observe them like clouds passing." },
      { time: 270, text: "If the mind has wandered, that's perfectly normal. Gently come back." },
      { time: 360, text: "Deepen your awareness. Feel the rise and fall of the chest." },
      { time: 480, text: "Rest in this awareness. There is nothing to do, nowhere to go." },
    ],
    instructions: [
      "Sit in a comfortable position with a tall spine",
      "Close your eyes or maintain a soft downward gaze",
      "Begin by taking 3 deep breaths",
      "Let the breath settle into its natural rhythm",
      "Focus your attention on the sensation of breathing",
      "When thoughts arise, notice them without judgment",
      "Gently return attention to the breath each time",
      "Continue for the duration of your session",
    ],
  },
  {
    id: "body_scan",
    name: "Body Scan Meditation",
    subtitle: "Progressive Relaxation",
    imageKey: "meditation_body_scan",
    description: "A systematic practice of bringing awareness to each part of the body, from toes to crown. Excellent for releasing tension, improving body awareness, and preparing for sleep.",
    benefits: [
      "Releases physical tension",
      "Improves body awareness",
      "Reduces chronic pain perception",
      "Excellent for insomnia",
      "Reduces muscle tension",
      "Promotes deep relaxation",
    ],
    contraindications: [
      "Those with body dysmorphia should practice with a teacher",
      "May bring up emotions stored in the body — have support available if needed",
    ],
    defaultMinutes: 15,
    minMinutes: 5,
    maxMinutes: 45,
    icon: <Eye className="w-5 h-5" />,
    color: "text-rose",
    bgColor: "bg-rose-light/40 border-rose/30",
    posture: "Lie on your back in Savasana. Arms slightly away from body, palms up. Legs slightly apart.",
    guidedPrompts: [
      { time: 0, text: "Lie down comfortably on your back. Close your eyes." },
      { time: 15, text: "Take three deep breaths. Let your body sink into the surface beneath you." },
      { time: 35, text: "Bring your awareness to your feet. Notice any sensations — warmth, tingling, pressure." },
      { time: 70, text: "Move your attention up to your ankles and calves. Simply observe." },
      { time: 110, text: "Now bring awareness to your knees and thighs. Release any tension you find." },
      { time: 160, text: "Move to your hips and pelvis. Let this area soften and relax." },
      { time: 210, text: "Bring attention to your lower back and abdomen. Breathe into any tightness." },
      { time: 270, text: "Now your chest and upper back. Feel the gentle rise and fall of breathing." },
      { time: 330, text: "Move to your hands, arms, and shoulders. Let them grow heavy and relaxed." },
      { time: 400, text: "Bring awareness to your neck, jaw, and face. Soften the forehead, relax the eyes." },
      { time: 460, text: "Now feel your entire body as one unified field of awareness." },
      { time: 520, text: "Rest in this wholeness. Your body is deeply relaxed." },
    ],
    instructions: [
      "Lie on your back in a comfortable position (Savasana)",
      "Close your eyes and take several deep breaths",
      "Begin at the feet — notice all sensations without trying to change them",
      "Slowly move your attention upward through each body part",
      "Spend 1-2 minutes on each area: feet, legs, hips, abdomen, chest, arms, neck, face",
      "If you find tension, breathe into that area and invite it to soften",
      "After scanning the whole body, rest in full-body awareness",
      "Take your time returning — wiggle fingers and toes before opening eyes",
    ],
  },
  {
    id: "loving_kindness",
    name: "Loving-Kindness Meditation",
    subtitle: "Metta Bhavana",
    imageKey: "meditation_loving_kindness",
    description: "A heart-centered practice of generating feelings of love, compassion, and goodwill — first toward yourself, then expanding outward to loved ones, neutral people, difficult people, and all beings.",
    benefits: [
      "Increases empathy and compassion",
      "Reduces negative emotions and self-criticism",
      "Improves relationships",
      "Boosts positive emotions",
      "Reduces social anxiety",
      "Increases feelings of social connection",
    ],
    contraindications: [
      "Those with deep grief or loss may find this intense — practice gently",
      "If self-directed kindness feels difficult, start with a beloved pet or child",
    ],
    defaultMinutes: 12,
    minMinutes: 5,
    maxMinutes: 30,
    icon: <Heart className="w-5 h-5" />,
    color: "text-rose",
    bgColor: "bg-rose-light/40 border-rose/30",
    posture: "Sit comfortably with hands over heart or in lap. Eyes closed. Gentle smile.",
    guidedPrompts: [
      { time: 0, text: "Sit comfortably. Place your hands over your heart if you wish." },
      { time: 15, text: "Take a few deep breaths. Feel the warmth in your chest." },
      { time: 35, text: "Begin with yourself. Silently repeat: 'May I be happy. May I be healthy. May I be safe.'" },
      { time: 90, text: "Feel the warmth of these wishes directed toward yourself." },
      { time: 140, text: "Now think of someone you love. Send them the same wishes: 'May you be happy. May you be healthy.'" },
      { time: 210, text: "Feel the love flowing from your heart to theirs." },
      { time: 270, text: "Now think of a neutral person — a stranger. Extend the same kindness to them." },
      { time: 340, text: "'May you be happy. May you be healthy. May you be safe. May you live with ease.'" },
      { time: 420, text: "If you feel ready, think of someone difficult. Can you wish them peace?" },
      { time: 500, text: "Finally, expand to all beings everywhere: 'May all beings be happy and free.'" },
      { time: 580, text: "Rest in this boundless field of loving-kindness." },
    ],
    instructions: [
      "Sit comfortably with hands over your heart",
      "Close your eyes and take several calming breaths",
      "Begin with yourself: 'May I be happy, may I be healthy, may I be safe'",
      "Visualize someone you love — send them the same wishes",
      "Expand to a neutral person (a stranger)",
      "If ready, include someone you find difficult",
      "Finally, expand to all beings everywhere",
      "Rest in the feeling of universal loving-kindness",
    ],
  },
  {
    id: "walking",
    name: "Walking Meditation",
    subtitle: "Mindful Movement",
    imageKey: "meditation_walking",
    description: "A meditation practice done while walking slowly and deliberately. Each step becomes an anchor for attention, just as the breath is in seated meditation. Ideal for those who find sitting difficult.",
    benefits: [
      "Accessible for those who can't sit still",
      "Improves balance and proprioception",
      "Combines gentle exercise with mindfulness",
      "Can be done anywhere",
      "Bridges meditation and daily life",
      "Reduces restlessness",
    ],
    contraindications: [
      "Choose a flat, safe surface to avoid falls",
      "Those with balance issues should practice near a wall",
    ],
    defaultMinutes: 10,
    minMinutes: 5,
    maxMinutes: 30,
    icon: <Footprints className="w-5 h-5" />,
    color: "text-forest",
    bgColor: "bg-sage-light/50 border-sage/30",
    posture: "Stand tall. Hands clasped gently in front or behind. Eyes open with a soft gaze 6 feet ahead.",
    guidedPrompts: [
      { time: 0, text: "Stand at one end of your walking path. Feel your feet on the ground." },
      { time: 15, text: "Take a moment to feel the weight of your body through your feet." },
      { time: 30, text: "Begin walking very slowly. Lift the right foot... move it forward... place it down." },
      { time: 60, text: "Notice: lifting, moving, placing. Each phase of the step." },
      { time: 100, text: "Feel the shift of weight from one foot to the other." },
      { time: 150, text: "When you reach the end of your path, pause. Turn slowly. Continue." },
      { time: 210, text: "Let the rhythm of walking become your meditation anchor." },
      { time: 300, text: "If the mind wanders, return attention to the sensations in your feet." },
      { time: 400, text: "Notice: the contact of foot with ground, the movement of muscles, the flow of balance." },
      { time: 500, text: "Continue walking with full presence. Each step is complete in itself." },
    ],
    instructions: [
      "Find a quiet path of 10-20 feet",
      "Stand at one end and feel your feet on the ground",
      "Begin walking very slowly — much slower than normal",
      "Break each step into phases: lifting, moving, placing",
      "Keep your gaze soft, about 6 feet ahead",
      "When you reach the end, pause, turn slowly, and walk back",
      "If the mind wanders, return attention to the feet",
      "Continue for the duration of your session",
    ],
  },
  {
    id: "yoga_nidra",
    name: "Yoga Nidra",
    subtitle: "Yogic Sleep",
    imageKey: "meditation_body_scan",
    description: "A state of consciousness between waking and sleeping, achieved through a guided practice of systematic relaxation. Often called 'yogic sleep,' 30 minutes of Yoga Nidra is said to equal 2 hours of sleep.",
    benefits: [
      "Profoundly restorative — equivalent to deep sleep",
      "Reduces chronic stress and PTSD symptoms",
      "Improves sleep quality dramatically",
      "Reduces anxiety and depression",
      "Enhances creativity and intuition",
      "Accessible to everyone — no effort required",
    ],
    contraindications: [
      "Those with severe depression should practice with a qualified teacher",
      "May bring up suppressed emotions — have support available",
      "Avoid if you need to be alert immediately after",
    ],
    defaultMinutes: 20,
    minMinutes: 10,
    maxMinutes: 45,
    icon: <Moon className="w-5 h-5" />,
    color: "text-forest",
    bgColor: "bg-sage-light/50 border-sage/30",
    posture: "Lie in Savasana with a blanket for warmth. Eye pillow optional. Complete stillness.",
    guidedPrompts: [
      { time: 0, text: "Lie down in Savasana. Cover yourself with a blanket if you wish." },
      { time: 20, text: "Set your Sankalpa — a positive intention or resolve. State it three times silently." },
      { time: 60, text: "Become aware of your body lying on the floor. Feel its weight." },
      { time: 100, text: "Rotate your awareness: right hand thumb, index finger, middle finger, ring finger, little finger..." },
      { time: 160, text: "Right palm, back of the hand, wrist, forearm, elbow, upper arm, shoulder..." },
      { time: 220, text: "Right side of the chest, right side of the waist, right hip, right thigh..." },
      { time: 280, text: "Now the left side. Left hand thumb, index finger, middle finger..." },
      { time: 350, text: "Left palm, wrist, forearm, elbow, upper arm, shoulder..." },
      { time: 420, text: "Become aware of the whole body. The whole body lying on the floor." },
      { time: 500, text: "Notice the breath. Do not change it. Simply witness the natural breath." },
      { time: 600, text: "Visualize a calm lake at dawn. The water is perfectly still." },
      { time: 720, text: "Return to your Sankalpa. Repeat it three times with full feeling." },
      { time: 800, text: "Begin to externalize your awareness. Feel the room around you." },
      { time: 860, text: "Gently move your fingers and toes. Take a deep breath." },
    ],
    instructions: [
      "Lie in Savasana — completely still and comfortable",
      "Set your Sankalpa (positive intention) and repeat it 3 times",
      "Follow the guided rotation of awareness through each body part",
      "Remain aware but deeply relaxed — the edge between sleep and waking",
      "Do not try to stay awake or fall asleep — just be",
      "Visualize the guided imagery when prompted",
      "Return to your Sankalpa at the end",
      "Take your time coming back — move slowly",
    ],
  },
  {
    id: "trataka",
    name: "Trataka",
    subtitle: "Candle Gazing",
    imageKey: "meditation_seated",
    description: "An ancient yogic practice of steady, unblinking gazing at a single point — traditionally a candle flame. This purifies the eyes, strengthens concentration, and is considered a bridge between physical and mental practices.",
    benefits: [
      "Dramatically improves concentration",
      "Strengthens eye muscles",
      "Develops willpower",
      "Calms an agitated mind",
      "May improve eyesight",
      "Activates the third eye (Ajna chakra)",
    ],
    contraindications: [
      "Avoid if you have eye conditions (glaucoma, cataracts)",
      "Those with epilepsy should avoid candle gazing",
      "Remove contact lenses before practice",
      "Stop if eyes become very painful (mild watering is normal)",
    ],
    defaultMinutes: 8,
    minMinutes: 3,
    maxMinutes: 20,
    icon: <Flame className="w-5 h-5" />,
    color: "text-terracotta",
    bgColor: "bg-terracotta-light/40 border-terracotta/30",
    posture: "Sit at arm's length from a candle at eye level. Spine erect. Room slightly darkened.",
    guidedPrompts: [
      { time: 0, text: "Place a candle at eye level, about arm's length away. Sit tall." },
      { time: 15, text: "Take a few deep breaths to settle. Relax the face and eyes." },
      { time: 30, text: "Begin gazing at the tip of the flame. Try not to blink." },
      { time: 60, text: "Keep the gaze steady and soft. If eyes water, that's natural." },
      { time: 100, text: "Focus on the brightest point of the flame. Let everything else blur." },
      { time: 150, text: "If you must blink, do so gently and return to gazing." },
      { time: 210, text: "Now close your eyes. See the afterimage of the flame in your mind's eye." },
      { time: 260, text: "Hold this inner image at the point between your eyebrows." },
      { time: 320, text: "When the image fades, open your eyes and gaze at the flame again." },
      { time: 400, text: "Continue alternating between external gazing and internal visualization." },
    ],
    instructions: [
      "Set up a candle at eye level, arm's length away",
      "Dim the room slightly for better focus",
      "Sit with a tall spine and relaxed shoulders",
      "Gaze steadily at the flame tip without blinking",
      "When eyes water or tire, close them gently",
      "Observe the afterimage with closed eyes",
      "When the image fades, open eyes and resume gazing",
      "Alternate between external and internal gazing",
    ],
  },
];

export default function Meditation() {
  const [selectedTechnique, setSelectedTechnique] = useState<MeditationTechnique | null>(null);
  const [mode, setMode] = useState<"browse" | "info" | "practice">("browse");
  const [durationMinutes, setDurationMinutes] = useState(10);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [currentPromptIndex, setCurrentPromptIndex] = useState(0);
  const [bellInterval, setBellInterval] = useState(0); // 0 = no interval bells

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const audioRef = useRef<AudioContext | null>(null);

  const totalSeconds = durationMinutes * 60;

  const playBell = useCallback((freq = 396, dur = 2.0) => {
    if (!soundEnabled) return;
    try {
      if (!audioRef.current) audioRef.current = new AudioContext();
      const ctx = audioRef.current;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = freq;
      osc.type = "sine";
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + dur);
    } catch { /* ignore */ }
  }, [soundEnabled]);

  // Timer
  useEffect(() => {
    if (!isPlaying || isComplete) return;

    timerRef.current = setInterval(() => {
      setTimeElapsed((prev) => {
        const next = prev + 1;
        if (next >= totalSeconds) {
          setIsPlaying(false);
          setIsComplete(true);
          playBell(396, 3.0);
          // Save session
          if (selectedTechnique) {
            addSessionToHistory({
              id: `meditation_${Date.now()}`,
              completedAt: Date.now(),
              durationMinutes,
              actualMinutes: Math.round(next / 60),
              asanaCount: 1,
              asanaIds: [selectedTechnique.id],
              conditions: [],
              severity: null,
              type: "custom",
            });
          }
          return next;
        }
        // Interval bell
        if (bellInterval > 0 && next % (bellInterval * 60) === 0 && next < totalSeconds) {
          playBell(528, 1.5);
        }
        return next;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, isComplete, totalSeconds, bellInterval, playBell, selectedTechnique, durationMinutes]);

  // Update current prompt based on elapsed time
  useEffect(() => {
    if (!selectedTechnique || !isPlaying) return;
    const prompts = selectedTechnique.guidedPrompts;
    let idx = 0;
    for (let i = prompts.length - 1; i >= 0; i--) {
      if (timeElapsed >= prompts[i].time) {
        idx = i;
        break;
      }
    }
    setCurrentPromptIndex(idx);
  }, [timeElapsed, selectedTechnique, isPlaying]);

  const selectTechnique = (t: MeditationTechnique) => {
    setSelectedTechnique(t);
    setDurationMinutes(t.defaultMinutes);
    setMode("info");
    resetPractice();
  };

  const startPractice = () => {
    setMode("practice");
    setTimeElapsed(0);
    setCurrentPromptIndex(0);
    setIsPlaying(true);
    setIsComplete(false);
    playBell(528, 2.0);
  };

  const resetPractice = () => {
    setIsPlaying(false);
    setIsComplete(false);
    setTimeElapsed(0);
    setCurrentPromptIndex(0);
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

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const progress = totalSeconds > 0 ? timeElapsed / totalSeconds : 0;

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
                  <Brain className="w-4 h-4" />
                  Dhyana — Meditation
                </motion.div>
                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="font-serif text-4xl md:text-5xl font-bold text-foreground mb-4"
                >
                  Guided Meditation
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-muted-foreground text-lg max-w-2xl mx-auto"
                >
                  Meditation is the practice of training attention and awareness to achieve
                  mental clarity and emotional calm. Choose a technique that resonates with you.
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
                        <p className="text-sm text-muted-foreground">{t.subtitle}</p>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{t.description}</p>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs px-2 py-1 rounded-full bg-cream-dark/50 text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {t.defaultMinutes} min
                      </span>
                      <span className="text-xs px-2 py-1 rounded-full bg-sage-light/60 text-forest">
                        {t.posture.split(".")[0]}
                      </span>
                    </div>
                    <div className="mt-4 flex items-center gap-1 text-sm text-forest font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                      Learn & Practice <ChevronRight className="w-4 h-4" />
                    </div>
                  </motion.button>
                ))}
              </div>

              {/* General Meditation Tips */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="mt-12 p-6 bg-sage-light/30 border border-sage/20 rounded-2xl"
              >
                <h3 className="font-serif text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
                  <Leaf className="w-4 h-4 text-forest" /> Tips for Beginners
                </h3>
                <div className="grid md:grid-cols-2 gap-4 text-sm text-muted-foreground">
                  <div>
                    <p className="mb-2"><strong className="text-foreground">Start small.</strong> Even 3-5 minutes daily is more valuable than occasional long sessions.</p>
                    <p className="mb-2"><strong className="text-foreground">Same time, same place.</strong> Consistency builds the habit. Morning is ideal for most people.</p>
                    <p><strong className="text-foreground">Don't judge yourself.</strong> A wandering mind is not failure — noticing it IS the practice.</p>
                  </div>
                  <div>
                    <p className="mb-2"><strong className="text-foreground">Comfort matters.</strong> Use cushions, blankets, or a chair. Pain is not part of meditation.</p>
                    <p className="mb-2"><strong className="text-foreground">Be patient.</strong> Benefits accumulate over weeks and months, not days.</p>
                    <p><strong className="text-foreground">Try different techniques.</strong> Not every style suits every person. Explore and find yours.</p>
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
              {/* Back */}
              <button onClick={goBack} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
                <ArrowLeft className="w-4 h-4" /> Back to techniques
              </button>

              {/* Header */}
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
                    <span className="w-8 h-8 rounded-full bg-sage-light flex items-center justify-center">
                      {selectedTechnique.icon}
                    </span>
                    <span className="text-sm text-muted-foreground">{selectedTechnique.subtitle}</span>
                  </div>
                  <h1 className="font-serif text-3xl font-bold text-foreground mb-1">
                    {selectedTechnique.name}
                  </h1>
                  <p className="text-muted-foreground italic mb-3">{selectedTechnique.posture}</p>
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
                <h3 className="font-serif text-lg font-semibold text-foreground mb-3">
                  How to Practice
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
                    <AlertTriangle className="w-4 h-4 text-gold-dark" /> Things to Note
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

              {/* Duration + Bell interval + Start */}
              <div className="flex flex-col gap-4 p-6 bg-card border border-border rounded-2xl">
                <div className="flex flex-col sm:flex-row items-center gap-6">
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-medium text-foreground">Duration:</span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setDurationMinutes(Math.max(selectedTechnique.minMinutes, durationMinutes - 1))}
                        className="w-8 h-8 rounded-full bg-sage-light flex items-center justify-center hover:bg-sage transition-colors"
                      >
                        <Minus className="w-4 h-4 text-forest" />
                      </button>
                      <span className="w-12 text-center text-xl font-semibold text-foreground">{durationMinutes}</span>
                      <button
                        onClick={() => setDurationMinutes(Math.min(selectedTechnique.maxMinutes, durationMinutes + 1))}
                        className="w-8 h-8 rounded-full bg-sage-light flex items-center justify-center hover:bg-sage transition-colors"
                      >
                        <Plus className="w-4 h-4 text-forest" />
                      </button>
                    </div>
                    <span className="text-sm text-muted-foreground">minutes</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-foreground">Interval bell:</span>
                    <select
                      value={bellInterval}
                      onChange={(e) => setBellInterval(Number(e.target.value))}
                      className="px-3 py-1.5 rounded-lg bg-sage-light border border-sage/30 text-sm text-foreground"
                    >
                      <option value={0}>None</option>
                      <option value={1}>Every 1 min</option>
                      <option value={2}>Every 2 min</option>
                      <option value={5}>Every 5 min</option>
                    </select>
                  </div>
                </div>

                <button
                  onClick={startPractice}
                  className="flex items-center justify-center gap-2 px-8 py-3 bg-forest text-cream rounded-full font-semibold hover:bg-forest-light transition-colors w-full sm:w-auto sm:mx-auto"
                >
                  <Play className="w-5 h-5" /> Begin Meditation
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
              <div className="flex items-center justify-between mb-6">
                <button onClick={goBack} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                  <ArrowLeft className="w-4 h-4" /> End
                </button>
                <button
                  onClick={() => setSoundEnabled(!soundEnabled)}
                  className="p-2 rounded-full hover:bg-sage-light transition-colors"
                >
                  {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                </button>
              </div>

              {!isComplete ? (
                <div className="flex flex-col items-center">
                  {/* Title */}
                  <h2 className="font-serif text-2xl font-bold text-foreground mb-1">{selectedTechnique.name}</h2>
                  <p className="text-sm text-muted-foreground mb-8">{selectedTechnique.subtitle}</p>

                  {/* Timer circle */}
                  <div className="relative w-72 h-72 flex items-center justify-center mb-8">
                    {/* Background circle */}
                    <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
                      <circle
                        cx="50" cy="50" r="44"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        className="text-border"
                      />
                      <circle
                        cx="50" cy="50" r="44"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeDasharray={`${2 * Math.PI * 44}`}
                        strokeDashoffset={`${2 * Math.PI * 44 * (1 - progress)}`}
                        strokeLinecap="round"
                        className="text-forest"
                        style={{ transition: "stroke-dashoffset 1s linear" }}
                      />
                    </svg>

                    {/* Pulsing inner glow */}
                    <motion.div
                      animate={{
                        scale: isPlaying ? [1, 1.05, 1] : 1,
                        opacity: isPlaying ? [0.3, 0.5, 0.3] : 0.3,
                      }}
                      transition={{
                        duration: 4,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                      className="absolute w-52 h-52 rounded-full bg-sage-light/40"
                    />

                    {/* Timer display */}
                    <div className="relative text-center z-10">
                      <div className="text-5xl font-light text-foreground tracking-wider">
                        {formatTime(totalSeconds - timeElapsed)}
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">
                        {formatTime(timeElapsed)} elapsed
                      </div>
                    </div>
                  </div>

                  {/* Guided prompt */}
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={currentPromptIndex}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.5 }}
                      className="text-center max-w-md mb-8 min-h-[3rem]"
                    >
                      <p className="text-foreground/80 font-medium italic leading-relaxed">
                        "{selectedTechnique.guidedPrompts[currentPromptIndex]?.text}"
                      </p>
                    </motion.div>
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
                /* Completion */
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-12"
                >
                  <div className="w-20 h-20 rounded-full bg-sage-light flex items-center justify-center mx-auto mb-6">
                    <Brain className="w-10 h-10 text-forest" />
                  </div>
                  <h3 className="font-serif text-2xl font-bold text-foreground mb-2">
                    Session Complete
                  </h3>
                  <p className="text-muted-foreground mb-2">
                    You practiced {selectedTechnique.name} for {durationMinutes} minutes.
                  </p>
                  <p className="text-muted-foreground mb-8 italic">
                    Take a moment to notice how you feel before returning to your day.
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
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </div>
  );
}
