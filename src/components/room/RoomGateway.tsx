import { useState, useEffect, useId } from 'react';
import { 
  ShieldCheck, 
  DoorOpen, 
  Plus, 
  ArrowRight, 
  Building2, 
  School as SchoolIcon, 
  KeyRound, 
  Lock, 
  CheckCircle2, 
  Trash2, 
  Mail, 
  UserCheck, 
  Clock, 
  Users,
  AlertCircle,
  Sparkles
} from 'lucide-react';
import { SchoolRoom } from '../../types/health';
import { DeleteConfirmModal } from '../common/DeleteConfirmModal';
import { 
  getRoomsCatalog, 
  createNewSchoolRoom, 
  setActiveRoomCode, 
  deleteRoomPermanently,
  generateRoomCode,
  saveRoomBundle,
  subscribeToRoomUpdates
} from '../../services/roomStorage';

interface Props {
  onRoomLoaded: (roomCode: string) => void;
}

export function RoomGateway({ onRoomLoaded }: Props) {
  const [activeTab, setActiveTab] = useState<'enter' | 'create'>('enter');
  const [inputCode, setInputCode] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [roomToDelete, setRoomToDelete] = useState<string | null>(null);
  
  // Create Room Form State
  const [schoolName, setSchoolName] = useState('');
  const [districtName, setDistrictName] = useState('');
  const [principalName, setPrincipalName] = useState('');
  const [principalEmail, setPrincipalEmail] = useState('');
  const [districtAuthEmail, setDistrictAuthEmail] = useState('');
  const [customCode, setCustomCode] = useState('');
  const [classNames, setClassNames] = useState<string[]>([
    'Room 101 - Grade 3',
    'Room 102 - Grade 4',
    'Room 201 - Grade 5'
  ]);
  const [newClassName, setNewClassName] = useState('');

  const [catalog, setCatalog] = useState<SchoolRoom[]>(() => getRoomsCatalog());

  useEffect(() => {
    setCatalog(getRoomsCatalog());
    const unsub = subscribeToRoomUpdates(() => {
      setCatalog(getRoomsCatalog());
    });
    return unsub;
  }, []);

  const handleEnterRoom = (codeToJoin?: string) => {
    const code = (codeToJoin || inputCode).trim().toUpperCase();
    if (!code) {
      setErrorMsg('Please enter a valid School Room Code.');
      return;
    }

    // Check if room exists in local storage
    const match = catalog.find((r) => r.roomCode.toUpperCase() === code);
    if (!match) {
      // Allow entering any new or external room code by auto-registering a clean room if not found
      const autoRoom = createNewSchoolRoom({
        schoolName: `${code} Academy`,
        districtName: 'Regional School District',
        principalName: 'Principal Administrator',
        principalEmail: 'principal@school.edu',
        districtAuthEmail: 'district.auth@education.gov',
        customCode: code,
      });
      onRoomLoaded(autoRoom.room.roomCode);
      return;
    }

    setActiveRoomCode(code);
    onRoomLoaded(code);
  };

  const handleCreateRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!schoolName.trim()) {
      setErrorMsg('Please provide a school name.');
      return;
    }
    if (!principalEmail.trim()) {
      setErrorMsg('Principal email is required for approval link verification.');
      return;
    }

    const classesFormatted = classNames.map((name, idx) => ({
      id: `cls-${idx + 101}`,
      name: name.trim(),
      grade: name.includes('Grade') ? name.split('Grade')[1].trim().split(' ')[0] : 'Standard',
      leadTeacherName: `Faculty Lead ${idx + 1}`,
    }));

    const bundle = createNewSchoolRoom({
      schoolName,
      districtName: districtName.trim() || 'Central District Authority',
      principalName: principalName.trim() || 'Principal Office',
      principalEmail,
      districtAuthEmail: districtAuthEmail.trim() || 'district.auth@schools.gov',
      customCode: customCode.trim() || undefined,
      classes: classesFormatted,
    });

    onRoomLoaded(bundle.room.roomCode);
  };

  const handleAddClass = () => {
    if (!newClassName.trim()) return;
    setClassNames([...classNames, newClassName.trim()]);
    setNewClassName('');
  };

  const handleRemoveClass = (index: number) => {
    setClassNames(classNames.filter((_, i) => i !== index));
  };

  const handleDeleteSavedRoom = (code: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setRoomToDelete(code);
  };

  const confirmDeleteRoom = () => {
    if (roomToDelete) {
      deleteRoomPermanently(roomToDelete);
      setCatalog(getRoomsCatalog());
      setRoomToDelete(null);
      setErrorMsg('');
    }
  };

  const handleLoadDemoTestRoom = () => {
    const demoCode = 'OAK-2026';
    const demoBundle = createNewSchoolRoom({
      schoolName: 'Oakridge Regional School',
      districtName: 'Metro North School District 12',
      principalName: 'Dr. Arthur Sterling, Ed.D',
      principalEmail: 'arthur.sterling@oakridge.edu',
      districtAuthEmail: 'compliance@metronorth.gov',
      customCode: demoCode,
      classes: [
        { id: 'cls-101', name: 'Room 101 - Grade 3 (Ms. Clara)', grade: 'Grade 3', leadTeacherName: 'Ms. Clara Henderson' },
        { id: 'cls-102', name: 'Room 102 - Grade 4 (Mr. David)', grade: 'Grade 4', leadTeacherName: 'Mr. David Miller' },
        { id: 'cls-201', name: 'Room 201 - Grade 5 (Mrs. Vance)', grade: 'Grade 5', leadTeacherName: 'Mrs. Evelyn Vance' },
      ],
    });

    // Add 2 real-life demo students to test permissions and health views
    demoBundle.students = [
      {
        id: 'std-oak-1',
        roomCode: demoCode,
        schoolName: 'Oakridge Regional School',
        classId: 'cls-101',
        className: 'Room 101 - Grade 3 (Ms. Clara)',
        name: 'Leo Matthews',
        grade: 'Grade 3',
        dob: '2016-04-12',
        gender: 'Male',
        bloodType: 'O+',
        parentId: 'usr-parent-leo',
        parentName: 'Marcus Matthews',
        parentPhone: '(555) 342-8901',
        parentEmail: 'marcus.matthews@family.net',
        secondaryContact: {
          name: 'Elena Matthews',
          relation: 'Aunt / Emergency Alternate',
          phone: '(555) 342-8902',
        },
        allergies: [
          {
            id: 'alg-peanut',
            name: 'Peanuts & Tree Nuts',
            severity: 'Severe (Anaphylaxis)',
            triggers: 'Ingestion or cross-contact with nut oils',
            reaction: 'Throat tightening, hives, facial swelling, difficulty breathing',
            actionPlan: 'Administer EpiPen 0.3mg immediately into outer mid-thigh. Call 911. Keep child lying down with legs elevated.',
            hasEpiPen: true,
            epipenLocation: 'Teacher desk right drawer & Main Clinic Locker #4',
          },
        ],
        medications: [
          {
            id: 'med-epipen',
            name: 'EpiPen Auto-Injector (0.3mg)',
            dosage: '0.3mg',
            timing: 'Immediate emergency upon allergen exposure',
            nurseSupervision: true,
          },
        ],
        dietaryRestrictions: ['Strict Nut-Free Table', 'No Cafeteria Baked Goods'],
        physician: {
          name: 'Dr. Sarah Lin, MD (Pediatric Allergy)',
          clinic: 'Childrens Health Center',
          phone: '(555) 890-4411',
        },
        specialNotes: 'Leo wears a medical alert wristband. All staff on field trips must carry designated emergency kit.',
        recentUpdates: [
          {
            id: 'upd-1',
            date: new Date().toISOString(),
            author: 'Marcus Matthews (Parent)',
            authorRole: 'parent',
            type: 'daily_notice',
            content: 'Morning Health Notice: Leo had mild seasonal sneezing this morning, given saline spray. EpiPen checked and valid.',
            acknowledgedByTeacher: false,
          },
        ],
        lastUpdated: new Date().toISOString(),
      },
      {
        id: 'std-oak-2',
        roomCode: demoCode,
        schoolName: 'Oakridge Regional School',
        classId: 'cls-102',
        className: 'Room 102 - Grade 4 (Mr. David)',
        name: 'Sophia Chen',
        grade: 'Grade 4',
        dob: '2015-09-28',
        gender: 'Female',
        bloodType: 'A+',
        parentId: 'usr-parent-sophia',
        parentName: 'David Chen',
        parentPhone: '(555) 782-1200',
        parentEmail: 'david.chen@email.com',
        secondaryContact: {
          name: 'Grace Chen',
          relation: 'Grandmother',
          phone: '(555) 782-1209',
        },
        allergies: [
          {
            id: 'alg-dairy',
            name: 'Dairy / Cow Milk Protein',
            severity: 'Moderate',
            triggers: 'Milk, cheese, yogurt, whey proteins',
            reaction: 'Severe abdominal pain, eczema flare, nausea',
            actionPlan: 'Administer oral antihistamine (Cetirizine 5mg). Monitor for 30 minutes. Contact parents.',
            hasEpiPen: false,
          },
        ],
        medications: [],
        dietaryRestrictions: ['Lactose-Free & Dairy-Free Diet'],
        physician: {
          name: 'Dr. Robert Evans, MD',
          clinic: 'Metro Pediatrics',
          phone: '(555) 234-9988',
        },
        specialNotes: 'Parent provides dairy-safe snacks for birthday celebrations.',
        recentUpdates: [],
        lastUpdated: new Date().toISOString(),
      },
    ];

    saveRoomBundle(demoBundle);
    setActiveRoomCode(demoCode);
    onRoomLoaded(demoCode);
  };

  const enterCodeInputId = useId();
  const schoolNameInputId = useId();
  const districtNameInputId = useId();
  const principalNameInputId = useId();
  const principalEmailInputId = useId();
  const districtAuthEmailInputId = useId();
  const customRoomCodeInputId = useId();
  const addClassInputId = useId();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between">
      {/* Top Brand Banner */}
      <header className="border-b border-slate-200 bg-white">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center font-bold shadow-xs">
              <SchoolIcon className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-slate-900">
                School Health & Safety Portal
              </h1>
              <p className="text-xs text-slate-500">
                Isolated School Workspaces & Multi-Tenant Medical Vault
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="hidden sm:inline-flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md font-medium border border-emerald-200">
              <ShieldCheck className="w-3.5 h-3.5" />
              Multi-Room Perimeter Active
            </span>
            <button
              onClick={handleLoadDemoTestRoom}
              className="text-xs px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium transition-colors flex items-center gap-1.5"
              title="Loads an example school room with 2 classrooms and allergy records"
            >
              <Sparkles className="w-3.5 h-3.5 text-rose-600" />
              Load Test Room (OAK-2026)
            </button>
          </div>
        </div>
      </header>

      {/* Main Gateway Body */}
      <main className="max-w-4xl mx-auto px-6 py-10 w-full flex-1 flex flex-col justify-center">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-rose-100 text-rose-700 mb-3">
            <DoorOpen className="w-6 h-6" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Connect to Your School Room
          </h2>
          <p className="text-sm text-slate-600 max-w-lg mx-auto mt-2">
            The main application starts completely clean. Enter your school&apos;s Room Code or generate a new school room. All student health records remain securely stored and isolated in your room.
          </p>
        </div>

        {errorMsg && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-3 text-rose-800 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Tab Switcher */}
        <div className="flex p-1 bg-slate-200/80 rounded-xl max-w-md mx-auto mb-6 w-full">
          <button
            onClick={() => { setActiveTab('enter'); setErrorMsg(''); }}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 ${
              activeTab === 'enter' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <KeyRound className="w-3.5 h-3.5" />
            Enter Room Code
          </button>
          <button
            onClick={() => { setActiveTab('create'); setErrorMsg(''); }}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 ${
              activeTab === 'create' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            Create New School Room
          </button>
        </div>

        {/* Tab 1: Enter Room Code */}
        {activeTab === 'enter' && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs max-w-xl mx-auto w-full">
            <h3 className="text-base font-bold text-slate-900 mb-1">Enter School Room Code</h3>
            <p className="text-xs text-slate-500 mb-6">
              Enter your assigned school or district room code. Your workspace will load and stay saved even after you close the app.
            </p>

            <div className="space-y-4">
              <div>
                <label htmlFor={enterCodeInputId} className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  School Room Code
                </label>
                <div className="relative">
                  <KeyRound className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    id={enterCodeInputId}
                    type="text"
                    value={inputCode}
                    onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                    onKeyDown={(e) => e.key === 'Enter' && handleEnterRoom()}
                    placeholder="e.g. SCH-4892 or OAK-2026"
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-base font-mono font-bold tracking-wider text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-rose-500 focus:border-rose-500 placeholder:font-sans placeholder:font-normal placeholder:text-sm placeholder:text-slate-400"
                  />
                </div>
              </div>

              <button
                onClick={() => handleEnterRoom()}
                className="w-full py-3 bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm rounded-xl transition-colors shadow-xs flex items-center justify-center gap-2"
              >
                <span>Load Room Workspace</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Saved Rooms On Device */}
            {catalog.length > 0 && (
              <div className="mt-8 pt-6 border-t border-slate-100">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    Saved Rooms on this Device ({catalog.length})
                  </span>
                  <span className="text-[11px] text-slate-400">Persists until deleted</span>
                </div>

                <div className="space-y-2">
                  {catalog.map((room) => (
                    <div
                      key={room.roomCode}
                      onClick={() => handleEnterRoom(room.roomCode)}
                      className="p-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl flex items-center justify-between cursor-pointer transition-colors group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center font-mono font-bold text-xs">
                          {room.roomCode.slice(0, 3)}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-900 group-hover:text-rose-600 transition-colors">
                            {room.schoolName}
                          </p>
                          <p className="text-[11px] text-slate-500">
                            {room.districtName} · Room: <span className="font-mono font-semibold text-slate-700">{room.roomCode}</span>
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => handleDeleteSavedRoom(room.roomCode, e)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                          title="Delete room permanently from device"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                        <span className="text-xs text-rose-600 font-semibold flex items-center gap-1">
                          Open <ArrowRight className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Create New School Room */}
        {activeTab === 'create' && (
          <form onSubmit={handleCreateRoom} className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs max-w-2xl mx-auto w-full">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">Create New School Room</h3>
                <p className="text-xs text-slate-500">
                  Deploys an independent, secure school workspace with dedicated classroom perimeters.
                </p>
              </div>
              <span className="text-xs bg-slate-100 text-slate-700 font-mono px-2.5 py-1 rounded-md">
                Multi-Tenant Vault
              </span>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor={schoolNameInputId} className="block text-xs font-semibold text-slate-700 mb-1">
                    School Name *
                  </label>
                  <input
                    id={schoolNameInputId}
                    type="text"
                    required
                    value={schoolName}
                    onChange={(e) => setSchoolName(e.target.value)}
                    placeholder="e.g. Lincoln High School"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-rose-500"
                  />
                </div>

                <div>
                  <label htmlFor={districtNameInputId} className="block text-xs font-semibold text-slate-700 mb-1">
                    School District Name *
                  </label>
                  <input
                    id={districtNameInputId}
                    type="text"
                    required
                    value={districtName}
                    onChange={(e) => setDistrictName(e.target.value)}
                    placeholder="e.g. Metro Unified District"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-rose-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor={principalNameInputId} className="block text-xs font-semibold text-slate-700 mb-1">
                    Principal Name
                  </label>
                  <input
                    id={principalNameInputId}
                    type="text"
                    value={principalName}
                    onChange={(e) => setPrincipalName(e.target.value)}
                    placeholder="e.g. Dr. Arthur Sterling"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-rose-500"
                  />
                </div>

                <div>
                  <label htmlFor={principalEmailInputId} className="block text-xs font-semibold text-slate-700 mb-1">
                    Principal Email (For Link Approvals) *
                  </label>
                  <input
                    id={principalEmailInputId}
                    type="email"
                    required
                    value={principalEmail}
                    onChange={(e) => setPrincipalEmail(e.target.value)}
                    placeholder="e.g. principal@lincoln.edu"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-rose-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor={districtAuthEmailInputId} className="block text-xs font-semibold text-slate-700 mb-1">
                    District Authority Email (For Cross-School Auth) *
                  </label>
                  <input
                    id={districtAuthEmailInputId}
                    type="email"
                    required
                    value={districtAuthEmail}
                    onChange={(e) => setDistrictAuthEmail(e.target.value)}
                    placeholder="e.g. district.auth@metroschools.gov"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-rose-500"
                  />
                </div>

                <div>
                  <label htmlFor={customRoomCodeInputId} className="block text-xs font-semibold text-slate-700 mb-1">
                    Custom Room Code (Optional)
                  </label>
                  <input
                    id={customRoomCodeInputId}
                    type="text"
                    value={customCode}
                    onChange={(e) => setCustomCode(e.target.value.toUpperCase())}
                    placeholder="Auto-generated if blank (e.g. LIN-4892)"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono font-semibold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-rose-500"
                  />
                </div>
              </div>

              {/* Classrooms Setup */}
              <div className="pt-3 border-t border-slate-100">
                <div className="flex items-center justify-between mb-2">
                  <label htmlFor={addClassInputId} className="block text-xs font-semibold text-slate-700">
                    School Classrooms ({classNames.length})
                  </label>
                  <span className="text-[11px] text-slate-400">Classes cannot see each other without Principal permission</span>
                </div>

                <div className="flex flex-wrap gap-2 mb-3">
                  {classNames.map((cName, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 text-slate-700 text-xs rounded-lg border border-slate-200"
                    >
                      <Users className="w-3 h-3 text-slate-400" />
                      {cName}
                      <button
                        type="button"
                        onClick={() => handleRemoveClass(idx)}
                        className="text-slate-400 hover:text-rose-600 ml-1 font-bold text-xs"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>

                <div className="flex gap-2">
                  <input
                    id={addClassInputId}
                    type="text"
                    value={newClassName}
                    onChange={(e) => setNewClassName(e.target.value)}
                    placeholder="e.g. Room 103 - Grade 4 or Kindergarten A"
                    className="flex-1 px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-rose-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddClass}
                    className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-lg transition-colors"
                  >
                    + Add Class
                  </button>
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="submit"
                  className="flex-1 py-3 bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm rounded-xl transition-colors shadow-xs flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Create & Open School Workspace</span>
                </button>
              </div>
            </div>
          </form>
        )}
      </main>

      {/* Footer Info */}
      <footer className="border-t border-slate-200 bg-white py-4 px-6 text-center text-xs text-slate-500">
        <p>
          Each school room runs in complete isolation. Inter-class observation requires verified Principal approval. Cross-school sharing requires District Authority link verification.
        </p>
      </footer>

      {/* In-app Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={roomToDelete !== null}
        title="Delete School Room"
        message="Permanently remove this school room and all its stored student records from this device? This action cannot be undone."
        itemName={roomToDelete ? `Room Code: ${roomToDelete}` : ''}
        confirmLabel="Delete Room"
        onConfirm={confirmDeleteRoom}
        onCancel={() => setRoomToDelete(null)}
      />
    </div>
  );
}
