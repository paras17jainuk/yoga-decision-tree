/*
 * Design: Earth & Breath — Organic Modernism
 * Results: Two-panel layout — "Your Practice" (recommended) and "Proceed with Caution" (contraindicated)
 * Warm earthy tones, organic shapes, detailed asana cards
 */
import { useMemo, useState } from "react";
import { useLocation, useSearch } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Check,
  X,
  AlertTriangle,
  Info,
  ChevronDown,
  ChevronUp,
  Leaf,
  Shield,
  Star,
  RefreshCw,
  Play,
  Timer,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import {
  generateRecommendations,
  getConditionById,
  getSafetyRules,
} from "@/data/engine";
import { asanaImages } from "@/data/asanaImages";
import type { Severity, AsanaRecommendation } from "@/data/types";

const RESULTS_BG = "https://d2xsxph8kpxj0f.cloudfront.net/310519663318567070/87xTRNw69cyUtrfeqdS85m/results-bg-nM45BvEepFyKP9wrtVQrZ4.webp";

const difficultyColors: Record<string, string> = {
  beginner: "bg-sage-light text-forest-dark",
  intermediate: "bg-gold-light text-terracotta",
  advanced: "bg-rose-light text-rose",
};

export default function Results() {
  const [, navigate] = useLocation();
  const search = useSearch();
  const params = useMemo(() => new URLSearchParams(search), [search]);

  const conditionIds = useMemo(
    () => (params.get("conditions") || "").split(",").filter(Boolean),
    [params]
  );
  const severity = (params.get("severity") as Severity) || null;

  const results = useMemo(
    () => generateRecommendations(conditionIds, severity),
    [conditionIds, severity]
  );

  const conditionNames = useMemo(
    () =>
      conditionIds
        .map((id) => getConditionById(id))
        .filter(Boolean)
        .map((c) => c!.name),
    [conditionIds]
  );

  const [activeTab, setActiveTab] = useState<"recommended" | "avoid" | "safety">("recommended");
  const [expandedAsana, setExpandedAsana] = useState<string | null>(null);

  if (conditionIds.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-24 container max-w-2xl mx-auto px-4 text-center">
          <h2 className="font-serif text-3xl font-semibold mb-4">No Conditions Selected</h2>
          <p className="text-muted-foreground mb-8">
            Please go back and select at least one condition to get personalized recommendations.
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

      {/* Header */}
      <section className="relative pt-24 pb-12 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <img src={RESULTS_BG} alt="" className="w-full h-full object-cover" />
        </div>
        <div className="relative z-10 container max-w-5xl mx-auto px-4">
          <motion.button
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            New Assessment
          </motion.button>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <h1 className="font-serif text-3xl md:text-5xl font-bold text-foreground mb-4 leading-tight">
              Your Personalized
              <br />
              <span className="text-forest">Yoga Recommendations</span>
            </h1>

            {/* Condition pills */}
            <div className="flex flex-wrap gap-2 mb-4">
              {conditionNames.map((name) => (
                <span
                  key={name}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-sage-light text-forest-dark text-sm font-medium rounded-full"
                >
                  <Leaf className="w-3.5 h-3.5" />
                  {name}
                </span>
              ))}
              {severity && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gold-light text-terracotta text-sm font-medium rounded-full">
                  Severity: {severity.charAt(0).toUpperCase() + severity.slice(1)}
                </span>
              )}
            </div>

            {/* Stats + Start Session */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 mt-2">
              <div className="flex items-center gap-6 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-forest" />
                  {results.recommended.length} Recommended
                </span>
                <span className="flex items-center gap-1.5">
                  <X className="w-4 h-4 text-rose" />
                  {results.contraindicated.length} To Avoid
                </span>
              </div>
              {results.recommended.length > 0 && (
                <button
                  onClick={() => navigate(`/session?${search}`)}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-forest text-cream rounded-full font-semibold hover:bg-forest-light transition-colors shadow-lg"
                >
                  <Play className="w-5 h-5" />
                  Start Session
                  <Timer className="w-4 h-4 opacity-60" />
                </button>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Disclaimer */}
      <div className="container max-w-5xl mx-auto px-4 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gold-light/40 border border-gold/30 rounded-2xl p-4 flex items-start gap-3"
        >
          <AlertTriangle className="w-5 h-5 text-terracotta shrink-0 mt-0.5" />
          <p className="text-sm text-foreground/80">
            <strong>Important:</strong> These recommendations are for informational purposes only.
            Always consult a healthcare professional before starting any yoga practice, especially
            if you have existing health conditions.
          </p>
        </motion.div>
      </div>

      {/* Tabs */}
      <div className="container max-w-5xl mx-auto px-4 mb-8">
        <div className="flex gap-1 bg-cream-dark/50 rounded-2xl p-1.5">
          {[
            { id: "recommended" as const, label: "Your Practice", icon: Check, count: results.recommended.length },
            { id: "avoid" as const, label: "Proceed with Caution", icon: AlertTriangle, count: results.contraindicated.length },
            { id: "safety" as const, label: "Safety Notes", icon: Shield, count: results.specialNotes.length + results.severityGuidance.length },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span className="hidden sm:inline">{tab.label}</span>
              <span className="text-xs bg-border/60 px-2 py-0.5 rounded-full">{tab.count}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="container max-w-5xl mx-auto px-4 pb-24">
        <AnimatePresence mode="wait">
          {activeTab === "recommended" && (
            <motion.div
              key="recommended"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              {results.recommended.length === 0 ? (
                <EmptyState
                  title="No Specific Recommendations"
                  desc="Based on your conditions, we don't have specific asana recommendations. Please consult a yoga therapist for personalized guidance."
                />
              ) : (
                <div className="grid md:grid-cols-2 gap-4">
                  {results.recommended.map((rec, i) => (
                    <AsanaCard
                      key={rec.asana.id}
                      rec={rec}
                      index={i}
                      type="recommended"
                      expanded={expandedAsana === rec.asana.id}
                      onToggle={() =>
                        setExpandedAsana(
                          expandedAsana === rec.asana.id ? null : rec.asana.id
                        )
                      }
                    />
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {activeTab === "avoid" && (
            <motion.div
              key="avoid"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              {results.contraindicated.length === 0 ? (
                <EmptyState
                  title="No Specific Contraindications"
                  desc="Based on your conditions, there are no specific asanas to avoid. However, always listen to your body and stop if you feel pain."
                />
              ) : (
                <div className="grid md:grid-cols-2 gap-4">
                  {results.contraindicated.map((rec, i) => (
                    <AsanaCard
                      key={rec.asana.id}
                      rec={rec}
                      index={i}
                      type="contraindicated"
                      expanded={expandedAsana === rec.asana.id}
                      onToggle={() =>
                        setExpandedAsana(
                          expandedAsana === rec.asana.id ? null : rec.asana.id
                        )
                      }
                    />
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {activeTab === "safety" && (
            <motion.div
              key="safety"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              {/* Severity guidance */}
              {results.severityGuidance.length > 0 && (
                <div className="bg-gold-light/30 border border-gold/20 rounded-2xl p-6">
                  <h3 className="font-serif text-xl font-semibold mb-4 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-terracotta" />
                    Severity-Specific Guidance
                  </h3>
                  <div className="space-y-3">
                    {results.severityGuidance.map((note, i) => (
                      <div key={i} className="text-sm text-foreground/80 leading-relaxed">
                        <FormattedText text={note} />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Special notes */}
              {results.specialNotes.length > 0 && (
                <div className="bg-sage-light/30 border border-sage/20 rounded-2xl p-6">
                  <h3 className="font-serif text-xl font-semibold mb-4 flex items-center gap-2">
                    <Info className="w-5 h-5 text-forest" />
                    Condition-Specific Notes
                  </h3>
                  <div className="space-y-3">
                    {results.specialNotes.map((note, i) => (
                      <div key={i} className="text-sm text-foreground/80 leading-relaxed">
                        <FormattedText text={note} />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* General safety */}
              <div className="bg-card border border-border rounded-2xl p-6">
                <h3 className="font-serif text-xl font-semibold mb-4 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-forest" />
                  General Safety Guidelines
                </h3>
                <ul className="space-y-2">
                  {results.safetyNotes.map((note, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-foreground/80">
                      <Check className="w-4 h-4 text-forest shrink-0 mt-0.5" />
                      {note}
                    </li>
                  ))}
                </ul>
              </div>

              {/* When to stop */}
              <div className="bg-rose-light/20 border border-rose/20 rounded-2xl p-6">
                <h3 className="font-serif text-xl font-semibold mb-4 flex items-center gap-2 text-rose">
                  <X className="w-5 h-5" />
                  When to Stop Immediately
                </h3>
                <ul className="space-y-2">
                  {getSafetyRules().when_to_stop.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-foreground/80">
                      <AlertTriangle className="w-4 h-4 text-rose shrink-0 mt-0.5" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Action buttons */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-3"
        >
          {results.recommended.length > 0 && (
            <button
              onClick={() => navigate(`/session?${search}`)}
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-forest text-cream rounded-full font-semibold hover:bg-forest-light transition-colors shadow-lg"
            >
              <Play className="w-5 h-5" />
              Start Session
              <Timer className="w-4 h-4 opacity-60" />
            </button>
          )}
          <button
            onClick={() => navigate("/")}
            className="inline-flex items-center gap-2 px-6 py-3 bg-cream-dark text-foreground rounded-full font-medium hover:bg-border transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Start New Assessment
          </button>
        </motion.div>
      </div>
    </div>
  );
}

function AsanaCard({
  rec,
  index,
  type,
  expanded,
  onToggle,
}: {
  rec: AsanaRecommendation;
  index: number;
  type: "recommended" | "contraindicated";
  expanded: boolean;
  onToggle: () => void;
}) {
  const { asana, reasons, conditions } = rec;
  const isRec = type === "recommended";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      className={`rounded-2xl border-2 overflow-hidden transition-all ${
        isRec
          ? "bg-card border-sage/20 hover:border-forest/30"
          : "bg-card border-rose-light/30 hover:border-rose/40"
      }`}
    >
      <button
        onClick={onToggle}
        className="w-full text-left p-5"
      >
        <div className="flex items-start gap-4">
          {/* Asana image */}
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
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span
                className={`w-2 h-2 rounded-full ${
                  isRec ? "bg-forest" : "bg-rose"
                }`}
              />
              <span className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                {asana.sanskrit_name}
              </span>
            </div>
            <h3 className="font-serif text-lg font-semibold text-foreground">
              {asana.english_name}
            </h3>
            <div className="flex items-center gap-2 mt-2">
              <span
                className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                  difficultyColors[asana.difficulty]
                }`}
              >
                {asana.difficulty}
              </span>
              <span className="text-xs text-muted-foreground">
                {asana.type.replace(/_/g, " ")}
              </span>
            </div>
          </div>
          <div className="shrink-0 mt-1">
            {expanded ? (
              <ChevronUp className="w-5 h-5 text-muted-foreground" />
            ) : (
              <ChevronDown className="w-5 h-5 text-muted-foreground" />
            )}
          </div>
        </div>

        {/* Condition tags */}
        <div className="flex flex-wrap gap-1.5 mt-3">
          {conditions.map((c) => (
            <span
              key={c}
              className={`text-xs px-2 py-0.5 rounded-full ${
                isRec
                  ? "bg-sage-light/60 text-forest-dark"
                  : "bg-rose-light/40 text-rose"
              }`}
            >
              {c}
            </span>
          ))}
        </div>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 space-y-4 border-t border-border/50 pt-4">
              {/* Description */}
              <div>
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                  How to Do It
                </h4>
                <p className="text-sm text-foreground/80 leading-relaxed">
                  {asana.description}
                </p>
              </div>

              {/* Benefits */}
              {isRec && asana.benefits.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                    Benefits
                  </h4>
                  <ul className="space-y-1">
                    {asana.benefits.map((b, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-foreground/80">
                        <Star className="w-3.5 h-3.5 text-gold shrink-0 mt-0.5" />
                        {b}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Why recommended/contraindicated */}
              <div>
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                  {isRec ? "Why Recommended" : "Why to Avoid"}
                </h4>
                {reasons.map((r, i) => (
                  <p key={i} className="text-sm text-foreground/80 leading-relaxed">
                    {r}
                  </p>
                ))}
              </div>

              {/* Precautions */}
              {asana.precautions && (
                <div>
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                    Precautions
                  </h4>
                  <p className="text-sm text-foreground/80">{asana.precautions}</p>
                </div>
              )}

              {/* Modifications */}
              {isRec && asana.modifications && (
                <div>
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                    Modifications
                  </h4>
                  <p className="text-sm text-foreground/80">{asana.modifications}</p>
                </div>
              )}

              {/* Target areas */}
              <div className="flex flex-wrap gap-1.5">
                {asana.target_areas.map((area) => (
                  <span
                    key={area}
                    className="text-xs px-2 py-0.5 bg-cream-dark rounded-full text-muted-foreground"
                  >
                    {area.replace(/_/g, " ")}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function EmptyState({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="text-center py-16">
      <div className="w-16 h-16 rounded-full bg-sage-light flex items-center justify-center mx-auto mb-4">
        <Leaf className="w-8 h-8 text-forest" />
      </div>
      <h3 className="font-serif text-xl font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground max-w-md mx-auto">{desc}</p>
    </div>
  );
}

function FormattedText({ text }: { text: string }) {
  // Simple bold text rendering for **text** patterns
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return (
            <strong key={i} className="font-semibold text-foreground">
              {part.slice(2, -2)}
            </strong>
          );
        }
        return <span key={i}>{part}</span>;
      })}
    </>
  );
}
