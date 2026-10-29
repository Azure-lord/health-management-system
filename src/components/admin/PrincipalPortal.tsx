import { useState } from 'react';
import { 
  Building2, 
  ShieldCheck, 
  Users, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  DoorOpen, 
  FileText, 
  HeartPulse, 
  ChevronRight,
  History,
  Lock,
  Plus
} from 'lucide-react';
import { SchoolRoom, Student, AccessPermission, HealthUpdate, UserAccount } from '../../types/health';
import { grantSubRoomAccessInApp, addClassroomToSchool } from '../../services/roomStorage';

interface Props {
  currentUser: UserAccount;
  room: SchoolRoom;
  students: Student[];
  permissions: AccessPermission[];
  onOpenAuditMemory: () => void;
  onRefresh: () => void;
  onEnterSubRoom?: (classId: string) => void;
}

export function PrincipalPortal({
  currentUser,
  room,
  students,
  permissions,
  onOpenAuditMemory,
  onRefresh,
  onEnterSubRoom,
}: Props) {
  const [activeTab, setActiveTab] = useState<'approvals' | 'subrooms' | 'notices'>('approvals');
  const [isAddClassModalOpen, setIsAddClassModalOpen] = useState(false);
  const [newClassName, setNewClassName] = useState('');
  const [newClassGrade, setNewClassGrade] = useState('');
  const [newClassSection, setNewClassSection] = useState('Section A');
  const [newClassTeacher, setNewClassTeacher] = useState('');
  const [addClassError, setAddClassError] = useState('');

  // Filter requests for sub-room access or class-to-class observation
  const subRoomRequests = permissions.filter(
    (p) => p.type === 'subroom_access' || p.type === 'class_to_class'
  );
  const pendingRequests = subRoomRequests.filter((p) => p.status === 'pending');

  const severeCount = students.filter((s) => s.allergies.some((a) => a.severity.includes('Severe'))).length;
  const epipenCount = students.filter((s) => s.allergies.some((a) => a.hasEpiPen)).length;

  const handleDecision = (permission: AccessPermission, decision: 'approved' | 'rejected') => {
    grantSubRoomAccessInApp(room.roomCode, permission.id, decision, currentUser);
    onRefresh();
  };

  const handleAddClassSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAddClassError('');

    if (!newClassName.trim()) {
      setAddClassError('Please enter a classroom sub-room name.');
      return;
    }

    const res = addClassroomToSchool(
      room.roomCode,
      {
        name: newClassName.trim(),
        grade: newClassGrade.trim() || 'General',
        section: newClassSection.trim() || 'Section A',
        leadTeacherName: newClassTeacher.trim() || 'Assigned Faculty',
      },
      currentUser
    );

    if (res.success) {
      setNewClassName('');
      setNewClassGrade('');
      setNewClassSection('Section A');
      setNewClassTeacher('');
      setIsAddClassModalOpen(false);
      onRefresh();
    } else {
      setAddClassError(res.message || 'Failed to add classroom.');
    }
  };

  // Compile all morning health notices across all school classes
  const allNotices: Array<{ student: Student; update: HealthUpdate }> = [];
  students.forEach((stu) => {
    stu.recentUpdates.forEach((upd) => {
      allNotices.push({ student: stu, update: upd });
    });
  });

  const canAddClasses = currentUser.role === 'principal' || currentUser.role === 'it_admin';

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* 1. Header Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-md border border-amber-200">
              {currentUser.role === 'it_admin' ? 'School IT Administration' : 'Principal Executive Office'} · {currentUser.name}
            </span>
            <span className="text-xs text-slate-500 font-medium">
              Classroom Sub-Rooms & Authorization Console
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 mt-1">
            {room.schoolName} Administration Hub
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            District: {room.districtName} · Room Code: <span className="font-mono font-bold text-slate-700">{room.roomCode}</span>
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {canAddClasses && (
            <button
              onClick={() => setIsAddClassModalOpen(true)}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Classroom Sub-Room</span>
            </button>
          )}

          <button
            onClick={onOpenAuditMemory}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-all border border-slate-200 flex items-center gap-1.5 shadow-xs"
          >
            <History className="w-3.5 h-3.5 text-slate-600" />
            <span>Audit Memory</span>
          </button>
        </div>
      </div>

      {/* 2. Key Metrics Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="text-[11px] font-semibold text-slate-500">Classroom Sub-Rooms</div>
          <div className="text-2xl font-extrabold text-slate-900 mt-0.5 font-mono">
            {room.classes.length}
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="text-[11px] font-semibold text-slate-500">Enrolled Students</div>
          <div className="text-2xl font-extrabold text-slate-900 mt-0.5 font-mono">
            {students.length}
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="text-[11px] font-semibold text-rose-600">Severe Allergy Cases</div>
          <div className="text-2xl font-extrabold text-rose-600 mt-0.5 font-mono">
            {severeCount}
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="text-[11px] font-semibold text-amber-700">Sub-Room Pending Auth</div>
          <div className="text-2xl font-extrabold text-amber-700 mt-0.5 font-mono">
            {pendingRequests.length}
          </div>
        </div>
      </div>

      {/* 3. Navigation Tabs */}
      <div className="flex border-b border-slate-200 gap-6 text-sm font-semibold">
        <button
          onClick={() => setActiveTab('approvals')}
          className={`pb-3 border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'approvals'
              ? 'border-amber-600 text-amber-900'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Sub-Room In-App Approvals</span>
          {pendingRequests.length > 0 && (
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-rose-600 text-white font-mono font-bold">
              {pendingRequests.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('subrooms')}
          className={`pb-3 border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'subrooms'
              ? 'border-amber-600 text-amber-900'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <DoorOpen className="w-4 h-4" />
          <span>Classroom Sub-Rooms ({room.classes.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('notices')}
          className={`pb-3 border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'notices'
              ? 'border-amber-600 text-amber-900'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <HeartPulse className="w-4 h-4" />
          <span>Morning Health Notices ({allNotices.length})</span>
        </button>
      </div>

      {/* 4. Tab 1: In-App Sub-Room Approvals Queue */}
      {activeTab === 'approvals' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Classroom Sub-Room Authorization Queue
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Review and approve faculty requests to enter classroom sub-rooms and view student health files.
              </p>
            </div>
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
              {pendingRequests.length} Pending Actions
            </span>
          </div>

          {subRoomRequests.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <ShieldCheck className="w-10 h-10 mx-auto text-slate-300 mb-2" />
              <p className="text-xs">No sub-room access requests logged for this school.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {subRoomRequests.map((req) => (
                <div
                  key={req.id}
                  className={`p-4 rounded-xl border transition-all ${
                    req.status === 'pending'
                      ? 'bg-amber-50/50 border-amber-200 shadow-xs'
                      : 'bg-slate-50/70 border-slate-200 opacity-90'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900">
                          {req.requesterName}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-200 text-slate-700 uppercase font-semibold">
                          {req.requesterRole.replace('_', ' ')}
                        </span>
                        <span className="text-xs text-slate-400">requests access to:</span>
                        <span className="text-xs font-bold text-slate-800 bg-white px-2 py-0.5 rounded border border-slate-200">
                          {req.targetClassName || 'Classroom Sub-Room'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mt-1 italic">
                        &ldquo;{req.reason}&rdquo;
                      </p>
                      <span className="text-[11px] text-slate-400 font-mono mt-1 block">
                        Requested: {new Date(req.requestedAt).toLocaleString()}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                      {req.status === 'pending' ? (
                        <>
                          <button
                            onClick={() => handleDecision(req, 'rejected')}
                            className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-xs font-bold transition-colors"
                          >
                            Reject
                          </button>
                          <button
                            onClick={() => handleDecision(req, 'approved')}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors shadow-xs flex items-center gap-1.5"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Grant Access</span>
                          </button>
                        </>
                      ) : (
                        <span
                          className={`text-xs font-bold px-2.5 py-1 rounded-xl flex items-center gap-1.5 ${
                            req.status === 'approved'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-slate-200 text-slate-600'
                          }`}
                        >
                          {req.status === 'approved' ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                          <span className="capitalize">{req.status}</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 5. Tab 2: Classroom Sub-Rooms Directory */}
      {activeTab === 'subrooms' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Active Classroom Sub-Rooms ({room.classes.length})
            </h2>
            {canAddClasses && (
              <button
                onClick={() => setIsAddClassModalOpen(true)}
                className="text-xs text-indigo-600 font-bold hover:underline flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Add New Sub-Room
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {room.classes.map((cls) => {
              const classStudents = students.filter((s) => s.classId === cls.id || (!s.classId && cls.id === room.classes[0]?.id));
              const classSevere = classStudents.filter((s) => s.allergies.some((a) => a.severity.includes('Severe'))).length;

              return (
                <div
                  key={cls.id}
                  className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-all"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                        {cls.grade} {cls.section || ''}
                      </span>
                      <span className="text-xs font-bold text-slate-700 font-mono">
                        {classStudents.length} Students
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-slate-900">{cls.name}</h3>
                    <p className="text-xs text-slate-500 mt-1">
                      Faculty Lead: <strong className="text-slate-700">{cls.leadTeacherName}</strong>
                    </p>

                    {classSevere > 0 && (
                      <div className="mt-3 text-[11px] font-bold text-rose-700 bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-200 flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span>{classSevere} Severe Medical Alerts</span>
                      </div>
                    )}
                  </div>

                  <div className="pt-4 mt-3 border-t border-slate-100 flex items-center justify-end">
                    {onEnterSubRoom && (
                      <button
                        onClick={() => onEnterSubRoom(cls.id)}
                        className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1"
                      >
                        <span>Open Sub-Room</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 6. Tab 3: Morning Health Notices */}
      {activeTab === 'notices' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900">
            Daily Health Notices Stream
          </h2>

          {allNotices.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <Clock className="w-10 h-10 mx-auto text-slate-300 mb-2" />
              <p className="text-xs">No daily health notices posted across any classroom sub-rooms today.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {allNotices.map(({ student, update }) => (
                <div
                  key={update.id}
                  className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1.5"
                >
                  <div className="flex items-center justify-between font-bold text-slate-900">
                    <span>{student.name} ({student.grade}) · {student.className || 'Classroom'}</span>
                    <span className="font-mono text-[11px] text-slate-400">{new Date(update.date).toLocaleDateString()}</span>
                  </div>
                  <p className="text-slate-600">&ldquo;{update.content}&rdquo;</p>
                  <span className="text-[11px] text-slate-500 font-medium">Logged by {update.author}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 7. Add Classroom Sub-Room Modal (Principal & IT Admin Only) */}
      {isAddClassModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleAddClassSubmit}
            className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-2xl p-6 space-y-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">Add Classroom Sub-Room</h3>
                <p className="text-xs text-slate-500">Authorized as {currentUser.role === 'it_admin' ? 'School IT Admin' : 'School Principal'}</p>
              </div>
              <button
                type="button"
                onClick={() => setIsAddClassModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 text-xs font-bold"
              >
                ✕
              </button>
            </div>

            {addClassError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800">
                {addClassError}
              </div>
            )}

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Sub-Room Name *
                </label>
                <input
                  type="text"
                  required
                  value={newClassName}
                  onChange={(e) => setNewClassName(e.target.value)}
                  placeholder="e.g. Room 104 - Grade 3 or Kindergarten B"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Grade Level
                  </label>
                  <input
                    type="text"
                    value={newClassGrade}
                    onChange={(e) => setNewClassGrade(e.target.value)}
                    placeholder="e.g. Grade 3"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Section
                  </label>
                  <input
                    type="text"
                    value={newClassSection}
                    onChange={(e) => setNewClassSection(e.target.value)}
                    placeholder="e.g. Section A"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Lead Teacher Name *
                </label>
                <input
                  type="text"
                  required
                  value={newClassTeacher}
                  onChange={(e) => setNewClassTeacher(e.target.value)}
                  placeholder="e.g. Ms. Sarah Jenkins"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsAddClassModalOpen(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create Classroom Sub-Room</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
