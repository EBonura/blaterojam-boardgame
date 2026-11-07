// Serves release/blatero-itch.zip from a nested path, the way itch.io does, and runs the room test against it.
// Run: npm run zip && node tools/test-zip.mjs
import http from 'node:http'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { execFileSync, spawn } from 'node:child_process'

const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'blatero-zip-'))
execFileSync('unzip', ['-q', 'release/blatero-itch.zip', '-d', dir])
const PREFIX = '/html/12345678/'
const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.png': 'image/png' }
const server = http.createServer((req, res) => {
  const u = decodeURIComponent(new URL(req.url, 'http://x').pathname)
  if (!u.startsWith(PREFIX)) return res.writeHead(404).end()
  const f = path.join(dir, u.slice(PREFIX.length) || 'index.html')
  if (!f.startsWith(dir) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) return res.writeHead(404).end()
  res.writeHead(200, { 'content-type': types[path.extname(f)] ?? 'application/octet-stream' }).end(fs.readFileSync(f))
})
server.listen(5195, () => {
  const t = spawn('node', ['tools/test-rooms.mjs'], { stdio: 'inherit', env: { ...process.env, BASE_URL: `http://localhost:5195${PREFIX}` } })
  t.on('exit', (code) => (server.close(), fs.rmSync(dir, { recursive: true }), process.exit(code ?? 1)))
})
