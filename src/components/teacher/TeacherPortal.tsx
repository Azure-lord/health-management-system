import { useState } from 'react';
import { Student, UserAccount, School, HealthUpdate, SchoolRoom, AccessPermission } from '../../types/health';
import { 
  Users, 
  Search, 
  AlertTriangle, 
  ShieldCheck, 
  CheckCheck, 
  Phone, 
  Clock, 
  Filter, 
  FileText,
  Plus,
  Printer,
  X,
  Lock,
  ExternalLink,
  CheckCircle2,
  Send,
  Trash2
} from 'lucide-react';
import { EmergencyCardModal } from '../common/EmergencyCardModal';

interface Props {
  currentUser: UserAccount;
  students: Student[];
  schools?: School[];
  room?: SchoolRoom | null;
  permissions?: AccessPermission[];
  onRequestPermission?: (targetClassId: string, targetClassName: string, reason: string) => void;
  onAcknowledgeUpdate: (studentId: string, updateId: string) => void;
  onOpenIntakeModal: () => void;
  onAddStudent?: (newStudent: Student) => void;
  onDeleteStudent?: (studentId: string) => void;
}

export function TeacherPortal({
  currentUser,
  students,
  room,
  permissions = [],
  onRequestPermission,
  onAcknowledgeUpdate,
  onOpenIntakeModal,
  onDeleteStudent,
}: Props) {
  const classes = room?.classes || [
    { id: 'cls-101', name: 'Room 101 - Grade 3', grade: 'Grade 3', leadTeacherName: currentUser.name },
    { id: 'cls-102', name: 'Room 102 - Grade 4', grade: 'Grade 4', leadTeacherName: 'Classroom Lead 4' },
    { id: 'cls-201', name: 'Room 201 - Grade 5', grade: 'Grade 5', leadTeacherName: 'Classroom Lead 5' },
  ];

  // Default to assigned class or first class
  const assignedClassId = currentUser.assignedClassId || classes[0]?.id || 'cls-101';
  const [selectedClassId, setSelectedClassId] = useState<string>(assignedClassId);
  const [activeTab, setActiveTab] = useState<'roster' | 'notices'>('roster');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSeverity, setFilterSeverity] = useState<'all' | 'severe' | 'dietary'>('all');
  const [selectedStudentForEmergency, setSelectedStudentForEmergency] = useState<Student | null>(null);
  const [showPrintRoster, setShowPrintRoster] = useState(false);

  // Permission Request Form state
  const [permissionReason, setPermissionReason] = useState('Substitute supervision & afternoon recess duty');
  const [isSubmittingReq, setIsSubmittingReq] = useState(false);

  const selectedClass = classes.find((c) => c.id === selectedClassId) || classes[0];
  const isMyAssignedClass = selectedClassId === assignedClassId;

  // Check if permission has been approved by Principal for this other class
  const classPermission = permissions.find(
    (p) =>
      p.type === 'class_to_class' &&
      p.targetClassId === selectedClassId &&
      (p.requesterId === currentUser.id || p.requesterEmail === currentUser.email)
  );

  const hasAccessToSelectedClass = isMyAssignedClass || classPermission?.status === 'approved';

  // Filter students for the selected class
  // If student has classId, match it; if student has no classId yet, assign to first class
  const classroomStudents = students.filter((s) => {
    if (!hasAccessToSelectedClass) return false;
    if (s.classId) return s.classId === selectedClassId;
    return selectedClassId === classes[0]?.id;
  });

  const filteredStudents = classroomStudents.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.allergies.some((a) => a.name.toLowerCase().includes(searchQuery.toLowerCase()));
    if (!matchesSearch) return false;
    if (filterSeverity === 'severe') {
      return s.allergies.some((a) => a.severity.includes('Severe'));
    }
    if (filterSeverity === 'dietary') {
      return s.dietaryRestrictions.length > 0;
    }
    return true;
  });

  // Compile daily notices for this classroom
  const classroomNotices: Array<{ student: Student; update: HealthUpdate }> = [];
  classroomStudents.forEach((stu) => {
    stu.recentUpdates.forEach((upd) => {
      classroomNotices.push({ student: stu, update: upd });
    });
  });

  const pendingNoticesCount = classroomNotices.filter((n) => !n.update.acknowledgedByTeacher).length;

  const handleSendPermissionRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!permissionReason.trim()) return;
    setIsSubmittingReq(true);
    if (onRequestPermission) {
      onRequestPermission(selectedClass.id, selectedClass.name, permissionReason);
    }
    setIsSubmittingReq(false);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* 1. Header Banner */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-md border border-blue-200">
              Teacher Roster · {currentUser.name}
            </span>
            <span className="text-xs text-slate-500 font-medium">
              Classroom Health & Allergy Perimeters
            </span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 mt-1">
            Classroom Emergency Action & Health Protocols
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Isolated classroom rosters. Cross-classroom observation requires Principal verification link approval.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {classroomStudents.length > 0 && hasAccessToSelectedClass && (
            <button
              onClick={() => setShowPrintRoster(true)}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-all border border-slate-200 flex items-center gap-1.5 shadow-xs"
              title="Print classroom allergy sheet for substitute teachers, lunch staff, or field trips"
            >
              <Printer className="w-3.5 h-3.5 text-slate-600" />
              <span>Print Allergy Sheet</span>
            </button>
          )}

          <button
            onClick={onOpenIntakeModal}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            + Enroll Student to Class
          </button>
        </div>
      </div>

      {/* 2. Classroom Selector & Perimeter Bar */}
      <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Classroom:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {classes.map((cls) => {
                const isSelected = cls.id === selectedClassId;
                const isAssigned = cls.id === assignedClassId;
                const isPermitted =
                  isAssigned ||
                  permissions.some(
                    (p) =>
                      p.targetClassId === cls.id &&
                      p.status === 'approved' &&
                      (p.requesterId === currentUser.id || p.requesterEmail === currentUser.email)
                  );

                return (
                  <button
                    key={cls.id}
                    onClick={() => setSelectedClassId(cls.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-rose-600 text-white shadow-xs'
                        : isPermitted
                        ? 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                        : 'bg-slate-100/70 hover:bg-slate-200 text-slate-500'
                    }`}
                  >
                    {!isPermitted && <Lock className="w-3 h-3 text-slate-400" />}
                    <span>{cls.name}</span>
                    {isAssigned && (
                      <span className={`text-[10px] px-1 rounded ${isSelected ? 'bg-rose-700 text-rose-100' : 'bg-slate-200 text-slate-600'}`}>
                        My Class
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Access Status Badge */}
          <div>
            {hasAccessToSelectedClass ? (
              <span className="inline-flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md font-semibold border border-emerald-200">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                {isMyAssignedClass ? 'Primary Classroom Access' : 'Principal Approved Access'}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-xs text-amber-800 bg-amber-50 px-2.5 py-1 rounded-md font-semibold border border-amber-200">
                <Lock className="w-3.5 h-3.5 text-amber-600" />
                {classPermission?.status === 'pending' ? 'Principal Verification Pending' : 'Access Restricted'}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 3. Access Restricted Gate (Shown when teacher clicks another class without approval) */}
      {!hasAccessToSelectedClass && (
        <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center max-w-2xl mx-auto shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 mx-auto flex items-center justify-center mb-4">
            <Lock className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-slate-900">
            Classroom Privacy Perimeter: {selectedClass.name}
          </h2>
          <p className="text-xs text-slate-600 max-w-md mx-auto mt-2 leading-relaxed">
            In compliance with student health privacy standards, teachers can only view medical alerts in their assigned classroom. Access to observe {selectedClass.name} requires explicit permission from the School Principal.
          </p>

          {classPermission?.status === 'pending' ? (
            <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-xl text-left max-w-md mx-auto space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-amber-900">
                <span className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-amber-600" />
                  Approval Request Dispatched
                </span>
                <span className="text-[10px] font-mono bg-amber-100 text-amber-800 px-2 py-0.5 rounded-md">
                  PENDING PRINCIPAL
                </span>
              </div>
              <p className="text-xs text-amber-800">
                An authorization request was dispatched to Principal {room?.principalName || 'Office'} ({room?.principalEmail || 'school.edu'}).
              </p>
              <div className="p-2.5 bg-amber-100/70 rounded-lg text-amber-900 text-xs font-medium flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-700 shrink-0" />
                <span>Awaiting Principal authorization. This classroom will unlock automatically upon approval.</span>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSendPermissionRequest} className="mt-6 max-w-md mx-auto text-left space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Reason for Access (Sent to Principal) *
                </label>
                <input
                  type="text"
                  required
                  value={permissionReason}
                  onChange={(e) => setPermissionReason(e.target.value)}
                  placeholder="e.g. Substitute coverage, recess supervision, or combined field trip"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmittingReq}
                className="w-full py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl transition-colors shadow-xs flex items-center justify-center gap-2"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Submit Permission Request to Principal</span>
              </button>
            </form>
          )}
        </div>
      )}

      {/* 4. Navigation Tabs & Content (Shown when access is granted) */}
      {hasAccessToSelectedClass && (
        <>
          <div className="flex border-b border-slate-200 gap-8 text-sm font-semibold">
            <button
              onClick={() => setActiveTab('roster')}
              className={`pb-3 border-b-2 transition-all flex items-center gap-2 ${
                activeTab === 'roster'
                  ? 'border-rose-600 text-rose-700 font-bold'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>{selectedClass.name} Students ({classroomStudents.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('notices')}
              className={`pb-3 border-b-2 transition-all flex items-center gap-2 ${
                activeTab === 'notices'
                  ? 'border-rose-600 text-rose-700 font-bold'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Clock className="w-4 h-4" />
              <span>Morning Health Notices</span>
              {pendingNoticesCount > 0 && (
                <span className="text-[11px] font-bold bg-rose-600 text-white px-2 py-0.2 rounded-full font-mono">
                  {pendingNoticesCount} new
                </span>
              )}
            </button>
          </div>

          {/* Tab 1: Roster */}
          {activeTab === 'roster' && (
            <div className="space-y-4">
              {/* Search & Filter Bar */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search students by name or specific allergen..."
                    className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-rose-500 shadow-2xs"
                  />
                </div>

                <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl">
                  <button
                    onClick={() => setFilterSeverity('all')}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                      filterSeverity === 'all'
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    All ({classroomStudents.length})
                  </button>
                  <button
                    onClick={() => setFilterSeverity('severe')}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                      filterSeverity === 'severe'
                        ? 'bg-white text-rose-700 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Severe / EpiPen
                  </button>
                  <button
                    onClick={() => setFilterSeverity('dietary')}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                      filterSeverity === 'dietary'
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Dietary Restrictions
                  </button>
                </div>
              </div>

              {/* Student Cards Grid */}
              {filteredStudents.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-500">
                  <p className="text-xs">
                    {classroomStudents.length === 0
                      ? `No students enrolled in ${selectedClass.name} yet.`
                      : 'No student matches your search or filter.'}
                  </p>
                  {classroomStudents.length === 0 && (
                    <button
                      onClick={onOpenIntakeModal}
                      className="mt-3 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
                    >
                      + Enroll First Student in this Classroom
                    </button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredStudents.map((stu) => {
                    const hasSevereAllergy = stu.allergies.some((a) => a.severity.includes('Severe'));
                    const hasEpiPen = stu.allergies.some((a) => a.hasEpiPen);

                    return (
                      <div
                        key={stu.id}
                        className={`bg-white rounded-2xl p-5 border transition-all ${
                          hasSevereAllergy
                            ? 'border-rose-300 shadow-xs ring-1 ring-rose-200'
                            : 'border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="text-base font-bold text-slate-900">{stu.name}</h3>
                              <span className="text-xs font-semibold text-slate-500">
                                {stu.grade}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-400">
                              Parent: {stu.parentName} · {stu.parentPhone}
                            </p>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => setSelectedStudentForEmergency(stu)}
                              className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors"
                            >
                              <AlertTriangle className="w-3.5 h-3.5" />
                              <span>Action Card</span>
                            </button>
                            {onDeleteStudent && (
                              <button
                                type="button"
                                onClick={() => onDeleteStudent(stu.id)}
                                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors border border-transparent hover:border-rose-200"
                                title={`Delete ${stu.name}'s record`}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Allergies list */}
                        <div className="space-y-1.5 mb-3">
                          {stu.allergies.map((alg) => (
                            <div
                              key={alg.id}
                              className="p-2 bg-slate-50 rounded-lg border border-slate-100 flex items-start justify-between gap-2 text-xs"
                            >
                              <div>
                                <span className="font-bold text-slate-800">{alg.name}</span>
                                <p className="text-[11px] text-slate-500 mt-0.5">{alg.reaction}</p>
                              </div>
                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                                  alg.severity.includes('Severe')
                                    ? 'bg-rose-100 text-rose-800'
                                    : 'bg-amber-100 text-amber-800'
                                }`}
                              >
                                {alg.severity}
                              </span>
                            </div>
                          ))}
                        </div>

                        {/* EpiPen indicator */}
                        {hasEpiPen && (
                          <div className="p-2 bg-rose-50 border border-rose-200 rounded-lg text-xs font-bold text-rose-800 flex items-center gap-1.5">
                            <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                            <span>EpiPen Prescribed & On File</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Tab 2: Morning Health Notices */}
          {activeTab === 'notices' && (
            <div className="space-y-3">
              {classroomNotices.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-400">
                  <Clock className="w-8 h-8 mx-auto mb-2 opacity-40" />
                  <p className="text-xs">No morning health notices posted for this classroom.</p>
                </div>
              ) : (
                classroomNotices.map(({ student, update }) => (
                  <div
                    key={update.id}
                    className={`p-4 rounded-xl border transition-all ${
                      update.acknowledgedByTeacher
                        ? 'bg-white border-slate-200'
                        : 'bg-rose-50/50 border-rose-200 shadow-xs'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-900">{student.name}</span>
                          <span className="text-[11px] text-slate-500 font-mono">
                            {new Date(update.date).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-xs text-slate-700 mt-1">{update.content}</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">Author: {update.author}</p>
                      </div>

                      {!update.acknowledgedByTeacher ? (
                        <button
                          onClick={() => onAcknowledgeUpdate(student.id, update.id)}
                          className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold transition-colors shadow-xs"
                        >
                          Acknowledge
                        </button>
                      ) : (
                        <span className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
                          <CheckCheck className="w-3.5 h-3.5" />
                          Acknowledged
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </>
      )}

      {/* Emergency Card Modal */}
      {selectedStudentForEmergency && (
        <EmergencyCardModal
          student={selectedStudentForEmergency}
          onClose={() => setSelectedStudentForEmergency(null)}
        />
      )}
    </div>
  );
}
