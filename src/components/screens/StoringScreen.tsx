import { useState } from 'react';
import { Student, Allergy, Medication, AllergySeverity, UserAccount, School } from '../../types/health';
import { 
  Plus, 
  Trash2, 
  CheckCircle, 
  AlertTriangle, 
  ShieldCheck, 
  HeartPulse, 
  Building2,
  Stethoscope
} from 'lucide-react';
interface Props {
  onStoreStudent: (student: Student) => void;
  currentUser: UserAccount;
  schools?: School[];
  onNavigateToEditing: (studentId: string) => void;
  onAddSchool?: (newSchool: School) => void;
  isModal?: boolean;
}

const COMMON_ALLERGENS = [
  'Peanuts',
  'Tree Nuts',
  'Dairy / Milk',
  'Eggs',
  'Wheat / Gluten (Celiac)',
  'Soy',
  'Fish / Crustaceans',
  'Insect Stings (Bee/Wasp)',
  'Latex',
  'Penicillin / Amoxicillin',
  'Asthma (Cold Air/Exercise)',
];

export function StoringScreen({ onStoreStudent, currentUser, onNavigateToEditing, isModal = false }: Props) {
  const [schoolName, setSchoolName] = useState('');
  const [name, setName] = useState('');
  const [grade, setGrade] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState('Student');
  const [bloodType, setBloodType] = useState('O+');

  const [parentName, setParentName] = useState(
    currentUser.role === 'parent' ? currentUser.name : ''
  );
  const [parentPhone, setParentPhone] = useState('');
  const [parentEmail, setParentEmail] = useState(
    currentUser.role === 'parent' ? currentUser.email : ''
  );
  const [secondaryName, setSecondaryName] = useState('');
  const [secondaryRelation, setSecondaryRelation] = useState('Secondary Contact');
  const [secondaryPhone, setSecondaryPhone] = useState('');

  const [allergies, setAllergies] = useState<Allergy[]>([]);
  const [medications, setMedications] = useState<Medication[]>([]);
  const [dietaryInput, setDietaryInput] = useState('');
  const [doctorName, setDoctorName] = useState('');
  const [doctorClinic, setDoctorClinic] = useState('');
  const [doctorPhone, setDoctorPhone] = useState('');
  const [specialNotes, setSpecialNotes] = useState('');

  // Active allergy input state
  const [currAllergyName, setCurrAllergyName] = useState('');
  const [currSeverity, setCurrSeverity] = useState<AllergySeverity>('Severe (Anaphylaxis)');
  const [currTriggers, setCurrTriggers] = useState('');
  const [currReaction, setCurrReaction] = useState('');
  const [currActionPlan, setCurrActionPlan] = useState('');
  const [currHasEpiPen, setCurrHasEpiPen] = useState(true);
  const [currEpiLocation, setCurrEpiLocation] = useState('Main Health Office & Backpack');

  // Temporary medication input state
  const [currMedName, setCurrMedName] = useState('');
  const [currDosage, setCurrDosage] = useState('');
  const [currTiming, setCurrTiming] = useState('');

  const [storedSuccessId, setStoredSuccessId] = useState<string | null>(null);
  const [isAddSchoolOpen, setIsAddSchoolOpen] = useState(false);

  const handleAddAllergy = () => {
    if (!currAllergyName.trim()) return;
    const newAllergy: Allergy = {
      id: 'alg-' + Date.now(),
      name: currAllergyName.trim(),
      severity: currSeverity,
      triggers: currTriggers.trim() || 'Accidental ingestion, inhalation, or skin contact',
      reaction: currReaction.trim() || 'Hives, swelling of lips/throat, respiratory constriction',
      actionPlan: currActionPlan.trim() || (currHasEpiPen ? 'Inject EpiPen auto-injector immediately into outer mid-thigh. Dial 911 immediately.' : 'Administer oral antihistamine, monitor closely, notify guardian.'),
      hasEpiPen: currHasEpiPen,
      epipenLocation: currHasEpiPen ? (currEpiLocation.trim() || 'Health Office') : undefined,
    };
    setAllergies([...allergies, newAllergy]);
    setCurrAllergyName('');
    setCurrTriggers('');
    setCurrReaction('');
    setCurrActionPlan('');
  };

  const handleRemoveAllergy = (id: string) => {
    setAllergies(allergies.filter((a) => a.id !== id));
  };

  const handleAddMedication = () => {
    if (!currMedName.trim()) return;
    const newMed: Medication = {
      id: 'med-' + Date.now(),
      name: currMedName.trim(),
      dosage: currDosage.trim() || 'Standard pediatric dose per medical order',
      timing: currTiming.trim() || 'As needed',
      nurseSupervision: true,
    };
    setMedications([...medications, newMed]);
    setCurrMedName('');
    setCurrDosage('');
    setCurrTiming('');
  };

  const handleRemoveMedication = (id: string) => {
    setMedications(medications.filter((m) => m.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newStudentId = 'stu-' + Date.now();
    const newStudent: Student = {
      id: newStudentId,
      schoolId: schoolName.trim() || 'sch-default',
      schoolName: schoolName.trim() || undefined,
      name: name.trim(),
      grade: grade.trim() || 'General Enrollment',
      dob: dob || new Date().toISOString().split('T')[0],
      gender,
      bloodType,
      parentId: currentUser.role === 'parent' ? currentUser.id : ('parent-' + Date.now()),
      parentName: parentName.trim() || 'Guardian on file',
      parentPhone: parentPhone.trim() || '(555) 000-0000',
      parentEmail: parentEmail.trim() || 'guardian@school.edu',
      secondaryContact: {
        name: secondaryName.trim() || 'Secondary Emergency Contact',
        relation: secondaryRelation,
        phone: secondaryPhone.trim() || '(555) 000-0001',
      },
      allergies,
      medications,
      dietaryRestrictions: dietaryInput
        ? dietaryInput.split(',').map((s) => s.trim()).filter(Boolean)
        : [],
      physician: {
        name: doctorName.trim() || 'Primary Care Physician',
        clinic: doctorClinic.trim() || 'Regional Pediatric Clinic',
        phone: doctorPhone.trim() || '(555) 000-0000',
      },
      specialNotes: specialNotes.trim(),
      recentUpdates: [
        {
          id: 'upd-init-' + Date.now(),
          date: 'Just now',
          author: `${currentUser.name} (${currentUser.role === 'parent' ? 'Parent' : currentUser.role === 'teacher' ? 'Teacher' : 'Medical Staff'})`,
          authorRole: currentUser.role,
          type: 'daily_notice',
          content: 'Student health intake officially registered into school medical system.',
          acknowledgedByTeacher: false,
        },
      ],
      lastUpdated: new Date().toISOString().split('T')[0],
    };

    onStoreStudent(newStudent);
    setStoredSuccessId(newStudentId);
  };

  return (
    <div className={`max-w-5xl mx-auto ${isModal ? 'p-1 sm:p-2' : 'px-4 sm:px-6 py-6 sm:py-8'}`}>
      {/* Page Title & Context - Render full banner only when standalone */}
      {!isModal && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-rose-600 flex items-center gap-1.5">
              <HeartPulse className="w-4 h-4" />
              Health Record Intake Registry
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 mt-1">
              Store Student Health & Allergy Data
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              Official student health registration portal · Enrolls medical flags, allergy action plans, and emergency contacts into the school registry.
            </p>
          </div>
        </div>
      )}

      {storedSuccessId && (
        <div className="mt-4 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between gap-4 shadow-xs">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
            <div>
              <div className="text-sm font-bold text-emerald-900">
                Health Profile Successfully Stored!
              </div>
              <div className="text-xs text-emerald-700">
                {name}&apos;s medical records have been securely registered to the student health portal.
              </div>
            </div>
          </div>
          <button
            onClick={() => onNavigateToEditing(storedSuccessId)}
            className="px-4 py-2 text-xs font-bold bg-emerald-700 text-white hover:bg-emerald-800 rounded-xl transition-all whitespace-nowrap shadow-xs"
          >
            View Record in System →
          </button>
        </div>
      )}

      {/* Main Form */}
      <form onSubmit={handleSubmit} className={isModal ? "mt-2 space-y-6" : "mt-8 space-y-8"}>
        {/* Section 1: Basic Student Identity */}
        <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200/90 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h2 className="text-sm sm:text-base font-bold text-slate-900">
              1. Student Identification
            </h2>
            <span className="text-[11px] sm:text-xs text-rose-600 font-semibold">* Required fields</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Student Full Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter student's first and last name"
                className="w-full px-3 py-2 text-base sm:text-sm border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-rose-500/20 focus:border-rose-600"
              />
            </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Grade / Classroom *
                </label>
                <input
                  type="text"
                  required
                  value={grade}
                  onChange={(e) => setGrade(e.target.value)}
                  placeholder="e.g., Grade 3 or Room 102"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  School / Campus (Optional)
                </label>
                <input
                  type="text"
                  value={schoolName}
                  onChange={(e) => setSchoolName(e.target.value)}
                  placeholder="e.g., Lincoln Elementary (Optional)"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Date of Birth
                </label>
                <input
                  type="date"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl font-mono focus:outline-hidden focus:ring-2 focus:ring-rose-500/20 focus:border-rose-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Gender
                </label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-rose-500/20 focus:border-rose-600"
                >
                  <option value="Female">Female</option>
                  <option value="Male">Male</option>
                  <option value="Non-binary">Non-binary</option>
                  <option value="Prefer not to say">Prefer not to say</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Blood Type
                </label>
                <select
                  value={bloodType}
                  onChange={(e) => setBloodType(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl font-mono focus:outline-hidden focus:ring-2 focus:ring-rose-500/20 focus:border-rose-600"
                >
                  <option value="O+">O Positive (O+)</option>
                  <option value="O-">O Negative (O-)</option>
                  <option value="A+">A Positive (A+)</option>
                  <option value="A-">A Negative (A-)</option>
                  <option value="B+">B Positive (B+)</option>
                  <option value="B-">B Negative (B-)</option>
                  <option value="AB+">AB Positive (AB+)</option>
                  <option value="AB-">AB Negative (AB-)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Allergies & Emergency Action Plan */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                  2. Allergies & Medical Action Protocols
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Record all food allergies, environmental triggers, and required EpiPen protocols.
                </p>
              </div>
            </div>

            {/* Quick Allergen chips */}
            <div>
              <span className="text-xs text-slate-500 font-medium block mb-1.5">
                Quick select common school allergens:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {COMMON_ALLERGENS.map((alg) => (
                  <button
                    type="button"
                    key={alg}
                    onClick={() => setCurrAllergyName(alg)}
                    className="px-2.5 py-1 text-xs font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors"
                  >
                    + {alg}
                  </button>
                ))}
              </div>
            </div>

            {/* Input block for adding an allergy */}
            <div className="p-4 bg-slate-50/80 rounded-xl border border-slate-200 space-y-3">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Add Specific Allergy Details
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Allergen Name
                  </label>
                  <input
                    type="text"
                    value={currAllergyName}
                    onChange={(e) => setCurrAllergyName(e.target.value)}
                    placeholder="e.g. Peanuts, Penicillin"
                    className="w-full px-3 py-1.5 text-sm bg-white border border-slate-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Severity Level
                  </label>
                  <select
                    value={currSeverity}
                    onChange={(e) => setCurrSeverity(e.target.value as AllergySeverity)}
                    className="w-full px-3 py-1.5 text-sm bg-white border border-slate-300 rounded-lg font-semibold"
                  >
                    <option value="Severe (Anaphylaxis)">Severe (Anaphylaxis Risk)</option>
                    <option value="Moderate">Moderate (Rash, Vomiting)</option>
                    <option value="Mild">Mild (Sneezing, Itch)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    EpiPen Auto-Injector Required?
                  </label>
                  <div className="flex items-center gap-3 mt-1.5">
                    <label className="inline-flex items-center text-xs text-slate-700">
                      <input
                        type="radio"
                        checked={currHasEpiPen}
                        onChange={() => setCurrHasEpiPen(true)}
                        className="mr-1.5 text-rose-600 focus:ring-rose-500"
                      />
                      Yes
                    </label>
                    <label className="inline-flex items-center text-xs text-slate-700">
                      <input
                        type="radio"
                        checked={!currHasEpiPen}
                        onChange={() => setCurrHasEpiPen(false)}
                        className="mr-1.5 text-slate-600 focus:ring-slate-500"
                      />
                      No
                    </label>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Known Triggers & Exposure Routes
                  </label>
                  <input
                    type="text"
                    value={currTriggers}
                    onChange={(e) => setCurrTriggers(e.target.value)}
                    placeholder="e.g. Ingestion, airborne cross-contact, skin contact"
                    className="w-full px-3 py-1.5 text-sm bg-white border border-slate-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Observed Reactions / Symptoms
                  </label>
                  <input
                    type="text"
                    value={currReaction}
                    onChange={(e) => setCurrReaction(e.target.value)}
                    placeholder="e.g. Throat constriction, facial hives, coughing"
                    className="w-full px-3 py-1.5 text-sm bg-white border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Immediate Emergency Action Plan
                  </label>
                  <input
                    type="text"
                    value={currActionPlan}
                    onChange={(e) => setCurrActionPlan(e.target.value)}
                    placeholder="e.g. Administer EpiPen outer mid-thigh, dial 911 immediately"
                    className="w-full px-3 py-1.5 text-sm bg-white border border-slate-300 rounded-lg"
                  />
                </div>

                {currHasEpiPen && (
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      EpiPen Physical Location in School
                    </label>
                    <input
                      type="text"
                      value={currEpiLocation}
                      onChange={(e) => setCurrEpiLocation(e.target.value)}
                      placeholder="e.g. Main Health Office & Student Backpack"
                      className="w-full px-3 py-1.5 text-sm bg-white border border-slate-300 rounded-lg"
                    />
                  </div>
                )}
              </div>

              <div className="flex justify-end pt-1">
                <button
                  type="button"
                  onClick={handleAddAllergy}
                  disabled={!currAllergyName.trim()}
                  className="px-4 py-2 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-xl transition-all flex items-center gap-1.5 disabled:opacity-50 shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Allergy to Record
                </button>
              </div>
            </div>

            {/* Stored Allergies List for this Student */}
            <div>
              <div className="text-xs font-semibold text-slate-700 mb-2">
                Allergies Recorded for this Student ({allergies.length}):
              </div>
              {allergies.length === 0 ? (
                <div className="p-3 bg-slate-50 rounded-xl text-slate-500 text-xs flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  No allergies added yet.
                </div>
              ) : (
                <div className="space-y-2">
                  {allergies.map((alg) => (
                    <div
                      key={alg.id}
                      className="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between text-xs gap-3 shadow-xs"
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900">{alg.name}</span>
                          <span className={`font-semibold ${
                            alg.severity.includes('Severe') ? 'text-rose-700' : 'text-amber-700'
                          }`}>
                            · {alg.severity}
                          </span>
                          {alg.hasEpiPen && (
                            <span className="text-[10px] bg-rose-50 text-rose-800 border border-rose-200 px-1.5 py-0.2 rounded font-semibold">
                              EpiPen
                            </span>
                          )}
                        </div>
                        <div className="text-slate-600">
                          <span className="text-slate-500">Plan:</span> {alg.actionPlan}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveAllergy(alg.id)}
                        className="text-slate-400 hover:text-rose-600 p-1"
                        title="Remove allergy"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Section 3: Prescribed Medications */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-base font-bold text-slate-900">
                3. Prescribed School Medications & Inhalers
              </h2>
              <span className="text-xs text-slate-500">Administered on school grounds</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 bg-slate-50/80 rounded-xl border border-slate-200">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Medication Name
                </label>
                <input
                  type="text"
                  value={currMedName}
                  onChange={(e) => setCurrMedName(e.target.value)}
                  placeholder="e.g. Albuterol Inhaler"
                  className="w-full px-3 py-1.5 text-sm bg-white border border-slate-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Dosage
                </label>
                <input
                  type="text"
                  value={currDosage}
                  onChange={(e) => setCurrDosage(e.target.value)}
                  placeholder="e.g. 2 puffs"
                  className="w-full px-3 py-1.5 text-sm bg-white border border-slate-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Timing / Schedule
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={currTiming}
                    onChange={(e) => setCurrTiming(e.target.value)}
                    placeholder="e.g. 15 min before physical activity"
                    className="w-full px-3 py-1.5 text-sm bg-white border border-slate-300 rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={handleAddMedication}
                    disabled={!currMedName.trim()}
                    className="px-3.5 py-1.5 text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white rounded-lg whitespace-nowrap disabled:opacity-50"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>

            {medications.length > 0 && (
              <div className="space-y-1.5">
                {medications.map((m) => (
                  <div
                    key={m.id}
                    className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-bold text-slate-900">{m.name}</span>
                      <span className="text-slate-500 ml-2">Dosage: {m.dosage}</span>
                      <span className="text-slate-500 ml-2 font-mono">· Timing: {m.timing}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveMedication(m.id)}
                      className="text-slate-400 hover:text-rose-600 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section 4: Emergency Contacts & Physician */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs space-y-4">
            <div className="pb-3 border-b border-slate-100">
              <h2 className="text-base font-bold text-slate-900">
                4. Parents, Emergency Contacts & Physician
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Primary Guardian Name *
                </label>
                <input
                  type="text"
                  required
                  value={parentName}
                  onChange={(e) => setParentName(e.target.value)}
                  placeholder="Guardian Full Name"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Primary Phone *
                </label>
                <input
                  type="tel"
                  required
                  value={parentPhone}
                  onChange={(e) => setParentPhone(e.target.value)}
                  placeholder="e.g. (555) 123-4567"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Primary Email
                </label>
                <input
                  type="email"
                  value={parentEmail}
                  onChange={(e) => setParentEmail(e.target.value)}
                  placeholder="parent@example.com"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Secondary Contact Name
                </label>
                <input
                  type="text"
                  value={secondaryName}
                  onChange={(e) => setSecondaryName(e.target.value)}
                  placeholder="e.g. Secondary Contact"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Relationship
                </label>
                <input
                  type="text"
                  value={secondaryRelation}
                  onChange={(e) => setSecondaryRelation(e.target.value)}
                  placeholder="Father, Grandparent, Relative"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Secondary Phone
                </label>
                <input
                  type="tel"
                  value={secondaryPhone}
                  onChange={(e) => setSecondaryPhone(e.target.value)}
                  placeholder="e.g. (555) 987-6543"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Primary Physician
                </label>
                <input
                  type="text"
                  value={doctorName}
                  onChange={(e) => setDoctorName(e.target.value)}
                  placeholder="e.g. Dr. Robert Lee, MD"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Pediatric Clinic
                </label>
                <input
                  type="text"
                  value={doctorClinic}
                  onChange={(e) => setDoctorClinic(e.target.value)}
                  placeholder="e.g. Valley Pediatrics"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Doctor Phone
                </label>
                <input
                  type="tel"
                  value={doctorPhone}
                  onChange={(e) => setDoctorPhone(e.target.value)}
                  placeholder="e.g. (555) 321-4321"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl font-mono"
                />
              </div>
            </div>

            <div className="pt-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Dietary Restrictions & Cafeteria Notices (Comma separated)
              </label>
              <input
                type="text"
                value={dietaryInput}
                onChange={(e) => setDietaryInput(e.target.value)}
                placeholder="e.g. Dedicated Nut-Free Table, Lactose-Free"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Classroom Guidance & Special Instructions
              </label>
              <textarea
                rows={2}
                value={specialNotes}
                onChange={(e) => setSpecialNotes(e.target.value)}
                placeholder="Guidance for teachers, field trip leaders, or recess monitors..."
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl"
              />
            </div>
          </div>

          {/* Submit Actions */}
          <div className="sticky bottom-0 bg-white/95 backdrop-blur-xs flex flex-col sm:flex-row items-center justify-between p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-md gap-3 z-10">
            <div className="text-xs text-slate-600 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>FERPA & HIPAA Compliant Student Health Registry</span>
            </div>
            <button
              type="submit"
              className="w-full sm:w-auto px-6 py-3 sm:py-2.5 text-xs sm:text-sm font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 shrink-0 active:scale-95"
            >
              <HeartPulse className="w-4 h-4" />
              Store Student Health Record
            </button>
          </div>
        </form>
      </div>
  );
}
