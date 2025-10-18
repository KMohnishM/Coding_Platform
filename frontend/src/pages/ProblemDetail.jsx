import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeftIcon, PlayIcon, CheckIcon, LightBulbIcon } from '@heroicons/react/24/outline';
import MonacoEditor from '../components/MonacoEditor';
import problemService from '../services/problemService';
import hintService from '../services/hintService';
import codeService from '../services/codeService';

// Helper function to determine the language for a problem
const getLanguageForProblem = (problem) => {
  if (!problem) return 'javascript';
  // Default to JavaScript if no specific language is detected
  return problem.language || 'javascript';
};

export default function ProblemDetail({ user }) {
  const { id } = useParams();
  const navigate = useNavigate();
  // Define refs at the top with other hooks to maintain consistent hook order
  const splitPaneRef = useRef(null);
  const resizeHandleRef = useRef(null);
  
  const [problem, setProblem] = useState(window.__openProblem || null)
  const [code, setCode] = useState(problem ? problem.starting_code : '')
  const [hints, setHints] = useState([])
  const [loadingHint, setLoadingHint] = useState(false)
  const [loadingProblem, setLoadingProblem] = useState(false)
  const [error, setError] = useState(null)
  const [loadingRun, setLoadingRun] = useState(false)
  const [runResult, setRunResult] = useState(null)
  const [running, setRunning] = useState(false)
  const [results, setResults] = useState(null)
  const [submittedResults, setSubmittedResults] = useState(null)
  const [showNotification, setShowNotification] = useState(false)
  const [notification, setNotification] = useState({ type: '', message: '' })
  const [language, setLanguage] = useState(() => problem ? getLanguageForProblem(problem) : 'javascript')

  // Subscribe to problem open events
  useEffect(() => {
    function onOpen(e){
      const p = e.detail
      setProblem(p)
      setCode(p.starting_code || '')
      setLanguage(getLanguageForProblem(p))
      setHints([])
      setResults(null)
      setSubmittedResults(null)
    }
    
    window.addEventListener('openProblem', onOpen)
    return () => window.removeEventListener('openProblem', onOpen)
  }, [])
  
  // Fetch problem if we have an ID but no problem
  useEffect(() => {
    if (id && !problem && !window.__openProblem) {
      // Fetch the problem by ID from the API
      const fetchProblemById = async () => {
        try {
          setLoadingProblem(true)
          const data = await problemService.getProblemById(id)
          setProblem(data)
          setCode(data.starting_code || '')
          setLanguage(getLanguageForProblem(data))
          setError(null)
        } catch (err) {
          console.error('Error fetching problem:', err)
          // Create a fallback problem based on the ID (just for demo)
          const fallbackProblem = {
            id: parseInt(id),
            title: "Two Sum",
            difficulty: "Easy",
            topic: "Arrays",
            description: "<h2>Two Sum</h2><p>Given an array of integers <code>nums</code> and an integer <code>target</code>, return indices of the two numbers such that they add up to <code>target</code>.</p><p>You may assume that each input would have exactly one solution, and you may not use the same element twice.</p><p>You can return the answer in any order.</p><h3>Example 1:</h3><pre>Input: nums = [2,7,11,15], target = 9<br>Output: [0,1]<br>Explanation: Because nums[0] + nums[1] == 9, we return [0, 1].</pre>",
            starting_code: "function twoSum(nums, target) {\n    // Write your code here\n}",
          }
          setProblem(fallbackProblem)
          setCode(fallbackProblem.starting_code || '')
          setLanguage('javascript')
          setError(null)
        } finally {
          setLoadingProblem(false)
        }
      }
      
      fetchProblemById()
    }
  }, [id, problem])

  // Fetch problem details when component mounts
  useEffect(() => {
    const fetchProblem = async () => {
      try {
        setLoadingProblem(true)
        const data = await problemService.getProblemById(id)
        setProblem(data)
        setCode(data.starting_code || '')
        setError(null)
      } catch (err) {
        console.error('Error fetching problem:', err)
        setError('Failed to fetch problem details. Please try again.')
      } finally {
        setLoadingProblem(false)
      }
    }

    if (id) {
      fetchProblem()
    }
  }, [id])

  // Function to request a hint
  async function requestHint(){
    if (!user || !problem) return
    
    try {
      setLoadingHint(true)
      const result = await hintService.requestHint(
        user.id,
        problem.problem_id || problem.id,
        code,
        {
          title: problem.title,
          description: problem.description
        }
      )
      
      // Add the new hint to our hints array
      if (result && result.hint) {
        const newHint = {
          ...result.hint,
          timestamp: new Date().toISOString()
        }
        setHints(prevHints => [newHint, ...prevHints])
      }
    } catch (err) {
      console.error('Error requesting hint:', err)
      // Add error hint
      setHints(prevHints => [{
        content: `Error: ${err.message || 'Failed to get hint'}`,
        level: 'error',
        timestamp: new Date().toISOString()
      }, ...prevHints])
    } finally {
      setLoadingHint(false)
    }
  }

  // Function to run code
  async function runCode() {
    if (!user || !problem) return
    
    try {
      setLoadingRun(true)
      const result = await codeService.runCode(
        user.id,
        problem.problem_id || problem.id,
        code,
        language
      )
      setRunResult(result)
    } catch (err) {
      console.error('Error running code:', err)
      setRunResult({
        success: false,
        errors: [{
          message: err.message || 'Failed to run code',
          line: 1
        }]
      })
    } finally {
      setLoadingRun(false)
    }
  }

  // Function to submit solution
  async function submitSolution() {
    if (!user || !problem) return
    
    try {
      setLoadingRun(true)
      const result = await codeService.submitSolution(
        user.id,
        problem.problem_id || problem.id,
        code,
        language
      )
      setRunResult({
        ...result,
        isSubmission: true
      })
    } catch (err) {
      console.error('Error submitting solution:', err)
      setRunResult({
        success: false,
        errors: [{
          message: err.message || 'Failed to submit solution',
          line: 1
        }],
        isSubmission: true
      })
    } finally {
      setLoadingRun(false)
    }
  }

  // Loading state
  if (loadingProblem) {
    return <div className="container">Loading problem...</div>
  }

  // Error state
  if (error || !problem) {
    return <div className="container error">{error || 'Problem not found'}</div>
  }
  
  // Loading state
  if (loadingProblem) {
    return (
      <div className="problem-loading">
        <div className="spinner"></div>
        <h2>Loading problem...</h2>
      </div>
    );
  }

  // Error state
  if (error || !problem) {
    return (
      <div className="problem-error">
        <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="12"></line>
          <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
        <h2>Problem Not Found</h2>
        <p>{error || "We couldn't find this problem. It might have been moved or deleted."}</p>
        <Link to="/" className="return-button">Return to Problems</Link>
      </div>
    );
  }

  // Get difficulty badge color
  const getDifficultyColor = (difficulty) => {
    switch(difficulty?.toLowerCase()) {
      case 'easy': return 'var(--secondary-color)';
      case 'medium': return 'var(--warning-color)';
      case 'hard': return 'var(--danger-color)';
      default: return 'var(--primary-color)';
    }
  };

  return (
    <div className="problem-detail">
      <div className="problem-header">
        <div className="problem-header-content">
          <div className="problem-header-top">
            <Link to="/" className="back-button">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="19" y1="12" x2="5" y2="12"></line>
                <polyline points="12 19 5 12 12 5"></polyline>
              </svg>
              All Problems
            </Link>
            
            <div className="problem-meta">
              {problem.topic && (
                <span className="problem-topic">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
                    <polyline points="2 17 12 22 22 17"></polyline>
                    <polyline points="2 12 12 17 22 12"></polyline>
                  </svg>
                  {problem.topic}
                </span>
              )}
              
              {problem.difficulty && (
                <span className={`problem-difficulty difficulty-${problem.difficulty?.toLowerCase()}`}>
                  {problem.difficulty === 'Easy' ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 22C6.5 22 2 17.5 2 12S6.5 2 12 2s10 4.5 10 10-4.5 10-10 10z"></path>
                      <path d="M8 14s1.5 2 4 2 4-2 4-2"></path>
                      <line x1="9" y1="9" x2="9.01" y2="9"></line>
                      <line x1="15" y1="9" x2="15.01" y2="9"></line>
                    </svg>
                  ) : problem.difficulty === 'Medium' ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 22C6.5 22 2 17.5 2 12S6.5 2 12 2s10 4.5 10 10-4.5 10-10 10z"></path>
                      <line x1="8" y1="12" x2="16" y2="12"></line>
                      <line x1="9" y1="9" x2="9.01" y2="9"></line>
                      <line x1="15" y1="9" x2="15.01" y2="9"></line>
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 22C6.5 22 2 17.5 2 12S6.5 2 12 2s10 4.5 10 10-4.5 10-10 10z"></path>
                      <path d="M16 16s-1.5-2-4-2-4 2-4 2"></path>
                      <line x1="9" y1="9" x2="9.01" y2="9"></line>
                      <line x1="15" y1="9" x2="15.01" y2="9"></line>
                    </svg>
                  )}
                  {problem.difficulty}
                </span>
              )}
            </div>
          </div>
          
          <h1 className="problem-title">{problem.title}</h1>
        </div>
      </div>

      <div className="split-pane" ref={splitPaneRef}>
        <div className="problem-description-panel">
          <div className="panel-content">
            <div className="description-content">
              {problem.description ? (
                <div dangerouslySetInnerHTML={{ __html: problem.description }} />
              ) : (
                <div className="p-4 border rounded bg-gray-50">
                  <h2 className="text-lg font-medium">Two Sum</h2>
                  <p className="mt-2">Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.</p>
                  <p className="mt-2">You may assume that each input would have exactly one solution, and you may not use the same element twice.</p>
                  <p className="mt-2">You can return the answer in any order.</p>
                  
                  <div className="mt-4">
                    <h3 className="font-medium">Example 1:</h3>
                    <pre className="bg-gray-100 p-2 mt-1 rounded">
                      <p>Input: nums = [2,7,11,15], target = 9</p>
                      <p>Output: [0,1]</p>
                      <p>Explanation: Because nums[0] + nums[1] == 9, we return [0, 1].</p>
                    </pre>
                  </div>
                </div>
              )}
              
              {problem.tests && problem.tests.length > 0 && (
                <div className="examples">
                  <h3>Examples</h3>
                  {problem.tests.map((test, i) => (
                    <div key={i} className="example">
                      <div className="example-header">Example {i+1}</div>
                      <div className="example-content">
                        <div className="example-io">
                          <div className="example-input">
                            <div className="io-label">Input</div>
                            <pre>{test.input}</pre>
                          </div>
                          <div className="example-output">
                            <div className="io-label">Output</div>
                            <pre>{test.expected}</pre>
                          </div>
                        </div>
                        {test.explanation && (
                          <div className="example-explanation">
                            <div className="explanation-label">Explanation</div>
                            <div>{test.explanation}</div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="resize-handle" ref={resizeHandleRef}></div>
        
        <div className="problem-solution-panel">
          <div className="solution-container">
            <div className="editor-header">
              <div className="language-selector">
                <div className="selector-label">Language:</div>
                <div className="selector-options">
                  <button 
                    className={`language-option ${language === 'javascript' ? 'active' : ''}`} 
                    onClick={() => setLanguage('javascript')}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M0 0h24v24H0V0zm22.034 18.276c-.175-1.095-.888-2.015-3.003-2.873-.736-.345-1.554-.585-1.797-1.14-.091-.33-.105-.51-.046-.705.15-.646.915-.84 1.515-.66.39.12.75.42.976.9 1.034-.676 1.034-.676 1.755-1.125-.27-.42-.404-.601-.586-.78-.63-.705-1.469-1.065-2.834-1.034l-.705.089c-.676.165-1.32.525-1.71 1.005-1.14 1.291-.811 3.541.569 4.471 1.365 1.02 3.361 1.244 3.616 2.205.24 1.17-.87 1.545-1.966 1.41-.811-.18-1.26-.586-1.755-1.336l-1.83 1.051c.21.48.45.689.81 1.109 1.74 1.756 6.09 1.666 6.871-1.004.029-.09.24-.705.074-1.65l.046.067zm-8.983-7.245h-2.248c0 1.938-.009 3.864-.009 5.805 0 1.232.063 2.363-.138 2.711-.33.689-1.18.601-1.566.48-.396-.196-.597-.466-.83-.855-.063-.105-.11-.196-.127-.196l-1.825 1.125c.305.63.75 1.172 1.324 1.517.855.51 2.004.675 3.207.405.783-.226 1.458-.691 1.811-1.411.51-.93.402-2.07.397-3.346.012-2.054 0-4.109 0-6.179l.004-.056z" />
                    </svg>
                    JavaScript
                  </button>
                  <button 
                    className={`language-option ${language === 'python' ? 'active' : ''}`} 
                    onClick={() => setLanguage('python')}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M14.25.18l.9.2.73.26.59.3.45.32.34.34.25.34.16.33.1.3.04.26.02.2-.01.13V8.5l-.05.63-.13.55-.21.46-.26.38-.3.31-.33.25-.35.19-.35.14-.33.1-.3.07-.26.04-.21.02H8.77l-.69.05-.59.14-.5.22-.41.27-.33.32-.27.35-.2.36-.15.37-.1.35-.07.32-.04.27-.02.21v3.06H3.17l-.21-.03-.28-.07-.32-.12-.35-.18-.36-.26-.36-.36-.35-.46-.32-.59-.28-.73-.21-.88-.14-1.05-.05-1.23.06-1.22.16-1.04.24-.87.32-.71.36-.57.4-.44.42-.33.42-.24.4-.16.36-.1.32-.05.24-.01h.16l.06.01h8.16v-.83H6.18l-.01-2.75-.02-.37.05-.34.11-.31.17-.28.25-.26.31-.23.38-.2.44-.18.51-.15.58-.12.64-.1.71-.06.77-.04.84-.02 1.27.05zm-6.3 1.98l-.23.33-.08.41.08.41.23.34.33.22.41.09.41-.09.33-.22.23-.34.08-.41-.08-.41-.23-.33-.33-.22-.41-.09-.41.09zm13.09 3.95l.28.06.32.12.35.18.36.27.36.35.35.47.32.59.28.73.21.88.14 1.04.05 1.23-.06 1.23-.16 1.04-.24.86-.32.71-.36.57-.4.45-.42.33-.42.24-.4.16-.36.09-.32.05-.24.02-.16-.01h-8.22v.82h5.84l.01 2.76.02.36-.05.34-.11.31-.17.29-.25.25-.31.24-.38.2-.44.17-.51.15-.58.13-.64.09-.71.07-.77.04-.84.01-1.27-.04-1.07-.14-.9-.2-.73-.25-.59-.3-.45-.33-.34-.34-.25-.34-.16-.33-.1-.3-.04-.25-.02-.2.01-.13v-5.34l.05-.64.13-.54.21-.46.26-.38.3-.32.33-.24.35-.2.35-.14.33-.1.3-.06.26-.04.21-.02.13-.01h5.84l.69-.05.59-.14.5-.21.41-.28.33-.32.27-.35.2-.36.15-.36.1-.35.07-.32.04-.28.02-.21V6.07h2.09l.14.01zm-6.47 14.25l-.23.33-.08.41.08.41.23.33.33.23.41.08.41-.08.33-.23.23-.33.08-.41-.08-.41-.23-.33-.33-.23-.41-.08-.41.08z"/>
                    </svg>
                    Python
                  </button>
                  <button 
                    className={`language-option ${language === 'java' ? 'active' : ''}`} 
                    onClick={() => setLanguage('java')}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M8.851 18.56s-.917.534.653.714c1.902.218 2.874.187 4.969-.211 0 0 .552.346 1.321.646-4.699 2.013-10.633-.118-6.943-1.149M8.276 15.933s-1.028.761.542.924c2.032.209 3.636.227 6.413-.308 0 0 .384.389.987.602-5.679 1.661-12.007.13-7.942-1.218M13.116 11.475c1.158 1.333-.304 2.533-.304 2.533s2.939-1.518 1.589-3.418c-1.261-1.772-2.228-2.652 3.007-5.688 0-.001-8.216 2.051-4.292 6.573M19.33 20.504s.679.559-.747.991c-2.712.822-11.288 1.069-13.669.033-.856-.373.75-.89 1.254-.998.527-.114.828-.93 1.828-..93.045-.011-1.126.026-2.126.983-3.695 3.655-10.488-.42-4.501M9.292 13.21s-2.045.484-1.069.69c.825.169 2.466.15 3.995.077 1.249-.061 2.502-.17 2.502-.17s-.439.187-1.072.411c-3.371 1.127-9.52.829-7.083-.189 2.619-1.244 3.027-.99 3.027-.99M17.116 17.584c3.429-1.18 1.842-4.116 1.842-4.116s-.287 1.218-1.121 1.841c-.562 1.116-2.824 1.657-3.124 1.777.628-.301 1.908-1.429 2.403-2.777 0 0-.441.726-3.495 1.381l.793-.436c.793-.436 1.593-.903 2.154-2.755 1.269-.021.059 5.285-.452 5.085" />
                      <path d="M12 24c6.627 0 12-5.373 12-12S18.627 0 12 0 0 5.373 0 12s5.373 12 12 12zm-6.551-6.831c-.377.291-.972.3-1.124.3-.798 0-1.183-.36-1.183-.858 0-.157.048-.317.137-.475.108-.194.336-.39.663-.39.211 0 .467.096.748.277.374.243.468.342.621.704l.138.362zm7.205-.565c.126.382.106.811-.062 1.163-.156.328-.433.601-.835.743-.174.062-.367.096-.567.102-.938.027-1.691-.473-1.691-1.104 0-.741.893-1.326 2.422-1.122.005.075.011.15.014.218.02.395-.016.704-.109.999l.025-.022.411-.395.392-.382zm2.684 1.57c.105 0 .208.006.308.018.817.096 1.314.59 1.314 1.292 0 1.993-2.238 3.887-5.539 3.887-2.923 0-4.899-1.086-4.899-2.962 0-.455.136-.888.379-1.279.886-1.43 3.361-2.311 5.924-2.311.155 0 .31.003.465.011.777.039 1.289.171 1.746.344.199-.249.447-.516.565-.652a9.191 9.191 0 00-.327-.257c-.54-.391-1.248-.723-2.097-.964-.582-.165-1.195-.251-1.885-.257C7.764 15.569 5 16.782 5 18.61c0 1.721 2.56 3.003 5.954 3.081 3.352.078 6.085-1.225 6.085-2.946 0-.455-.162-.872-.455-1.228-.15-.182-.334-.345-.551-.49a8.76 8.76 0 00-.343-.201c-.015-.007-.032-.021-.032-.045 0-.027.021-.042.049-.042h.183zm-13.997.541c-.115.247-.368.401-.623.401-.414 0-.749-.334-.749-.748 0-.414.335-.75.749-.75s.75.336.75.75a.756.756 0 01-.127.347zm4.099-8.54c-.211-.193-.495-.296-.788-.296-.109 0-.221.015-.329.047-1.066.313-.836 2.429.348 4.358.128.21.268.404.415.584.819-1.14 1.224-2.536.696-3.635-.161-.336-.398-.608-.719-.822l.182-.171.195-.065zm1.526 4.893c-.17-.146-.303-.252-.303-.252s.056.034.151.097l.062.054c.13.121.234.245.316.38.134.221.2.463.189.707-.7.145-.042.291-.106.429-.134.29-.367.56-.636.757l.222-.055c.165-.043.396-.194.543-.345.269-.277.416-.652.415-1.044 0-.211-.043-.437-.12-.651-.1-.273-.243-.458-.424-.635-.99-.097-.219-.208-.309-.44zm1.847-.981c-.246.246-.617.348-.969.247-.352-.101-.546-.419-.546-.774s.194-.672.546-.773c.352-.101.723 0 .969.246s.347.618.245.97-.195.547-.775.547l.53-.463z" />
                    </svg>
                    Java
                  </button>
                </div>
              </div>
              
              <div className="solution-actions">
                <button 
                  onClick={runCode} 
                  disabled={loadingRun}
                  className="run-button"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="5 3 19 12 5 21 5 3"></polygon>
                  </svg>
                  {loadingRun ? 'Running...' : 'Run Code'}
                </button>
                <button 
                  onClick={submitSolution}
                  disabled={loadingRun}
                  className="submit-button"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                  </svg>
                  {loadingRun ? 'Submitting...' : 'Submit'}
                </button>
              </div>
            </div>
            
            <div className="editor-wrapper">
              <MonacoEditor
                value={code}
                onChange={setCode}
                language={language}
                theme="vs-dark"
              />
            </div>
            
            <div className="solution-tabs">
              <div className="tabs-header">
                <button className="tab-button active">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
                  </svg>
                  Results
                </button>
                <button 
                  className="tab-button hint-tab"
                  onClick={requestHint}
                  disabled={loadingHint}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
                    <line x1="12" y1="17" x2="12.01" y2="17"></line>
                  </svg>
                  {loadingHint ? 'Getting Hint...' : hints.length > 0 ? `Hints (${hints.length})` : 'Get Hint'}
                </button>
              </div>
              
              <div className="tabs-content">
                <div className="tab-panel active">
                  {!runResult && (
                    <div className="empty-results">
                      <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                        <polyline points="14 2 14 8 20 8"></polyline>
                        <line x1="16" y1="13" x2="8" y2="13"></line>
                        <line x1="16" y1="17" x2="8" y2="17"></line>
                        <polyline points="10 9 9 9 8 9"></polyline>
                      </svg>
                      <p>Run your code to see results here</p>
                    </div>
                  )}
                  
                  {runResult && (
                    <div className={`run-results ${runResult.success ? 'success' : 'failure'}`}>
                      <div className="result-header">
                        <div className="result-status">
                          {runResult.success ? (
                            <svg className="success-icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                              <polyline points="22 4 12 14.01 9 11.01"></polyline>
                            </svg>
                          ) : (
                            <svg className="failure-icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <circle cx="12" cy="12" r="10"></circle>
                              <line x1="15" y1="9" x2="9" y2="15"></line>
                              <line x1="9" y1="9" x2="15" y2="15"></line>
                            </svg>
                          )}
                          {runResult.isSubmission ? 'Submission' : 'Run'} {runResult.success ? 'Successful' : 'Failed'}
                        </div>
                        
                        {runResult.execution_time && (
                          <div className="execution-time">
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <circle cx="12" cy="12" r="10"></circle>
                              <polyline points="12 6 12 12 16 14"></polyline>
                            </svg>
                            {runResult.execution_time}
                          </div>
                        )}
                      </div>
                      
                      {runResult.results && runResult.results.length > 0 && (
                        <div className="test-results">
                          {runResult.results.map((result, i) => (
                            <div key={i} className={`test-case ${result.passed ? 'passed' : 'failed'}`}>
                              <div className="test-header">
                                {result.passed ? (
                                  <svg className="test-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                                  </svg>
                                ) : (
                                  <svg className="test-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="12" cy="12" r="10"></circle>
                                    <line x1="15" y1="9" x2="9" y2="15"></line>
                                    <line x1="9" y1="9" x2="15" y2="15"></line>
                                  </svg>
                                )}
                                Test Case {i+1}: {result.passed ? 'Passed' : 'Failed'}
                              </div>
                              
                              {!result.passed && (
                                <div className="test-details">
                                  <div className="test-io">
                                    <div className="test-input">
                                      <div className="io-label">Input:</div>
                                      <pre>{result.input}</pre>
                                    </div>
                                    <div className="test-expected">
                                      <div className="io-label">Expected:</div>
                                      <pre>{result.expected}</pre>
                                    </div>
                                    <div className="test-output">
                                      <div className="io-label">Your Output:</div>
                                      <pre>{result.output}</pre>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {runResult.errors && runResult.errors.length > 0 && (
                        <div className="error-messages">
                          {runResult.errors.map((error, i) => (
                            <div key={i} className="error-message">
                              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                <line x1="6" y1="6" x2="18" y2="18"></line>
                              </svg>
                              <div>
                                {error.line && <span className="error-line">Line {error.line}: </span>}
                                {error.message}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
                
                <div className="tab-panel hints-panel">
                  {hints.length === 0 ? (
                    <div className="empty-hints">
                      <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10"></circle>
                        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
                        <line x1="12" y1="17" x2="12.01" y2="17"></line>
                      </svg>
                      <p>Click the "Get Hint" button when you're stuck</p>
                    </div>
                  ) : (
                    <div className="hints-list">
                      {hints.map((hint, index) => (
                        <div key={index} className={`hint ${hint.level || 'normal'}`}>
                          <div className="hint-header">
                            <div className="hint-level">
                              {hint.level === 'error' ? (
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <circle cx="12" cy="12" r="10"></circle>
                                  <line x1="12" y1="8" x2="12" y2="12"></line>
                                  <line x1="12" y1="16" x2="12.01" y2="16"></line>
                                </svg>
                              ) : hint.level === 'warning' ? (
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                                  <line x1="12" y1="9" x2="12" y2="13"></line>
                                  <line x1="12" y1="17" x2="12.01" y2="17"></line>
                                </svg>
                              ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <circle cx="12" cy="12" r="10"></circle>
                                  <line x1="12" y1="16" x2="12" y2="12"></line>
                                  <line x1="12" y1="8" x2="12.01" y2="8"></line>
                                </svg>
                              )}
                              {hint.level === 'error' ? 'Error' : hint.level === 'warning' ? 'Warning' : 'Hint'}
                            </div>
                            {hint.timestamp && (
                              <div className="hint-time">
                                {new Date(hint.timestamp).toLocaleTimeString()}
                              </div>
                            )}
                          </div>
                          <div className="hint-content">
                            {hint.content}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <style jsx>{`
        .problem-detail {
          display: flex;
          flex-direction: column;
          height: calc(100vh - 64px);
          overflow: hidden;
        }
        
        .problem-loading, .problem-error {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: calc(100vh - 64px);
          text-align: center;
          padding: 2rem;
        }
        
        .problem-loading .spinner {
          width: 50px;
          height: 50px;
          border: 4px solid var(--gray-200);
          border-top-color: var(--primary-color);
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-bottom: 1.5rem;
        }
        
        .problem-error svg {
          color: var(--danger-color);
          margin-bottom: 1.5rem;
          opacity: 0.8;
        }
        
        .problem-error h2 {
          margin-bottom: 0.75rem;
          color: var(--gray-800);
        }
        
        .problem-error p {
          max-width: 500px;
          margin-bottom: 1.5rem;
          color: var(--gray-600);
        }
        
        .return-button {
          display: inline-flex;
          align-items: center;
          background-color: var(--primary-color);
          color: white;
          padding: 0.75rem 1.5rem;
          border-radius: var(--radius-md);
          font-weight: 500;
          transition: all 0.2s ease;
          text-decoration: none;
        }
        
        .return-button:hover {
          background-color: var(--primary-dark);
          text-decoration: none;
        }
        
        .problem-header {
          background: white;
          border-bottom: 1px solid var(--gray-200);
          padding: 1rem 1.5rem;
          z-index: 10;
        }
        
        .problem-header-content {
          max-width: 1400px;
          margin: 0 auto;
        }
        
        .problem-header-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.75rem;
        }
        
        .back-button {
          display: flex;
          align-items: center;
          color: var(--gray-600);
          text-decoration: none;
          font-size: 0.95rem;
          padding: 0.5rem;
          border-radius: var(--radius-md);
          transition: all 0.2s ease;
        }
        
        .back-button svg {
          margin-right: 0.5rem;
        }
        
        .back-button:hover {
          color: var(--primary-color);
          background-color: var(--gray-100);
          text-decoration: none;
        }
        
        .problem-meta {
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        
        .problem-topic {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.9rem;
          color: var(--gray-600);
          padding: 0.35rem 0.75rem;
          background-color: var(--gray-100);
          border-radius: var(--radius-md);
        }
        
        .problem-difficulty {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.9rem;
          font-weight: 500;
          padding: 0.35rem 0.75rem;
          border-radius: var(--radius-md);
        }
        
        .difficulty-easy {
          background-color: rgba(16, 185, 129, 0.1);
          color: var(--secondary-dark);
        }
        
        .difficulty-medium {
          background-color: rgba(245, 158, 11, 0.1);
          color: var(--warning-color);
        }
        
        .difficulty-hard {
          background-color: rgba(239, 68, 68, 0.1);
          color: var(--danger-color);
        }
        
        .problem-title {
          font-size: 1.75rem;
          font-weight: 700;
          color: var(--gray-900);
          margin: 0;
        }
        
        .split-pane {
          display: flex;
          flex: 1;
          overflow: hidden;
          position: relative;
        }
        
        .resize-handle {
          width: 8px;
          background-color: var(--gray-200);
          cursor: col-resize;
          transition: background-color 0.2s ease;
          z-index: 10;
        }
        
        .resize-handle:hover {
          background-color: var(--gray-300);
        }
        
        .problem-description-panel {
          flex: 0 0 40%;
          overflow-y: auto;
          background-color: white;
          border-right: 1px solid var(--gray-200);
        }
        
        .panel-content {
          padding: 1.5rem;
        }
        
        .description-content {
          max-width: 800px;
          line-height: 1.6;
          color: var(--gray-800);
        }
        
        .description-content h1,
        .description-content h2,
        .description-content h3 {
          color: var(--gray-900);
          margin-top: 1.5rem;
          margin-bottom: 0.75rem;
        }
        
        .description-content p {
          margin-bottom: 1rem;
        }
        
        .description-content pre,
        .description-content code {
          background-color: var(--gray-100);
          border-radius: var(--radius-sm);
          font-family: Menlo, Monaco, Consolas, "Liberation Mono", monospace;
          font-size: 0.9em;
        }
        
        .description-content code {
          padding: 0.2em 0.4em;
        }
        
        .description-content pre {
          padding: 1rem;
          overflow-x: auto;
          margin: 1rem 0;
        }
        
        .description-content ul,
        .description-content ol {
          margin-bottom: 1rem;
          margin-left: 1.5rem;
        }
        
        .examples {
          margin-top: 2rem;
        }
        
        .example {
          background-color: var(--gray-50);
          border-radius: var(--radius-md);
          margin-bottom: 1.25rem;
          overflow: hidden;
        }
        
        .example-header {
          font-weight: 600;
          padding: 0.75rem 1rem;
          background-color: var(--gray-100);
          color: var(--gray-800);
        }
        
        .example-content {
          padding: 1rem;
        }
        
        .example-io {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        
        .example-input,
        .example-output,
        .example-explanation {
          background-color: white;
          border-radius: var(--radius-sm);
          padding: 0.75rem;
          border: 1px solid var(--gray-200);
        }
        
        .io-label,
        .explanation-label {
          font-weight: 500;
          color: var(--gray-700);
          margin-bottom: 0.5rem;
          font-size: 0.9rem;
        }
        
        .example-io pre {
          margin: 0;
          font-family: Menlo, Monaco, Consolas, "Liberation Mono", monospace;
          font-size: 0.9rem;
          overflow-x: auto;
          color: var(--gray-800);
          padding: 0;
          background-color: transparent;
        }
        
        .example-explanation {
          margin-top: 1rem;
        }
        
        .problem-solution-panel {
          flex: 1;
          display: flex;
          flex-direction: column;
          background-color: var(--gray-50);
          overflow: hidden;
        }
        
        .solution-container {
          display: flex;
          flex-direction: column;
          height: 100%;
        }
        
        .editor-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem 1.5rem;
          background-color: white;
          border-bottom: 1px solid var(--gray-200);
        }
        
        .language-selector {
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        
        .selector-label {
          font-weight: 500;
          color: var(--gray-700);
          font-size: 0.95rem;
        }
        
        .selector-options {
          display: flex;
          background-color: var(--gray-100);
          border-radius: var(--radius-md);
          padding: 0.25rem;
        }
        
        .language-option {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 0.75rem;
          border: none;
          background-color: transparent;
          cursor: pointer;
          font-size: 0.9rem;
          color: var(--gray-600);
          border-radius: var(--radius-sm);
          transition: all 0.2s ease;
        }
        
        .language-option:hover {
          color: var(--gray-800);
        }
        
        .language-option.active {
          background-color: white;
          box-shadow: var(--shadow-sm);
          color: var(--gray-900);
          font-weight: 500;
        }
        
        .solution-actions {
          display: flex;
          gap: 0.75rem;
        }
        
        .run-button,
        .submit-button {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          border-radius: var(--radius-md);
          font-weight: 500;
          font-size: 0.95rem;
          cursor: pointer;
          transition: all 0.2s ease;
          border: none;
        }
        
        .run-button {
          background-color: var(--gray-100);
          color: var(--gray-800);
        }
        
        .run-button:hover {
          background-color: var(--gray-200);
        }
        
        .submit-button {
          background-color: var(--primary-color);
          color: white;
        }
        
        .submit-button:hover {
          background-color: var(--primary-dark);
        }
        
        .run-button:disabled,
        .submit-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        
        .editor-wrapper {
          flex: 1;
          overflow: hidden;
        }
        
        .solution-tabs {
          border-top: 1px solid var(--gray-200);
          background-color: white;
        }
        
        .tabs-header {
          display: flex;
          padding: 0 1rem;
          border-bottom: 1px solid var(--gray-200);
        }
        
        .tab-button {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.25rem;
          background-color: transparent;
          border: none;
          cursor: pointer;
          color: var(--gray-600);
          font-size: 0.95rem;
          font-weight: 500;
          border-bottom: 2px solid transparent;
          transition: all 0.2s ease;
        }
        
        .tab-button:hover {
          color: var(--gray-800);
        }
        
        .tab-button.active {
          color: var(--primary-color);
          border-bottom-color: var(--primary-color);
        }
        
        .hint-tab {
          color: var(--secondary-color);
        }
        
        .hint-tab:hover {
          color: var(--secondary-dark);
        }
        
        .hint-tab.active {
          color: var(--secondary-color);
          border-bottom-color: var(--secondary-color);
        }
        
        .tabs-content {
          max-height: 300px;
          overflow-y: auto;
        }
        
        .tab-panel {
          display: none;
          padding: 1.25rem;
        }
        
        .tab-panel.active {
          display: block;
        }
        
        .empty-results,
        .empty-hints {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 3rem 2rem;
          color: var(--gray-400);
          text-align: center;
        }
        
        .empty-results svg,
        .empty-hints svg {
          margin-bottom: 1rem;
          color: var(--gray-300);
        }
        
        .run-results {
          color: var(--gray-800);
        }
        
        .result-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
          padding-bottom: 0.75rem;
          border-bottom: 1px solid var(--gray-200);
        }
        
        .result-status {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-weight: 600;
          font-size: 1.1rem;
        }
        
        .success-icon {
          color: var(--secondary-color);
        }
        
        .failure-icon {
          color: var(--danger-color);
        }
        
        .execution-time {
          display: flex;
          align-items: center;
          gap: 0.35rem;
          font-size: 0.85rem;
          color: var(--gray-500);
          background-color: var(--gray-100);
          padding: 0.25rem 0.5rem;
          border-radius: var(--radius-md);
        }
        
        .test-results {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        
        .test-case {
          background-color: var(--gray-50);
          border-radius: var(--radius-md);
          overflow: hidden;
        }
        
        .test-header {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1rem;
          font-weight: 500;
        }
        
        .test-case.passed .test-header {
          background-color: rgba(16, 185, 129, 0.1);
          color: var(--secondary-dark);
        }
        
        .test-case.failed .test-header {
          background-color: rgba(239, 68, 68, 0.1);
          color: var(--danger-color);
        }
        
        .test-icon {
          flex-shrink: 0;
        }
        
        .test-details {
          padding: 1rem;
          border-top: 1px solid var(--gray-200);
        }
        
        .test-io {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        
        .test-input,
        .test-expected,
        .test-output {
          padding: 0.75rem;
          background-color: white;
          border: 1px solid var(--gray-200);
          border-radius: var(--radius-sm);
        }
        
        .test-output {
          border-left-color: var(--danger-color);
          border-left-width: 3px;
        }
        
        .error-messages {
          margin-top: 1rem;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        
        .error-message {
          display: flex;
          align-items: flex-start;
          gap: 0.5rem;
          background-color: rgba(239, 68, 68, 0.1);
          padding: 0.75rem 1rem;
          border-radius: var(--radius-md);
          color: var(--danger-color);
          font-family: Menlo, Monaco, Consolas, "Liberation Mono", monospace;
          font-size: 0.9rem;
          line-height: 1.5;
        }
        
        .error-message svg {
          margin-top: 0.2rem;
          flex-shrink: 0;
        }
        
        .error-line {
          font-weight: 600;
        }
        
        .hints-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        
        .hint {
          background-color: var(--gray-50);
          border-radius: var(--radius-md);
          overflow: hidden;
        }
        
        .hint.error {
          border-left: 3px solid var(--danger-color);
        }
        
        .hint.warning {
          border-left: 3px solid var(--warning-color);
        }
        
        .hint.normal {
          border-left: 3px solid var(--primary-color);
        }
        
        .hint-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.75rem 1rem;
          background-color: var(--gray-100);
          font-size: 0.9rem;
        }
        
        .hint-level {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-weight: 500;
          color: var(--gray-700);
        }
        
        .hint-time {
          color: var(--gray-500);
          font-size: 0.85rem;
        }
        
        .hint-content {
          padding: 1rem;
          line-height: 1.6;
        }
        
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        
        @media (max-width: 768px) {
          .problem-header-top {
            flex-direction: column;
            align-items: flex-start;
            gap: 0.5rem;
          }
          
          .problem-meta {
            width: 100%;
          }
          
          .split-pane {
            flex-direction: column;
          }
          
          .problem-description-panel {
            flex: 0 0 auto;
            max-height: 50vh;
            border-right: none;
            border-bottom: 1px solid var(--gray-200);
          }
          
          .resize-handle {
            height: 8px;
            width: 100%;
            cursor: row-resize;
          }
          
          .editor-header {
            flex-direction: column;
            gap: 1rem;
          }
          
          .language-selector,
          .solution-actions {
            width: 100%;
          }
          
          .solution-actions {
            display: grid;
            grid-template-columns: 1fr 1fr;
          }
        }
      `}</style>

      {/* Script for resize handle and tab functionality */}
      {/* Note: In a real implementation, this would be handled with useEffect */}
      
    </div>
  )
}
