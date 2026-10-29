import { useState } from 'react';
import { 
  Mail, 
  ExternalLink, 
  CheckCircle2, 
  XCircle, 
  ShieldCheck, 
  Clock, 
  Copy, 
  Check, 
  Lock, 
  AlertTriangle,
  Building2,
  Users
} from 'lucide-react';
import { AccessPermission } from '../../types/health';
import { resolveAccessPermission } from '../../services/roomStorage';

interface Props {
  permission: AccessPermission;
  schoolName: string;
  onClose: () => void;
  onResolved: () => void;
}

export function EmailVerificationModal({ permission, schoolName, onClose, onResolved }: Props) {
  const [copied, setCopied] = useState(false);
  const [isSimulatedMailOpen, setIsSimulatedMailOpen] = useState(true);

  const isClassToClass = permission.type === 'class_to_class';
  const approverTitle = isClassToClass ? 'School Principal' : 'District Authority';
  const targetLabel = permission.targetClassName || permission.targetSchoolName || 'External Classroom';

  const handleCopyLink = () => {
    navigator.clipboard.writeText(permission.verificationLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDecision = (decision: 'approved' | 'rejected') => {
    const approverName = isClassToClass ? 'Dr. Arthur Sterling (Principal)' : 'District Compliance Authority';
    const approverRole = isClassToClass ? 'principal' : 'district_auth';

    resolveAccessPermission(
      permission.roomCode,
      permission.id,
      decision,
      approverName,
      approverRole
    );
    onResolved();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Email Header Simulation */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-rose-600 flex items-center justify-center text-white font-bold">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold tracking-tight">
                Official Authorization Verification Link
              </h3>
              <p className="text-[11px] text-slate-300">
                Dispatched to {approverTitle} Inbox
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-md text-sm"
          >
            ✕
          </button>
        </div>

        {/* Verification Link Card */}
        <div className="p-6 space-y-4">
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
            <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono">
              <span>SECURITY TOKEN: {permission.verificationToken}</span>
              <span>ROOM: {permission.roomCode}</span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={permission.verificationLink}
                className="flex-1 bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-mono text-slate-700 truncate"
              />
              <button
                onClick={handleCopyLink}
                className="px-2.5 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-xs font-medium flex items-center gap-1 transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>
          </div>

          {/* Email Preview Body */}
          <div className="border border-slate-200 rounded-xl p-4 bg-white space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-800 pb-2 border-b border-slate-100">
              <ShieldCheck className="w-4 h-4 text-rose-600" />
              <span>Permission Request for {schoolName}</span>
            </div>

            <div className="text-xs space-y-1.5 text-slate-600">
              <p>
                <strong className="text-slate-800">Requester:</strong> {permission.requesterName} ({permission.requesterRole})
              </p>
              <p>
                <strong className="text-slate-800">Target Scope:</strong> {targetLabel}
              </p>
              <p>
                <strong className="text-slate-800">Reason Provided:</strong> &ldquo;{permission.reason}&rdquo;
              </p>
              <p>
                <strong className="text-slate-800">Requested At:</strong> {new Date(permission.requestedAt).toLocaleString()}
              </p>
            </div>

            <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-lg text-[11px] text-amber-800 flex items-start gap-2">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
              <span>
                By clicking <strong>Approve (Yes)</strong>, {permission.requesterName} will be granted access to observe student medical alerts in this classroom. All changes will be logged in real-time memory.
              </span>
            </div>
          </div>

          {/* Verification Decision Action Buttons */}
          <div className="pt-2 flex gap-3">
            <button
              onClick={() => handleDecision('rejected')}
              className="flex-1 py-2.5 bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-700 border border-slate-200 hover:border-rose-200 font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5"
            >
              <XCircle className="w-4 h-4" />
              <span>Deny Access</span>
            </button>
            <button
              onClick={() => handleDecision('approved')}
              className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-colors shadow-xs flex items-center justify-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Approve Access (Yes)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
