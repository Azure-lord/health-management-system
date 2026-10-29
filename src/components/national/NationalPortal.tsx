import { useState, useMemo } from 'react';
import { 
  Building2, 
  MapPin, 
  Search, 
  DoorOpen, 
  ArrowRight, 
  ShieldCheck, 
  Lock, 
  Users, 
  FileText, 
  Award, 
  Sparkles,
  School as SchoolIcon,
  Filter,
  CheckCircle2,
  AlertCircle,
  RotateCcw
} from 'lucide-react';
import { District, SchoolRoom, UserAccount } from '../../types/health';
import { getRoomsCatalog, getDistrictsCatalog, getRoomBundle, createNewSchoolRoom, seedFullDemoDistrict } from '../../services/roomStorage';

interface Props {
  currentUser: UserAccount;
  onSelectDistrict: (districtId: string) => void;
  onSelectSchool: (roomCode: string) => void;
  onOpenSubRoomWithAuthCheck?: (roomCode: string, classId: string) => void;
}

export function NationalPortal({
  currentUser,
  onSelectDistrict,
  onSelectSchool,
  onOpenSubRoomWithAuthCheck,
}: Props) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'districts' | 'schools' | 'classes' | 'records'>('all');
  const [activeStateFilter, setActiveStateFilter] = useState<string | null>(null);
  const [directCodeInput, setDirectCodeInput] = useState('');
  const [directCodeError, setDirectCodeError] = useState('');
  const [confidentialFileNotice, setConfidentialFileNotice] = useState<{
    studentName: string;
    schoolName: string;
    roomCode: string;
    classId?: string;
  } | null>(null);

  const districts = getDistrictsCatalog();
  const schools = getRoomsCatalog();

  // Aggregate all classes across all schools for national search
  const nationalClasses = useMemo(() => {
    const list: Array<{
      id: string;
      name: string;
      grade: string;
      section?: string;
      leadTeacherName: string;
      schoolName: string;
      roomCode: string;
      districtName: string;
    }> = [];

    schools.forEach((s) => {
      s.classes.forEach((c) => {
        list.push({
          id: c.id,
          name: c.name,
          grade: c.grade,
          section: c.section,
          leadTeacherName: c.leadTeacherName,
          schoolName: s.schoolName,
          roomCode: s.roomCode,
          districtName: s.districtName,
        });
      });
    });

    return list;
  }, [schools]);

  // Aggregate students across all local room bundles for national discovery
  const nationalStudents = useMemo(() => {
    const list: Array<{
      id: string;
      name: string;
      grade: string;
      classId?: string;
      className?: string;
      schoolName: string;
      roomCode: string;
    }> = [];

    schools.forEach((s) => {
      const bundle = getRoomBundle(s.roomCode);
      if (bundle) {
        bundle.students.forEach((stu) => {
          list.push({
            id: stu.id,
            name: stu.name,
            grade: stu.grade,
            classId: stu.classId,
            className: stu.className,
            schoolName: s.schoolName,
            roomCode: s.roomCode,
          });
        });
      }
    });

    return list;
  }, [schools]);

  // Search Results Filtering
  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return null;

    const matchedDistricts = districts.filter(
      (d) =>
        d.name.toLowerCase().includes(q) ||
        d.code.toLowerCase().includes(q) ||
        d.state.toLowerCase().includes(q)
    );

    const matchedSchools = schools.filter(
      (s) =>
        s.schoolName.toLowerCase().includes(q) ||
        s.roomCode.toLowerCase().includes(q) ||
        s.districtName.toLowerCase().includes(q)
    );

    const matchedClasses = nationalClasses.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.grade.toLowerCase().includes(q) ||
        (c.section && c.section.toLowerCase().includes(q)) ||
        c.schoolName.toLowerCase().includes(q)
    );

    const matchedStudents = nationalStudents.filter(
      (st) =>
        st.name.toLowerCase().includes(q) ||
        st.grade.toLowerCase().includes(q) ||
        (st.className && st.className.toLowerCase().includes(q))
    );

    return {
      districts: matchedDistricts,
      schools: matchedSchools,
      classes: matchedClasses,
      students: matchedStudents,
      total: matchedDistricts.length + matchedSchools.length + matchedClasses.length + matchedStudents.length,
    };
  }, [searchQuery, districts, schools, nationalClasses, nationalStudents]);

  const handleDirectCodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const code = directCodeInput.trim().toUpperCase();
    if (!code) {
      setDirectCodeError('Please enter a room code.');
      return;
    }

    // Check if district code
    const matchingDistrict = districts.find((d) => d.code.toUpperCase() === code || d.id.toUpperCase() === code);
    if (matchingDistrict) {
      onSelectDistrict(matchingDistrict.id);
      return;
    }

    // Check if school room code
    const matchingSchool = schools.find((s) => s.roomCode.toUpperCase() === code);
    if (matchingSchool) {
      onSelectSchool(matchingSchool.roomCode);
      return;
    }

    // Auto-provision if valid new code
    const newRoom = createNewSchoolRoom({
      schoolName: `${code} Regional Academy`,
      districtName: 'Metro North School District 12',
      principalName: 'Principal Administrator',
      principalEmail: 'principal@school.edu',
      districtAuthEmail: 'compliance@metronorth.gov',
      customCode: code,
    });
    onSelectSchool(newRoom.room.roomCode);
  };

  const handleOpenFileRequest = (studentName: string, schoolName: string, roomCode: string, classId?: string) => {
    setConfidentialFileNotice({
      studentName,
      schoolName,
      roomCode,
      classId,
    });
  };

  const getDistrictSchoolCount = (distId: string) => {
    const dist = districts.find((d) => d.id === distId);
    if (!dist) return 0;
    return schools.filter(
      (s) => dist.schoolRoomCodes.includes(s.roomCode) || s.districtName.toLowerCase() === dist.name.toLowerCase()
    ).length;
  };

  // Pre-configured US Map Regions for interactive clicking
  const mapRegions = [
    { id: 'dist-metro-north', state: 'New York (Northeast)', x: '78%', y: '26%', color: 'bg-indigo-600', code: 'MND-12', count: getDistrictSchoolCount('dist-metro-north') },
    { id: 'dist-pacific-coast', state: 'California (West Coast)', x: '18%', y: '42%', color: 'bg-blue-600', code: 'PCD-04', count: getDistrictSchoolCount('dist-pacific-coast') },
    { id: 'dist-midwest-central', state: 'Illinois (Midwest)', x: '58%', y: '36%', color: 'bg-emerald-600', code: 'GLR-08', count: getDistrictSchoolCount('dist-midwest-central') },
    { id: 'dist-lone-star', state: 'Texas (South)', x: '45%', y: '68%', color: 'bg-amber-600', code: 'LSE-03', count: getDistrictSchoolCount('dist-lone-star') },
  ];

  return (
    <div className="space-y-8 max-w-6xl mx-auto px-4 sm:px-6 py-6">
      {/* 1. National Portal Header & Search Bar */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-md border border-indigo-200">
                National Health & Education Registry
              </span>
              <span className="text-xs text-slate-400">·</span>
              <span className="text-xs text-slate-500 font-medium">
                Scope: Nationwide Multi-Tier Vault
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Educational District & Classroom Sub-Room Network
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl leading-relaxed">
              Navigate seamlessly across the country from educational districts into isolated school rooms and classroom sub-rooms. Confidential student health files require verified School Principal authorization to unlock.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto">
            <span className="text-xs font-semibold px-3 py-1.5 bg-slate-100 text-slate-700 rounded-xl border border-slate-200 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>{districts.length} Districts · {schools.length} Schools · {nationalClasses.length} Classes</span>
            </span>
          </div>
        </div>

        {/* Featured Demo District Banner */}
        <div className="bg-linear-to-r from-indigo-900 via-indigo-800 to-slate-900 rounded-2xl p-4 sm:p-5 text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-md">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-200 shrink-0">
              <Sparkles className="w-5 h-5 text-indigo-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider bg-indigo-500/30 px-2 py-0.5 rounded text-indigo-200 border border-indigo-400/20">
                  Featured Demo District
                </span>
                <span className="text-xs text-indigo-200 font-semibold">
                  MND-12 · New York
                </span>
              </div>
              <h3 className="text-sm sm:text-base font-bold text-white mt-0.5">
                Metro North School District 12
              </h3>
              <p className="text-xs text-indigo-200/90 mt-0.5">
                Configured with <strong>6 member schools</strong>, <strong>38 classroom sub-rooms</strong> (6–7 per school), and <strong>{nationalStudents.length || 239} student medical profiles</strong> (4–9 students per class).
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto shrink-0">
            <button
              onClick={() => onSelectDistrict('dist-metro-north')}
              className="flex-1 md:flex-initial px-4 py-2.5 bg-indigo-500 hover:bg-indigo-400 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>Explore Demo District</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => {
                seedFullDemoDistrict(true);
                window.location.reload();
              }}
              title="Reset/Re-seed demo district data"
              className="px-3 py-2.5 bg-white/10 hover:bg-white/20 text-indigo-100 rounded-xl text-xs font-semibold transition-colors border border-white/10 flex items-center justify-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Reset Demo</span>
            </button>
          </div>
        </div>

        {/* National Search Box */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search nationally by District, School, Classroom Sub-Room, Section, or Student file..."
              className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-300 rounded-2xl text-sm font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 shadow-inner placeholder:text-slate-400"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 hover:text-slate-700"
              >
                Clear
              </button>
            )}
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-2 flex-wrap text-xs">
            <span className="font-bold text-slate-500 flex items-center gap-1 mr-1">
              <Filter className="w-3.5 h-3.5" />
              Filter:
            </span>
            {[
              { id: 'all', label: 'All Nationwide' },
              { id: 'districts', label: `Districts (${districts.length})` },
              { id: 'schools', label: `Schools (${schools.length})` },
              { id: 'classes', label: `Sub-Rooms (${nationalClasses.length})` },
              { id: 'records', label: `Student Files (${nationalStudents.length})` },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedFilter(tab.id as any)}
                className={`px-3 py-1.5 rounded-xl font-semibold transition-colors ${
                  selectedFilter === tab.id
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Search Results Display */}
        {searchResults && (
          <div className="pt-4 border-t border-slate-100 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                National Search Results ({searchResults.total} matches)
              </h2>
              <span className="text-[11px] text-slate-400">Scoped nationally</span>
            </div>

            {searchResults.total === 0 ? (
              <div className="p-8 text-center text-slate-400 bg-slate-50 rounded-2xl">
                No matching districts, schools, classroom sub-rooms, or student records found for &ldquo;{searchQuery}&rdquo;.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto pr-1">
                {/* 1. District Matches */}
                {(selectedFilter === 'all' || selectedFilter === 'districts') &&
                  searchResults.districts.map((d) => (
                    <div
                      key={d.id}
                      onClick={() => onSelectDistrict(d.id)}
                      className="p-3.5 bg-slate-50 hover:bg-indigo-50/60 border border-slate-200 hover:border-indigo-300 rounded-2xl transition-all cursor-pointer flex items-center justify-between group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs shrink-0">
                          <Award className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                              {d.name}
                            </span>
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-indigo-100 text-indigo-800 font-mono">
                              {d.code}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500">
                            State: {d.state} · {d.schoolRoomCodes.length} member schools
                          </p>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-indigo-600 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                        Open District <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  ))}

                {/* 2. School Matches */}
                {(selectedFilter === 'all' || selectedFilter === 'schools') &&
                  searchResults.schools.map((s) => (
                    <div
                      key={s.roomCode}
                      onClick={() => onSelectSchool(s.roomCode)}
                      className="p-3.5 bg-slate-50 hover:bg-blue-50/60 border border-slate-200 hover:border-blue-300 rounded-2xl transition-all cursor-pointer flex items-center justify-between group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs shrink-0">
                          <SchoolIcon className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                              {s.schoolName}
                            </span>
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-blue-100 text-blue-800 font-mono font-bold">
                              {s.roomCode}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500">
                            District: {s.districtName} · {s.classes.length} classroom sub-rooms
                          </p>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-blue-600 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                        Enter School <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  ))}

                {/* 3. Class Sub-Room Matches */}
                {(selectedFilter === 'all' || selectedFilter === 'classes') &&
                  searchResults.classes.map((c) => (
                    <div
                      key={c.id}
                      onClick={() => {
                        if (onOpenSubRoomWithAuthCheck) {
                          onOpenSubRoomWithAuthCheck(c.roomCode, c.id);
                        } else {
                          onSelectSchool(c.roomCode);
                        }
                      }}
                      className="p-3.5 bg-slate-50 hover:bg-emerald-50/60 border border-slate-200 hover:border-emerald-300 rounded-2xl transition-all cursor-pointer flex items-center justify-between group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs shrink-0">
                          <Users className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                              {c.name}
                            </span>
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-200 text-slate-700 font-mono">
                              {c.grade} {c.section || ''}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500">
                            School: {c.schoolName} · Lead: {c.leadTeacherName}
                          </p>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-emerald-700 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                        Sub-Room <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  ))}

                {/* 4. Student Records (Confidential - Requires Principal Auth) */}
                {(selectedFilter === 'all' || selectedFilter === 'records') &&
                  searchResults.students.map((st) => (
                    <div
                      key={st.id}
                      onClick={() => handleOpenFileRequest(st.name, st.schoolName, st.roomCode, st.classId)}
                      className="p-3.5 bg-amber-50/40 hover:bg-amber-50 border border-amber-200 rounded-2xl transition-all cursor-pointer flex items-center justify-between group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-xs shrink-0">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-slate-900 group-hover:text-amber-800 transition-colors">
                              {st.name} ({st.grade})
                            </span>
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 font-bold flex items-center gap-0.5">
                              <Lock className="w-2.5 h-2.5" /> Confidential
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-600">
                            {st.schoolName} · {st.className || 'Classroom Sub-Room'}
                          </p>
                        </div>
                      </div>
                      <span className="text-[11px] font-bold text-amber-800 bg-amber-100/80 px-2 py-1 rounded-lg">
                        Principal Auth Required
                      </span>
                    </div>
                  ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* 2. Interactive National Map (Clickable States & Districts) */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-indigo-600" />
              <span>Interactive National District Map</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Select any regional educational hub on the map to jump directly into that school district.
            </p>
          </div>
          <span className="text-xs text-indigo-700 bg-indigo-50 border border-indigo-200 px-2.5 py-1 rounded-xl font-bold">
            Live National Federation
          </span>
        </div>

        {/* SVG National Map Visualizer with Clickable Hubs */}
        <div className="relative w-full h-80 bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 shadow-inner flex items-center justify-center p-4">
          {/* US Geographic Outline Silhouette (Stylized Vector) */}
          <svg
            viewBox="0 0 960 600"
            className="w-full h-full opacity-40 select-none pointer-events-none"
            fill="none"
            stroke="#94A3B8"
            strokeWidth="1.5"
          >
            <path
              d="M150 120 L230 110 L310 130 L450 115 L580 90 L680 85 L790 70 L870 120 L890 220 L840 280 L860 380 L800 480 L720 460 L620 480 L520 520 L400 500 L300 460 L240 470 L180 430 L110 320 L130 200 Z"
              fill="#1E293B"
            />
            {/* Grid Coordinates Overlay */}
            <line x1="200" y1="50" x2="200" y2="550" stroke="#334155" strokeDasharray="4 4" strokeWidth="0.8" />
            <line x1="480" y1="50" x2="480" y2="550" stroke="#334155" strokeDasharray="4 4" strokeWidth="0.8" />
            <line x1="760" y1="50" x2="760" y2="550" stroke="#334155" strokeDasharray="4 4" strokeWidth="0.8" />
            <line x1="50" y1="200" x2="910" y2="200" stroke="#334155" strokeDasharray="4 4" strokeWidth="0.8" />
            <line x1="50" y1="380" x2="910" y2="380" stroke="#334155" strokeDasharray="4 4" strokeWidth="0.8" />
          </svg>

          {/* Clickable District Nodes on Map */}
          {mapRegions.map((region) => {
            const isSelected = activeStateFilter === region.id;
            const districtData = districts.find((d) => d.id === region.id);

            return (
              <div
                key={region.id}
                style={{ left: region.x, top: region.y }}
                onClick={() => onSelectDistrict(region.id)}
                className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
              >
                {/* Ping animation effect */}
                <span className="absolute -inset-1 rounded-full bg-indigo-400 opacity-40 group-hover:animate-ping" />
                
                {/* Hub Pin */}
                <div className={`relative px-3 py-1.5 rounded-xl border font-bold text-xs shadow-lg transition-all flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-rose-600 text-white border-white scale-110'
                    : 'bg-slate-900/90 text-white border-slate-700 hover:border-indigo-400 hover:bg-indigo-950 hover:scale-105'
                }`}>
                  <span className={`w-2 h-2 rounded-full ${region.color}`} />
                  <span className="font-mono text-[11px]">{region.code}</span>
                  <span className="hidden sm:inline font-sans font-semibold text-[11px] text-slate-300">
                    {districtData?.state || region.state}
                  </span>
                </div>
              </div>
            );
          })}

          {/* Map Legend */}
          <div className="absolute bottom-3 left-4 text-[11px] text-slate-400 bg-slate-900/80 px-3 py-1.5 rounded-lg border border-slate-800 backdrop-blur-xs flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-indigo-500" /> Click any regional pin to load District Hub
            </span>
            <span>·</span>
            <span className="font-mono text-slate-500">AES-256 District Vaults</span>
          </div>
        </div>

        {/* Regional District Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {districts.map((dist) => (
            <div
              key={dist.id}
              onClick={() => onSelectDistrict(dist.id)}
              className="p-5 bg-slate-50 hover:bg-indigo-50/50 border border-slate-200 hover:border-indigo-300 rounded-2xl transition-all cursor-pointer flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-indigo-100 text-indigo-800">
                    {dist.code}
                  </span>
                  <span className="text-[11px] text-slate-500 font-medium">
                    {dist.state}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                  {dist.name}
                </h3>
                <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">
                  {dist.description}
                </p>
              </div>

              <div className="pt-4 mt-3 border-t border-slate-200/60 flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-600">
                  {dist.schoolRoomCodes.length} Schools
                </span>
                <span className="font-bold text-indigo-600 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  Enter District <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Direct Room Code Quick Entry Box */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-1 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-2 text-indigo-400 text-xs font-bold uppercase tracking-wider">
            <DoorOpen className="w-4 h-4" />
            <span>Direct Workspace Access</span>
          </div>
          <h2 className="text-xl font-bold">Have a School or District Room Code?</h2>
          <p className="text-xs text-slate-400 max-w-md">
            Enter any assigned code (e.g., <code className="text-indigo-300 font-mono">OAK-2026</code> or <code className="text-indigo-300 font-mono">MND-12</code>) to connect immediately.
          </p>
        </div>

        <form onSubmit={handleDirectCodeSubmit} className="w-full md:w-auto flex flex-col sm:flex-row gap-2 max-w-md">
          <input
            type="text"
            value={directCodeInput}
            onChange={(e) => {
              setDirectCodeInput(e.target.value.toUpperCase());
              setDirectCodeError('');
            }}
            placeholder="e.g. OAK-2026 or MND-12"
            className="px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm font-mono font-bold text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500 uppercase tracking-wider placeholder:font-sans placeholder:font-normal placeholder:text-xs placeholder:text-slate-500"
          />
          <button
            type="submit"
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-colors whitespace-nowrap shadow-xs flex items-center justify-center gap-1.5"
          >
            <span>Connect</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>

      {/* 4. Confidential File Notice Modal */}
      {confidentialFileNotice && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-2xl p-6 relative">
            <button
              onClick={() => setConfidentialFileNotice(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-1 rounded-lg"
            >
              ✕
            </button>

            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Principal Authorization Required
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  FERPA & Medical Vault Privacy Protocol
                </p>
              </div>
            </div>

            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 space-y-1 mb-4">
              <div><strong>Target Student:</strong> {confidentialFileNotice.studentName}</div>
              <div><strong>Educational Facility:</strong> {confidentialFileNotice.schoolName}</div>
              <div><strong>School Room Code:</strong> <span className="font-mono">{confidentialFileNotice.roomCode}</span></div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed mb-5">
              To inspect this student&apos;s confidential medical file and emergency protocol from outside the assigned classroom, you must enter the school workspace and obtain in-app authorization from the School Principal.
            </p>

            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setConfidentialFileNotice(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold"
              >
                Close
              </button>
              <button
                onClick={() => {
                  const room = confidentialFileNotice.roomCode;
                  const cls = confidentialFileNotice.classId;
                  setConfidentialFileNotice(null);
                  if (cls && onOpenSubRoomWithAuthCheck) {
                    onOpenSubRoomWithAuthCheck(room, cls);
                  } else {
                    onSelectSchool(room);
                  }
                }}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5"
              >
                <span>Enter School Workspace</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
