import { useState } from 'react';
import { Student, HealthUpdate, UserAccount, School } from '../../types/health';
import { 
  BellRing, 
  Send, 
  CheckCheck, 
  Clock, 
  AlertCircle, 
  ShieldAlert, 
  Filter, 
  UserCheck,
  CheckCircle2,
  Building2,
  Stethoscope
} from 'lucide-react';

interface Props {
  students: Student[];
  onAddUpdate: (studentId: string, update: HealthUpdate) => void;
  onAcknowledgeUpdate: (studentId: string, updateId: string) => void;
  currentUser: UserAccount;
  schools: School[];
}

export function UpdatingScreen({
  students,
  onAddUpdate,
  onAcknowledgeUpdate,
  currentUser,
  schools,
}: Props) {
  const isTeacher = currentUser.role === 'teacher';
  const isParent = currentUser.role === 'parent';
  const isMedicalCenter = currentUser.role === 'medical_center';

  // Find linked student for parent or first available
  const activeParentStudent = students.find((s) => s.id === currentUser.linkedStudentId) || students[0];
  const activeStudentSchool = schools.find((sch) => sch.id === activeParentStudent?.schoolId);

  // Form state
  const [updateType, setUpdateType] = useState<HealthUpdate['type']>('daily_notice');
  const [updateContent, setUpdateContent] = useState('');
  const [tempEmergencyPhone, setTempEmergencyPhone] = useState('');
  const [isUrgent, setIsUrgent] = useState(false);
  const [postSuccess, setPostSuccess] = useState(false);

  // Target student for medical center notice dispatch
  const [targetStudentForStaff, setTargetStudentForStaff] = useState<string>(
    students[0]?.id || ''
  );

  // Filters for feed
  const [filterSchoolId, setFilterSchoolId] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStudentId, setFilterStudentId] = useState<string>('all');

  const handlePostUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!updateContent.trim()) return;

    const studentToUpdateId = isParent ? activeParentStudent.id : targetStudentForStaff;
    const authorString = isParent
      ? `${activeParentStudent.parentName} (Parent)`
      : isTeacher
      ? `${currentUser.name} (Teacher)`
      : `${currentUser.name} (Medical Center)`;

    const formattedContent = `${isUrgent ? '⚠️ [HIGH PRIORITY] ' : ''}${updateContent.trim()}${
      tempEmergencyPhone ? ` (Today's direct contact line: ${tempEmergencyPhone})` : ''
    }`;

    const newUpdate: HealthUpdate = {
      id: 'upd-' + Date.now(),
      date: `Today at ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
      author: authorString,
      authorRole: currentUser.role,
      type: updateType,
      content: formattedContent,
      acknowledgedByTeacher: false,
    };

    onAddUpdate(studentToUpdateId, newUpdate);
    setUpdateContent('');
    setTempEmergencyPhone('');
    setIsUrgent(false);
    setPostSuccess(true);
    setTimeout(() => setPostSuccess(false), 3000);
  };

  // Compile all updates matching permissions
  const allUpdatesList: Array<{ student: Student; update: HealthUpdate }> = [];

  students.forEach((student) => {
    // If parent: strictly their child's updates!
    if (isParent && student.id !== currentUser.linkedStudentId) {
      return;
    }
    // If teacher: strictly their school's updates!
    if (isTeacher && student.schoolId !== currentUser.schoolId) {
      return;
    }
    // Medical Center sees all

    student.recentUpdates.forEach((upd) => {
      allUpdatesList.push({ student, update: upd });
    });
  });

  // Apply filters
  const filteredUpdates = allUpdatesList.filter(({ student, update }) => {
    if (filterSchoolId !== 'all' && student.schoolId !== filterSchoolId) return false;
    if (filterStudentId !== 'all' && student.id !== filterStudentId) return false;
    if (filterType !== 'all' && update.type !== filterType) return false;
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="text-xs font-bold uppercase tracking-wider text-rose-600 flex items-center gap-1.5">
            <BellRing className="w-4 h-4" />
            Screen 3 · Daily Health Slips & Allergy Feeds
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 mt-1">
            {isParent ? `Daily Health Notice: ${activeParentStudent.name}` : 'District & Campus Daily Health Notices'}
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            {isParent
              ? `Submit instant morning symptom alerts, temporary medication notices, or allergy precautions for ${activeParentStudent.name}.`
              : isTeacher
              ? `Review morning parent slips for all students in your classroom and acknowledge receipt.`
              : `Clinical triage: Monitor morning health slips, emergency notes, and allergy alerts across all regional schools.`}
          </p>
        </div>
      </div>

      {postSuccess && (
        <div className="mt-4 p-3.5 bg-emerald-600 text-white rounded-xl flex items-center gap-2 text-xs font-bold shadow-md animate-in fade-in">
          <CheckCheck className="w-4 h-4" />
          Daily update dispatched! Classroom teachers and health officers have received the notice.
        </div>
      )}

      {/* Grid: Form on left + Feed on right */}
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Post Form or Guidance */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Send className="w-4 h-4 text-emerald-600" />
                  {isParent ? "Submit Today's Health Slip" : 'Dispatch Clinical / Teacher Notice'}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  {isParent ? (
                    <>For student: <strong className="text-slate-800">{activeParentStudent.name}</strong> ({activeStudentSchool?.code})</>
                  ) : (
                    'Record a health notice or clinical observation'
                  )}
                </p>
              </div>
            </div>

            <form onSubmit={handlePostUpdate} className="space-y-4">
              {/* If Medical Center or Teacher, choose student */}
              {!isParent && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Select Target Student
                  </label>
                  <select
                    value={targetStudentForStaff}
                    onChange={(e) => setTargetStudentForStaff(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl"
                  >
                    {students
                      .filter((s) => !isTeacher || s.schoolId === currentUser.schoolId)
                      .map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name} ({s.grade} · {schools.find((sch) => sch.id === s.schoolId)?.code})
                        </option>
                      ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Update Category
                </label>
                <select
                  value={updateType}
                  onChange={(e) => setUpdateType(e.target.value as HealthUpdate['type'])}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
                >
                  <option value="daily_notice">Morning Health Notice / Symptom Watch</option>
                  <option value="allergy">Allergy Precaution / Lunch Restriction</option>
                  <option value="medication">Temporary Medication Carried Today</option>
                  <option value="emergency_contact">Emergency Contact Temporary Override</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Notice Details *
                </label>
                <textarea
                  rows={4}
                  required
                  value={updateContent}
                  onChange={(e) => setUpdateContent(e.target.value)}
                  placeholder={
                    isParent
                      ? 'e.g. Maya is carrying her spare EpiPen in her front backpack pocket today. Recovering from mild cold. Please monitor during lunch.'
                      : 'Clinical guidance or classroom health observation notes...'
                  }
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-hidden focus:ring-1 focus:ring-emerald-500 leading-relaxed"
                />
              </div>

              {isParent && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Today&apos;s Direct Phone Line (Optional override)
                  </label>
                  <input
                    type="tel"
                    value={tempEmergencyPhone}
                    onChange={(e) => setTempEmergencyPhone(e.target.value)}
                    placeholder={activeParentStudent.parentPhone}
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-xl font-mono"
                  />
                </div>
              )}

              <div className="flex items-center gap-2 p-3 bg-rose-50 border border-rose-200 rounded-xl">
                <input
                  type="checkbox"
                  id="urgentNoticeCheck"
                  checked={isUrgent}
                  onChange={(e) => setIsUrgent(e.target.checked)}
                  className="text-rose-600 rounded focus:ring-rose-500"
                />
                <label htmlFor="urgentNoticeCheck" className="text-xs font-bold text-rose-800 cursor-pointer">
                  Flag as High Priority / Urgent Allergy Caution
                </label>
              </div>

              <button
                type="submit"
                disabled={!updateContent.trim()}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                Dispatch Health Notice
              </button>
            </form>
          </div>

          {/* Quick FAQ / Safety Reminder */}
          <div className="bg-slate-50 rounded-2xl border border-slate-200 p-4 text-xs space-y-2 text-slate-600">
            <div className="font-bold text-slate-800 flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
              Emergency Response Protocol
            </div>
            <p className="leading-relaxed text-[11px]">
              Daily notices notify faculty for cafeteria seating and recess monitoring. For acute anaphylaxis or respiratory collapse, immediately administer Epinephrine and dial 911.
            </p>
          </div>
        </div>

        {/* Right Column: Feed of Daily Notices */}
        <div className="lg:col-span-7 space-y-4">
          {/* Header & Filter Controls for Feed */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-slate-500" />
                <h3 className="text-sm font-bold text-slate-900">
                  {isParent ? `${activeParentStudent.name}'s Health Slips` : 'Active Campus Health Slips Feed'}
                </h3>
                <span className="text-xs text-slate-400 font-mono">({filteredUpdates.length})</span>
              </div>

              {/* Filters */}
              <div className="flex flex-wrap items-center gap-2">
                <Filter className="w-3.5 h-3.5 text-slate-400" />
                {isMedicalCenter && (
                  <select
                    value={filterSchoolId}
                    onChange={(e) => setFilterSchoolId(e.target.value)}
                    className="text-xs border border-slate-200 rounded-lg px-2 py-1 bg-white text-slate-700 font-medium"
                  >
                    <option value="all">All Schools</option>
                    {schools.map((sch) => (
                      <option key={sch.id} value={sch.id}>
                        {sch.code}
                      </option>
                    ))}
                  </select>
                )}

                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="text-xs border border-slate-200 rounded-lg px-2 py-1 bg-white text-slate-700 font-medium"
                >
                  <option value="all">All Categories</option>
                  <option value="daily_notice">Daily Notices</option>
                  <option value="allergy">Allergies</option>
                  <option value="medication">Medications</option>
                </select>
              </div>
            </div>
          </div>

          {/* Feed List */}
          {filteredUpdates.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200/90 p-10 text-center text-xs text-slate-500 space-y-2">
              <AlertCircle className="w-6 h-6 text-slate-300 mx-auto" />
              <div className="font-semibold text-slate-700">No updates matching current filters</div>
              <div>Use the form on the left to submit today&apos;s morning health note.</div>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredUpdates.map(({ student, update }) => {
                const isHighPriority = update.content.includes('[HIGH PRIORITY]');
                const stuSchool = schools.find((sch) => sch.id === student.schoolId);

                return (
                  <div
                    key={update.id}
                    className={`bg-white rounded-2xl border p-4.5 shadow-xs space-y-3 transition-all ${
                      isHighPriority ? 'border-rose-300 bg-rose-50/25 ring-1 ring-rose-200' : 'border-slate-200/90'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 text-sm">
                            {student.name}
                          </span>
                          <span className="text-xs text-slate-500 font-mono">
                            · {student.grade}
                          </span>
                          {stuSchool && (
                            <span className="text-[10px] font-mono bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded border border-slate-200">
                              {stuSchool.code}
                            </span>
                          )}
                          {isHighPriority && (
                            <span className="text-[10px] font-bold text-rose-700 bg-rose-100 px-1.5 py-0.5 rounded border border-rose-200">
                              Urgent Caution
                            </span>
                          )}
                        </div>

                        <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1.5">
                          <span>By {update.author}</span>
                          <span>·</span>
                          <span className="font-mono">{update.date}</span>
                        </div>
                      </div>

                      {/* Acknowledgment state */}
                      {update.acknowledgedByTeacher ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          Noted & Acknowledged
                        </span>
                      ) : !isParent ? (
                        <button
                          onClick={() => onAcknowledgeUpdate(student.id, update.id)}
                          className="px-3 py-1 text-xs font-bold bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors flex items-center gap-1 shadow-xs"
                        >
                          <CheckCheck className="w-3.5 h-3.5" />
                          Acknowledge
                        </button>
                      ) : (
                        <span className="text-[11px] text-slate-400">
                          Pending Faculty Review
                        </span>
                      )}
                    </div>

                    <div className="text-xs text-slate-800 leading-relaxed bg-slate-50/70 p-3 rounded-xl border border-slate-100">
                      {update.content}
                    </div>

                    {/* Quick allergy tags related to this student for context */}
                    {student.allergies.length > 0 && (
                      <div className="flex flex-wrap items-center gap-2 text-[11px] pt-1">
                        <span className="text-slate-500 font-medium">Allergies on File:</span>
                        {student.allergies.map((a) => (
                          <span
                            key={a.id}
                            className={`font-semibold ${
                              a.severity.includes('Severe') ? 'text-rose-700' : 'text-slate-700'
                            }`}
                          >
                            {a.name}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
