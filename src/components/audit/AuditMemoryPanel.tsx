import { useState } from 'react';
import { 
  History, 
  Search, 
  Filter, 
  ShieldCheck, 
  Clock, 
  User, 
  CheckCircle2, 
  AlertTriangle, 
  FileText, 
  Download, 
  Copy, 
  Check 
} from 'lucide-react';
import { AuditMemoryEntry } from '../../types/health';

interface Props {
  roomCode: string;
  schoolName: string;
  auditLog: AuditMemoryEntry[];
  isOpen: boolean;
  onClose: () => void;
}

export function AuditMemoryPanel({ roomCode, schoolName, auditLog, isOpen, onClose }: Props) {
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const filteredLogs = auditLog.filter((entry) => {
    const matchesSearch =
      entry.description.toLowerCase().includes(search.toLowerCase()) ||
      entry.actorName.toLowerCase().includes(search.toLowerCase()) ||
      entry.actionType.toLowerCase().includes(search.toLowerCase());

    if (filterType === 'all') return matchesSearch;
    if (filterType === 'permissions') {
      return matchesSearch && entry.actionType.includes('PERMISSION');
    }
    if (filterType === 'records') {
      return matchesSearch && (entry.actionType.includes('STUDENT') || entry.actionType.includes('RECORD'));
    }
    if (filterType === 'notices') {
      return matchesSearch && entry.actionType.includes('NOTICE');
    }
    return matchesSearch;
  });

  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(auditLog, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `audit_memory_${roomCode}_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const getActionBadgeColor = (type: AuditMemoryEntry['actionType']) => {
    switch (type) {
      case 'PERMISSION_APPROVED':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'PERMISSION_REJECTED':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      case 'PERMISSION_REQUESTED':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'STUDENT_ENROLLED':
      case 'RECORD_UPDATED':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'DAILY_NOTICE_SENT':
      case 'DAILY_NOTICE_ACKNOWLEDGED':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full border border-slate-200 shadow-xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold">
              <History className="w-5 h-5 text-rose-500" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900">
                  Real-Time Audit Memory Stream
                </h3>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-slate-200 text-slate-800 font-bold">
                  {auditLog.length} Events
                </span>
              </div>
              <p className="text-xs text-slate-500">
                School: <strong className="text-slate-700">{schoolName}</strong> · Room Code:{' '}
                <span className="font-mono font-semibold text-slate-700">{roomCode}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1 rounded-md text-sm font-semibold"
          >
            ✕
          </button>
        </div>

        {/* Filter and Search Bar */}
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search audit memory..."
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-rose-500"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
              <button
                onClick={() => setFilterType('all')}
                className={`px-2.5 py-1 text-[11px] font-semibold rounded-md transition-colors ${
                  filterType === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilterType('permissions')}
                className={`px-2.5 py-1 text-[11px] font-semibold rounded-md transition-colors ${
                  filterType === 'permissions' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                }`}
              >
                Permissions
              </button>
              <button
                onClick={() => setFilterType('records')}
                className={`px-2.5 py-1 text-[11px] font-semibold rounded-md transition-colors ${
                  filterType === 'records' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                }`}
              >
                Records
              </button>
            </div>

            <button
              onClick={handleExportJSON}
              className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
              title="Export complete tamper-resistant JSON memory"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Export JSON</span>
            </button>
          </div>
        </div>

        {/* Audit Log Stream */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3">
          {filteredLogs.length === 0 ? (
            <div className="text-center py-10 text-slate-400">
              <History className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p className="text-xs">No audit events match your filter.</p>
            </div>
          ) : (
            filteredLogs.map((entry) => (
              <div
                key={entry.id}
                className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100/60 transition-colors"
              >
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md border ${getActionBadgeColor(
                        entry.actionType
                      )}`}
                    >
                      {entry.actionType}
                    </span>
                    <span className="text-xs font-semibold text-slate-800">
                      {entry.actorName}
                    </span>
                    <span className="text-[11px] text-slate-500">
                      ({entry.actorRole})
                    </span>
                  </div>

                  <span className="text-[11px] font-mono text-slate-400 tabular-nums">
                    {new Date(entry.timestamp).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit',
                    })}
                  </span>
                </div>

                <p className="text-xs text-slate-700 leading-relaxed">
                  {entry.description}
                </p>

                <div className="mt-2 pt-1.5 border-t border-slate-200/60 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                  <span>ID: {entry.id}</span>
                  <span>{new Date(entry.timestamp).toLocaleDateString()}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
