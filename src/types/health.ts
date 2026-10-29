export type AllergySeverity = 'Mild' | 'Moderate' | 'Severe (Anaphylaxis)';

export interface Allergy {
  id: string;
  name: string;
  severity: AllergySeverity;
  triggers: string;
  reaction: string;
  actionPlan: string;
  hasEpiPen: boolean;
  epipenLocation?: string;
}

export interface Medication {
  id: string;
  name: string;
  dosage: string;
  timing: string;
  nurseSupervision: boolean;
}

export interface HealthUpdate {
  id: string;
  date: string;
  author: string;
  authorRole: 'parent' | 'nurse' | 'teacher' | 'medical_center' | 'principal' | 'district_auth' | 'it_admin';
  type: 'allergy' | 'medication' | 'daily_notice' | 'emergency_contact' | 'permission';
  content: string;
  acknowledgedByTeacher?: boolean;
}

export interface EmergencyContact {
  name: string;
  relation: string;
  phone: string;
}

export interface Physician {
  name: string;
  clinic: string;
  phone: string;
}

export interface Classroom {
  id: string;
  name: string; // e.g., "Room 101 - Grade 3", "Section A"
  grade: string; // e.g., "Grade 3"
  section?: string; // e.g., "Section A"
  leadTeacherName: string;
  leadTeacherEmail?: string;
  leadTeacherId?: string;
  roomCode?: string;
  authorizedUserIds?: string[]; // IDs of users permitted by Principal to view this sub-room
}

export interface SchoolRoom {
  roomCode: string; // e.g. "SCH-7842"
  schoolId: string;
  schoolName: string;
  districtName: string;
  address?: string;
  principalName: string;
  principalEmail: string;
  districtAuthEmail: string;
  createdAt: string;
  classes: Classroom[];
}

export interface School {
  id: string;
  name: string;
  code: string;
  gradeLevels: string;
  address: string;
  nurseOfficePhone: string;
  leadNurse: string;
  district: string;
}

export interface Student {
  id: string;
  roomCode?: string; // Associated school room
  schoolId?: string;
  schoolName?: string;
  classId?: string; // e.g. "cls-3a"
  className?: string; // e.g. "Room 101 - Grade 3"
  name: string;
  grade: string;
  dob: string;
  gender: string;
  bloodType: string;
  parentId: string;
  parentName: string;
  parentPhone: string;
  parentEmail: string;
  secondaryContact: EmergencyContact;
  allergies: Allergy[];
  medications: Medication[];
  dietaryRestrictions: string[];
  physician: Physician;
  specialNotes: string;
  recentUpdates: HealthUpdate[];
  lastUpdated: string;
}

export interface District {
  id: string;
  name: string;
  code: string;
  state: string;
  districtOfficerName: string;
  districtOfficerEmail: string;
  schoolRoomCodes: string[];
  description?: string;
}

export type UserRole = 'teacher' | 'parent' | 'medical_center' | 'principal' | 'district_auth' | 'it_admin';

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  title: string;
  schoolId?: string;
  roomCode?: string;
  districtId?: string;
  assignedClassId?: string; // Teacher's primary classroom
  linkedStudentId?: string;
  linkedStudentIds?: string[];
  facilityName?: string;
}

export type PermissionType = 'class_to_class' | 'cross_school' | 'subroom_access';
export type PermissionStatus = 'pending' | 'approved' | 'rejected';

export interface AccessPermission {
  id: string;
  roomCode: string;
  type: PermissionType;
  requesterId: string;
  requesterName: string;
  requesterRole: UserRole;
  requesterEmail: string;
  targetClassId?: string;
  targetClassName?: string;
  targetRoomCode?: string;
  targetSchoolName?: string;
  reason: string;
  status: PermissionStatus;
  approverRole: 'principal' | 'district_auth';
  verificationToken: string;
  verificationLink: string;
  requestedAt: string;
  decidedAt?: string;
  decidedBy?: string;
  expiresAt?: string;
}

export interface AuditMemoryEntry {
  id: string;
  roomCode: string;
  timestamp: string;
  actorName: string;
  actorRole: string;
  actionType:
    | 'ROOM_CREATED'
    | 'ROOM_LOADED'
    | 'STUDENT_ENROLLED'
    | 'STUDENT_DELETED'
    | 'RECORD_UPDATED'
    | 'DAILY_NOTICE_SENT'
    | 'DAILY_NOTICE_ACKNOWLEDGED'
    | 'PERMISSION_REQUESTED'
    | 'PERMISSION_APPROVED'
    | 'PERMISSION_REJECTED'
    | 'ROOM_DISCONNECTED'
    | 'ROOM_DELETED'
    | 'ACCOUNT_CREATED'
    | 'ACCOUNT_DELETED'
    | 'CLASS_CREATED'
    | 'CLASS_DELETED'
    | 'SUBROOM_AUTHORIZED';
  description: string;
  metadata?: Record<string, any>;
}

export type ActiveScreen = 'storing' | 'editing' | 'updating';
