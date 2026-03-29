import { CircleAlert as AlertCircle, Info, ShieldAlert } from "lucide-react";
import type { DrugInfo } from "../services/drugInfoService";

interface SideEffectsPanelProps {
  drugInfo: DrugInfo;
}

export function SideEffectsPanel({ drugInfo }: SideEffectsPanelProps) {
  return (
    <div className="space-y-6">
      {/* Side Effects */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-orange-100 rounded-lg">
            <AlertCircle className="w-5 h-5 text-orange-600" />
          </div>
          <h3 className="text-lg font-bold text-gray-900">Possible Side Effects</h3>
        </div>
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {drugInfo.sideEffects.map((effect, index) => (
            <li
              key={index}
              className="flex items-center gap-2 text-gray-700 bg-orange-50 rounded-lg px-3 py-2"
            >
              <span className="w-2 h-2 bg-orange-400 rounded-full flex-shrink-0" />
              <span className="text-base">{effect}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Precautions */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Info className="w-5 h-5 text-blue-600" />
          </div>
          <h3 className="text-lg font-bold text-gray-900">Precautions</h3>
        </div>
        <ul className="space-y-2">
          {drugInfo.precautions.map((precaution, index) => (
            <li
              key={index}
              className="flex items-start gap-3 text-gray-700 bg-blue-50 rounded-lg px-4 py-3"
            >
              <span className="w-2 h-2 bg-blue-400 rounded-full flex-shrink-0 mt-2" />
              <span className="text-base leading-relaxed">{precaution}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Contraindications */}
      {drugInfo.contraindications.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-red-100 rounded-lg">
              <ShieldAlert className="w-5 h-5 text-red-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">Do Not Use If</h3>
          </div>
          <ul className="space-y-2">
            {drugInfo.contraindications.map((item, index) => (
              <li
                key={index}
                className="flex items-start gap-3 text-gray-700 bg-red-50 rounded-lg px-4 py-3"
              >
                <span className="w-2 h-2 bg-red-400 rounded-full flex-shrink-0 mt-2" />
                <span className="text-base leading-relaxed">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
