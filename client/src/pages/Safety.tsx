/*
 * Design: Earth & Breath — Organic Modernism
 * Safety: Comprehensive safety guidelines, when to stop, common mistakes, age considerations
 */
import { useMemo } from "react";
import { motion } from "framer-motion";
import {
  Shield,
  AlertTriangle,
  Check,
  X,
  Heart,
  Wind,
  Users,
  Stethoscope,
  Leaf,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import { getSafetyRules } from "@/data/engine";

export default function Safety() {
  const rules = useMemo(() => getSafetyRules(), []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Header */}
      <section className="pt-24 pb-12">
        <div className="container max-w-4xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-full bg-sage-light flex items-center justify-center">
                <Shield className="w-4 h-4 text-forest" />
              </div>
              <span className="text-sm font-medium text-forest uppercase tracking-wide">
                Safety First
              </span>
            </div>
            <h1 className="font-serif text-3xl md:text-5xl font-bold text-foreground mb-3">
              Yoga Safety Guide
            </h1>
            <p className="text-muted-foreground text-lg max-w-xl">
              Essential guidelines for a safe and beneficial yoga practice, regardless of your
              experience level.
            </p>
          </motion.div>
        </div>
      </section>

      <div className="container max-w-4xl mx-auto px-4 pb-24 space-y-8">
        {/* General Guidelines */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card border border-border rounded-2xl p-6 md:p-8"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-sage-light flex items-center justify-center">
              <Check className="w-5 h-5 text-forest" />
            </div>
            <h2 className="font-serif text-2xl font-semibold">General Guidelines</h2>
          </div>
          <ul className="space-y-3">
            {rules.general_guidelines.map((item, i) => (
              <motion.li
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15 + i * 0.04 }}
                className="flex items-start gap-3 text-foreground/80"
              >
                <div className="w-6 h-6 rounded-full bg-sage-light/60 flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="w-3.5 h-3.5 text-forest" />
                </div>
                <span className="leading-relaxed">{item}</span>
              </motion.li>
            ))}
          </ul>
        </motion.div>

        {/* When to Stop */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-rose-light/10 border border-rose/20 rounded-2xl p-6 md:p-8"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-rose-light/40 flex items-center justify-center">
              <X className="w-5 h-5 text-rose" />
            </div>
            <h2 className="font-serif text-2xl font-semibold">When to Stop Immediately</h2>
          </div>
          <p className="text-foreground/70 mb-4">
            Stop your practice immediately and seek medical attention if you experience any of the following:
          </p>
          <ul className="space-y-3">
            {rules.when_to_stop.map((item, i) => (
              <motion.li
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.25 + i * 0.04 }}
                className="flex items-start gap-3 text-foreground/80"
              >
                <AlertTriangle className="w-5 h-5 text-rose shrink-0 mt-0.5" />
                <span className="leading-relaxed">{item}</span>
              </motion.li>
            ))}
          </ul>
        </motion.div>

        {/* Common Mistakes */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gold-light/20 border border-gold/20 rounded-2xl p-6 md:p-8"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gold-light/60 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-terracotta" />
            </div>
            <h2 className="font-serif text-2xl font-semibold">Common Mistakes to Avoid</h2>
          </div>
          <ul className="space-y-3">
            {rules.common_mistakes.map((item, i) => (
              <motion.li
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.35 + i * 0.04 }}
                className="flex items-start gap-3 text-foreground/80"
              >
                <div className="w-6 h-6 rounded-full bg-gold-light/60 flex items-center justify-center shrink-0 mt-0.5">
                  <X className="w-3.5 h-3.5 text-terracotta" />
                </div>
                <span className="leading-relaxed">{item}</span>
              </motion.li>
            ))}
          </ul>
        </motion.div>

        {/* Breathing Guidelines */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-card border border-border rounded-2xl p-6 md:p-8"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-sage-light flex items-center justify-center">
              <Wind className="w-5 h-5 text-forest" />
            </div>
            <h2 className="font-serif text-2xl font-semibold">Breathing Guidelines</h2>
          </div>
          <ul className="space-y-3">
            {rules.breathing_guidelines.map((item, i) => (
              <motion.li
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.45 + i * 0.04 }}
                className="flex items-start gap-3 text-foreground/80"
              >
                <div className="w-6 h-6 rounded-full bg-sage-light/60 flex items-center justify-center shrink-0 mt-0.5">
                  <Wind className="w-3.5 h-3.5 text-forest" />
                </div>
                <span className="leading-relaxed">{item}</span>
              </motion.li>
            ))}
          </ul>
        </motion.div>

        {/* Age Considerations */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-card border border-border rounded-2xl p-6 md:p-8"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-sage-light flex items-center justify-center">
              <Users className="w-5 h-5 text-forest" />
            </div>
            <h2 className="font-serif text-2xl font-semibold">Age Considerations</h2>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            {Object.entries(rules.age_considerations).map(([age, advice], i) => (
              <motion.div
                key={age}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.55 + i * 0.08 }}
                className="bg-sage-light/20 rounded-xl p-4"
              >
                <h3 className="font-serif text-lg font-semibold capitalize mb-2 text-forest-dark">
                  {age}
                </h3>
                <p className="text-sm text-foreground/70 leading-relaxed">{advice}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Post-Surgery Guidelines */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-card border border-border rounded-2xl p-6 md:p-8"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-rose-light/30 flex items-center justify-center">
              <Stethoscope className="w-5 h-5 text-rose" />
            </div>
            <h2 className="font-serif text-2xl font-semibold">Post-Surgery Guidelines</h2>
          </div>
          <div className="space-y-4">
            {Object.entries(rules.post_surgery_guidelines).map(([type, advice], i) => (
              <motion.div
                key={type}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.65 + i * 0.08 }}
                className="flex items-start gap-3 bg-rose-light/10 rounded-xl p-4"
              >
                <Heart className="w-5 h-5 text-rose shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold capitalize mb-1 text-foreground">
                    {type} Surgery
                  </h3>
                  <p className="text-sm text-foreground/70 leading-relaxed">{advice}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Disclaimer */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-forest-dark text-cream rounded-2xl p-6 md:p-8"
        >
          <div className="flex items-center gap-3 mb-4">
            <Shield className="w-6 h-6 text-gold" />
            <h2 className="font-serif text-xl font-semibold text-cream">Important Disclaimer</h2>
          </div>
          <p className="text-cream/80 leading-relaxed">
            This guide is for informational purposes only and should not be considered medical
            advice. Always consult with a qualified healthcare professional before beginning any
            yoga practice, especially if you have existing health conditions, injuries, or are
            recovering from surgery. A certified yoga therapist can provide personalized guidance
            tailored to your specific needs.
          </p>
        </motion.div>
      </div>

      {/* Footer */}
      <footer className="py-12 bg-forest-dark text-cream/70">
        <div className="container max-w-5xl mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <Leaf className="w-5 h-5 text-gold" />
              <span className="font-serif text-lg font-semibold text-cream">YogaPath</span>
            </div>
            <p className="text-sm text-center md:text-left">
              This tool is for informational purposes only. Always consult a healthcare professional.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
