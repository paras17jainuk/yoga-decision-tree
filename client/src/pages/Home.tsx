/*
 * Design: Earth & Breath — Organic Modernism
 * Home: Full-screen hero with decision tree wizard
 * Warm earthy tones, organic shapes, flowing animations
 */
import { useState, useMemo, useCallback, useEffect } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  ArrowLeft,
  Leaf,
  Heart,
  Brain,
  Baby,
  Scale,
  Wind,
  Eye,
  Utensils,
  Shield,
  ChevronDown,
  Sparkles,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import { getDatabase, getDecisionNode } from "@/data/engine";
import type { Severity } from "@/data/types";

const HERO_IMG = "https://d2xsxph8kpxj0f.cloudfront.net/310519663318567070/87xTRNw69cyUtrfeqdS85m/hero-yoga-3c5Tm974VLdNJycZVo5xJH.webp";
const MEDITATION_IMG = "https://d2xsxph8kpxj0f.cloudfront.net/310519663318567070/87xTRNw69cyUtrfeqdS85m/yoga-meditation-hbdCe4sXnkqrDGXDLQKkeu.webp";
const PATTERN_IMG = "https://d2xsxph8kpxj0f.cloudfront.net/310519663318567070/87xTRNw69cyUtrfeqdS85m/organic-pattern-FeSsJB2HkH5bkcobPct9ed.webp";

const categoryIcons: Record<string, React.ReactNode> = {
  pain_musculoskeletal: <Heart className="w-6 h-6" />,
  cardiovascular: <Heart className="w-6 h-6" />,
  pregnancy: <Baby className="w-6 h-6" />,
  mental_health: <Brain className="w-6 h-6" />,
  metabolic: <Scale className="w-6 h-6" />,
  digestive: <Utensils className="w-6 h-6" />,
  respiratory: <Wind className="w-6 h-6" />,
  neurological: <Eye className="w-6 h-6" />,
};

const categoryColors: Record<string, string> = {
  "I have pain in a specific body area": "bg-terracotta-light/30 border-terracotta/30 hover:border-terracotta/60",
  "I have a cardiovascular condition": "bg-rose-light/30 border-rose/30 hover:border-rose/60",
  "I am pregnant": "bg-gold-light/30 border-gold/30 hover:border-gold/60",
  "I have mental health or sleep concerns": "bg-sage-light/30 border-sage/30 hover:border-sage/60",
  "I have a metabolic condition (diabetes, weight)": "bg-terracotta-light/30 border-terracotta/30 hover:border-terracotta/60",
  "I have digestive issues": "bg-gold-light/30 border-gold/30 hover:border-gold/60",
  "I have respiratory issues": "bg-sage-light/30 border-sage/30 hover:border-sage/60",
  "I have headaches, eye strain, or vertigo": "bg-rose-light/30 border-rose/30 hover:border-rose/60",
  "I just want general yoga safety guidelines": "bg-cream-dark/50 border-forest/20 hover:border-forest/40",
};

export default function Home() {
  const [, navigate] = useLocation();
  const [currentStep, setCurrentStep] = useState("hero");
  const [selectedConditions, setSelectedConditions] = useState<string[]>([]);
  const [severity, setSeverity] = useState<Severity | null>(null);
  const [history, setHistory] = useState<string[]>([]);

  const db = useMemo(() => getDatabase(), []);

  const goToStep = useCallback(
    (step: string) => {
      setHistory((prev) => [...prev, currentStep]);
      setCurrentStep(step);
    },
    [currentStep]
  );

  const goBack = useCallback(() => {
    const prev = history[history.length - 1];
    if (prev) {
      setHistory((h) => h.slice(0, -1));
      setCurrentStep(prev);
    }
  }, [history]);

  const handleOptionClick = useCallback(
    (option: { label: string; next?: string; condition?: string; value?: string }) => {
      if (option.condition) {
        setSelectedConditions((prev) =>
          prev.includes(option.condition!)
            ? prev.filter((c) => c !== option.condition)
            : [...prev, option.condition!]
        );
      }
      if (option.value) {
        setSeverity(option.value as Severity);
      }
      if (option.next && !option.condition) {
        goToStep(option.next);
      }
    },
    [goToStep]
  );

  const handleContinue = useCallback(
    (nextStep: string) => {
      if (nextStep === "results") {
        const params = new URLSearchParams();
        params.set("conditions", selectedConditions.join(","));
        if (severity) params.set("severity", severity);
        navigate(`/results?${params.toString()}`);
      } else {
        goToStep(nextStep);
      }
    },
    [selectedConditions, severity, navigate, goToStep]
  );

  const handleSafetyClick = useCallback(() => {
    navigate("/safety");
  }, [navigate]);

  // Listen for the "start-assessment" event from Navbar or Dashboard
  useEffect(() => {
    const handler = () => {
      if (currentStep === "hero") {
        goToStep("start");
      }
    };
    window.addEventListener("start-assessment", handler);
    return () => window.removeEventListener("start-assessment", handler);
  }, [currentStep, goToStep]);

  // Auto-start assessment if URL has ?start=assessment
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("start") === "assessment" && currentStep === "hero") {
      goToStep("start");
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const currentNode = currentStep !== "hero" ? getDecisionNode(currentStep) : null;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <AnimatePresence mode="wait">
        {currentStep === "hero" ? (
          <HeroSection key="hero" onStart={() => goToStep("start")} />
        ) : (
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="min-h-screen pt-24 pb-16"
            style={{
              backgroundImage: `url(${PATTERN_IMG})`,
              backgroundSize: "600px",
              backgroundRepeat: "repeat",
              backgroundPosition: "center",
            }}
          >
            <div className="absolute inset-0 bg-background/92" style={{ position: "fixed", zIndex: 0 }} />
            <div className="relative z-10 container max-w-3xl mx-auto px-4">
              {/* Back button */}
              {history.length > 0 && (
                <motion.button
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  onClick={goBack}
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Go back
                </motion.button>
              )}

              {/* Progress dots */}
              <div className="flex items-center gap-2 mb-8">
                {["start", "detail", "severity"].map((_, i) => (
                  <div
                    key={i}
                    className={`h-1.5 rounded-full transition-all duration-500 ${
                      i <= history.length
                        ? "w-10 bg-forest"
                        : "w-6 bg-border"
                    }`}
                  />
                ))}
              </div>

              {currentNode && (
                <div>
                  <motion.h2
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="font-serif text-3xl md:text-4xl font-semibold text-foreground mb-3 leading-tight"
                  >
                    {currentNode.question}
                  </motion.h2>

                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="text-muted-foreground mb-8"
                  >
                    {currentNode.type === "multi_select"
                      ? "Select all that apply, then continue."
                      : currentNode.type === "auto"
                      ? "We'll find the best recommendations for you."
                      : "Choose the option that best describes your situation."}
                  </motion.p>

                  {/* Auto-redirect for single-condition nodes */}
                  {currentNode.type === "auto" && currentNode.condition && (
                    <AutoRedirect
                      condition={currentNode.condition}
                      next={currentNode.next || "severity_level"}
                      setSelectedConditions={setSelectedConditions}
                      onContinue={handleContinue}
                    />
                  )}

                  {/* Options */}
                  {currentNode.options && (
                    <div className="space-y-3">
                      {currentNode.options.map((option, i) => {
                        const isSelected =
                          option.condition
                            ? selectedConditions.includes(option.condition)
                            : option.value
                            ? severity === option.value
                            : false;

                        const colorClass =
                          categoryColors[option.label] ||
                          "bg-card border-border hover:border-forest/40";

                        return (
                          <motion.button
                            key={option.label}
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.15 + i * 0.05 }}
                            onClick={() => {
                              if (option.label === "I just want general yoga safety guidelines") {
                                handleSafetyClick();
                                return;
                              }
                              handleOptionClick(option);
                              // For single-select without condition, navigation is handled in handleOptionClick
                              // For single-select with value (severity), we need to auto-continue
                              if (currentNode.type === "single_select" && option.value && currentNode.next) {
                                // Severity selected — go to results
                                const params = new URLSearchParams();
                                const conditions = option.condition
                                  ? [...selectedConditions, option.condition]
                                  : selectedConditions;
                                params.set("conditions", conditions.join(","));
                                params.set("severity", option.value);
                                navigate(`/results?${params.toString()}`);
                              }
                              if (currentNode.type === "single_select" && option.condition && !option.value) {
                                // Single select with condition but no value — go to next
                                const nextStep = option.next || currentNode.next;
                                if (nextStep) {
                                  setSelectedConditions((prev) =>
                                    prev.includes(option.condition!)
                                      ? prev
                                      : [...prev, option.condition!]
                                  );
                                  handleContinue(nextStep);
                                }
                              }
                            }}
                            className={`w-full text-left px-5 py-4 rounded-2xl border-2 transition-all duration-300 ${
                              isSelected
                                ? "border-forest bg-sage-light/50 shadow-md"
                                : colorClass
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-medium text-foreground">
                                {option.label}
                              </span>
                              {isSelected && (
                                <motion.div
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  className="w-6 h-6 rounded-full bg-forest flex items-center justify-center"
                                >
                                  <svg className="w-3.5 h-3.5 text-cream" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                  </svg>
                                </motion.div>
                              )}
                            </div>
                          </motion.button>
                        );
                      })}
                    </div>
                  )}

                  {/* Continue button for multi-select */}
                  {currentNode.type === "multi_select" && selectedConditions.length > 0 && currentNode.next && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-8"
                    >
                      <button
                        onClick={() => handleContinue(currentNode.next!)}
                        className="flex items-center gap-3 px-8 py-4 bg-forest text-cream font-semibold rounded-full hover:bg-forest-light transition-all shadow-lg hover:shadow-xl"
                      >
                        Continue with {selectedConditions.length} selection{selectedConditions.length > 1 ? "s" : ""}
                        <ArrowRight className="w-5 h-5" />
                      </button>
                    </motion.div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function AutoRedirect({
  condition,
  next,
  setSelectedConditions,
  onContinue,
}: {
  condition: string;
  next: string;
  setSelectedConditions: React.Dispatch<React.SetStateAction<string[]>>;
  onContinue: (next: string) => void;
}) {
  useEffect(() => {
    setSelectedConditions((prev) =>
      prev.includes(condition) ? prev : [...prev, condition]
    );
    const timer = setTimeout(() => onContinue(next), 400);
    return () => clearTimeout(timer);
  }, [condition, next, setSelectedConditions, onContinue]);

  return (
    <div className="flex items-center gap-3 text-muted-foreground">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
        className="w-5 h-5 border-2 border-forest border-t-transparent rounded-full"
      />
      Finding the best recommendations for you...
    </div>
  );
}

function HeroSection({ onStart }: { onStart: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
    >
      {/* Hero */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        {/* Background image */}
        <div className="absolute inset-0">
          <img
            src={HERO_IMG}
            alt="Yoga in nature"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/30" />
        </div>

        <div className="relative z-10 container pt-24 pb-16">
          <div className="max-w-2xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex items-center gap-2 mb-6"
            >
              <div className="w-8 h-8 rounded-full bg-gold/30 flex items-center justify-center backdrop-blur-sm">
                <Sparkles className="w-4 h-4 text-gold" />
              </div>
              <span className="text-gold text-sm font-medium tracking-wide uppercase">
                Personalized Yoga Guidance
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="font-serif text-5xl md:text-7xl font-bold text-white leading-[1.1] mb-6"
            >
              Find Your
              <br />
              <span className="text-gold">Perfect Practice</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45 }}
              className="text-lg md:text-xl text-white/80 mb-10 leading-relaxed max-w-lg"
            >
              Answer a few questions about your body and health, and we'll create
              a personalized yoga recommendation — what to practice, what to
              avoid, and how to stay safe.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <button
                onClick={onStart}
                className="flex items-center justify-center gap-3 px-8 py-4 bg-forest text-cream font-semibold text-lg rounded-full hover:bg-forest-light transition-all shadow-xl hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98]"
              >
                <Leaf className="w-5 h-5" />
                Begin Your Assessment
                <ArrowRight className="w-5 h-5" />
              </button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="flex items-center gap-6 mt-10 text-white/60 text-sm"
            >
              <span className="flex items-center gap-1.5">
                <Shield className="w-4 h-4" /> 71+ Asanas
              </span>
              <span className="flex items-center gap-1.5">
                <Heart className="w-4 h-4" /> 25+ Conditions
              </span>
              <span className="flex items-center gap-1.5">
                <Brain className="w-4 h-4" /> Evidence-Based
              </span>
            </motion.div>
          </div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          >
            <ChevronDown className="w-6 h-6 text-white/50" />
          </motion.div>
        </motion.div>
      </section>

      {/* How it works */}
      <section className="py-24 bg-background relative overflow-hidden">
        <div className="container max-w-5xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="font-serif text-3xl md:text-4xl font-semibold text-foreground mb-4">
              How It Works
            </h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              Three simple steps to your personalized yoga practice
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Tell Us About You",
                desc: "Select your health conditions, pain areas, or concerns from our comprehensive list.",
                color: "bg-sage-light/50",
                accent: "text-forest",
              },
              {
                step: "02",
                title: "Rate Your Severity",
                desc: "Help us understand the intensity of your condition so we can tailor recommendations.",
                color: "bg-gold-light/50",
                accent: "text-terracotta",
              },
              {
                step: "03",
                title: "Get Your Plan",
                desc: "Receive personalized recommendations — what to practice, what to avoid, and safety tips.",
                color: "bg-rose-light/50",
                accent: "text-rose",
              },
            ].map((item, i) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className={`${item.color} rounded-3xl p-8 border border-transparent hover:border-border transition-all`}
              >
                <span className={`font-serif text-5xl font-bold ${item.accent} opacity-40`}>
                  {item.step}
                </span>
                <h3 className="font-serif text-xl font-semibold mt-4 mb-3 text-foreground">
                  {item.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {item.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories preview */}
      <section className="py-24 bg-cream-dark/30 relative">
        <div className="container max-w-5xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="font-serif text-3xl md:text-4xl font-semibold text-foreground mb-4">
              Conditions We Cover
            </h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              Our database covers 25+ health conditions across 8 categories
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {getDatabase().categories.map((cat, i) => (
              <motion.div
                key={cat.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="bg-card rounded-2xl p-6 border border-border hover:shadow-lg hover:border-forest/20 transition-all group"
              >
                <div className="w-12 h-12 rounded-xl bg-sage-light flex items-center justify-center mb-4 group-hover:bg-forest group-hover:text-cream transition-colors text-forest">
                  {categoryIcons[cat.id] || <Leaf className="w-6 h-6" />}
                </div>
                <h3 className="font-serif text-lg font-semibold mb-2 text-foreground">
                  {cat.name}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {cat.description}
                </p>
                <p className="text-xs text-forest font-medium mt-3">
                  {cat.conditions.length} condition{cat.conditions.length > 1 ? "s" : ""}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA section */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={MEDITATION_IMG}
            alt="Meditation"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-forest-dark/80" />
        </div>
        <div className="relative z-10 container max-w-3xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="font-serif text-3xl md:text-5xl font-bold text-white mb-6 leading-tight">
              Your Body Knows Best.
              <br />
              <span className="text-gold">Let Us Help You Listen.</span>
            </h2>
            <p className="text-white/70 text-lg mb-10 max-w-lg mx-auto">
              Every body is different. Get recommendations tailored to your unique
              conditions, limitations, and goals.
            </p>
            <button
              onClick={onStart}
              className="inline-flex items-center gap-3 px-8 py-4 bg-gold text-forest-dark font-semibold text-lg rounded-full hover:bg-gold-light transition-all shadow-xl hover:shadow-2xl"
            >
              Start Your Assessment
              <ArrowRight className="w-5 h-5" />
            </button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-forest-dark text-cream/70">
        <div className="container max-w-5xl mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <Leaf className="w-5 h-5 text-gold" />
              <span className="font-serif text-lg font-semibold text-cream">YogaPath</span>
            </div>
            <p className="text-sm text-center md:text-left">
              This tool is for informational purposes only. Always consult a healthcare professional
              before starting any yoga practice.
            </p>
          </div>
        </div>
      </footer>
    </motion.div>
  );
}
