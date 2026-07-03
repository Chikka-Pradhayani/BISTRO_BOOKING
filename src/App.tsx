import { useState, useEffect } from 'react';
import { UserProfile, UserRole } from './types';
import RoleEvaluationBanner from './components/RoleEvaluationBanner';
import AuthScreen from './components/AuthScreen';
import CustomerDashboard from './components/CustomerDashboard';
import AdminDashboard from './components/AdminDashboard';
import { UtensilsCrossed, LogOut, Loader2, ShieldCheck, User } from 'lucide-react';

export default function App() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Initialize simulated sandbox user
  const handleLaunchMockMode = (asRole: 'customer' | 'admin') => {
    const mockUser = {
      uid: 'mock_sandbox_user_123',
      email: asRole === 'admin' ? 'demo_admin@restaurant.com' : 'demo_customer@restaurant.com',
      displayName: asRole === 'admin' ? 'Demo Admin' : 'Demo Customer',
    };
    setCurrentUser(mockUser);
    setUserProfile({
      uid: mockUser.uid,
      email: mockUser.email,
      displayName: mockUser.displayName,
      role: asRole,
      createdAt: new Date().toISOString(),
    });
    setLoading(false);
  };

  useEffect(() => {
    const isActive = localStorage.getItem('bistro_booking_mock_active') === 'true';
    if (isActive) {
      const mockRole = (localStorage.getItem('bistro_booking_mock_role') || 'customer') as UserRole;
      handleLaunchMockMode(mockRole);
    } else {
      setLoading(false);
    }
  }, []);

  const handleSignOut = () => {
    localStorage.removeItem('bistro_booking_mock_active');
    localStorage.removeItem('bistro_booking_mock_role');
    setCurrentUser(null);
    setUserProfile(null);
  };

  const handleRoleChanged = (newRole?: UserRole) => {
    let nextMockRole: UserRole;
    if (newRole) {
      nextMockRole = newRole;
    } else {
      const currentMockRole = localStorage.getItem('bistro_booking_mock_role') || 'customer';
      nextMockRole = currentMockRole === 'admin' ? 'customer' : 'admin';
    }
    localStorage.setItem('bistro_booking_mock_role', nextMockRole);
    handleLaunchMockMode(nextMockRole);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 space-y-3">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
        <p className="text-sm font-medium text-slate-500">Preparing Bistro Booking Sandbox...</p>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-50">
        <AuthScreen onLaunchMockMode={handleLaunchMockMode} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Dev evaluation helper */}
      <RoleEvaluationBanner
        currentRole={userProfile?.role || null}
        onRoleChanged={handleRoleChanged}
      />

      {/* Main Navigation Header */}
      <header className="bg-white border-b border-slate-200/80 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-md">
              <UtensilsCrossed className="w-5 h-5" />
            </div>
            <div>
              <span className="font-display font-extrabold text-lg text-slate-950 tracking-tight block leading-tight">
                BISTRO BOOKING
              </span>
              <span className="text-[10px] font-mono text-indigo-600 font-bold tracking-widest uppercase">
                OFFLINE SANDBOX
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* User credentials & role badge */}
            <div className="flex items-center gap-3 bg-slate-50 border border-slate-200/60 p-1.5 pr-3.5 rounded-2xl">
              <div className="w-8 h-8 rounded-xl bg-slate-200 flex items-center justify-center text-slate-700">
                {userProfile?.role === 'admin' ? (
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                ) : (
                  <User className="w-4 h-4 text-indigo-600" />
                )}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-xs font-semibold text-slate-800 leading-tight">
                  {userProfile?.displayName || currentUser?.displayName || 'User'}
                </p>
                <p className="text-[10px] text-slate-400 font-medium leading-none">
                  {userProfile?.role === 'admin' ? 'Administrator' : 'Customer'}
                </p>
              </div>
            </div>

            {/* Logout button */}
            <button
              onClick={handleSignOut}
              className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-all"
              title="Sign Out"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Dashboard */}
      <main className="flex-grow">
        {userProfile?.role === 'admin' ? (
          <AdminDashboard isMockMode={true} />
        ) : (
          <CustomerDashboard isMockMode={true} />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-400 font-medium">
        <p>© 2026 Bistro Booking. All Rights Reserved. (Running Offline Sandbox)</p>
      </footer>
    </div>
  );
}
