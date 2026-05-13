import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import problemService from '../services/problemService';

export default function ProblemList({ onOpen }) {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('');
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'topics'
  const navigate = useNavigate();

  useEffect(() => {
    loadProblems();
  }, []);

  const loadProblems = async () => {
    try {
      setLoading(true);
      const data = await problemService.getAllProblems();
      setProblems(data);
    } catch (error) {
      console.error('Error loading problems:', error);
      // Fallback data if backend is not available
      setProblems([
        { id: 1, title: 'Two Sum', difficulty: 'Easy', topic: 'Arrays' },
        { id: 2, title: 'Add Two Numbers', difficulty: 'Medium', topic: 'Linked Lists' },
        { id: 3, title: 'Longest Substring Without Repeating Characters', difficulty: 'Medium', topic: 'Strings' },
        { id: 4, title: 'Median of Two Sorted Arrays', difficulty: 'Hard', topic: 'Arrays' },
        { id: 5, title: 'Longest Palindromic Substring', difficulty: 'Medium', topic: 'Strings' },
        { id: 6, title: 'Zigzag Conversion', difficulty: 'Medium', topic: 'Strings' },
        { id: 7, title: 'Reverse Integer', difficulty: 'Easy', topic: 'Math' },
        { id: 8, title: 'String to Integer (atoi)', difficulty: 'Medium', topic: 'Strings' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const topics = [...new Set(problems.map(p => p.topic))].filter(Boolean).sort();
  const difficulties = ['easy', 'medium', 'hard'];

  const filteredProblems = problems.filter(problem => {
    const matchesSearch = problem.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTopic = !selectedTopic || problem.topic === selectedTopic;
    const matchesDifficulty = !selectedDifficulty || problem.difficulty.toLowerCase() === selectedDifficulty.toLowerCase();
    return matchesSearch && matchesTopic && matchesDifficulty;
  });

  const getDifficultyColor = (difficulty) => {
    const diffLower = difficulty?.toLowerCase();
    const colors = {
      easy: 'bg-green-100 text-green-800 border-green-200',
      medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      hard: 'bg-red-100 text-red-800 border-red-200'
    };
    return colors[diffLower] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getTopicColor = (topic) => {
    // Generate consistent colors for topics
    const colors = [
      'bg-blue-100 text-blue-800 border-blue-200',
      'bg-purple-100 text-purple-800 border-purple-200',
      'bg-pink-100 text-pink-800 border-pink-200',
      'bg-indigo-100 text-indigo-800 border-indigo-200',
      'bg-cyan-100 text-cyan-800 border-cyan-200',
      'bg-teal-100 text-teal-800 border-teal-200',
      'bg-emerald-100 text-emerald-800 border-emerald-200',
      'bg-orange-100 text-orange-800 border-orange-200',
    ];
    const index = topic ? topic.charCodeAt(0) % colors.length : 0;
    return colors[index];
  };

  const capitalizeFirst = (str) => {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  const handleProblemClick = (problem) => {
    // Ensure problem has a description (use a default if not present)
    if (!problem.description) {
      if (problem.title === "Two Sum") {
        problem.description = "<h2>Two Sum</h2><p>Given an array of integers <code>nums</code> and an integer <code>target</code>, return indices of the two numbers such that they add up to <code>target</code>.</p><p>You may assume that each input would have exactly one solution, and you may not use the same element twice.</p><p>You can return the answer in any order.</p><h3>Example 1:</h3><pre>Input: nums = [2,7,11,15], target = 9<br>Output: [0,1]<br>Explanation: Because nums[0] + nums[1] == 9, we return [0, 1].</pre>";
        problem.starting_code = "function twoSum(nums, target) {\n    // Write your code here\n}";
      }
    }
    
    if (onOpen) {
      // Split-pane mode: update the right panel
      window.__openProblem = problem;
      onOpen(problem);
      // Also dispatch the event directly for immediate feedback
      window.dispatchEvent(new CustomEvent('openProblem', { detail: problem }));
    } else {
      // Full-page mode: navigate to problem detail
      navigate(`/problems/${problem.id}`);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Programming Problems</h1>
            <p className="text-gray-600">Practice coding problems with intelligent hint generation</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('list')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'list'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              List View
            </button>
            <button
              onClick={() => setViewMode('topics')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'topics'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Topic View
            </button>
          </div>
        </div>
      </div>

      {/* Topic Statistics */}
      {viewMode === 'list' && topics.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Topics Overview</h3>
          <div className="flex flex-wrap gap-2">
            {topics.map(topic => {
              const count = problems.filter(p => p.topic === topic).length;
              return (
                <button
                  key={topic}
                  onClick={() => setSelectedTopic(selectedTopic === topic ? '' : topic)}
                  className={`px-3 py-1.5 text-sm font-medium rounded-lg border transition-all ${
                    selectedTopic === topic
                      ? 'bg-blue-600 text-white border-blue-600'
                      : `${getTopicColor(topic)} hover:shadow-md`
                  }`}
                >
                  {topic} <span className="ml-1 opacity-75">({count})</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search problems..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Topic Filter */}
          <select
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={selectedTopic}
            onChange={(e) => setSelectedTopic(e.target.value)}
          >
            <option value="">All Topics</option>
            {topics.map(topic => (
              <option key={topic} value={topic}>{topic}</option>
            ))}
          </select>

          {/* Difficulty Filter */}
          <select
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(e.target.value)}
          >
            <option value="">All Difficulties</option>
            {difficulties.map(difficulty => (
              <option key={difficulty} value={difficulty}>{capitalizeFirst(difficulty)}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Problems Display */}
      {viewMode === 'list' ? (
        /* List View */
        <div className="grid grid-cols-1 gap-4">
          {filteredProblems.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-500 text-lg">No problems found</div>
              <p className="text-gray-400 mt-2">Try adjusting your search criteria</p>
            </div>
          ) : (
            filteredProblems.map((problem) => (
              <div
                key={problem.id}
                className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => handleProblemClick(problem)}
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors">
                    {problem.title}
                  </h3>
                  <span className={`px-3 py-1 text-xs font-medium rounded-full border ${getDifficultyColor(problem.difficulty)}`}>
                    {capitalizeFirst(problem.difficulty)}
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 text-xs font-medium rounded border ${getTopicColor(problem.topic)}`}>
                      {problem.topic}
                    </span>
                  </div>
                  {problem.acceptance_rate && (
                    <span className="text-gray-500 text-xs">
                      {Math.round(problem.acceptance_rate * 100)}% acceptance
                    </span>
                  )}
                </div>

                {problem.description_preview && (
                  <p className="text-gray-600 text-sm mt-3 line-clamp-2">
                    {problem.description_preview}
                  </p>
                )}
              </div>
            ))
          )}
        </div>
      ) : (
        /* Topic View */
        <div className="space-y-8">
          {filteredProblems.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-500 text-lg">No problems found</div>
              <p className="text-gray-400 mt-2">Try adjusting your search criteria</p>
            </div>
          ) : (
            topics
              .filter(topic => filteredProblems.some(p => p.topic === topic))
              .map(topic => {
                const topicProblems = filteredProblems.filter(p => p.topic === topic);
                return (
                  <div key={topic} className="bg-white border border-gray-200 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                        <span className={`px-3 py-1 text-sm font-medium rounded border ${getTopicColor(topic)}`}>
                          {topic}
                        </span>
                        <span className="text-gray-500 text-sm font-normal">
                          ({topicProblems.length} problem{topicProblems.length !== 1 ? 's' : ''})
                        </span>
                      </h2>
                    </div>
                    <div className="grid grid-cols-1 gap-3">
                      {topicProblems.map((problem) => (
                        <div
                          key={problem.id}
                          className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer hover:border-blue-300"
                          onClick={() => handleProblemClick(problem)}
                        >
                          <div className="flex items-center justify-between">
                            <h3 className="text-base font-semibold text-gray-900 hover:text-blue-600 transition-colors">
                              {problem.title}
                            </h3>
                            <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getDifficultyColor(problem.difficulty)}`}>
                              {capitalizeFirst(problem.difficulty)}
                            </span>
                          </div>
                          {problem.description_preview && (
                            <p className="text-gray-600 text-sm mt-2 line-clamp-1">
                              {problem.description_preview}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })
          )}
        </div>
      )}

      {/* Results Summary */}
      <div className="mt-6 text-center text-sm text-gray-500">
        Showing {filteredProblems.length} of {problems.length} problems
      </div>
    </div>
  );
}