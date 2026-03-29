import type { DrugInfo } from "../services/drugInfoService";
import type { HealthRecord, Medicine } from "../lib/supabase";

export type RiskLevel = "safe" | "caution" | "dangerous";

export interface RiskAnalysis {
  overallRisk: RiskLevel;
  allergyRisks: RiskItem[];
  conditionRisks: RiskItem[];
  interactionRisks: RiskItem[];
  warnings: string[];
}

export interface RiskItem {
  level: RiskLevel;
  title: string;
  description: string;
  matchedItem: string;
}

// Common allergy mappings (simplified for demo)
const allergyMappings: Record<string, string[]> = {
  aspirin: ["aspirin", "nsaid", "salicylate", "ibuprofen"],
  penicillin: ["penicillin", "amoxicillin", "ampicillin"],
  sulfa: ["sulfonamide", "sulfamethoxazole", "sulfasalazine"],
  nsaid: ["ibuprofen", "aspirin", "naproxen", "diclofenac"],
  lactose: [], // Not typically a drug allergy
  gluten: [], // Not typically a drug allergy
};

// Condition contraindication mappings
const conditionContraindications: Record<string, string[]> = {
  asthma: ["aspirin", "ibuprofen", "nsaid"],
  diabetes: [], // Many drugs need dose adjustments
  "heart disease": ["ibuprofen", "nsaid"],
  "kidney disease": ["ibuprofen", "nsaid", "metformin"],
  "liver disease": ["paracetamol", "atorvastatin", "metformin"],
  hypertension: [], // Many drugs interact
  "stomach ulcer": ["aspirin", "ibuprofen", "nsaid"],
  pregnancy: ["lisinopril", "atorvastatin", "metformin", "aspirin"],
  "bleeding disorder": ["aspirin", "ibuprofen", "warfarin"],
};

function normalizeString(str: string): string {
  return str.toLowerCase().trim();
}

function checkAllergyMatch(allergy: string, drugName: string, drugInfo: DrugInfo): boolean {
  const normalizedAllergy = normalizeString(allergy);
  const normalizedDrugName = normalizeString(drugName);
  const normalizedGenericName = normalizeString(drugInfo.genericName);

  // Direct match
  if (
    normalizedDrugName.includes(normalizedAllergy) ||
    normalizedGenericName.includes(normalizedAllergy) ||
    normalizedAllergy.includes(normalizedDrugName)
  ) {
    return true;
  }

  // Check allergy class mappings
  for (const [allergyClass, relatedDrugs] of Object.entries(allergyMappings)) {
    if (normalizedAllergy.includes(allergyClass)) {
      for (const drug of relatedDrugs) {
        if (
          normalizedDrugName.includes(drug) ||
          normalizedGenericName.includes(drug)
        ) {
          return true;
        }
      }
    }
  }

  // Check drug's contraindications for allergy mentions
  for (const contraindication of drugInfo.contraindications) {
    if (normalizeString(contraindication).includes("allergy") && 
        normalizeString(contraindication).includes(normalizedAllergy)) {
      return true;
    }
  }

  return false;
}

function checkConditionContraindication(
  condition: string,
  drugName: string,
  drugInfo: DrugInfo
): { isContraindicated: boolean; severity: RiskLevel } {
  const normalizedCondition = normalizeString(condition);
  const normalizedDrugName = normalizeString(drugName);

  // Check condition contraindication mappings
  for (const [conditionKey, contraindicatedDrugs] of Object.entries(conditionContraindications)) {
    if (normalizedCondition.includes(conditionKey)) {
      for (const drug of contraindicatedDrugs) {
        if (normalizedDrugName.includes(drug)) {
          return { isContraindicated: true, severity: "dangerous" };
        }
      }
    }
  }

  // Check drug's contraindications
  for (const contraindication of drugInfo.contraindications) {
    if (normalizeString(contraindication).includes(normalizedCondition)) {
      return { isContraindicated: true, severity: "dangerous" };
    }
  }

  // Check drug's warnings
  for (const warning of drugInfo.warnings) {
    if (normalizeString(warning).includes(normalizedCondition)) {
      return { isContraindicated: true, severity: "caution" };
    }
  }

  return { isContraindicated: false, severity: "safe" };
}

function checkDrugInteraction(
  currentMedicine: string,
  drugInfo: DrugInfo
): { hasInteraction: boolean; severity: RiskLevel } {
  const normalizedMedicine = normalizeString(currentMedicine);

  for (const interaction of drugInfo.interactions) {
    if (
      normalizedMedicine.includes(normalizeString(interaction)) ||
      normalizeString(interaction).includes(normalizedMedicine)
    ) {
      return { hasInteraction: true, severity: "caution" };
    }
  }

  return { hasInteraction: false, severity: "safe" };
}

export function analyzeRisks(
  drugInfo: DrugInfo,
  healthRecord: HealthRecord | null,
  currentMedicines: Medicine[]
): RiskAnalysis {
  const allergyRisks: RiskItem[] = [];
  const conditionRisks: RiskItem[] = [];
  const interactionRisks: RiskItem[] = [];
  const warnings: string[] = [...drugInfo.warnings];

  // Check allergies
  if (healthRecord?.allergies) {
    for (const allergy of healthRecord.allergies) {
      if (checkAllergyMatch(allergy, drugInfo.name, drugInfo)) {
        allergyRisks.push({
          level: "dangerous",
          title: "Allergy Alert",
          description: `You have a recorded allergy to "${allergy}" which may be related to ${drugInfo.name}.`,
          matchedItem: allergy,
        });
      }
    }
  }

  // Check existing conditions
  if (healthRecord?.existing_conditions) {
    for (const condition of healthRecord.existing_conditions) {
      const result = checkConditionContraindication(condition, drugInfo.name, drugInfo);
      if (result.isContraindicated) {
        conditionRisks.push({
          level: result.severity,
          title: "Condition Conflict",
          description: `${drugInfo.name} may not be suitable for people with ${condition}.`,
          matchedItem: condition,
        });
      }
    }
  }

  // Check drug interactions with current medicines
  for (const medicine of currentMedicines) {
    const result = checkDrugInteraction(medicine.name, drugInfo);
    if (result.hasInteraction) {
      interactionRisks.push({
        level: result.severity,
        title: "Drug Interaction",
        description: `${drugInfo.name} may interact with ${medicine.name} that you are currently taking.`,
        matchedItem: medicine.name,
      });
    }
  }

  // Add interactions from drugInfo as warnings
  if (drugInfo.interactions.length > 0) {
    warnings.push(
      `Known interactions: ${drugInfo.interactions.slice(0, 5).join(", ")}${drugInfo.interactions.length > 5 ? "..." : ""}`
    );
  }

  // Determine overall risk level
  let overallRisk: RiskLevel = "safe";

  if (allergyRisks.some((r) => r.level === "dangerous") || conditionRisks.some((r) => r.level === "dangerous")) {
    overallRisk = "dangerous";
  } else if (
    allergyRisks.length > 0 ||
    conditionRisks.some((r) => r.level === "caution") ||
    interactionRisks.length > 0
  ) {
    overallRisk = "caution";
  }

  return {
    overallRisk,
    allergyRisks,
    conditionRisks,
    interactionRisks,
    warnings,
  };
}

export function getRiskColor(level: RiskLevel): {
  bg: string;
  text: string;
  border: string;
  icon: string;
} {
  switch (level) {
    case "dangerous":
      return {
        bg: "bg-red-50",
        text: "text-red-700",
        border: "border-red-200",
        icon: "text-red-500",
      };
    case "caution":
      return {
        bg: "bg-amber-50",
        text: "text-amber-700",
        border: "border-amber-200",
        icon: "text-amber-500",
      };
    case "safe":
    default:
      return {
        bg: "bg-emerald-50",
        text: "text-emerald-700",
        border: "border-emerald-200",
        icon: "text-emerald-500",
      };
  }
}
