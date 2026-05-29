import React, { useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import TopicsHome from './pages/TopicsHome'
import TopicProblems from './pages/TopicProblems'
import ProblemList from './pages/ProblemList'
import ProblemDetail from './pages/ProblemDetail'
import Navbar from './components/Navbar'
import SignIn from './components/SignIn'
import authService from './services/authService'

export default function App() {
  const [user, setUser] = useState(() => authService.getUser())

  const handleSignIn = (userData) => {
    setUser(userData)
  }

  const handleSignOut = () => {
    authService.clearUser()
    localStorage.removeItem('token')
    setUser(null)
  }

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-[var(--bg-base)] text-slate-100 flex flex-col font-sans antialiased">
        {user ? (
          <>
            <Navbar user={user} onSignOut={handleSignOut} />
            <main className="flex-1 flex flex-col overflow-hidden">
              <Routes>
                <Route path="/" element={<TopicsHome />} />
                <Route path="/topics/:topicName" element={<TopicProblems />} />
                <Route path="/problems" element={<ProblemList />} />
                <Route path="/problems/:id" element={<ProblemDetail user={user} />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center p-6 relative overflow-hidden">
            {/* Ambient glow orbs */}
            <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-indigo-500/8 rounded-full blur-[120px] -z-10 pointer-events-none animate-pulse"></div>
            <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-purple-600/8 rounded-full blur-[100px] -z-10 pointer-events-none animate-pulse" style={{ animationDelay: '1s' }}></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-[150px] -z-10 pointer-events-none"></div>
            <SignIn onSignIn={handleSignIn} />
          </div>
        )}
      </div>
    </BrowserRouter>
  )
}
