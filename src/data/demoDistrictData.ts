import { 
  SchoolRoom, 
  Classroom, 
  Student, 
  Allergy, 
  Medication, 
  UserAccount, 
  AuditMemoryEntry 
} from '../types/health';
import { RoomBundle } from '../services/roomStorage';

// ================= DEMO DISTRICT SCHOOL DEFINITIONS =================
export interface DemoSchoolConfig {
  roomCode: string;
  schoolId: string;
  schoolName: string;
  districtName: string;
  districtId: string;
  address: string;
  principalName: string;
  principalEmail: string;
  itAdminName: string;
  itAdminEmail: string;
  nurseName: string;
  nurseEmail: string;
  classes: Array<{
    id: string;
    name: string;
    grade: string;
    section: string;
    leadTeacherName: string;
    leadTeacherEmail: string;
    studentCount: number; // 4 to 9 students
  }>;
}

export const DEMO_DISTRICT_CONFIG = {
  id: 'dist-metro-north',
  name: 'Metro North School District 12',
  code: 'MND-12',
  state: 'New York',
  districtOfficerName: 'Superintendent Arthur Vance',
  districtOfficerEmail: 'compliance@metronorth.gov',
  description: 'Comprehensive metropolitan educational district governing 6 member schools with 38 class sub-rooms and active medical registries.',
};

export const DEMO_SCHOOLS: DemoSchoolConfig[] = [
  // 1. Oakridge Regional Elementary & Middle (6 classes)
  {
    roomCode: 'OAK-2026',
    schoolId: 'sch-oakridge',
    schoolName: 'Oakridge Regional School',
    districtName: 'Metro North School District 12',
    districtId: 'dist-metro-north',
    address: '450 Oakridge Parkway, New York, NY 10024',
    principalName: 'Dr. Arthur Sterling, Ed.D',
    principalEmail: 'arthur.sterling@oakridge.edu',
    itAdminName: 'Marcus Bradley',
    itAdminEmail: 'it.admin@oakridge.edu',
    nurseName: 'Nurse Evelyn Gomez, BSN, RN',
    nurseEmail: 'nurse@oakridge.edu',
    classes: [
      { id: 'cls-oak-101', name: 'Room 101 - Kindergarten', grade: 'Kindergarten', section: 'Section K-A', leadTeacherName: 'Ms. Sarah Jenkins', leadTeacherEmail: 's.jenkins@oakridge.edu', studentCount: 6 },
      { id: 'cls-oak-102', name: 'Room 102 - Grade 1', grade: 'Grade 1', section: 'Section 1-A', leadTeacherName: 'Mr. David Miller', leadTeacherEmail: 'd.miller@oakridge.edu', studentCount: 7 },
      { id: 'cls-oak-201', name: 'Room 201 - Grade 2', grade: 'Grade 2', section: 'Section 2-A', leadTeacherName: 'Mrs. Rachel Adams', leadTeacherEmail: 'r.adams@oakridge.edu', studentCount: 6 },
      { id: 'cls-oak-301', name: 'Room 301 - Grade 3', grade: 'Grade 3', section: 'Section 3-A', leadTeacherName: 'Ms. Clara Henderson', leadTeacherEmail: 'c.henderson@oakridge.edu', studentCount: 7 },
      { id: 'cls-oak-401', name: 'Room 401 - Grade 4', grade: 'Grade 4', section: 'Section 4-A', leadTeacherName: 'Mr. Thomas Reed', leadTeacherEmail: 't.reed@oakridge.edu', studentCount: 6 },
      { id: 'cls-oak-501', name: 'Room 501 - Grade 5', grade: 'Grade 5', section: 'Section 5-A', leadTeacherName: 'Mrs. Evelyn Vance', leadTeacherEmail: 'e.vance@oakridge.edu', studentCount: 6 },
    ],
  },

  // 2. Lincoln STEM & Health Preparatory (7 classes)
  {
    roomCode: 'LNC-2026',
    schoolId: 'sch-lincoln-stem',
    schoolName: 'Lincoln STEM & Health Preparatory',
    districtName: 'Metro North School District 12',
    districtId: 'dist-metro-north',
    address: '1120 Academic Circle, New York, NY 10031',
    principalName: 'Dr. Brenda Walker, Ph.D',
    principalEmail: 'b.walker@lincolnstem.edu',
    itAdminName: 'Devon Clarke',
    itAdminEmail: 'systems@lincolnstem.edu',
    nurseName: 'Nurse Patricia Wong, RN',
    nurseEmail: 'clinic@lincolnstem.edu',
    classes: [
      { id: 'cls-lnc-101', name: 'Discovery Lab - Grade 1', grade: 'Grade 1', section: 'STEM-1A', leadTeacherName: 'Ms. Angela Yu', leadTeacherEmail: 'a.yu@lincolnstem.edu', studentCount: 6 },
      { id: 'cls-lnc-201', name: 'Bio-Health Lab - Grade 2', grade: 'Grade 2', section: 'STEM-2A', leadTeacherName: 'Mr. Christopher Hayes', leadTeacherEmail: 'c.hayes@lincolnstem.edu', studentCount: 6 },
      { id: 'cls-lnc-301', name: 'Robotics & Math - Grade 3', grade: 'Grade 3', section: 'STEM-3A', leadTeacherName: 'Mrs. Maya Patel', leadTeacherEmail: 'm.patel@lincolnstem.edu', studentCount: 7 },
      { id: 'cls-lnc-401', name: 'Environmental Sci - Grade 4', grade: 'Grade 4', section: 'STEM-4A', leadTeacherName: 'Mr. Jason Cooper', leadTeacherEmail: 'j.cooper@lincolnstem.edu', studentCount: 6 },
      { id: 'cls-lnc-501', name: 'Computer Sci - Grade 5', grade: 'Grade 5', section: 'STEM-5A', leadTeacherName: 'Ms. Linda Washington', leadTeacherEmail: 'l.washington@lincolnstem.edu', studentCount: 6 },
      { id: 'cls-lnc-601', name: 'Junior Engineering - Grade 6', grade: 'Grade 6', section: 'STEM-6A', leadTeacherName: 'Dr. Kevin Morales', leadTeacherEmail: 'k.morales@lincolnstem.edu', studentCount: 7 },
      { id: 'cls-lnc-701', name: 'Biomedical Tech - Grade 7', grade: 'Grade 7', section: 'STEM-7A', leadTeacherName: 'Ms. Samantha Brooks', leadTeacherEmail: 's.brooks@lincolnstem.edu', studentCount: 6 },
    ],
  },

  // 3. Maple Valley Community Academy (6 classes)
  {
    roomCode: 'MPL-2026',
    schoolId: 'sch-maple-valley',
    schoolName: 'Maple Valley Community Academy',
    districtName: 'Metro North School District 12',
    districtId: 'dist-metro-north',
    address: '88 Riverview Terrace, New York, NY 10027',
    principalName: 'Principal James O\'Connor, M.Ed',
    principalEmail: 'j.oconnor@maplevalley.edu',
    itAdminName: 'Nadia Petrov',
    itAdminEmail: 'tech@maplevalley.edu',
    nurseName: 'Nurse Gregory Daniels, RN',
    nurseEmail: 'g.daniels@maplevalley.edu',
    classes: [
      { id: 'cls-mpl-k01', name: 'Early Years - Kindergarten', grade: 'Kindergarten', section: 'Room K', leadTeacherName: 'Mrs. Hannah Diaz', leadTeacherEmail: 'h.diaz@maplevalley.edu', studentCount: 6 },
      { id: 'cls-mpl-101', name: 'Primary Room - Grade 1', grade: 'Grade 1', section: 'Room 1A', leadTeacherName: 'Mr. Samuel Green', leadTeacherEmail: 's.green@maplevalley.edu', studentCount: 6 },
      { id: 'cls-mpl-201', name: 'Meadow Room - Grade 2', grade: 'Grade 2', section: 'Room 2A', leadTeacherName: 'Ms. Chloe Bennett', leadTeacherEmail: 'c.bennett@maplevalley.edu', studentCount: 6 },
      { id: 'cls-mpl-301', name: 'Forest Room - Grade 3', grade: 'Grade 3', section: 'Room 3A', leadTeacherName: 'Mrs. Patricia Collins', leadTeacherEmail: 'p.collins@maplevalley.edu', studentCount: 7 },
      { id: 'cls-mpl-401', name: 'Cedar Room - Grade 4', grade: 'Grade 4', section: 'Room 4A', leadTeacherName: 'Mr. Brian Foster', leadTeacherEmail: 'b.foster@maplevalley.edu', studentCount: 6 },
      { id: 'cls-mpl-501', name: 'Pine Room - Grade 5', grade: 'Grade 5', section: 'Room 5A', leadTeacherName: 'Ms. Danielle Scott', leadTeacherEmail: 'd.scott@maplevalley.edu', studentCount: 6 },
    ],
  },

  // 4. Horizon Arts & Sciences Elementary (6 classes)
  {
    roomCode: 'HRZ-2026',
    schoolId: 'sch-horizon-arts',
    schoolName: 'Horizon Arts & Sciences Elementary',
    districtName: 'Metro North School District 12',
    districtId: 'dist-metro-north',
    address: '225 Boulevard of the Arts, New York, NY 10019',
    principalName: 'Dr. Miriam Al-Mansoor',
    principalEmail: 'm.almansoor@horizonarts.edu',
    itAdminName: 'Julian Sterling',
    itAdminEmail: 'it.lead@horizonarts.edu',
    nurseName: 'Nurse Karen Schultz, RN',
    nurseEmail: 'healthoffice@horizonarts.edu',
    classes: [
      { id: 'cls-hrz-101', name: 'Studio 1A - Grade 1', grade: 'Grade 1', section: 'Studio 1', leadTeacherName: 'Ms. Valerie Wright', leadTeacherEmail: 'v.wright@horizonarts.edu', studentCount: 6 },
      { id: 'cls-hrz-201', name: 'Studio 2A - Grade 2', grade: 'Grade 2', section: 'Studio 2', leadTeacherName: 'Mr. Anthony Ross', leadTeacherEmail: 'a.ross@horizonarts.edu', studentCount: 7 },
      { id: 'cls-hrz-301', name: 'Studio 3B - Grade 3', grade: 'Grade 3', section: 'Studio 3', leadTeacherName: 'Mrs. Stephanie Kim', leadTeacherEmail: 's.kim@horizonarts.edu', studentCount: 6 },
      { id: 'cls-hrz-401', name: 'Inquiry Hall - Grade 4', grade: 'Grade 4', section: 'Hall 4', leadTeacherName: 'Mr. Brandon Lee', leadTeacherEmail: 'b.lee@horizonarts.edu', studentCount: 7 },
      { id: 'cls-hrz-501', name: 'Logic Center - Grade 5', grade: 'Grade 5', section: 'Lab 5', leadTeacherName: 'Ms. Rebecca Torres', leadTeacherEmail: 'r.torres@horizonarts.edu', studentCount: 6 },
      { id: 'cls-hrz-601', name: 'Honors Studio - Grade 6', grade: 'Grade 6', section: 'Honors 6', leadTeacherName: 'Dr. Jonathan Hall', leadTeacherEmail: 'j.hall@horizonarts.edu', studentCount: 7 },
    ],
  },

  // 5. Summit Crest Public Academy (7 classes)
  {
    roomCode: 'SMT-2026',
    schoolId: 'sch-summit-crest',
    schoolName: 'Summit Crest Public Academy',
    districtName: 'Metro North School District 12',
    districtId: 'dist-metro-north',
    address: '770 Highland Ridge Way, New York, NY 10034',
    principalName: 'Principal Robert Vance, M.S.',
    principalEmail: 'r.vance@summitcrest.edu',
    itAdminName: 'Taylor Morgan',
    itAdminEmail: 'systems@summitcrest.edu',
    nurseName: 'Nurse Diane Morales, RN',
    nurseEmail: 'clinic@summitcrest.edu',
    classes: [
      { id: 'cls-smt-101', name: 'Room 101 - Grade 1', grade: 'Grade 1', section: 'Section A', leadTeacherName: 'Ms. Cynthia Baker', leadTeacherEmail: 'c.baker@summitcrest.edu', studentCount: 6 },
      { id: 'cls-smt-201', name: 'Room 201 - Grade 2', grade: 'Grade 2', section: 'Section A', leadTeacherName: 'Mr. Gregory Turner', leadTeacherEmail: 'g.turner@summitcrest.edu', studentCount: 6 },
      { id: 'cls-smt-301', name: 'Room 301 - Grade 3', grade: 'Grade 3', section: 'Section A', leadTeacherName: 'Mrs. Megan Phillips', leadTeacherEmail: 'm.phillips@summitcrest.edu', studentCount: 6 },
      { id: 'cls-smt-401', name: 'Room 401 - Grade 4', grade: 'Grade 4', section: 'Section A', leadTeacherName: 'Mr. Derrick Campbell', leadTeacherEmail: 'd.campbell@summitcrest.edu', studentCount: 7 },
      { id: 'cls-smt-501', name: 'Room 501 - Grade 5', grade: 'Grade 5', section: 'Section A', leadTeacherName: 'Ms. Allison Ward', leadTeacherEmail: 'a.ward@summitcrest.edu', studentCount: 6 },
      { id: 'cls-smt-601', name: 'Room 601 - Grade 6', grade: 'Grade 6', section: 'Section A', leadTeacherName: 'Mr. Paul Richardson', leadTeacherEmail: 'p.richardson@summitcrest.edu', studentCount: 6 },
      { id: 'cls-smt-701', name: 'Room 701 - Grade 7', grade: 'Grade 7', section: 'Section A', leadTeacherName: 'Dr. Victoria Sanchez', leadTeacherEmail: 'v.sanchez@summitcrest.edu', studentCount: 6 },
    ],
  },

  // 6. Riverside International School (6 classes)
  {
    roomCode: 'RVR-2026',
    schoolId: 'sch-riverside-intl',
    schoolName: 'Riverside International School',
    districtName: 'Metro North School District 12',
    districtId: 'dist-metro-north',
    address: '500 Riverside Drive, New York, NY 10025',
    principalName: 'Dr. Hélène Dupuis',
    principalEmail: 'h.dupuis@riverside-intl.org',
    itAdminName: 'Alexandre Fontaine',
    itAdminEmail: 'it.lead@riverside-intl.org',
    nurseName: 'Nurse Beatrice Mercier, RN',
    nurseEmail: 'infirmerie@riverside-intl.org',
    classes: [
      { id: 'cls-rvr-k01', name: 'IB Early Years - Kindergarten', grade: 'Kindergarten', section: 'IB-K', leadTeacherName: 'Mme. Sophie Laurent', leadTeacherEmail: 's.laurent@riverside-intl.org', studentCount: 6 },
      { id: 'cls-rvr-101', name: 'Global Explorers - Grade 1', grade: 'Grade 1', section: 'IB-1', leadTeacherName: 'Mr. Kenji Takahashi', leadTeacherEmail: 'k.takahashi@riverside-intl.org', studentCount: 6 },
      { id: 'cls-rvr-201', name: 'World Heritage - Grade 2', grade: 'Grade 2', section: 'IB-2', leadTeacherName: 'Ms. Maria Santos', leadTeacherEmail: 'm.santos@riverside-intl.org', studentCount: 6 },
      { id: 'cls-rvr-301', name: 'Cultures & Sci - Grade 3', grade: 'Grade 3', section: 'IB-3', leadTeacherName: 'Herr Lars Weber', leadTeacherEmail: 'l.weber@riverside-intl.org', studentCount: 7 },
      { id: 'cls-rvr-401', name: 'Atlantic Hall - Grade 4', grade: 'Grade 4', section: 'IB-4', leadTeacherName: 'Mrs. Fatima Zahra', leadTeacherEmail: 'f.zahra@riverside-intl.org', studentCount: 6 },
      { id: 'cls-rvr-501', name: 'Pacific Hall - Grade 5', grade: 'Grade 5', section: 'IB-5', leadTeacherName: 'Mr. Patrick Evans', leadTeacherEmail: 'p.evans@riverside-intl.org', studentCount: 7 },
    ],
  },
];

// Realistic Allergies Archetypes
interface AllergyArchetype {
  name: string;
  severity: 'Mild' | 'Moderate' | 'Severe (Anaphylaxis)';
  triggers: string;
  reaction: string;
  actionPlan: string;
  hasEpiPen: boolean;
  epipenLocation?: string;
  dietaryRestriction?: string;
  medication?: {
    name: string;
    dosage: string;
    timing: string;
    nurseSupervision: boolean;
  };
}

const ALLERGY_ARCHETYPES: AllergyArchetype[] = [
  {
    name: 'Peanuts & Tree Nuts (Walnuts, Cashews)',
    severity: 'Severe (Anaphylaxis)',
    triggers: 'Ingestion or cross-contact with nut oils',
    reaction: 'Throat tightness, facial hives, severe respiratory distress, hypotension',
    actionPlan: 'Administer EpiPen 0.3mg immediately into outer mid-thigh. Dial 911 immediately. Keep child calm & flat.',
    hasEpiPen: true,
    epipenLocation: 'Teacher Desk Top Drawer & Health Office Lockbox #2',
    dietaryRestriction: 'Strict Nut-Free Table & Cafeteria Ban',
    medication: {
      name: 'EpiPen Auto-Injector 0.3mg',
      dosage: '0.3mg auto-injectable',
      timing: 'Immediately upon suspected ingestion or signs of anaphylaxis',
      nurseSupervision: true,
    },
  },
  {
    name: 'Cow Milk Protein (Lactose & Casein)',
    severity: 'Severe (Anaphylaxis)',
    triggers: 'Direct ingestion of cheese, yogurt, dairy sauces, or milk derivatives',
    reaction: 'Rapid lip swelling, vomiting, wheezing, and generalized hives',
    actionPlan: 'Administer Auvi-Q 0.15mg into outer thigh. Alert emergency services and school nurse.',
    hasEpiPen: true,
    epipenLocation: 'Student Backpack Red Pouch & Nurse Emergency Kit',
    dietaryRestriction: 'Lactose & Casein Free - No Dairy Cafeteria Items',
    medication: {
      name: 'Auvi-Q Auto-Injector 0.15mg',
      dosage: '0.15mg voice-guided auto-injector',
      timing: 'Emergency immediate use',
      nurseSupervision: true,
    },
  },
  {
    name: 'Whole Hen Eggs & Ovalbumin',
    severity: 'Moderate',
    triggers: 'Ingestion of baked items containing egg wash or whole eggs',
    reaction: 'Periorbital swelling, stomach cramping, localized hives on face and arms',
    actionPlan: 'Administer oral Diphenhydramine (12.5mg), monitor airway closely for 30 minutes, notify guardian.',
    hasEpiPen: false,
    dietaryRestriction: 'Egg-Free Diet - Check all pastry & sauce labels',
    medication: {
      name: 'Children\'s Benadryl (Diphenhydramine)',
      dosage: '12.5mg (1 chewable tablet or 5ml)',
      timing: 'As needed upon localized allergic reaction',
      nurseSupervision: true,
    },
  },
  {
    name: 'Wheat & Gluten (Celiac Disease & Wheat Allergy)',
    severity: 'Moderate',
    triggers: 'Ingestion of bread, pasta, flour dust, or shared toaster contamination',
    reaction: 'Acute gastrointestinal pain, nausea, skin rash, prolonged intestinal inflammation',
    actionPlan: 'Ensure pure gluten-free meals. Administer water, rest in clinic, contact parent for pickup if symptomatic.',
    hasEpiPen: false,
    dietaryRestriction: 'Strict Celiac Safe: 100% Gluten-Free Dedicated Prep',
  },
  {
    name: 'Shellfish (Shrimp, Crab, Lobster)',
    severity: 'Severe (Anaphylaxis)',
    triggers: 'Ingestion or airborne steam from cooking shellfish',
    reaction: 'Tongue swelling, hoarseness, sudden drop in blood pressure, dizziness',
    actionPlan: 'Inject EpiPen 0.3mg immediately. Call 911 and note exact time of injection.',
    hasEpiPen: true,
    epipenLocation: 'Nurse Office Emergency Medication Vault',
    dietaryRestriction: 'Strict Shellfish Ban',
    medication: {
      name: 'EpiPen Auto-Injector (0.3mg)',
      dosage: '0.3mg intramuscular',
      timing: 'Emergency use upon exposure',
      nurseSupervision: true,
    },
  },
  {
    name: 'Insect Stings (Honeybee & Yellow Jacket)',
    severity: 'Severe (Anaphylaxis)',
    triggers: 'Stings during outdoor recess, physical education, or field trips',
    reaction: 'Rapid systemic swelling, bronchospasm, cyanosis, shock',
    actionPlan: 'Remove stinger by scraping. Inject EpiPen 0.3mg into thigh immediately. Call 911.',
    hasEpiPen: true,
    epipenLocation: 'Recess First Aid Fanny Pack & Main Health Clinic',
    medication: {
      name: 'EpiPen 2-Pak (0.3mg)',
      dosage: '0.3mg auto-injector',
      timing: 'Immediate upon sting occurrence',
      nurseSupervision: true,
    },
  },
  {
    name: 'Cold-Air & Exercise-Induced Asthma',
    severity: 'Moderate',
    triggers: 'Vigorous running, cold dry outdoor air below 45°F, pollen exposure',
    reaction: 'Wheezing, persistent coughing, chest tightness, shortness of breath',
    actionPlan: 'Administer 2 puffs Albuterol via spacer. Rest for 15 minutes. Repeat if peak flow < 80%.',
    hasEpiPen: false,
    medication: {
      name: 'Albuterol HFA Inhaler with AeroChamber Spacer',
      dosage: '2 puffs (90mcg per puff)',
      timing: '15 minutes prior to PE/recess or as needed for coughing',
      nurseSupervision: true,
    },
  },
  {
    name: 'Penicillin & Amoxicillin',
    severity: 'Severe (Anaphylaxis)',
    triggers: 'Accidental administration of penicillin-class oral antibiotics',
    reaction: 'Full body urticaria, facial edema, wheezing, anaphylactic shock',
    actionPlan: 'DO NOT ADMINISTER PENICILLIN DERIVATIVES. If exposed, dial 911 and treat with epinephrine.',
    hasEpiPen: false,
  },
  {
    name: 'Sesame Seeds & Tahini',
    severity: 'Severe (Anaphylaxis)',
    triggers: 'Ingestion of sesame oil, hamburger buns, hummus, or crackers',
    reaction: 'Facial swelling, throat constriction, severe abdominal cramps',
    actionPlan: 'Administer EpiPen 0.15mg or 0.3mg immediately. Call 911.',
    hasEpiPen: true,
    epipenLocation: 'Classroom Emergency Pouch hanging by door',
    dietaryRestriction: 'Sesame & Tahini Free - Verify bakery labels',
    medication: {
      name: 'EpiPen Jr (0.15mg)',
      dosage: '0.15mg auto-injector',
      timing: 'Emergency immediate use',
      nurseSupervision: true,
    },
  },
  {
    name: 'Latex & Synthetic Powder',
    severity: 'Mild',
    triggers: 'Contact with latex examination gloves, party balloons, or rubber bands',
    reaction: 'Contact dermatitis, erythema, localized itching',
    actionPlan: 'Wash skin thoroughly with soap and water. Use vinyl/nitrile gloves exclusively.',
    hasEpiPen: false,
  },
];

// Diverse Student Names Pool
const FIRST_NAMES = [
  'Leo', 'Maya', 'Liam', 'Sofia', 'Lucas', 'Chloe', 'Ethan', 'Ava', 'Noah', 'Isabella',
  'Elijah', 'Harper', 'James', 'Mia', 'Benjamin', 'Charlotte', 'Oliver', 'Amelia', 'Alexander', 'Emma',
  'Daniel', 'Evelyn', 'Henry', 'Abigail', 'Sebastian', 'Emily', 'Jack', 'Ella', 'Samuel', 'Scarlett',
  'David', 'Grace', 'Joseph', 'Chloe', 'Gabriel', 'Camila', 'Carter', 'Penelope', 'Julian', 'Riley',
  'Luke', 'Layla', 'Anthony', 'Lillian', 'Dylan', 'Nora', 'Owen', 'Zoey', 'Wyatt', 'Mila'
];

const LAST_NAMES = [
  'Matthews', 'Lin', 'O\'Connor', 'Rodriguez', 'Chen', 'Bennett', 'Washington', 'Patel', 'Campbell', 'Rossi',
  'Murphy', 'Diaz', 'Vance', 'Tanaka', 'Foster', 'Kim', 'Wright', 'Santos', 'Lee', 'Scott',
  'Jenkins', 'Miller', 'Adams', 'Henderson', 'Reed', 'Walker', 'Clarke', 'Wong', 'Yu', 'Hayes',
  'Cooper', 'Morales', 'Brooks', 'Green', 'Collins', 'Schultz', 'Turner', 'Phillips', 'Ward', 'Sanchez'
];

const BLOOD_TYPES = ['O+', 'A+', 'B+', 'AB+', 'O-', 'A-', 'B-'];
const CLINICS = [
  { name: 'Dr. Sarah Lin, MD (Pediatric Allergy)', clinic: 'Children\'s Regional Health Center', phone: '(555) 890-4411' },
  { name: 'Dr. Marcus Vance, MD', clinic: 'Metro Pediatric Associates', phone: '(555) 342-1200' },
  { name: 'Dr. Elena Rostova, FAAP', clinic: 'Empire Valley Children\'s Clinic', phone: '(555) 765-8899' },
  { name: 'Dr. Raymond Chen, MD', clinic: 'Northside Pediatric & Asthma Care', phone: '(555) 912-3344' },
  { name: 'Dr. Amanda Brooks, MD', clinic: 'University Medical Pediatric Center', phone: '(555) 431-7722' },
];

// Helper to deterministically generate realistic students for a classroom
export function generateStudentsForClass(
  school: DemoSchoolConfig,
  classroom: DemoSchoolConfig['classes'][0],
  startIndex: number
): Student[] {
  const students: Student[] = [];
  const count = classroom.studentCount;

  for (let i = 0; i < count; i++) {
    const globalIdx = startIndex + i;
    const firstName = FIRST_NAMES[(globalIdx * 7) % FIRST_NAMES.length];
    const lastName = LAST_NAMES[(globalIdx * 11) % LAST_NAMES.length];
    const fullName = `${firstName} ${lastName}`;
    const studentId = `std-${school.roomCode.toLowerCase().replace('-', '')}-${classroom.id.replace('cls-', '')}-${i + 1}`;
    
    // Parent info
    const parentFirstName = ['Robert', 'Maria', 'David', 'Sarah', 'Carlos', 'Jennifer', 'Michael', 'Jessica'][(globalIdx * 3) % 8];
    const parentName = `${parentFirstName} ${lastName}`;
    const parentPhone = `(555) ${Math.floor(200 + (globalIdx * 37) % 700)}-${Math.floor(1000 + (globalIdx * 89) % 9000)}`;
    const parentEmail = `${parentFirstName.toLowerCase()}.${lastName.toLowerCase()}@family.net`;

    const secName = ['Elena', 'Marcus', 'Grace', 'Thomas', 'Victoria', 'Arthur'][(globalIdx * 5) % 6];
    const secRelation = ['Aunt / Emergency Alternate', 'Grandmother', 'Uncle', 'Family Guardian', 'Older Sibling (Adult)'][(globalIdx) % 5];
    const secPhone = `(555) ${Math.floor(300 + (globalIdx * 41) % 600)}-${Math.floor(2000 + (globalIdx * 73) % 7000)}`;

    const physician = CLINICS[(globalIdx * 2) % CLINICS.length];
    const bloodType = BLOOD_TYPES[(globalIdx * 3) % BLOOD_TYPES.length];
    const gender = (i % 2 === 0) ? 'Female' : 'Male';

    // Calculate birth year based on grade
    let birthYear = 2017;
    if (classroom.grade.includes('Kindergarten')) birthYear = 2020;
    else if (classroom.grade.includes('Grade 1')) birthYear = 2019;
    else if (classroom.grade.includes('Grade 2')) birthYear = 2018;
    else if (classroom.grade.includes('Grade 3')) birthYear = 2017;
    else if (classroom.grade.includes('Grade 4')) birthYear = 2016;
    else if (classroom.grade.includes('Grade 5')) birthYear = 2015;
    else if (classroom.grade.includes('Grade 6')) birthYear = 2014;
    else if (classroom.grade.includes('Grade 7')) birthYear = 2013;

    const month = String(1 + (globalIdx % 12)).padStart(2, '0');
    const day = String(1 + ((globalIdx * 5) % 27)).padStart(2, '0');
    const dob = `${birthYear}-${month}-${day}`;

    // Select allergies (approx 65% of demo students have an allergy / medical condition for rich testing)
    const allergies: Allergy[] = [];
    const medications: Medication[] = [];
    const dietaryRestrictions: string[] = [];

    const hasAllergy = (globalIdx % 3 !== 2); // 2 out of 3 have medical protocols
    if (hasAllergy) {
      const allergyType = ALLERGY_ARCHETYPES[(globalIdx + i) % ALLERGY_ARCHETYPES.length];
      const allergyId = `alg-${studentId}-1`;
      allergies.push({
        id: allergyId,
        name: allergyType.name,
        severity: allergyType.severity,
        triggers: allergyType.triggers,
        reaction: allergyType.reaction,
        actionPlan: allergyType.actionPlan,
        hasEpiPen: allergyType.hasEpiPen,
        epipenLocation: allergyType.epipenLocation,
      });

      if (allergyType.dietaryRestriction) {
        dietaryRestrictions.push(allergyType.dietaryRestriction);
      }

      if (allergyType.medication) {
        medications.push({
          id: `med-${studentId}-1`,
          name: allergyType.medication.name,
          dosage: allergyType.medication.dosage,
          timing: allergyType.medication.timing,
          nurseSupervision: allergyType.medication.nurseSupervision,
        });
      }

      // Add a secondary condition for certain students
      if (i === 1) {
        const secondary = ALLERGY_ARCHETYPES[6]; // Asthma
        allergies.push({
          id: `alg-${studentId}-2`,
          name: secondary.name,
          severity: secondary.severity,
          triggers: secondary.triggers,
          reaction: secondary.reaction,
          actionPlan: secondary.actionPlan,
          hasEpiPen: false,
        });
        if (secondary.medication) {
          medications.push({
            id: `med-${studentId}-2`,
            name: secondary.medication.name,
            dosage: secondary.medication.dosage,
            timing: secondary.medication.timing,
            nurseSupervision: true,
          });
        }
      }
    } else {
      // General healthy student with seasonal notice
      dietaryRestrictions.push('Standard Balanced School Cafeteria Meal');
    }

    const specialNotes = allergies.length > 0
      ? `${fullName} has active medical alerts on file with ${school.nurseName}. Emergency medication is verified and stored in ${allergies[0].epipenLocation || 'School Health Office'}.`
      : 'General student wellness profile on record. Annual routine physical completed.';

    students.push({
      id: studentId,
      roomCode: school.roomCode,
      schoolId: school.schoolId,
      schoolName: school.schoolName,
      classId: classroom.id,
      className: classroom.name,
      name: fullName,
      grade: classroom.grade,
      dob,
      gender,
      bloodType,
      parentId: `usr-parent-${studentId}`,
      parentName,
      parentPhone,
      parentEmail,
      secondaryContact: {
        name: secName,
        relation: secRelation,
        phone: secPhone,
      },
      allergies,
      medications,
      dietaryRestrictions,
      physician,
      specialNotes,
      recentUpdates: [
        {
          id: `upd-${studentId}-init`,
          date: '2026-09-01T08:00:00.000Z',
          author: `${parentName} (Parent)`,
          authorRole: 'parent',
          type: 'daily_notice',
          content: 'Student annual health intake and emergency contact details verified for current academic session.',
          acknowledgedByTeacher: true,
        },
      ],
      lastUpdated: '2026-09-01',
    });
  }

  return students;
}

// Generate the complete RoomBundle for a demo school
export function buildDemoSchoolBundle(school: DemoSchoolConfig, schoolIdx: number): RoomBundle {
  const classrooms: Classroom[] = school.classes.map((c) => ({
    id: c.id,
    name: c.name,
    grade: c.grade,
    section: c.section,
    leadTeacherName: c.leadTeacherName,
    leadTeacherEmail: c.leadTeacherEmail,
    roomCode: school.roomCode,
    authorizedUserIds: [],
  }));

  const room: SchoolRoom = {
    roomCode: school.roomCode,
    schoolId: school.schoolId,
    schoolName: school.schoolName,
    districtName: school.districtName,
    address: school.address,
    principalName: school.principalName,
    principalEmail: school.principalEmail,
    districtAuthEmail: DEMO_DISTRICT_CONFIG.districtOfficerEmail,
    createdAt: '2026-08-15T09:00:00.000Z',
    classes: classrooms,
  };

  // Generate all students across all classes in this school
  let allStudents: Student[] = [];
  let studentOffset = schoolIdx * 45;
  school.classes.forEach((cls) => {
    const classStudents = generateStudentsForClass(school, cls, studentOffset);
    allStudents = allStudents.concat(classStudents);
    studentOffset += classStudents.length;
  });

  // Accounts for this school
  const accounts: UserAccount[] = [
    {
      id: `usr-principal-${school.roomCode.toLowerCase()}`,
      name: school.principalName,
      email: school.principalEmail,
      passwordHash: 'principal123',
      role: 'principal',
      title: 'Chief Educational Administrator & Principal',
      schoolId: school.schoolId,
      roomCode: school.roomCode,
    },
    {
      id: `usr-itadmin-${school.roomCode.toLowerCase()}`,
      name: school.itAdminName,
      email: school.itAdminEmail,
      passwordHash: 'itadmin123',
      role: 'it_admin',
      title: 'School IT Administrator & Systems Lead',
      schoolId: school.schoolId,
      roomCode: school.roomCode,
    },
    {
      id: `usr-nurse-${school.roomCode.toLowerCase()}`,
      name: school.nurseName,
      email: school.nurseEmail,
      passwordHash: 'nurse123',
      role: 'medical_center',
      title: 'Licensed Health Staff, RN',
      schoolId: school.schoolId,
      roomCode: school.roomCode,
      facilityName: `${school.schoolName} Health Center`,
    },
  ];

  // Also add lead teachers as accounts
  school.classes.forEach((c) => {
    accounts.push({
      id: `usr-teacher-${c.id}`,
      name: c.leadTeacherName,
      email: c.leadTeacherEmail,
      passwordHash: 'teacher123',
      role: 'teacher',
      title: `${c.grade} Faculty Lead`,
      schoolId: school.schoolId,
      roomCode: school.roomCode,
      assignedClassId: c.id,
    });
  });

  // Audit Logs
  const auditLog: AuditMemoryEntry[] = [
    {
      id: `aud-${school.roomCode}-init`,
      roomCode: school.roomCode,
      timestamp: '2026-08-15T09:00:00.000Z',
      actorName: DEMO_DISTRICT_CONFIG.districtOfficerName,
      actorRole: 'district_auth',
      actionType: 'ROOM_CREATED',
      description: `District Officer ${DEMO_DISTRICT_CONFIG.districtOfficerName} provisioned ${school.schoolName} (${school.roomCode}) into ${school.districtName}.`,
    },
    {
      id: `aud-${school.roomCode}-classes`,
      roomCode: school.roomCode,
      timestamp: '2026-08-16T10:15:00.000Z',
      actorName: school.principalName,
      actorRole: 'principal',
      actionType: 'CLASS_CREATED',
      description: `Principal ${school.principalName} authorized and configured ${school.classes.length} classroom sub-rooms with assigned faculty leads.`,
    },
    {
      id: `aud-${school.roomCode}-intake`,
      roomCode: school.roomCode,
      timestamp: '2026-09-01T08:30:00.000Z',
      actorName: school.nurseName,
      actorRole: 'medical_center',
      actionType: 'STUDENT_ENROLLED',
      description: `School Nurse ${school.nurseName} completed health registry audit and verified ${allStudents.length} student medical records and emergency protocols.`,
    },
  ];

  return {
    room,
    students: allStudents,
    accounts,
    permissions: [],
    auditLog,
  };
}

// Master function to seed the entire demo district into localStorage
export function seedFullDemoDistrict(force = false): {
  schoolCount: number;
  classCount: number;
  studentCount: number;
} {
  if (typeof window === 'undefined') {
    return { schoolCount: 0, classCount: 0, studentCount: 0 };
  }

  const STORAGE_CATALOG_KEY = 'khealth_rooms_catalog_v2';
  const STORAGE_DISTRICTS_KEY = 'khealth_districts_catalog_v2';
  const ROOM_DATA_PREFIX = 'khealth_room_data_v2_';
  const SEED_FLAG_KEY = 'khealth_demo_district_v3_seeded';

  if (!force && localStorage.getItem(SEED_FLAG_KEY) === 'true') {
    // Already seeded, compute current count
    let totalClasses = 0;
    let totalStudents = 0;
    DEMO_SCHOOLS.forEach((s) => {
      totalClasses += s.classes.length;
      s.classes.forEach((c) => { totalStudents += c.studentCount; });
    });
    return {
      schoolCount: DEMO_SCHOOLS.length,
      classCount: totalClasses,
      studentCount: totalStudents,
    };
  }

  let totalClasses = 0;
  let totalStudents = 0;
  const catalogRooms: SchoolRoom[] = [];
  const demoRoomCodes = DEMO_SCHOOLS.map((s) => s.roomCode);

  DEMO_SCHOOLS.forEach((schoolConfig, idx) => {
    const bundle = buildDemoSchoolBundle(schoolConfig, idx);
    localStorage.setItem(ROOM_DATA_PREFIX + schoolConfig.roomCode, JSON.stringify(bundle));
    catalogRooms.push(bundle.room);
    totalClasses += schoolConfig.classes.length;
    totalStudents += bundle.students.length;
  });

  // Merge into Rooms Catalog
  let existingCatalog: SchoolRoom[] = [];
  try {
    const raw = localStorage.getItem(STORAGE_CATALOG_KEY);
    if (raw) existingCatalog = JSON.parse(raw);
  } catch {
    existingCatalog = [];
  }

  const filteredCatalog = existingCatalog.filter((r) => !demoRoomCodes.includes(r.roomCode));
  const newCatalog = [...catalogRooms, ...filteredCatalog];
  localStorage.setItem(STORAGE_CATALOG_KEY, JSON.stringify(newCatalog));

  // Update Districts Catalog so Metro North School District 12 has all 6 school codes
  let districtsCatalog: any[] = [];
  try {
    const rawDistricts = localStorage.getItem(STORAGE_DISTRICTS_KEY);
    if (rawDistricts) districtsCatalog = JSON.parse(rawDistricts);
  } catch {
    districtsCatalog = [];
  }

  const metroNorthIdx = districtsCatalog.findIndex((d) => d.id === DEMO_DISTRICT_CONFIG.id);
  if (metroNorthIdx >= 0) {
    districtsCatalog[metroNorthIdx] = {
      ...districtsCatalog[metroNorthIdx],
      schoolRoomCodes: demoRoomCodes,
      description: DEMO_DISTRICT_CONFIG.description,
    };
  } else {
    districtsCatalog.unshift({
      ...DEMO_DISTRICT_CONFIG,
      schoolRoomCodes: demoRoomCodes,
    });
  }

  localStorage.setItem(STORAGE_DISTRICTS_KEY, JSON.stringify(districtsCatalog));
  localStorage.setItem(SEED_FLAG_KEY, 'true');

  return {
    schoolCount: DEMO_SCHOOLS.length,
    classCount: totalClasses,
    studentCount: totalStudents,
  };
}
