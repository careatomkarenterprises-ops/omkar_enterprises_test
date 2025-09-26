import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/omkar_enterprises_test/',   // 👈 must match repo name exactly
})
