import React, { useRef, useEffect, useState } from 'react';

export default function MonacoEditor({ value, onChange, language = 'javascript', theme = 'vs-dark', height = '100%' }) {
  const containerRef = useRef(null);
  const editorRef = useRef(null);
  const [isMonacoReady, setIsMonacoReady] = useState(typeof window !== 'undefined' && !!window.monaco);

  // Helper to initialize monaco editor when it's available
  const initializeMonaco = () => {
    if (!containerRef.current || !window.monaco || editorRef.current) return;

    editorRef.current = window.monaco.editor.create(containerRef.current, {
      value: value || '',
      language,
      theme,
      automaticLayout: true,
      minimap: { enabled: false },
      scrollBeyondLastLine: false,
      fontSize: 14,
      tabSize: 2,
      scrollbar: {
        useShadows: false,
        verticalScrollbarSize: 8,
        horizontalScrollbarSize: 8
      }
    });

    editorRef.current.onDidChangeModelContent(() => {
      if (onChange) onChange(editorRef.current.getValue());
    });
  };

  useEffect(() => {
    // If monaco is ready, initialize
    if (isMonacoReady) initializeMonaco();

    // If Monaco isn't available yet, try to detect it periodically (useful when loaded from CDN)
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

  // If Monaco isn't ready within the environment, render a textarea fallback
  if (!isMonacoReady) {
    return (
      <textarea
        value={value || ''}
        onChange={e => onChange && onChange(e.target.value)}
        style={{ width: '100%', height: height, fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace' }}
      />
    );
  }

  return <div ref={containerRef} style={{ width: '100%', height }} />;
}