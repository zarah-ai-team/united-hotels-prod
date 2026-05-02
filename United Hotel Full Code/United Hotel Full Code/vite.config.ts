import { defineConfig, loadEnv, Plugin } from 'vite'
import path from 'path'
import fs from 'fs'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

// Plugin to resolve figma:asset/ imports to local src/assets/ files
function figmaAssetResolver(): Plugin {
  return {
    name: 'figma-asset-resolver',
    enforce: 'pre',
    resolveId(source) {
      if (source.startsWith('figma:asset/')) {
        const filename = source.replace('figma:asset/', '')
        const assetPath = path.resolve(__dirname, 'src/assets', filename)
        if (fs.existsSync(assetPath)) {
          return assetPath
        }
      }
      return null
    },
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const apiTarget = env.VITE_API_PROXY || 'http://localhost:5000'
  const pricingTarget = env.VITE_PRICING_PROXY || 'http://localhost:5050'

  return {
    plugins: [
      figmaAssetResolver(),
      react(),
      tailwindcss(),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },

    server: {
      host: true,
      port: 5173,
      proxy: {
        '/api': {
          target: apiTarget,
          changeOrigin: true,
        },
        '/pricing': {
          target: pricingTarget,
          changeOrigin: true,
          rewrite: (p) => p.replace(/^\/pricing/, ''),
        },
      },
    },

    assetsInclude: ['**/*.svg', '**/*.csv'],
  }
})
