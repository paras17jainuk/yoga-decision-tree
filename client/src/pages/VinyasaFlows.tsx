/*
 * Design: Earth & Breath — Organic Modernism
 * Vinyasa Flows: Dedicated practice page for various Vinyasa flow sequences
 * Features: Multiple flow sequences (Warrior, Balance, Hip Opening, Core, Gentle),
 * step-by-step guided flow, contraindications, timer, breathing cues
 */
import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Wind,
  Play,
  Pause,
  SkipForward,
  RotateCcw,
  ChevronRight,
  ChevronLeft,
  AlertTriangle,
  Clock,
  ArrowLeft,
  Check,
  Volume2,
  VolumeX,
  Leaf,
  Info,
  Flame,
  Heart,
  Zap,
  Feather,
  Target,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import { asanaImages } from "@/data/asanaImages";

interface FlowStep {
  name: string;
  sanskrit: string;
  imageKey: string;
  breath: "Inhale" | "Exhale" | "Hold" | "Normal";
  duration: number;
  instruction: string;
  side?: "right" | "left" | "both";
}

interface VinyasaFlow {
  id: string;
  name: string;
  subtitle: string;
  description: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  duration: string;
  focus: string[];
  icon: React.ReactNode;
  color: string;
  steps: FlowStep[];
}

const FLOWS: VinyasaFlow[] = [
  {
    id: "basic_vinyasa",
    name: "Basic Vinyasa",
    subtitle: "The Foundation Flow",
    description: "The classic Chaturanga Vinyasa — the building block of all flow-based yoga. Master this before moving to more complex sequences.",
    difficulty: "Beginner",
    duration: "3-5 min",
    focus: ["Full Body", "Core", "Arms"],
    icon: <Leaf className="w-5 h-5" />,
    color: "bg-sage-light/50 border-sage/30",
    steps: [
      { name: "Mountain Pose", sanskrit: "Tadasana", imageKey: "tadasana", breath: "Normal", duration: 5, instruction: "Stand tall with feet together, arms at sides. Ground through all four corners of your feet. Engage your core gently." },
      { name: "Forward Fold", sanskrit: "Uttanasana", imageKey: "uttanasana", breath: "Exhale", duration: 4, instruction: "Fold forward from the hips, hands to the floor or shins. Let the head hang heavy." },
      { name: "Half Lift", sanskrit: "Ardha Uttanasana", imageKey: "uttanasana", breath: "Inhale", duration: 3, instruction: "Lift halfway, flat back. Fingertips on shins, gaze slightly forward. Lengthen the spine." },
      { name: "Plank Pose", sanskrit: "Phalakasana", imageKey: "phalakasana", breath: "Hold", duration: 5, instruction: "Step back to Plank. Body in one straight line from head to heels. Engage the core, press through the palms." },
      { name: "Low Plank", sanskrit: "Chaturanga Dandasana", imageKey: "chaturanga_dandasana", breath: "Exhale", duration: 4, instruction: "Lower halfway down with elbows hugging the ribs. Keep body straight — don't let hips sag or pike." },
      { name: "Cobra / Upward Dog", sanskrit: "Bhujangasana / Urdhva Mukha", imageKey: "bhujangasana", breath: "Inhale", duration: 5, instruction: "Press through hands, lift chest. Beginners: Cobra (elbows bent). Advanced: Upward Dog (arms straight, thighs lifted)." },
      { name: "Downward-Facing Dog", sanskrit: "Adho Mukha Svanasana", imageKey: "adho_mukha_svanasana", breath: "Exhale", duration: 8, instruction: "Lift hips up and back into an inverted V. Press heels toward floor, lengthen spine. Hold for 5 breaths." },
      { name: "Forward Fold", sanskrit: "Uttanasana", imageKey: "uttanasana", breath: "Exhale", duration: 4, instruction: "Step or hop feet to hands. Fold forward completely." },
      { name: "Mountain Pose", sanskrit: "Tadasana", imageKey: "tadasana", breath: "Inhale", duration: 5, instruction: "Rise up to standing with a flat back. Arms overhead, then return to sides. One cycle complete." },
    ],
  },
  {
    id: "warrior_flow",
    name: "Warrior Flow",
    subtitle: "Strength & Power",
    description: "A dynamic sequence through all three Warrior poses. Builds leg strength, opens hips, and cultivates fierce focus and determination.",
    difficulty: "Intermediate",
    duration: "8-12 min",
    focus: ["Legs", "Hips", "Core", "Balance"],
    icon: <Flame className="w-5 h-5" />,
    color: "bg-terracotta-light/40 border-terracotta/30",
    steps: [
      { name: "Mountain Pose", sanskrit: "Tadasana", imageKey: "tadasana", breath: "Normal", duration: 5, instruction: "Stand tall, grounding through both feet. Set your intention for this warrior practice." },
      { name: "Warrior I", sanskrit: "Virabhadrasana I", imageKey: "virabhadrasana_i", breath: "Inhale", duration: 8, instruction: "Step right foot back. Bend front knee to 90°, arms sweep overhead. Hips squared forward, back foot at 45°.", side: "right" },
      { name: "Warrior II", sanskrit: "Virabhadrasana II", imageKey: "virabhadrasana_ii", breath: "Exhale", duration: 8, instruction: "Open hips and arms to the side. Front knee stays bent, gaze over front fingertips. Shoulders relaxed.", side: "right" },
      { name: "Reverse Warrior", sanskrit: "Viparita Virabhadrasana", imageKey: "virabhadrasana_ii", breath: "Inhale", duration: 6, instruction: "Reach front arm up and back, back hand slides down back leg. Open the side body, keep front knee bent.", side: "right" },
      { name: "Extended Side Angle", sanskrit: "Utthita Parsvakonasana", imageKey: "trikonasana", breath: "Exhale", duration: 8, instruction: "Front forearm to front thigh (or hand to floor). Top arm extends overhead, creating one long line from back foot to fingertips.", side: "right" },
      { name: "Warrior III", sanskrit: "Virabhadrasana III", imageKey: "virabhadrasana_iii", breath: "Inhale", duration: 8, instruction: "Shift weight to front foot, lift back leg parallel to floor. Arms extend forward or alongside body. Find your balance.", side: "right" },
      { name: "Standing Forward Fold", sanskrit: "Uttanasana", imageKey: "uttanasana", breath: "Exhale", duration: 5, instruction: "Step back foot forward, fold forward. Shake out the legs. Prepare for the left side." },
      { name: "Warrior I", sanskrit: "Virabhadrasana I", imageKey: "virabhadrasana_i", breath: "Inhale", duration: 8, instruction: "Step left foot back. Bend front knee to 90°, arms sweep overhead. Hips squared forward.", side: "left" },
      { name: "Warrior II", sanskrit: "Virabhadrasana II", imageKey: "virabhadrasana_ii", breath: "Exhale", duration: 8, instruction: "Open hips and arms to the side. Gaze over front fingertips. Sink deeper into the front knee.", side: "left" },
      { name: "Reverse Warrior", sanskrit: "Viparita Virabhadrasana", imageKey: "virabhadrasana_ii", breath: "Inhale", duration: 6, instruction: "Reach front arm up and back. Open the side body, feel the stretch along the front side.", side: "left" },
      { name: "Extended Side Angle", sanskrit: "Utthita Parsvakonasana", imageKey: "trikonasana", breath: "Exhale", duration: 8, instruction: "Front forearm to thigh or hand to floor. Top arm overhead. One long line from foot to fingertips.", side: "left" },
      { name: "Warrior III", sanskrit: "Virabhadrasana III", imageKey: "virabhadrasana_iii", breath: "Inhale", duration: 8, instruction: "Shift weight forward, lift back leg. Arms extend. Find stillness in the balance.", side: "left" },
      { name: "Mountain Pose", sanskrit: "Tadasana", imageKey: "tadasana", breath: "Normal", duration: 5, instruction: "Return to standing. Feel the strength and heat you've built. One cycle complete." },
    ],
  },
  {
    id: "balance_flow",
    name: "Balance Flow",
    subtitle: "Stability & Focus",
    description: "A mindful sequence of balancing poses that sharpens concentration, strengthens stabilizer muscles, and builds proprioception.",
    difficulty: "Intermediate",
    duration: "10-15 min",
    focus: ["Balance", "Legs", "Core", "Focus"],
    icon: <Target className="w-5 h-5" />,
    color: "bg-gold-light/40 border-gold/30",
    steps: [
      { name: "Mountain Pose", sanskrit: "Tadasana", imageKey: "tadasana", breath: "Normal", duration: 5, instruction: "Stand tall, find your center of gravity. Close your eyes briefly to tune into your balance." },
      { name: "Tree Pose", sanskrit: "Vrksasana", imageKey: "vrksasana", breath: "Normal", duration: 10, instruction: "Shift weight to right foot. Place left foot on inner right thigh or calf (never the knee). Arms overhead or at heart.", side: "right" },
      { name: "Eagle Pose", sanskrit: "Garudasana", imageKey: "garudasana", breath: "Normal", duration: 8, instruction: "Wrap left leg over right, left arm under right. Sink into the standing leg. Gaze at a fixed point.", side: "right" },
      { name: "Warrior III", sanskrit: "Virabhadrasana III", imageKey: "virabhadrasana_iii", breath: "Inhale", duration: 8, instruction: "Unwind and extend into Warrior III on the right leg. Arms forward, left leg back, body parallel to floor.", side: "right" },
      { name: "Half Moon", sanskrit: "Ardha Chandrasana", imageKey: "ardha_chandrasana", breath: "Exhale", duration: 8, instruction: "From Warrior III, open the left hip to the sky. Right hand to floor, left arm reaches up. Stack the hips.", side: "right" },
      { name: "Standing Forward Fold", sanskrit: "Uttanasana", imageKey: "uttanasana", breath: "Exhale", duration: 5, instruction: "Release and fold forward. Shake out both legs. Reset before the left side." },
      { name: "Tree Pose", sanskrit: "Vrksasana", imageKey: "vrksasana", breath: "Normal", duration: 10, instruction: "Shift weight to left foot. Right foot to inner left thigh or calf. Find your drishti (gaze point).", side: "left" },
      { name: "Eagle Pose", sanskrit: "Garudasana", imageKey: "garudasana", breath: "Normal", duration: 8, instruction: "Wrap right leg over left, right arm under left. Squeeze everything toward the midline.", side: "left" },
      { name: "Warrior III", sanskrit: "Virabhadrasana III", imageKey: "virabhadrasana_iii", breath: "Inhale", duration: 8, instruction: "Extend into Warrior III on the left leg. Right leg back, arms forward.", side: "left" },
      { name: "Half Moon", sanskrit: "Ardha Chandrasana", imageKey: "ardha_chandrasana", breath: "Exhale", duration: 8, instruction: "Open the right hip to the sky. Left hand to floor, right arm up. Find stability in the opening.", side: "left" },
      { name: "Mountain Pose", sanskrit: "Tadasana", imageKey: "tadasana", breath: "Normal", duration: 5, instruction: "Return to standing. Notice how your balance has improved through the sequence." },
    ],
  },
  {
    id: "hip_opening_flow",
    name: "Hip Opening Flow",
    subtitle: "Release & Surrender",
    description: "A deep, slow sequence targeting the hip flexors, external rotators, and inner thighs. Perfect for desk workers and runners.",
    difficulty: "Beginner",
    duration: "12-18 min",
    focus: ["Hips", "Groin", "Lower Back", "Flexibility"],
    icon: <Heart className="w-5 h-5" />,
    color: "bg-rose-light/40 border-rose/30",
    steps: [
      { name: "Easy Pose", sanskrit: "Sukhasana", imageKey: "sukhasana", breath: "Normal", duration: 10, instruction: "Sit cross-legged. Lengthen the spine, relax the shoulders. Take 5 deep breaths to center yourself." },
      { name: "Butterfly Pose", sanskrit: "Baddha Konasana", imageKey: "baddha_konasana", breath: "Normal", duration: 12, instruction: "Bring soles of feet together, knees wide. Hold feet and gently fold forward. Don't force the knees down." },
      { name: "Low Lunge", sanskrit: "Anjaneyasana", imageKey: "anjaneyasana", breath: "Inhale", duration: 10, instruction: "Step right foot forward into a deep lunge. Back knee on the mat. Sink hips forward and down. Arms overhead.", side: "right" },
      { name: "Pigeon Pose", sanskrit: "Eka Pada Rajakapotasana", imageKey: "eka_pada_rajakapotasana", breath: "Exhale", duration: 15, instruction: "From lunge, bring right shin across the mat. Extend left leg back. Walk hands forward and fold over the front leg.", side: "right" },
      { name: "Reclined Pigeon", sanskrit: "Supta Kapotasana", imageKey: "supta_kapotasana", breath: "Normal", duration: 12, instruction: "Roll onto your back. Cross right ankle over left knee. Draw left thigh toward chest. A gentler alternative to full pigeon.", side: "right" },
      { name: "Reclined Spinal Twist", sanskrit: "Supta Matsyendrasana", imageKey: "supta_matsyendrasana", breath: "Exhale", duration: 10, instruction: "Extend legs, then draw right knee to chest and guide it across the body to the left. Arms in T-position.", side: "right" },
      { name: "Low Lunge", sanskrit: "Anjaneyasana", imageKey: "anjaneyasana", breath: "Inhale", duration: 10, instruction: "Return to hands and knees, then step left foot forward into a deep lunge. Sink hips forward.", side: "left" },
      { name: "Pigeon Pose", sanskrit: "Eka Pada Rajakapotasana", imageKey: "eka_pada_rajakapotasana", breath: "Exhale", duration: 15, instruction: "Bring left shin across the mat. Extend right leg back. Fold forward over the front leg.", side: "left" },
      { name: "Reclined Pigeon", sanskrit: "Supta Kapotasana", imageKey: "supta_kapotasana", breath: "Normal", duration: 12, instruction: "Roll onto back. Cross left ankle over right knee. Draw right thigh toward chest.", side: "left" },
      { name: "Reclined Spinal Twist", sanskrit: "Supta Matsyendrasana", imageKey: "supta_matsyendrasana", breath: "Exhale", duration: 10, instruction: "Draw left knee across the body to the right. Arms in T-position. Breathe into the twist.", side: "left" },
      { name: "Happy Baby", sanskrit: "Ananda Balasana", imageKey: "pawanmuktasana", breath: "Normal", duration: 12, instruction: "Draw both knees toward armpits, grab outer edges of feet. Gently rock side to side." },
      { name: "Corpse Pose", sanskrit: "Savasana", imageKey: "savasana", breath: "Normal", duration: 15, instruction: "Release everything. Legs long, arms at sides, palms up. Let the hips settle and integrate the opening." },
    ],
  },
  {
    id: "energizing_flow",
    name: "Energizing Flow",
    subtitle: "Power & Vitality",
    description: "A vigorous sequence combining standing poses, backbends, and core work. Builds heat, strength, and stamina. Best for mornings.",
    difficulty: "Advanced",
    duration: "15-20 min",
    focus: ["Full Body", "Core", "Strength", "Energy"],
    icon: <Zap className="w-5 h-5" />,
    color: "bg-forest/10 border-forest/30",
    steps: [
      { name: "Mountain Pose", sanskrit: "Tadasana", imageKey: "tadasana", breath: "Normal", duration: 5, instruction: "Stand tall, activate every muscle. This is an active, engaged Mountain Pose." },
      { name: "Chair Pose", sanskrit: "Utkatasana", imageKey: "utkatasana", breath: "Inhale", duration: 8, instruction: "Bend knees deeply, arms overhead. Sit back into the heels. Engage the core, keep chest lifted." },
      { name: "Twisted Chair", sanskrit: "Parivrtta Utkatasana", imageKey: "utkatasana", breath: "Exhale", duration: 6, instruction: "Bring palms together at heart. Twist to the right, hooking left elbow outside right knee.", side: "right" },
      { name: "Plank Pose", sanskrit: "Phalakasana", imageKey: "phalakasana", breath: "Hold", duration: 10, instruction: "Step back to Plank. Hold strong — body in one line. Engage every muscle." },
      { name: "Forearm Plank", sanskrit: "Makara Adho Mukha", imageKey: "forearm_plank", breath: "Hold", duration: 10, instruction: "Lower to forearms. Maintain the straight line. Press forearms into the mat, engage the core intensely." },
      { name: "Dolphin Pose", sanskrit: "Ardha Pincha Mayurasana", imageKey: "dolphin_pose", breath: "Exhale", duration: 8, instruction: "From forearm plank, lift hips into Dolphin Pose. Like Downward Dog but on forearms. Strengthens shoulders." },
      { name: "Warrior I", sanskrit: "Virabhadrasana I", imageKey: "virabhadrasana_i", breath: "Inhale", duration: 8, instruction: "Rise to hands, step right foot forward. Warrior I with power — arms strong overhead, back leg engaged.", side: "right" },
      { name: "Humble Warrior", sanskrit: "Baddha Virabhadrasana", imageKey: "humble_warrior", breath: "Exhale", duration: 8, instruction: "Interlace hands behind back, fold forward inside the front knee. Crown of head toward the floor.", side: "right" },
      { name: "Warrior III", sanskrit: "Virabhadrasana III", imageKey: "virabhadrasana_iii", breath: "Inhale", duration: 8, instruction: "Rise and extend into Warrior III. Arms forward, back leg lifted. Pure strength and balance.", side: "right" },
      { name: "Low Plank", sanskrit: "Chaturanga Dandasana", imageKey: "chaturanga_dandasana", breath: "Exhale", duration: 4, instruction: "Step back and lower through Chaturanga. Controlled descent, elbows tight." },
      { name: "Upward-Facing Dog", sanskrit: "Urdhva Mukha Svanasana", imageKey: "urdhva_mukha_svanasana", breath: "Inhale", duration: 5, instruction: "Press forward into Upward Dog. Chest proud, shoulders back, thighs lifted." },
      { name: "Downward-Facing Dog", sanskrit: "Adho Mukha Svanasana", imageKey: "adho_mukha_svanasana", breath: "Exhale", duration: 5, instruction: "Press back to Downward Dog. One breath to reset." },
      { name: "Warrior I", sanskrit: "Virabhadrasana I", imageKey: "virabhadrasana_i", breath: "Inhale", duration: 8, instruction: "Step left foot forward into Warrior I. Equal power on both sides.", side: "left" },
      { name: "Humble Warrior", sanskrit: "Baddha Virabhadrasana", imageKey: "humble_warrior", breath: "Exhale", duration: 8, instruction: "Interlace hands behind back, fold forward. Surrender within the strength.", side: "left" },
      { name: "Warrior III", sanskrit: "Virabhadrasana III", imageKey: "virabhadrasana_iii", breath: "Inhale", duration: 8, instruction: "Rise into Warrior III on the left leg. Arms forward, right leg back.", side: "left" },
      { name: "Boat Pose", sanskrit: "Navasana", imageKey: "navasana", breath: "Hold", duration: 10, instruction: "Come to seated. Lift legs and torso into a V-shape. Arms parallel to the floor. Core on fire." },
      { name: "Bridge Pose", sanskrit: "Setu Bandhasana", imageKey: "setu_bandhasana", breath: "Inhale", duration: 10, instruction: "Lie on back, feet flat. Press hips up high. Interlace hands under the back. Open the chest." },
      { name: "Corpse Pose", sanskrit: "Savasana", imageKey: "savasana", breath: "Normal", duration: 15, instruction: "Release everything. Let the energy you've built settle and integrate throughout the body." },
    ],
  },
  {
    id: "gentle_flow",
    name: "Gentle Restorative Flow",
    subtitle: "Calm & Restore",
    description: "A slow, soothing sequence perfect for recovery days, stress relief, or evening practice. Focuses on gentle stretches and deep breathing.",
    difficulty: "Beginner",
    duration: "10-15 min",
    focus: ["Relaxation", "Flexibility", "Stress Relief"],
    icon: <Feather className="w-5 h-5" />,
    color: "bg-sage-light/40 border-sage/30",
    steps: [
      { name: "Easy Pose", sanskrit: "Sukhasana", imageKey: "sukhasana", breath: "Normal", duration: 12, instruction: "Sit comfortably cross-legged. Close your eyes. Take 5 slow, deep breaths. Let the day fall away." },
      { name: "Cat-Cow", sanskrit: "Marjaryasana-Bitilasana", imageKey: "marjaryasana_bitilasana", breath: "Normal", duration: 12, instruction: "Come to hands and knees. Inhale: arch the back, look up (Cow). Exhale: round the spine, tuck chin (Cat). Repeat 5-6 times." },
      { name: "Child's Pose", sanskrit: "Balasana", imageKey: "balasana", breath: "Exhale", duration: 15, instruction: "Sit back on heels, fold forward. Arms extended or alongside body. Forehead to the mat. Breathe into the back body." },
      { name: "Extended Puppy Pose", sanskrit: "Uttana Shishosana", imageKey: "uttana_shishosana", breath: "Inhale", duration: 10, instruction: "From Child's Pose, walk hands forward. Keep hips over knees, melt chest toward the floor. Opens shoulders and upper back." },
      { name: "Sphinx Pose", sanskrit: "Salamba Bhujangasana", imageKey: "sphinx_pose", breath: "Normal", duration: 12, instruction: "Lie on belly, forearms on the mat. Lift chest gently. A very gentle backbend that's safe for most backs." },
      { name: "Reclined Butterfly", sanskrit: "Supta Baddha Konasana", imageKey: "supta_baddha_konasana", breath: "Normal", duration: 15, instruction: "Lie on back, soles of feet together, knees wide. Arms relaxed at sides. Let gravity open the hips." },
      { name: "Knees-to-Chest", sanskrit: "Apanasana", imageKey: "apanasana", breath: "Exhale", duration: 10, instruction: "Hug both knees to chest. Rock gently side to side. Massages the lower back." },
      { name: "Reclined Spinal Twist", sanskrit: "Supta Matsyendrasana", imageKey: "supta_matsyendrasana", breath: "Exhale", duration: 12, instruction: "Drop both knees to the right, arms in T-position. Hold, then switch to the left. Breathe deeply into each side.", side: "both" },
      { name: "Legs-Up-the-Wall", sanskrit: "Viparita Karani", imageKey: "viparita_karani", breath: "Normal", duration: 20, instruction: "Lie with legs up a wall (or just elevated). Arms relaxed. This is deeply restorative for circulation and the nervous system." },
      { name: "Corpse Pose", sanskrit: "Savasana", imageKey: "savasana", breath: "Normal", duration: 20, instruction: "Final relaxation. Legs long, arms at sides, palms up. Let go completely. Stay here for at least 3-5 minutes." },
    ],
  },
];

const VINYASA_CONTRAINDICATIONS = [
  { condition: "Shoulder / Wrist Injuries", detail: "Chaturanga and weight-bearing transitions put significant stress on shoulders and wrists. Modify or skip Chaturanga." },
  { condition: "Back Problems", detail: "Rapid spinal flexion/extension can aggravate disc issues. Move slowly and skip backbends if there's shooting pain." },
  { condition: "Hip Injuries", detail: "Deep lunges and hip openers may worsen hip impingement or labral tears. Stay within pain-free range." },
  { condition: "Heart Conditions", detail: "Fast-paced Vinyasa raises heart rate significantly. Use slower flows or get physician clearance." },
  { condition: "High Blood Pressure", detail: "Rapid transitions and inversions can spike blood pressure. Choose gentle flows and avoid holding breath." },
  { condition: "Pregnancy", detail: "Avoid fast-paced flows, deep twists, and prone positions. Gentle flows with modifications may be appropriate in early pregnancy with doctor approval." },
  { condition: "Recent Surgery", detail: "Wait for full clearance from your surgeon before any Vinyasa practice. Start with gentle flows only." },
  { condition: "Carpal Tunnel Syndrome", detail: "Repeated wrist loading in Plank, Chaturanga, and Down Dog can worsen symptoms. Use fists or forearms as alternatives." },
];

const difficultyColors: Record<string, string> = {
  Beginner: "bg-sage-light/60 text-forest",
  Intermediate: "bg-gold-light/60 text-gold-dark",
  Advanced: "bg-terracotta-light/60 text-terracotta",
};

const breathColors: Record<string, string> = {
  Inhale: "text-forest bg-sage-light/60",
  Exhale: "text-terracotta bg-terracotta-light/40",
  Hold: "text-gold-dark bg-gold-light/50",
  Normal: "text-muted-foreground bg-cream-dark/50",
};

export default function VinyasaFlows() {
  const [selectedFlow, setSelectedFlow] = useState<VinyasaFlow | null>(null);
  const [mode, setMode] = useState<"browse" | "learn" | "practice">("browse");
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showContraindications, setShowContraindications] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const audioRef = useRef<AudioContext | null>(null);

  const steps = selectedFlow?.steps || [];
  const currentStep = steps[currentStepIndex];

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

  useEffect(() => {
    if (!isPlaying || mode !== "practice" || !selectedFlow) return;

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          const nextIndex = currentStepIndex + 1;
          if (nextIndex >= steps.length) {
            setIsPlaying(false);
            playBell();
            return 0;
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
  }, [isPlaying, mode, currentStepIndex, steps, selectedFlow, playBell]);

  const selectFlow = (flow: VinyasaFlow) => {
    setSelectedFlow(flow);
    setMode("learn");
    setCurrentStepIndex(0);
    setIsPlaying(false);
  };

  const startPractice = () => {
    setMode("practice");
    setCurrentStepIndex(0);
    setTimeLeft(steps[0]?.duration || 5);
    setIsPlaying(true);
    playBell();
  };

  const goBack = () => {
    if (mode === "practice") {
      setIsPlaying(false);
      setMode("learn");
    } else {
      setSelectedFlow(null);
      setMode("browse");
    }
  };

  const nextStep = () => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
      setTimeLeft(steps[currentStepIndex + 1].duration);
      playBell();
    }
  };

  const prevStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
      setTimeLeft(steps[currentStepIndex - 1].duration);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="relative pt-24 pb-12 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-sage-light/20 via-background to-terracotta-light/10" />
        <div className="relative z-10 container max-w-5xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="flex items-center justify-center gap-2 mb-4">
              <Wind className="w-6 h-6 text-forest" />
              <span className="text-sm font-medium text-forest uppercase tracking-wider">
                Flow Practice
              </span>
            </div>
            <h1 className="font-serif text-4xl md:text-6xl font-bold text-foreground mb-4">
              Vinyasa Flows
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-6">
              Curated flow sequences for every level and goal — from gentle restoration to powerful strength-building.
              Each flow is a complete practice with step-by-step guidance.
            </p>

            <button
              onClick={() => setShowContraindications(!showContraindications)}
              className="inline-flex items-center gap-2 text-sm text-rose hover:text-rose/80 transition-colors"
            >
              <AlertTriangle className="w-4 h-4" />
              {showContraindications ? "Hide" : "View"} Contraindications
            </button>
          </motion.div>
        </div>
      </section>

      {/* Contraindications */}
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
                  Vinyasa Flow Contraindications
                </h3>
                <div className="grid sm:grid-cols-2 gap-3">
                  {VINYASA_CONTRAINDICATIONS.map((c) => (
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
          <AnimatePresence mode="wait">
            {mode === "browse" ? (
              /* ── BROWSE FLOWS ── */
              <motion.div
                key="browse"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <div className="grid md:grid-cols-2 gap-6">
                  {FLOWS.map((flow, i) => (
                    <motion.button
                      key={flow.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.08 }}
                      onClick={() => selectFlow(flow)}
                      className={`text-left rounded-2xl border-2 p-6 transition-all hover:shadow-lg hover:scale-[1.01] ${flow.color}`}
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl bg-white/80 flex items-center justify-center shrink-0 text-forest">
                          {flow.icon}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-serif text-xl font-semibold text-foreground">{flow.name}</h3>
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${difficultyColors[flow.difficulty]}`}>
                              {flow.difficulty}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground italic mb-2">{flow.subtitle}</p>
                          <p className="text-sm text-foreground/70 leading-relaxed mb-3">{flow.description}</p>
                          <div className="flex items-center gap-3 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {flow.duration}
                            </span>
                            <span>{flow.steps.length} poses</span>
                            <div className="flex gap-1">
                              {flow.focus.slice(0, 3).map((f) => (
                                <span key={f} className="px-2 py-0.5 bg-white/50 rounded-full">{f}</span>
                              ))}
                            </div>
                          </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-muted-foreground shrink-0 mt-2" />
                      </div>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            ) : mode === "learn" && selectedFlow ? (
              /* ── LEARN MODE ── */
              <motion.div
                key="learn"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
              >
                <button
                  onClick={goBack}
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to All Flows
                </button>

                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h2 className="font-serif text-3xl font-bold text-foreground">{selectedFlow.name}</h2>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${difficultyColors[selectedFlow.difficulty]}`}>
                        {selectedFlow.difficulty}
                      </span>
                    </div>
                    <p className="text-muted-foreground">{selectedFlow.subtitle} — {selectedFlow.steps.length} poses, {selectedFlow.duration}</p>
                  </div>
                  <button
                    onClick={startPractice}
                    className="flex items-center gap-2 px-8 py-3.5 bg-forest text-cream font-semibold rounded-full hover:bg-forest-light transition-all shadow-lg"
                  >
                    <Play className="w-5 h-5" />
                    Start Guided Practice
                  </button>
                </div>

                {/* Step cards */}
                <div className="space-y-4">
                  {selectedFlow.steps.map((step, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.04 }}
                      className="bg-card border border-border rounded-2xl p-5 hover:border-forest/20 transition-all"
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-full bg-forest/10 flex items-center justify-center shrink-0">
                          <span className="text-sm font-bold text-forest">{i + 1}</span>
                        </div>
                        <div className="w-14 h-14 rounded-xl overflow-hidden bg-white border border-border/50 shrink-0 flex items-center justify-center">
                          {asanaImages[step.imageKey] ? (
                            <img src={asanaImages[step.imageKey]} alt={step.name} className="w-full h-full object-contain p-1" loading="lazy" />
                          ) : (
                            <Leaf className="w-5 h-5 text-forest/20" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <h3 className="font-serif text-lg font-semibold text-foreground">{step.name}</h3>
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${breathColors[step.breath]}`}>
                              <Wind className="w-3 h-3 inline mr-1" />{step.breath}
                            </span>
                            {step.side && (
                              <span className="text-xs px-2 py-0.5 rounded-full bg-cream-dark text-muted-foreground">
                                {step.side === "both" ? "Both Sides" : `${step.side.charAt(0).toUpperCase() + step.side.slice(1)} Side`}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground italic mb-1">{step.sanskrit}</p>
                          <p className="text-sm text-foreground/80 leading-relaxed">{step.instruction}</p>
                        </div>
                        <span className="text-xs text-muted-foreground shrink-0">{step.duration}s</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            ) : mode === "practice" && selectedFlow && currentStep ? (
              /* ── PRACTICE MODE ── */
              <motion.div
                key="practice"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <button
                  onClick={goBack}
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to Overview
                </button>

                {/* Progress */}
                <div className="mb-8">
                  <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
                    <span>{selectedFlow.name}</span>
                    <span>Step {currentStepIndex + 1} of {steps.length}</span>
                  </div>
                  <div className="h-2 bg-cream-dark rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-forest rounded-full"
                      animate={{ width: `${((currentStepIndex + 1) / steps.length) * 100}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                </div>

                {/* Current step */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentStepIndex}
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    transition={{ duration: 0.3 }}
                    className="bg-card border-2 border-forest/20 rounded-3xl p-8 mb-8"
                  >
                    <div className="flex flex-col md:flex-row items-center gap-8">
                      <div className="w-40 h-40 md:w-48 md:h-48 rounded-2xl overflow-hidden bg-white border border-border/50 flex items-center justify-center shrink-0">
                        {asanaImages[currentStep.imageKey] ? (
                          <img src={asanaImages[currentStep.imageKey]} alt={currentStep.name} className="w-full h-full object-contain p-4" />
                        ) : (
                          <Leaf className="w-12 h-12 text-forest/20" />
                        )}
                      </div>
                      <div className="flex-1 text-center md:text-left">
                        <div className="flex items-center justify-center md:justify-start gap-3 mb-2 flex-wrap">
                          <span className="text-sm font-bold text-forest bg-sage-light/60 px-3 py-1 rounded-full">
                            Step {currentStepIndex + 1}
                          </span>
                          <span className={`text-sm px-3 py-1 rounded-full font-medium ${breathColors[currentStep.breath]}`}>
                            <Wind className="w-3.5 h-3.5 inline mr-1" />{currentStep.breath}
                          </span>
                          {currentStep.side && (
                            <span className="text-sm px-3 py-1 rounded-full bg-cream-dark text-muted-foreground">
                              {currentStep.side === "both" ? "Both Sides" : `${currentStep.side.charAt(0).toUpperCase() + currentStep.side.slice(1)} Side`}
                            </span>
                          )}
                        </div>
                        <h2 className="font-serif text-3xl font-bold text-foreground mb-1">{currentStep.name}</h2>
                        <p className="text-sm text-muted-foreground italic mb-4">{currentStep.sanskrit}</p>
                        <p className="text-foreground/80 leading-relaxed">{currentStep.instruction}</p>

                        <div className="mt-6 flex items-center justify-center md:justify-start gap-4">
                          <div className="text-4xl font-mono font-bold text-forest">{timeLeft}s</div>
                          <div className="h-3 flex-1 max-w-48 bg-cream-dark rounded-full overflow-hidden">
                            <motion.div
                              className="h-full bg-forest rounded-full"
                              animate={{ width: `${((currentStep.duration - timeLeft) / currentStep.duration) * 100}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </AnimatePresence>

                {/* Controls */}
                <div className="flex items-center justify-center gap-4">
                  <button onClick={prevStep} disabled={currentStepIndex === 0} className="w-12 h-12 rounded-full bg-cream-dark flex items-center justify-center hover:bg-border transition-colors disabled:opacity-30">
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button onClick={() => setIsPlaying(!isPlaying)} className="w-16 h-16 rounded-full bg-forest text-cream flex items-center justify-center hover:bg-forest-light transition-colors shadow-lg">
                    {isPlaying ? <Pause className="w-7 h-7" /> : <Play className="w-7 h-7 ml-1" />}
                  </button>
                  <button onClick={nextStep} disabled={currentStepIndex >= steps.length - 1} className="w-12 h-12 rounded-full bg-cream-dark flex items-center justify-center hover:bg-border transition-colors disabled:opacity-30">
                    <ChevronRight className="w-5 h-5" />
                  </button>
                  <button onClick={() => setSoundEnabled(!soundEnabled)} className="w-10 h-10 rounded-full bg-cream-dark flex items-center justify-center hover:bg-border transition-colors">
                    {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                  </button>
                  <button onClick={goBack} className="w-10 h-10 rounded-full bg-cream-dark flex items-center justify-center hover:bg-border transition-colors">
                    <RotateCcw className="w-4 h-4" />
                  </button>
                </div>

                {/* Thumbnails */}
                <div className="mt-8 flex gap-2 overflow-x-auto pb-2">
                  {steps.map((step, i) => (
                    <button
                      key={i}
                      onClick={() => { setCurrentStepIndex(i); setTimeLeft(steps[i].duration); }}
                      className={`shrink-0 w-14 h-14 rounded-xl border-2 overflow-hidden flex items-center justify-center transition-all ${
                        i === currentStepIndex ? "border-forest bg-sage-light/50 scale-110" : i < currentStepIndex ? "border-forest/30 bg-sage-light/20 opacity-60" : "border-border bg-white"
                      }`}
                    >
                      {asanaImages[step.imageKey] ? (
                        <img src={asanaImages[step.imageKey]} alt={step.name} className="w-full h-full object-contain p-1" />
                      ) : (
                        <span className="text-xs font-bold text-forest">{i + 1}</span>
                      )}
                    </button>
                  ))}
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      </section>
    </div>
  );
}
