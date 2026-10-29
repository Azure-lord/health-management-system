# National Education & School Health Sub-Room Hub

A production-grade, hierarchical national architecture connecting School Districts, School Workspaces, and isolated Classroom Sub-Rooms. Features an interactive national map, scope-aware search, role-governed authorization, school-specific IT Admin infrastructure, and password-authenticated District Officer school room deletion.

## User Review & Critical Decisions

> [!IMPORTANT]
> The following architectural decisions have been confirmed and revised through user feedback:
> - **Exclusive District Officer School Deletion with Password Gate**: A School Room can **strictly and exclusively** be deleted by the **District Officer**. Deletion requires entering the District Officer's verified password/passkey before permanent removal is executed. Principals, IT Admins, Teachers, and Parents have no authority or UI button to delete a school.
> - **Interactive National Landing Canvas**: The root screen features an interactive National Map with clickable states, regional school districts, and member schools, alongside a unified National Directory Search.
> - **Scope-Aware Search Perimeters**:
>   - *National Scope*: Searches all registered districts, schools, and class sub-rooms across the country.
>   - *District Scope*: Restricts queries strictly to member schools within that district.
>   - *School Scope*: Restricts queries strictly to classrooms and faculty in that school.
>   - *Sub-Room Scope*: Restricts queries strictly to the students, allergies, and daily notices in that classroom.
> - **Classroom Sub-Rooms & Principal Authorization**: Each class operates as an independent sub-room. Non-parent faculty and cross-class staff require verified Principal authorization to enter sub-rooms and view student health files, managed through an in-app Principal Approval queue with instant unlock notifications.
> - **Administrative Authority Separation**:
>   - *District Officer*: Exclusively authorized to add and provision new school rooms, as well as permanently delete school rooms (protected by password confirmation).
>   - *School Principal*: Approves sub-room authorization requests and can add new classes.
>   - *School-Specific IT Admin*: Dedicated technical administrator assigned to a specific school (supports multiple IT admins per school) who can configure systems and add classes alongside the Principal.

---

## 1. Overview & Core Concept

- **What It Does**: Transforms the application into a multi-tiered national educational health ecosystem. Users can navigate from a nationwide view into specific School Districts, School Rooms, and granular Classroom Sub-Rooms. Confidential records are protected by cryptographic room boundaries, Principal-level access approvals, and District-exclusive deletion security.
- **Target Audience / Personas**:
  - *District Compliance Officers*: Oversee regional districts, provision new school rooms, and exclusively delete schools with password verification.
  - *School Principals*: Grant class sub-room observation authorizations, govern school data, and add classes.
  - *School IT Admins*: School-bound technical specialists who configure systems and add classes.
  - *Teachers & Nurses*: Work within assigned class sub-rooms or request Principal access for others.
  - *Parents*: Securely access their children's allergy alerts and morning health slips without bureaucratic friction.
- **Key Value**: Guarantees zero cross-class or cross-school data leakage while providing seamless nationwide discovery, instant Principal authorization workflows, and tamper-resistant school deletion security.

---

## 2. User Experience & Visual Design

### Key User Flows

1. **National Map & Discovery (Landing Canvas)**:
   - Users land on the National Health Portal showcasing an interactive SVG map of educational regions/states with district hubs.
   - A prominent National Directory bar allows searching by District, School, Class, and Section.
   - Clicking a district on the map or entering a District / School Room Code zooms directly into that jurisdiction.

2. **District Governance Room ("District Authority Hub")**:
   - Displays all affiliated schools under the district.
   - The District Officer has exclusive access to the **"+ Add School to District"** modal to onboard new educational facilities.
   - **Password-Gated School Deletion**: Next to each school in the district hub, a delete button is visible **only** to the District Officer. Clicking it opens a verification modal prompting for the District Officer's password (`district123` or their custom registered password). The school is only removed once password validation succeeds.
   - Search on this page automatically locks to the active district.

3. **School Room Hub & Classroom Sub-Rooms**:
   - Lists all active classroom sub-rooms (e.g., Room 101 - Grade 3, Room 102 - Grade 4).
   - Only the **School Principal** and the school's **IT Admin** can click **"+ Add Classroom Sub-Room"**.
   - General users, teachers, and principals **cannot** delete the school room (the delete button is completely hidden from non-district users).
   - Faculty members can click on their assigned sub-room to enter immediately.
   - Clicking an unassigned sub-room triggers the **Principal Access Request** flow, explaining the reason for entry.

4. **Classroom Sub-Room Viewport**:
   - Dedicated workspace for that specific class section: student action cards, allergy protocols, EpiPen locations, and daily morning notices.
   - The search input inside the sub-room is locked strictly to students in that class.
   - Visiting staff who have been granted Principal approval see an active authorization badge with expiration details.

5. **In-App Principal Approval & Unlock Queue**:
   - When a teacher or medical officer requests sub-room access, the School Principal receives an instant badge notification in their administrative queue.
   - The Principal clicks "Grant 24h Access" or "Approve Permanent Access", instantly broadcasting an unlock event that grants entry to the requester without requiring email simulator links.

### Visual Identity & Theme

- **Palette**: Clean clinical and institutional neutrals with high-contrast accents:
  - *Canvas*: Soft slate-50 canvas (`#F8FAFC`) with crisp white card surfaces (`#FFFFFF`).
  - *District & Governance Accent*: Regal navy/indigo (`#1E3A8A` / `#312E81`).
  - *Medical & Emergency Accent*: Medical rose/crimson (`#E11D48` / `#BE123C`).
  - *School & Classroom Accent*: Scholastic blue (`#2563EB`).
  - *Authority & Verification*: Emerald green (`#059669`).
- **Typography**: `Plus Jakarta Sans` for crisp display titles and navigation, paired with `tabular-nums font-mono` for room codes, timestamps, and allergy dosages.
- **Top Bar Contract**: Single row: [National Portal Wordmark] — [Directory · Districts · Schools · Sub-Rooms] — [School IT Admin / Persona Switcher & Leave Button].

---

## 3. Key Product Decisions & Trade-Offs

- **Decision 1: District Officer Exclusive School Deletion with Password Gate**
  - *Chosen Approach*: Only accounts with `role === 'district_auth'` can initiate school deletion, and the deletion action requires entering and verifying their account password.
  - *Why*: Prevents accidental or unauthorized deletion of entire school workspaces by staff, principals, or teachers. Enforces district-level governance.
- **Decision 2: Hierarchical Data Architecture (National -> District -> School -> Sub-Room)**
  - *Chosen Approach*: Maintain a unified hierarchical catalog where schools belong to districts, and classrooms are first-class sub-rooms with independent permissions.
  - *Why*: Allows global discovery on the national map while enforcing strict local perimeters and search scoping.
- **Decision 3: In-App Principal Approval Workflow**
  - *Chosen Approach*: Replace external email verification links with an in-app Principal Approval Inbox featuring real-time broadcast notifications and one-click authorization.
  - *Why*: Eliminates simulation links appearing in student/parent views while providing instant authorization feedback.
- **Decision 4: School-Bound IT Administrator Persona**
  - *Chosen Approach*: Model the IT Admin as a school-specific role bound to a given school ID, allowing multiple IT admins per school, with permissions restricted to class addition and technical maintenance.
  - *Why*: Exactly reflects school operational structures where IT coordinators manage room technology alongside the educational Principal.

---

## 4. Technical Architecture & Data Strategy

```
┌────────────────────────────────────────────────────────────────────────┐
│                        National Education Portal                       │
│  - Interactive Regional Map (Clickable States & Districts)            │
│  - National Directory Search (District, School, Class, Section)        │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                     District Governance Room                           │
│  - Managed by District Officer (Exclusive "+ Add School" Authority)    │
│  - Exclusive Password-Authenticated School Deletion Modal              │
│  - District-Scoped Search & Compliance Oversight                       │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        School Room Workspace                           │
│  - Governed by Principal & School IT Admin ("+ Add Class" Authority)   │
│  - Deletion Disabled for School Staff (Requires District Officer)      │
│  - School-Scoped Search & Classroom Directory                          │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                       Classroom Sub-Rooms                              │
│  - Room 101 (Grade 3) │ Room 102 (Grade 4) │ Room 201 (Grade 5)        │
│  - Sub-Room Scoped Search (Allergies, EpiPens, Daily Notices)          │
│  - Principal In-App Authorization Guard for Non-Parent Faculty         │
└────────────────────────────────────────────────────────────────────────┘
```

### Key Data Entities & Schema Additions

1. **`ClassSubRoom`**:
   - `id`: Unique class ID (e.g., `sub-cls-101`)
   - `schoolId` & `roomCode`: Link to parent school
   - `name`: Class identifier (e.g., `Room 101 - Grade 3`)
   - `grade` & `section`: Academic level
   - `leadTeacherId` & `leadTeacherName`: Assigned faculty
   - `enrolledStudentIds`: Array of student IDs in this sub-room
   - `authorizedUserIds`: Array of user IDs approved by Principal to observe

2. **`District`**:
   - `id`: District ID (e.g., `dist-metro-north`)
   - `name`: Regional district title
   - `state`: Geographic state/region
   - `districtOfficerId`: Assigned compliance official
   - `schoolIds`: Array of member school IDs

3. **`DistrictSchoolDeleteModal`**:
   - Modal visible only when `currentUser.role === 'district_auth'`.
   - Prompts for the District Officer's password, verifies it against `currentUser.passwordHash`, logs an audit entry, and deletes the school room bundle and catalog entry.

4. **Updated `UserRole`**:
   - `'district_auth'` (District Officer: provisions schools & deletes schools via password)
   - `'principal'` (School Principal: approves sub-rooms, adds classes)
   - `'it_admin'` (School IT Admin: bound to school, adds classes)
   - `'teacher'` (Classroom Lead: operates within assigned sub-room)
   - `'medical_center'` (Nurse: requests Principal authorization for class files)
   - `'parent'` (Parent: accesses linked children without bureaucratic approval)

5. **Scoped Search Engine**:
   - Reusable filter utility accepting `level: 'national' | 'district' | 'school' | 'subroom'` and active IDs.

---

## 5. Implementation Phases & Milestones

1. **Phase 1: Types & Storage Hierarchy (`src/types/health.ts` & `src/services/roomStorage.ts`)**:
   - Extend types with `District`, `ClassSubRoom`, `it_admin` role, and sub-room authorization records.
   - Implement storage helpers for adding districts, schools to districts, classes to schools, and password-authenticated school deletion.
2. **Phase 2: National Map & Directory View (`src/components/national/NationalPortal.tsx`)**:
   - Build interactive SVG map with regional hubs, state selection, and real-time national directory search.
3. **Phase 3: District Room Hub (`src/components/district/DistrictRoomView.tsx`)**:
   - Build district governance interface with exclusive District Officer school provisioning modal and password-verified school deletion.
4. **Phase 4: Classroom Sub-Room Engine (`src/components/classroom/ClassSubRoomView.tsx`)**:
   - Implement isolated sub-room viewports with Principal authorization guards and in-app unlock alerts.
5. **Phase 5: Restructured Administration & Scoped Search Integration**:
   - Update `PrincipalPortal.tsx` with one-click in-app sub-room authorization queue and class creator (accessible to Principal and School IT Admin).
   - Update `Navbar.tsx` and `App.tsx` with breadcrumb navigation (`National > District > School > Sub-Room`).
6. **Phase 6: Verification & Compilation**:
   - Run compilation and TypeScript validation to ensure zero regressions across all roles.
