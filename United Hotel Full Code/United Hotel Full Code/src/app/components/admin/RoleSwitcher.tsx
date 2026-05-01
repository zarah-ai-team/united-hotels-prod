import { useState, useEffect } from 'react';
import { ShieldCheck, User, Lock, X } from 'lucide-react';

type Role = 'admin' | 'staff';

// Simulated auth - in real app, this would come from your auth system
const getUserActualRole = (): Role => {
  // This would come from your authentication token/session
  // For demo: check localStorage, default to staff for security
  const actualRole = localStorage.getItem('userActualRole') as Role;
  return actualRole || 'staff'; // Default to staff (more secure)
};

// Admin credentials for demo (in production, this would be server-side)
const ADMIN_CREDENTIALS = {
  username: 'admin',
  password: 'admin123'
};

export function RoleSwitcher() {
  const actualRole = getUserActualRole();
  const [currentRole, setCurrentRole] = useState<Role>(() => {
    const stored = localStorage.getItem('adminRole') as Role;
    // Staff users can never view as admin unless authenticated
    if (actualRole === 'staff') return 'staff';
    return stored || actualRole;
  });
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');

  useEffect(() => {
    // Security: Staff can never switch to admin view without authentication
    if (actualRole === 'staff' && currentRole === 'admin') {
      setCurrentRole('staff');
      localStorage.setItem('adminRole', 'staff');
    } else {
      localStorage.setItem('adminRole', currentRole);
    }
    window.dispatchEvent(new CustomEvent('roleChanged', { detail: currentRole }));
  }, [currentRole, actualRole]);

  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');

    // Validate credentials
    if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
      // Upgrade user to admin
      localStorage.setItem('userActualRole', 'admin');
      localStorage.setItem('adminRole', 'admin');
      setShowAuthModal(false);
      setUsername('');
      setPassword('');
      // Reload to apply new role
      window.location.reload();
    } else {
      setAuthError('Invalid username or password');
    }
  };

  const toggleRole = () => {
    // Admins can toggle freely
    if (actualRole === 'admin') {
      setCurrentRole(prev => prev === 'admin' ? 'staff' : 'admin');
    } else {
      // Staff needs to authenticate
      setShowAuthModal(true);
    }
  };

  const closeAuthModal = () => {
    setShowAuthModal(false);
    setUsername('');
    setPassword('');
    setAuthError('');
  };

  // If user is staff, show switch button that triggers auth
  if (actualRole === 'staff') {
    return (
      <>
        <div className="flex items-center gap-3">
          <span className="text-sm text-[#8C8C8C] font-['Inter:Medium',sans-serif]">
            Current Role:
          </span>
          <button
            onClick={toggleRole}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white border-2 border-[#EAEAEA] hover:border-[#1ABC9C] transition-all group"
          >
            <User className="h-4 w-4 text-[#8C8C8C]" />
            <span className="text-sm font-['Inter:SemiBold',sans-serif] text-[#3B3B3B]">
              Staff
            </span>
            <div className="ml-1 text-xs text-[#8C8C8C] group-hover:text-[#1ABC9C] transition-colors">
              Switch to Admin
            </div>
          </button>
        </div>

        {/* Authentication Modal */}
        {showAuthModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div 
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={closeAuthModal}
            />

            {/* Modal */}
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 p-8">
              {/* Close Button */}
              <button
                onClick={closeAuthModal}
                className="absolute top-4 right-4 text-[#8C8C8C] hover:text-[#3B3B3B] transition-colors"
              >
                <X className="h-6 w-6" />
              </button>

              {/* Header */}
              <div className="flex items-center gap-3 mb-6">
                <div className="h-12 w-12 rounded-full bg-[#1ABC9C]/10 flex items-center justify-center">
                  <Lock className="h-6 w-6 text-[#1ABC9C]" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-[#3B3B3B]" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    Admin Authentication
                  </h2>
                  <p className="text-sm text-[#8C8C8C]" style={{ fontFamily: 'Inter, sans-serif' }}>
                    Enter admin credentials to continue
                  </p>
                </div>
              </div>

              {/* Auth Form */}
              <form onSubmit={handleAuthSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#3B3B3B] mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
                    Admin Username
                  </label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter admin username"
                    className="w-full px-4 py-3 border border-[#EAEAEA] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1ABC9C] focus:border-transparent"
                    style={{ fontFamily: 'Inter, sans-serif' }}
                    autoFocus
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#3B3B3B] mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
                    Admin Password
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter admin password"
                    className="w-full px-4 py-3 border border-[#EAEAEA] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1ABC9C] focus:border-transparent"
                    style={{ fontFamily: 'Inter, sans-serif' }}
                  />
                </div>

                {authError && (
                  <div className="bg-[#FEE2E2] border border-[#EF4444] rounded-lg p-3">
                    <p className="text-sm text-[#DC2626]" style={{ fontFamily: 'Inter, sans-serif' }}>
                      {authError}
                    </p>
                  </div>
                )}

                <div className="bg-[#F0F9FF] border border-[#BAE6FD] rounded-lg p-3">
                  <p className="text-xs text-[#075985]" style={{ fontFamily: 'Inter, sans-serif' }}>
                    💡 Demo credentials: <strong>admin</strong> / <strong>admin123</strong>
                  </p>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={closeAuthModal}
                    className="flex-1 px-4 py-3 border border-[#EAEAEA] rounded-lg text-[#3B3B3B] font-medium hover:bg-[#FAFAFA] transition-colors"
                    style={{ fontFamily: 'Inter, sans-serif' }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-3 bg-[#1ABC9C] text-white rounded-lg font-semibold hover:bg-[#16A085] transition-colors"
                    style={{ fontFamily: 'Inter, sans-serif' }}
                  >
                    Authenticate
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </>
    );
  }

  // Admin can switch between views
  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-[#8C8C8C] font-['Inter:Medium',sans-serif]">
        Viewing as:
      </span>
      <button
        onClick={toggleRole}
        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white border-2 border-[#EAEAEA] hover:border-[#1ABC9C] transition-all group"
      >
        {currentRole === 'admin' ? (
          <>
            <ShieldCheck className="h-4 w-4 text-[#1ABC9C]" />
            <span className="text-sm font-['Inter:SemiBold',sans-serif] text-[#3B3B3B]">
              Admin
            </span>
          </>
        ) : (
          <>
            <User className="h-4 w-4 text-[#8C8C8C]" />
            <span className="text-sm font-['Inter:SemiBold',sans-serif] text-[#3B3B3B]">
              Staff
            </span>
          </>
        )}
        <div className="ml-1 text-xs text-[#8C8C8C] group-hover:text-[#1ABC9C] transition-colors">
          Switch
        </div>
      </button>
      <span className="text-xs text-[#8C8C8C] italic">
        (Admin)
      </span>
    </div>
  );
}

// Hook to use current role in components
export function useRole() {
  const [role, setRole] = useState<Role>(() => {
    const actualRole = getUserActualRole();
    if (actualRole === 'staff') return 'staff';
    const stored = localStorage.getItem('adminRole');
    return (stored as Role) || actualRole;
  });

  useEffect(() => {
    const handleRoleChange = (e: Event) => {
      const customEvent = e as CustomEvent<Role>;
      const actualRole = getUserActualRole();
      // Security check
      if (actualRole === 'staff' && customEvent.detail === 'admin') {
        setRole('staff');
      } else {
        setRole(customEvent.detail);
      }
    };

    window.addEventListener('roleChanged', handleRoleChange);
    return () => window.removeEventListener('roleChanged', handleRoleChange);
  }, []);

  return role;
}

// Utility to set user's actual role (for demo purposes)
export function setUserActualRole(role: Role) {
  localStorage.setItem('userActualRole', role);
  localStorage.setItem('adminRole', role);
  window.location.reload();
}