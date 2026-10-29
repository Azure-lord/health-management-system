import { useState, useEffect, useCallback } from 'react';
import { 
  Student, 
  UserAccount, 
  HealthUpdate, 
  SchoolRoom, 
  AccessPermission, 
  AuditMemoryEntry,
  UserRole
} from './types/health';
import { PRESET_ACCOUNTS } from './data/authData';
import { 
  getActiveRoomCode, 
  setActiveRoomCode, 
  getRoomBundle, 
  saveRoomBundle, 
  deleteRoomPermanently,
  requestAccessPermission,
  appendAuditLog,
  subscribeToRoomUpdates,
  saveRoomAccount,
  deleteRoomAccount,
  getDeviceSavedAccounts,
  saveDeviceAccount,
  deleteDeviceAccount,
  getDistrictsCatalog,
  deleteSchoolRoomWithPassword,
  addClassroomToSchool,
  checkUserSubRoomAccess,
  RoomBundle
} from './services/roomStorage';
import { NationalPortal } from './components/national/NationalPortal';
import { DistrictRoomView } from './components/district/DistrictRoomView';
import { DistrictSchoolDeleteModal } from './components/district/DistrictSchoolDeleteModal';
import { ClassSubRoomView } from './components/classroom/ClassSubRoomView';
import { Navbar } from './components/Navbar';
import { ParentPortal } from './components/parent/ParentPortal';
import { TeacherPortal } from './components/teacher/TeacherPortal';
import { MedicalCenterPortal } from './components/medical/MedicalCenterPortal';
import { PrincipalPortal } from './components/admin/PrincipalPortal';
import { DistrictAuthorityPortal } from './components/admin/DistrictAuthorityPortal';
import { LoginModal } from './components/auth/LoginModal';
import { AddChildModal } from './components/parent/AddChildModal';
import { StoringScreen } from './components/screens/StoringScreen';
import { EmailVerificationModal } from './components/permissions/EmailVerificationModal';
import { ApprovalInboxModal } from './components/permissions/ApprovalInboxModal';
import { AuditMemoryPanel } from './components/audit/AuditMemoryPanel';
import { DeleteConfirmModal } from './components/common/DeleteConfirmModal';
import { 
  RotateCcw, 
  DoorOpen, 
  Search, 
  Building2, 
  ShieldCheck, 
  Users, 
  Plus, 
  Lock, 
  ArrowRight,
  School as SchoolIcon,
  CheckCircle2,
  Filter,
  HeartPulse
} from 'lucide-react';

export default function App() {
  // 1. Room Code State (persists across reloads until disconnected or deleted)
  const [activeRoomCode, setActiveRoomCodeState] = useState<string | null>(() => getActiveRoomCode());
  const [roomBundle, setRoomBundle] = useState<RoomBundle | null>(() => {
    const code = getActiveRoomCode();
    return code ? getRoomBundle(code) : null;
  });

  // Helper to collect preset, device-saved, and room-specific accounts
  const loadMergedAccounts = useCallback((bundle?: RoomBundle | null) => {
    const map = new Map<string, UserAccount>();
    PRESET_ACCOUNTS.forEach((a) => map.set(a.id, a));
    getDeviceSavedAccounts().forEach((a) => map.set(a.id, a));
    if (bundle?.accounts) {
      bundle.accounts.forEach((a) => map.set(a.id, a));
    }
    return Array.from(map.values());
  }, []);

  // 2. User Accounts State
  const [accounts, setAccounts] = useState<UserAccount[]>(() => {
    const code = getActiveRoomCode();
    const bundle = code ? getRoomBundle(code) : null;
    return loadMergedAccounts(bundle);
  });
  const [currentUser, setCurrentUser] = useState<UserAccount>(() => accounts[0] || PRESET_ACCOUNTS[0]);

  // 3. 4-Tier Hierarchy View State ('national' | 'district' | 'school' | 'subroom')
  const [currentView, setCurrentView] = useState<'national' | 'district' | 'school' | 'subroom'>('national');
  const [selectedDistrictId, setSelectedDistrictId] = useState<string>('dist-metro-north');
  const [activeClassId, setActiveClassId] = useState<string | null>(null);
  const [schoolSearchQuery, setSchoolSearchQuery] = useState('');
  const [isDistrictDeleteModalOpen, setIsDistrictDeleteModalOpen] = useState(false);
  const [unauthorizedDeleteAttempt, setUnauthorizedDeleteAttempt] = useState(false);
  const [isAddClassModalOpen, setIsAddClassModalOpen] = useState(false);
  const [newClassName, setNewClassName] = useState('');
  const [newClassGrade, setNewClassGrade] = useState('');
  const [newClassSection, setNewClassSection] = useState('Section A');
  const [newClassTeacher, setNewClassTeacher] = useState('');
  const [addClassError, setAddClassError] = useState('');

  // 4. UI Modals
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isAddChildModalOpen, setIsAddChildModalOpen] = useState(false);
  const [isMedicalIntakeOpen, setIsMedicalIntakeOpen] = useState(false);
  const [isApprovalsModalOpen, setIsApprovalsModalOpen] = useState(false);
  const [isAuditMemoryOpen, setIsAuditMemoryOpen] = useState(false);
  const [verificationModalPermission, setVerificationModalPermission] = useState<AccessPermission | null>(null);
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);

  // Load Room Data helper
  const refreshActiveRoom = useCallback((codeToLoad?: string | null) => {
    const code = codeToLoad !== undefined ? codeToLoad : getActiveRoomCode();
    setActiveRoomCodeState(code);
    if (code) {
      const bundle = getRoomBundle(code);
      setRoomBundle(bundle);
      setAccounts(loadMergedAccounts(bundle));
    } else {
      setRoomBundle(null);
      setAccounts(loadMergedAccounts(null));
    }
  }, [loadMergedAccounts]);

  // Subscribe to multi-tab / real-time updates
  useEffect(() => {
    const unsubscribe = subscribeToRoomUpdates((code) => {
      refreshActiveRoom(code);
    });
    return unsubscribe;
  }, [refreshActiveRoom]);

  // Handle URL Query Params for direct email link opening (e.g., ?verifyToken=...&room=...)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const urlParams = new URLSearchParams(window.location.search);
    const verifyToken = urlParams.get('verifyToken');
    const roomParam = urlParams.get('room');

    if (verifyToken && roomParam) {
      // Clear URL params so they do not linger and show up unexpectedly
      if (window.history && window.history.replaceState) {
        window.history.replaceState({}, document.title, window.location.pathname);
      }
      const bundle = getRoomBundle(roomParam);
      if (bundle) {
        setActiveRoomCode(roomParam);
        refreshActiveRoom(roomParam);
        const match = bundle.permissions.find((p) => p.verificationToken === verifyToken);
        // Only trigger modal for authorized Administrative roles (Principal / District)
        if (match && (currentUser.role === 'principal' || currentUser.role === 'district_auth')) {
          setVerificationModalPermission(match);
        }
      }
    }
  }, [refreshActiveRoom, currentUser.role]);

  // ================= NAVIGATION & ROOM HANDLERS =================
  const handleSelectDistrict = (districtId: string) => {
    setSelectedDistrictId(districtId);
    setCurrentView('district');
  };

  const handleSelectSchool = (code: string) => {
    setActiveRoomCode(code);
    refreshActiveRoom(code);
    setCurrentView('school');
  };

  const handleOpenSubRoom = (code: string, classId: string) => {
    setActiveRoomCode(code);
    refreshActiveRoom(code);
    setActiveClassId(classId);
    setCurrentView('subroom');
  };

  const handleRoomLoaded = (code: string) => {
    setActiveRoomCode(code);
    refreshActiveRoom(code);
    setCurrentView('school');
  };

  const handleLeaveRoom = () => {
    if (roomBundle) {
      appendAuditLog(roomBundle.room.roomCode, {
        actorName: currentUser.name,
        actorRole: currentUser.role,
        actionType: 'ROOM_DISCONNECTED',
        description: `User disconnected from school room ${roomBundle.room.roomCode}. Workspace returned to National Portal.`,
      });
    }
    setActiveRoomCode(null);
    refreshActiveRoom(null);
    setCurrentView('national');
  };

  const handleDeleteRoom = () => {
    if (currentUser.role === 'district_auth') {
      setIsDistrictDeleteModalOpen(true);
    } else {
      setUnauthorizedDeleteAttempt(true);
    }
  };

  const handleAddClassSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAddClassError('');
    if (!roomBundle) return;
    if (!newClassName.trim()) {
      setAddClassError('Please enter a classroom name.');
      return;
    }
    const res = addClassroomToSchool(
      roomBundle.room.roomCode,
      {
        name: newClassName.trim(),
        grade: newClassGrade.trim() || 'General',
        section: newClassSection.trim() || 'Section A',
        leadTeacherName: newClassTeacher.trim() || 'Classroom Faculty Lead',
      },
      currentUser
    );
    if (res.success) {
      setNewClassName('');
      setNewClassGrade('');
      setNewClassSection('Section A');
      setNewClassTeacher('');
      setIsAddClassModalOpen(false);
      refreshActiveRoom();
    } else {
      setAddClassError(res.message || 'Failed to add classroom.');
    }
  };

  const confirmDeleteStudent = () => {
    if (!roomBundle || !studentToDelete) return;
    const targetId = studentToDelete.id;
    const targetName = studentToDelete.name;
    const updatedStudents = roomBundle.students.filter((s) => s.id !== targetId);
    saveRoomBundle({
      ...roomBundle,
      students: updatedStudents,
    });
    appendAuditLog(roomBundle.room.roomCode, {
      actorName: currentUser.name,
      actorRole: currentUser.role,
      actionType: 'STUDENT_DELETED',
      description: `Student ${targetName} was deleted from room ${roomBundle.room.roomCode}.`,
    });
    setStudentToDelete(null);
    refreshActiveRoom();
  };

  // ================= STUDENT & HEALTH UPDATE HANDLERS =================
  const handleUpdateStudent = (updatedStudent: Student) => {
    if (!roomBundle) return;
    const updatedStudents = roomBundle.students.map((s) =>
      s.id === updatedStudent.id ? updatedStudent : s
    );
    const updatedBundle: RoomBundle = {
      ...roomBundle,
      students: updatedStudents,
    };
    saveRoomBundle(updatedBundle);
    appendAuditLog(roomBundle.room.roomCode, {
      actorName: currentUser.name,
      actorRole: currentUser.role,
      actionType: 'RECORD_UPDATED',
      description: `Health record updated for ${updatedStudent.name} (${updatedStudent.grade}). Allergies: ${updatedStudent.allergies.length}.`,
    });
    refreshActiveRoom();
  };

  const handleAddChild = (newChild: Student) => {
    if (!roomBundle) return;
    const childWithRoom: Student = {
      ...newChild,
      roomCode: roomBundle.room.roomCode,
      schoolName: roomBundle.room.schoolName,
      className: newChild.className || roomBundle.room.classes[0]?.name,
      classId: newChild.classId || roomBundle.room.classes[0]?.id,
    };

    const updatedStudents = [childWithRoom, ...roomBundle.students];
    const updatedBundle: RoomBundle = {
      ...roomBundle,
      students: updatedStudents,
    };
    saveRoomBundle(updatedBundle);

    appendAuditLog(roomBundle.room.roomCode, {
      actorName: currentUser.name,
      actorRole: currentUser.role,
      actionType: 'STUDENT_ENROLLED',
      description: `Student ${newChild.name} enrolled into ${childWithRoom.className || 'Classroom'}. Guardian: ${newChild.parentName}.`,
    });

    if (currentUser.role === 'parent') {
      const updatedUser: UserAccount = {
        ...currentUser,
        linkedStudentIds: [...(currentUser.linkedStudentIds || []), newChild.id],
        linkedStudentId: newChild.id,
      };
      setCurrentUser(updatedUser);
    }
    refreshActiveRoom();
  };

  const handleAddDailyUpdate = (studentId: string, update: HealthUpdate) => {
    if (!roomBundle) return;
    const targetStudent = roomBundle.students.find((s) => s.id === studentId);
    const updatedStudents = roomBundle.students.map((s) => {
      if (s.id === studentId) {
        return {
          ...s,
          recentUpdates: [update, ...s.recentUpdates],
        };
      }
      return s;
    });

    saveRoomBundle({
      ...roomBundle,
      students: updatedStudents,
    });

    appendAuditLog(roomBundle.room.roomCode, {
      actorName: currentUser.name,
      actorRole: currentUser.role,
      actionType: 'DAILY_NOTICE_SENT',
      description: `Morning notice logged for ${targetStudent?.name || 'Student'}: "${update.content}"`,
    });
    refreshActiveRoom();
  };

  const handleAcknowledgeUpdate = (studentId: string, updateId: string) => {
    if (!roomBundle) return;
    const targetStudent = roomBundle.students.find((s) => s.id === studentId);
    const updatedStudents = roomBundle.students.map((s) => {
      if (s.id === studentId) {
        return {
          ...s,
          recentUpdates: s.recentUpdates.map((u) =>
            u.id === updateId ? { ...u, acknowledgedByTeacher: true } : u
          ),
        };
      }
      return s;
    });

    saveRoomBundle({
      ...roomBundle,
      students: updatedStudents,
    });

    appendAuditLog(roomBundle.room.roomCode, {
      actorName: currentUser.name,
      actorRole: currentUser.role,
      actionType: 'DAILY_NOTICE_ACKNOWLEDGED',
      description: `Teacher ${currentUser.name} acknowledged morning health notice for ${targetStudent?.name || 'Student'}.`,
    });
    refreshActiveRoom();
  };

  // ================= PERMISSION REQUEST HANDLERS =================
  const handleRequestClassPermission = (targetClassId: string, targetClassName: string, reason: string) => {
    if (!roomBundle) return;
    requestAccessPermission({
      roomCode: roomBundle.room.roomCode,
      type: 'class_to_class',
      requesterId: currentUser.id,
      requesterName: currentUser.name,
      requesterRole: currentUser.role,
      requesterEmail: currentUser.email,
      targetClassId,
      targetClassName,
      reason,
    });
    refreshActiveRoom();
    // Do NOT show verification modal to teacher. Only Principal can review and verify approval links.
  };

  const handleRequestCrossSchoolPermission = (targetSchoolName: string, reason: string) => {
    if (!roomBundle) return;
    requestAccessPermission({
      roomCode: roomBundle.room.roomCode,
      type: 'cross_school',
      requesterId: currentUser.id,
      requesterName: currentUser.name,
      requesterRole: currentUser.role,
      requesterEmail: currentUser.email,
      targetSchoolName,
      reason,
    });
    refreshActiveRoom();
    // Do NOT show verification modal to nurse. Only District Authority can review and verify approval links.
  };

  // ================= AUTH / PERSONA HANDLERS =================
  const handleRegisterAccount = (newUser: UserAccount, optionalChild?: Student) => {
    if (roomBundle) {
      saveRoomAccount(roomBundle.room.roomCode, newUser);
      appendAuditLog(roomBundle.room.roomCode, {
        actorName: newUser.name,
        actorRole: newUser.role,
        actionType: 'ACCOUNT_CREATED',
        description: `New ${newUser.role.replace('_', ' ')} account registered for ${newUser.name} (${newUser.email}). Credentials saved to this device.`,
      });
    } else {
      saveDeviceAccount(newUser);
    }

    if (optionalChild && roomBundle) {
      handleAddChild(optionalChild);
    }

    setAccounts((prev) => {
      const filtered = prev.filter((a) => a.id !== newUser.id && a.email.toLowerCase() !== newUser.email.toLowerCase());
      return [newUser, ...filtered];
    });

    setCurrentUser(newUser);
    setVerificationModalPermission(null);
    setIsLoginModalOpen(false);
    refreshActiveRoom();
  };

  const handleDeleteAccount = (accountId: string) => {
    const target = accounts.find((a) => a.id === accountId);
    if (!target) return;

    if (roomBundle) {
      deleteRoomAccount(roomBundle.room.roomCode, accountId);
      appendAuditLog(roomBundle.room.roomCode, {
        actorName: currentUser.name,
        actorRole: currentUser.role,
        actionType: 'ACCOUNT_DELETED',
        description: `User account ${target.name} (${target.email}) was permanently deleted from device.`,
      });
    } else {
      deleteDeviceAccount(accountId);
    }

    setAccounts((prev) => prev.filter((a) => a.id !== accountId));

    if (currentUser.id === accountId) {
      const fallback = accounts.find((a) => a.id !== accountId) || PRESET_ACCOUNTS[0];
      setCurrentUser(fallback);
    }

    refreshActiveRoom();
  };

  // Districts catalog for district lookup
  const districts = getDistrictsCatalog();
  const currentDistrict = districts.find((d) => d.id === selectedDistrictId) || districts[0];

  const room = roomBundle?.room;
  const students = roomBundle?.students || [];
  const permissions = roomBundle?.permissions || [];
  const auditLog = roomBundle?.auditLog || [];
  const pendingApprovalsCount = permissions.filter((p) => p.status === 'pending').length;

  // Active classroom sub-room
  const activeClassroom = room?.classes.find((c) => c.id === activeClassId) || room?.classes[0];

  // School-scoped filtering
  const filteredSchoolStudents = students.filter((s) => {
    const q = schoolSearchQuery.trim().toLowerCase();
    if (!q) return true;
    return (
      s.name.toLowerCase().includes(q) ||
      s.grade.toLowerCase().includes(q) ||
      (s.className && s.className.toLowerCase().includes(q)) ||
      s.allergies.some((a) => a.name.toLowerCase().includes(q) || a.triggers.toLowerCase().includes(q))
    );
  });

  const filteredSchoolClasses = (room?.classes || []).filter((c) => {
    const q = schoolSearchQuery.trim().toLowerCase();
    if (!q) return true;
    return (
      c.name.toLowerCase().includes(q) ||
      c.grade.toLowerCase().includes(q) ||
      (c.section && c.section.toLowerCase().includes(q)) ||
      c.leadTeacherName.toLowerCase().includes(q)
    );
  });

  const canAddClasses = currentUser.role === 'principal' || currentUser.role === 'it_admin';

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800 antialiased selection:bg-rose-500 selection:text-white">
      {/* 1. Global Navbar with Hierarchy Breadcrumbs and Controls */}
      <Navbar
        currentUser={currentUser}
        activeRoom={room || null}
        currentView={currentView}
        activeDistrictName={currentDistrict?.name}
        activeClassName={activeClassroom?.name}
        pendingApprovalsCount={pendingApprovalsCount}
        auditEventsCount={auditLog.length}
        onOpenLoginModal={() => setIsLoginModalOpen(true)}
        onOpenAddChildModal={() => setIsAddChildModalOpen(true)}
        onOpenIntakeModal={() => setIsMedicalIntakeOpen(true)}
        onOpenApprovalsInbox={() => setIsApprovalsModalOpen(true)}
        onOpenAuditMemory={() => setIsAuditMemoryOpen(true)}
        onLeaveRoom={handleLeaveRoom}
        onDeleteRoom={handleDeleteRoom}
        onNavigateView={(view) => {
          if (view === 'national') {
            setCurrentView('national');
          } else if (view === 'district') {
            setCurrentView('district');
          } else if (view === 'school') {
            if (roomBundle) {
              setCurrentView('school');
            } else {
              setCurrentView('national');
            }
          }
        }}
      />

      {/* 2. Main 4-Tier Viewport */}
      <main className="flex-1 pb-16">
        {/* VIEW 1: NATIONAL PORTAL & DIRECTORY */}
        {currentView === 'national' && (
          <NationalPortal
            currentUser={currentUser}
            onSelectDistrict={handleSelectDistrict}
            onSelectSchool={handleSelectSchool}
            onOpenSubRoomWithAuthCheck={handleOpenSubRoom}
          />
        )}

        {/* VIEW 2: DISTRICT GOVERNANCE ROOM */}
        {currentView === 'district' && currentDistrict && (
          <DistrictRoomView
            district={currentDistrict}
            currentUser={currentUser}
            onBackToNational={() => setCurrentView('national')}
            onSelectSchool={handleSelectSchool}
            onRefreshDistricts={() => refreshActiveRoom()}
          />
        )}

        {/* VIEW 3: CLASSROOM SUB-ROOM VIEWPORT */}
        {currentView === 'subroom' && room && activeClassroom && (
          <ClassSubRoomView
            classroom={activeClassroom}
            room={room}
            currentUser={currentUser}
            students={students}
            permissions={permissions}
            onBackToSchool={() => setCurrentView('school')}
            onRefreshPermissions={() => refreshActiveRoom()}
            onOpenIntakeModal={() => setIsMedicalIntakeOpen(true)}
            onAcknowledgeUpdate={handleAcknowledgeUpdate}
          />
        )}

        {/* VIEW 4: SCHOOL ROOM WORKSPACE */}
        {currentView === 'school' && room && (
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6">
            {/* School Perimeter Header & Scope Bar */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-md border border-blue-200">
                    School Workspace Perimeter
                  </span>
                  <span className="text-xs text-slate-400">·</span>
                  <span className="text-xs font-semibold text-slate-500">
                    District: {room.districtName}
                  </span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  {room.schoolName}
                </h1>
                <p className="text-xs text-slate-500 mt-1">
                  School Room Code: <strong className="font-mono text-slate-800">{room.roomCode}</strong> · Principal: {room.principalName}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2.5 flex-wrap">
                {canAddClasses && (
                  <button
                    onClick={() => setIsAddClassModalOpen(true)}
                    className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" />
                    <span>+ Add Classroom Sub-Room</span>
                  </button>
                )}

                <button
                  onClick={() => setIsAuditMemoryOpen(true)}
                  className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all border border-slate-200 flex items-center gap-1.5"
                >
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Audit Stream</span>
                </button>
              </div>
            </div>

            {/* Scoped School Search: Locked strictly to this school */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={schoolSearchQuery}
                onChange={(e) => setSchoolSearchQuery(e.target.value)}
                placeholder={`Search strictly within ${room.schoolName} (sub-rooms, faculty, students, allergies)...`}
                className="w-full pl-11 pr-4 py-3 bg-white border border-slate-300 rounded-2xl text-xs font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500 shadow-xs placeholder:text-slate-400"
              />
              {schoolSearchQuery && (
                <button
                  onClick={() => setSchoolSearchQuery('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 hover:text-slate-700"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Classroom Sub-Rooms Showcase */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <SchoolIcon className="w-5 h-5 text-blue-600" />
                    <span>Classroom Sub-Rooms</span>
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                      {room.classes.length}
                    </span>
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Each class functions as an isolated sub-room. Non-parent faculty require Principal authorization to view health records.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {filteredSchoolClasses.map((cls) => {
                  const accessCheck = checkUserSubRoomAccess(room, cls.id, currentUser, permissions);
                  const enrolledCount = students.filter(
                    (s) => s.classId === cls.id || s.className?.toLowerCase() === cls.name.toLowerCase()
                  ).length;

                  return (
                    <div
                      key={cls.id}
                      onClick={() => {
                        setActiveClassId(cls.id);
                        setCurrentView('subroom');
                      }}
                      className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-blue-400 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-md border border-blue-200">
                            {cls.grade} {cls.section ? `· ${cls.section}` : ''}
                          </span>

                          {accessCheck.hasAccess ? (
                            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              <span>Unlocked</span>
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 flex items-center gap-1">
                              <Lock className="w-3 h-3 text-amber-600" />
                              <span>Principal Auth Req.</span>
                            </span>
                          )}
                        </div>

                        <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                          {cls.name}
                        </h3>

                        <div className="mt-3 space-y-1 text-xs text-slate-500">
                          <div>Faculty Lead: <strong className="text-slate-700">{cls.leadTeacherName}</strong></div>
                          <div>Enrolled Students: <strong className="text-slate-700 font-mono">{enrolledCount}</strong></div>
                        </div>
                      </div>

                      <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-blue-600 group-hover:text-blue-700">
                        <span>Enter Sub-Room</span>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Role-Specific Workspaces */}
            <div className="pt-4 border-t border-slate-200">
              {currentUser.role === 'parent' && (
                <ParentPortal
                  currentUser={currentUser}
                  students={filteredSchoolStudents}
                  onUpdateStudent={handleUpdateStudent}
                  onAddChild={handleAddChild}
                  onAddDailyUpdate={handleAddDailyUpdate}
                  onDeleteChild={(childId) => {
                    const target = students.find((s) => s.id === childId);
                    if (target) setStudentToDelete(target);
                  }}
                />
              )}

              {currentUser.role === 'teacher' && (
                <TeacherPortal
                  currentUser={currentUser}
                  students={filteredSchoolStudents}
                  room={room}
                  permissions={permissions}
                  onRequestPermission={handleRequestClassPermission}
                  onAcknowledgeUpdate={handleAcknowledgeUpdate}
                  onOpenIntakeModal={() => setIsMedicalIntakeOpen(true)}
                  onAddStudent={handleAddChild}
                  onDeleteStudent={(stuId) => {
                    const target = students.find((s) => s.id === stuId);
                    if (target) setStudentToDelete(target);
                  }}
                />
              )}

              {currentUser.role === 'medical_center' && (
                <MedicalCenterPortal
                  currentUser={currentUser}
                  students={filteredSchoolStudents}
                  room={room}
                  permissions={permissions}
                  onRequestCrossSchoolPermission={handleRequestCrossSchoolPermission}
                  onOpenIntakeModal={() => setIsMedicalIntakeOpen(true)}
                  onUpdateStudent={handleUpdateStudent}
                  onAcknowledgeUpdate={handleAcknowledgeUpdate}
                  onAddStudent={handleAddChild}
                  onDeleteStudent={(stuId) => {
                    const target = students.find((s) => s.id === stuId);
                    if (target) setStudentToDelete(target);
                  }}
                />
              )}

              {(currentUser.role === 'principal' || currentUser.role === 'it_admin') && (
                <PrincipalPortal
                  currentUser={currentUser}
                  room={room}
                  students={filteredSchoolStudents}
                  permissions={permissions}
                  onOpenAuditMemory={() => setIsAuditMemoryOpen(true)}
                  onRefresh={() => refreshActiveRoom()}
                  onEnterSubRoom={(clsId) => {
                    setActiveClassId(clsId);
                    setCurrentView('subroom');
                  }}
                />
              )}

              {currentUser.role === 'district_auth' && (
                <DistrictAuthorityPortal
                  currentUser={currentUser}
                  currentRoom={room}
                  students={filteredSchoolStudents}
                  permissions={permissions}
                  onOpenVerificationModal={(perm) => setVerificationModalPermission(perm)}
                  onOpenAuditMemory={() => setIsAuditMemoryOpen(true)}
                  onRefresh={() => refreshActiveRoom()}
                />
              )}
            </div>
          </div>
        )}
      </main>

      {/* 3. Add Classroom Sub-Room Modal (Principal & IT Admin Only) */}
      {isAddClassModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-start justify-center p-2 sm:p-4 overflow-y-auto overscroll-contain">
          <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-2xl p-5 sm:p-6 relative my-2 sm:my-auto max-h-[92dvh] overflow-y-auto">
            <button
              onClick={() => setIsAddClassModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 text-xs font-bold"
            >
              ✕ Close
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
                <SchoolIcon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Add Classroom Sub-Room</h3>
                <p className="text-xs text-slate-500">Authorized: Principal or School IT Admin</p>
              </div>
            </div>

            {addClassError && (
              <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700">
                {addClassError}
              </div>
            )}

            <form onSubmit={handleAddClassSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Classroom Name *</label>
                <input
                  type="text"
                  required
                  value={newClassName}
                  onChange={(e) => setNewClassName(e.target.value)}
                  placeholder="e.g. Room 104 - Grade 3 Advanced"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Academic Grade *</label>
                  <input
                    type="text"
                    required
                    value={newClassGrade}
                    onChange={(e) => setNewClassGrade(e.target.value)}
                    placeholder="e.g. Grade 3"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Section</label>
                  <input
                    type="text"
                    value={newClassSection}
                    onChange={(e) => setNewClassSection(e.target.value)}
                    placeholder="e.g. Section B"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Lead Faculty Teacher *</label>
                <input
                  type="text"
                  required
                  value={newClassTeacher}
                  onChange={(e) => setNewClassTeacher(e.target.value)}
                  placeholder="e.g. Ms. Sarah Jenkins"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex items-center gap-2 justify-end pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddClassModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold"
                >
                  Create Sub-Room
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. Add Child Modal */}
      <AddChildModal
        isOpen={isAddChildModalOpen}
        onClose={() => setIsAddChildModalOpen(false)}
        currentUser={currentUser}
        onAddChild={handleAddChild}
      />

      {/* 5. Student Enrollment / Health Intake Modal */}
      {isMedicalIntakeOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-start justify-center p-0 sm:p-4 overflow-y-auto overscroll-contain">
          <div className="bg-white rounded-none sm:rounded-2xl max-w-4xl w-full border-0 sm:border border-slate-200 shadow-2xl relative my-0 sm:my-auto h-[100dvh] sm:h-auto sm:max-h-[90vh] flex flex-col overflow-hidden shrink-0">
            {/* Header - Fixed & Sticky */}
            <div className="px-4 sm:px-6 py-3.5 bg-slate-900 text-white flex items-center justify-between shrink-0 shadow-xs z-20">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-rose-600 text-white flex items-center justify-center shadow-xs shrink-0">
                  <HeartPulse className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white leading-tight">Student Health Intake & Enrollment</h3>
                  <p className="text-[11px] text-slate-400">Complete student identity, allergy flags, and emergency files</p>
                </div>
              </div>
              <button
                onClick={() => setIsMedicalIntakeOpen(false)}
                className="text-slate-400 hover:text-white p-2 rounded-lg text-xs font-bold transition-colors active:bg-slate-800"
                aria-label="Close modal"
              >
                ✕ Close
              </button>
            </div>

            {/* Scrollable Form Body */}
            <div className="flex-1 min-h-0 overflow-y-auto p-2 sm:p-6 overscroll-contain">
              <StoringScreen
                onStoreStudent={(stu) => {
                  handleAddChild(stu);
                  setIsMedicalIntakeOpen(false);
                }}
                currentUser={currentUser}
                onNavigateToEditing={() => setIsMedicalIntakeOpen(false)}
                isModal={true}
              />
            </div>
          </div>
        </div>
      )}

      {/* 6. Authentication & Role Switcher Modal */}
      {isLoginModalOpen && (
        <LoginModal
          currentUser={currentUser}
          accounts={accounts}
          roomClasses={room?.classes || []}
          onLoginSuccess={(user) => {
            setCurrentUser(user);
            setVerificationModalPermission(null);
            setIsLoginModalOpen(false);
          }}
          onRegisterAccount={handleRegisterAccount}
          onDeleteAccount={handleDeleteAccount}
          onCancel={() => setIsLoginModalOpen(false)}
        />
      )}

      {/* 7. Approval Inbox Modal (Principal & District Authority) */}
      {isApprovalsModalOpen && room && (
        <ApprovalInboxModal
          roomCode={room.roomCode}
          schoolName={room.schoolName}
          permissions={permissions}
          currentRole={currentUser.role}
          onClose={() => setIsApprovalsModalOpen(false)}
          onOpenVerificationModal={(perm) => setVerificationModalPermission(perm)}
          onRefresh={() => refreshActiveRoom()}
        />
      )}

      {/* 8. Email Verification Link Modal - Strictly isolated to Principal and District Authority */}
      {verificationModalPermission && room && (currentUser.role === 'principal' || currentUser.role === 'district_auth') && (
        <EmailVerificationModal
          permission={verificationModalPermission}
          schoolName={room.schoolName}
          onClose={() => setVerificationModalPermission(null)}
          onResolved={() => refreshActiveRoom()}
        />
      )}

      {/* 9. Real-Time Audit Memory Panel */}
      {room && (
        <AuditMemoryPanel
          roomCode={room.roomCode}
          schoolName={room.schoolName}
          auditLog={auditLog}
          isOpen={isAuditMemoryOpen}
          onClose={() => setIsAuditMemoryOpen(false)}
        />
      )}

      {/* 10. District Officer Exclusive School Deletion Modal (Requires Officer Password) */}
      {room && (
        <DistrictSchoolDeleteModal
          isOpen={isDistrictDeleteModalOpen}
          schoolRoomCode={room.roomCode}
          schoolName={room.schoolName}
          currentUser={currentUser}
          onClose={() => setIsDistrictDeleteModalOpen(false)}
          onSuccess={() => {
            setIsDistrictDeleteModalOpen(false);
            refreshActiveRoom(null);
            setCurrentView('national');
          }}
        />
      )}

      {/* 11. Unauthorized Deletion Attempt Notice (Non-District Roles) */}
      <DeleteConfirmModal
        isOpen={unauthorizedDeleteAttempt}
        title="School Deletion Restricted"
        message="In accordance with national safety and governance protocols, school workspaces can STRICTLY and EXCLUSIVELY be deleted by the authorized District Officer and requires their verified password. Principals, IT admins, teachers, and parents do not have authority to delete schools."
        itemName="Permanent School Deletion"
        confirmLabel="Understood"
        onConfirm={() => setUnauthorizedDeleteAttempt(false)}
        onCancel={() => setUnauthorizedDeleteAttempt(false)}
      />

      {/* 12. Delete Student Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={studentToDelete !== null}
        title="Delete Student Record"
        message="Are you sure you want to permanently remove this student's health record from this school room? All allergy protocols and daily logs for this student will be deleted."
        itemName={studentToDelete ? `${studentToDelete.name} (${studentToDelete.grade})` : ''}
        confirmLabel="Delete Student Record"
        onConfirm={confirmDeleteStudent}
        onCancel={() => setStudentToDelete(null)}
      />

      {/* 13. Minimal Global Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 px-4 sm:px-6 text-xs text-slate-500">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-slate-800">K-Health</span>
            <span>·</span>
            <span>National Educational Health Network</span>
            {room && (
              <>
                <span>·</span>
                <span>Active School: <strong className="font-mono text-slate-700">{room.roomCode}</strong></span>
              </>
            )}
            <span>·</span>
            <span>FERPA & HIPAA Compliant Sub-Room Vault</span>
          </div>

          <div className="flex items-center gap-4 flex-wrap">
            <button
              onClick={() => setIsLoginModalOpen(true)}
              className="text-slate-600 hover:text-slate-900 font-semibold hover:underline"
            >
              Switch Role ({currentUser.name})
            </button>
            <span>·</span>
            <button
              onClick={() => setCurrentView('national')}
              className="text-slate-500 hover:text-slate-800 font-semibold hover:underline"
            >
              National Portal
            </button>
            {room && (
              <>
                <span>·</span>
                {currentUser.role === 'district_auth' ? (
                  <button
                    onClick={handleDeleteRoom}
                    className="text-rose-600 hover:text-rose-800 font-semibold hover:underline flex items-center gap-1"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Delete School (District Auth Req.)</span>
                  </button>
                ) : (
                  <span className="text-slate-400 flex items-center gap-1 text-[11px]" title="Only District Officers can delete school workspaces">
                    <Lock className="w-3 h-3 text-slate-400" />
                    <span>School Deletion Protected</span>
                  </span>
                )}
              </>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
}
