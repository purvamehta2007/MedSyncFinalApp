import { TriangleAlert as AlertTriangle, OctagonAlert as AlertOctagon, ShieldCheck, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import type { RiskAnalysis, RiskLevel, RiskItem } from "../utils/riskAnalyzer";
import { getRiskColor } from "../utils/riskAnalyzer";

interface RiskAlertProps {
  analysis: RiskAnalysis;
}

function RiskIcon({ level }: { level: RiskLevel }) {
  const colors = getRiskColor(level);
  
  switch (level) {
    case "dangerous":
      return <AlertOctagon className={`w-6 h-6 ${colors.icon}`} />;
    case "caution":
      return <AlertTriangle className={`w-6 h-6 ${colors.icon}`} />;
    case "safe":
    default:
      return <ShieldCheck className={`w-6 h-6 ${colors.icon}`} />;
  }
}

function RiskItemCard({ item }: { item: RiskItem }) {
  const colors = getRiskColor(item.level);

  return (
    <div className={`${colors.bg} ${colors.border} border rounded-lg p-4`}>
      <div className="flex items-start gap-3">
        <RiskIcon level={item.level} />
        <div className="flex-1">
          <p className={`font-semibold ${colors.text}`}>{item.title}</p>
          <p className={`text-sm mt-1 ${colors.text} opacity-90`}>{item.description}</p>
        </div>
      </div>
    </div>
  );
}

function getRiskLabel(level: RiskLevel): string {
  switch (level) {
    case "dangerous":
      return "High Risk Detected";
    case "caution":
      return "Use With Caution";
    case "safe":
    default:
      return "Generally Safe";
  }
}

export function RiskAlert({ analysis }: RiskAlertProps) {
  const [expanded, setExpanded] = useState(true);
  const colors = getRiskColor(analysis.overallRisk);
  const hasRisks =
    analysis.allergyRisks.length > 0 ||
    analysis.conditionRisks.length > 0 ||
    analysis.interactionRisks.length > 0;

  return (
    <div className={`${colors.bg} ${colors.border} border-2 rounded-xl overflow-hidden`}>
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-5 flex items-center justify-between hover:opacity-90 transition-opacity"
      >
        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-full ${colors.bg}`}>
            <RiskIcon level={analysis.overallRisk} />
          </div>
          <div className="text-left">
            <p className={`text-xl font-bold ${colors.text}`}>
              {getRiskLabel(analysis.overallRisk)}
            </p>
            <p className={`text-sm ${colors.text} opacity-80 mt-1`}>
              {hasRisks
                ? `${analysis.allergyRisks.length + analysis.conditionRisks.length + analysis.interactionRisks.length} potential issue(s) found`
                : "No significant risks detected based on your health profile"}
            </p>
          </div>
        </div>
        {hasRisks && (
          <div className={colors.text}>
            {expanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </div>
        )}
      </button>

      {expanded && hasRisks && (
        <div className="px-5 pb-5 space-y-3">
          {analysis.allergyRisks.map((risk, index) => (
            <RiskItemCard key={`allergy-${index}`} item={risk} />
          ))}
          {analysis.conditionRisks.map((risk, index) => (
            <RiskItemCard key={`condition-${index}`} item={risk} />
          ))}
          {analysis.interactionRisks.map((risk, index) => (
            <RiskItemCard key={`interaction-${index}`} item={risk} />
          ))}
        </div>
      )}
    </div>
  );
}
