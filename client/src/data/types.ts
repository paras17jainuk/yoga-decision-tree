export interface YogaDatabase {
  meta: Meta;
  categories: Category[];
  conditions: Condition[];
  asanas: Asana[];
  decision_tree: Record<string, DecisionNode>;
  safety_rules: SafetyRules;
}

export interface Meta {
  version: string;
  title: string;
  description: string;
  disclaimer: string;
  total_asanas: number;
  total_conditions: number;
  total_categories: number;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  description: string;
  conditions: string[];
}

export interface Condition {
  id: string;
  name: string;
  category: string;
  subcategory: string;
  description: string;
  recommended_asanas: string[];
  contraindicated_asanas: string[];
  recommended_reason: string;
  contraindicated_reason: string;
  special_notes: string;
  severity_levels: {
    mild: string;
    moderate: string;
    severe: string;
  };
}

export interface Asana {
  id: string;
  sanskrit_name: string;
  english_name: string;
  description: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  target_areas: string[];
  type: string;
  benefits: string[];
  general_contraindications: string[];
  precautions: string;
  modifications: string;
}

export interface DecisionOption {
  label: string;
  next?: string;
  condition?: string;
  value?: string;
}

export interface DecisionNode {
  question: string;
  type: "single_select" | "multi_select" | "auto" | "info";
  options?: DecisionOption[];
  condition?: string;
  next?: string;
}

export interface SafetyRules {
  general_guidelines: string[];
  when_to_stop: string[];
  common_mistakes: string[];
  age_considerations: Record<string, string>;
  post_surgery_guidelines: Record<string, string>;
  breathing_guidelines: string[];
}

export type Severity = "mild" | "moderate" | "severe";

export interface UserSelections {
  selectedConditions: string[];
  severity: Severity | null;
  currentStep: string;
}

export interface RecommendationResult {
  recommended: AsanaRecommendation[];
  contraindicated: AsanaRecommendation[];
  safetyNotes: string[];
  severityGuidance: string[];
  specialNotes: string[];
}

export interface AsanaRecommendation {
  asana: Asana;
  reasons: string[];
  conditions: string[];
}
