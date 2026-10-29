import { Student } from '../../types/health';
import { X, Phone, AlertTriangle, ShieldCheck, Printer } from 'lucide-react';

interface Props {
  student: Student;
  onClose: () => void;
}

export function EmergencyCardModal({ student, onClose }: Props) {
  const severeAllergies = student.allergies.filter((a) => a.severity.includes('Severe'));

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-start sm:items-center justify-center p-0 sm:p-4 overflow-y-auto overscroll-contain">
      <div 
        className="bg-white rounded-none sm:rounded-xl max-w-2xl w-full border-0 sm:border border-slate-200 shadow-2xl overflow-hidden h-[100dvh] sm:h-auto sm:max-h-[90vh] flex flex-col my-0 sm:my-auto shrink-0"
        role="dialog"
        aria-modal="true"
        aria-labelledby="emergency-card-title"
      >
        {/* Header */}
        <div className="bg-rose-700 text-white p-4 sm:p-5 flex items-start justify-between shrink-0 shadow-xs z-20">
          <div>
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-rose-200" />
              <h2 id="emergency-card-title" className="text-base sm:text-lg font-bold tracking-tight">
                Student Emergency Medical Card
              </h2>
            </div>
            <p className="text-[11px] sm:text-xs text-rose-100 mt-1">
              Confidential Student Health & Allergy Action Protocol · Keep readily accessible
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-rose-200 hover:text-white p-2 rounded-lg hover:bg-rose-800 transition-colors"
            aria-label="Close emergency card"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 text-sm flex-1 min-h-0 overscroll-contain">
          {/* Identity Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pb-4 border-b border-slate-100">
            <div>
              <div className="text-xs text-slate-500 font-medium">Student Name</div>
              <div className="text-base font-bold text-slate-900">{student.name}</div>
            </div>
            <div>
              <div className="text-xs text-slate-500 font-medium">Grade / Room</div>
              <div className="text-base font-semibold text-slate-800">{student.grade}</div>
            </div>
            <div>
              <div className="text-xs text-slate-500 font-medium">Date of Birth</div>
              <div className="text-base font-mono-numbers text-slate-800">{student.dob}</div>
            </div>
            <div>
              <div className="text-xs text-slate-500 font-medium">Blood Type</div>
              <div className="text-base font-mono-numbers font-semibold text-rose-700">{student.bloodType}</div>
            </div>
          </div>

          {/* Critical Allergy Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Documented Allergies & Triggers
              </h3>
              {severeAllergies.length > 0 && (
                <span className="text-xs text-rose-700 font-semibold flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                  EpiPen Protocol Required
                </span>
              )}
            </div>

            {student.allergies.length === 0 ? (
              <div className="p-3 bg-slate-50 rounded-lg text-slate-600 text-xs flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                No known medical or food allergies recorded for this student.
              </div>
            ) : (
              <div className="space-y-3">
                {student.allergies.map((allergy) => (
                  <div
                    key={allergy.id}
                    className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/50 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 text-sm">
                        {allergy.name}
                      </span>
                      <span className={`text-xs font-semibold ${
                        allergy.severity.includes('Severe') ? 'text-rose-700' : 'text-amber-700'
                      }`}>
                        {allergy.severity}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-slate-700">
                      <div>
                        <span className="font-medium text-slate-500">Triggers:</span> {allergy.triggers}
                      </div>
                      <div>
                        <span className="font-medium text-slate-500">Symptoms:</span> {allergy.reaction}
                      </div>
                    </div>

                    <div className="bg-rose-50/80 border border-rose-200 rounded p-2 text-xs text-rose-900">
                      <span className="font-bold text-rose-800">Action Plan: </span>
                      {allergy.actionPlan}
                    </div>

                    {allergy.epipenLocation && (
                      <div className="text-xs text-slate-600 flex items-center gap-1">
                        <span className="font-medium text-slate-500">EpiPen Location:</span>
                        <span className="text-slate-800 font-medium">{allergy.epipenLocation}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Emergency Contacts */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Immediate Emergency Contacts
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3 border border-slate-200 rounded-lg bg-white">
                <div className="text-xs text-slate-500 font-medium">Primary Guardian</div>
                <div className="font-bold text-slate-900 mt-0.5">{student.parentName}</div>
                <div className="text-xs text-slate-600 mt-1 flex items-center gap-1.5 font-mono-numbers">
                  <Phone className="w-3.5 h-3.5 text-emerald-600" />
                  <a href={`tel:${student.parentPhone}`} className="hover:underline font-semibold text-slate-800">
                    {student.parentPhone}
                  </a>
                </div>
                <div className="text-[11px] text-slate-500 truncate mt-0.5">{student.parentEmail}</div>
              </div>

              <div className="p-3 border border-slate-200 rounded-lg bg-white">
                <div className="text-xs text-slate-500 font-medium">
                  Secondary Contact ({student.secondaryContact.relation})
                </div>
                <div className="font-bold text-slate-900 mt-0.5">{student.secondaryContact.name}</div>
                <div className="text-xs text-slate-600 mt-1 flex items-center gap-1.5 font-mono-numbers">
                  <Phone className="w-3.5 h-3.5 text-emerald-600" />
                  <a href={`tel:${student.secondaryContact.phone}`} className="hover:underline font-semibold text-slate-800">
                    {student.secondaryContact.phone}
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Physician Information */}
          <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 text-xs flex items-center justify-between">
            <div>
              <div className="font-semibold text-slate-800">{student.physician.name}</div>
              <div className="text-slate-500">{student.physician.clinic}</div>
            </div>
            <div className="font-mono-numbers font-semibold text-slate-700 flex items-center gap-1">
              <Phone className="w-3.5 h-3.5 text-slate-500" />
              {student.physician.phone}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs">
          <span className="text-slate-500 font-mono-numbers">
            Student ID: {student.id} · Record Verified
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="px-3 py-1.5 border border-slate-300 text-slate-700 rounded-md font-medium hover:bg-slate-100 transition-colors flex items-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5" />
              Print Card
            </button>
            <button
              onClick={onClose}
              className="px-4 py-1.5 bg-slate-900 text-white rounded-md font-medium hover:bg-slate-800 transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
