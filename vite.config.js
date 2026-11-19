import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// base: './' – zbudowana strona działa z dowolnego folderu i na GitHub Pages
export default defineConfig({
  base: './',
  plugins: [react()],
  test: { environment: 'node' },
})
