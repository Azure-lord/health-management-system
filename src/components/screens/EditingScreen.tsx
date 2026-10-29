import { useState, useEffect } from 'react';
import { Student, Allergy, Medication, AllergySeverity, UserAccount, School } from '../../types/health';
import { 
  Lock, 
  CheckCircle, 
  AlertTriangle, 
  Plus, 
  Trash2, 
  Save, 
  Phone, 
  ShieldAlert, 
  FileText, 
  Search,
  UserCheck,
  Building2,
  Stethoscope,
  Filter
} from 'lucide-react';
import { EmergencyCardModal } from '../common/EmergencyCardModal';

interface Props {
  students: Student[];
  onUpdateStudent: (updatedStudent: Student) => void;
  currentUser: UserAccount;
  schools: School[];
  initialSelectedStudentId?: string;
}

export function EditingScreen({
  students,
  onUpdateStudent,
  currentUser,
  schools,
  initialSelectedStudentId,
}: Props) {
  const isTeacher = currentUser.role === 'teacher';
  const isParent = currentUser.role === 'parent';
  const isMedicalCenter = currentUser.role === 'medical_center';

  // Determine allowed student pool based on role and school
  // 1. Parent: Strictly their linked child
  // 2. Teacher: All students at their school
  // 3. Medical Center: All students across all schools (or filtered by school)
  const [selectedSchoolFilter, setSelectedSchoolFilter] = useState<string>('all');

  const baseStudentPool = isParent
    ? students.filter((s) => s.id === currentUser.linkedStudentId)
    : isTeacher
    ? students.filter((s) => s.schoolId === currentUser.schoolId)
    : students; // Medical Center sees all

  const [selectedId, setSelectedId] = useState<string>(
    isParent
      ? (currentUser.linkedStudentId || students[0]?.id || '')
      : (initialSelectedStudentId || baseStudentPool[0]?.id || students[0]?.id || '')
  );

  const [searchQuery, setSearchQuery] = useState('');
  const [filterSeverity, setFilterSeverity] = useState<'all' | 'severe' | 'hasAllergy'>('all');
  const [showEmergencyCard, setShowEmergencyCard] = useState(false);
  const [saveToast, setSaveToast] = useState(false);

  // Sync selectedId when user changes
  useEffect(() => {
    if (isParent && currentUser.linkedStudentId) {
      setSelectedId(currentUser.linkedStudentId);
    } else if (!baseStudentPool.some((s) => s.id === selectedId) && baseStudentPool.length > 0) {
      setSelectedId(baseStudentPool[0].id);
    }
  }, [currentUser, baseStudentPool, selectedId, isParent]);

  const activeStudent = students.find((s) => s.id === selectedId) || baseStudentPool[0] || students[0];
  const activeStudentSchool = schools.find((sch) => sch.id === activeStudent?.schoolId);

  // Local editable form buffer
  const [formData, setFormData] = useState<Student | null>(null);

  useEffect(() => {
    if (activeStudent) {
      setFormData(JSON.parse(JSON.stringify(activeStudent)));
    }
  }, [activeStudent]);

  if (!formData || !activeStudent) {
    return (
      <div className="max-w-4xl mx-auto p-12 text-center text-slate-500">
        No student records found matching active permissions.
      </div>
    );
  }

  // Permissions check: Teacher cannot edit, Parent can edit their child, Medical Center can edit
  const isReadOnly = isTeacher;

  const handleAllergyChange = (index: number, field: keyof Allergy, value: unknown) => {
    if (isReadOnly) return;
    const updatedAllergies = [...formData.allergies];
    updatedAllergies[index] = {
      ...updatedAllergies[index],
      [field]: value,
    };
    setFormData({ ...formData, allergies: updatedAllergies });
  };

  const handleAddAllergy = () => {
    if (isReadOnly) return;
    const newAlg: Allergy = {
      id: 'alg-' + Date.now(),
      name: 'New Allergen',
      severity: 'Moderate',
      triggers: 'Accidental ingestion or skin contact',
      reaction: 'Cutaneous hives or gastrointestinal irritation',
      actionPlan: 'Monitor student, notify parent, administer antihistamine if prescribed',
      hasEpiPen: false,
    };
    setFormData({
      ...formData,
      allergies: [...formData.allergies, newAlg],
    });
  };

  const handleRemoveAllergy = (id: string) => {
    if (isReadOnly) return;
    setFormData({
      ...formData,
      allergies: formData.allergies.filter((a) => a.id !== id),
    });
  };

  const handleAddMedication = () => {
    if (isReadOnly) return;
    const newMed: Medication = {
      id: 'med-' + Date.now(),
      name: 'Prescribed Medication',
      dosage: 'Standard pediatric dose',
      timing: 'As needed upon symptom onset',
      nurseSupervision: true,
    };
    setFormData({
      ...formData,
      medications: [...formData.medications, newMed],
    });
  };

  const handleRemoveMedication = (id: string) => {
    if (isReadOnly) return;
    setFormData({
      ...formData,
      medications: formData.medications.filter((m) => m.id !== id),
    });
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (isReadOnly) return;

    const authorRoleText = isParent
      ? `${formData.parentName} (Parent)`
      : isMedicalCenter
      ? `${currentUser.name} (Medical Center)`
      : 'School Health Staff';

    const updated: Student = {
      ...formData,
      lastUpdated: new Date().toISOString().split('T')[0],
      recentUpdates: [
        {
          id: 'upd-' + Date.now(),
          date: 'Just now',
          author: authorRoleText,
          authorRole: currentUser.role,
          type: 'allergy',
          content: 'Updated student comprehensive medical and emergency allergy record.',
          acknowledgedByTeacher: false,
        },
        ...formData.recentUpdates,
      ],
    };

    onUpdateStudent(updated);
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 3500);
  };

  // Filter students list for teacher/medical navigation
  const visibleStudentList = baseStudentPool.filter((s) => {
    if (isMedicalCenter && selectedSchoolFilter !== 'all' && s.schoolId !== selectedSchoolFilter) {
      return false;
    }
    const matchesQuery = s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.allergies.some((a) => a.name.toLowerCase().includes(searchQuery.toLowerCase()));
    if (!matchesQuery) return false;
    if (filterSeverity === 'severe') {
      return s.allergies.some((a) => a.severity.includes('Severe'));
    }
    if (filterSeverity === 'hasAllergy') {
      return s.allergies.length > 0;
    }
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="text-xs font-bold uppercase tracking-wider text-rose-600 flex items-center gap-1.5">
            <FileText className="w-4 h-4" />
            Screen 2 · Medical Records & Allergy Editor
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 mt-1">
            {isParent ? `Medical Record: ${activeStudent.name}` : 'Student Medical Dossiers & Allergy Management'}
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            {isTeacher
              ? `Teacher View (${currentUser.name}) · Scoped to ${activeStudentSchool?.name || 'Classroom'}. Read-only access enforced.`
              : isParent
              ? `Parent Access (${currentUser.name}) · Authorized to view and update ${activeStudent.name}'s medical profile.`
              : `Medical Center Access (${currentUser.name}) · Clinical supervision across regional educational institutions.`}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowEmergencyCard(true)}
            className="px-4 py-2 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition-all flex items-center gap-1.5 shadow-xs"
          >
            <ShieldAlert className="w-4 h-4 text-rose-600" />
            Open Emergency Action Card
          </button>
        </div>
      </div>

      {/* Permissions Context Banner */}
      <div className="mt-6">
        {isTeacher ? (
          <div className="p-4 bg-blue-50/80 border border-blue-200 rounded-2xl flex items-start gap-3 shadow-xs">
            <Lock className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            <div className="text-xs">
              <span className="font-bold text-blue-900 block text-sm">
                Teacher Permission: Read-Only Access
              </span>
              <p className="text-blue-700 mt-0.5 leading-relaxed">
                As a classroom faculty member, you have full visibility into student allergies, EpiPen locations, and emergency contacts to safeguard students during the school day. Modification rights are locked to parents and licensed health staff under FERPA/HIPAA policy.
              </p>
            </div>
          </div>
        ) : isParent ? (
          <div className="p-4 bg-emerald-50/80 border border-emerald-200 rounded-2xl flex items-start gap-3 shadow-xs">
            <UserCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div className="text-xs">
              <span className="font-bold text-emerald-900 block text-sm">
                Parent Authorization: Edit Rights Active for {activeStudent.name}
              </span>
              <p className="text-emerald-700 mt-0.5 leading-relaxed">
                You are authenticated as {activeStudent.parentName}. In accordance with student privacy laws, you can only view and edit your enrolled child. All saved updates sync in real time with the classroom teacher and school nurse office.
              </p>
            </div>
          </div>
        ) : (
          <div className="p-4 bg-purple-50/80 border border-purple-200 rounded-2xl flex items-start gap-3 shadow-xs">
            <Stethoscope className="w-5 h-5 text-purple-600 shrink-0 mt-0.5" />
            <div className="text-xs">
              <span className="font-bold text-purple-900 block text-sm">
                Local Medical Center: Clinical Authority & Multi-School Oversight
              </span>
              <p className="text-purple-700 mt-0.5 leading-relaxed">
                You are authenticated as {currentUser.name} ({currentUser.facilityName}). You have cross-campus clinical authority to review, update, and manage health records across all {schools.length} district educational institutions.
              </p>
            </div>
          </div>
        )}
      </div>

      {saveToast && (
        <div className="mt-4 p-3.5 bg-emerald-600 text-white rounded-xl flex items-center gap-2 text-xs font-bold shadow-md animate-in fade-in">
          <CheckCircle className="w-4 h-4" />
          Medical changes saved successfully! Synced across classroom teacher rosters and health office records.
        </div>
      )}

      {/* Main Grid: Left Roster/Child Card + Right Editor */}
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Student Selector Sidebar or Child Card */}
        <div className="lg:col-span-4 space-y-4">
          {!isParent ? (
            <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  {isMedicalCenter ? 'District Student Directory' : `${activeStudentSchool?.name} Roster`}
                </span>
                <span className="text-xs text-slate-400 font-mono">({visibleStudentList.length})</span>
              </div>

              {/* Medical Center Multi-School Filter Dropdown */}
              {isMedicalCenter && (
                <div>
                  <label className="block text-[11px] font-semibold text-purple-900 mb-1 flex items-center gap-1">
                    <Building2 className="w-3.5 h-3.5 text-purple-600" />
                    Filter by School Campus:
                  </label>
                  <select
                    value={selectedSchoolFilter}
                    onChange={(e) => setSelectedSchoolFilter(e.target.value)}
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-1.5 text-slate-800 font-medium focus:outline-hidden"
                  >
                    <option value="all">All Schools (District Wide)</option>
                    {schools.map((sch) => (
                      <option key={sch.id} value={sch.id}>
                        {sch.name} ({sch.code})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Search input */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search student or allergen..."
                  className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:border-slate-400"
                />
              </div>

              {/* Filter tabs */}
              <div className="flex gap-1 p-1 bg-slate-100 rounded-lg text-[11px]">
                <button
                  type="button"
                  onClick={() => setFilterSeverity('all')}
                  className={`flex-1 py-1 rounded-md font-medium transition-colors ${
                    filterSeverity === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                  }`}
                >
                  All ({baseStudentPool.length})
                </button>
                <button
                  type="button"
                  onClick={() => setFilterSeverity('severe')}
                  className={`flex-1 py-1 rounded-md font-medium transition-colors ${
                    filterSeverity === 'severe' ? 'bg-white text-rose-700 shadow-xs' : 'text-slate-600'
                  }`}
                >
                  Severe / EpiPen
                </button>
                <button
                  type="button"
                  onClick={() => setFilterSeverity('hasAllergy')}
                  className={`flex-1 py-1 rounded-md font-medium transition-colors ${
                    filterSeverity === 'hasAllergy' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                  }`}
                >
                  Allergies
                </button>
              </div>

              {/* List of students */}
              <div className="space-y-1.5 max-h-[500px] overflow-y-auto pt-1">
                {visibleStudentList.map((stu) => {
                  const hasSevere = stu.allergies.some((a) => a.severity.includes('Severe'));
                  const isSelected = stu.id === selectedId;
                  const stuSchool = schools.find((sch) => sch.id === stu.schoolId);

                  return (
                    <button
                      key={stu.id}
                      onClick={() => setSelectedId(stu.id)}
                      className={`w-full text-left p-3 rounded-xl border transition-all text-xs flex flex-col gap-1 ${
                        isSelected
                          ? 'border-slate-900 bg-slate-900 text-white shadow-xs'
                          : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50 text-slate-800'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm">{stu.name}</span>
                        <div className="flex items-center gap-1.5">
                          {isMedicalCenter && stuSchool && (
                            <span className={`text-[10px] font-mono px-1 rounded ${
                              isSelected ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-600'
                            }`}>
                              {stuSchool.code}
                            </span>
                          )}
                          <span className={`text-[11px] font-mono ${isSelected ? 'text-slate-300' : 'text-slate-500'}`}>
                            {stu.grade}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
                        {stu.allergies.length === 0 ? (
                          <span className={`text-[11px] ${isSelected ? 'text-slate-300' : 'text-emerald-700'}`}>
                            No known allergies
                          </span>
                        ) : (
                          stu.allergies.map((a) => (
                            <span
                              key={a.id}
                              className={`text-[11px] font-medium ${
                                isSelected
                                  ? a.severity.includes('Severe') ? 'text-rose-300 font-bold' : 'text-slate-200'
                                  : a.severity.includes('Severe') ? 'text-rose-700 font-bold' : 'text-slate-600'
                              }`}
                            >
                              {a.name}
                            </span>
                          ))
                        )}
                      </div>

                      {hasSevere && (
                        <div className={`text-[10px] flex items-center gap-1 font-semibold ${
                          isSelected ? 'text-rose-300' : 'text-rose-700'
                        }`}>
                          <AlertTriangle className="w-3 h-3" />
                          Severe Anaphylaxis Alert
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            /* Parent child profile card */
            <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs space-y-4">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Enrolled Child Profile
              </div>
              <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-1">
                <div className="font-bold text-base text-slate-900">{activeStudent.name}</div>
                <div className="text-xs text-slate-600">
                  Campus: <strong>{activeStudentSchool?.name}</strong>
                </div>
                <div className="text-xs text-slate-600">
                  {activeStudent.grade} · DOB: <span className="font-mono">{activeStudent.dob}</span>
                </div>
                <div className="text-xs text-slate-600">
                  Blood Group: <span className="font-semibold text-rose-700 font-mono">{activeStudent.bloodType}</span>
                </div>
              </div>

              <div className="text-xs text-slate-500 leading-relaxed">
                Parents have full legal authority to amend allergy emergency steps, authorized emergency callers, and doctor contacts.
              </div>
            </div>
          )}

          {/* Quick campus & emergency clinic box */}
          <div className="bg-slate-50 rounded-2xl border border-slate-200 p-4 text-xs space-y-2.5">
            <div className="font-bold text-slate-800 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-purple-600" />
              Campus Health Station
            </div>
            <div className="text-slate-600">
              <div className="font-semibold text-slate-800">{activeStudentSchool?.leadNurse}</div>
              <div className="text-[11px] text-slate-500">Campus Clinic Direct Phone:</div>
              <a href={`tel:${activeStudentSchool?.nurseOfficePhone}`} className="text-emerald-700 font-mono font-bold hover:underline">
                {activeStudentSchool?.nurseOfficePhone}
              </a>
            </div>

            <div className="pt-2 border-t border-slate-200/60">
              <div className="font-semibold text-slate-800">Supervising Pediatrician</div>
              <div className="text-[11px] text-slate-500">{activeStudent.physician.name}</div>
              <a href={`tel:${activeStudent.physician.phone}`} className="text-slate-700 font-mono hover:underline">
                {activeStudent.physician.phone}
              </a>
            </div>
          </div>
        </div>

        {/* Right Column: Detailed Medical Record & Editor */}
        <div className="lg:col-span-8">
          <form onSubmit={handleSave} className="space-y-6">
            {/* Header of Form */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    {formData.name}&apos;s Medical Profile
                  </h2>
                  <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                    <span className="font-mono">ID: {formData.id}</span>
                    <span>·</span>
                    <span>Campus: {activeStudentSchool?.code}</span>
                    <span>·</span>
                    <span className="font-mono">Updated: {formData.lastUpdated}</span>
                  </div>
                </div>

                {isReadOnly ? (
                  <span className="px-3 py-1.5 text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200 rounded-lg flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-slate-500" />
                    Teacher Read-Only
                  </span>
                ) : (
                  <button
                    type="submit"
                    className="px-4 py-2 text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white rounded-xl transition-all flex items-center gap-1.5 shadow-xs"
                  >
                    <Save className="w-3.5 h-3.5" />
                    Save Medical Changes
                  </button>
                )}
              </div>

              {/* Basic Student Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Student Full Name
                  </label>
                  <input
                    type="text"
                    disabled={isReadOnly}
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className={`w-full px-3 py-1.5 text-sm border rounded-xl ${
                      isReadOnly ? 'bg-slate-50 border-slate-200 text-slate-700 cursor-not-allowed' : 'bg-white border-slate-300'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Grade / Room
                  </label>
                  <input
                    type="text"
                    disabled={isReadOnly}
                    value={formData.grade}
                    onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                    className={`w-full px-3 py-1.5 text-sm border rounded-xl ${
                      isReadOnly ? 'bg-slate-50 border-slate-200 text-slate-700 cursor-not-allowed' : 'bg-white border-slate-300'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Blood Type
                  </label>
                  <input
                    type="text"
                    disabled={isReadOnly}
                    value={formData.bloodType}
                    onChange={(e) => setFormData({ ...formData, bloodType: e.target.value })}
                    className={`w-full px-3 py-1.5 text-sm border rounded-xl font-mono ${
                      isReadOnly ? 'bg-slate-50 border-slate-200 text-slate-700 cursor-not-allowed' : 'bg-white border-slate-300'
                    }`}
                  />
                </div>
              </div>
            </div>

            {/* Allergies & Action Protocols */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-rose-600" />
                    Allergies & Action Protocols ({formData.allergies.length})
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Documented allergens, physiological triggers, and critical emergency intervention steps.
                  </p>
                </div>

                {!isReadOnly && (
                  <button
                    type="button"
                    onClick={handleAddAllergy}
                    className="px-3 py-1.5 text-xs font-bold bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 rounded-xl transition-all flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add Allergen
                  </button>
                )}
              </div>

              {formData.allergies.length === 0 ? (
                <div className="p-4 bg-slate-50 rounded-xl text-slate-500 text-xs">
                  No documented allergies on file for this student.
                </div>
              ) : (
                <div className="space-y-4">
                  {formData.allergies.map((allergy, index) => (
                    <div
                      key={allergy.id}
                      className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-200/60">
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            disabled={isReadOnly}
                            value={allergy.name}
                            onChange={(e) => handleAllergyChange(index, 'name', e.target.value)}
                            className={`text-sm font-bold px-2 py-1 rounded-lg border ${
                              isReadOnly ? 'bg-transparent border-transparent text-slate-900' : 'bg-white border-slate-300'
                            }`}
                          />
                        </div>

                        <div className="flex items-center gap-2">
                          <select
                            disabled={isReadOnly}
                            value={allergy.severity}
                            onChange={(e) => handleAllergyChange(index, 'severity', e.target.value as AllergySeverity)}
                            className={`text-xs px-2.5 py-1 rounded-lg border font-semibold ${
                              isReadOnly
                                ? 'bg-transparent border-transparent text-slate-800'
                                : 'bg-white border-slate-300'
                            }`}
                          >
                            <option value="Severe (Anaphylaxis)">Severe (Anaphylaxis)</option>
                            <option value="Moderate">Moderate</option>
                            <option value="Mild">Mild</option>
                          </select>

                          {!isReadOnly && (
                            <button
                              type="button"
                              onClick={() => handleRemoveAllergy(allergy.id)}
                              className="text-slate-400 hover:text-rose-600 p-1"
                              title="Delete allergy"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        <div>
                          <label className="block text-slate-500 font-medium mb-1">
                            Triggers & Exposure
                          </label>
                          <input
                            type="text"
                            disabled={isReadOnly}
                            value={allergy.triggers}
                            onChange={(e) => handleAllergyChange(index, 'triggers', e.target.value)}
                            className={`w-full px-2.5 py-1.5 rounded-lg border ${
                              isReadOnly ? 'bg-slate-100/70 border-slate-200 text-slate-700' : 'bg-white border-slate-300'
                            }`}
                          />
                        </div>

                        <div>
                          <label className="block text-slate-500 font-medium mb-1">
                            Observed Reaction
                          </label>
                          <input
                            type="text"
                            disabled={isReadOnly}
                            value={allergy.reaction}
                            onChange={(e) => handleAllergyChange(index, 'reaction', e.target.value)}
                            className={`w-full px-2.5 py-1.5 rounded-lg border ${
                              isReadOnly ? 'bg-slate-100/70 border-slate-200 text-slate-700' : 'bg-white border-slate-300'
                            }`}
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-rose-800 mb-1">
                          Emergency Action Plan
                        </label>
                        <textarea
                          rows={2}
                          disabled={isReadOnly}
                          value={allergy.actionPlan}
                          onChange={(e) => handleAllergyChange(index, 'actionPlan', e.target.value)}
                          className={`w-full px-2.5 py-1.5 rounded-lg border text-xs leading-relaxed ${
                            isReadOnly
                              ? 'bg-rose-50/60 border-rose-200 text-rose-950 font-medium'
                              : 'bg-white border-slate-300 text-slate-800'
                          }`}
                        />
                      </div>

                      {allergy.hasEpiPen && (
                        <div className="text-xs">
                          <label className="block text-slate-500 font-medium mb-1">
                            EpiPen Location on Campus
                          </label>
                          <input
                            type="text"
                            disabled={isReadOnly}
                            value={allergy.epipenLocation || ''}
                            onChange={(e) => handleAllergyChange(index, 'epipenLocation', e.target.value)}
                            className={`w-full px-2.5 py-1.5 rounded-lg border ${
                              isReadOnly ? 'bg-slate-100/70 border-slate-200 text-slate-700' : 'bg-white border-slate-300'
                            }`}
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Prescribed Medications */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-base font-bold text-slate-900">
                  Prescribed Medications ({formData.medications.length})
                </h3>
                {!isReadOnly && (
                  <button
                    type="button"
                    onClick={handleAddMedication}
                    className="px-3 py-1.5 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add Medication
                  </button>
                )}
              </div>

              {formData.medications.length === 0 ? (
                <div className="text-xs text-slate-500 p-3 bg-slate-50 rounded-xl">
                  No daily or emergency medications recorded.
                </div>
              ) : (
                <div className="space-y-2">
                  {formData.medications.map((m, idx) => (
                    <div
                      key={m.id}
                      className="p-3 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs items-center"
                    >
                      <div>
                        <span className="text-slate-500 text-[11px] block">Medication</span>
                        <input
                          type="text"
                          disabled={isReadOnly}
                          value={m.name}
                          onChange={(e) => {
                            const updated = [...formData.medications];
                            updated[idx].name = e.target.value;
                            setFormData({ ...formData, medications: updated });
                          }}
                          className={`w-full font-semibold px-2 py-1 rounded-lg border ${
                            isReadOnly ? 'bg-transparent border-transparent' : 'bg-white border-slate-300'
                          }`}
                        />
                      </div>
                      <div>
                        <span className="text-slate-500 text-[11px] block">Dosage</span>
                        <input
                          type="text"
                          disabled={isReadOnly}
                          value={m.dosage}
                          onChange={(e) => {
                            const updated = [...formData.medications];
                            updated[idx].dosage = e.target.value;
                            setFormData({ ...formData, medications: updated });
                          }}
                          className={`w-full px-2 py-1 rounded-lg border ${
                            isReadOnly ? 'bg-transparent border-transparent' : 'bg-white border-slate-300'
                          }`}
                        />
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex-1">
                          <span className="text-slate-500 text-[11px] block">Timing</span>
                          <input
                            type="text"
                            disabled={isReadOnly}
                            value={m.timing}
                            onChange={(e) => {
                              const updated = [...formData.medications];
                              updated[idx].timing = e.target.value;
                              setFormData({ ...formData, medications: updated });
                            }}
                            className={`w-full px-2 py-1 rounded-lg border ${
                              isReadOnly ? 'bg-transparent border-transparent' : 'bg-white border-slate-300'
                            }`}
                          />
                        </div>
                        {!isReadOnly && (
                          <button
                            type="button"
                            onClick={() => handleRemoveMedication(m.id)}
                            className="text-slate-400 hover:text-rose-600 p-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Emergency Contacts & Physician Information */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs space-y-4">
              <div className="pb-3 border-b border-slate-100">
                <h3 className="text-base font-bold text-slate-900">
                  Emergency Contacts & Physician
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Primary Guardian
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-500 block">Name</label>
                    <input
                      type="text"
                      disabled={isReadOnly}
                      value={formData.parentName}
                      onChange={(e) => setFormData({ ...formData, parentName: e.target.value })}
                      className={`w-full px-2.5 py-1 text-xs border rounded-lg ${
                        isReadOnly ? 'bg-slate-100 border-slate-200' : 'bg-white border-slate-300'
                      }`}
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-500 block">Phone</label>
                    <input
                      type="tel"
                      disabled={isReadOnly}
                      value={formData.parentPhone}
                      onChange={(e) => setFormData({ ...formData, parentPhone: e.target.value })}
                      className={`w-full px-2.5 py-1 text-xs border rounded-lg font-mono ${
                        isReadOnly ? 'bg-slate-100 border-slate-200' : 'bg-white border-slate-300'
                      }`}
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-500 block">Email</label>
                    <input
                      type="email"
                      disabled={isReadOnly}
                      value={formData.parentEmail}
                      onChange={(e) => setFormData({ ...formData, parentEmail: e.target.value })}
                      className={`w-full px-2.5 py-1 text-xs border rounded-lg ${
                        isReadOnly ? 'bg-slate-100 border-slate-200' : 'bg-white border-slate-300'
                      }`}
                    />
                  </div>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Secondary Contact ({formData.secondaryContact.relation})
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-500 block">Name</label>
                    <input
                      type="text"
                      disabled={isReadOnly}
                      value={formData.secondaryContact.name}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          secondaryContact: { ...formData.secondaryContact, name: e.target.value },
                        })
                      }
                      className={`w-full px-2.5 py-1 text-xs border rounded-lg ${
                        isReadOnly ? 'bg-slate-100 border-slate-200' : 'bg-white border-slate-300'
                      }`}
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-500 block">Phone</label>
                    <input
                      type="tel"
                      disabled={isReadOnly}
                      value={formData.secondaryContact.phone}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          secondaryContact: { ...formData.secondaryContact, phone: e.target.value },
                        })
                      }
                      className={`w-full px-2.5 py-1 text-xs border rounded-lg font-mono ${
                        isReadOnly ? 'bg-slate-100 border-slate-200' : 'bg-white border-slate-300'
                      }`}
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Classroom & Field Trip Instructions
                </label>
                <textarea
                  rows={2}
                  disabled={isReadOnly}
                  value={formData.specialNotes}
                  onChange={(e) => setFormData({ ...formData, specialNotes: e.target.value })}
                  className={`w-full px-3 py-2 text-xs border rounded-xl ${
                    isReadOnly ? 'bg-slate-50 border-slate-200' : 'bg-white border-slate-300'
                  }`}
                />
              </div>
            </div>

            {/* Bottom Actions */}
            {!isReadOnly && (
              <div className="flex justify-end p-5 bg-white rounded-2xl border border-slate-200/90 shadow-xs">
                <button
                  type="submit"
                  className="px-6 py-2.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition-all shadow-xs flex items-center gap-1.5"
                >
                  <Save className="w-4 h-4" />
                  Save Updated Medical Record
                </button>
              </div>
            )}
          </form>
        </div>
      </div>

      {showEmergencyCard && (
        <EmergencyCardModal
          student={activeStudent}
          onClose={() => setShowEmergencyCard(false)}
        />
      )}
    </div>
  );
}
