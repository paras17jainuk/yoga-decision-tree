/*
 * Design: Earth & Breath — Organic Modernism
 * Explore: Browse all 71+ asanas with filtering and search
 */
import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  Star,
  AlertTriangle,
  Leaf,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import { getAllAsanas } from "@/data/engine";
import { asanaImages } from "@/data/asanaImages";
import type { Asana } from "@/data/types";

const GENTLE_IMG = "https://d2xsxph8kpxj0f.cloudfront.net/310519663318567070/87xTRNw69cyUtrfeqdS85m/yoga-gentle-ekPcTrvJzCpwpzFotXwp7G.webp";

const difficultyColors: Record<string, string> = {
  beginner: "bg-sage-light text-forest-dark",
  intermediate: "bg-gold-light text-terracotta",
  advanced: "bg-rose-light text-rose",
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
  backbend: "Backbend",
  pranayama: "Breathing Exercise",
  exercise: "Exercise",
};

export default function Explore() {
  const allAsanas = useMemo(() => getAllAsanas(), []);
  const [searchQuery, setSearchQuery] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [expandedAsana, setExpandedAsana] = useState<string | null>(null);

  const types = useMemo(() => {
    const set = new Set(allAsanas.map((a) => a.type));
    return Array.from(set).sort();
  }, [allAsanas]);

  const filtered = useMemo(() => {
    return allAsanas.filter((a) => {
      const matchesSearch =
        searchQuery === "" ||
        a.english_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.sanskrit_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.target_areas.some((t) =>
          t.toLowerCase().includes(searchQuery.toLowerCase())
        );
      const matchesDifficulty =
        difficultyFilter === "all" || a.difficulty === difficultyFilter;
      const matchesType = typeFilter === "all" || a.type === typeFilter;
      return matchesSearch && matchesDifficulty && matchesType;
    });
  }, [allAsanas, searchQuery, difficultyFilter, typeFilter]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Header */}
      <section className="relative pt-24 pb-12 overflow-hidden">
        <div className="absolute inset-0 opacity-8">
          <img src={GENTLE_IMG} alt="" className="w-full h-full object-cover" />
        </div>
        <div className="absolute inset-0 bg-background/95" />
        <div className="relative z-10 container max-w-5xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-full bg-sage-light flex items-center justify-center">
                <Leaf className="w-4 h-4 text-forest" />
              </div>
              <span className="text-sm font-medium text-forest uppercase tracking-wide">
                Asana Library
              </span>
            </div>
            <h1 className="font-serif text-3xl md:text-5xl font-bold text-foreground mb-3">
              Explore All Asanas
            </h1>
            <p className="text-muted-foreground text-lg max-w-xl">
              Browse our complete database of {allAsanas.length} yoga poses with detailed
              instructions, benefits, and safety information.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Filters */}
      <div className="container max-w-5xl mx-auto px-4 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-col sm:flex-row gap-3"
        >
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by name, Sanskrit name, or target area..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-card border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-forest/30 focus:border-forest/50 transition-all"
            />
          </div>

          {/* Difficulty filter */}
          <div className="relative">
            <Filter className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <select
              value={difficultyFilter}
              onChange={(e) => setDifficultyFilter(e.target.value)}
              className="pl-10 pr-8 py-3 bg-card border border-border rounded-xl text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-forest/30 focus:border-forest/50 transition-all"
            >
              <option value="all">All Levels</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>

          {/* Type filter */}
          <div className="relative">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="pl-4 pr-8 py-3 bg-card border border-border rounded-xl text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-forest/30 focus:border-forest/50 transition-all"
            >
              <option value="all">All Types</option>
              {types.map((t) => (
                <option key={t} value={t}>
                  {typeLabels[t] || t.replace(/_/g, " ")}
                </option>
              ))}
            </select>
          </div>
        </motion.div>

        <p className="text-sm text-muted-foreground mt-3">
          Showing {filtered.length} of {allAsanas.length} asanas
        </p>
      </div>

      {/* Asana grid */}
      <div className="container max-w-5xl mx-auto px-4 pb-24">
        <div className="space-y-3">
          {filtered.map((asana, i) => (
            <ExploreAsanaCard
              key={asana.id}
              asana={asana}
              index={i}
              expanded={expandedAsana === asana.id}
              onToggle={() =>
                setExpandedAsana(expandedAsana === asana.id ? null : asana.id)
              }
            />
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16">
            <Search className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="font-serif text-xl font-semibold mb-2">No Asanas Found</h3>
            <p className="text-muted-foreground">
              Try adjusting your search or filters.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function ExploreAsanaCard({
  asana,
  index,
  expanded,
  onToggle,
}: {
  asana: Asana;
  index: number;
  expanded: boolean;
  onToggle: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.03, 0.5) }}
      className="bg-card border border-border rounded-2xl overflow-hidden hover:border-forest/20 transition-all"
    >
      <button onClick={onToggle} className="w-full text-left p-5">
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
              <span className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                {asana.sanskrit_name}
              </span>
              <span
                className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                  difficultyColors[asana.difficulty]
                }`}
              >
                {asana.difficulty}
              </span>
            </div>
            <h3 className="font-serif text-lg font-semibold text-foreground">
              {asana.english_name}
            </h3>
            <div className="flex flex-wrap gap-1.5 mt-2">
              <span className="text-xs px-2 py-0.5 bg-cream-dark rounded-full text-muted-foreground">
                {typeLabels[asana.type] || asana.type.replace(/_/g, " ")}
              </span>
              {asana.target_areas.slice(0, 3).map((area) => (
                <span
                  key={area}
                  className="text-xs px-2 py-0.5 bg-sage-light/40 rounded-full text-forest-dark"
                >
                  {area.replace(/_/g, " ")}
                </span>
              ))}
              {asana.target_areas.length > 3 && (
                <span className="text-xs px-2 py-0.5 bg-sage-light/40 rounded-full text-forest-dark">
                  +{asana.target_areas.length - 3}
                </span>
              )}
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
              <div>
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                  How to Do It
                </h4>
                <p className="text-sm text-foreground/80 leading-relaxed">
                  {asana.description}
                </p>
              </div>

              {asana.benefits.length > 0 && (
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

              {asana.general_contraindications.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                    General Contraindications
                  </h4>
                  <ul className="space-y-1">
                    {asana.general_contraindications.map((c, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-foreground/80">
                        <AlertTriangle className="w-3.5 h-3.5 text-rose shrink-0 mt-0.5" />
                        {c.replace(/_/g, " ")}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {asana.precautions && (
                <div>
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                    Precautions
                  </h4>
                  <p className="text-sm text-foreground/80">{asana.precautions}</p>
                </div>
              )}

              {asana.modifications && (
                <div>
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                    Modifications
                  </h4>
                  <p className="text-sm text-foreground/80">{asana.modifications}</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
