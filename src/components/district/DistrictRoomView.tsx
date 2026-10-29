import { useState } from 'react';
import { 
  Building2, 
  Plus, 
  Search, 
  Trash2, 
  ArrowRight, 
  ArrowLeft, 
  ShieldCheck, 
  School as SchoolIcon, 
  Users, 
  KeyRound, 
  Award,
  Lock,
  DoorOpen,
  RotateCcw
} from 'lucide-react';
import { District, SchoolRoom, UserAccount } from '../../types/health';
import { getRoomsCatalog, addSchoolToDistrict, getRoomBundle, seedFullDemoDistrict } from '../../services/roomStorage';
import { DistrictSchoolDeleteModal } from './DistrictSchoolDeleteModal';

interface Props {
  district: District;
  currentUser: UserAccount;
  onBackToNational: () => void;
  onSelectSchool: (roomCode: string) => void;
  onRefreshDistricts: () => void;
}

export function DistrictRoomView({
  district,
  currentUser,
  onBackToNational,
  onSelectSchool,
  onRefreshDistricts,
}: Props) {
  const [districtSearch, setDistrictSearch] = useState('');
  const [isAddSchoolModalOpen, setIsAddSchoolModalOpen] = useState(false);
  const [newSchoolName, setNewSchoolName] = useState('');
  const [newPrincipalName, setNewPrincipalName] = useState('');
  const [newPrincipalEmail, setNewPrincipalEmail] = useState('');
  const [newCustomCode, setNewCustomCode] = useState('');
  const [addSchoolError, setAddSchoolError] = useState('');

  // Password-verified deletion state
  const [schoolToDelete, setSchoolToDelete] = useState<SchoolRoom | null>(null);

  const allSchools = getRoomsCatalog();
  // Filter schools belonging to this district
  const districtSchools = allSchools.filter(
    (s) =>
      district.schoolRoomCodes.includes(s.roomCode) ||
      s.districtName.toLowerCase() === district.name.toLowerCase()
  );

  const totalDistrictClasses = districtSchools.reduce((acc, s) => acc + s.classes.length, 0);
  const totalDistrictStudents = districtSchools.reduce((acc, s) => {
    const b = getRoomBundle(s.roomCode);
    return acc + (b?.students?.length || 0);
  }, 0);

  // District-Scoped Search: Only searches within this district's schools and their classes
  const filteredSchools = districtSchools.filter((s) => {
    const q = districtSearch.trim().toLowerCase();
    if (!q) return true;
    const matchesSchool = s.schoolName.toLowerCase().includes(q) || s.roomCode.toLowerCase().includes(q);
    const matchesClasses = s.classes.some(
      (c) => c.name.toLowerCase().includes(q) || c.grade.toLowerCase().includes(q) || (c.section && c.section.toLowerCase().includes(q))
    );
    return matchesSchool || matchesClasses;
  });

  const isDistrictOfficer = currentUser.role === 'district_auth';

  const handleAddSchoolSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAddSchoolError('');

    if (!newSchoolName.trim()) {
      setAddSchoolError('Please enter a school name.');
      return;
    }

    const res = addSchoolToDistrict(
      district.id,
      {
        schoolName: newSchoolName.trim(),
        principalName: newPrincipalName.trim() || 'Principal Office',
        principalEmail: newPrincipalEmail.trim() || 'principal@school.edu',
        customCode: newCustomCode.trim() || undefined,
      },
      currentUser
    );

    if (res.success && res.roomBundle) {
      setNewSchoolName('');
      setNewPrincipalName('');
      setNewPrincipalEmail('');
      setNewCustomCode('');
      setIsAddSchoolModalOpen(false);
      onRefreshDistricts();
      onSelectSchool(res.roomBundle.room.roomCode);
    } else {
      setAddSchoolError(res.message || 'Failed to add school to district.');
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* 1. Header with Breadcrumb Back to National */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <button
            onClick={onBackToNational}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-indigo-600 mb-2 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>National Directory & Map</span>
          </button>

          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-md border border-indigo-200">
              {district.code}
            </span>
            <span className="text-xs text-slate-400">·</span>
            <span className="text-xs font-semibold text-slate-500">
              State: {district.state}
            </span>
            <span className="text-xs text-slate-400">·</span>
            <span className="text-xs font-semibold text-indigo-600">
              {districtSchools.length} Schools · {totalDistrictClasses} Classes · {totalDistrictStudents} Students
            </span>
          </div>

          <h1 className="text-2xl font-extrabold text-slate-900 mt-1">
            {district.name}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            District Officer: <strong className="text-slate-700">{district.districtOfficerName}</strong> ({district.districtOfficerEmail})
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {district.id === 'dist-metro-north' && (
            <button
              onClick={() => {
                seedFullDemoDistrict(true);
                onRefreshDistricts();
              }}
              title="Reload full 6 demo schools and 38 classes"
              className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 border border-slate-200 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
              <span>Reset Demo Schools</span>
            </button>
          )}

          {isDistrictOfficer && (
            <button
              onClick={() => setIsAddSchoolModalOpen(true)}
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add School to District</span>
            </button>
          )}

          {!isDistrictOfficer && (
            <span className="text-xs text-slate-500 bg-slate-100 px-3 py-2 rounded-xl font-medium border border-slate-200">
              School Provisioning: District Officer Only
            </span>
          )}
        </div>
      </div>

      {/* 2. District-Scoped Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={districtSearch}
            onChange={(e) => setDistrictSearch(e.target.value)}
            placeholder={`Search strictly within ${district.name} (schools, classes, sub-rooms)...`}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 placeholder:text-slate-400"
          />
        </div>
        <span className="text-xs font-bold text-slate-500 shrink-0">
          Scope: District ({filteredSchools.length} of {districtSchools.length} schools)
        </span>
      </div>

      {/* 3. Member Schools Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700">
            District Member Schools ({filteredSchools.length})
          </h2>
          <span className="text-[11px] text-slate-400">
            School deletion strictly requires District Officer password
          </span>
        </div>

        {filteredSchools.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500">
            <SchoolIcon className="w-10 h-10 mx-auto text-slate-300 mb-2" />
            <p className="text-xs font-semibold">No schools registered in this district matching &ldquo;{districtSearch}&rdquo;.</p>
            {isDistrictOfficer && (
              <button
                onClick={() => setIsAddSchoolModalOpen(true)}
                className="mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold"
              >
                + Add First School to {district.name}
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredSchools.map((s) => {
              const bundle = getRoomBundle(s.roomCode);
              const studentCount = bundle?.students?.length || 0;

              return (
                <div
                  key={s.roomCode}
                  className="bg-white rounded-2xl border border-slate-200 p-5 hover:border-slate-300 transition-all shadow-xs flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs shrink-0">
                          <SchoolIcon className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-slate-900">{s.schoolName}</h3>
                          <p className="text-[11px] text-slate-500">
                            Principal: {s.principalName}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-1">
                        <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-200">
                          {s.roomCode}
                        </span>
                        <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          {studentCount} Students Enrolled
                        </span>
                      </div>
                    </div>

                    {/* Classrooms Sub-Room List Preview */}
                    <div className="mt-3 pt-3 border-t border-slate-100">
                      <div className="text-[11px] font-bold text-slate-600 mb-2 flex items-center justify-between">
                        <span>Classroom Sub-Rooms ({s.classes.length}):</span>
                        <span className="text-[10px] text-slate-400">4–9 Students / Class</span>
                      </div>

                      <div className="flex flex-wrap gap-1.5">
                        {s.classes.map((c) => {
                          const classStudentCount = bundle?.students?.filter(
                            (st) => st.classId === c.id || st.className?.toLowerCase() === c.name.toLowerCase()
                          ).length || 0;

                          return (
                            <span
                              key={c.id}
                              className="px-2 py-1 bg-slate-50 hover:bg-slate-100 text-slate-700 text-[11px] rounded-lg font-medium border border-slate-200/90 flex items-center gap-1.5"
                            >
                              <span>{c.name}</span>
                              <span className="text-[10px] font-mono px-1 py-0.2 bg-white rounded text-slate-500 border border-slate-200">
                                {classStudentCount}
                              </span>
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                {/* Bottom Actions: Enter Workspace & Password-Protected Deletion (District Officer Only) */}
                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                  {/* Delete button exclusively visible to District Officer */}
                  {isDistrictOfficer ? (
                    <button
                      type="button"
                      onClick={() => setSchoolToDelete(s)}
                      className="px-2.5 py-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1 border border-transparent hover:border-rose-200"
                      title="Delete school room (Requires District Officer password)"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete School</span>
                    </button>
                  ) : (
                    <span className="text-[11px] text-slate-400 flex items-center gap-1">
                      <Lock className="w-3 h-3" /> Managed by District
                    </span>
                  )}

                  <button
                    onClick={() => onSelectSchool(s.roomCode)}
                    className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
                  >
                    <span>Enter School</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
        )}
      </div>

      {/* 4. Add School to District Modal (District Officer Exclusive) */}
      {isAddSchoolModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleAddSchoolSubmit}
            className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-2xl p-6 space-y-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Provision School to District</h3>
                  <p className="text-xs text-slate-500">{district.name} · {district.state}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAddSchoolModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 text-xs font-bold"
              >
                ✕
              </button>
            </div>

            {addSchoolError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800">
                {addSchoolError}
              </div>
            )}

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  School Name *
                </label>
                <input
                  type="text"
                  required
                  value={newSchoolName}
                  onChange={(e) => setNewSchoolName(e.target.value)}
                  placeholder="e.g. Lincoln High School or Oakridge Elementary"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 font-semibold"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Principal Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={newPrincipalName}
                    onChange={(e) => setNewPrincipalName(e.target.value)}
                    placeholder="e.g. Dr. Arthur Sterling"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Principal Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={newPrincipalEmail}
                    onChange={(e) => setNewPrincipalEmail(e.target.value)}
                    placeholder="e.g. principal@school.edu"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Custom School Room Code (Optional)
                </label>
                <input
                  type="text"
                  value={newCustomCode}
                  onChange={(e) => setNewCustomCode(e.target.value.toUpperCase())}
                  placeholder="e.g. LNC-2026 (Leave blank for auto-code)"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 font-mono font-bold"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsAddSchoolModalOpen(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-colors shadow-xs flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Provision & Deploy School</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 5. Password-Verified School Deletion Modal (District Officer Exclusive) */}
      {schoolToDelete && (
        <DistrictSchoolDeleteModal
          isOpen={true}
          schoolRoomCode={schoolToDelete.roomCode}
          schoolName={schoolToDelete.schoolName}
          currentUser={currentUser}
          onClose={() => setSchoolToDelete(null)}
          onSuccess={() => {
            setSchoolToDelete(null);
            onRefreshDistricts();
          }}
        />
      )}
    </div>
  );
}
