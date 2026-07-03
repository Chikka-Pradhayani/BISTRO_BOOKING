import { useState, useEffect } from 'react';
import { UserRole } from '../types';
import { Shield, User, Loader2 } from 'lucide-react';

interface RoleEvaluationBannerProps {
  currentRole: UserRole | null;
  onRoleChanged: (role: UserRole) => void;
  isMockMode?: boolean;
}

export default function RoleEvaluationBanner({ currentRole, onRoleChanged }: RoleEvaluationBannerProps) {
  const [loading, setLoading] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    setUserEmail(currentRole === 'admin' ? 'demo_admin@restaurant.com' : 'demo_customer@restaurant.com');
  }, [currentRole]);

  const handleRoleToggle = async (targetRole: UserRole) => {
    setLoading(true);
    // Simulate slight loading feedback
    setTimeout(() => {
      localStorage.setItem('bistro_booking_mock_role', targetRole);
      onRoleChanged(targetRole);
      setLoading(false);
    }, 150);
  };

  return (
    <div className="bg-slate-900 text-slate-100 px-4 py-2 text-xs flex flex-wrap items-center justify-between gap-2 border-b border-slate-800">
      <div className="flex items-center gap-2">
        <span className="inline-flex items-center justify-center bg-indigo-500/20 text-indigo-300 font-mono px-2 py-0.5 rounded border border-indigo-500/30">
          OFFLINE SANDBOX MODE
        </span>
        <span className="text-slate-400">
          Testing user: <strong className="text-slate-200 font-mono">{userEmail}</strong>
        </span>
      </div>

      <div className="flex items-center gap-3">
        <span className="text-slate-400 hidden sm:inline">Active Role:</span>
        <div className="inline-flex bg-slate-950 p-1 rounded-lg border border-slate-800">
          <button
            onClick={() => handleRoleToggle('customer')}
            disabled={loading || currentRole === 'customer'}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition-all ${
              currentRole === 'customer'
                ? 'bg-indigo-600 text-white font-medium shadow-sm'
                : 'text-slate-400 hover:text-slate-200 disabled:opacity-50'
            }`}
          >
            <User className="w-3 h-3" />
            <span>Customer</span>
          </button>
          <button
            onClick={() => handleRoleToggle('admin')}
            disabled={loading || currentRole === 'admin'}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition-all ${
              currentRole === 'admin'
                ? 'bg-emerald-600 text-white font-medium shadow-sm'
                : 'text-slate-400 hover:text-slate-200 disabled:opacity-50'
            }`}
          >
            <Shield className="w-3 h-3" />
            <span>Administrator</span>
          </button>
        </div>
        {loading && <Loader2 className="w-3.5 h-3.5 animate-spin text-slate-400" />}
      </div>
    </div>
  );
}
