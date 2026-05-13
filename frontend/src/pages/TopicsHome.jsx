import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import problemService from '../services/problemService';

export default function TopicsHome() {
  const [problems, setProblems] = useState([]);
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDifficulty, setSelectedDifficulty] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    loadProblems();
  }, []);

  const loadProblems = async () => {
    try {
      setLoading(true);
      const data = await problemService.getAllProblems();
      setProblems(data);
      
      // Extract unique topics
      const uniqueTopics = [...new Set(data.map(p => p.topic).filter(Boolean))];
      setTopics(uniqueTopics.sort());
    } catch (error) {
      console.error('Error loading problems:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTopicStats = (topic) => {
    const topicProblems = problems.filter(p => p.topic === topic);
    const total = topicProblems.length;
    const easy = topicProblems.filter(p => p.difficulty?.toLowerCase() === 'easy').length;
    const medium = topicProblems.filter(p => p.difficulty?.toLowerCase() === 'medium').length;
    const hard = topicProblems.filter(p => p.difficulty?.toLowerCase() === 'hard').length;
    
    return { total, easy, medium, hard };
  };

  const getTopicColor = (topic) => {
    const colors = [
      'from-blue-500 to-blue-600',
      'from-purple-500 to-purple-600',
      'from-pink-500 to-pink-600',
      'from-indigo-500 to-indigo-600',
      'from-cyan-500 to-cyan-600',
      'from-teal-500 to-teal-600',
      'from-emerald-500 to-emerald-600',
      'from-orange-500 to-orange-600',
      'from-red-500 to-red-600',
      'from-yellow-500 to-yellow-600',
      'from-green-500 to-green-600',
      'from-violet-500 to-violet-600',
    ];
    const index = topic ? topic.charCodeAt(0) % colors.length : 0;
    return colors[index];
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

  const filteredTopics = selectedDifficulty
    ? topics.filter(topic => {
        const stats = getTopicStats(topic);
        return stats[selectedDifficulty] > 0;
      })
    : topics;

  const totalProblems = problems.length;
  const totalEasy = problems.filter(p => p.difficulty?.toLowerCase() === 'easy').length;
  const totalMedium = problems.filter(p => p.difficulty?.toLowerCase() === 'medium').length;
  const totalHard = problems.filter(p => p.difficulty?.toLowerCase() === 'hard').length;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading topics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-5xl font-bold mb-4">
              🚀 Master Coding Challenges
            </h1>
            <p className="text-xl text-blue-100 mb-8">
              Choose a topic and start solving problems with intelligent hints
            </p>
            
            {/* Stats Overview */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <div className="text-3xl font-bold">{totalProblems}</div>
                <div className="text-sm text-blue-100">Total Problems</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <div className="text-3xl font-bold text-green-300">{totalEasy}</div>
                <div className="text-sm text-blue-100">Easy</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <div className="text-3xl font-bold text-yellow-300">{totalMedium}</div>
                <div className="text-sm text-blue-100">Medium</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <div className="text-3xl font-bold text-red-300">{totalHard}</div>
                <div className="text-sm text-blue-100">Hard</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
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
                All Topics
              </button>
              <button
                onClick={() => setSelectedDifficulty('easy')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  selectedDifficulty === 'easy'
                    ? 'bg-green-600 text-white shadow-md'
                    : 'bg-green-50 text-green-700 hover:bg-green-100'
                }`}
              >
                Easy
              </button>
              <button
                onClick={() => setSelectedDifficulty('medium')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  selectedDifficulty === 'medium'
                    ? 'bg-yellow-600 text-white shadow-md'
                    : 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100'
                }`}
              >
                Medium
              </button>
              <button
                onClick={() => setSelectedDifficulty('hard')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  selectedDifficulty === 'hard'
                    ? 'bg-red-600 text-white shadow-md'
                    : 'bg-red-50 text-red-700 hover:bg-red-100'
                }`}
              >
                Hard
              </button>
            </div>
          </div>
        </div>

        {/* Topics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTopics.map((topic) => {
            const stats = getTopicStats(topic);
            const gradientColor = getTopicColor(topic);
            const icon = getTopicIcon(topic);

            return (
              <div
                key={topic}
                onClick={() => navigate(`/topics/${encodeURIComponent(topic)}`)}
                className="group cursor-pointer"
              >
                <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-200 hover:border-transparent hover:-translate-y-1">
                  {/* Card Header with Gradient */}
                  <div className={`bg-gradient-to-r ${gradientColor} p-6 text-white`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-4xl">{icon}</span>
                      <span className="text-2xl font-bold">{stats.total}</span>
                    </div>
                    <h3 className="text-xl font-bold">{topic}</h3>
                  </div>

                  {/* Card Body */}
                  <div className="p-6">
                    <div className="space-y-3">
                      {/* Difficulty Breakdown */}
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Easy</span>
                        <div className="flex items-center gap-2">
                          <div className="w-24 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-green-500 h-2 rounded-full transition-all"
                              style={{ width: `${(stats.easy / stats.total) * 100}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-semibold text-green-600 w-8 text-right">
                            {stats.easy}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Medium</span>
                        <div className="flex items-center gap-2">
                          <div className="w-24 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-yellow-500 h-2 rounded-full transition-all"
                              style={{ width: `${(stats.medium / stats.total) * 100}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-semibold text-yellow-600 w-8 text-right">
                            {stats.medium}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Hard</span>
                        <div className="flex items-center gap-2">
                          <div className="w-24 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-red-500 h-2 rounded-full transition-all"
                              style={{ width: `${(stats.hard / stats.total) * 100}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-semibold text-red-600 w-8 text-right">
                            {stats.hard}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Call to Action */}
                    <div className="mt-6 pt-4 border-t border-gray-200">
                      <div className="flex items-center justify-between text-blue-600 group-hover:text-blue-700">
                        <span className="font-medium">Start Solving</span>
                        <svg
                          className="w-5 h-5 transform group-hover:translate-x-1 transition-transform"
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
              </div>
            );
          })}
        </div>

        {filteredTopics.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No topics found with the selected difficulty.</p>
          </div>
        )}
      </div>
    </div>
  );
}

