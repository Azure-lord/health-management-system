import { useState, useEffect } from 'react';
import { Student, Allergy, Medication, AllergySeverity, UserAccount, School, HealthUpdate } from '../../types/health';
import { 
  User, 
  Plus, 
  Trash2, 
  Save, 
  AlertTriangle, 
  ShieldCheck, 
  Send, 
  CheckCheck, 
  Printer, 
  Phone, 
  CheckCircle,
  FileText,
  Clock,
  Sparkles
} from 'lucide-react';
import { AddChildModal } from './AddChildModal';
import { EmergencyCardModal } from '../common/EmergencyCardModal';

interface Props {
  currentUser: UserAccount;
  students: Student[];
  schools?: School[];
  onUpdateStudent: (updatedStudent: Student) => void;
  onAddChild: (newStudent: Student) => void;
  onAddDailyUpdate: (studentId: string, update: HealthUpdate) => void;
  onAddSchool?: (newSchool: School) => void;
  onDeleteChild?: (studentId: string) => void;
}

export function ParentPortal({
  currentUser,
  students,
  schools,
  onUpdateStudent,
  onAddChild,
  onAddDailyUpdate,
  onAddSchool,
  onDeleteChild,
}: Props) {
  // Find all children linked to this parent (with seamless fallback for default demo parent account)
  const matchedChildren = students.filter(
    (s) =>
      s.parentId === currentUser.id ||
      currentUser.linkedStudentIds?.includes(s.id) ||
      currentUser.linkedStudentId === s.id
  );
  const parentChildren = matchedChildren.length > 0
    ? matchedChildren
    : (currentUser.id === 'usr-parent-default' && students.length > 0 ? students.slice(0, 2) : []);

  const [activeChildId, setActiveChildId] = useState<string>(
    parentChildren[0]?.id || ''
  );

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'daily' | 'emergency'>('profile');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);

  // Sync activeChildId if children list changes
  useEffect(() => {
    if (!parentChildren.some((c) => c.id === activeChildId) && parentChildren.length > 0) {
      setActiveChildId(parentChildren[0].id);
    }
  }, [parentChildren, activeChildId]);

  const activeChild = parentChildren.find((c) => c.id === activeChildId) || parentChildren[0];

  // Local form buffer for editing the active child
  const [formData, setFormData] = useState<Student | null>(null);

  useEffect(() => {
    if (activeChild) {
      setFormData(JSON.parse(JSON.stringify(activeChild)));
    }
  }, [activeChild]);

  // Daily Notice Form State
  const [dailyCategory, setDailyCategory] = useState<HealthUpdate['type']>('daily_notice');
  const [dailyText, setDailyText] = useState('');
  const [dailyUrgent, setDailyUrgent] = useState(false);
  const [dailyPhoneOverride, setDailyPhoneOverride] = useState('');
  const [dailyNoticeSuccess, setDailyNoticeSuccess] = useState(false);

  // New Allergen local form state
  const [newAlgName, setNewAlgName] = useState('');
  const [newAlgSeverity, setNewAlgSeverity] = useState<AllergySeverity>('Severe (Anaphylaxis)');
  const [newAlgEpiPen, setNewAlgEpiPen] = useState(true);
  const [newAlgActionPlan, setNewAlgActionPlan] = useState('');
  const [newAlgTriggers, setNewAlgTriggers] = useState('');

  // New Medication local form state
  const [newMedName, setNewMedName] = useState('');
  const [newMedDosage, setNewMedDosage] = useState('');
  const [newMedTiming, setNewMedTiming] = useState('');

  // If no children enrolled yet, render clean real-life empty state with Add Child action
  if (!activeChild || !formData) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto shadow-xs">
          <User className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-slate-900">
            Welcome to Your Parent Health Portal
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed max-w-md mx-auto">
            You don&apos;t have any children enrolled under this account yet. Add your child to start managing their medical records, emergency protocols, and morning school notices.
          </p>
        </div>

        <div className="flex items-center justify-center pt-2">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-6 py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold text-sm shadow-xs transition-all flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            + Add Your Child
          </button>
        </div>

        <AddChildModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          currentUser={currentUser}
          schools={schools}
          onAddChild={(newStudent) => {
            onAddChild(newStudent);
            setActiveChildId(newStudent.id);
          }}
          onAddSchool={onAddSchool}
        />
      </div>
    );
  }

  // --- Handlers for Editing Child ---
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData) return;

    const updated: Student = {
      ...formData,
      lastUpdated: new Date().toISOString().split('T')[0],
      recentUpdates: [
        {
          id: 'upd-' + Date.now(),
          date: 'Just now',
          author: `${currentUser.name} (Parent)`,
          authorRole: 'parent',
          type: 'allergy',
          content: 'Updated student medical profile and emergency action instructions.',
          acknowledgedByTeacher: false,
        },
        ...formData.recentUpdates,
      ],
    };

    onUpdateStudent(updated);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleAddAllergen = () => {
    if (!newAlgName.trim()) return;
    const newAlg: Allergy = {
      id: 'alg-' + Date.now(),
      name: newAlgName.trim(),
      severity: newAlgSeverity,
      triggers: newAlgTriggers.trim() || 'Accidental ingestion, skin contact, or inhalation',
      reaction: 'Cutaneous hives, swelling, or respiratory constriction',
      actionPlan: newAlgActionPlan.trim() || (newAlgEpiPen ? 'Administer EpiPen auto-injector immediately into outer mid-thigh, call 911, notify parents.' : 'Administer antihistamine, monitor, call guardian.'),
      hasEpiPen: newAlgEpiPen,
      epipenLocation: newAlgEpiPen ? 'Health Office & Student Backpack' : undefined,
    };
    setFormData({
      ...formData,
      allergies: [...formData.allergies, newAlg],
    });
    setNewAlgName('');
    setNewAlgActionPlan('');
    setNewAlgTriggers('');
  };

  const handleRemoveAllergen = (id: string) => {
    setFormData({
      ...formData,
      allergies: formData.allergies.filter((a) => a.id !== id),
    });
  };

  const handleAddMedication = () => {
    if (!newMedName.trim()) return;
    const newMed: Medication = {
      id: 'med-' + Date.now(),
      name: newMedName.trim(),
      dosage: newMedDosage.trim() || 'Standard dose',
      timing: newMedTiming.trim() || 'As needed',
      nurseSupervision: true,
    };
    setFormData({
      ...formData,
      medications: [...formData.medications, newMed],
    });
    setNewMedName('');
    setNewMedDosage('');
    setNewMedTiming('');
  };

  const handleRemoveMedication = (id: string) => {
    setFormData({
      ...formData,
      medications: formData.medications.filter((m) => m.id !== id),
    });
  };

  // --- Handlers for Daily Health Slips ---
  const handleSendDailySlip = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dailyText.trim()) return;

    const fullContent = `${dailyUrgent ? '⚠️ [HIGH PRIORITY] ' : ''}${dailyText.trim()}${
      dailyPhoneOverride ? ` (Today's direct phone override: ${dailyPhoneOverride})` : ''
    }`;

    const newUpdate: HealthUpdate = {
      id: 'upd-' + Date.now(),
      date: `Today at ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
      author: `${currentUser.name} (Parent)`,
      authorRole: 'parent',
      type: dailyCategory,
      content: fullContent,
      acknowledgedByTeacher: false,
    };

    onAddDailyUpdate(activeChild.id, newUpdate);
    setDailyText('');
    setDailyPhoneOverride('');
    setDailyUrgent(false);
    setDailyNoticeSuccess(true);
    setTimeout(() => setDailyNoticeSuccess(false), 3000);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* 1. Header: Child Switcher & Add Child Option */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200 inline-block">
            Parent Portal · {currentUser.name}
          </span>
          <h1 className="text-xl font-bold text-slate-900 mt-1">
            Child Health & Allergy Records
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage your child&apos;s medical profile, update emergency protocols, and dispatch morning notices.
          </p>
        </div>

        {/* Child Selector Tabs + Add Child button */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex bg-slate-100 p-1 rounded-xl border border-slate-200">
            {parentChildren.map((child) => {
              const isSelected = child.id === activeChildId;
              return (
                <button
                  key={child.id}
                  onClick={() => setActiveChildId(child.id)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <User className="w-3.5 h-3.5 text-rose-600" />
                  <span>{child.name}</span>
                </button>
              );
            })}
          </div>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Child</span>
          </button>

          {onDeleteChild && activeChild && (
            <button
              type="button"
              onClick={() => onDeleteChild(activeChild.id)}
              className="px-3 py-2 bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-700 rounded-xl text-xs font-semibold transition-all border border-slate-200 hover:border-rose-200 flex items-center gap-1.5"
              title={`Permanently delete ${activeChild.name}'s record`}
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-500" />
              <span className="hidden sm:inline">Delete Record</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. Navigation Tabs */}
      <div className="flex border-b border-slate-200 gap-8 text-sm font-semibold">
        <button
          onClick={() => setActiveTab('profile')}
          className={`pb-3 border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'profile'
              ? 'border-rose-600 text-rose-700 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Health Profile & Update Info</span>
        </button>

        <button
          onClick={() => setActiveTab('daily')}
          className={`pb-3 border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'daily'
              ? 'border-rose-600 text-rose-700 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Send className="w-4 h-4" />
          <span>Daily Health Slips</span>
          <span className="text-[11px] font-mono bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded-full">
            {activeChild.recentUpdates.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('emergency')}
          className={`pb-3 border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'emergency'
              ? 'border-rose-600 text-rose-700 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Emergency Action Card</span>
        </button>
      </div>

      {saveSuccess && (
        <div className="p-4 bg-emerald-600 text-white rounded-2xl flex items-center gap-2 text-xs font-bold shadow-md animate-in fade-in">
          <CheckCircle className="w-4 h-4 shrink-0" />
          <span>
            {formData.name}&apos;s medical profile changes saved successfully! Synced directly with {formData.schoolName || 'the school health office'}.
          </span>
        </div>
      )}

      {/* --- TAB 1: HEALTH PROFILE & UPDATE INFO --- */}
      {activeTab === 'profile' && (
        <form onSubmit={handleSaveProfile} className="space-y-6">
          {/* Active Child Summary Strip */}
          <div className="bg-slate-900 text-white rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold">{formData.name}</h2>
                <span className="text-xs text-slate-300 font-mono">
                  · {formData.grade} {formData.schoolName ? `· ${formData.schoolName}` : ''}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Last updated: <span className="font-mono text-slate-200">{formData.lastUpdated}</span> · You have full authority to edit and update records.
              </p>
            </div>

            <button
              type="submit"
              className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 shrink-0"
            >
              <Save className="w-4 h-4" />
              Save Health Profile Changes
            </button>
          </div>

          {/* 1. Basic Information */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100">
              1. Student Details
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Full Legal Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Student Full Name"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Grade / Room</label>
                <input
                  type="text"
                  required
                  value={formData.grade}
                  onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                  placeholder="e.g., Grade 3"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Blood Type</label>
                <input
                  type="text"
                  value={formData.bloodType}
                  onChange={(e) => setFormData({ ...formData, bloodType: e.target.value })}
                  placeholder="e.g., O+"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono font-bold"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Date of Birth</label>
                <input
                  type="date"
                  value={formData.dob}
                  onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono"
                />
              </div>
            </div>
          </div>

          {/* 2. Allergies & Action Protocols */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                  2. Documented Allergies ({formData.allergies.length})
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Document known allergens, reactions, and emergency intervention steps.
                </p>
              </div>
            </div>

            {/* Quick Allergen Add Box */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3 text-xs">
              <span className="font-bold text-slate-700 uppercase tracking-wider text-[11px] block">
                + Add Specific Allergen
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-medium text-slate-600 mb-1">Allergen Name</label>
                  <input
                    type="text"
                    value={newAlgName}
                    onChange={(e) => setNewAlgName(e.target.value)}
                    placeholder="e.g., Peanuts, Dairy, Penicillin"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-600 mb-1">Severity Level</label>
                  <select
                    value={newAlgSeverity}
                    onChange={(e) => setNewAlgSeverity(e.target.value as AllergySeverity)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg font-semibold"
                  >
                    <option value="Severe (Anaphylaxis)">Severe (Anaphylaxis Risk)</option>
                    <option value="Moderate">Moderate</option>
                    <option value="Mild">Mild</option>
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-slate-600 mb-1">EpiPen Prescribed?</label>
                  <div className="flex items-center gap-3 mt-2">
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        checked={newAlgEpiPen}
                        onChange={() => setNewAlgEpiPen(true)}
                        className="mr-1.5 text-rose-600"
                      />
                      Yes
                    </label>
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        checked={!newAlgEpiPen}
                        onChange={() => setNewAlgEpiPen(false)}
                        className="mr-1.5 text-slate-600"
                      />
                      No
                    </label>
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-600 mb-1">Emergency Action Protocol</label>
                <input
                  type="text"
                  value={newAlgActionPlan}
                  onChange={(e) => setNewAlgActionPlan(e.target.value)}
                  placeholder="e.g., Inject EpiPen auto-injector into outer mid-thigh, call 911"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg"
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleAddAllergen}
                  disabled={!newAlgName.trim()}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-bold text-xs flex items-center gap-1.5 disabled:opacity-40 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Allergen to Profile
                </button>
              </div>
            </div>

            {/* List of current allergies */}
            {formData.allergies.length === 0 ? (
              <div className="p-4 bg-slate-50 rounded-xl text-xs text-slate-500">
                No allergies currently documented. Use the form above to add any food or medical allergies.
              </div>
            ) : (
              <div className="space-y-3">
                {formData.allergies.map((allergy, idx) => (
                  <div
                    key={allergy.id}
                    className="p-4 rounded-xl border border-slate-200 bg-white space-y-2.5 shadow-xs text-xs"
                  >
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm">{allergy.name}</span>
                        <span className={`font-semibold ${allergy.severity.includes('Severe') ? 'text-rose-700' : 'text-amber-700'}`}>
                          · {allergy.severity}
                        </span>
                        {allergy.hasEpiPen && (
                          <span className="text-[10px] bg-rose-50 text-rose-800 border border-rose-200 px-1.5 py-0.2 rounded font-bold">
                            EpiPen
                          </span>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveAllergen(allergy.id)}
                        className="text-slate-400 hover:text-rose-600 p-1 rounded"
                        title="Delete allergy"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-slate-500 font-medium mb-1">Triggers / Exposure</label>
                        <input
                          type="text"
                          value={allergy.triggers}
                          onChange={(e) => {
                            const updated = [...formData.allergies];
                            updated[idx].triggers = e.target.value;
                            setFormData({ ...formData, allergies: updated });
                          }}
                          className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-500 font-medium mb-1">Observed Reactions</label>
                        <input
                          type="text"
                          value={allergy.reaction}
                          onChange={(e) => {
                            const updated = [...formData.allergies];
                            updated[idx].reaction = e.target.value;
                            setFormData({ ...formData, allergies: updated });
                          }}
                          className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-rose-800 font-bold mb-1">Emergency Action Plan</label>
                      <textarea
                        rows={2}
                        value={allergy.actionPlan}
                        onChange={(e) => {
                          const updated = [...formData.allergies];
                          updated[idx].actionPlan = e.target.value;
                          setFormData({ ...formData, allergies: updated });
                        }}
                        className="w-full px-2.5 py-1.5 border border-rose-200 bg-rose-50/40 text-slate-800 rounded-lg text-xs"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 3. Prescribed Medications */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">
                3. Prescribed School Medications & Inhalers ({formData.medications.length})
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-0.5">Medication</label>
                <input
                  type="text"
                  value={newMedName}
                  onChange={(e) => setNewMedName(e.target.value)}
                  placeholder="e.g., Albuterol Inhaler"
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-0.5">Dosage</label>
                <input
                  type="text"
                  value={newMedDosage}
                  onChange={(e) => setNewMedDosage(e.target.value)}
                  placeholder="e.g., 2 puffs with spacer"
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
                />
              </div>
              <div className="flex items-end gap-2">
                <div className="flex-1">
                  <label className="block text-[11px] font-medium text-slate-600 mb-0.5">Timing</label>
                  <input
                    type="text"
                    value={newMedTiming}
                    onChange={(e) => setNewMedTiming(e.target.value)}
                    placeholder="e.g., 15 min before PE"
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleAddMedication}
                  disabled={!newMedName.trim()}
                  className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-bold text-xs disabled:opacity-40"
                >
                  Add
                </button>
              </div>
            </div>

            {formData.medications.length > 0 && (
              <div className="space-y-1.5 text-xs">
                {formData.medications.map((m) => (
                  <div key={m.id} className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-900">{m.name}</span>
                      <span className="text-slate-500 ml-2">Dosage: {m.dosage}</span>
                      <span className="text-slate-500 ml-2">· Timing: {m.timing}</span>
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

          {/* 4. Emergency Contacts & Doctor */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs space-y-4 text-xs">
            <h3 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100">
              4. Emergency Contacts & Primary Physician
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <span className="font-bold text-slate-700 block">Primary Guardian (You)</span>
                <div>
                  <label className="text-[11px] text-slate-500 block">Full Name</label>
                  <input
                    type="text"
                    value={formData.parentName}
                    onChange={(e) => setFormData({ ...formData, parentName: e.target.value })}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-500 block">Phone Number</label>
                  <input
                    type="tel"
                    value={formData.parentPhone}
                    onChange={(e) => setFormData({ ...formData, parentPhone: e.target.value })}
                    placeholder="e.g., (555) 123-4567"
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg font-mono text-xs"
                  />
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <span className="font-bold text-slate-700 block">Secondary Emergency Contact</span>
                <div>
                  <label className="text-[11px] text-slate-500 block">Contact Name</label>
                  <input
                    type="text"
                    value={formData.secondaryContact.name}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        secondaryContact: { ...formData.secondaryContact, name: e.target.value },
                      })
                    }
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-500 block">Phone Number</label>
                  <input
                    type="tel"
                    value={formData.secondaryContact.phone}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        secondaryContact: { ...formData.secondaryContact, phone: e.target.value },
                      })
                    }
                    placeholder="e.g., (555) 987-6543"
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg font-mono text-xs"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Pediatrician Name</label>
                <input
                  type="text"
                  value={formData.physician.name}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      physician: { ...formData.physician, name: e.target.value },
                    })
                  }
                  placeholder="e.g., Dr. Robert Lee, MD"
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Clinic Name</label>
                <input
                  type="text"
                  value={formData.physician.clinic}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      physician: { ...formData.physician, clinic: e.target.value },
                    })
                  }
                  placeholder="e.g., Valley Pediatrics"
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Doctor Phone</label>
                <input
                  type="tel"
                  value={formData.physician.phone}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      physician: { ...formData.physician, phone: e.target.value },
                    })
                  }
                  placeholder="e.g., (555) 321-4321"
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg font-mono text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Classroom, Recess & Field Trip Guidance
              </label>
              <textarea
                rows={2}
                value={formData.specialNotes}
                onChange={(e) => setFormData({ ...formData, specialNotes: e.target.value })}
                placeholder="Important instructions for teachers, cafeteria staff, or recess monitors..."
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs"
              />
            </div>
          </div>

          {/* Bottom Save Action */}
          <div className="flex justify-end p-5 bg-white rounded-2xl border border-slate-200/90 shadow-xs">
            <button
              type="submit"
              className="px-6 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
            >
              <Save className="w-4 h-4" />
              Save Health Profile Changes
            </button>
          </div>
        </form>
      )}

      {/* --- TAB 2: DAILY HEALTH SLIPS --- */}
      {activeTab === 'daily' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Post Form */}
          <div className="lg:col-span-5 bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs space-y-4">
            <div className="pb-2 border-b border-slate-100">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Send className="w-4 h-4 text-emerald-600" />
                Submit Morning Health Notice
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Send a quick note to {activeChild.name}&apos;s teacher and nurse for today.
              </p>
            </div>

            {dailyNoticeSuccess && (
              <div className="p-3 bg-emerald-600 text-white rounded-xl text-xs font-bold flex items-center gap-2">
                <CheckCheck className="w-4 h-4" />
                Notice sent to classroom teacher!
              </div>
            )}

            <form onSubmit={handleSendDailySlip} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Category</label>
                <select
                  value={dailyCategory}
                  onChange={(e) => setDailyCategory(e.target.value as HealthUpdate['type'])}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                >
                  <option value="daily_notice">Morning Health Notice / Symptom Watch</option>
                  <option value="allergy">Allergy Caution / Lunch Restriction</option>
                  <option value="medication">Temporary Medication Carried Today</option>
                  <option value="emergency_contact">Emergency Contact Temporary Override</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Notice Details *</label>
                <textarea
                  rows={4}
                  required
                  value={dailyText}
                  onChange={(e) => setDailyText(e.target.value)}
                  placeholder={`e.g., ${activeChild.name} is recovering from a mild cold today. Spare inhaler/EpiPen is packed in backpack.`}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl leading-relaxed"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Today&apos;s Direct Contact Phone (Optional override)
                </label>
                <input
                  type="tel"
                  value={dailyPhoneOverride}
                  onChange={(e) => setDailyPhoneOverride(e.target.value)}
                  placeholder={activeChild.parentPhone}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-xl font-mono"
                />
              </div>

              <div className="flex items-center gap-2 p-3 bg-rose-50 border border-rose-200 rounded-xl">
                <input
                  type="checkbox"
                  id="dailyUrgentCheck"
                  checked={dailyUrgent}
                  onChange={(e) => setDailyUrgent(e.target.checked)}
                  className="text-rose-600 rounded"
                />
                <label htmlFor="dailyUrgentCheck" className="font-bold text-rose-800 cursor-pointer">
                  Flag as High Priority / Urgent Allergy Caution
                </label>
              </div>

              <button
                type="submit"
                disabled={!dailyText.trim()}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition-all shadow-xs flex items-center justify-center gap-2 disabled:opacity-40"
              >
                <Send className="w-3.5 h-3.5" />
                Dispatch Notice to School
              </button>
            </form>
          </div>

          {/* History */}
          <div className="lg:col-span-7 bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-slate-500" />
                {activeChild.name}&apos;s Health Notice History ({activeChild.recentUpdates.length})
              </h3>
            </div>

            {activeChild.recentUpdates.length === 0 ? (
              <div className="text-center py-12 text-slate-500 text-xs">
                No health notices recorded yet. Submit your first morning notice using the form.
              </div>
            ) : (
              <div className="space-y-3">
                {activeChild.recentUpdates.map((upd) => (
                  <div key={upd.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-slate-500">{upd.date}</span>
                      {upd.acknowledgedByTeacher ? (
                        <span className="text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded text-[11px] font-semibold flex items-center gap-1">
                          <CheckCheck className="w-3.5 h-3.5 text-emerald-600" />
                          Acknowledged by Teacher
                        </span>
                      ) : (
                        <span className="text-slate-400 text-[11px]">Pending Faculty Review</span>
                      )}
                    </div>
                    <p className="text-slate-800 leading-relaxed">{upd.content}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* --- TAB 3: EMERGENCY ACTION CARD --- */}
      {activeTab === 'emergency' && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Official School Emergency Action Card
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                This emergency card is maintained by classroom teachers, recess monitors, and the health office.
              </p>
            </div>

            <button
              onClick={() => setShowEmergencyModal(true)}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              Open Printable Version
            </button>
          </div>

          <div className="p-5 rounded-2xl border border-rose-200 bg-rose-50/30 space-y-4 text-xs">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <span className="text-slate-500 block">Student</span>
                <span className="font-bold text-sm text-slate-900">{activeChild.name}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Grade / Room</span>
                <span className="font-semibold text-slate-800">{activeChild.grade}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Enrolled Campus</span>
                <span className="font-semibold text-slate-800">{activeChild.schoolName || 'Classroom Registry'}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Blood Type</span>
                <span className="font-mono font-bold text-rose-700">{activeChild.bloodType}</span>
              </div>
            </div>

            <div className="pt-3 border-t border-rose-200/60 space-y-2">
              <span className="font-bold text-slate-700 uppercase tracking-wider text-[11px] block">
                Allergy Protocols & Emergency Interventions:
              </span>
              {activeChild.allergies.length === 0 ? (
                <div className="text-slate-500 italic p-2 bg-white rounded-lg">
                  No documented allergies recorded.
                </div>
              ) : (
                activeChild.allergies.map((alg) => (
                  <div key={alg.id} className="p-3 bg-white border border-rose-200 rounded-xl space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">{alg.name}</span>
                      <span className="text-rose-700 font-bold">{alg.severity}</span>
                    </div>
                    <div className="text-rose-900 font-medium">
                      Action Plan: {alg.actionPlan}
                    </div>
                    {alg.epipenLocation && (
                      <div className="text-slate-600">
                        EpiPen Location: <strong className="text-slate-800">{alg.epipenLocation}</strong>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            <div className="pt-3 border-t border-rose-200/60 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3 bg-white border border-slate-200 rounded-xl">
                <span className="text-slate-500 text-[11px] block">Primary Guardian</span>
                <span className="font-bold text-slate-900">{activeChild.parentName}</span>
                <div className="font-mono font-bold text-emerald-700 mt-0.5">{activeChild.parentPhone}</div>
              </div>
              <div className="p-3 bg-white border border-slate-200 rounded-xl">
                <span className="text-slate-500 text-[11px] block">Secondary Emergency Contact</span>
                <span className="font-bold text-slate-900">{activeChild.secondaryContact.name} ({activeChild.secondaryContact.relation})</span>
                <div className="font-mono font-bold text-emerald-700 mt-0.5">{activeChild.secondaryContact.phone}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Child Modal */}
      <AddChildModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        currentUser={currentUser}
        schools={schools}
        onAddChild={(newStudent) => {
          onAddChild(newStudent);
          setActiveChildId(newStudent.id);
        }}
        onAddSchool={onAddSchool}
      />

      {/* Printable Emergency Card Modal */}
      {showEmergencyModal && (
        <EmergencyCardModal
          student={activeChild}
          onClose={() => setShowEmergencyModal(false)}
        />
      )}
    </div>
  );
}
