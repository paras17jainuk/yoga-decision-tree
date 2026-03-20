/**
 * Design: Earth & Breath — Organic Modernism
 * AsanaDetail: Individual asana page with large image, full description,
 * benefits, contraindications, modifications, and related conditions.
 */
import { useMemo } from "react";
import { motion } from "framer-motion";
import { useParams, Link } from "wouter";
import {
  ArrowLeft,
  Star,
  AlertTriangle,
  Leaf,
  Shield,
  Target,
  Wrench,
  Info,
  ChevronRight,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import { getAllAsanas, getDatabase } from "@/data/engine";
import { asanaImages } from "@/data/asanaImages";
import type { Asana, Condition } from "@/data/types";

const difficultyColors: Record<string, string> = {
  beginner: "bg-sage-light text-forest-dark",
  intermediate: "bg-gold-light text-terracotta",
  advanced: "bg-rose-light text-rose",
};

const difficultyDescriptions: Record<string, string> = {
  beginner: "Suitable for those new to yoga. Focus on proper alignment and breathing.",
  intermediate: "Requires some yoga experience. Build up gradually and listen to your body.",
  advanced: "For experienced practitioners. Ensure you have mastered prerequisite poses.",
};

const typeLabels: Record<string, string> = {
  kneeling: "Kneeling",
  inversion_mild: "Mild Inversion",
  standing_forward_bend: "Standing Forward Bend",
  standing: "Standing",
  standing_balance: "Standing Balance",
  prone_backbend: "Prone Backbend",
  supine_backbend: "Supine Backbend",
  supine_restorative: "Supine / Restorative",
  supine: "Supine",
  inversion_restorative: "Restorative Inversion",
  inversion: "Inversion",
  seated: "Seated",
  seated_forward_bend: "Seated Forward Bend",
  seated_twist: "Seated Twist",
  arm_balance: "Arm Balance",
  arm_support: "Arm Support",
  backbend: "Backbend",
  pranayama: "Breathing Exercise",
  exercise: "Exercise",
  standing_twist: "Standing Twist",
  supine_twist: "Supine Twist",
  kneeling_forward_bend: "Kneeling Forward Bend",
  kneeling_backbend: "Kneeling Backbend",
  hip_opener: "Hip Opener",
  sequence: "Flow / Sequence",
};

export default function AsanaDetail() {
  const { id } = useParams<{ id: string }>();

  const { asana, relatedConditions } = useMemo(() => {
    const allAsanas = getAllAsanas();
    const db = getDatabase();
    const found = allAsanas.find((a) => a.id === id);

    // Find conditions that recommend or contraindicate this asana
    const related: { condition: Condition; type: "recommended" | "contraindicated" }[] = [];
    if (found && db) {
      for (const cond of db.conditions) {
        if (cond.recommended_asanas.includes(found.id)) {
          related.push({ condition: cond, type: "recommended" });
        }
        if (cond.contraindicated_asanas.includes(found.id)) {
          related.push({ condition: cond, type: "contraindicated" });
        }
      }
    }

    return { asana: found, relatedConditions: related };
  }, [id]);

  if (!asana) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-24 container max-w-4xl mx-auto px-4 text-center">
          <h1 className="font-serif text-3xl font-bold mb-4">Asana Not Found</h1>
          <p className="text-muted-foreground mb-6">
            The asana you're looking for doesn't exist in our database.
          </p>
          <Link
            href="/explore"
            className="inline-flex items-center gap-2 text-forest hover:text-forest-dark transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Explore
          </Link>
        </div>
      </div>
    );
  }

  const recommendedFor = relatedConditions.filter((r) => r.type === "recommended");
  const contraindicatedFor = relatedConditions.filter((r) => r.type === "contraindicated");

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Back button */}
      <div className="pt-20 container max-w-4xl mx-auto px-4">
        <Link
          href="/explore"
          className="inline-flex items-center gap-2 text-forest hover:text-forest-dark transition-colors text-sm font-medium py-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to All Asanas
        </Link>
      </div>

      {/* Hero section with image */}
      <section className="container max-w-4xl mx-auto px-4 pt-4 pb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row gap-8 items-start"
        >
          {/* Large image */}
          <div className="w-full md:w-80 shrink-0">
            <div className="aspect-square rounded-2xl overflow-hidden bg-white border border-border/50 flex items-center justify-center shadow-sm">
              {asanaImages[asana.id] ? (
                <img
                  src={asanaImages[asana.id]}
                  alt={asana.english_name}
                  className="w-full h-full object-contain p-6"
                />
              ) : (
                <div className="flex flex-col items-center gap-2 text-muted-foreground/30">
                  <Leaf className="w-16 h-16" />
                  <span className="text-sm">No image available</span>
                </div>
              )}
            </div>
          </div>

          {/* Title and meta */}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm text-muted-foreground font-medium uppercase tracking-wide">
                {asana.sanskrit_name}
              </span>
            </div>
            <h1 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-3">
              {asana.english_name}
            </h1>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-4">
              <span
                className={`text-xs px-3 py-1 rounded-full font-semibold ${difficultyColors[asana.difficulty]}`}
              >
                {asana.difficulty.charAt(0).toUpperCase() + asana.difficulty.slice(1)}
              </span>
              <span className="text-xs px-3 py-1 bg-cream-dark rounded-full text-muted-foreground font-medium">
                {typeLabels[asana.type] || asana.type.replace(/_/g, " ")}
              </span>
            </div>

            {/* Difficulty note */}
            <div className="bg-card border border-border rounded-xl p-4 mb-4">
              <div className="flex items-start gap-2">
                <Info className="w-4 h-4 text-forest shrink-0 mt-0.5" />
                <p className="text-sm text-foreground/80">
                  {difficultyDescriptions[asana.difficulty]}
                </p>
              </div>
            </div>

            {/* Target areas */}
            <div className="mb-4">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5" />
                Target Areas
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {asana.target_areas.map((area) => (
                  <span
                    key={area}
                    className="text-xs px-2.5 py-1 bg-sage-light/50 rounded-full text-forest-dark font-medium"
                  >
                    {area.replace(/_/g, " ")}
                  </span>
                ))}
              </div>
            </div>

            {/* Description */}
            <div>
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                How to Perform
              </h3>
              <p className="text-sm text-foreground/80 leading-relaxed">
                {asana.description}
              </p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Detailed sections */}
      <section className="container max-w-4xl mx-auto px-4 pb-24">
        <div className="grid md:grid-cols-2 gap-6">
          {/* Benefits */}
          {asana.benefits.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-card border border-border rounded-2xl p-6"
            >
              <h3 className="font-serif text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-sage-light flex items-center justify-center">
                  <Star className="w-4 h-4 text-forest" />
                </div>
                Benefits
              </h3>
              <ul className="space-y-2.5">
                {asana.benefits.map((b, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm text-foreground/80">
                    <Star className="w-3.5 h-3.5 text-gold shrink-0 mt-0.5" />
                    {b}
                  </li>
                ))}
              </ul>
            </motion.div>
          )}

          {/* Contraindications */}
          {asana.general_contraindications.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="bg-card border border-border rounded-2xl p-6"
            >
              <h3 className="font-serif text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-rose-light flex items-center justify-center">
                  <AlertTriangle className="w-4 h-4 text-rose" />
                </div>
                Contraindications
              </h3>
              <ul className="space-y-2.5">
                {asana.general_contraindications.map((c, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm text-foreground/80">
                    <AlertTriangle className="w-3.5 h-3.5 text-rose shrink-0 mt-0.5" />
                    {c.replace(/_/g, " ")}
                  </li>
                ))}
              </ul>
            </motion.div>
          )}

          {/* Precautions */}
          {asana.precautions && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-card border border-border rounded-2xl p-6"
            >
              <h3 className="font-serif text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gold-light flex items-center justify-center">
                  <Shield className="w-4 h-4 text-terracotta" />
                </div>
                Precautions
              </h3>
              <p className="text-sm text-foreground/80 leading-relaxed">
                {asana.precautions}
              </p>
            </motion.div>
          )}

          {/* Modifications */}
          {asana.modifications && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="bg-card border border-border rounded-2xl p-6"
            >
              <h3 className="font-serif text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-sage-light flex items-center justify-center">
                  <Wrench className="w-4 h-4 text-forest" />
                </div>
                Modifications
              </h3>
              <p className="text-sm text-foreground/80 leading-relaxed">
                {asana.modifications}
              </p>
            </motion.div>
          )}
        </div>

        {/* Related conditions */}
        {(recommendedFor.length > 0 || contraindicatedFor.length > 0) && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-8"
          >
            <h2 className="font-serif text-2xl font-bold text-foreground mb-6">
              Related Conditions
            </h2>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Recommended for */}
              {recommendedFor.length > 0 && (
                <div className="bg-card border border-border rounded-2xl p-6">
                  <h3 className="font-serif text-lg font-semibold text-forest mb-4 flex items-center gap-2">
                    <Leaf className="w-5 h-5" />
                    Recommended For
                  </h3>
                  <ul className="space-y-2">
                    {recommendedFor.map(({ condition }) => (
                      <li
                        key={condition.id}
                        className="flex items-start gap-2 text-sm text-foreground/80"
                      >
                        <ChevronRight className="w-3.5 h-3.5 text-forest shrink-0 mt-0.5" />
                        <span>
                          <strong className="text-foreground">{condition.name}</strong>
                          {condition.recommended_reason && (
                            <span className="text-muted-foreground"> — {condition.recommended_reason}</span>
                          )}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Contraindicated for */}
              {contraindicatedFor.length > 0 && (
                <div className="bg-card border border-border rounded-2xl p-6">
                  <h3 className="font-serif text-lg font-semibold text-rose mb-4 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5" />
                    Avoid If You Have
                  </h3>
                  <ul className="space-y-2">
                    {contraindicatedFor.map(({ condition }) => (
                      <li
                        key={condition.id}
                        className="flex items-start gap-2 text-sm text-foreground/80"
                      >
                        <ChevronRight className="w-3.5 h-3.5 text-rose shrink-0 mt-0.5" />
                        <span>
                          <strong className="text-foreground">{condition.name}</strong>
                          {condition.contraindicated_reason && (
                            <span className="text-muted-foreground"> — {condition.contraindicated_reason}</span>
                          )}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </section>
    </div>
  );
}
