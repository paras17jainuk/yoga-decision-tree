import yogaDB from "./yogaDatabase.json";
import type {
  YogaDatabase,
  Asana,
  Condition,
  Severity,
  RecommendationResult,
  AsanaRecommendation,
} from "./types";

const db = yogaDB as YogaDatabase;

export function getDatabase(): YogaDatabase {
  return db;
}

export function getConditionById(id: string): Condition | undefined {
  return db.conditions.find((c) => c.id === id);
}

export function getAsanaById(id: string): Asana | undefined {
  return db.asanas.find((a) => a.id === id);
}

export function getDecisionNode(nodeId: string) {
  return db.decision_tree[nodeId];
}

export function getCategoryById(id: string) {
  return db.categories.find((c) => c.id === id);
}

export function generateRecommendations(
  selectedConditions: string[],
  severity: Severity | null
): RecommendationResult {
  const recommendedMap = new Map<string, { reasons: string[]; conditions: string[] }>();
  const contraindicatedMap = new Map<string, { reasons: string[]; conditions: string[] }>();
  const safetyNotes: string[] = [];
  const severityGuidance: string[] = [];
  const specialNotes: string[] = [];

  for (const condId of selectedConditions) {
    const condition = getConditionById(condId);
    if (!condition) continue;

    // Collect recommended asanas
    for (const asanaId of condition.recommended_asanas) {
      const existing = recommendedMap.get(asanaId);
      if (existing) {
        if (!existing.reasons.includes(condition.recommended_reason)) {
          existing.reasons.push(condition.recommended_reason);
        }
        existing.conditions.push(condition.name);
      } else {
        recommendedMap.set(asanaId, {
          reasons: [condition.recommended_reason],
          conditions: [condition.name],
        });
      }
    }

    // Collect contraindicated asanas
    for (const asanaId of condition.contraindicated_asanas) {
      const existing = contraindicatedMap.get(asanaId);
      if (existing) {
        if (!existing.reasons.includes(condition.contraindicated_reason)) {
          existing.reasons.push(condition.contraindicated_reason);
        }
        existing.conditions.push(condition.name);
      } else {
        contraindicatedMap.set(asanaId, {
          reasons: [condition.contraindicated_reason],
          conditions: [condition.name],
        });
      }
    }

    // Collect special notes
    if (condition.special_notes) {
      specialNotes.push(`**${condition.name}:** ${condition.special_notes}`);
    }

    // Collect severity guidance
    if (severity && condition.severity_levels) {
      const guidance = condition.severity_levels[severity];
      if (guidance) {
        severityGuidance.push(`**${condition.name} (${severity}):** ${guidance}`);
      }
    }
  }

  // Remove any asana that is contraindicated from the recommended list
  Array.from(contraindicatedMap.keys()).forEach((contraindicatedId) => {
    recommendedMap.delete(contraindicatedId);
  });

  // Build recommended list
  const recommended: AsanaRecommendation[] = [];
  Array.from(recommendedMap.entries()).forEach(([asanaId, data]) => {
    const asana = getAsanaById(asanaId);
    if (asana) {
      recommended.push({ asana, reasons: data.reasons, conditions: data.conditions });
    }
  });

  // Build contraindicated list
  const contraindicated: AsanaRecommendation[] = [];
  Array.from(contraindicatedMap.entries()).forEach(([asanaId, data]) => {
    const asana = getAsanaById(asanaId);
    if (asana) {
      contraindicated.push({ asana, reasons: data.reasons, conditions: data.conditions });
    }
  });

  // Sort by number of conditions (most relevant first)
  recommended.sort((a, b) => b.conditions.length - a.conditions.length);
  contraindicated.sort((a, b) => b.conditions.length - a.conditions.length);

  // Add general safety notes
  safetyNotes.push(...db.safety_rules.general_guidelines);

  return {
    recommended,
    contraindicated,
    safetyNotes,
    severityGuidance,
    specialNotes,
  };
}

export function getAllAsanas(): Asana[] {
  return db.asanas;
}

export function getAllConditions(): Condition[] {
  return db.conditions;
}

export function getAllCategories() {
  return db.categories;
}

export function getSafetyRules() {
  return db.safety_rules;
}
