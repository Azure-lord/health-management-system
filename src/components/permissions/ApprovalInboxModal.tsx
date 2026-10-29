import { useState } from 'react';
import { 
  ShieldCheck, 
  Mail, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  ExternalLink, 
  Users, 
  Building2, 
  Copy, 
  Check, 
  Filter
} from 'lucide-react';
import { AccessPermission, UserRole } from '../../types/health';
import { resolveAccessPermission } from '../../services/roomStorage';

interface Props {
  roomCode: string;
  schoolName: string;
  permissions: AccessPermission[];
  currentRole: UserRole;
  onClose: () => void;
  onOpenVerificationModal: (perm: AccessPermission) => void;
  onRefresh: () => void;
}

export function ApprovalInboxModal({
  roomCode,
  schoolName,
  permissions,
  currentRole,
  onClose,
  onOpenVerificationModal,
  onRefresh,
}: Props) {
  const [filter, setFilter] = useState<'all' | 'pending' | 'resolved'>('all');
  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  const filteredPermissions = permissions.filter((p) => {
    if (filter === 'pending') return p.status === 'pending';
    if (filter === 'resolved') return p.status !== 'pending';
    return true;
  });

  const handleQuickDecision = (
    permission: AccessPermission,
    decision: 'approved' | 'rejected'
  ) => {
    const approverName =
      permission.type === 'class_to_class'
        ? 'School Principal Office'
        : 'District Authority Officer';
    const approverRole =
      permission.type === 'class_to_class' ? 'principal' : 'district_auth';

    resolveAccessPermission(
      roomCode,
      permission.id,
      decision,
      approverName,
      approverRole
    );
    onRefresh();
  };

  const handleCopy = (link: string, id: string) => {
    navigator.clipboard.writeText(link);
    setCopiedToken(id);
    setTimeout(() => setCopiedToken(null), 2000);
  };

  const pendingCount = permissions.filter((p) => p.status === 'pending').length;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full border border-slate-200 shadow-xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900">
                  Principal & District Approval Center
                </h3>
                {pendingCount > 0 && (
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-700">
                    {pendingCount} Pending
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500">
                School: <strong className="text-slate-700">{schoolName}</strong> · Room:{' '}
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

        {/* Filter Bar */}
        <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                filter === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All ({permissions.length})
            </button>
            <button
              onClick={() => setFilter('pending')}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                filter === 'pending' ? 'bg-white text-rose-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Pending ({pendingCount})
            </button>
            <button
              onClick={() => setFilter('resolved')}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                filter === 'resolved' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Resolved ({permissions.length - pendingCount})
            </button>
          </div>

          <span className="text-[11px] text-slate-400">
            Clicking &ldquo;Open Verification Link&rdquo; simulates the email link
          </span>
        </div>

        {/* List of Permission Requests */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3">
          {filteredPermissions.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <ShieldCheck className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p className="text-xs font-medium">No permission requests in this view.</p>
              <p className="text-[11px] text-slate-400 mt-1">
                When teachers or staff request inter-class observation, approval tickets appear here.
              </p>
            </div>
          ) : (
            filteredPermissions.map((perm) => {
              const isClass = perm.type === 'class_to_class';
              const targetLabel =
                perm.targetClassName || perm.targetSchoolName || 'External Classroom';

              return (
                <div
                  key={perm.id}
                  className={`p-4 rounded-xl border transition-all ${
                    perm.status === 'pending'
                      ? 'bg-white border-amber-300 shadow-xs'
                      : perm.status === 'approved'
                      ? 'bg-emerald-50/50 border-emerald-200'
                      : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-2">
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                          isClass
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-purple-100 text-purple-700'
                        }`}
                      >
                        {isClass ? <Users className="w-4 h-4" /> : <Building2 className="w-4 h-4" />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-900">
                            {perm.requesterName}
                          </span>
                          <span className="text-[11px] text-slate-500">
                            ({perm.requesterRole})
                          </span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                              perm.status === 'pending'
                                ? 'bg-amber-100 text-amber-800'
                                : perm.status === 'approved'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-slate-200 text-slate-600'
                            }`}
                          >
                            {perm.status.toUpperCase()}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 mt-1">
                          Requesting access to:{' '}
                          <strong className="text-slate-800">{targetLabel}</strong>
                        </p>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Reason: &ldquo;{perm.reason}&rdquo;
                        </p>
                      </div>
                    </div>

                    <div className="text-right text-[11px] text-slate-400 shrink-0">
                      <span>{new Date(perm.requestedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      <p className="font-mono text-[10px] text-slate-400 mt-0.5">
                        Token: {perm.verificationToken.slice(0, 10)}...
                      </p>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="pt-3 mt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onOpenVerificationModal(perm)}
                        className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
                      >
                        <ExternalLink className="w-3.5 h-3.5 text-rose-600" />
                        <span>Open Verification Link</span>
                      </button>

                      <button
                        onClick={() => handleCopy(perm.verificationLink, perm.id)}
                        className="px-2 py-1.5 text-slate-500 hover:text-slate-800 rounded-lg text-xs flex items-center gap-1 transition-colors"
                        title="Copy official email link"
                      >
                        {copiedToken === perm.id ? (
                          <Check className="w-3 h-3 text-emerald-600" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                        <span>{copiedToken === perm.id ? 'Copied' : 'Copy Link'}</span>
                      </button>
                    </div>

                    {perm.status === 'pending' && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleQuickDecision(perm, 'rejected')}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-700 border border-slate-200 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Deny</span>
                        </button>
                        <button
                          onClick={() => handleQuickDecision(perm, 'approved')}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg transition-colors shadow-xs flex items-center gap-1"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Approve (Yes)</span>
                        </button>
                      </div>
                    )}

                    {perm.status === 'approved' && (
                      <span className="text-[11px] text-emerald-700 font-medium flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Approved by {perm.decidedBy || 'Authority'}
                      </span>
                    )}

                    {perm.status === 'rejected' && (
                      <span className="text-[11px] text-slate-500 font-medium flex items-center gap-1">
                        <XCircle className="w-3.5 h-3.5" />
                        Declined by {perm.decidedBy || 'Authority'}
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
