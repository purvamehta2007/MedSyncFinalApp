import { TriangleAlert as AlertTriangle } from "lucide-react";

export function TriggerWarning() {
  return (
    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
      <div className="flex-shrink-0">
        <AlertTriangle className="w-6 h-6 text-amber-500" />
      </div>
      <div>
        <p className="text-base font-semibold text-amber-800">Important Notice</p>
        <p className="text-sm text-amber-700 mt-1 leading-relaxed">
          This information is AI-assisted and for reference only. Always consult a qualified healthcare professional or doctor before taking any medication.
        </p>
      </div>
    </div>
  );
}
