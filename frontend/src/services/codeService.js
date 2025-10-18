import apiClient from './apiClient';

/**
 * Service for handling code execution and submission
 * Note: These endpoints need to be implemented on the backend
 */
const codeService = {
  /**
   * Run code against test cases
   * @param {number} userId - The user ID
   * @param {number} problemId - The problem ID
   * @param {string} code - The code to run
   * @param {string} language - The programming language
   * @returns {Promise<Object>} - Promise resolving to execution results
   */
  runCode: async (userId, problemId, code, language) => {
    return apiClient.post('/code/run/', {
      user_id: userId,
      problem_id: problemId,
      code,
      language
    });
  },
  
  /**
   * Submit a solution for a problem
   * @param {number} userId - The user ID
   * @param {number} problemId - The problem ID
   * @param {string} code - The solution code
   * @param {string} language - The programming language
   * @returns {Promise<Object>} - Promise resolving to submission results
   */
  submitSolution: async (userId, problemId, code, language) => {
    return apiClient.post('/code/submit/', {
      user_id: userId,
      problem_id: problemId,
      code,
      language
    });
  }
};

export default codeService;