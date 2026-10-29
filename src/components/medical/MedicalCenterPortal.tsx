import { useState } from 'react';
import { Student, UserAccount, School, SchoolRoom, AccessPermission } from '../../types/health';
import { 
  Search, 
  AlertTriangle, 
  ShieldCheck, 
  Phone, 
  Plus, 
  FileText, 
  Filter, 
  Stethoscope,
  HeartPulse,
  Building2,
  ExternalLink,
  CheckCircle2,
  Send,
  Lock,
  Trash2
} from 'lucide-react';
import { EmergencyCardModal } from '../common/EmergencyCardModal';

interface Props {
  currentUser: UserAccount;
  students: Student[];
  schools?: School[];
  room?: SchoolRoom | null;
  permissions?: AccessPermission[];
  onRequestCrossSchoolPermission?: (targetSchoolName: string, reason: string) => void;
  onOpenIntakeModal: () => void;
  onUpdateStudent?: (updatedStudent: Student) => void;
  onAcknowledgeUpdate?: (studentId: string, updateId: string) => void;
  onAddSchool?: (newSchool: School) => void;
  onAddStudent?: (newStudent: Student) => void;
  onDeleteStudent?: (studentId: string) => void;
}

export function MedicalCenterPortal({
  currentUser,
  students,
  room,
  permissions = [],
  onRequestCrossSchoolPermission,
  onOpenIntakeModal,
  onDeleteStudent,
}: Props) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSeverity, setFilterSeverity] = useState<'all' | 'severe' | 'epipen'>('all');
  const [selectedStudentForEmergency, setSelectedStudentForEmergency] = useState<Student | null>(null);

  // Cross-School request state
  const [isCrossSchoolModalOpen, setIsCrossSchoolModalOpen] = useState(false);
  const [targetSchoolInput, setTargetSchoolInput] = useState('');
  const [crossSchoolReason, setCrossSchoolReason] = useState('Medical record transfer for athletic clearance');

  // Filter students
  const filteredStudents = students.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.allergies.some((a) => a.name.toLowerCase().includes(searchQuery.toLowerCase()));
    if (!matchesSearch) return false;
    if (filterSeverity === 'severe') {
      return s.allergies.some((a) => a.severity.includes('Severe'));
    }
    if (filterSeverity === 'epipen') {
      return s.allergies.some((a) => a.hasEpiPen);
    }
    return true;
  });

  // KPIs
  const totalStudents = students.length;
  const severeCount = students.filter((s) => s.allergies.some((a) => a.severity.includes('Severe'))).length;
  const epiPenCount = students.filter((s) => s.allergies.some((a) => a.hasEpiPen)).length;

  const crossSchoolPermissions = permissions.filter((p) => p.type === 'cross_school');

  const handleSendCrossSchoolRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetSchoolInput.trim() || !crossSchoolReason.trim()) return;
    if (onRequestCrossSchoolPermission) {
      onRequestCrossSchoolPermission(targetSchoolInput.trim(), crossSchoolReason.trim());
    }
    setIsCrossSchoolModalOpen(false);
    setTargetSchoolInput('');
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* 1. Header */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded-md border border-purple-200 flex items-center gap-1">
              <Stethoscope className="w-3.5 h-3.5" />
              Health Director · {currentUser.name}
            </span>
            <span className="text-xs text-slate-500 font-medium">
              {room?.schoolName || currentUser.facilityName || 'Student Health Office'}
            </span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 mt-1">
            Health Office & Allergy Clinical Registry
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Clinical oversight of allergy protocols, EpiPen registries, and emergency medical action plans.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsCrossSchoolModalOpen(true)}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-all border border-slate-200 flex items-center gap-1.5 shadow-xs"
            title="Request access to student records in another district school"
          >
            <Building2 className="w-3.5 h-3.5 text-indigo-600" />
            <span>Request Outside School Access</span>
          </button>

          <button
            onClick={onOpenIntakeModal}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            + Enroll Student Health Record
          </button>
        </div>
      </div>

      {/* 2. Clinical Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Enrolled Health Records
            </div>
            <div className="text-xl font-bold text-slate-900 font-mono mt-0.5">
              {totalStudents} Students
            </div>
          </div>
          <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold">
            <HeartPulse className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-rose-200 shadow-xs flex items-center justify-between bg-rose-50/15">
          <div>
            <div className="text-[11px] font-semibold text-rose-700 uppercase tracking-wider">
              Severe Anaphylaxis Cases
            </div>
            <div className="text-xl font-bold text-rose-700 font-mono mt-0.5">
              {severeCount} Critical
            </div>
          </div>
          <div className="w-9 h-9 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center font-bold">
            <AlertTriangle className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              EpiPen Registrations
            </div>
            <div className="text-xl font-bold text-slate-900 font-mono mt-0.5">
              {epiPenCount} Prescribed
            </div>
          </div>
          <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
            <ShieldCheck className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* 3. Cross-School Requests Banner (if any) */}
      {crossSchoolPermissions.length > 0 && (
        <div className="bg-white rounded-2xl border border-indigo-200 p-4 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-indigo-950">
            <span className="flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-indigo-600" />
              Cross-School District Permission Dispatches ({crossSchoolPermissions.length})
            </span>
            <span className="text-[11px] text-slate-500">Requires District Authority Link Verification</span>
          </div>
          <div className="space-y-1.5">
            {crossSchoolPermissions.map((perm) => (
              <div
                key={perm.id}
                className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs"
              >
                <div>
                  <span className="font-bold text-slate-900">{perm.targetSchoolName}</span>
                  <span className="text-[11px] text-slate-500 ml-2">&ldquo;{perm.reason}&rdquo;</span>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      perm.status === 'approved'
                        ? 'bg-emerald-100 text-emerald-800'
                        : perm.status === 'pending'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {perm.status === 'pending' ? 'PENDING DISTRICT REVIEW' : perm.status.toUpperCase()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. Filter & Search Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search records by student name, allergen, or trigger..."
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
            All ({totalStudents})
          </button>
          <button
            onClick={() => setFilterSeverity('severe')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              filterSeverity === 'severe'
                ? 'bg-white text-rose-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Severe Allergies ({severeCount})
          </button>
          <button
            onClick={() => setFilterSeverity('epipen')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              filterSeverity === 'epipen'
                ? 'bg-white text-amber-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            EpiPen Assigned ({epiPenCount})
          </button>
        </div>
      </div>

      {/* 5. Health Records Grid */}
      {filteredStudents.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-500">
          <p className="text-xs">
            {students.length === 0
              ? 'No health records enrolled in this school room yet.'
              : 'No records match your search filter.'}
          </p>
          <button
            onClick={onOpenIntakeModal}
            className="mt-3 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
          >
            + Enroll First Student Record
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredStudents.map((stu) => {
            const hasSevere = stu.allergies.some((a) => a.severity.includes('Severe'));
            const hasEpi = stu.allergies.some((a) => a.hasEpiPen);

            return (
              <div
                key={stu.id}
                className={`bg-white rounded-2xl p-5 border transition-all ${
                  hasSevere
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
                      Class: {stu.className || 'General Enrollment'} · Parent: {stu.parentName}
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
                        onClick={() => onDeleteStudent(stu.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 hover:border-rose-200 rounded-lg text-xs transition-colors"
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
                  {stu.allergies.length === 0 && (
                    <p className="text-xs text-slate-400 py-1">No allergies declared.</p>
                  )}
                </div>

                {hasEpi && (
                  <div className="p-2 bg-rose-50 border border-rose-200 rounded-lg text-xs font-bold text-rose-800 flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                    <span>EpiPen Prescribed & Verified</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Cross-School Request Modal */}
      {isCrossSchoolModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleSendCrossSchoolRequest}
            className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-xl p-6 space-y-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">
                Request District Authority Cross-School Access
              </h3>
              <button
                type="button"
                onClick={() => setIsCrossSchoolModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Requires verification approval by the District Authority before student health records from outside schools can be accessed.
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Target Outside School Name or Code *
              </label>
              <input
                type="text"
                required
                value={targetSchoolInput}
                onChange={(e) => setTargetSchoolInput(e.target.value)}
                placeholder="e.g. Washington Middle School or WMS-302"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-rose-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Reason for Cross-School Request *
              </label>
              <input
                type="text"
                required
                value={crossSchoolReason}
                onChange={(e) => setCrossSchoolReason(e.target.value)}
                placeholder="e.g. Student inter-school athletic event, medical clearance, or transfer"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-rose-500"
              />
            </div>

            <div className="pt-2 flex gap-3">
              <button
                type="button"
                onClick={() => setIsCrossSchoolModalOpen(false)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center justify-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Submit Request to District</span>
              </button>
            </div>
          </form>
        </div>
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
