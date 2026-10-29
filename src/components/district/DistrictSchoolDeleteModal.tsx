import { useState } from 'react';
import { AlertTriangle, Lock, Trash2, X, ShieldCheck } from 'lucide-react';
import { UserAccount } from '../../types/health';
import { deleteSchoolRoomWithPassword } from '../../services/roomStorage';

interface Props {
  isOpen: boolean;
  schoolRoomCode: string;
  schoolName: string;
  currentUser: UserAccount;
  onClose: () => void;
  onSuccess: (roomCode: string) => void;
}

export function DistrictSchoolDeleteModal({
  isOpen,
  schoolRoomCode,
  schoolName,
  currentUser,
  onClose,
  onSuccess,
}: Props) {
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!password.trim()) {
      setErrorMsg('Please enter your District Officer password to authorize deletion.');
      return;
    }

    setIsDeleting(true);
    const result = deleteSchoolRoomWithPassword(schoolRoomCode, password, currentUser);
    setIsDeleting(false);

    if (result.success) {
      onSuccess(schoolRoomCode);
      onClose();
    } else {
      setErrorMsg(result.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div 
        className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-2xl p-6 relative overflow-hidden"
        role="dialog"
        aria-modal="true"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-1 rounded-lg"
          aria-label="Cancel"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-start gap-4 mb-4">
          <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">District Officer School Deletion</h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              School workspaces can exclusively be deleted by the authorized District Officer. This action permanently deletes all associated classroom sub-rooms, medical records, and audit history.
            </p>
          </div>
        </div>

        <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs font-semibold text-rose-900 mb-4">
          <div className="font-bold">{schoolName}</div>
          <div className="font-mono text-[11px] text-rose-700 mt-0.5">Room Code: {schoolRoomCode}</div>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 bg-rose-100 border border-rose-300 rounded-xl text-xs text-rose-900 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              District Officer Password *
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password (e.g. district123)"
                className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-rose-500 font-mono"
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Authenticated as District Officer: {currentUser.name}
            </p>
          </div>

          <div className="flex items-center gap-2 justify-end pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isDeleting}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-colors shadow-xs flex items-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{isDeleting ? 'Deleting...' : 'Authorize & Delete School'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
