import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import problemService from '../services/problemService';

export default function ProblemList() {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [solvedList, setSolvedList] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState('');
  const [sortDirection, setSortDirection] = useState('asc');
  const itemsPerPage = 50;
  const navigate = useNavigate();

  useEffect(() => {
    loadProblems();
    loadSolvedList();
  }, []);

  // Reset to first page on filter, search, status, or sorting change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedTopic, selectedDifficulty, selectedStatus, sortField, sortDirection]);

  const loadSolvedList = () => {
    try {
      const stored = JSON.parse(localStorage.getItem('solvedProblems') || '[]');
      setSolvedList(stored);
    } catch (e) {
      console.error(e);
    }
  };

  const loadProblems = async () => {
    try {
      setLoading(true);
      const data = await problemService.getAllProblems();
      setProblems(data);
    } catch (error) {
      console.error('Error loading problems:', error);
    } finally {
      setLoading(false);
    }
  };

  const topics = [...new Set(problems.map(p => p.topic))].filter(Boolean).sort();
  const difficulties = ['easy', 'medium', 'hard'];

  const isSolved = (problem) => {
    return solvedList.includes(problem.problem_id) || solvedList.includes(problem.id?.toString());
  };

  const filteredProblems = problems.filter(problem => {
    const matchesSearch = problem.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          problem.problem_id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTopic = !selectedTopic || problem.topic === selectedTopic;
    const matchesDifficulty = !selectedDifficulty || problem.difficulty.toLowerCase() === selectedDifficulty.toLowerCase();
    
    const solved = isSolved(problem);
    const matchesStatus = !selectedStatus || 
      (selectedStatus === 'solved' && solved) || 
      (selectedStatus === 'unsolved' && !solved);

    return matchesSearch && matchesTopic && matchesDifficulty && matchesStatus;
  });

  const sortedProblems = [...filteredProblems].sort((a, b) => {
    if (!sortField) return 0;
    
    let aVal, bVal;
    if (sortField === 'title') {
      aVal = a.title.toLowerCase();
      bVal = b.title.toLowerCase();
    } else if (sortField === 'difficulty') {
      const diffWeight = { easy: 1, medium: 2, hard: 3 };
      aVal = diffWeight[a.difficulty.toLowerCase()] || 0;
      bVal = diffWeight[b.difficulty.toLowerCase()] || 0;
    } else if (sortField === 'acceptance_rate') {
      aVal = a.acceptance_rate ? a.acceptance_rate * 100 : (45 + (a.title.charCodeAt(0) % 35));
      bVal = b.acceptance_rate ? b.acceptance_rate * 100 : (45 + (b.title.charCodeAt(0) % 35));
    } else if (sortField === 'topic') {
      aVal = (a.topic || '').toLowerCase();
      bVal = (b.topic || '').toLowerCase();
    } else {
      return 0;
    }
    
    if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  // Pagination bounds
  const totalPages = Math.ceil(sortedProblems.length / itemsPerPage);
  const currentProblems = sortedProblems.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const renderSortIndicator = (field) => {
    if (sortField !== field) {
      return (
        <svg className="w-3 h-3 text-slate-600 inline ml-1 opacity-0 group-hover/header:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      );
    }
    return sortDirection === 'asc' ? (
      <svg className="w-3 h-3 text-indigo-400 inline ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
      </svg>
    ) : (
      <svg className="w-3 h-3 text-indigo-400 inline ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
      </svg>
    );
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy': return 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/25 px-2.5 py-0.5 rounded-full font-bold';
      case 'medium': return 'text-amber-400 bg-amber-500/10 border border-amber-500/25 px-2.5 py-0.5 rounded-full font-bold';
      case 'hard': return 'text-red-400 bg-red-500/10 border border-red-500/25 px-2.5 py-0.5 rounded-full font-bold';
      default: return 'text-slate-400';
    }
  };

  const getTopicStyle = (topic) => {
    return 'bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 px-2.5 py-0.5 rounded-full text-[10px] font-bold';
  };

  const capitalizeFirst = (str) => {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[var(--bg-base)]">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-indigo-500 mx-auto"></div>
          <p className="text-[#8b949e] text-xs font-semibold tracking-widest uppercase">Loading catalog data...</p>
        </div>
      </div>
    );
  }

  // Calculate metrics
  const totalSolved = solvedList.length;
  const easySolved = problems.filter(p => isSolved(p) && p.difficulty?.toLowerCase() === 'easy').length;
  const mediumSolved = problems.filter(p => isSolved(p) && p.difficulty?.toLowerCase() === 'medium').length;
  const hardSolved = problems.filter(p => isSolved(p) && p.difficulty?.toLowerCase() === 'hard').length;

  return (
    <div className="flex-1 overflow-auto bg-[var(--bg-base)] pb-16 relative">
      <div className="bg-grid-overlay" />
      <div className="bg-dot-overlay" />

      {/* Glow highlight */}
      <div className="absolute top-0 right-1/4 w-[400px] h-[300px] bg-indigo-500/5 rounded-full blur-[100px] pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header & Stats Banner */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-end mb-8">
          <div className="lg:col-span-7">
            <h1 className="text-3xl font-black text-white tracking-tight">Problems Catalog</h1>
            <p className="text-[#8b949e] text-xs font-bold uppercase tracking-wider mt-1">
              {filteredProblems.length} challenges found / {problems.length} total
            </p>
          </div>
          
          {/* Quick Solve Stats */}
          <div className="lg:col-span-5 flex justify-end gap-3 w-full">
            <div className="bg-[var(--bg-surface)]/50 border border-[var(--border)] py-3 px-4 rounded-xl flex items-center gap-3 shadow-sm flex-1 max-w-[280px]">
              <div className="relative w-10 h-10 flex items-center justify-center flex-shrink-0">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="20" cy="20" r="17" className="stroke-slate-800" strokeWidth="3" fill="transparent" />
                  <circle cx="20" cy="20" r="17" className="stroke-indigo-500" strokeWidth="3" fill="transparent" 
                    strokeDasharray={2 * Math.PI * 17}
                    strokeDashoffset={2 * Math.PI * 17 * (1 - (totalSolved / Math.max(1, problems.length)))}
                    strokeLinecap="round"
                  />
                </svg>
                <span className="absolute text-[10px] font-black text-white">{totalSolved}</span>
              </div>
              <div className="text-left leading-tight">
                <span className="text-[10px] text-slate-500 font-bold uppercase block tracking-wider">Solved Progress</span>
                <span className="text-xs font-black text-slate-300">
                  E: <span className="text-emerald-400 font-bold">{easySolved}</span> • 
                  M: <span className="text-amber-400 font-bold">{mediumSolved}</span> • 
                  H: <span className="text-red-400 font-bold">{hardSolved}</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Filter bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {/* Search */}
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <svg className="h-4 w-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </span>
            <input
              type="text"
              placeholder="Search problem title..."
              className="w-full pl-10 pr-4 py-2.5 bg-[var(--bg-surface)]/60 border border-[var(--border)] rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500/50 transition-all text-xs"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Topic */}
          <select
            aria-label="Filter by topic"
            className="w-full px-4 py-2.5 bg-[var(--bg-surface)]/60 border border-[var(--border)] rounded-xl text-slate-300 focus:outline-none focus:border-indigo-500/50 transition-all text-xs cursor-pointer select-none"
            value={selectedTopic}
            onChange={(e) => setSelectedTopic(e.target.value)}
          >
            <option value="">All Topics</option>
            {topics.map(topic => (
              <option key={topic} value={topic}>{topic}</option>
            ))}
          </select>

          {/* Difficulty */}
          <select
            aria-label="Filter by difficulty"
            className="w-full px-4 py-2.5 bg-[var(--bg-surface)]/60 border border-[var(--border)] rounded-xl text-slate-300 focus:outline-none focus:border-indigo-500/50 transition-all text-xs cursor-pointer select-none"
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(e.target.value)}
          >
            <option value="">All Difficulties</option>
            {difficulties.map(diff => (
              <option key={diff} value={diff}>{capitalizeFirst(diff)}</option>
            ))}
          </select>

          {/* Status */}
          <select
            aria-label="Filter by status"
            className="w-full px-4 py-2.5 bg-[var(--bg-surface)]/60 border border-[var(--border)] rounded-xl text-slate-300 focus:outline-none focus:border-indigo-500/50 transition-all text-xs cursor-pointer select-none"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="solved">Solved</option>
            <option value="unsolved">Unsolved</option>
          </select>
        </div>

        {/* LeetCode-style Problem Table */}
        <div className="bg-[var(--bg-surface)]/30 border border-[var(--border)] rounded-2xl overflow-hidden shadow-2xl backdrop-blur-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[var(--border)] select-none bg-[var(--bg-surface)]/60">
                  <th className="py-4 px-6 w-16 text-center text-xs uppercase tracking-wider text-slate-500 font-medium">Status</th>
                  <th 
                    onClick={() => handleSort('title')}
                    className="py-4 px-4 min-w-[200px] cursor-pointer hover:bg-slate-800/40 transition-colors group/header text-xs uppercase tracking-wider text-slate-500 font-medium"
                  >
                    Title {renderSortIndicator('title')}
                  </th>
                  <th 
                    onClick={() => handleSort('topic')}
                    className="py-4 px-4 w-44 cursor-pointer hover:bg-slate-800/40 transition-colors group/header text-xs uppercase tracking-wider text-slate-500 font-medium"
                  >
                    Category {renderSortIndicator('topic')}
                  </th>
                  <th 
                    onClick={() => handleSort('difficulty')}
                    className="py-4 px-4 w-32 cursor-pointer hover:bg-slate-800/40 transition-colors group/header text-xs uppercase tracking-wider text-slate-500 font-medium"
                  >
                    Difficulty {renderSortIndicator('difficulty')}
                  </th>
                  <th 
                    onClick={() => handleSort('acceptance_rate')}
                    className="py-4 px-6 w-28 text-right cursor-pointer hover:bg-slate-800/40 transition-colors group/header text-xs uppercase tracking-wider text-slate-500 font-medium"
                  >
                    Acceptance {renderSortIndicator('acceptance_rate')}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]/50 font-medium">
                {currentProblems.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-16 text-center text-slate-500 font-bold uppercase tracking-widest text-[10px]">
                      No coding challenges match your search filters.
                    </td>
                  </tr>
                ) : (
                  currentProblems.map((problem) => {
                    const solved = isSolved(problem);
                    return (
                      <tr 
                        key={problem.id}
                        role="button"
                        onClick={() => navigate(`/problems/${problem.id}`)}
                        className="hover:bg-white/[0.02] border-l-2 border-l-transparent hover:border-l-indigo-500 cursor-pointer transition-all duration-300 group"
                      >
                        {/* Status Checkmark */}
                        <td className="py-3.5 px-6 text-center">
                          {solved ? (
                            <div className="w-5 h-5 rounded-full bg-green-500/10 border border-green-500/30 flex items-center justify-center text-green-400 mx-auto shadow-sm shadow-green-500/5">
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                          ) : (
                            <div className="w-4 h-4 rounded-full border border-slate-700/60 mx-auto group-hover:border-slate-500 transition-colors" />
                          )}
                        </td>

                        {/* Title link */}
                        <td className="py-3.5 px-4 text-sm font-medium text-slate-200 group-hover:text-indigo-400 transition-colors">
                          {problem.title}
                        </td>

                        {/* Category badge */}
                        <td className="py-3.5 px-4">
                          <span className={getTopicStyle(problem.topic)}>
                            {problem.topic}
                          </span>
                        </td>

                        {/* Difficulty label */}
                        <td className="py-3.5 px-4">
                          <span className={getDifficultyColor(problem.difficulty)}>
                            {capitalizeFirst(problem.difficulty)}
                          </span>
                        </td>

                        {/* Acceptance rate */}
                        <td className="py-3.5 px-6 text-right text-slate-400 font-bold">
                          {problem.acceptance_rate 
                            ? `${Math.round(problem.acceptance_rate * 100)}%` 
                            : `${45 + (problem.title.charCodeAt(0) % 35)}%`
                          }
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* LeetCode-style Pagination Bar */}
        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6">
            <span className="text-xs text-[#8b949e] font-bold">
              Showing page {currentPage} of {totalPages}
            </span>

            <div className="flex items-center gap-1.5 bg-[var(--bg-surface)] p-1.5 border border-[var(--border)] rounded-xl shadow-xl select-none">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg text-slate-400 hover:text-slate-100 disabled:opacity-30 disabled:hover:text-slate-400 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              
              {/* Pagination Numbers */}
              {Array.from({ length: Math.min(5, totalPages) }, (_, idx) => {
                let pageNum = currentPage - 2 + idx;
                if (currentPage <= 2) pageNum = idx + 1;
                else if (currentPage >= totalPages - 1) pageNum = totalPages - 4 + idx;
                
                if (pageNum <= 0 || pageNum > totalPages) return null;
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-8 h-8 rounded-lg text-xs font-black transition-all ${
                      currentPage === pageNum
                        ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/40 shadow-md shadow-indigo-500/5'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}

              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg text-slate-400 hover:text-slate-100 disabled:opacity-30 disabled:hover:text-slate-400 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}