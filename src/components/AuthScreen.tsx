import { useState } from 'react';
import { UtensilsCrossed, Sparkles, Shield, AlertCircle, Loader2 } from 'lucide-react';

interface AuthScreenProps {
  onLaunchMockMode: (asRole: 'customer' | 'admin') => void;
}

export default function AuthScreen({ onLaunchMockMode }: AuthScreenProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLocalLogin = (asRole: 'customer' | 'admin') => {
    setLoading(true);
    setError(null);
    try {
      // Direct local authentication storage
      localStorage.setItem('bistro_booking_mock_active', 'true');
      localStorage.setItem('bistro_booking_mock_role', asRole);
      onLaunchMockMode(asRole);
    } catch (err: any) {
      console.error('Login Failed:', err);
      setError('An unexpected error occurred during client-side sandbox launch.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200/80 shadow-xl p-8 space-y-8 relative overflow-hidden">
        {/* Visual element design detail */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-indigo-500 to-emerald-500"></div>

        <div className="text-center space-y-3">
          <div className="w-12 h-12 bg-indigo-50 border border-indigo-100 rounded-2xl flex items-center justify-center mx-auto text-indigo-600 shadow-sm">
            <UtensilsCrossed className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-display font-bold text-slate-950 tracking-tight">
              Bistro Booking
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Table Reservation & Seating Management System
            </p>
          </div>
        </div>

        {error && (
          <div className="bg-rose-50 border border-rose-100 text-rose-800 p-4 rounded-2xl flex flex-col gap-2.5 text-xs text-left">
            <div className="flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
              <span className="font-medium">{error}</span>
            </div>
          </div>
        )}

        <div className="space-y-4">
          <p className="text-center text-xs text-slate-400">
            Select a role to start planning reservations immediately inside the offline browser sandbox:
          </p>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <button
              onClick={() => handleLocalLogin('customer')}
              disabled={loading}
              className="flex flex-col items-center justify-center gap-2.5 border border-slate-200 hover:border-indigo-200 hover:bg-indigo-50/20 text-slate-700 hover:text-slate-900 font-semibold p-5 rounded-2xl transition-all group"
            >
              <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 group-hover:scale-105 transition-transform">
                <Sparkles className="w-5 h-5" />
              </div>
              <span className="text-sm">Customer Mode</span>
            </button>
            <button
              onClick={() => handleLocalLogin('admin')}
              disabled={loading}
              className="flex flex-col items-center justify-center gap-2.5 border border-slate-200 hover:border-emerald-200 hover:bg-emerald-50/20 text-slate-700 hover:text-slate-900 font-semibold p-5 rounded-2xl transition-all group"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 group-hover:scale-105 transition-transform">
                <Shield className="w-5 h-5" />
              </div>
              <span className="text-sm">Admin Mode</span>
            </button>
          </div>
        </div>

        <div className="text-center">
          <p className="text-[10px] text-slate-400 font-mono">
            Powered by Browser Local Storage (No Firebase Needed)
          </p>
        </div>
      </div>
    </div>
  );
}
