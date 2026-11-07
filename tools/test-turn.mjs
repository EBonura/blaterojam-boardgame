// Can two browsers connect through a TURN server alone (relay-only ICE)? Usage: node tools/test-turn.mjs '<iceServers JSON>'
import puppeteer from 'puppeteer-core'
import os from 'node:os'
const ice = JSON.parse(process.argv[2])
const b = await puppeteer.launch({ executablePath: `${os.homedir()}/.cache/palermo-drive/chrome-headless-shell-mac-arm64/chrome-headless-shell`, headless: true, args: ['--mute-audio'] })
const [p1, p2] = await Promise.all([b.newPage(), b.newPage()])
for (const p of [p1, p2]) await p.goto('about:blank')
const setup = (p, ice) => p.evaluate((ice) => {
  window.pc = new RTCPeerConnection({ iceServers: ice, iceTransportPolicy: 'relay' })
  window.cands = []; window.pc.onicecandidate = (e) => e.candidate && window.cands.push(e.candidate.toJSON())
  window.pc.ondatachannel = (e) => (e.channel.onmessage = (m) => (window.got = m.data))
}, ice)
await setup(p1, ice); await setup(p2, ice)
const offer = await p1.evaluate(async () => { window.dc = pc.createDataChannel('x'); window.dc.onopen = () => window.dc.send('hello via TURN'); const o = await pc.createOffer(); await pc.setLocalDescription(o); return o })
const answer = await p2.evaluate(async (o) => { await pc.setRemoteDescription(o); const a = await pc.createAnswer(); await pc.setLocalDescription(a); return a }, offer)
await p1.evaluate(async (a) => pc.setRemoteDescription(a), answer)
await new Promise((r) => setTimeout(r, 6000))
const c1 = await p1.evaluate(() => cands), c2 = await p2.evaluate(() => cands)
await p2.evaluate(async (c) => { for (const x of c) await pc.addIceCandidate(x) }, c1)
await p1.evaluate(async (c) => { for (const x of c) await pc.addIceCandidate(x) }, c2)
await new Promise((r) => setTimeout(r, 8000))
console.log('relay candidates:', c1.length, c2.length, '| state:', await p1.evaluate(() => pc.connectionState), '| message:', await p2.evaluate(() => window.got ?? null))
await b.close()
