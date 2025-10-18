import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import monacoEditorPlugin from 'vite-plugin-monaco-editor'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    monacoEditorPlugin({
      languageWorkers: ['json', 'editorWorkerService'],
      customWorkers: []
    }),
  ],
  server: {
    port: 5173,
    open: true,
  }
})
