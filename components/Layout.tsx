import React, { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';
import SecurityBadge from './SecurityBadge';

const Layout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const isActive = (path: string) => location.pathname === path;

  const handleLogout = () => {
    logout();
    setIsMobileMenuOpen(false);
    navigate('/');
  };

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 font-sans text-gray-900">
      {/* Navigation */}
      <nav className="bg-primary text-white shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo Area */}
            <div className="flex items-center">
              <Link to="/" className="flex items-center gap-2 group" onClick={closeMobileMenu}>
                <div className="w-9 h-9 bg-secondary rounded-lg flex items-center justify-center font-bold text-white text-xl shadow-md group-hover:bg-secondary-light transition-colors">
                  V
                </div>
                <span className="font-bold text-xl tracking-tight group-hover:text-secondary-light transition-colors">VolunteerHub</span>
              </Link>
              
              {/* Desktop Nav Links */}
              <div className="hidden md:block ml-10">
                <div className="flex items-baseline space-x-1">
                  <Link
                    to="/"
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                      isActive('/') ? 'bg-primary-light text-white shadow-inner' : 'text-gray-300 hover:bg-primary-light hover:text-white'
                    }`}
                  >
                    Home
                  </Link>
                  <Link
                    to="/events"
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                      isActive('/events') ? 'bg-primary-light text-white shadow-inner' : 'text-gray-300 hover:bg-primary-light hover:text-white'
                    }`}
                  >
                    Explore Events
                  </Link>
                  {isAuthenticated && (
                    <Link
                      to="/dashboard"
                      className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                        isActive('/dashboard') ? 'bg-primary-light text-white shadow-inner' : 'text-gray-300 hover:bg-primary-light hover:text-white'
                      }`}
                    >
                      Dashboard
                    </Link>
                  )}
                  {isAuthenticated && user?.role === UserRole.ADMIN && (
                    <Link
                      to="/admin"
                      className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                        isActive('/admin') ? 'bg-primary-light text-white shadow-inner' : 'text-gray-300 hover:bg-primary-light hover:text-white'
                      }`}
                    >
                      Admin
                    </Link>
                  )}
                </div>
              </div>
            </div>

            {/* Desktop User Profile / Auth Buttons */}
            <div className="hidden md:block">
              <div className="ml-4 flex items-center md:ml-6 space-x-4">
                {isAuthenticated && user ? (
                  <div className="flex items-center gap-4">
                    <Link to="/profile" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                      <div className="text-right hidden lg:block">
                        <p className="text-sm font-medium text-white leading-none">{user.fullName}</p>
                        <p className="text-xs text-gray-400 mt-1 capitalize">{user.role}</p>
                      </div>
                      <img
                        className="h-9 w-9 rounded-full border-2 border-secondary shadow-sm"
                        src={user.avatarUrl}
                        alt={user.fullName}
                      />
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium border border-gray-600 hover:border-gray-400 hover:bg-gray-800 transition-all"
                    >
                      Log Out
                    </button>
                  </div>
                ) : (
                  <>
                    <Link 
                      to="/login"
                      className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
                    >
                      Log In
                    </Link>
                    <Link 
                      to="/register"
                      className="bg-secondary hover:bg-secondary-light text-white px-5 py-2 rounded-md text-sm font-bold transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                    >
                      Sign Up
                    </Link>
                  </>
                )}
              </div>
            </div>

            {/* Mobile Menu Button */}
            <div className="-mr-2 flex md:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                type="button"
                className="bg-primary-light inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white"
                aria-controls="mobile-menu"
                aria-expanded="false"
              >
                <span className="sr-only">Open main menu</span>
                {!isMobileMenuOpen ? (
                  <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                ) : (
                  <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-primary border-t border-gray-700" id="mobile-menu">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              <Link
                to="/"
                onClick={closeMobileMenu}
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  isActive('/') ? 'bg-gray-900 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
              >
                Home
              </Link>
              <Link
                to="/events"
                onClick={closeMobileMenu}
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  isActive('/events') ? 'bg-gray-900 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
              >
                Explore Events
              </Link>
              {isAuthenticated && (
                <Link
                  to="/dashboard"
                  onClick={closeMobileMenu}
                  className={`block px-3 py-2 rounded-md text-base font-medium ${
                    isActive('/dashboard') ? 'bg-gray-900 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  }`}
                >
                  Dashboard
                </Link>
              )}
              {isAuthenticated && user?.role === UserRole.ADMIN && (
                <Link
                  to="/admin"
                  onClick={closeMobileMenu}
                  className={`block px-3 py-2 rounded-md text-base font-medium ${
                    isActive('/admin') ? 'bg-gray-900 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  }`}
                >
                  Admin
                </Link>
              )}
            </div>
            
            {/* Mobile Auth Buttons / Profile */}
            <div className="pt-4 pb-4 border-t border-gray-700">
              {isAuthenticated && user ? (
                <div>
                  <Link to="/profile" onClick={closeMobileMenu} className="flex items-center px-5 py-3 hover:bg-gray-700 transition-colors">
                    <div className="flex-shrink-0">
                      <img className="h-10 w-10 rounded-full border-2 border-secondary" src={user.avatarUrl} alt="" />
                    </div>
                    <div className="ml-3">
                      <div className="text-base font-medium leading-none text-white">{user.fullName}</div>
                      <div className="text-sm font-medium leading-none text-gray-400 mt-1">{user.email}</div>
                    </div>
                    <svg className="ml-auto h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-5 py-3 text-gray-300 hover:bg-gray-700 hover:text-white transition-colors flex items-center"
                  >
                    <svg className="h-5 w-5 mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Log Out
                  </button>
                </div>
              ) : (
                <div className="px-5 space-y-3">
                  <Link 
                    to="/login"
                    onClick={closeMobileMenu}
                    className="block text-center w-full px-4 py-2 border border-gray-500 rounded-md shadow-sm text-base font-medium text-gray-300 hover:bg-gray-700 hover:text-white"
                  >
                    Log In
                  </Link>
                  <Link 
                    to="/register"
                    onClick={closeMobileMenu}
                    className="block text-center w-full px-4 py-2 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-secondary hover:bg-secondary-light"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main className="flex-grow">
        <Outlet />
      </main>

      {/* Security Badge */}
      <SecurityBadge />

      {/* Footer */}
      <footer className="bg-primary text-gray-400 py-10 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
                <div className="mb-6 md:mb-0 text-center md:text-left">
                    <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                        <div className="w-6 h-6 bg-secondary rounded flex items-center justify-center font-bold text-white text-xs">V</div>
                        <span className="font-bold text-white text-lg">VolunteerHub</span>
                    </div>
                    <p className="text-sm text-gray-500">Connecting passion with purpose.</p>
                </div>
                <div className="flex flex-wrap justify-center gap-8 text-sm">
                    <a href="#" className="hover:text-white transition-colors duration-200">About</a>
                    <a href="#" className="hover:text-white transition-colors duration-200">Events</a>
                    <a href="#" className="hover:text-white transition-colors duration-200">Organizations</a>
                    <a href="#" className="hover:text-white transition-colors duration-200">Blog</a>
                    <a href="#" className="hover:text-white transition-colors duration-200">Contact</a>
                </div>
            </div>
            <div className="mt-8 border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-gray-600">
                <p>&copy; 2025 VolunteerHub. All rights reserved.</p>
                <div className="flex gap-4 mt-4 md:mt-0">
                    <a href="#" className="hover:text-gray-400">Privacy Policy</a>
                    <a href="#" className="hover:text-gray-400">Terms of Service</a>
                </div>
            </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;