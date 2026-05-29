import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

export default function Navbar({ user, onSignOut }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const location = useLocation();
  const profileRef = useRef(null);

  const isActive = (path) => location.pathname === path;

  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navLinks = [
    { label: 'Explore', path: '/' },
    { label: 'Problems', path: '/problems' },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-gray-950/80 backdrop-blur-xl border-b border-white/[0.06] shadow-lg shadow-black/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* ── Logo + Desktop Links ── */}
          <div className="flex items-center gap-10">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/30 group-hover:shadow-indigo-500/50 group-hover:scale-105 transition-all duration-300">
                {/* Code bracket icon */}
                <svg
                  className="w-5 h-5 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5"
                  />
                </svg>
                {/* Subtle shine overlay */}
                <div className="absolute inset-0 rounded-xl bg-gradient-to-t from-transparent to-white/20 pointer-events-none" />
              </div>
              <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-400 via-violet-400 to-purple-400 bg-clip-text text-transparent select-none">
                HintCode
              </span>
            </Link>

            {/* Desktop nav links */}
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map(({ label, path }) => (
                <Link
                  key={path}
                  to={path}
                  className={`relative px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive(path)
                      ? 'text-white bg-white/[0.08]'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
                  }`}
                >
                  {label}
                  {isActive(path) && (
                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-0.5 rounded-full bg-gradient-to-r from-indigo-400 to-violet-400" />
                  )}
                </Link>
              ))}
            </div>
          </div>

          {/* ── Right side: user area (desktop) + hamburger (mobile) ── */}
          <div className="flex items-center gap-3">

            {/* Desktop user avatar / dropdown */}
            {user && (
              <div className="hidden md:block relative" ref={profileRef}>
                <button
                  onClick={() => setIsProfileOpen((v) => !v)}
                  className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl border border-transparent hover:border-white/[0.08] hover:bg-white/[0.04] transition-all duration-200 group"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-sm font-bold text-white shadow-md shadow-indigo-500/20 ring-2 ring-white/10 group-hover:ring-white/20 transition-all duration-200">
                    {user.username?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <span className="text-sm font-medium text-slate-300 group-hover:text-slate-100 transition-colors duration-200 hidden lg:inline-block">
                    {user.username}
                  </span>
                  {/* Chevron down */}
                  <svg
                    className={`w-4 h-4 text-slate-500 transition-transform duration-200 ${isProfileOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                  </svg>
                </button>

                {/* Dropdown */}
                <div
                  className={`absolute right-0 mt-2 w-56 origin-top-right rounded-xl bg-gray-900/95 backdrop-blur-xl border border-white/[0.08] shadow-2xl shadow-black/40 py-1.5 transition-all duration-200 ${
                    isProfileOpen
                      ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto'
                      : 'opacity-0 scale-95 -translate-y-1 pointer-events-none'
                  }`}
                >
                  {/* User info header */}
                  <div className="px-4 py-3 border-b border-white/[0.06]">
                    <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Signed in as</p>
                    <p className="text-sm font-semibold text-slate-200 truncate mt-0.5">
                      {user.email || user.username}
                    </p>
                  </div>

                  {/* Sign out button */}
                  <div className="p-1.5">
                    <button
                      onClick={() => {
                        setIsProfileOpen(false);
                        onSignOut();
                      }}
                      className="flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-sm text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors duration-200"
                    >
                      {/* Sign-out / arrow-right-on-rectangle icon */}
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9"
                        />
                      </svg>
                      Sign out
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ── Mobile hamburger button ── */}
            <button
              onClick={() => setIsMobileMenuOpen((v) => !v)}
              className="md:hidden inline-flex items-center justify-center w-10 h-10 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-white/[0.06] border border-transparent hover:border-white/[0.08] transition-all duration-200"
              aria-label="Toggle menu"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* ── Mobile menu panel ── */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
          isMobileMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="bg-gray-950/95 backdrop-blur-xl border-t border-white/[0.04] px-4 pt-3 pb-5 space-y-1">
          {navLinks.map(({ label, path }) => (
            <Link
              key={path}
              to={path}
              onClick={() => setIsMobileMenuOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-base font-medium transition-all duration-200 ${
                isActive(path)
                  ? 'text-white bg-white/[0.08]'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
              }`}
            >
              {label}
            </Link>
          ))}

          {/* Mobile user section */}
          {user && (
            <div className="pt-4 mt-3 border-t border-white/[0.06]">
              <div className="flex items-center gap-3 px-3 py-2">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-sm font-bold text-white shadow-md shadow-indigo-500/20 ring-2 ring-white/10">
                  {user.username?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-200 truncate">{user.username}</p>
                  <p className="text-xs text-slate-500 truncate">{user.email}</p>
                </div>
              </div>

              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onSignOut();
                }}
                className="mt-2 flex items-center gap-2.5 w-full px-3 py-2.5 rounded-lg text-base font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors duration-200"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9"
                  />
                </svg>
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}