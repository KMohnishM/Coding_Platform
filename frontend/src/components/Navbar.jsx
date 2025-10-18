import React, { useState, Fragment } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, Transition } from '@headlessui/react';
import Button from './Button';
import { 
  CodeBracketIcon,
  ChevronDownIcon,
  ArrowRightOnRectangleIcon 
} from '@heroicons/react/24/outline';

export default function Navbar({ user, onSignOut }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  // Check if a route is active
  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-gradient-to-r from-primary-700 to-primary-600 text-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and Desktop Navigation */}
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="flex items-center space-x-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="16 18 22 12 16 6"></polyline>
                  <polyline points="8 6 2 12 8 18"></polyline>
                </svg>
                <span className="text-xl font-bold tracking-tight">CodeHint</span>
                <span className="bg-white/20 text-white text-xs font-semibold px-2 py-0.5 rounded">BETA</span>
              </Link>
            </div>
            
            {/* Desktop Navigation Links */}
            <div className="hidden sm:ml-10 sm:flex sm:items-center sm:space-x-6">
              <Link 
                to="/" 
                className={`px-3 py-1 rounded-md text-sm font-medium ${
                  isActive('/') 
                    ? 'bg-white/10 text-white' 
                    : 'text-white/80 hover:text-white hover:bg-white/10'
                }`}
              >
                Problems
              </Link>
              <Link 
                to="/about" 
                className={`px-3 py-1 rounded-md text-sm font-medium ${
                  isActive('/about') 
                    ? 'bg-white/10 text-white' 
                    : 'text-white/80 hover:text-white hover:bg-white/10'
                }`}
              >
                About
              </Link>
              <a 
                href="https://github.com/yourusername/CodeHint" 
                target="_blank" 
                rel="noopener noreferrer"
                className="px-3 py-1 rounded-md text-sm font-medium text-white/80 hover:text-white hover:bg-white/10"
              >
                GitHub
              </a>
            </div>
          </div>
          
          {/* User section for desktop */}
          <div className="hidden sm:flex sm:items-center">
            {user ? (
              <Menu as="div" className="relative">
                <Menu.Button className="flex items-center space-x-3 px-3 py-2 rounded-md hover:bg-white/10 transition duration-150">
                  <div className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center">
                    <span className="text-sm font-semibold">{user.username?.charAt(0).toUpperCase() || 'U'}</span>
                  </div>
                  <span className="text-sm font-medium">{user.username}</span>
                  <ChevronDownIcon className="h-4 w-4 text-white/70" />
                </Menu.Button>
                
                <Transition
                  as={Fragment}
                  enter="transition ease-out duration-100"
                  enterFrom="transform opacity-0 scale-95"
                  enterTo="transform opacity-100 scale-100"
                  leave="transition ease-in duration-75"
                  leaveFrom="transform opacity-100 scale-100"
                  leaveTo="transform opacity-0 scale-95"
                >
                  <Menu.Items className="absolute right-0 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                    <Menu.Item>
                      {({ active }) => (
                        <a
                          href="/profile"
                          className={`${
                            active ? 'bg-gray-50' : ''
                          } block px-4 py-2 text-sm text-gray-700`}
                        >
                          Your Profile
                        </a>
                      )}
                    </Menu.Item>
                    <Menu.Item>
                      {({ active }) => (
                        <a
                          href="/settings"
                          className={`${
                            active ? 'bg-gray-50' : ''
                          } block px-4 py-2 text-sm text-gray-700`}
                        >
                          Settings
                        </a>
                      )}
                    </Menu.Item>
                    <div className="border-t border-gray-100 my-1"></div>
                    <Menu.Item>
                      {({ active }) => (
                        <button
                          onClick={onSignOut}
                          className={`${
                            active ? 'bg-gray-50' : ''
                          } w-full text-left px-4 py-2 text-sm text-gray-700 flex items-center`}
                        >
                          <ArrowRightOnRectangleIcon className="h-4 w-4 mr-2" />
                          Sign out
                        </button>
                      )}
                    </Menu.Item>
                  </Menu.Items>
                </Transition>
              </Menu>
            ) : (
              <div className="flex items-center space-x-3">
                <Link to="/signin">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-white border-white/30 hover:bg-white/10 hover:border-white"
                  >
                    Sign In
                  </Button>
                </Link>
                <Link to="/signup">
                  <Button 
                    variant="secondary" 
                    size="sm" 
                    className="bg-white text-primary-700 hover:bg-gray-100"
                  >
                    Sign Up
                  </Button>
                </Link>
              </div>
            )}
          </div>
          
          {/* Mobile menu button */}
          <div className="flex items-center sm:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-white/80 hover:text-white hover:bg-white/10"
              aria-label="Toggle menu"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="sm:hidden bg-primary-800 shadow-lg overflow-hidden"
          >
            <motion.div 
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.1, staggerChildren: 0.1 }}
              className="px-2 pt-2 pb-3 space-y-1"
            >
              <motion.div variants={{ open: { opacity: 1, x: 0 } }}>
                <Link
                  to="/"
                  className={`block px-3 py-2 rounded-md text-base font-medium ${
                    isActive('/') 
                      ? 'bg-white/10 text-white' 
                      : 'text-white/80 hover:text-white hover:bg-white/10'
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <span className="flex items-center space-x-2">
                    <CodeBracketIcon className="h-5 w-5" />
                    <span>Problems</span>
                  </span>
                </Link>
              </motion.div>

              <motion.div variants={{ open: { opacity: 1, x: 0 } }}>
                <Link
                  to="/about"
                  className={`block px-3 py-2 rounded-md text-base font-medium ${
                    isActive('/about') 
                      ? 'bg-white/10 text-white' 
                      : 'text-white/80 hover:text-white hover:bg-white/10'
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  About
                </Link>
              </motion.div>

              <motion.div variants={{ open: { opacity: 1, x: 0 } }}>
                <a
                  href="https://github.com/yourusername/CodeHint"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block px-3 py-2 rounded-md text-base font-medium text-white/80 hover:text-white hover:bg-white/10"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <span className="flex items-center space-x-2">
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                      <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                    </svg>
                    <span>GitHub</span>
                  </span>
                </a>
              </motion.div>
            </motion.div>

          {/* Mobile user section */}
          <div className="pt-4 pb-3 border-t border-white/10">
            {user ? (
              <div>
                <div className="flex items-center px-5 py-2">
                  <div className="h-9 w-9 rounded-full bg-white/20 flex items-center justify-center">
                    <span className="text-lg font-semibold">{user.username?.charAt(0).toUpperCase() || 'U'}</span>
                  </div>
                  <div className="ml-3">
                    <div className="text-base font-medium text-white">{user.username}</div>
                  </div>
                </div>
                <div className="mt-3 px-2 space-y-1">
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      onSignOut();
                    }}
                    className="flex items-center w-full px-3 py-2 rounded-md text-base font-medium text-white/80 hover:text-white hover:bg-white/10"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                      <polyline points="16 17 21 12 16 7"></polyline>
                      <line x1="21" y1="12" x2="9" y2="12"></line>
                    </svg>
                    Sign out
                  </button>
                </div>
              </div>
            ) : (
              <div className="px-2 space-y-2">
                <Link
                  to="/signin"
                  className="block px-3 py-2 rounded-md text-base font-medium text-center text-white/90 bg-white/10 hover:bg-white/20"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  className="block px-3 py-2 rounded-md text-base font-medium text-center text-primary-700 bg-white hover:bg-gray-100"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}