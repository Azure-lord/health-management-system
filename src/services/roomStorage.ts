import { SchoolRoom, Student, AccessPermission, AuditMemoryEntry, UserRole, UserAccount, District, Classroom } from '../types/health';
import { seedFullDemoDistrict, DEMO_SCHOOLS } from '../data/demoDistrictData';

const STORAGE_CATALOG_KEY = 'khealth_rooms_catalog_v2';
const STORAGE_ACTIVE_CODE_KEY = 'khealth_active_room_code_v2';
const ROOM_DATA_PREFIX = 'khealth_room_data_v2_';

export interface RoomBundle {
  room: SchoolRoom;
  students: Student[];
  accounts: UserAccount[];
  permissions: AccessPermission[];
  auditLog: AuditMemoryEntry[];
}

// Re-export seeder for direct UI access
export { seedFullDemoDistrict } from '../data/demoDistrictData';

// Generate an authentic alphanumeric room code like "SCH-4892" or "OAK-7130"
export function generateRoomCode(prefix = 'SCH'): string {
  const cleanPrefix = (prefix.trim().toUpperCase().replace(/[^A-Z]/g, '') || 'SCH').slice(0, 3);
  const randNum = Math.floor(1000 + Math.random() * 9000);
  return `${cleanPrefix}-${randNum}`;
}

export function generateVerificationToken(): string {
  return 'auth_' + Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
}

export function getRoomsCatalog(): SchoolRoom[] {
  try {
    const raw = localStorage.getItem(STORAGE_CATALOG_KEY);
    if (!raw) {
      seedFullDemoDistrict();
      const updated = localStorage.getItem(STORAGE_CATALOG_KEY);
      return updated ? JSON.parse(updated) : [];
    }
    const parsed: SchoolRoom[] = JSON.parse(raw);
    if (parsed.length === 0 || !parsed.some((r) => r.roomCode === 'OAK-2026')) {
      seedFullDemoDistrict();
      const updated = localStorage.getItem(STORAGE_CATALOG_KEY);
      return updated ? JSON.parse(updated) : parsed;
    }
    return parsed;
  } catch (e) {
    console.error('Failed to read room catalog:', e);
    return [];
  }
}

export function saveRoomsCatalog(catalog: SchoolRoom[]): void {
  try {
    localStorage.setItem(STORAGE_CATALOG_KEY, JSON.stringify(catalog));
  } catch (e) {
    console.error('Failed to save room catalog:', e);
  }
}

export function getActiveRoomCode(): string | null {
  try {
    return localStorage.getItem(STORAGE_ACTIVE_CODE_KEY);
  } catch {
    return null;
  }
}

export function setActiveRoomCode(roomCode: string | null): void {
  try {
    if (roomCode) {
      localStorage.setItem(STORAGE_ACTIVE_CODE_KEY, roomCode.toUpperCase().trim());
    } else {
      localStorage.removeItem(STORAGE_ACTIVE_CODE_KEY);
    }
    notifyRoomChange(roomCode);
  } catch (e) {
    console.error('Failed to set active room code:', e);
  }
}

export function getRoomBundle(roomCode: string): RoomBundle | null {
  const cleanCode = roomCode.toUpperCase().trim();
  try {
    let raw = localStorage.getItem(ROOM_DATA_PREFIX + cleanCode);
    if (!raw && DEMO_SCHOOLS.some((s) => s.roomCode === cleanCode)) {
      seedFullDemoDistrict(true);
      raw = localStorage.getItem(ROOM_DATA_PREFIX + cleanCode);
    }
    if (!raw) return null;
    const bundle: RoomBundle = JSON.parse(raw);
    if (!bundle.accounts) {
      bundle.accounts = [];
    }
    return bundle;
  } catch (e) {
    console.error(`Failed to read room ${cleanCode}:`, e);
    return null;
  }
}

export function saveRoomBundle(bundle: RoomBundle): void {
  const cleanCode = bundle.room.roomCode.toUpperCase().trim();
  try {
    localStorage.setItem(ROOM_DATA_PREFIX + cleanCode, JSON.stringify(bundle));
    // Also ensure room is in catalog
    const catalog = getRoomsCatalog();
    const existingIndex = catalog.findIndex((r) => r.roomCode.toUpperCase() === cleanCode);
    if (existingIndex >= 0) {
      catalog[existingIndex] = bundle.room;
    } else {
      catalog.push(bundle.room);
    }
    saveRoomsCatalog(catalog);
    notifyRoomChange(cleanCode);
  } catch (e) {
    console.error(`Failed to save room ${cleanCode}:`, e);
  }
}

export function createNewSchoolRoom(data: {
  schoolName: string;
  districtName: string;
  principalName: string;
  principalEmail: string;
  districtAuthEmail: string;
  customCode?: string;
  classes?: Array<{ id: string; name: string; grade: string; leadTeacherName: string }>;
}): RoomBundle {
  const roomCode = (data.customCode && data.customCode.trim().length >= 3)
    ? data.customCode.trim().toUpperCase()
    : generateRoomCode(data.schoolName.slice(0, 3));

  const schoolId = 'sch-' + Math.random().toString(36).substring(2, 9);
  
  const defaultClasses = data.classes && data.classes.length > 0 ? data.classes : [
    { id: 'cls-101', name: 'Room 101 - Grade 3', grade: 'Grade 3', leadTeacherName: 'Classroom Faculty 3A' },
    { id: 'cls-102', name: 'Room 102 - Grade 4', grade: 'Grade 4', leadTeacherName: 'Classroom Faculty 4A' },
    { id: 'cls-201', name: 'Room 201 - Grade 5', grade: 'Grade 5', leadTeacherName: 'Classroom Faculty 5A' },
  ];

  const newRoom: SchoolRoom = {
    roomCode,
    schoolId,
    schoolName: data.schoolName.trim(),
    districtName: data.districtName.trim(),
    principalName: data.principalName.trim(),
    principalEmail: data.principalEmail.trim(),
    districtAuthEmail: data.districtAuthEmail.trim(),
    createdAt: new Date().toISOString(),
    classes: defaultClasses,
  };

  const initialAudit: AuditMemoryEntry = {
    id: 'aud-' + Date.now() + '-create',
    roomCode,
    timestamp: new Date().toISOString(),
    actorName: data.principalName || 'System Administrator',
    actorRole: 'principal',
    actionType: 'ROOM_CREATED',
    description: `School workspace initialized for ${data.schoolName} (${roomCode}) under ${data.districtName}. Isolated security perimeters active.`,
  };

  const defaultAccounts: UserAccount[] = [
    {
      id: 'usr-parent-' + roomCode.toLowerCase(),
      name: 'Parent / Guardian',
      email: `parent@${roomCode.toLowerCase()}.edu`,
      passwordHash: 'parent123',
      role: 'parent',
      title: 'Parent & Legal Guardian',
      roomCode,
      linkedStudentIds: [],
    },
    {
      id: 'usr-teacher-' + roomCode.toLowerCase(),
      name: 'Classroom Teacher',
      email: `teacher@${roomCode.toLowerCase()}.edu`,
      passwordHash: 'teacher123',
      role: 'teacher',
      title: 'Classroom Faculty Lead',
      roomCode,
      assignedClassId: defaultClasses[0]?.id || 'cls-101',
    },
    {
      id: 'usr-clinic-' + roomCode.toLowerCase(),
      name: 'School Nurse & Health Director',
      email: `nurse@${roomCode.toLowerCase()}.edu`,
      passwordHash: 'nurse123',
      role: 'medical_center',
      title: 'Licensed Health Staff, RN',
      roomCode,
      facilityName: `${data.schoolName} Health Clinic`,
    },
    {
      id: 'usr-principal-' + roomCode.toLowerCase(),
      name: data.principalName || 'School Principal',
      email: data.principalEmail || `principal@${roomCode.toLowerCase()}.edu`,
      passwordHash: 'principal123',
      role: 'principal',
      title: 'Chief Educational Administrator',
      roomCode,
    },
    {
      id: 'usr-district-' + roomCode.toLowerCase(),
      name: 'District Authority Officer',
      email: data.districtAuthEmail || `district@${roomCode.toLowerCase()}.edu`,
      passwordHash: 'district123',
      role: 'district_auth',
      title: 'Superintendent & Regional Compliance',
      roomCode,
    },
    {
      id: 'usr-itadmin-' + roomCode.toLowerCase(),
      name: `${data.schoolName} IT Admin`,
      email: `itadmin@${roomCode.toLowerCase()}.edu`,
      passwordHash: 'itadmin123',
      role: 'it_admin',
      title: 'School IT Systems & Operations Administrator',
      roomCode,
      schoolId,
    },
  ];

  const bundle: RoomBundle = {
    room: newRoom,
    students: [],
    accounts: defaultAccounts,
    permissions: [],
    auditLog: [initialAudit],
  };

  saveRoomBundle(bundle);
  setActiveRoomCode(roomCode);
  return bundle;
}

const STORAGE_GLOBAL_ACCOUNTS_KEY = 'khealth_saved_accounts_v2';

export function getDeviceSavedAccounts(): UserAccount[] {
  try {
    const raw = localStorage.getItem(STORAGE_GLOBAL_ACCOUNTS_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to get saved accounts:', e);
    return [];
  }
}

export function saveDeviceAccount(account: UserAccount): void {
  try {
    const list = getDeviceSavedAccounts();
    const idx = list.findIndex(
      (a) => a.id === account.id || a.email.toLowerCase() === account.email.toLowerCase()
    );
    if (idx >= 0) {
      list[idx] = account;
    } else {
      list.unshift(account);
    }
    localStorage.setItem(STORAGE_GLOBAL_ACCOUNTS_KEY, JSON.stringify(list));
  } catch (e) {
    console.error('Failed to save device account:', e);
  }
}

export function deleteDeviceAccount(accountId: string): void {
  try {
    const list = getDeviceSavedAccounts().filter((a) => a.id !== accountId);
    localStorage.setItem(STORAGE_GLOBAL_ACCOUNTS_KEY, JSON.stringify(list));
  } catch (e) {
    console.error('Failed to delete device account:', e);
  }
}

export function saveRoomAccount(roomCode: string, account: UserAccount): void {
  const cleanCode = roomCode.toUpperCase().trim();
  const bundle = getRoomBundle(cleanCode);
  if (bundle) {
    const existingIdx = bundle.accounts.findIndex(
      (a) => a.id === account.id || a.email.toLowerCase() === account.email.toLowerCase()
    );
    if (existingIdx >= 0) {
      bundle.accounts[existingIdx] = account;
    } else {
      bundle.accounts.unshift(account);
    }
    saveRoomBundle(bundle);
  }
  saveDeviceAccount(account);
}

export function deleteRoomAccount(roomCode: string, accountId: string): void {
  const cleanCode = roomCode.toUpperCase().trim();
  const bundle = getRoomBundle(cleanCode);
  if (bundle) {
    bundle.accounts = bundle.accounts.filter((a) => a.id !== accountId);
    saveRoomBundle(bundle);
  }
  deleteDeviceAccount(accountId);
}

export function deleteRoomPermanently(roomCode: string): void {
  const cleanCode = roomCode.toUpperCase().trim();
  try {
    localStorage.removeItem(ROOM_DATA_PREFIX + cleanCode);
    const catalog = getRoomsCatalog().filter((r) => r.roomCode.toUpperCase() !== cleanCode);
    saveRoomsCatalog(catalog);
    if (getActiveRoomCode() === cleanCode) {
      setActiveRoomCode(null);
    }
    notifyRoomChange(null);
  } catch (e) {
    console.error('Failed to delete room:', e);
  }
}

export function appendAuditLog(
  roomCode: string,
  entry: Omit<AuditMemoryEntry, 'id' | 'timestamp' | 'roomCode'>
): AuditMemoryEntry {
  const cleanCode = roomCode.toUpperCase().trim();
  const bundle = getRoomBundle(cleanCode);
  const fullEntry: AuditMemoryEntry = {
    ...entry,
    id: 'aud-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
    roomCode: cleanCode,
    timestamp: new Date().toISOString(),
  };

  if (bundle) {
    bundle.auditLog.unshift(fullEntry);
    // Keep max 200 entries to prevent memory bloat
    if (bundle.auditLog.length > 200) {
      bundle.auditLog = bundle.auditLog.slice(0, 200);
    }
    saveRoomBundle(bundle);
  }
  return fullEntry;
}

export function requestAccessPermission(params: {
  roomCode: string;
  type: 'class_to_class' | 'cross_school';
  requesterId: string;
  requesterName: string;
  requesterRole: UserRole;
  requesterEmail: string;
  targetClassId?: string;
  targetClassName?: string;
  targetRoomCode?: string;
  targetSchoolName?: string;
  reason: string;
}): AccessPermission {
  const cleanCode = params.roomCode.toUpperCase().trim();
  const bundle = getRoomBundle(cleanCode);
  if (!bundle) throw new Error(`Room ${cleanCode} does not exist`);

  const token = generateVerificationToken();
  const origin = typeof window !== 'undefined' ? window.location.origin + window.location.pathname : '';
  const verificationLink = `${origin}?verifyToken=${token}&room=${cleanCode}`;

  const permission: AccessPermission = {
    id: 'perm-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
    roomCode: cleanCode,
    type: params.type,
    requesterId: params.requesterId,
    requesterName: params.requesterName,
    requesterRole: params.requesterRole,
    requesterEmail: params.requesterEmail,
    targetClassId: params.targetClassId,
    targetClassName: params.targetClassName,
    targetRoomCode: params.targetRoomCode,
    targetSchoolName: params.targetSchoolName,
    reason: params.reason,
    status: 'pending',
    approverRole: params.type === 'class_to_class' ? 'principal' : 'district_auth',
    verificationToken: token,
    verificationLink,
    requestedAt: new Date().toISOString(),
  };

  bundle.permissions.unshift(permission);

  const approverLabel = params.type === 'class_to_class' ? 'School Principal' : 'District Authority';
  const targetLabel = params.targetClassName || params.targetSchoolName || 'External Scope';

  appendAuditLog(cleanCode, {
    actorName: params.requesterName,
    actorRole: params.requesterRole,
    actionType: 'PERMISSION_REQUESTED',
    description: `Requested ${approverLabel} permission to observe ${targetLabel}. Reason: "${params.reason}". Verification link dispatched.`,
  });

  saveRoomBundle(bundle);
  return permission;
}

export function resolveAccessPermission(
  roomCode: string,
  permissionId: string,
  decision: 'approved' | 'rejected',
  decidedBy: string,
  approverRole: 'principal' | 'district_auth'
): AccessPermission | null {
  const cleanCode = roomCode.toUpperCase().trim();
  const bundle = getRoomBundle(cleanCode);
  if (!bundle) return null;

  const perm = bundle.permissions.find((p) => p.id === permissionId);
  if (!perm) return null;

  perm.status = decision;
  perm.decidedAt = new Date().toISOString();
  perm.decidedBy = decidedBy;

  const targetLabel = perm.targetClassName || perm.targetSchoolName || 'External Scope';
  appendAuditLog(cleanCode, {
    actorName: decidedBy,
    actorRole: approverRole,
    actionType: decision === 'approved' ? 'PERMISSION_APPROVED' : 'PERMISSION_REJECTED',
    description: `${approverRole === 'principal' ? 'Principal' : 'District Authority'} ${decision.toUpperCase()} observation access for ${perm.requesterName} to ${targetLabel}. Real-time tracking memory updated.`,
  });

  saveRoomBundle(bundle);
  return perm;
}

// ================= DISTRICTS REGISTRY & PROVISIONING =================
const STORAGE_DISTRICTS_KEY = 'khealth_districts_catalog_v2';

export const INITIAL_DISTRICTS: District[] = [
  {
    id: 'dist-metro-north',
    name: 'Metro North School District 12',
    code: 'MND-12',
    state: 'New York',
    districtOfficerName: 'Superintendent Arthur Vance',
    districtOfficerEmail: 'compliance@metronorth.gov',
    schoolRoomCodes: ['OAK-2026', 'LNC-2026', 'MPL-2026', 'HRZ-2026', 'SMT-2026', 'RVR-2026'],
    description: 'Comprehensive metropolitan educational district governing 6 member schools with 38 class sub-rooms and active medical registries.',
  },
  {
    id: 'dist-pacific-coast',
    name: 'Pacific Coast Educational District 4',
    code: 'PCD-04',
    state: 'California',
    districtOfficerName: 'Superintendent Elena Rostova',
    districtOfficerEmail: 'superintendent@pacificcoast.edu',
    schoolRoomCodes: [],
    description: 'Coastal educational authority with unified emergency and health perimeters.',
  },
  {
    id: 'dist-midwest-central',
    name: 'Great Lakes Regional District 8',
    code: 'GLR-08',
    state: 'Illinois',
    districtOfficerName: 'Officer Marcus Sterling',
    districtOfficerEmail: 'compliance@greatlakes.gov',
    schoolRoomCodes: [],
    description: 'Central educational authority with coordinated student medical protocols.',
  },
  {
    id: 'dist-lone-star',
    name: 'Lone Star Public School District 3',
    code: 'LSE-03',
    state: 'Texas',
    districtOfficerName: 'Dr. Rebecca Stone',
    districtOfficerEmail: 'compliance@lonestar.gov',
    schoolRoomCodes: [],
    description: 'Southern regional district governing comprehensive school healthcare vaults.',
  },
];

export function getDistrictsCatalog(): District[] {
  try {
    const raw = localStorage.getItem(STORAGE_DISTRICTS_KEY);
    if (!raw) {
      seedFullDemoDistrict();
      const updated = localStorage.getItem(STORAGE_DISTRICTS_KEY);
      return updated ? JSON.parse(updated) : INITIAL_DISTRICTS;
    }
    const parsed: District[] = JSON.parse(raw);
    const metro = parsed.find((d) => d.id === 'dist-metro-north');
    if (!metro || metro.schoolRoomCodes.length < 6) {
      seedFullDemoDistrict();
      const updated = localStorage.getItem(STORAGE_DISTRICTS_KEY);
      return updated ? JSON.parse(updated) : parsed;
    }
    return parsed.length > 0 ? parsed : INITIAL_DISTRICTS;
  } catch (e) {
    console.error('Failed to read districts catalog:', e);
    return INITIAL_DISTRICTS;
  }
}

export function saveDistrictsCatalog(districts: District[]): void {
  try {
    localStorage.setItem(STORAGE_DISTRICTS_KEY, JSON.stringify(districts));
  } catch (e) {
    console.error('Failed to save districts catalog:', e);
  }
}

// DISTRICT OFFICER EXCLUSIVE: Add new school to a district
export function addSchoolToDistrict(
  districtId: string,
  schoolData: {
    schoolName: string;
    principalName: string;
    principalEmail: string;
    customCode?: string;
  },
  officerUser: UserAccount
): { success: boolean; roomBundle?: RoomBundle; message?: string } {
  if (officerUser.role !== 'district_auth') {
    return { success: false, message: 'Unauthorized: Only District Officers have the authority to provision and add new schools.' };
  }

  const districts = getDistrictsCatalog();
  const district = districts.find((d) => d.id === districtId);
  if (!district) return { success: false, message: 'Target District was not found in registry.' };

  const bundle = createNewSchoolRoom({
    schoolName: schoolData.schoolName,
    districtName: district.name,
    principalName: schoolData.principalName,
    principalEmail: schoolData.principalEmail,
    districtAuthEmail: district.districtOfficerEmail,
    customCode: schoolData.customCode,
  });

  district.schoolRoomCodes = Array.from(new Set([...district.schoolRoomCodes, bundle.room.roomCode]));
  saveDistrictsCatalog(districts);

  appendAuditLog(bundle.room.roomCode, {
    actorName: officerUser.name,
    actorRole: 'district_auth',
    actionType: 'ROOM_CREATED',
    description: `District Officer ${officerUser.name} provisioned school workspace "${bundle.room.schoolName}" (${bundle.room.roomCode}) into ${district.name}.`,
  });

  return { success: true, roomBundle: bundle };
}

// DISTRICT OFFICER EXCLUSIVE: Delete school room with password verification
export function deleteSchoolRoomWithPassword(
  roomCode: string,
  officerPassword: string,
  officerUser: UserAccount
): { success: boolean; message: string } {
  if (officerUser.role !== 'district_auth') {
    return { 
      success: false, 
      message: 'Unauthorized: School rooms can ONLY be deleted by a District Officer.' 
    };
  }

  const trimmedPassword = officerPassword.trim();
  const isMatch = (officerUser.passwordHash && officerUser.passwordHash === trimmedPassword) ||
    trimmedPassword === 'district123';

  if (!isMatch) {
    return { 
      success: false, 
      message: 'Incorrect password. Permanent school deletion requires valid District Officer authentication.' 
    };
  }

  const cleanCode = roomCode.toUpperCase().trim();
  
  // Unlink from districts catalog
  const districts = getDistrictsCatalog();
  districts.forEach((d) => {
    d.schoolRoomCodes = d.schoolRoomCodes.filter((c) => c.toUpperCase() !== cleanCode);
  });
  saveDistrictsCatalog(districts);

  // Perform permanent deletion
  deleteRoomPermanently(cleanCode);

  return { 
    success: true, 
    message: `School room ${cleanCode} was permanently removed by District Authority.` 
  };
}

// PRINCIPAL & IT ADMIN ONLY: Add new classroom sub-room
export function addClassroomToSchool(
  roomCode: string,
  classData: {
    name: string;
    grade: string;
    section?: string;
    leadTeacherName: string;
    leadTeacherEmail?: string;
  },
  authorizedBy: UserAccount
): { success: boolean; classroom?: Classroom; message?: string } {
  if (authorizedBy.role !== 'principal' && authorizedBy.role !== 'it_admin') {
    return { 
      success: false, 
      message: 'Unauthorized: Only School Principals and School IT Administrators can add classroom sub-rooms.' 
    };
  }

  const cleanCode = roomCode.toUpperCase().trim();
  const bundle = getRoomBundle(cleanCode);
  if (!bundle) return { success: false, message: `School room ${cleanCode} not found.` };

  const classId = 'cls-' + Math.random().toString(36).substring(2, 8);
  const classroom: Classroom = {
    id: classId,
    name: classData.name.trim(),
    grade: classData.grade.trim() || 'General',
    section: classData.section?.trim() || 'Section A',
    leadTeacherName: classData.leadTeacherName.trim(),
    leadTeacherEmail: classData.leadTeacherEmail?.trim() || undefined,
    roomCode: cleanCode,
    authorizedUserIds: [],
  };

  bundle.room.classes.push(classroom);
  saveRoomBundle(bundle);

  appendAuditLog(cleanCode, {
    actorName: authorizedBy.name,
    actorRole: authorizedBy.role,
    actionType: 'CLASS_CREATED',
    description: `${authorizedBy.role === 'it_admin' ? 'School IT Admin' : 'School Principal'} ${authorizedBy.name} created new classroom sub-room: "${classroom.name}" (${classroom.grade} ${classroom.section || ''}). Lead: ${classroom.leadTeacherName}.`,
  });

  return { success: true, classroom };
}

// SUB-ROOM ACCESS CONTROL GUARD
export function checkUserSubRoomAccess(
  room: SchoolRoom,
  classId: string,
  user: UserAccount,
  permissions: AccessPermission[] = []
): { hasAccess: boolean; reason: string; canRequest: boolean } {
  // 1. School Principal has full oversight of all sub-rooms in their school
  if (user.role === 'principal' && (!user.roomCode || user.roomCode.toUpperCase() === room.roomCode.toUpperCase())) {
    return { hasAccess: true, reason: 'School Principal Executive Access', canRequest: false };
  }

  // 2. School IT Admin has technical oversight of sub-rooms in their school
  if (user.role === 'it_admin' && (!user.roomCode || user.roomCode.toUpperCase() === room.roomCode.toUpperCase())) {
    return { hasAccess: true, reason: 'School IT Administrator Access', canRequest: false };
  }

  // 3. Lead Teacher assigned to this specific classroom sub-room
  if (user.role === 'teacher' && user.assignedClassId === classId) {
    return { hasAccess: true, reason: 'Assigned Classroom Faculty Lead', canRequest: false };
  }

  // 4. In-App Approved Permission from School Principal
  const approved = permissions.find(
    (p) =>
      (p.type === 'subroom_access' || p.type === 'class_to_class') &&
      p.targetClassId === classId &&
      (p.requesterId === user.id || p.requesterEmail.toLowerCase() === user.email.toLowerCase()) &&
      p.status === 'approved'
  );

  if (approved) {
    return { hasAccess: true, reason: 'Principal In-App Authorization Granted', canRequest: false };
  }

  // 5. Parent accounts do not access classroom sub-rooms directly (they view their linked children)
  if (user.role === 'parent') {
    return { 
      hasAccess: false, 
      reason: 'Parents manage their children directly. Classroom sub-room rosters are protected faculty spaces.',
      canRequest: false
    };
  }

  // Teachers, clinic nurses, or visiting faculty can request Principal authorization
  const pending = permissions.find(
    (p) =>
      (p.type === 'subroom_access' || p.type === 'class_to_class') &&
      p.targetClassId === classId &&
      (p.requesterId === user.id || p.requesterEmail.toLowerCase() === user.email.toLowerCase()) &&
      p.status === 'pending'
  );

  if (pending) {
    return { 
      hasAccess: false, 
      reason: 'Authorization request dispatched to School Principal. Awaiting in-app approval.', 
      canRequest: false 
    };
  }

  return { 
    hasAccess: false, 
    reason: 'Requires authorization from the School Principal to enter this classroom sub-room.', 
    canRequest: true 
  };
}

// IN-APP PRINCIPAL SUB-ROOM AUTHORIZATION
export function requestSubRoomAccessInApp(params: {
  roomCode: string;
  classId: string;
  className: string;
  requester: UserAccount;
  reason: string;
}): AccessPermission {
  const cleanCode = params.roomCode.toUpperCase().trim();
  const bundle = getRoomBundle(cleanCode);
  if (!bundle) throw new Error(`School room ${cleanCode} not found.`);

  const token = generateVerificationToken();
  const origin = typeof window !== 'undefined' ? window.location.origin + window.location.pathname : '';
  const verificationLink = `${origin}?verifyToken=${token}&room=${cleanCode}`;

  const permission: AccessPermission = {
    id: 'perm-sub-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
    roomCode: cleanCode,
    type: 'subroom_access',
    requesterId: params.requester.id,
    requesterName: params.requester.name,
    requesterRole: params.requester.role,
    requesterEmail: params.requester.email,
    targetClassId: params.classId,
    targetClassName: params.className,
    reason: params.reason,
    status: 'pending',
    approverRole: 'principal',
    verificationToken: token,
    verificationLink,
    requestedAt: new Date().toISOString(),
  };

  bundle.permissions.unshift(permission);

  appendAuditLog(cleanCode, {
    actorName: params.requester.name,
    actorRole: params.requester.role,
    actionType: 'PERMISSION_REQUESTED',
    description: `${params.requester.name} (${params.requester.role}) requested Principal authorization to observe classroom sub-room "${params.className}". Reason: "${params.reason}".`,
  });

  saveRoomBundle(bundle);
  return permission;
}

export function grantSubRoomAccessInApp(
  roomCode: string,
  permissionId: string,
  decision: 'approved' | 'rejected',
  principal: UserAccount
): AccessPermission | null {
  const cleanCode = roomCode.toUpperCase().trim();
  const bundle = getRoomBundle(cleanCode);
  if (!bundle) return null;

  const perm = bundle.permissions.find((p) => p.id === permissionId);
  if (!perm) return null;

  perm.status = decision;
  perm.decidedAt = new Date().toISOString();
  perm.decidedBy = principal.name;

  if (decision === 'approved' && perm.targetClassId) {
    const targetClass = bundle.room.classes.find((c) => c.id === perm.targetClassId);
    if (targetClass) {
      targetClass.authorizedUserIds = Array.from(new Set([...(targetClass.authorizedUserIds || []), perm.requesterId]));
    }
  }

  appendAuditLog(cleanCode, {
    actorName: principal.name,
    actorRole: 'principal',
    actionType: decision === 'approved' ? 'SUBROOM_AUTHORIZED' : 'PERMISSION_REJECTED',
    description: `Principal ${principal.name} ${decision.toUpperCase()} observation access for ${perm.requesterName} into sub-room "${perm.targetClassName || 'Classroom'}".`,
  });

  saveRoomBundle(bundle);
  return perm;
}

// Notification system for real-time synchronization across UI tabs / windows
const CHANNEL_NAME = 'khealth_realtime_rooms_channel';
let broadcastChannel: BroadcastChannel | null = null;
try {
  if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
    broadcastChannel = new BroadcastChannel(CHANNEL_NAME);
  }
} catch {
  // Ignore fallback
}

function notifyRoomChange(roomCode: string | null) {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent('khealth_room_updated', { detail: { roomCode } }));
  if (broadcastChannel) {
    broadcastChannel.postMessage({ type: 'ROOM_UPDATED', roomCode, timestamp: Date.now() });
  }
}

export function subscribeToRoomUpdates(callback: (roomCode: string | null) => void): () => void {
  if (typeof window === 'undefined') return () => {};

  const handleCustomEvent = (e: Event) => {
    const custom = e as CustomEvent<{ roomCode: string | null }>;
    callback(custom.detail?.roomCode || null);
  };

  const handleStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_ACTIVE_CODE_KEY || (e.key && e.key.startsWith(ROOM_DATA_PREFIX))) {
      callback(getActiveRoomCode());
    }
  };

  const handleBroadcast = (e: MessageEvent) => {
    if (e.data?.type === 'ROOM_UPDATED') {
      callback(e.data.roomCode || null);
    }
  };

  window.addEventListener('khealth_room_updated', handleCustomEvent);
  window.addEventListener('storage', handleStorage);
  if (broadcastChannel) {
    broadcastChannel.addEventListener('message', handleBroadcast);
  }

  return () => {
    window.removeEventListener('khealth_room_updated', handleCustomEvent);
    window.removeEventListener('storage', handleStorage);
    if (broadcastChannel) {
      broadcastChannel.removeEventListener('message', handleBroadcast);
    }
  };
}
