import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import problemService from '../services/problemService';

export default function TopicProblems() {
  const { topicName } = useParams();
  const navigate = useNavigate();
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDifficulty, setSelectedDifficulty] = useState('');

  useEffect(() => {
    loadProblems();
  }, [topicName]);

  const loadProblems = async () => {
    try {
      setLoading(true);
      const data = await problemService.getAllProblems();
      const topicProblems = data.filter(p => p.topic === decodeURIComponent(topicName));
      setProblems(topicProblems);
    } catch (error) {
      console.error('Error loading problems:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDifficultyColor = (difficulty) => {
    const diffLower = difficulty?.toLowerCase();
    const colors = {
      easy: 'bg-green-100 text-green-800 border-green-200',
      medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      hard: 'bg-red-100 text-red-800 border-red-200'
    };
    return colors[diffLower] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const capitalizeFirst = (str) => {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  const getTopicIcon = (topic) => {
    const icons = {
      'Array': '📊',
      'String': '📝',
      'Tree': '🌳',
      'Graph': '🕸️',
      'Dynamic Programming': '🎯',
      'Greedy': '💰',
      'Backtracking': '🔄',
      'Binary Search': '🔍',
      'Sorting': '📈',
      'Hash Table': '#️⃣',
      'Stack': '📚',
      'Queue': '🎫',
      'Linked List': '🔗',
      'Math': '🔢',
      'Bit Manipulation': '💾',
      'Two Pointers': '👉',
      'Sliding Window': '🪟',
      'Heap': '⛰️',
      'Trie': '🌲',
      'Union Find': '🤝',
    };
    return icons[topic] || '💡';
  };

  const filteredProblems = selectedDifficulty
    ? problems.filter(p => p.difficulty?.toLowerCase() === selectedDifficulty)
    : problems;

  const easyCount = problems.filter(p => p.difficulty?.toLowerCase() === 'easy').length;
  const mediumCount = problems.filter(p => p.difficulty?.toLowerCase() === 'medium').length;
  const hardCount = problems.filter(p => p.difficulty?.toLowerCase() === 'hard').length;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading problems...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <button
            onClick={() => navigate('/')}
            className="flex items-center text-blue-600 hover:text-blue-700 mb-4 font-medium"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Topics
          </button>

          <div className="flex items-center gap-4 mb-4">
            <span className="text-5xl">{getTopicIcon(decodeURIComponent(topicName))}</span>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {decodeURIComponent(topicName)}
              </h1>
              <p className="text-gray-600 mt-1">
                {problems.length} {problems.length === 1 ? 'problem' : 'problems'} available
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="flex gap-4 mt-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span className="text-sm text-gray-600">Easy: <span className="font-semibold">{easyCount}</span></span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <span className="text-sm text-gray-600">Medium: <span className="font-semibold">{mediumCount}</span></span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <span className="text-sm text-gray-600">Hard: <span className="font-semibold">{hardCount}</span></span>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-wrap items-center gap-4">
            <span className="text-sm font-semibold text-gray-700">Filter by Difficulty:</span>
            <div className="flex gap-2">
              <button
                onClick={() => setSelectedDifficulty('')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  selectedDifficulty === ''
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All ({problems.length})
              </button>
              <button
                onClick={() => setSelectedDifficulty('easy')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  selectedDifficulty === 'easy'
                    ? 'bg-green-600 text-white shadow-md'
                    : 'bg-green-50 text-green-700 hover:bg-green-100'
                }`}
              >
                Easy ({easyCount})
              </button>
              <button
                onClick={() => setSelectedDifficulty('medium')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  selectedDifficulty === 'medium'
                    ? 'bg-yellow-600 text-white shadow-md'
                    : 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100'
                }`}
              >
                Medium ({mediumCount})
              </button>
              <button
                onClick={() => setSelectedDifficulty('hard')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  selectedDifficulty === 'hard'
                    ? 'bg-red-600 text-white shadow-md'
                    : 'bg-red-50 text-red-700 hover:bg-red-100'
                }`}
              >
                Hard ({hardCount})
              </button>
            </div>
          </div>
        </div>

        {/* Problems List */}
        <div className="space-y-3">
          {filteredProblems.map((problem, index) => (
            <div
              key={problem.id}
              onClick={() => navigate(`/problems/${problem.id}`)}
              className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md hover:border-blue-300 transition-all cursor-pointer group"
            >
              <div className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-gray-500 font-medium text-sm">#{index + 1}</span>
                      <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                        {problem.title}
                      </h3>
                    </div>
                    
                    {problem.description_preview && (
                      <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                        {problem.description_preview}
                      </p>
                    )}

                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getDifficultyColor(problem.difficulty)}`}>
                        {capitalizeFirst(problem.difficulty)}
                      </span>
                      <span className="text-xs text-gray-500">
                        Problem ID: {problem.problem_id}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center text-blue-600 group-hover:text-blue-700">
                    <svg
                      className="w-6 h-6 transform group-hover:translate-x-1 transition-transform"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredProblems.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-200">
            <p className="text-gray-500 text-lg">No problems found with the selected difficulty.</p>
          </div>
        )}
      </div>
    </div>
  );
}

