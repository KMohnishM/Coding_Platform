import React, { useRef, useEffect, useState } from 'react';

export default function MonacoEditor({ value, onChange, language = 'javascript', theme = 'dark', height = '100%' }) {
  const containerRef = useRef(null);
  const editorRef = useRef(null);
  const [isMonacoReady, setIsMonacoReady] = useState(typeof window !== 'undefined' && !!window.monaco);

  const initializeMonaco = () => {
    if (!containerRef.current || !window.monaco || editorRef.current) return;

    // ── Define custom dark theme ──
    window.monaco.editor.defineTheme('hintcode-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'comment', foreground: '6A737D', fontStyle: 'italic' },
        { token: 'keyword', foreground: 'C792EA', fontStyle: 'bold' },
        { token: 'string', foreground: 'C3E88D' },
        { token: 'number', foreground: 'F78C6C' },
        { token: 'type', foreground: 'FFCB6B' },
        { token: 'function', foreground: '82AAFF' },
        { token: 'variable', foreground: 'EEFFFF' },
        { token: 'constant', foreground: 'F78C6C' },
        { token: 'operator', foreground: '89DDFF' },
        { token: 'delimiter', foreground: '89DDFF' },
        { token: 'tag', foreground: 'F07178' },
        { token: 'attribute.name', foreground: 'FFCB6B' },
        { token: 'attribute.value', foreground: 'C3E88D' },
        { token: 'regexp', foreground: '89DDFF' },
      ],
      colors: {
        'editor.background': '#0d1117',
        'editor.foreground': '#E1E4E8',
        'editorLineNumber.foreground': '#3B4252',
        'editorLineNumber.activeForeground': '#818DA8',
        'editor.selectionBackground': '#264F78',
        'editor.inactiveSelectionBackground': '#264F7844',
        'editorIndentGuide.background': '#1E2533',
        'editorIndentGuide.activeBackground': '#3B4252',
        'editor.lineHighlightBackground': '#161B2266',
        'editor.lineHighlightBorder': '#161B2200',
        'editorCursor.foreground': '#A78BFA',
        'editorWhitespace.foreground': '#1E2533',
        'editorBracketMatch.background': '#3B425266',
        'editorBracketMatch.border': '#6366F155',
        'scrollbarSlider.background': '#FFFFFF10',
        'scrollbarSlider.hoverBackground': '#FFFFFF20',
        'scrollbarSlider.activeBackground': '#FFFFFF30',
        'editorWidget.background': '#161B22',
        'editorWidget.border': '#21262D',
        'editorSuggestWidget.background': '#161B22',
        'editorSuggestWidget.border': '#21262D',
        'editorSuggestWidget.selectedBackground': '#264F78',
        'editorHoverWidget.background': '#161B22',
        'editorHoverWidget.border': '#21262D',
      }
    });

    // ── Define custom light theme ──
    window.monaco.editor.defineTheme('hintcode-light', {
      base: 'vs',
      inherit: true,
      rules: [
        { token: 'comment', foreground: '6A737D', fontStyle: 'italic' },
        { token: 'keyword', foreground: 'D73A49', fontStyle: 'bold' },
        { token: 'string', foreground: '22863A' },
        { token: 'number', foreground: '005CC5' },
        { token: 'type', foreground: 'E36209' },
        { token: 'function', foreground: '6F42C1' },
        { token: 'variable', foreground: '24292E' },
        { token: 'operator', foreground: 'D73A49' },
      ],
      colors: {
        'editor.background': '#FFFFFF',
        'editor.foreground': '#24292E',
        'editorLineNumber.foreground': '#BFC8D2',
        'editorLineNumber.activeForeground': '#6B7D93',
        'editor.selectionBackground': '#B4D5FE',
        'editorIndentGuide.background': '#EEF0F3',
        'editor.lineHighlightBackground': '#F6F8FA',
        'editor.lineHighlightBorder': '#F6F8FA00',
        'editorCursor.foreground': '#6366F1',
        'editorBracketMatch.background': '#B4D5FE66',
        'editorBracketMatch.border': '#6366F155',
        'scrollbarSlider.background': '#00000010',
        'scrollbarSlider.hoverBackground': '#00000020',
      }
    });

    const activeTheme = theme === 'light' ? 'hintcode-light' : 'hintcode-dark';

    // Create Editor with Premium configurations
    editorRef.current = window.monaco.editor.create(containerRef.current, {
      value: value || '',
      language,
      theme: activeTheme,
      automaticLayout: true,
      minimap: { enabled: false },
      scrollBeyondLastLine: false,
      fontSize: 13,
      fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', 'Menlo', 'Monaco', 'Consolas', monospace",
      fontWeight: '400',
      lineHeight: 21,
      letterSpacing: 0.3,
      tabSize: 2,
      cursorBlinking: 'phase',
      cursorSmoothCaretAnimation: 'on',
      cursorWidth: 2,
      fontLigatures: true,
      smoothScrolling: true,
      formatOnPaste: true,
      formatOnType: true,
      padding: { top: 16, bottom: 16 },
      renderLineHighlight: 'all',
      bracketPairColorization: { enabled: true },
      guides: {
        bracketPairs: 'active',
        indentation: true,
        highlightActiveIndentation: true
      },
      scrollbar: {
        useShadows: false,
        verticalScrollbarSize: 8,
        horizontalScrollbarSize: 8,
        verticalSliderSize: 8
      },
      overviewRulerBorder: false,
      overviewRulerLanes: 0,
      hideCursorInOverviewRuler: true,
      renderWhitespace: 'none',
      contextmenu: true,
      suggest: {
        showMethods: true,
        showFunctions: true,
        showConstructors: true,
        showFields: true,
        showVariables: true,
        showClasses: true,
        showInterfaces: true,
        showModules: true,
        showProperties: true,
        showKeywords: true,
        showSnippets: true,
      }
    });

    editorRef.current.onDidChangeModelContent(() => {
      if (onChange) onChange(editorRef.current.getValue());
    });
  };

  useEffect(() => {
    if (isMonacoReady) initializeMonaco();

    if (!isMonacoReady) {
      let tries = 0;
      const interval = setInterval(() => {
        if (window.monaco) {
          setIsMonacoReady(true);
          clearInterval(interval);
        }
        tries += 1;
        if (tries > 50) clearInterval(interval);
      }, 100);

      return () => clearInterval(interval);
    }

    return () => {
      if (editorRef.current) {
        editorRef.current.dispose();
        editorRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMonacoReady]);

  // Keep editor value in sync
  useEffect(() => {
    if (editorRef.current) {
      const current = editorRef.current.getValue();
      if (value !== null && value !== undefined && value !== current) {
        editorRef.current.setValue(value);
      }
    }
  }, [value]);

  // Handle language updates dynamically
  useEffect(() => {
    if (editorRef.current && window.monaco) {
      const model = editorRef.current.getModel();
      if (model) {
        window.monaco.editor.setModelLanguage(model, language);
      }
    }
  }, [language]);

  // Handle theme updates dynamically
  useEffect(() => {
    if (editorRef.current && window.monaco) {
      const activeTheme = theme === 'light' ? 'hintcode-light' : 'hintcode-dark';
      window.monaco.editor.setTheme(activeTheme);
    }
  }, [theme]);

  if (!isMonacoReady) {
    return (
      <textarea
        value={value || ''}
        onChange={e => onChange && onChange(e.target.value)}
        className="w-full h-full bg-[var(--bg-base)] border border-[var(--border)] p-4 text-xs font-mono text-[var(--text-secondary)] focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 transition-colors"
        style={{ resize: 'none', color: 'var(--text-primary)' }}
      />
    );
  }

  return <div ref={containerRef} style={{ width: '100%', height }} />;
}