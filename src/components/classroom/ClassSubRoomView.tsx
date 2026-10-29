import { useState } from 'react';
import { 
  Users, 
  ArrowLeft, 
  Search, 
  AlertTriangle, 
  ShieldCheck, 
  Lock, 
  Clock, 
  Send, 
  CheckCircle2, 
  FileText, 
  Phone, 
  Plus, 
  DoorOpen,
  Filter
} from 'lucide-react';
import { Classroom, SchoolRoom, Student, UserAccount, AccessPermission, HealthUpdate } from '../../types/health';
import { checkUserSubRoomAccess, requestSubRoomAccessInApp } from '../../services/roomStorage';
import { EmergencyCardModal } from '../common/EmergencyCardModal';

interface Props {
  classroom: Classroom;
  room: SchoolRoom;
  currentUser: UserAccount;
  students: Student[];
  permissions: AccessPermission[];
  onBackToSchool: () => void;
  onRefreshPermissions: () => void;
  onOpenIntakeModal?: () => void;
  onAcknowledgeUpdate?: (studentId: string, updateId: string) => void;
}

export function ClassSubRoomView({
  classroom,
  room,
  currentUser,
  students,
  permissions,
  onBackToSchool,
  onRefreshPermissions,
  onOpenIntakeModal,
  onAcknowledgeUpdate,
}: Props) {
  const [subRoomSearch, setSubRoomSearch] = useState('');
  const [filterSeverity, setFilterSeverity] = useState<'all' | 'severe' | 'epipen'>('all');
  const [selectedStudentForCard, setSelectedStudentForCard] = useState<Student | null>(null);
  const [accessReason, setAccessReason] = useState('Cross-classroom substitution and recess observation');
  const [isSubmittingAuth, setIsSubmittingAuth] = useState(false);
  const [authSuccessMsg, setAuthSuccessMsg] = useState('');

  // 1. Check Sub-Room Authorization Guard
  const accessCheck = checkUserSubRoomAccess(room, classroom.id, currentUser, permissions);

  // 2. Filter students enrolled strictly in this class sub-room
  const subRoomStudents = students.filter((s) => {
    if (s.classId) return s.classId === classroom.id;
    // Fallback match by name
    return s.className?.toLowerCase() === classroom.name.toLowerCase();
  });

  // 3. Sub-Room Scoped Search: Strictly searches within this sub-room
  const filteredStudents = subRoomStudents.filter((s) => {
    const q = subRoomSearch.trim().toLowerCase();
    const matchesSearch = !q ||
      s.name.toLowerCase().includes(q) ||
      s.allergies.some((a) => a.name.toLowerCase().includes(q) || a.triggers.toLowerCase().includes(q));
    if (!matchesSearch) return false;

    if (filterSeverity === 'severe') {
      return s.allergies.some((a) => a.severity.includes('Severe'));
    }
    if (filterSeverity === 'epipen') {
      return s.allergies.some((a) => a.hasEpiPen);
    }
    return true;
  });

  const handleRequestAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessReason.trim()) return;

    setIsSubmittingAuth(true);
    requestSubRoomAccessInApp({
      roomCode: room.roomCode,
      classId: classroom.id,
      className: classroom.name,
      requester: currentUser,
      reason: accessReason.trim(),
    });
    setIsSubmittingAuth(false);
    setAuthSuccessMsg('Authorization request dispatched to School Principal. Once approved in-app, this sub-room unlocks immediately.');
    onRefreshPermissions();
  };

  // If user does NOT have permission, render privacy barrier
  if (!accessCheck.hasAccess) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 space-y-6">
        <button
          onClick={onBackToSchool}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to {room.schoolName}</span>
        </button>

        <div className="bg-white rounded-3xl border border-slate-200 p-8 text-center shadow-xs space-y-6">
          <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-700 mx-auto flex items-center justify-center">
            <Lock className="w-7 h-7" />
          </div>

          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200 text-xs font-mono font-bold mb-2">
              Classroom Sub-Room · {classroom.grade} {classroom.section || ''}
            </div>
            <h1 className="text-xl font-bold text-slate-900">
              Access Restricted: {classroom.name}
            </h1>
            <p className="text-xs text-slate-500 mt-2 max-w-md mx-auto leading-relaxed">
              In accordance with health privacy regulations, each classroom operates as an isolated sub-room. Only the assigned faculty lead, School Principal, or staff with in-app Principal authorization can view this sub-room&apos;s medical protocols.
            </p>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-left text-xs space-y-1.5">
            <div className="text-slate-500">Facility: <strong className="text-slate-800">{room.schoolName} ({room.roomCode})</strong></div>
            <div className="text-slate-500">Lead Faculty: <strong className="text-slate-800">{classroom.leadTeacherName}</strong></div>
            <div className="text-slate-500">School Principal: <strong className="text-slate-800">{room.principalName}</strong></div>
          </div>

          {authSuccessMsg ? (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs font-bold text-emerald-800 flex items-center gap-2 text-left">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{authSuccessMsg}</span>
            </div>
          ) : accessCheck.canRequest ? (
            <form onSubmit={handleRequestAuthSubmit} className="space-y-3 text-left">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Reason for Sub-Room Access (Dispatched to Principal) *
                </label>
                <input
                  type="text"
                  required
                  value={accessReason}
                  onChange={(e) => setAccessReason(e.target.value)}
                  placeholder="e.g. Afternoon recess duty, medical review, or substitute coverage"
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 font-medium"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmittingAuth}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Submit Authorization Request to Principal</span>
              </button>
            </form>
          ) : (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-800 text-left flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-600 shrink-0" />
              <span>{accessCheck.reason}</span>
            </div>
          )}
        </div>
      </div>
    );
  }

  // User has full access to this Sub-Room
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* 1. Classroom Sub-Room Header */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <button
            onClick={onBackToSchool}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-indigo-600 mb-2 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to {room.schoolName} Workspace</span>
          </button>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200">
              Classroom Sub-Room · {classroom.grade} {classroom.section || ''}
            </span>
            <span className="text-xs text-slate-400">·</span>
            <span className="text-xs font-semibold text-slate-500">
              Facility: {room.schoolName} ({room.roomCode})
            </span>
          </div>

          <h1 className="text-2xl font-extrabold text-slate-900 mt-1">
            {classroom.name}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Faculty Lead: <strong className="text-slate-800">{classroom.leadTeacherName}</strong> · Authorized Access: <span className="text-emerald-700 font-semibold">{accessCheck.reason}</span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          {onOpenIntakeModal && (
            <button
              onClick={onOpenIntakeModal}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Enroll Student in this Sub-Room</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. Sub-Room Scoped Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={subRoomSearch}
            onChange={(e) => setSubRoomSearch(e.target.value)}
            placeholder={`Search strictly within ${classroom.name} by student name, allergy, or trigger...`}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 placeholder:text-slate-400"
          />
        </div>

        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl shrink-0">
          <button
            onClick={() => setFilterSeverity('all')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              filterSeverity === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All ({subRoomStudents.length})
          </button>
          <button
            onClick={() => setFilterSeverity('severe')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              filterSeverity === 'severe' ? 'bg-white text-rose-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Severe Allergies
          </button>
          <button
            onClick={() => setFilterSeverity('epipen')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              filterSeverity === 'epipen' ? 'bg-white text-amber-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            EpiPen Active
          </button>
        </div>
      </div>

      {/* 3. Sub-Room Student Roster Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700">
            Enrolled Students in {classroom.name} ({filteredStudents.length})
          </h2>
          <span className="text-[11px] text-slate-400">
            Scoped to this Classroom Sub-Room
          </span>
        </div>

        {filteredStudents.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500">
            <Users className="w-10 h-10 mx-auto text-slate-300 mb-2" />
            <p className="text-xs font-semibold">
              {subRoomStudents.length === 0
                ? `No students currently assigned to ${classroom.name}.`
                : 'No student matches your sub-room search query.'}
            </p>
            {subRoomStudents.length === 0 && onOpenIntakeModal && (
              <button
                onClick={onOpenIntakeModal}
                className="mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold"
              >
                + Enroll First Student in this Sub-Room
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredStudents.map((stu) => {
              const hasSevere = stu.allergies.some((a) => a.severity.includes('Severe'));
              const hasEpiPen = stu.allergies.some((a) => a.hasEpiPen);

              return (
                <div
                  key={stu.id}
                  className={`bg-white rounded-2xl p-5 border transition-all ${
                    hasSevere ? 'border-rose-300 shadow-xs ring-1 ring-rose-200' : 'border-slate-200'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-bold text-slate-900">{stu.name}</h3>
                        <span className="text-xs font-semibold text-slate-500 font-mono">
                          {stu.bloodType}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500">
                        Parent: {stu.parentName} · {stu.parentPhone}
                      </p>
                    </div>

                    <button
                      onClick={() => setSelectedStudentForCard(stu)}
                      className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold flex items-center gap-1 transition-colors"
                    >
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>Action Card</span>
                    </button>
                  </div>

                  {/* Allergies list */}
                  <div className="space-y-1.5 mb-3">
                    {stu.allergies.map((alg) => (
                      <div
                        key={alg.id}
                        className="p-2 bg-slate-50 rounded-xl border border-slate-100 flex items-start justify-between gap-2 text-xs"
                      >
                        <div>
                          <span className="font-bold text-slate-800">{alg.name}</span>
                          <p className="text-[11px] text-slate-500">{alg.reaction}</p>
                        </div>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                            alg.severity.includes('Severe') ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {alg.severity}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* EpiPen indicator */}
                  {hasEpiPen && (
                    <div className="p-2 bg-rose-50 border border-rose-200 rounded-xl text-xs font-bold text-rose-800 flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                      <span>EpiPen Prescribed & Active in this Sub-Room</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 4. Action Card Modal */}
      {selectedStudentForCard && (
        <EmergencyCardModal
          student={selectedStudentForCard}
          onClose={() => setSelectedStudentForCard(null)}
        />
      )}
    </div>
  );
}
