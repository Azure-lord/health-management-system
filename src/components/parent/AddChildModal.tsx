import { useState } from 'react';
import { Student, Allergy, AllergySeverity, UserAccount, School } from '../../types/health';
import { X, Plus, Trash2, HeartPulse, AlertTriangle, ShieldCheck } from 'lucide-react';
interface Props {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserAccount;
  schools?: School[];
  onAddChild: (newStudent: Student) => void;
  onAddSchool?: (newSchool: School) => void;
}

const COMMON_ALLERGENS = [
  'Peanuts',
  'Tree Nuts',
  'Dairy / Milk',
  'Eggs',
  'Gluten / Wheat',
  'Soy',
  'Fish / Shellfish',
  'Insect Stings (Bee/Wasp)',
  'Latex',
  'Penicillin / Amoxicillin',
  'Asthma (Exercise/Cold)',
];

export function AddChildModal({
  isOpen,
  onClose,
  currentUser,
  schools,
  onAddChild,
}: Props) {
  const [name, setName] = useState('');
  const [schoolName, setSchoolName] = useState('');
  const [grade, setGrade] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState('Child');
  const [bloodType, setBloodType] = useState('O+');

  const [parentPhone, setParentPhone] = useState('');
  const [secondaryName, setSecondaryName] = useState('');
  const [secondaryRelation, setSecondaryRelation] = useState('Emergency Contact');
  const [secondaryPhone, setSecondaryPhone] = useState('');

  const [doctorName, setDoctorName] = useState('');
  const [doctorPhone, setDoctorPhone] = useState('');
  const [doctorClinic, setDoctorClinic] = useState('');

  const [allergies, setAllergies] = useState<Allergy[]>([]);
  const [dietaryNotes, setDietaryNotes] = useState('');
  const [specialInstructions, setSpecialInstructions] = useState('');

  // Active allergen input
  const [allergenName, setAllergenName] = useState('');
  const [severity, setSeverity] = useState<AllergySeverity>('Severe (Anaphylaxis)');
  const [hasEpiPen, setHasEpiPen] = useState(true);
  const [actionPlan, setActionPlan] = useState('');
  const [epipenLocation, setEpipenLocation] = useState('Health Office & Student Backpack');

  const [isAddSchoolOpen, setIsAddSchoolOpen] = useState(false);

  if (!isOpen) return null;

  const handleAddAllergen = () => {
    if (!allergenName.trim()) return;
    const newAlg: Allergy = {
      id: 'alg-' + Date.now(),
      name: allergenName.trim(),
      severity,
      triggers: 'Accidental ingestion, skin contact, or inhalation',
      reaction: 'Cutaneous hives, facial swelling, or breathing restriction',
      actionPlan: actionPlan.trim() || (hasEpiPen ? 'Inject EpiPen auto-injector into outer mid-thigh immediately, dial 911, notify parents.' : 'Administer antihistamine, monitor, contact guardian.'),
      hasEpiPen,
      epipenLocation: hasEpiPen ? (epipenLocation.trim() || 'Health Office') : undefined,
    };
    setAllergies([...allergies, newAlg]);
    setAllergenName('');
    setActionPlan('');
  };

  const handleRemoveAllergen = (id: string) => {
    setAllergies(allergies.filter((a) => a.id !== id));
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
      grade: grade.trim() || 'Classroom',
      dob: dob || new Date().toISOString().split('T')[0],
      gender,
      bloodType,
      parentId: currentUser.id,
      parentName: currentUser.name,
      parentPhone: parentPhone.trim() || '(555) 000-0000',
      parentEmail: currentUser.email,
      secondaryContact: {
        name: secondaryName.trim() || 'Emergency Contact',
        relation: secondaryRelation,
        phone: secondaryPhone.trim() || '(555) 000-0001',
      },
      allergies,
      medications: [],
      dietaryRestrictions: dietaryNotes ? [dietaryNotes.trim()] : [],
      physician: {
        name: doctorName.trim() || 'Primary Care Physician',
        clinic: doctorClinic.trim() || 'Pediatric Clinic',
        phone: doctorPhone.trim() || '(555) 000-0000',
      },
      specialNotes: specialInstructions.trim(),
      recentUpdates: [
        {
          id: 'upd-init-' + Date.now(),
          date: 'Just now',
          author: `${currentUser.name} (Parent)`,
          authorRole: 'parent',
          type: 'daily_notice',
          content: 'Student health record officially enrolled by parent into school registry.',
          acknowledgedByTeacher: false,
        },
      ],
      lastUpdated: new Date().toISOString().split('T')[0],
    };

    onAddChild(newStudent);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-start justify-center p-0 sm:p-4 overflow-y-auto overscroll-contain">
      <div 
        className="bg-white rounded-none sm:rounded-2xl max-w-2xl w-full border-0 sm:border border-slate-200 shadow-2xl overflow-hidden h-[100dvh] sm:h-auto sm:max-h-[90vh] flex flex-col my-0 sm:my-auto shrink-0"
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-child-title"
      >
        {/* Header - Fixed & Sticky at top */}
        <div className="bg-slate-900 text-white px-4 sm:px-6 py-3.5 sm:py-4 flex items-center justify-between shrink-0 shadow-xs z-20">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-rose-600 text-white flex items-center justify-center shadow-xs shrink-0">
              <HeartPulse className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <h2 id="add-child-title" className="text-sm sm:text-base font-bold tracking-tight">
                Enroll Child Health Profile
              </h2>
              <p className="text-[11px] sm:text-xs text-slate-400">
                Register child health records, allergy protocols, and emergency lines
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-lg transition-colors active:bg-slate-800"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body - Smoothly scrollable from top to bottom without top cutoff */}
        <form onSubmit={handleSubmit} className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6 space-y-6 text-xs overscroll-contain">
          {/* 1. Basic Identity */}
          <div className="space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
              1. Student Information
            </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">
                    Child&apos;s Full Legal Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter first and last name"
                    className="w-full px-3 py-2 text-base sm:text-sm border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-rose-500/20 focus:border-rose-600"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    School / Campus (Optional)
                  </label>
                  <input
                    type="text"
                    value={schoolName}
                    onChange={(e) => setSchoolName(e.target.value)}
                    placeholder="e.g. Lincoln Elementary (Optional)"
                    className="w-full px-3 py-2 text-base sm:text-sm border border-slate-300 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Grade / Room *</label>
                  <input
                    type="text"
                    required
                    value={grade}
                    onChange={(e) => setGrade(e.target.value)}
                    placeholder="e.g., Grade 3 or Room 102"
                    className="w-full px-3 py-2 text-base sm:text-sm border border-slate-300 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Date of Birth</label>
                  <input
                    type="date"
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                    className="w-full px-3 py-2 text-base sm:text-sm border border-slate-300 rounded-xl font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Blood Type</label>
                  <select
                    value={bloodType}
                    onChange={(e) => setBloodType(e.target.value)}
                    className="w-full px-3 py-2 text-base sm:text-sm border border-slate-300 rounded-xl font-mono font-semibold"
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

            {/* 2. Allergies & Action Protocol */}
            <div className="space-y-3 pt-3 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                  2. Allergies & Emergency Protocols
                </span>
                <span className="text-[11px] text-slate-400">Leave blank if no allergies</span>
              </div>

              {/* Quick allergen chips */}
              <div>
                <span className="text-[11px] text-slate-500 block mb-1">Common Allergens (Click to select):</span>
                <div className="flex flex-wrap gap-1">
                  {COMMON_ALLERGENS.map((alg) => (
                    <button
                      type="button"
                      key={alg}
                      onClick={() => setAllergenName(alg)}
                      className="px-2 py-0.5 text-[11px] font-medium bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-md text-slate-700 transition-colors"
                    >
                      + {alg}
                    </button>
                  ))}
                </div>
              </div>

              {/* Add allergen box */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2.5">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-0.5">Allergen Name</label>
                    <input
                      type="text"
                      value={allergenName}
                      onChange={(e) => setAllergenName(e.target.value)}
                      placeholder="e.g., Peanuts, Penicillin"
                      className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-0.5">Severity</label>
                    <select
                      value={severity}
                      onChange={(e) => setSeverity(e.target.value as AllergySeverity)}
                      className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg font-semibold"
                    >
                      <option value="Severe (Anaphylaxis)">Severe (Anaphylaxis Risk)</option>
                      <option value="Moderate">Moderate (Rash, Vomiting)</option>
                      <option value="Mild">Mild (Sneezing, Itch)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-0.5">EpiPen Prescribed?</label>
                    <div className="flex items-center gap-3 mt-1.5">
                      <label className="inline-flex items-center text-xs">
                        <input
                          type="radio"
                          checked={hasEpiPen}
                          onChange={() => setHasEpiPen(true)}
                          className="mr-1 text-rose-600"
                        />
                        Yes
                      </label>
                      <label className="inline-flex items-center text-xs">
                        <input
                          type="radio"
                          checked={!hasEpiPen}
                          onChange={() => setHasEpiPen(false)}
                          className="mr-1 text-slate-600"
                        />
                        No
                      </label>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-0.5">Immediate Action Plan</label>
                  <input
                    type="text"
                    value={actionPlan}
                    onChange={(e) => setActionPlan(e.target.value)}
                    placeholder="e.g., Administer EpiPen outer mid-thigh, call 911 immediately"
                    className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg"
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={handleAddAllergen}
                    disabled={!allergenName.trim()}
                    className="px-3 py-1.5 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-lg transition-colors flex items-center gap-1 disabled:opacity-40"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add Allergen to Record
                  </button>
                </div>
              </div>

              {/* List */}
              {allergies.length > 0 && (
                <div className="space-y-1.5">
                  {allergies.map((a) => (
                    <div key={a.id} className="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between text-xs">
                      <div>
                        <span className="font-bold text-slate-900">{a.name}</span>
                        <span className={`ml-2 font-semibold ${a.severity.includes('Severe') ? 'text-rose-700' : 'text-amber-700'}`}>
                          · {a.severity}
                        </span>
                        {a.hasEpiPen && (
                          <span className="ml-2 text-[10px] bg-rose-50 text-rose-800 border border-rose-200 px-1.5 py-0.2 rounded font-semibold">
                            EpiPen
                          </span>
                        )}
                        <p className="text-[11px] text-slate-600 mt-0.5">{a.actionPlan}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveAllergen(a.id)}
                        className="text-slate-400 hover:text-rose-600 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 3. Emergency Contacts */}
            <div className="space-y-3 pt-3 border-t border-slate-100">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
                3. Immediate Emergency Contacts
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Your Direct Phone *</label>
                  <input
                    type="tel"
                    required
                    value={parentPhone}
                    onChange={(e) => setParentPhone(e.target.value)}
                    placeholder="e.g., (555) 123-4567"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Secondary Contact Name</label>
                  <input
                    type="text"
                    value={secondaryName}
                    onChange={(e) => setSecondaryName(e.target.value)}
                    placeholder="e.g., Jane Smith"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Secondary Phone</label>
                  <input
                    type="tel"
                    value={secondaryPhone}
                    onChange={(e) => setSecondaryPhone(e.target.value)}
                    placeholder="e.g., (555) 987-6543"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl font-mono"
                  />
                </div>
              </div>
            </div>

            {/* 4. Physician & Special Notes */}
            <div className="space-y-3 pt-3 border-t border-slate-100">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
                4. Primary Physician & Dietary Precautions
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Pediatrician Name</label>
                  <input
                    type="text"
                    value={doctorName}
                    onChange={(e) => setDoctorName(e.target.value)}
                    placeholder="e.g., Dr. Robert Lee, MD"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Clinic / Hospital</label>
                  <input
                    type="text"
                    value={doctorClinic}
                    onChange={(e) => setDoctorClinic(e.target.value)}
                    placeholder="e.g., Valley Pediatrics"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Doctor Phone</label>
                  <input
                    type="tel"
                    value={doctorPhone}
                    onChange={(e) => setDoctorPhone(e.target.value)}
                    placeholder="e.g., (555) 321-4321"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Dietary Restrictions</label>
                <input
                  type="text"
                  value={dietaryNotes}
                  onChange={(e) => setDietaryNotes(e.target.value)}
                  placeholder="e.g., Nut-free table, lactose-free milk"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Classroom / Recess Guidance</label>
                <textarea
                  rows={2}
                  value={specialInstructions}
                  onChange={(e) => setSpecialInstructions(e.target.value)}
                  placeholder="Additional guidance for classroom teachers, field trip leaders, or recess monitors..."
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl"
                />
              </div>
            </div>

            {/* Footer Actions */}
            <div className="sticky bottom-0 bg-white/95 backdrop-blur-xs flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 pb-3 sm:pb-2 border-t border-slate-200 mt-6 z-10 shrink-0">
              <div className="text-[11px] text-slate-500 w-full sm:w-auto text-center sm:text-left">
                {!name.trim() ? (
                  <span className="text-rose-600 font-semibold">
                    * Enter child&apos;s full name above to submit
                  </span>
                ) : (
                  <span className="text-emerald-700 font-medium flex items-center gap-1 justify-center sm:justify-start">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Ready for registration
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 sm:flex-initial px-4 py-2.5 sm:py-2 border border-slate-300 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!name.trim()}
                  className="flex-1 sm:flex-initial px-5 py-2.5 sm:py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl transition-all shadow-xs flex items-center justify-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed active:scale-95"
                >
                  <ShieldCheck className="w-4 h-4" />
                  Register Profile
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
  );
}
