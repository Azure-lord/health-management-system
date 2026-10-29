import { AllergySeverity } from '../../types/health';
import { AlertTriangle, AlertCircle, Info } from 'lucide-react';

interface Props {
  name: string;
  severity: AllergySeverity;
  hasEpiPen?: boolean;
}

export function AllergyBadge({ name, severity, hasEpiPen }: Props) {
  const isSevere = severity.includes('Severe');
  const isModerate = severity === 'Moderate';

  return (
    <div className="inline-flex items-center gap-1.5 text-xs py-0.5">
      {isSevere ? (
        <span className="inline-flex items-center gap-1 text-rose-700 font-semibold">
          <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
          <span>{name}</span>
          <span className="text-[11px] font-normal text-rose-600/90">(Severe / Anaphylaxis)</span>
          {hasEpiPen && (
            <span className="text-[10px] font-semibold text-rose-800 bg-rose-50 px-1 py-0.2 rounded border border-rose-200">
              EpiPen
            </span>
          )}
        </span>
      ) : isModerate ? (
        <span className="inline-flex items-center gap-1 text-amber-700 font-medium">
          <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
          <span>{name}</span>
          <span className="text-[11px] font-normal text-amber-600/90">(Moderate)</span>
        </span>
      ) : (
        <span className="inline-flex items-center gap-1 text-slate-700 font-normal">
          <Info className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span>{name}</span>
          <span className="text-[11px] text-slate-500">(Mild)</span>
        </span>
      )}
    </div>
  );
}
