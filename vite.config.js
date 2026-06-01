import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Use /vpe-preview/ base only on GitHub Actions (for Pages deployment).
// Locally the app runs at / so the dev server and vite preview both work normally.
const base = process.env.GITHUB_ACTIONS ? '/vpe-preview/' : '/'

export default defineConfig({
  base,
  plugins: [react(), tailwindcss()],
})
