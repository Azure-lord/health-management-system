import { UserAccount, School } from '../types/health';
import { ShieldCheck, UserCheck, Stethoscope, Lock, Eye, KeyRound, Building2 } from 'lucide-react';

interface Props {
  currentUser: UserAccount;
  currentSchool?: School | null;
  selectedParentChildName?: string;
  onOpenLoginModal: () => void;
}

export function RoleSwitcherBar({
  currentUser,
  currentSchool,
  selectedParentChildName,
  onOpenLoginModal,
}: Props) {
  const isTeacher = currentUser.role === 'teacher';
  const isParent = currentUser.role === 'parent';
  const isMedicalCenter = currentUser.role === 'medical_center';

  return (
    <div className="bg-slate-900 text-slate-200 border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Left: Role identity and security boundary */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Authenticated Session:
            </span>
            <span className="font-bold text-white flex items-center gap-1">
              {currentUser.name}
            </span>
          </div>

          <span className="text-slate-600">·</span>

          {/* Role badge */}
          {isTeacher && (
            <span className="inline-flex items-center gap-1.5 text-blue-300 bg-blue-950/80 px-2 py-0.5 rounded border border-blue-800/60 font-semibold">
              <Eye className="w-3 h-3 text-blue-400" />
              Teacher Role · Read-Only Access
            </span>
          )}

          {isParent && (
            <span className="inline-flex items-center gap-1.5 text-emerald-300 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800/60 font-semibold">
              <UserCheck className="w-3 h-3 text-emerald-400" />
              Parent Role · Edit Child: {selectedParentChildName || 'Assigned Child'}
            </span>
          )}

          {isMedicalCenter && (
            <span className="inline-flex items-center gap-1.5 text-purple-300 bg-purple-950/80 px-2 py-0.5 rounded border border-purple-800/60 font-semibold">
              <Stethoscope className="w-3 h-3 text-purple-400" />
              Medical Center · Multi-Campus Clinical Supervision
            </span>
          )}

          {currentSchool && (
            <span className="hidden sm:inline-flex items-center gap-1 text-slate-400">
              <Building2 className="w-3 h-3" />
              {currentSchool.name}
            </span>
          )}
        </div>

        {/* Right: Security explainer and fast switch trigger */}
        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-1.5 text-slate-400 text-[11px]">
            {isTeacher ? (
              <span className="flex items-center gap-1 text-blue-300">
                <Lock className="w-3 h-3 text-blue-400" />
                Medical records are locked from modifications by teachers
              </span>
            ) : isParent ? (
              <span className="flex items-center gap-1 text-emerald-300">
                <ShieldCheck className="w-3 h-3 text-emerald-400" />
                Child privacy enforced · Isolated from other students
              </span>
            ) : (
              <span className="flex items-center gap-1 text-purple-300">
                <Building2 className="w-3 h-3 text-purple-400" />
                Cross-school access enabled for regional clinics
              </span>
            )}
          </div>

          <button
            onClick={onOpenLoginModal}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-[11px] font-semibold transition-colors shadow-xs"
          >
            <KeyRound className="w-3 h-3 text-amber-400" />
            Switch Account / Role
          </button>
        </div>
      </div>
    </div>
  );
}
