import { useState } from 'react';
import { 
  Award, 
  Building2, 
  ShieldCheck, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  ExternalLink, 
  DoorOpen, 
  History,
  Send,
  AlertTriangle
} from 'lucide-react';
import { SchoolRoom, Student, AccessPermission, UserAccount } from '../../types/health';
import { resolveAccessPermission, getRoomsCatalog } from '../../services/roomStorage';

interface Props {
  currentUser: UserAccount;
  currentRoom: SchoolRoom;
  students: Student[];
  permissions: AccessPermission[];
  onOpenVerificationModal: (perm: AccessPermission) => void;
  onOpenAuditMemory: () => void;
  onRefresh: () => void;
}

export function DistrictAuthorityPortal({
  currentUser,
  currentRoom,
  students,
  permissions,
  onOpenVerificationModal,
  onOpenAuditMemory,
  onRefresh,
}: Props) {
  const [activeTab, setActiveTab] = useState<'requests' | 'district_rooms'>('requests');
  const catalog = getRoomsCatalog();

  const crossSchoolRequests = permissions.filter((p) => p.type === 'cross_school');
  const pendingRequests = crossSchoolRequests.filter((p) => p.status === 'pending');

  const handleDecision = (permission: AccessPermission, decision: 'approved' | 'rejected') => {
    resolveAccessPermission(
      currentRoom.roomCode,
      permission.id,
      decision,
      currentUser.name || 'District Safety Authority',
      'district_auth'
    );
    onRefresh();
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* 1. Header Banner */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-800 bg-indigo-50 px-2.5 py-0.5 rounded-md border border-indigo-200">
              District Safety & Compliance Authority
            </span>
            <span className="text-xs text-slate-500 font-medium">
              Regional Multi-School Perimeter Oversight
            </span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 mt-1">
            {currentRoom.districtName} Oversight Council
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Superintendent Authorization: <span className="font-semibold text-slate-700">{currentUser.name}</span> · Active School:{' '}
            <strong className="text-slate-800">{currentRoom.schoolName}</strong> ({currentRoom.roomCode})
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenAuditMemory}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-all border border-slate-200 flex items-center gap-1.5 shadow-xs"
          >
            <History className="w-3.5 h-3.5 text-slate-600" />
            <span>District Audit Memory</span>
          </button>
        </div>
      </div>

      {/* 2. Key Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">District Schools</p>
          <p className="text-2xl font-extrabold text-slate-900 mt-1 font-mono tabular-nums">
            {catalog.length || 1}
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">Isolated school rooms</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-indigo-200 shadow-xs bg-indigo-50/20">
          <p className="text-[11px] font-bold uppercase tracking-wider text-indigo-800">Pending Inter-School Requests</p>
          <p className="text-2xl font-extrabold text-indigo-800 mt-1 font-mono tabular-nums">
            {pendingRequests.length}
          </p>
          <p className="text-[11px] text-indigo-700/80 mt-0.5">Requires District Auth link</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Active School Students</p>
          <p className="text-2xl font-extrabold text-slate-900 mt-1 font-mono tabular-nums">
            {students.length}
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">In {currentRoom.schoolName}</p>
        </div>
      </div>

      {/* 3. Navigation Tabs */}
      <div className="flex border-b border-slate-200 gap-8 text-sm font-semibold">
        <button
          onClick={() => setActiveTab('requests')}
          className={`pb-3 border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'requests'
              ? 'border-indigo-600 text-indigo-800 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Cross-School Access Requests</span>
          {pendingRequests.length > 0 && (
            <span className="text-[11px] font-bold bg-indigo-600 text-white px-2 py-0.2 rounded-full font-mono">
              {pendingRequests.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('district_rooms')}
          className={`pb-3 border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'district_rooms'
              ? 'border-indigo-600 text-indigo-800 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>District School Rooms ({catalog.length})</span>
        </button>
      </div>

      {/* Tab 1: Cross-School Requests */}
      {activeTab === 'requests' && (
        <div className="space-y-4">
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs text-slate-600 flex items-start gap-3">
            <Award className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
            <p>
              Under FERPA and state health regulations, no school can view records from another school without explicit approval from the District Authority. When medical transfers, athletics, or district events occur, requests must be verified here or via the official email link.
            </p>
          </div>

          {crossSchoolRequests.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center text-slate-400">
              <ShieldCheck className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p className="text-xs font-semibold">No cross-school requests filed yet.</p>
              <p className="text-[11px] text-slate-400 mt-1">
                When a school nurse or principal requests external school health access, tickets appear here.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {crossSchoolRequests.map((perm) => (
                <div
                  key={perm.id}
                  className={`p-4 rounded-xl border transition-all ${
                    perm.status === 'pending'
                      ? 'bg-white border-amber-300 shadow-xs'
                      : perm.status === 'approved'
                      ? 'bg-emerald-50/50 border-emerald-200'
                      : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900">{perm.requesterName}</span>
                        <span className="text-[11px] text-slate-500">({perm.requesterRole})</span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                            perm.status === 'pending'
                              ? 'bg-amber-100 text-amber-800'
                              : perm.status === 'approved'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-slate-200 text-slate-600'
                          }`}
                        >
                          {perm.status.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-xs text-slate-700 mt-1">
                        Requesting Cross-School Access to:{' '}
                        <strong className="text-slate-900">{perm.targetSchoolName || 'Partner School'}</strong>
                      </p>
                      <p className="text-xs text-slate-600 mt-0.5 italic">
                        &ldquo;{perm.reason}&rdquo;
                      </p>
                    </div>

                    <div className="text-right text-[11px] text-slate-400 font-mono">
                      <span>{new Date(perm.requestedAt).toLocaleTimeString()}</span>
                    </div>
                  </div>

                  <div className="pt-3 mt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                    <button
                      onClick={() => onOpenVerificationModal(perm)}
                      className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Simulate Official District Email Link</span>
                    </button>

                    {perm.status === 'pending' && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleDecision(perm, 'rejected')}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-700 border border-slate-200 text-xs font-bold rounded-lg transition-colors flex items-center gap-1"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Deny</span>
                        </button>
                        <button
                          onClick={() => handleDecision(perm, 'approved')}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition-colors shadow-xs flex items-center gap-1"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Approve Access (Yes)</span>
                        </button>
                      </div>
                    )}

                    {perm.status === 'approved' && (
                      <span className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Approved by {perm.decidedBy || 'District Authority'} · Real-time access granted
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: District School Rooms */}
      {activeTab === 'district_rooms' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
          <h3 className="text-sm font-bold text-slate-900 mb-2">Member Schools in this District</h3>
          <div className="space-y-2">
            {catalog.map((r) => (
              <div
                key={r.roomCode}
                className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between"
              >
                <div>
                  <p className="text-xs font-bold text-slate-900">{r.schoolName}</p>
                  <p className="text-[11px] text-slate-500">
                    Principal: {r.principalName} ({r.principalEmail}) · Code:{' '}
                    <span className="font-mono font-semibold text-slate-700">{r.roomCode}</span>
                  </p>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                  ISOLATED VAULT ACTIVE
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
