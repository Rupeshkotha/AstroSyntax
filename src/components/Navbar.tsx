import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LockClosedIcon } from '@heroicons/react/24/outline';

const Navbar: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to log out:', error);
    }
  };

  return (
    <nav className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-xl border-b border-white/10">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
        <div className="absolute top-0 right-1/4 w-80 h-80 bg-pink-500/10 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-1/3 w-72 h-72 bg-blue-500/10 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      <div className="container mx-auto px-4 relative">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
              <span className="text-white font-bold">H</span>
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent animate-gradient-x">
              HackHub
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="relative group">
              <span className="text-gray-300 group-hover:text-white transition-colors duration-300">Home</span>
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-purple-500 to-pink-500 group-hover:w-full transition-all duration-300"></span>
            </Link>
            {currentUser ? (
              <>
                <Link to="/dashboard" className="relative group">
                  <span className="text-gray-300 group-hover:text-white transition-colors duration-300">Dashboard</span>
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-purple-500 to-pink-500 group-hover:w-full transition-all duration-300"></span>
                </Link>
                <Link to="/teams" className="relative group">
                  <span className="text-gray-300 group-hover:text-white transition-colors duration-300">Teams</span>
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-purple-500 to-pink-500 group-hover:w-full transition-all duration-300"></span>
                </Link>
                <Link to="/hackathons" className="relative group">
                  <span className="text-gray-300 group-hover:text-white transition-colors duration-300">Hackathons</span>
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-purple-500 to-pink-500 group-hover:w-full transition-all duration-300"></span>
                </Link>
                <Link to="/profile" className="relative group">
                  <span className="text-gray-300 group-hover:text-white transition-colors duration-300">Profile</span>
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-purple-500 to-pink-500 group-hover:w-full transition-all duration-300"></span>
                </Link>
                {currentUser.isAdmin && (
                  <Link to="/admin/hackathons" className="relative group">
                    <span className="text-gray-300 group-hover:text-white transition-colors duration-300">Manage Hackathons</span>
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-purple-500 to-pink-500 group-hover:w-full transition-all duration-300"></span>
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="relative group px-4 py-2 rounded-lg overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl"></div>
                  <span className="relative text-purple-400 group-hover:text-white transition-colors duration-300">Logout</span>
                </button>
              </>
            ) : (
              <div className="flex items-center gap-4">
                <Link
                  to="/login"
                  className="text-white/80 hover:text-white transition-colors"
                >
                  Log In
                </Link>
                <Link
                  to="/signup"
                  className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-200 transform hover:scale-105 hover:shadow-lg"
                >
                  Sign Up
                </Link>
                <Link
                  to="/admin-login"
                  className="text-white/80 hover:text-white transition-colors flex items-center gap-1"
                >
                  <LockClosedIcon className="h-4 w-4" />
                  Admin
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-white/5 transition-colors duration-300 relative group"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
            <svg
              className="w-6 h-6 text-gray-300 group-hover:text-white transition-colors duration-300"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {isMenuOpen ? (
                <path d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 space-y-4 bg-slate-800/50 backdrop-blur-xl rounded-lg mt-2 border border-white/10 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 to-pink-600/10 animate-gradient-x"></div>
            <Link
              to="/"
              className="block px-4 py-2 text-gray-300 hover:text-white hover:bg-white/5 transition-colors duration-300 relative group"
              onClick={() => setIsMenuOpen(false)}
            >
              <span className="relative z-10">Home</span>
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
            </Link>
            {currentUser ? (
              <>
                <Link
                  to="/dashboard"
                  className="block px-4 py-2 text-gray-300 hover:text-white hover:bg-white/5 transition-colors duration-300 relative group"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <span className="relative z-10">Dashboard</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                </Link>
                <Link
                  to="/teams"
                  className="block px-4 py-2 text-gray-300 hover:text-white hover:bg-white/5 transition-colors duration-300 relative group"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <span className="relative z-10">Teams</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                </Link>
                <Link
                  to="/hackathons"
                  className="block px-4 py-2 text-gray-300 hover:text-white hover:bg-white/5 transition-colors duration-300 relative group"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <span className="relative z-10">Hackathons</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                </Link>
                <Link
                  to="/profile"
                  className="block px-4 py-2 text-gray-300 hover:text-white hover:bg-white/5 transition-colors duration-300 relative group"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <span className="relative z-10">Profile</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                </Link>
                {currentUser.isAdmin && (
                  <Link
                    to="/admin/hackathons"
                    className="block px-4 py-2 text-gray-300 hover:text-white hover:bg-white/5 transition-colors duration-300 relative group"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <span className="relative z-10">Manage Hackathons</span>
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                  </Link>
                )}
                <button
                  onClick={() => {
                    handleLogout();
                    setIsMenuOpen(false);
                  }}
                  className="w-full px-4 py-2 rounded-lg relative group overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl"></div>
                  <span className="relative text-purple-400 group-hover:text-white transition-colors duration-300">Logout</span>
                </button>
              </>
            ) : (
              <div className="flex items-center gap-4">
                <Link
                  to="/login"
                  className="text-white/80 hover:text-white transition-colors"
                >
                  Log In
                </Link>
                <Link
                  to="/signup"
                  className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-200 transform hover:scale-105 hover:shadow-lg"
                >
                  Sign Up
                </Link>
                <Link
                  to="/admin-login"
                  className="text-white/80 hover:text-white transition-colors flex items-center gap-1"
                >
                  <LockClosedIcon className="h-4 w-4" />
                  Admin
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;