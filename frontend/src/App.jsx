import React, { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom'
import TopicsHome from './pages/TopicsHome'
import TopicProblems from './pages/TopicProblems'
import ProblemList from './pages/ProblemList'
import ProblemDetail from './pages/ProblemDetail'
import './styles/globals.css'

function Navbar({ user }) {
  const navigate = useNavigate();
  const location = useLocation();
  const isHomePage = location.pathname === '/';

  return (
    <nav className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center gap-6">
            <h1
              onClick={() => navigate('/')}
              className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 cursor-pointer hover:from-blue-700 hover:to-purple-700 transition-all"
            >
              💡 HintSys
            </h1>
            {!isHomePage && (
              <button
                onClick={() => navigate('/')}
                className="text-gray-600 hover:text-gray-900 font-medium text-sm flex items-center gap-1"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                Home
              </button>
            )}
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-gray-700 font-medium">Welcome, {user.username}</span>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default function App() {
  const [user, setUser] = useState({ username: 'test', id: 1 }) // Temporary user for testing

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50">
        <Navbar user={user} />

        <Routes>
          <Route path="/" element={<TopicsHome />} />
          <Route path="/topics/:topicName" element={<TopicProblems />} />
          <Route path="/problems" element={<ProblemList />} />
          <Route path="/problems/:id" element={<ProblemDetail />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}
