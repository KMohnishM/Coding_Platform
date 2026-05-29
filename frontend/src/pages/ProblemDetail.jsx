import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MonacoEditor from '../components/MonacoEditor';
import problemService from '../services/problemService';
import hintService from '../services/hintService';
import codeService from '../services/codeService';

const capitalizeFirst = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
};

export default function ProblemDetail({ user }) {
  const { id } = useParams();
  const navigate = useNavigate();

  // Refs for resizable split pane
  const splitContainerRef = useRef(null);
  const isResizing = useRef(false);

  // States
  const [problem, setProblem] = useState(null);
  const [code, setCode] = useState('');
  const [hints, setHints] = useState([]);
  const [loadingHint, setLoadingHint] = useState(false);
  const [loadingProblem, setLoadingProblem] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('description'); // 'description', 'hints', 'submissions'
  const [leftWidth, setLeftWidth] = useState(45); // percentage width for left panel
  const [language, setLanguage] = useState('javascript');
  const [editorCodes, setEditorCodes] = useState({}); // cached code per language: { javascript: '...', python: '...' }
  const [runResult, setRunResult] = useState(null);
  const [loadingRun, setLoadingRun] = useState(false);
  const [isTerminalOpen, setIsTerminalOpen] = useState(false);
  const [terminalTab, setTerminalTab] = useState('result'); // 'testcase', 'result'
  const [hintRatings, setHintRatings] = useState({}); // { hintId: rating }
  const [localSubmissions, setLocalSubmissions] = useState([]);
  const [hoverStar, setHoverStar] = useState({}); // { hintId: starVal }

  useEffect(() => {
    loadProblemDetails();
    loadLocalSubmissions();
  }, [id]);

  const loadLocalSubmissions = () => {
    try {
      const stored = JSON.parse(localStorage.getItem(`submissions_${id}`) || '[]');
      setLocalSubmissions(stored);
    } catch (e) {
      console.error(e);
    }
  };

  const saveLocalSubmission = (codeText, status, execTime, resultData) => {
    try {
      const newSub = {
        code: codeText,
        status,
        executionTime: execTime,
        timestamp: new Date().toISOString(),
        language,
        result: resultData
      };
      const updated = [newSub, ...localSubmissions];
      setLocalSubmissions(updated);
      localStorage.setItem(`submissions_${id}`, JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
  };

  const loadProblemDetails = async () => {
    try {
      setLoadingProblem(true);
      const data = await problemService.getProblemById(id);
      setProblem(data);
      const defaultLang = data.language || 'javascript';
      setLanguage(defaultLang);
      const initialCode = data.starting_code || getDefaultStartingCode(defaultLang, data.title);
      setCode(initialCode);
      setEditorCodes({ [defaultLang]: initialCode });
      setError(null);
    } catch (err) {
      console.error('Error fetching problem:', err);
      setError('Problem details could not be loaded.');
    } finally {
      setLoadingProblem(false);
    }
  };

  const getDefaultStartingCode = (lang, title) => {
    const fnName = title ? title.toLowerCase().replace(/[^a-zA-Z0-9]/g, '') : 'solve';
    switch (lang) {
      case 'python':
        return `def ${fnName}(self):\n    # Write your solution here\n    pass`;
      case 'java':
        return `class Solution {\n    public void ${fnName}() {\n        // Write your solution here\n    }\n}`;
      case 'cpp':
        return `class Solution {\npublic:\n    void ${fnName}() {\n        // Write your solution here\n    }\n};`;
      default:
        return `function ${fnName}() {\n    // Write your solution here\n}`;
    }
  };

  // Resize handler — using useCallback to avoid stale closure references
  const handleResize = useCallback((e) => {
    if (!isResizing.current || !splitContainerRef.current) return;
    const containerRect = splitContainerRef.current.getBoundingClientRect();
    const newWidth = ((e.clientX - containerRect.left) / containerRect.width) * 100;
    if (newWidth > 20 && newWidth < 80) {
      setLeftWidth(newWidth);
    }
  }, []);

  const stopResize = useCallback(() => {
    isResizing.current = false;
    document.removeEventListener('mousemove', handleResize);
    document.removeEventListener('mouseup', stopResize);
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
  }, [handleResize]);

  const startResize = useCallback((e) => {
    isResizing.current = true;
    document.addEventListener('mousemove', handleResize);
    document.addEventListener('mouseup', stopResize);
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  }, [handleResize, stopResize]);

  // Handle language updates with template caching
  const handleLanguageChange = (newLang) => {
    // Cache current code
    setEditorCodes(prev => ({
      ...prev,
      [language]: code
    }));
    
    setLanguage(newLang);
    
    // Retrieve cached code or load default template
    if (editorCodes[newLang]) {
      setCode(editorCodes[newLang]);
    } else {
      const template = getDefaultStartingCode(newLang, problem?.title);
      setCode(template);
      setEditorCodes(prev => ({
        ...prev,
        [newLang]: template
      }));
    }
  };

  // Reset editor template
  const handleResetCode = () => {
    if (window.confirm("Reset editor to default code template? Any changes will be lost.")) {
      const template = getDefaultStartingCode(language, problem?.title);
      setCode(template);
      setEditorCodes(prev => ({
        ...prev,
        [language]: template
      }));
    }
  };

  // Hint requesting
  const requestHint = async () => {
    if (!user || !problem) return;
    setActiveTab('hints');
    try {
      setLoadingHint(true);
      const result = await hintService.requestHint(
        user.id,
        problem.problem_id || problem.id,
        code,
        {
          title: problem.title,
          description: problem.description
        }
      );
      
      if (result && result.hint) {
        setHints(prev => [result.hint, ...prev]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingHint(false);
    }
  };

  // Submit Feedback on Hints
  const handleRateHint = async (hintDeliveryId, rating) => {
    try {
      await hintService.provideFeedback(hintDeliveryId, `Rated ${rating} stars`, rating);
      setHintRatings(prev => ({
        ...prev,
        [hintDeliveryId]: rating
      }));
    } catch (err) {
      console.error(err);
    }
  };

  // Code runs
  const runCode = async () => {
    if (!user || !problem) return;
    setIsTerminalOpen(true);
    setTerminalTab('result');
    try {
      setLoadingRun(true);
      const result = await codeService.runCode(
        user.id,
        problem.problem_id || problem.id,
        code,
        language
      );
      setRunResult(result);
      saveLocalSubmission(code, result.success ? 'success' : 'failed', result.execution_time || '0.1s', result);
      
      if (result.success) {
        const solvedList = JSON.parse(localStorage.getItem('solvedProblems') || '[]');
        if (!solvedList.includes(problem.problem_id)) {
          solvedList.push(problem.problem_id);
          localStorage.setItem('solvedProblems', JSON.stringify(solvedList));
        }
      }
    } catch (err) {
      console.error(err);
      setRunResult({
        success: false,
        errors: [{ message: err.message || 'Execution error.' }]
      });
    } finally {
      setLoadingRun(false);
    }
  };

  const submitSolution = async () => {
    if (!user || !problem) return;
    setIsTerminalOpen(true);
    setTerminalTab('result');
    try {
      setLoadingRun(true);
      const result = await codeService.submitSolution(
        user.id,
        problem.problem_id || problem.id,
        code,
        language
      );
      setRunResult({
        ...result,
        isSubmission: true
      });
      saveLocalSubmission(code, result.success ? 'success' : 'failed', result.execution_time || '0.2s', result);
      
      if (result.success) {
        const solvedList = JSON.parse(localStorage.getItem('solvedProblems') || '[]');
        if (!solvedList.includes(problem.problem_id)) {
          solvedList.push(problem.problem_id);
          localStorage.setItem('solvedProblems', JSON.stringify(solvedList));
        }
      }
    } catch (err) {
      console.error(err);
      setRunResult({
        success: false,
        errors: [{ message: err.message || 'Submission failed.' }],
        isSubmission: true
      });
    } finally {
      setLoadingRun(false);
    }
  };

  // Custom Markdown Parser with advanced example extraction
  const parseMarkdown = (md) => {
    if (!md) return '';
    let html = md
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    // Fenced Code blocks
    html = html.replace(/```([\s\S]*?)```/g, (match, body) => {
      return `<pre class="bg-slate-950 border border-[var(--border)] rounded-xl p-5 my-4 overflow-x-auto font-mono text-xs text-[#818cf8]"><code>${body.trim()}</code></pre>`;
    });

    // Inline code tags
    html = html.replace(/`([^`]+)`/g, '<code class="bg-[#161b22]/80 border border-[#21262d] text-indigo-300 rounded px-1.5 py-0.5 font-mono text-xs">$1</code>');

    // Bold text
    html = html.replace(/\*\*([^*]+)\*\*/g, '<strong class="font-bold text-slate-100">$1</strong>');

    // Headings
    html = html.replace(/^##\s+(.+)$/gm, '<h2 class="text-xs font-bold text-white uppercase tracking-wider mt-6 mb-3 border-b border-[#21262d] pb-2 flex items-center gap-2">$1</h2>');
    html = html.replace(/^###\s+(.+)$/gm, '<h3 class="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-4 mb-2">$1</h3>');
    html = html.replace(/^#\s+(.+)$/gm, '<h1 class="text-lg font-black text-white mt-6 mb-4">$1</h1>');

    // Bullet points
    html = html.replace(/^\s*-\s+(.+)$/gm, '<li class="text-slate-400 ml-5 list-disc my-1.5">$1</li>');

    // Example Extraction Block
    const lines = html.split('\n');
    let outputLines = [];
    let inExampleBlock = false;
    let exampleBlockBuffer = [];

    for (let line of lines) {
      const trimmed = line.trim();
      
      // Match example markers e.g. **Example 1:**
      if (trimmed.toLowerCase().includes('example') && (trimmed.startsWith('<strong') || trimmed.endsWith(':') || trimmed.includes('strong>'))) {
        if (inExampleBlock) {
          outputLines.push(flushExampleBlock(exampleBlockBuffer));
          exampleBlockBuffer = [];
        }
        inExampleBlock = true;
        const cleanHeader = trimmed.replace(/<\/?strong>/g, '').replace(/:$/, '').trim();
        outputLines.push(`<div class="text-xs font-black text-white uppercase tracking-wider mt-6 mb-2.5 flex items-center gap-1.5"><span class="w-1.5 h-1.5 rounded-full bg-indigo-500 shadow-[0_0_5px_#6366f1]"></span>${cleanHeader}</div>`);
        continue;
      }
      
      if (inExampleBlock) {
        if (trimmed.includes('Input:') || trimmed.includes('Output:') || trimmed.includes('Explanation:') || trimmed.startsWith('Input') || trimmed.startsWith('Output')) {
          exampleBlockBuffer.push(line);
          continue;
        } else if (trimmed === '' || trimmed === '<br />') {
          continue;
        } else {
          outputLines.push(flushExampleBlock(exampleBlockBuffer));
          exampleBlockBuffer = [];
          inExampleBlock = false;
        }
      }
      
      outputLines.push(line);
    }
    
    if (inExampleBlock && exampleBlockBuffer.length > 0) {
      outputLines.push(flushExampleBlock(exampleBlockBuffer));
    }

    let finalHtml = outputLines.map(line => {
      const t = line.trim();
      if (t === '' || t === '<br />') return '';
      if (t.startsWith('<h') || t.startsWith('<li') || t.startsWith('<pre') || t.startsWith('</pre') || t.startsWith('<div') || t.startsWith('</div')) {
        return line;
      }
      return `<p class="my-2 text-slate-300 leading-relaxed">${line}</p>`;
    }).join('\n');

    return finalHtml;
  };

  const flushExampleBlock = (buffer) => {
    let inputStr = '';
    let outputStr = '';
    let explanationStr = '';
    
    buffer.forEach(line => {
      let clean = line.replace(/<\/?strong>/g, '').replace(/<br\s*\/?>/gi, '').trim();
      
      if (clean.startsWith('Input:') || clean.includes('Input:')) {
        inputStr = clean.split('Input:')[1]?.trim() || '';
      } else if (clean.startsWith('Output:') || clean.includes('Output:')) {
        outputStr = clean.split('Output:')[1]?.trim() || '';
      } else if (clean.startsWith('Explanation:') || clean.includes('Explanation:')) {
        explanationStr = clean.split('Explanation:')[1]?.trim() || '';
      } else {
        if (explanationStr) {
          explanationStr += ' ' + clean;
        } else if (outputStr) {
          outputStr += ' ' + clean;
        } else if (inputStr) {
          inputStr += ' ' + clean;
        }
      }
    });

    if (!inputStr && !outputStr && !explanationStr) {
      return buffer.join('<br />');
    }

    return `
<div class="bg-[var(--bg-surface)]/50 border border-[var(--border)] rounded-2xl p-5 my-4 font-sans text-xs space-y-3 shadow-inner">
  ${inputStr ? `<div><span class="text-slate-500 font-bold uppercase tracking-wider text-[9px] block mb-1">Input</span><pre class="bg-[var(--bg-base)] border border-[var(--border)] p-2.5 rounded-xl font-mono text-slate-200 overflow-x-auto leading-relaxed">${inputStr}</pre></div>` : ''}
  ${outputStr ? `<div><span class="text-slate-500 font-bold uppercase tracking-wider text-[9px] block mb-1">Output</span><pre class="bg-[var(--bg-base)] border border-[var(--border)] p-2.5 rounded-xl font-mono text-indigo-300 overflow-x-auto font-bold leading-relaxed">${outputStr}</pre></div>` : ''}
  ${explanationStr ? `<div class="pt-2 border-t border-[var(--border)]" ><span class="text-slate-500 font-bold uppercase tracking-wider text-[9px] block mb-1">Explanation</span><p class="text-slate-400 leading-relaxed pl-0.5">${explanationStr}</p></div>` : ''}
</div>`;
  };

  const getDifficultyColor = (diff) => {
    switch (diff?.toLowerCase()) {
      case 'easy': return 'bg-green-500/10 text-green-400 border border-green-500/20';
      case 'medium': return 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20';
      case 'hard': return 'bg-red-500/10 text-red-400 border border-red-500/20';
      default: return 'bg-slate-800 text-slate-400 border-[#21262d]';
    }
  };

  // capitalizeFirst is now a module-level utility function defined above

  if (loadingProblem) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[var(--bg-base)]">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-indigo-500 mx-auto"></div>
          <p className="text-[#8b949e] text-xs font-semibold tracking-widest uppercase">Loading workspace...</p>
        </div>
      </div>
    );
  }

  if (error || !problem) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-[var(--bg-base)] text-center p-6 space-y-4">
        <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10" strokeWidth={2} />
          <line x1="12" y1="8" x2="12" y2="12" strokeWidth={2} />
          <line x1="12" y1="16" x2="12.01" y2="16" strokeWidth={2.5} />
        </svg>
        <h2 className="text-sm font-bold text-white uppercase tracking-wider">Loading failed</h2>
        <p className="text-[#8b949e] max-w-sm text-xs">{error || "This problem could not be loaded."}</p>
        <button onClick={() => navigate('/')} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-[#21262d] rounded-xl text-xs font-bold uppercase tracking-wider transition-colors">
          Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-[var(--bg-base)] h-full overflow-hidden" ref={splitContainerRef}>
      
      {/* Workspace Header */}
      <div className="bg-[var(--bg-surface)]/80 border-b border-[var(--border)] px-4 py-2.5 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/')}
            className="p-1.5 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-slate-800/60 transition-colors focus:outline-none focus:ring-1 focus:ring-indigo-500/30"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <span className="text-[10px] font-bold text-[#8b949e] uppercase tracking-widest">Workspace</span>
          <span className="text-slate-600 font-medium">/</span>
          <h2 className="text-sm font-bold text-white truncate max-w-[200px] sm:max-w-[400px]">
            {problem.title}
          </h2>
        </div>

        <div className="flex items-center gap-3 select-none">
          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getDifficultyColor(problem.difficulty)}`}>
            {capitalizeFirst(problem.difficulty)}
          </span>
          <span className="bg-indigo-500/10 border border-indigo-500/25 text-indigo-400 text-[10px] font-bold px-2.5 py-0.5 rounded-full">
            {problem.topic}
          </span>
        </div>
      </div>

      {/* Main Split Panels */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
        
        {/* Left Description Column */}
        <div 
          className="flex flex-col bg-[var(--bg-surface)]/15 border-r border-[var(--border)] overflow-hidden"
          style={{ width: `${leftWidth}%` }}
        >
          {/* Tabs bar */}
          <div className="flex bg-[var(--bg-surface)]/50 border-b border-[var(--border)] px-4 flex-shrink-0 select-none">
            <button
              onClick={() => setActiveTab('description')}
              className={`px-3 py-3 border-b-2 text-[10px] font-bold uppercase tracking-widest transition-all focus:outline-none ${
                activeTab === 'description'
                  ? 'border-indigo-500 text-indigo-400'
                  : 'border-transparent text-[#8b949e] hover:text-[#f0f6fc]'
              }`}
            >
              Description
            </button>
            <button
              onClick={() => setActiveTab('hints')}
              className={`px-3 py-3 border-b-2 text-[10px] font-bold uppercase tracking-widest transition-all focus:outline-none flex items-center gap-1.5 ${
                activeTab === 'hints'
                  ? 'border-indigo-500 text-indigo-400'
                  : 'border-transparent text-[#8b949e] hover:text-[#f0f6fc]'
              }`}
            >
              Hints
              {hints.length > 0 && (
                <span className="w-5 h-5 bg-indigo-500/20 text-indigo-400 border border-indigo-500/40 rounded-full flex items-center justify-center text-[9px] font-bold">
                  {hints.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('submissions')}
              className={`px-3 py-3 border-b-2 text-[10px] font-bold uppercase tracking-widest transition-all focus:outline-none flex items-center gap-1.5 ${
                activeTab === 'submissions'
                  ? 'border-indigo-500 text-indigo-400'
                  : 'border-transparent text-[#8b949e] hover:text-[#f0f6fc]'
              }`}
            >
              History
              {localSubmissions.length > 0 && (
                <span className="w-5 h-5 bg-slate-800 text-slate-400 rounded-full flex items-center justify-center text-[9px] font-semibold">
                  {localSubmissions.length}
                </span>
              )}
            </button>
          </div>

          {/* Scroll Content Area */}
          <div className="flex-1 overflow-auto p-5 space-y-6">
            
            {activeTab === 'description' && (
              <div className="prose prose-invert max-w-none text-[#8b949e] text-xs leading-relaxed space-y-4">
                {problem.description ? (
                  <div dangerouslySetInnerHTML={{ __html: parseMarkdown(problem.description) }} />
                ) : (
                  <p>No description loaded.</p>
                )}
              </div>
            )}

            {activeTab === 'hints' && (
              <div className="space-y-4">
                {/* Request Hint banner */}
                <div className="bg-[var(--bg-surface)]/60 border border-[var(--border)] p-5 rounded-2xl text-center space-y-4 shadow-xl">
                  <div className="w-10 h-10 bg-indigo-500/10 rounded-full border border-indigo-500/30 flex items-center justify-center text-indigo-400 mx-auto shadow-md shadow-indigo-500/5">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider">Progressive Assist</h3>
                    <p className="text-[11px] text-[#8b949e] max-w-xs mx-auto">Generate hint cards suited to your current evaluation. No spoiler code blocks.</p>
                  </div>
                  <button
                    onClick={requestHint}
                    disabled={loadingHint}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-bold uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-indigo-500/10 disabled:opacity-50 active:scale-[0.98] inline-flex items-center gap-2"
                  >
                    {loadingHint ? (
                      <>
                        <div className="animate-spin rounded-full h-3.5 w-3.5 border-b-2 border-white"></div>
                        <span>Evaluating...</span>
                      </>
                    ) : (
                      <span>Request Hint</span>
                    )}
                  </button>
                </div>

                {/* Hints progressive reveal timeline */}
                <div className="space-y-4 pt-2">
                  {hints.map((hint, idx) => {
                    const levelLabel = hint.level === 1 ? 'Conceptual' : hint.level === 2 ? 'Approach' : 'Implementation';
                    const rating = hintRatings[hint.id];
                    const activeHoverStar = hoverStar[hint.id] || 0;
                    return (
                      <div 
                        key={idx} 
                        className="bg-[var(--bg-surface)]/40 border border-[var(--border)] rounded-2xl p-5 space-y-3.5 animate-fade-in shadow-sm"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[9px] font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full border border-indigo-500/20 uppercase tracking-widest">
                            Lvl {hint.level}: {levelLabel}
                          </span>
                          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                            {hint.timestamp ? new Date(hint.timestamp).toLocaleTimeString() : 'Just now'}
                          </span>
                        </div>
                        
                        <p className="text-slate-300 text-xs leading-relaxed whitespace-pre-line">
                          {hint.content}
                        </p>

                        {/* Feedback Rating Block with glowing stars */}
                        <div className="pt-3.5 border-t border-[#21262d]/50 flex items-center justify-between text-xs text-slate-400 select-none">
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Helpful?</span>
                          <div className="flex items-center gap-1.5">
                            {rating ? (
                              <span className="text-indigo-400 font-bold text-[9px] bg-indigo-500/5 px-2.5 py-0.5 rounded border border-indigo-500/10 uppercase tracking-wider">
                                Rated {rating} / 5
                              </span>
                            ) : (
                              [1, 2, 3, 4, 5].map((starVal) => {
                                const isHighlighted = starVal <= (activeHoverStar || 0);
                                return (
                                  <button
                                    key={starVal}
                                    onMouseEnter={() => setHoverStar(prev => ({ ...prev, [hint.id]: starVal }))}
                                    onMouseLeave={() => setHoverStar(prev => ({ ...prev, [hint.id]: 0 }))}
                                    onClick={() => handleRateHint(hint.id, starVal)}
                                    className={`p-0.5 rounded transition-all focus:outline-none focus:ring-1 focus:ring-amber-400/30 ${
                                      isHighlighted ? 'text-amber-400 scale-110' : 'text-slate-600 hover:text-amber-400'
                                    }`}
                                  >
                                    <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                    </svg>
                                  </button>
                                );
                              })
                            )}
                          </div>
                        </div>

                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {activeTab === 'submissions' && (
              <div className="space-y-4">
                {localSubmissions.length === 0 ? (
                  <div className="text-center py-10 text-slate-500 text-xs font-bold uppercase tracking-wider">
                    No run history loaded.
                  </div>
                ) : (
                  localSubmissions.map((sub, idx) => (
                    <div 
                      key={idx} 
                      className="bg-[var(--bg-surface)]/35 border border-[var(--border)] p-4 rounded-xl flex items-center justify-between gap-4 hover:border-slate-700 transition-colors"
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2">
                          <span className={`w-2.5 h-2.5 rounded-full ${
                            sub.status === 'success' ? 'bg-green-500 shadow-[0_0_5px_#22c55e]' : 'bg-red-500 shadow-[0_0_5px_#ef4444]'
                          }`} />
                          <span className="text-xs font-black uppercase tracking-wider text-slate-200">{sub.status}</span>
                        </div>
                        <div className="flex items-center gap-3 text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                          <span>{sub.language}</span>
                          <span>•</span>
                          <span>{sub.executionTime}</span>
                          <span>•</span>
                          <span>{new Date(sub.timestamp).toLocaleTimeString()}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => setCode(sub.code)}
                        className="px-2.5 py-1 text-[9px] font-black text-slate-400 bg-[var(--bg-base)] border border-[var(--border)] rounded-lg hover:text-slate-200 hover:border-slate-700 transition-all uppercase focus:outline-none focus:ring-1 focus:ring-indigo-500/30"
                      >
                        Restore
                      </button>
                    </div>
                  ))
                )}
              </div>
            )}

          </div>
        </div>

        {/* Panel Dragger Handle with a neon glowing lightbar */}
        <div 
          className="hidden md:flex w-[6px] hover:w-[8px] cursor-col-resize select-none bg-[var(--bg-base)] border-x border-[var(--border)]/50 z-20 transition-all items-center justify-center group"
          onMouseDown={startResize}
        >
          <div className="w-[1.5px] h-8 bg-slate-700 rounded-full group-hover:bg-indigo-500 group-hover:h-12 group-hover:shadow-[0_0_6px_#6366f1] transition-all duration-300" />
        </div>

        {/* Right Editor Column */}
        <div className="flex-1 flex flex-col overflow-hidden bg-[var(--bg-base)]">
          
          {/* Monaco Editor Toolbar */}
          <div className="bg-[var(--bg-surface)]/45 border-b border-[var(--border)] px-4 py-2 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-3 select-none">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Compiler</span>
              <select
                className="px-2.5 py-1 bg-[var(--bg-base)] border border-[var(--border)] rounded-lg text-[10px] font-bold text-slate-400 focus:outline-none focus:border-indigo-500/40 cursor-pointer uppercase"
                value={language}
                onChange={(e) => handleLanguageChange(e.target.value)}
              >
                <option value="javascript">JavaScript</option>
                <option value="python">Python</option>
                <option value="java">Java</option>
                <option value="cpp">C++</option>
              </select>

              {/* Reset Code template button */}
              <button
                onClick={handleResetCode}
                className="p-1 rounded hover:bg-[#161b22] text-slate-500 hover:text-red-400 transition-colors focus:outline-none"
                title="Reset boilerplate template"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                </svg>
              </button>
            </div>

            <div className="flex gap-2">
              <button
                onClick={runCode}
                disabled={loadingRun}
                className="px-3.5 py-1.5 bg-[var(--bg-surface)] hover:bg-slate-800 text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border)] rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all inline-flex items-center gap-1.5 disabled:opacity-50 focus:outline-none focus:ring-1 focus:ring-indigo-500/30"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <polygon points="5 3 19 12 5 21 5 3" strokeWidth={2.5} />
                </svg>
                <span>Run</span>
              </button>
              
              <button
                onClick={submitSolution}
                disabled={loadingRun}
                className="px-3.5 py-1.5 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all inline-flex items-center gap-1.5 shadow-md shadow-indigo-500/10 disabled:opacity-50 active:scale-[0.98] focus:outline-none focus:ring-1 focus:ring-indigo-400/40"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
                <span>Submit</span>
              </button>
            </div>
          </div>

          {/* Monaco wrapper */}
          <div className="flex-1 min-h-0 bg-[var(--bg-base)]">
            <MonacoEditor
              value={code}
              onChange={setCode}
              language={language}
              theme="vs-dark"
            />
          </div>

          {/* Terminal output drawer */}
          <div className={`border-t border-[var(--border)] bg-[var(--bg-base)] flex flex-col transition-all duration-300 ${
            isTerminalOpen ? 'h-72' : 'h-10'
          }`}>
            {/* Terminal toggle bar */}
            <div className="bg-[var(--bg-surface)]/45 border-b border-[var(--border)]/25 flex items-center justify-between flex-shrink-0 select-none">
              <div 
                onClick={() => setIsTerminalOpen(!isTerminalOpen)}
                className="px-4 py-2.5 flex items-center gap-2 cursor-pointer text-[10px] font-bold text-slate-500 uppercase tracking-widest hover:bg-slate-900/10 flex-1"
              >
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                <span>Console</span>
              </div>
              
              {isTerminalOpen && (
                <div className="flex pr-2 gap-1.5">
                  <button
                    onClick={() => setTerminalTab('testcase')}
                    className={`px-3 py-1.5 text-[9px] font-bold uppercase rounded-lg transition-colors focus:outline-none ${
                      terminalTab === 'testcase'
                        ? 'bg-slate-800 text-indigo-400 border border-slate-700'
                        : 'text-slate-500 hover:text-slate-400'
                    }`}
                  >
                    Testcase
                  </button>
                  <button
                    onClick={() => setTerminalTab('result')}
                    className={`px-3 py-1.5 text-[9px] font-bold uppercase rounded-lg transition-colors focus:outline-none ${
                      terminalTab === 'result'
                        ? 'bg-slate-800 text-indigo-400 border border-slate-700'
                        : 'text-slate-500 hover:text-slate-400'
                    }`}
                  >
                    Result
                  </button>
                </div>
              )}
              
              <div 
                onClick={() => setIsTerminalOpen(!isTerminalOpen)}
                className="px-4 py-2.5 cursor-pointer text-slate-500 hover:text-slate-300"
              >
                <svg className={`w-3.5 h-3.5 transition-transform ${isTerminalOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

            {/* Terminal Body */}
            {isTerminalOpen && (
              <div className="flex-1 overflow-auto p-5 font-mono text-xs text-slate-400">
                
                {terminalTab === 'testcase' && (
                  <div className="space-y-4">
                    {problem.tests && problem.tests.length > 0 ? (
                      problem.tests.map((tc, tcIdx) => (
                        <div key={tcIdx} className="bg-[var(--bg-surface)]/60 border border-[var(--border)] p-3.5 rounded-2xl space-y-2">
                          <span className="text-slate-500 font-bold uppercase tracking-wider text-[9px] block">Test Case {tcIdx + 1} Input</span>
                          <pre className="bg-[var(--bg-base)] border border-[var(--border)] p-2.5 rounded-xl font-mono text-slate-200 overflow-x-auto text-xs">{tc.input}</pre>
                          <span className="text-slate-500 font-bold uppercase tracking-wider text-[9px] block">Expected Output</span>
                          <pre className="bg-[var(--bg-base)] border border-[var(--border)] p-2.5 rounded-xl font-mono text-indigo-300 font-bold overflow-x-auto text-xs">{tc.expected}</pre>
                        </div>
                      ))
                    ) : (
                      <div className="text-slate-600 text-center py-6">No sample test cases configured.</div>
                    )}
                  </div>
                )}

                {terminalTab === 'result' && (
                  <div className="space-y-4">
                    {!runResult && !loadingRun && (
                      <div className="text-slate-600 text-center py-10">
                        Console idle. Run or Submit code to trace results.
                      </div>
                    )}
                    
                    {loadingRun && (
                      <div className="flex items-center gap-2.5 text-indigo-400 py-4">
                        <div className="animate-spin rounded-full h-3.5 w-3.5 border-b-2 border-indigo-500"></div>
                        <span>Executing code against verification test cases...</span>
                      </div>
                    )}

                    {runResult && !loadingRun && (
                      <div className="space-y-4 animate-fade-in">
                        
                        {/* Execution status */}
                        <div className="flex items-center justify-between border-b border-[#21262d]/40 pb-2">
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-0.5 rounded text-[9px] font-black tracking-wide uppercase ${
                              runResult.success ? 'bg-green-500/10 text-green-400 border border-green-500/20 shadow-sm shadow-green-500/5' : 'bg-red-500/10 text-red-400 border border-red-500/20 shadow-sm shadow-red-500/5'
                            }`}>
                              {runResult.success ? 'Accepted' : 'Runtime Error'}
                            </span>
                            <span className="text-slate-300 font-black uppercase tracking-wider text-[10px]">
                              {runResult.isSubmission ? 'Submission' : 'Run'} Details
                            </span>
                          </div>
                          
                          {runResult.execution_time && (
                            <span className="text-slate-500 text-[10px] font-bold">Runtime: {runResult.execution_time}</span>
                          )}
                        </div>

                        {/* Test cases outputs */}
                        {runResult.results && runResult.results.length > 0 && (
                          <div className="space-y-3">
                            {runResult.results.map((tc, tcIdx) => (
                              <div 
                                key={tcIdx}
                                className={`p-3.5 rounded-2xl border ${
                                  tc.passed 
                                    ? 'bg-green-500/5 border-green-500/10 text-green-300' 
                                    : 'bg-red-500/5 border-red-500/10 text-red-300'
                                }`}
                              >
                                <div className="font-bold mb-2 flex items-center gap-1.5 uppercase text-[9px] tracking-wider">
                                  <span className={`w-1.5 h-1.5 rounded-full ${tc.passed ? 'bg-green-500' : 'bg-red-500'}`} />
                                  Case {tcIdx + 1}: {tc.passed ? 'Passed' : 'Wrong Answer'}
                                </div>
                                
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-[10px] border-t border-[#21262d]/10">
                                  <div>
                                    <div className="text-[9px] text-slate-500 font-bold uppercase mb-1">Input:</div>
                                    <pre className="bg-[var(--bg-base)] border border-[var(--border)] p-2 rounded text-slate-400 overflow-x-auto leading-relaxed">{tc.input}</pre>
                                  </div>
                                  <div>
                                    <div className="text-[9px] text-slate-500 font-bold uppercase mb-1">Expected:</div>
                                    <pre className="bg-[var(--bg-base)] border border-[var(--border)] p-2 rounded text-slate-400 overflow-x-auto leading-relaxed">{tc.expected}</pre>
                                  </div>
                                  <div>
                                    <div className="text-[9px] text-slate-500 font-bold uppercase mb-1">Your Output:</div>
                                    <pre className={`bg-[var(--bg-base)] p-2 rounded overflow-x-auto leading-relaxed border ${
                                      tc.passed ? 'border-[var(--border)] text-slate-200' : 'border-red-500/30 text-red-400 border-l-2 border-l-red-500'
                                    }`}>{tc.output}</pre>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Compilation Errors list */}
                        {runResult.errors && runResult.errors.length > 0 && (
                          <div className="space-y-2">
                            {runResult.errors.map((err, errIdx) => (
                              <div 
                                key={errIdx}
                                className="bg-red-500/10 border border-red-500/20 p-3.5 rounded-xl text-red-400 flex items-start gap-2.5"
                              >
                                <svg className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <circle cx="12" cy="12" r="10" strokeWidth={2} />
                                  <line x1="12" y1="8" x2="12" y2="12" strokeWidth={2} />
                                  <line x1="12" y1="16" x2="12.01" y2="16" strokeWidth={2.5} />
                                </svg>
                                <div className="text-xs font-bold leading-normal">
                                  {err.line && <span className="font-black">Line {err.line}: </span>}
                                  <span>{err.message}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                      </div>
                    )}
                  </div>
                )}

              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
}
