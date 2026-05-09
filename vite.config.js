import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import https from 'https'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [
      react(),
      tailwindcss(),
      {
        name: 'anthropic-proxy',
        configureServer(server) {
          server.middlewares.use('/api/anthropic', (req, res) => {
            let body = ''
            req.on('data', chunk => { body += chunk })
            req.on('end', () => {
              const options = {
                hostname: 'api.anthropic.com',
                path: req.url,
                method: req.method,
                headers: {
                  'content-type': 'application/json',
                  'x-api-key': env.ANTHROPIC_API_KEY || '',
                  'anthropic-version': '2023-06-01',
                },
              }
              const proxyReq = https.request(options, proxyRes => {
                res.writeHead(proxyRes.statusCode, { 'content-type': 'application/json' })
                proxyRes.pipe(res)
              })
              proxyReq.on('error', err => {
                res.writeHead(500)
                res.end(JSON.stringify({ error: err.message }))
              })
              if (body) proxyReq.write(body)
              proxyReq.end()
            })
          })
        },
      },
    ],
  }
})
