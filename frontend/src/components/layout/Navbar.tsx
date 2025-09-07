import React, { useState } from 'react';
import { Scale, User, LogOut, Menu, X } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

export const Navbar: React.FC = () => {
  const { user, signOut, loading } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <nav className="navbar flex items-center justify-between px-4 sm:px-6 py-4 bg-white border-b border-[#dad2bc]">
      {/* Logo */}
      <div className="navbar-brand flex items-center gap-3">
        <div className="w-8 h-8 bg-[#252323] rounded-lg flex items-center justify-center">
          <Scale className="w-5 h-5 text-[#f5f1ed]" />
        </div>
        <span className="text-xl font-bold text-[#252323]">Legal Probe</span>
      </div>

      {/* Desktop Navigation */}
      <div className="hidden sm:flex items-center gap-4">
        {user ? (
          // Authenticated State
          <>
            <div className="flex items-center gap-2 text-sm text-[#70798c]">
              <User className="w-4 h-4" />
              <span className="truncate max-w-[120px]">
                {user.user_metadata?.username || user.email || 'User'}
              </span>
            </div>
            <button 
              onClick={handleSignOut}
              disabled={loading}
              className="text-[#70798c] hover:text-[#252323] transition-colors p-2 rounded-lg hover:bg-[#f5f1ed] disabled:opacity-50"
              title="Sign Out"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </>
        ) : (
          // Unauthenticated State
          <div className="flex items-center gap-3">
            <button 
              onClick={() => navigate('/login')}
              className="text-[#70798c] hover:text-[#252323] transition-colors px-3 py-1 rounded-lg hover:bg-[#f5f1ed]"
            >
              Login
            </button>
            <button 
              onClick={() => navigate('/signup')}
              className="bg-[#252323] hover:bg-[#70798c] text-[#f5f1ed] px-4 py-2 rounded-lg transition-colors font-medium"
            >
              Sign Up
            </button>
          </div>
        )}
      </div>

      {/* Mobile Menu Button */}
      <div className="sm:hidden">
        <button 
          onClick={toggleMobileMenu}
          className="text-[#70798c] hover:text-[#252323] transition-colors p-2"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="sm:hidden absolute top-full left-0 right-0 bg-white border-b border-[#dad2bc] shadow-lg z-50">
          <div className="px-4 py-4 space-y-4">
            {user ? (
              // Authenticated Mobile Menu
              <>
                <div className="flex items-center gap-2 text-sm text-[#70798c] pb-2 border-b border-[#dad2bc]">
                  <User className="w-4 h-4" />
                  <span>{user.user_metadata?.username || user.email || 'User'}</span>
                </div>
                <button 
                  onClick={() => {
                    handleSignOut();
                    setMobileMenuOpen(false);
                  }}
                  disabled={loading}
                  className="w-full text-left flex items-center gap-2 text-[#70798c] hover:text-[#252323] transition-colors py-2 disabled:opacity-50"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </>
            ) : (
              // Unauthenticated Mobile Menu
              <div className="space-y-2">
                <button 
                  onClick={() => {
                    navigate('/login');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-left text-[#70798c] hover:text-[#252323] transition-colors py-2"
                >
                  Login
                </button>
                <button 
                  onClick={() => {
                    navigate('/signup');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full bg-[#252323] hover:bg-[#70798c] text-[#f5f1ed] px-4 py-2 rounded-lg transition-colors font-medium"
                >
                  Sign Up
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};