// Mock drug database for hackathon demonstration
// In production, this would connect to a real drug information API

export interface DrugInfo {
  name: string;
  genericName: string;
  usage: string;
  dosage: string;
  precautions: string[];
  sideEffects: string[];
  interactions: string[];
  contraindications: string[];
  warnings: string[];
}

// Mock drug database
const drugDatabase: Record<string, DrugInfo> = {
  paracetamol: {
    name: "Paracetamol",
    genericName: "Acetaminophen",
    usage: "Used to treat mild to moderate pain and reduce fever. Common uses include headaches, muscle aches, arthritis, backache, toothaches, colds, and fevers.",
    dosage: "Adults: 500mg to 1000mg every 4-6 hours. Maximum 4000mg per day.",
    precautions: [
      "Do not exceed recommended dose",
      "Avoid alcohol while taking this medication",
      "Consult doctor if symptoms persist for more than 3 days",
    ],
    sideEffects: ["Nausea", "Stomach pain", "Loss of appetite", "Headache", "Skin rash (rare)"],
    interactions: ["Warfarin", "Alcohol", "Carbamazepine", "Isoniazid"],
    contraindications: ["Severe liver disease", "Alcohol dependence"],
    warnings: ["Liver damage risk with overdose or alcohol use"],
  },
  ibuprofen: {
    name: "Ibuprofen",
    genericName: "Ibuprofen",
    usage: "Non-steroidal anti-inflammatory drug (NSAID) used to reduce fever and treat pain or inflammation caused by many conditions such as headache, toothache, back pain, arthritis, or minor injury.",
    dosage: "Adults: 200mg to 400mg every 4-6 hours. Maximum 1200mg per day without prescription.",
    precautions: [
      "Take with food to reduce stomach upset",
      "Avoid if you have a history of stomach ulcers",
      "Not recommended during late pregnancy",
    ],
    sideEffects: ["Stomach pain", "Heartburn", "Nausea", "Dizziness", "Headache", "Ringing in ears"],
    interactions: ["Aspirin", "Blood thinners", "Lithium", "Methotrexate", "ACE inhibitors"],
    contraindications: ["Active stomach ulcer", "Severe heart failure", "Severe kidney disease", "Late pregnancy", "Aspirin allergy"],
    warnings: ["May increase risk of heart attack or stroke", "Can cause stomach bleeding"],
  },
  aspirin: {
    name: "Aspirin",
    genericName: "Acetylsalicylic Acid",
    usage: "Used to reduce pain, fever, and inflammation. Also used in low doses to prevent blood clots and reduce risk of heart attacks and strokes.",
    dosage: "Pain relief: 300mg to 900mg every 4-6 hours. Maximum 4000mg per day. Heart protection: 75mg to 300mg daily.",
    precautions: [
      "Not for children under 16 years",
      "Avoid if you have bleeding disorders",
      "Take with or after food",
    ],
    sideEffects: ["Stomach irritation", "Nausea", "Vomiting", "Easy bruising", "Heartburn"],
    interactions: ["Blood thinners", "Ibuprofen", "Methotrexate", "SSRIs", "Corticosteroids"],
    contraindications: ["Active bleeding", "Bleeding disorders", "Children under 16", "Aspirin allergy", "Severe asthma"],
    warnings: ["Risk of Reye's syndrome in children", "May cause stomach bleeding"],
  },
  metformin: {
    name: "Metformin",
    genericName: "Metformin Hydrochloride",
    usage: "First-line medication for type 2 diabetes. Helps control blood sugar levels by decreasing glucose production in the liver and improving insulin sensitivity.",
    dosage: "Starting dose: 500mg twice daily. Maximum: 2550mg per day in divided doses.",
    precautions: [
      "Take with meals to reduce stomach upset",
      "Stay hydrated",
      "Inform doctor before any surgery or imaging with contrast dye",
      "Monitor blood sugar regularly",
    ],
    sideEffects: ["Nausea", "Diarrhea", "Stomach upset", "Metallic taste", "Vitamin B12 deficiency (long-term)"],
    interactions: ["Alcohol", "Contrast dyes", "Diuretics", "Corticosteroids", "Beta-blockers"],
    contraindications: ["Severe kidney disease", "Metabolic acidosis", "Severe liver disease", "Dehydration"],
    warnings: ["Risk of lactic acidosis in rare cases", "Stop before procedures with contrast dye"],
  },
  omeprazole: {
    name: "Omeprazole",
    genericName: "Omeprazole",
    usage: "Proton pump inhibitor used to treat gastroesophageal reflux disease (GERD), stomach ulcers, and conditions involving excessive stomach acid.",
    dosage: "20mg to 40mg once daily, usually before breakfast. Treatment duration varies by condition.",
    precautions: [
      "Take 30-60 minutes before meals",
      "Swallow whole, do not crush or chew",
      "Long-term use may affect nutrient absorption",
    ],
    sideEffects: ["Headache", "Stomach pain", "Nausea", "Diarrhea", "Constipation", "Dizziness"],
    interactions: ["Clopidogrel", "Methotrexate", "Digoxin", "HIV medications", "Warfarin"],
    contraindications: ["Hypersensitivity to proton pump inhibitors"],
    warnings: [
      "Long-term use may increase risk of bone fractures",
      "May mask symptoms of gastric cancer",
      "Can cause vitamin B12 and magnesium deficiency",
    ],
  },
  amlodipine: {
    name: "Amlodipine",
    genericName: "Amlodipine Besylate",
    usage: "Calcium channel blocker used to treat high blood pressure (hypertension) and chest pain (angina). Helps relax blood vessels so blood can flow more easily.",
    dosage: "Starting dose: 5mg once daily. May be increased to 10mg once daily.",
    precautions: ["May take several weeks to see full effect", "Do not stop suddenly", "Avoid grapefruit juice"],
    sideEffects: ["Swelling of ankles/feet", "Fatigue", "Nausea", "Dizziness", "Flushing", "Palpitations"],
    interactions: ["Simvastatin", "Cyclosporine", "Grapefruit juice", "CYP3A4 inhibitors"],
    contraindications: ["Severe aortic stenosis", "Cardiogenic shock", "Unstable angina"],
    warnings: ["May worsen angina or cause heart attack at start of treatment"],
  },
  lisinopril: {
    name: "Lisinopril",
    genericName: "Lisinopril",
    usage: "ACE inhibitor used to treat high blood pressure, heart failure, and to improve survival after heart attacks.",
    dosage: "Starting dose: 5mg to 10mg once daily. Maintenance: 20mg to 40mg once daily.",
    precautions: ["May cause dry cough", "Avoid potassium supplements unless prescribed", "Stay hydrated"],
    sideEffects: ["Dry cough", "Dizziness", "Headache", "Fatigue", "Nausea", "High potassium levels"],
    interactions: ["Potassium supplements", "NSAIDs", "Lithium", "Diuretics", "Aliskiren"],
    contraindications: ["Pregnancy", "History of angioedema", "Bilateral renal artery stenosis"],
    warnings: ["Can cause severe allergic reactions (angioedema)", "Not safe during pregnancy"],
  },
  atorvastatin: {
    name: "Atorvastatin",
    genericName: "Atorvastatin Calcium",
    usage: "Statin medication used to lower cholesterol and triglyceride levels. Reduces risk of heart attack, stroke, and other cardiovascular events.",
    dosage: "Starting dose: 10mg to 20mg once daily. Maximum: 80mg once daily.",
    precautions: [
      "Take at the same time each day",
      "Report any unexplained muscle pain",
      "Limit alcohol intake",
      "Regular liver function tests may be needed",
    ],
    sideEffects: ["Muscle pain", "Joint pain", "Diarrhea", "Nausea", "Headache", "Cold symptoms"],
    interactions: ["Grapefruit juice", "Cyclosporine", "Gemfibrozil", "Erythromycin", "HIV medications"],
    contraindications: ["Active liver disease", "Pregnancy", "Breastfeeding"],
    warnings: ["Risk of rhabdomyolysis (muscle breakdown)", "Can affect liver function"],
  },
};

// Normalize drug name for lookup — strips spaces, punctuation, numbers, case
function normalizeDrugName(name: string): string {
  return name.toLowerCase().trim().replace(/[^a-z]/g, "");
}

// FIX: Accept multiple OCR candidates and return the first DB match.
// The backend now sends { medicine: string, candidates: string[] }.
// This prevents misses caused by the OCR picking a brand name or dosage
// string as the "best" single result.
export async function searchDrug(query: string): Promise<DrugInfo | null> {
  await new Promise((resolve) => setTimeout(resolve, 500));

  const normalizedQuery = normalizeDrugName(query);

  // Exact key match
  if (drugDatabase[normalizedQuery]) {
    return drugDatabase[normalizedQuery];
  }

  // Exact name / genericName match
  for (const drug of Object.values(drugDatabase)) {
    if (
      normalizeDrugName(drug.name) === normalizedQuery ||
      normalizeDrugName(drug.genericName) === normalizedQuery
    ) {
      return drug;
    }
  }

  // Partial / substring match
  for (const drug of Object.values(drugDatabase)) {
    if (
      normalizeDrugName(drug.name).includes(normalizedQuery) ||
      normalizeDrugName(drug.genericName).includes(normalizedQuery) ||
      normalizedQuery.includes(normalizeDrugName(drug.name)) // query contains drug name
    ) {
      return drug;
    }
  }

  return null;
}

// FIX: Proper error handling + candidate-aware matching.
// Steps:
//   1. POST the image to /scan
//   2. Get { medicine, candidates } back
//   3. Try each candidate against the DB and return the first hit
//   4. Fall back to the top-level `medicine` string if no candidate matched
export async function extractDrugFromImage(file: File): Promise<string | null> {
  const formData = new FormData();
  formData.append("file", file);

  let data: { medicine: string; candidates?: string[] };

  try {
    const response = await fetch("http://127.0.0.1:8000/scan", {
      method: "POST",
      body: formData,
    });

    // FIX: was silently returning null on non-200 — now throws with detail
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Server error ${response.status}: ${errorText}`);
    }

    data = await response.json();
  } catch (error) {
    console.error("Image scan failed:", error);
    return null;
  }

  // If backend sends multiple candidates, try each against the DB
  if (data.candidates && data.candidates.length > 0) {
    for (const candidate of data.candidates) {
      const match = await searchDrug(candidate);
      if (match) return match.name;
    }
  }

  // Fall back to single best OCR result
  return data.medicine ?? null;
}

export function getAvailableDrugs(): string[] {
  return Object.values(drugDatabase).map((drug) => drug.name);
}