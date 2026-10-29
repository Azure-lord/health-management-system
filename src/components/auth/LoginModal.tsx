import { useState } from 'react';
import { UserAccount, School, Student, UserRole } from '../../types/health';
import { 
  Lock, 
  Mail, 
  KeyRound, 
  Eye, 
  EyeOff, 
  ShieldCheck, 
  UserCheck, 
  Stethoscope, 
  Building2,
  Award,
  ArrowRight, 
  AlertCircle, 
  UserPlus, 
  Plus, 
  CheckCircle2,
  Trash2,
  Users,
  Laptop
} from 'lucide-react';
import { DeleteConfirmModal } from '../common/DeleteConfirmModal';

interface Props {
  onLoginSuccess: (user: UserAccount) => void;
  onRegisterAccount: (newUser: UserAccount, optionalChild?: Student) => void;
  onCancel?: () => void;
  currentUser?: UserAccount | null;
  schools?: School[];
  accounts: UserAccount[];
  roomClasses?: Array<{ id: string; name: string }>;
  onDeleteAccount?: (accountId: string) => void;
  onAddSchool?: (newSchool: School) => void;
}

export function LoginModal({
  onLoginSuccess,
  onRegisterAccount,
  onCancel,
  currentUser,
  accounts,
  roomClasses = [],
  onDeleteAccount,
}: Props) {
  const [activeTab, setActiveTab] = useState<'signin' | 'register'>('signin');

  // Sign In Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [accountToDelete, setAccountToDelete] = useState<UserAccount | null>(null);

  // Register Form State
  const [regRole, setRegRole] = useState<UserRole>('parent');
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regAssignedClassId, setRegAssignedClassId] = useState(roomClasses[0]?.id || '');
  const [regSchoolName, setRegSchoolName] = useState('');
  const [regGrade, setRegGrade] = useState('');
  const [regTitle, setRegTitle] = useState('');
  const [regChildName, setRegChildName] = useState('');
  const [regSuccessMessage, setRegSuccessMessage] = useState('');

  const handleManualLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    const account = accounts.find(
      (acc) => acc.email.toLowerCase() === email.trim().toLowerCase()
    );

    if (!account) {
      setErrorMessage('Account not found with this email. Please check your email or register a new account.');
      return;
    }

    if (account.passwordHash !== password) {
      setErrorMessage('Invalid password for this account. Please verify your credentials.');
      return;
    }

    onLoginSuccess(account);
  };

  const handleQuickSelect = (account: UserAccount) => {
    setEmail(account.email);
    setPassword(account.passwordHash);
    onLoginSuccess(account);
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!regName.trim() || !regEmail.trim() || !regPassword.trim()) {
      setErrorMessage('Please fill in all required fields (Name, Email, Password).');
      return;
    }

    // Check if email already registered
    if (accounts.some((a) => a.email.toLowerCase() === regEmail.trim().toLowerCase())) {
      setErrorMessage('An account with this email address already exists. Please sign in instead.');
      return;
    }

    const newUserId = 'usr-' + Date.now();
    let newChild: Student | undefined = undefined;
    let linkedStudentId: string | undefined = undefined;
    let linkedStudentIds: string[] = [];

    if (regRole === 'parent' && regChildName.trim()) {
      const childId = 'stu-' + Date.now();
      linkedStudentId = childId;
      linkedStudentIds = [childId];

      newChild = {
        id: childId,
        schoolId: regSchoolName.trim() || 'sch-default',
        schoolName: regSchoolName.trim() || undefined,
        name: regChildName.trim(),
        grade: regGrade.trim() || 'General Enrollment',
        dob: new Date().toISOString().split('T')[0],
        gender: 'Child',
        bloodType: 'O+',
        parentId: newUserId,
        parentName: regName.trim(),
        parentPhone: '(555) 000-0000',
        parentEmail: regEmail.trim(),
        secondaryContact: {
          name: 'Emergency Alternate',
          relation: 'Guardian',
          phone: '(555) 000-0001',
        },
        allergies: [],
        medications: [],
        dietaryRestrictions: [],
        physician: {
          name: 'Primary Care Physician, MD',
          clinic: 'Community Health Clinic',
          phone: '(555) 000-2000',
        },
        specialNotes: 'Initial enrollment record.',
        recentUpdates: [
          {
            id: 'upd-reg-' + Date.now(),
            date: new Date().toISOString(),
            author: `${regName.trim()} (Parent)`,
            authorRole: 'parent',
            type: 'daily_notice',
            content: 'Account registered and student profile created.',
            acknowledgedByTeacher: false,
          },
        ],
        lastUpdated: new Date().toISOString().split('T')[0],
      };
    }

    const titleDefault =
      regRole === 'teacher'
        ? `${regGrade.trim() || 'Classroom'} Faculty Lead`
        : regRole === 'parent'
        ? 'Parent & Legal Guardian'
        : regRole === 'medical_center'
        ? (regTitle.trim() || 'School Nurse, RN')
        : regRole === 'principal'
        ? 'Chief Educational Administrator'
        : regRole === 'it_admin'
        ? 'School IT Administrator & Systems Lead'
        : 'District Authority Officer';

    const newAccount: UserAccount = {
      id: newUserId,
      name: regName.trim(),
      email: regEmail.trim(),
      passwordHash: regPassword.trim(),
      role: regRole,
      title: titleDefault,
      assignedClassId: regRole === 'teacher' ? (regAssignedClassId || roomClasses[0]?.id || 'cls-101') : undefined,
      schoolId: regSchoolName.trim() || undefined,
      linkedStudentId,
      linkedStudentIds,
      facilityName: regRole === 'medical_center' ? (regTitle.trim() || 'Student Health Clinic') : undefined,
    };

    setRegSuccessMessage(`Account created successfully! Welcome, ${newAccount.name}.`);
    setTimeout(() => {
      onRegisterAccount(newAccount, newChild);
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-start justify-center p-0 sm:p-4 overflow-y-auto overscroll-contain">
      <div className="bg-white rounded-none sm:rounded-2xl max-w-xl w-full border-0 sm:border border-slate-200 shadow-2xl overflow-hidden flex flex-col my-0 sm:my-auto h-[100dvh] sm:h-auto sm:max-h-[90vh] shrink-0">
        {/* Header */}
        <div className="p-4 sm:p-6 bg-slate-900 text-white flex items-center justify-between shrink-0 shadow-xs z-20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-600 flex items-center justify-center text-white font-bold">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold tracking-tight">
                School Access & User Account Portal
              </h2>
              <p className="text-xs text-slate-400">
                Sign in with saved credentials or create a permanent account
              </p>
            </div>
          </div>
          {onCancel && (
            <button
              onClick={onCancel}
              className="text-slate-400 hover:text-white p-1 rounded-md text-sm"
            >
              ✕
            </button>
          )}
        </div>

        {/* Tab Switcher */}
        <div className="px-6 pt-4 border-b border-slate-200 bg-slate-50 flex gap-4">
          <button
            type="button"
            onClick={() => { setActiveTab('signin'); setErrorMessage(''); }}
            className={`pb-3 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'signin'
                ? 'border-rose-600 text-rose-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <KeyRound className="w-3.5 h-3.5" />
            Sign In ({accounts.length} Saved)
          </button>
          <button
            type="button"
            onClick={() => { setActiveTab('register'); setErrorMessage(''); }}
            className={`pb-3 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'register'
                ? 'border-rose-600 text-rose-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            Register New Account
          </button>
        </div>

        {/* Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 flex-1 min-h-0 overscroll-contain">
          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          {regSuccessMessage && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-bold text-emerald-800 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{regSuccessMessage}</span>
            </div>
          )}

          {/* TAB 1: SIGN IN */}
          {activeTab === 'signin' && (
            <div className="space-y-5">
              <form onSubmit={handleManualLogin} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. teacher@school.edu or parent@family.com"
                      className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-rose-500"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-slate-700">
                      Password
                    </label>
                  </div>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter saved password"
                      className="w-full pl-9 pr-10 py-2 text-xs border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-rose-500 font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 p-0.5"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2"
                >
                  <Lock className="w-3.5 h-3.5" />
                  Sign In to Workspace
                </button>
              </form>

              {/* Saved Accounts Section */}
              <div className="pt-4 border-t border-slate-100">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Saved Accounts on this Device ({accounts.length})
                  </span>
                  <span className="text-[11px] text-slate-400">Click to sign in instantly</span>
                </div>

                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {accounts.map((acc) => {
                    const isTeacher = acc.role === 'teacher';
                    const isParent = acc.role === 'parent';
                    const isMedical = acc.role === 'medical_center';
                    const isPrincipal = acc.role === 'principal';
                    const isDistrict = acc.role === 'district_auth';
                    const isItAdmin = acc.role === 'it_admin';

                    return (
                      <div
                        key={acc.id}
                        onClick={() => handleQuickSelect(acc)}
                        className="p-3 bg-slate-50 hover:bg-slate-100/80 border border-slate-200 rounded-xl flex items-center justify-between cursor-pointer transition-colors group"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                              isTeacher
                                ? 'bg-blue-100 text-blue-700'
                                : isParent
                                ? 'bg-emerald-100 text-emerald-700'
                                : isMedical
                                ? 'bg-purple-100 text-purple-700'
                                : isPrincipal
                                ? 'bg-amber-100 text-amber-700'
                                : isItAdmin
                                ? 'bg-cyan-100 text-cyan-800'
                                : 'bg-indigo-100 text-indigo-700'
                            }`}
                          >
                            {isTeacher && <ShieldCheck className="w-4 h-4" />}
                            {isParent && <UserCheck className="w-4 h-4" />}
                            {isMedical && <Stethoscope className="w-4 h-4" />}
                            {isPrincipal && <Building2 className="w-4 h-4" />}
                            {isDistrict && <Award className="w-4 h-4" />}
                            {isItAdmin && <Laptop className="w-4 h-4" />}
                          </div>

                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-slate-900 group-hover:text-rose-600 transition-colors">
                                {acc.name}
                              </span>
                              <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-white border border-slate-200 text-slate-600 capitalize">
                                {acc.role.replace('_', ' ')}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                              {acc.email} · pwd: <code className="bg-slate-200/70 px-1 py-0.2 rounded">{acc.passwordHash}</code>
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {onDeleteAccount && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setAccountToDelete(acc);
                              }}
                              className="p-1.5 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                              title="Delete account from device"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-slate-700 group-hover:translate-x-0.5 transition-all" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: REGISTER NEW ACCOUNT */}
          {activeTab === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 uppercase tracking-wider text-[11px] block mb-2">
                  1. Select Account Role
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setRegRole('parent')}
                    className={`p-2.5 rounded-xl border text-center transition-all flex flex-col items-center gap-1 ${
                      regRole === 'parent'
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-950 font-bold'
                        : 'border-slate-200 text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    <UserCheck className="w-4 h-4 text-emerald-600" />
                    <span className="text-xs">Parent</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRegRole('teacher')}
                    className={`p-2.5 rounded-xl border text-center transition-all flex flex-col items-center gap-1 ${
                      regRole === 'teacher'
                        ? 'border-blue-600 bg-blue-50 text-blue-950 font-bold'
                        : 'border-slate-200 text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    <ShieldCheck className="w-4 h-4 text-blue-600" />
                    <span className="text-xs">Class Teacher</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRegRole('medical_center')}
                    className={`p-2.5 rounded-xl border text-center transition-all flex flex-col items-center gap-1 ${
                      regRole === 'medical_center'
                        ? 'border-purple-600 bg-purple-50 text-purple-950 font-bold'
                        : 'border-slate-200 text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    <Stethoscope className="w-4 h-4 text-purple-600" />
                    <span className="text-xs">School Nurse</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRegRole('principal')}
                    className={`p-2.5 rounded-xl border text-center transition-all flex flex-col items-center gap-1 ${
                      regRole === 'principal'
                        ? 'border-amber-600 bg-amber-50 text-amber-950 font-bold'
                        : 'border-slate-200 text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    <Building2 className="w-4 h-4 text-amber-600" />
                    <span className="text-xs">Principal</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRegRole('district_auth')}
                    className={`p-2.5 rounded-xl border text-center transition-all flex flex-col items-center gap-1 ${
                      regRole === 'district_auth'
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-950 font-bold'
                        : 'border-slate-200 text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    <Award className="w-4 h-4 text-indigo-600" />
                    <span className="text-xs">District Auth</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRegRole('it_admin')}
                    className={`p-2.5 rounded-xl border text-center transition-all flex flex-col items-center gap-1 ${
                      regRole === 'it_admin'
                        ? 'border-cyan-600 bg-cyan-50 text-cyan-950 font-bold'
                        : 'border-slate-200 text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    <Laptop className="w-4 h-4 text-cyan-600" />
                    <span className="text-xs">School IT Admin</span>
                  </button>
                </div>
              </div>

              {/* Credentials */}
              <div className="space-y-3 pt-2 border-t border-slate-100">
                <span className="font-bold text-slate-700 uppercase tracking-wider text-[11px] block">
                  2. User Information & Saved Password
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Full Name *</label>
                    <input
                      type="text"
                      required
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      placeholder="e.g. Jane Smith"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-rose-500"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Email Address *</label>
                    <input
                      type="email"
                      required
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      placeholder="e.g. jane.smith@school.edu"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-rose-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Password (Saved on this device) *
                  </label>
                  <input
                    type="password"
                    required
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="Create a password to sign in anytime"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-rose-500 font-mono"
                  />
                </div>

                {/* If teacher: assigned classroom selection */}
                {regRole === 'teacher' && roomClasses.length > 0 && (
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Assigned Primary Classroom *
                    </label>
                    <select
                      value={regAssignedClassId}
                      onChange={(e) => setRegAssignedClassId(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-rose-500 font-semibold"
                    >
                      {roomClasses.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* If parent: optional child name */}
                {regRole === 'parent' && (
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Child Name (Optional enrollment)
                    </label>
                    <input
                      type="text"
                      value={regChildName}
                      onChange={(e) => setRegChildName(e.target.value)}
                      placeholder="e.g. Leo Smith"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-rose-500"
                    />
                  </div>
                )}
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2"
                >
                  <UserPlus className="w-4 h-4" />
                  Save Account & Sign In
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Delete Account In-App Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={accountToDelete !== null}
        title="Delete User Account"
        message="Permanently remove this account and its saved password from this school room? This action cannot be undone."
        itemName={accountToDelete ? `${accountToDelete.name} (${accountToDelete.email})` : ''}
        confirmLabel="Delete Account"
        onConfirm={() => {
          if (accountToDelete && onDeleteAccount) {
            onDeleteAccount(accountToDelete.id);
            setAccountToDelete(null);
          }
        }}
        onCancel={() => setAccountToDelete(null)}
      />
    </div>
  );
}
