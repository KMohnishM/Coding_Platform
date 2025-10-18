import React, { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import ProblemList from './pages/ProblemList'
import ProblemDetailNew from './pages/ProblemDetailNew'
import './styles/globals.css'

export default function App() {
  const [user, setUser] = useState({ username: 'test', id: 1 }) // Temporary user for testing

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">HintSys</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">Welcome, {user.username}</span>
            </div>
          </div>
        </div>
      </nav>
      
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<ProblemList />} />
          <Route path="/problems/:id" element={<ProblemDetailNew />} />
        </Routes>
      </BrowserRouter>
    </div>
  )
}
