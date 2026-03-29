import { useState, useEffect } from "react";
import { Brain, Pill, Activity, FileText } from "lucide-react";
import { MedicineScanner } from "../components/MedicineScanner";
import { SideEffectsPanel } from "../components/SideEffectsPanel";
import { RiskAlert } from "../components/RiskAlert";
import { TriggerWarning } from "../components/TriggerWarning";
import { analyzeRisks, type RiskAnalysis } from "../utils/riskAnalyzer";
import type { DrugInfo } from "../services/drugInfoService";
import { supabase, type HealthRecord, type Medicine } from "../lib/supabase";
import { useAuth } from "../lib/auth-context";

export function IntelligencePage() {
  const { user } = useAuth();
  const [drugInfo, setDrugInfo] = useState<DrugInfo | null>(null);
  const [healthRecord, setHealthRecord] = useState<HealthRecord | null>(null);
  const [currentMedicines, setCurrentMedicines] = useState<Medicine[]>([]);
  const [riskAnalysis, setRiskAnalysis] = useState<RiskAnalysis | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [loadingHealth, setLoadingHealth] = useState(true);

  // Load user's health record and current medicines
  useEffect(() => {
    const loadUserData = async () => {
      if (!user) return;

      try {
        // Load health record
        const { data: healthData } = await supabase
          .from("health_records")
          .select("*")
          .maybeSingle();

        if (healthData) {
          setHealthRecord(healthData);
        }

        // Load current medicines
        const { data: medicinesData } = await supabase
          .from("medicines")
          .select("*")
          .eq("is_active", true);

        if (medicinesData) {
          setCurrentMedicines(medicinesData);
        }
      } catch (error) {
        console.error("Error loading user data:", error);
      } finally {
        setLoadingHealth(false);
      }
    };

    loadUserData();
  }, [user]);

  // Handle drug found from scanner
  const handleDrugFound = (drug: DrugInfo) => {
    setDrugInfo(drug);

    // Analyze risks based on user's health data
    const analysis = analyzeRisks(drug, healthRecord, currentMedicines);
    setRiskAnalysis(analysis);
  };

  if (loadingHealth) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="bg-gradient-to-br from-purple-500 to-blue-500 p-2 rounded-lg">
            <Brain className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Smart Medicine Intelligence</h1>
        </div>
        <p className="text-gray-600">
          Search for any medicine to see detailed information, side effects, and personalized risk analysis based on your health profile.
        </p>
      </div>

      {/* Trigger Warning - Always visible */}
      <TriggerWarning />

      {/* Health Profile Summary */}
      {(healthRecord?.allergies?.length || healthRecord?.existing_conditions?.length || currentMedicines.length > 0) && (
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <Activity className="w-4 h-4" />
            Your Health Profile (Used for Risk Analysis)
          </h3>
          <div className="flex flex-wrap gap-2">
            {healthRecord?.allergies?.map((allergy, i) => (
              <span key={`a-${i}`} className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm">
                Allergy: {allergy}
              </span>
            ))}
            {healthRecord?.existing_conditions?.map((condition, i) => (
              <span key={`c-${i}`} className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm">
                {condition}
              </span>
            ))}
            {currentMedicines.slice(0, 5).map((med) => (
              <span key={med.id} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                Taking: {med.name}
              </span>
            ))}
            {currentMedicines.length > 5 && (
              <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                +{currentMedicines.length - 5} more
              </span>
            )}
          </div>
          {!healthRecord?.allergies?.length && !healthRecord?.existing_conditions?.length && (
            <p className="text-sm text-gray-500">
              Add your allergies and conditions in{" "}
              <a href="/dashboard/health" className="text-blue-500 hover:underline">
                Health Record
              </a>{" "}
              for personalized risk analysis.
            </p>
          )}
        </div>
      )}

      {/* Medicine Scanner */}
      <MedicineScanner onDrugFound={handleDrugFound} onSearching={setIsSearching} />

      {/* Loading State */}
      {isSearching && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Analyzing medicine information...</p>
          </div>
        </div>
      )}

      {/* Results Section */}
      {drugInfo && !isSearching && (
        <div className="space-y-6">
          {/* Drug Info Card */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-start gap-4 mb-6">
              <div className="p-3 bg-blue-100 rounded-xl">
                <Pill className="w-8 h-8 text-blue-600" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900">{drugInfo.name}</h2>
                <p className="text-gray-600">Generic: {drugInfo.genericName}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Usage */}
              <div className="bg-gray-50 rounded-xl p-5">
                <div className="flex items-center gap-2 mb-3">
                  <FileText className="w-5 h-5 text-gray-600" />
                  <h3 className="font-semibold text-gray-900">Usage</h3>
                </div>
                <p className="text-gray-700 leading-relaxed">{drugInfo.usage}</p>
              </div>

              {/* Dosage */}
              <div className="bg-gray-50 rounded-xl p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Activity className="w-5 h-5 text-gray-600" />
                  <h3 className="font-semibold text-gray-900">Recommended Dosage</h3>
                </div>
                <p className="text-gray-700 leading-relaxed">{drugInfo.dosage}</p>
              </div>
            </div>
          </div>

          {/* Risk Analysis */}
          {riskAnalysis && <RiskAlert analysis={riskAnalysis} />}

          {/* Side Effects Panel */}
          <SideEffectsPanel drugInfo={drugInfo} />

          {/* Warnings */}
          {riskAnalysis && riskAnalysis.warnings.length > 0 && (
            <div className="bg-gray-50 rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Additional Warnings</h3>
              <ul className="space-y-2">
                {riskAnalysis.warnings.map((warning, index) => (
                  <li
                    key={index}
                    className="flex items-start gap-3 text-gray-700"
                  >
                    <span className="w-2 h-2 bg-gray-400 rounded-full flex-shrink-0 mt-2" />
                    <span className="text-base leading-relaxed">{warning}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Bottom Warning */}
          <TriggerWarning />
        </div>
      )}

      {/* Empty State */}
      {!drugInfo && !isSearching && (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
          <div className="bg-gray-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Brain className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Search for a Medicine
          </h3>
          <p className="text-gray-600 max-w-md mx-auto">
            Enter a medicine name or scan an image to see detailed drug information, potential side effects, and personalized risk analysis.
          </p>
        </div>
      )}
    </div>
  );
}
