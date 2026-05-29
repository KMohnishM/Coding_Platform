import React, { useRef, useEffect, useState } from 'react';

export default function MonacoEditor({ value, onChange, language = 'javascript', theme = 'vs-dark', height = '100%' }) {
  const containerRef = useRef(null);
  const editorRef = useRef(null);
  const [isMonacoReady, setIsMonacoReady] = useState(typeof window !== 'undefined' && !!window.monaco);

  const initializeMonaco = () => {
    if (!containerRef.current || !window.monaco || editorRef.current) return;

    // Create Editor with Premium configurations
    editorRef.current = window.monaco.editor.create(containerRef.current, {
      value: value || '',
      language,
      theme,
      automaticLayout: true,
      minimap: { enabled: false },
      scrollBeyondLastLine: false,
      fontSize: 13,
      fontFamily: "'JetBrains Mono', 'Menlo', 'Monaco', 'Consolas', monospace",
      fontWeight: '500',
      lineHeight: 20,
      tabSize: 2,
      cursorBlinking: 'smooth',
      cursorSmoothCaretAnimation: 'on',
      cursorWidth: 2,
      fontLigatures: true,
      smoothScrolling: true,
      formatOnPaste: true,
      formatOnType: true,
      padding: { top: 12, bottom: 12 },
      renderLineHighlight: 'all',
      guides: {
        bracketPairs: true,
        indentation: true
      },
      scrollbar: {
        useShadows: false,
        verticalScrollbarSize: 6,
        horizontalScrollbarSize: 6
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

  if (!isMonacoReady) {
    return (
      <textarea
        value={value || ''}
        onChange={e => onChange && onChange(e.target.value)}
        className="w-full h-full bg-[var(--bg-base)] border border-[var(--border)] p-4 text-xs font-mono text-slate-400 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 transition-colors"
        style={{ resize: 'none' }}
      />
    );
  }

  return <div ref={containerRef} style={{ width: '100%', height }} />;
}