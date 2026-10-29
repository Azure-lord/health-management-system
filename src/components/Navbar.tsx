import { useState } from 'react';
import { UserAccount, School, SchoolRoom } from '../types/health';
import { 
  HeartPulse, 
  KeyRound, 
  Plus, 
  User, 
  Stethoscope, 
  ShieldCheck, 
  DoorOpen, 
  Copy, 
  Check, 
  History, 
  Mail, 
  LogOut, 
  Trash2,
  ChevronDown,
  Building2,
  Award,
  Lock,
  MapPin
} from 'lucide-react';

interface Props {
  currentUser: UserAccount;
  currentSchool?: School | null;
  activeRoom?: SchoolRoom | null;
  currentView?: 'national' | 'district' | 'school' | 'subroom';
  activeDistrictName?: string;
  activeClassName?: string;
  pendingApprovalsCount?: number;
  auditEventsCount?: number;
  onOpenLoginModal: () => void;
  onOpenAddChildModal?: () => void;
  onOpenIntakeModal?: () => void;
  onOpenApprovalsInbox?: () => void;
  onOpenAuditMemory?: () => void;
  onLeaveRoom?: () => void;
  onDeleteRoom?: () => void;
  onNavigateView?: (view: 'national' | 'district' | 'school') => void;
}

export function Navbar({
  currentUser,
  currentSchool,
  activeRoom,
  currentView = 'national',
  activeDistrictName,
  activeClassName,
  pendingApprovalsCount = 0,
  auditEventsCount = 0,
  onOpenLoginModal,
  onOpenAddChildModal,
  onOpenIntakeModal,
  onOpenApprovalsInbox,
  onOpenAuditMemory,
  onLeaveRoom,
  onDeleteRoom,
  onNavigateView,
}: Props) {
  const [copiedCode, setCopiedCode] = useState(false);
  const [isRoomMenuOpen, setIsRoomMenuOpen] = useState(false);

  const isTeacher = currentUser.role === 'teacher';
  const isParent = currentUser.role === 'parent';
  const isMedicalCenter = currentUser.role === 'medical_center';
  const isPrincipal = currentUser.role === 'principal';
  const isDistrictAuth = currentUser.role === 'district_auth';

  const handleCopyCode = () => {
    if (!activeRoom) return;
    navigator.clipboard.writeText(activeRoom.roomCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between gap-4 h-16">
        {/* Zone 1: Clean wordmark with medical icon & Interactive Breadcrumb */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => onNavigateView && onNavigateView('national')}
            className="flex items-center gap-2.5 text-left group"
            title="Click to view National Portal & Directory"
          >
            <div className="w-9 h-9 rounded-xl bg-rose-600 text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
              <HeartPulse className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-base font-extrabold tracking-tight text-slate-900 group-hover:text-rose-600 transition-colors">
                  K-Health
                </span>
                <span className="text-[10px] uppercase font-bold bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded border border-slate-200">
                  National
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium hidden sm:block">
                Sub-Room Educational Health Network
              </p>
            </div>
          </button>

          {/* Interactive Hierarchy Breadcrumb Navigation */}
          <div className="hidden md:flex items-center gap-1.5 text-xs font-semibold pl-3 border-l border-slate-200">
            <button
              onClick={() => onNavigateView && onNavigateView('national')}
              className={`transition-colors ${
                currentView === 'national' ? 'text-indigo-700 font-bold' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              National
            </button>

            {(activeRoom || activeDistrictName) && (
              <>
                <span className="text-slate-300">/</span>
                <button
                  onClick={() => onNavigateView && onNavigateView('district')}
                  className={`truncate max-w-[140px] transition-colors ${
                    currentView === 'district' ? 'text-indigo-700 font-bold' : 'text-slate-500 hover:text-slate-900'
                  }`}
                  title={activeRoom?.districtName || activeDistrictName}
                >
                  {activeRoom?.districtName || activeDistrictName}
                </button>
              </>
            )}

            {activeRoom && (
              <>
                <span className="text-slate-300">/</span>
                <button
                  onClick={() => onNavigateView && onNavigateView('school')}
                  className={`truncate max-w-[140px] transition-colors ${
                    currentView === 'school' ? 'text-indigo-700 font-bold' : 'text-slate-500 hover:text-slate-900'
                  }`}
                  title={activeRoom.schoolName}
                >
                  {activeRoom.schoolName}
                </button>
              </>
            )}

            {currentView === 'subroom' && activeClassName && (
              <>
                <span className="text-slate-300">/</span>
                <span className="text-rose-700 font-bold truncate max-w-[140px]">
                  {activeClassName}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Zone 2: Room Code Badge with Popover */}
        {activeRoom && (
          <div className="relative">
            <div className="flex items-center gap-1.5 p-1 bg-slate-100 border border-slate-200 rounded-xl">
              <button
                onClick={handleCopyCode}
                className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono font-bold text-slate-800 hover:text-rose-600 transition-colors"
                title="Click to copy School Room Code"
              >
                <DoorOpen className="w-3.5 h-3.5 text-rose-600" />
                <span>{activeRoom.roomCode}</span>
                {copiedCode ? (
                  <Check className="w-3 h-3 text-emerald-600" />
                ) : (
                  <Copy className="w-3 h-3 text-slate-400" />
                )}
              </button>

              <button
                onClick={() => setIsRoomMenuOpen(!isRoomMenuOpen)}
                className="p-1 text-slate-400 hover:text-slate-800 rounded-lg hover:bg-slate-200 transition-colors"
                title="Room Options"
              >
                <ChevronDown className="w-3 h-3" />
              </button>
            </div>

            {/* Room Options Dropdown */}
            {isRoomMenuOpen && (
              <div className="absolute top-full right-0 mt-2 w-64 bg-white border border-slate-200 rounded-xl shadow-xl py-1.5 z-50 text-xs">
                <div className="px-3 py-2 border-b border-slate-100">
                  <p className="font-bold text-slate-900">{activeRoom.schoolName}</p>
                  <p className="text-[11px] text-slate-500 font-mono">Room Code: {activeRoom.roomCode}</p>
                </div>

                {onLeaveRoom && (
                  <button
                    onClick={() => {
                      setIsRoomMenuOpen(false);
                      onLeaveRoom();
                    }}
                    className="w-full text-left px-3 py-2 text-slate-700 hover:bg-slate-50 flex items-center gap-2 font-medium"
                  >
                    <LogOut className="w-3.5 h-3.5 text-slate-400" />
                    <span>Return to National Gateway</span>
                  </button>
                )}

                {/* District Officer Exclusive Deletion with Password Gate */}
                {isDistrictAuth && onDeleteRoom ? (
                  <button
                    onClick={() => {
                      setIsRoomMenuOpen(false);
                      onDeleteRoom();
                    }}
                    className="w-full text-left px-3 py-2 text-rose-600 hover:bg-rose-50 flex items-center gap-2 font-medium border-t border-slate-100"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                    <span>Delete School (District Password Req.)</span>
                  </button>
                ) : (
                  <div className="px-3 py-2 text-[11px] text-slate-400 flex items-center gap-1.5 border-t border-slate-100 bg-slate-50">
                    <Lock className="w-3 h-3 text-slate-400 shrink-0" />
                    <span>School deletion restricted to District Officer</span>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Zone 3: Governance, Audit, User persona & Actions */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Approval Center Button - Strictly restricted to Principal and District Authority */}
          {(isPrincipal || isDistrictAuth) && onOpenApprovalsInbox && (
            <button
              onClick={onOpenApprovalsInbox}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors border ${
                pendingApprovalsCount > 0
                  ? 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                  : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
              }`}
              title={isPrincipal ? 'Principal Inter-Class Approvals' : 'District Authority Oversight Approvals'}
            >
              <Mail className="w-3.5 h-3.5" />
              <span className="hidden md:inline">{isPrincipal ? 'Approvals' : 'District Approvals'}</span>
              {pendingApprovalsCount > 0 && (
                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-rose-600 text-white font-mono">
                  {pendingApprovalsCount}
                </span>
              )}
            </button>
          )}

          {/* Audit Memory Log Button - Strictly restricted to Administrative Officers */}
          {(isPrincipal || isDistrictAuth) && onOpenAuditMemory && (
            <button
              onClick={onOpenAuditMemory}
              className="px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200 flex items-center gap-1.5 transition-colors"
              title="Real-Time Audit Memory Stream"
            >
              <History className="w-3.5 h-3.5 text-slate-600" />
              <span className="hidden md:inline">Audit Memory</span>
            </button>
          )}

          {/* Active User Persona */}
          <button
            onClick={onOpenLoginModal}
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs transition-colors text-left"
            title="Click to Switch Persona or Register"
          >
            <div
              className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${
                isTeacher
                  ? 'bg-blue-100 text-blue-700'
                  : isParent
                  ? 'bg-emerald-100 text-emerald-700'
                  : isMedicalCenter
                  ? 'bg-purple-100 text-purple-700'
                  : isPrincipal
                  ? 'bg-amber-100 text-amber-700'
                  : 'bg-indigo-100 text-indigo-700'
              }`}
            >
              {isTeacher && <ShieldCheck className="w-3.5 h-3.5" />}
              {isParent && <User className="w-3.5 h-3.5" />}
              {isMedicalCenter && <Stethoscope className="w-3.5 h-3.5" />}
              {isPrincipal && <Building2 className="w-3.5 h-3.5" />}
              {isDistrictAuth && <Award className="w-3.5 h-3.5" />}
            </div>

            <div className="leading-tight hidden sm:block">
              <div className="font-bold text-slate-800 text-xs max-w-[110px] truncate">
                {currentUser.name}
              </div>
              <div className="text-[10px] text-slate-500 capitalize">
                {currentUser.role.replace('_', ' ')}
              </div>
            </div>
          </button>

          {/* Quick Real-Life Add Action */}
          {isParent && onOpenAddChildModal && (
            <button
              onClick={onOpenAddChildModal}
              className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Add Child</span>
            </button>
          )}

          {(isTeacher || isMedicalCenter) && onOpenIntakeModal && (
            <button
              onClick={onOpenIntakeModal}
              className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{isTeacher ? 'Enroll' : 'Intake'}</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
