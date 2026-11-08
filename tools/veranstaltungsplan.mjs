// Erzeugt assets/img/veranstaltungsplan.png aus dem Terminbereich der Startseite,
// damit der Download-Plan immer exakt den Terminen auf der Website entspricht.
//
// Aufruf (im Projektordner):   node tools/veranstaltungsplan.mjs
// Voraussetzung: Node.js >= 22 und Google Chrome (Pfad ggf. über CHROME=... setzen).
import http from 'node:http';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const out = path.join(root, 'assets', 'img', 'veranstaltungsplan.png');
const chromePath = process.env.CHROME || (process.platform === 'win32'
  ? 'C:/Program Files/Google/Chrome/Application/chrome.exe'
  : process.platform === 'darwin' ? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' : 'google-chrome');
const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.woff2': 'font/woff2' };
const sleep = ms => new Promise(r => setTimeout(r, ms));

// 1) Mini-Webserver für den Projektordner
const server = http.createServer((req, res) => {
  let u = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  let f = path.join(root, u.endsWith('/') ? u + 'index.html' : u);
  if (!f.startsWith(root) || !fs.existsSync(f)) { res.statusCode = 404; return res.end(); }
  res.setHeader('Content-Type', types[path.extname(f)] || 'application/octet-stream');
  fs.createReadStream(f).pipe(res);
}).listen(0);
const port = server.address().port;

// 2) Headless Chrome über das DevTools-Protokoll steuern
const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'fbg-plan-'));
const chrome = spawn(chromePath, ['--headless=new', '--remote-debugging-port=9334', '--no-first-run', '--hide-scrollbars', '--user-data-dir=' + profile, 'about:blank']);
try {
  for (let i = 0; i < 50; i++) { try { await fetch('http://127.0.0.1:9334/json/version'); break; } catch { await sleep(200); } }
  const target = await (await fetch('http://127.0.0.1:9334/json/new?about:blank', { method: 'PUT' })).json();
  const ws = new WebSocket(target.webSocketDebuggerUrl); await new Promise(r => (ws.onopen = r));
  let id = 0; const pending = new Map();
  ws.onmessage = m => { const d = JSON.parse(m.data); if (pending.has(d.id)) { pending.get(d.id)(d); pending.delete(d.id); } };
  const send = (method, params = {}) => new Promise(r => { const i = ++id; pending.set(i, r); ws.send(JSON.stringify({ id: i, method, params })); });

  await send('Page.enable');
  await send('Emulation.setDeviceMetricsOverride', { width: 1240, height: 900, deviceScaleFactor: 2, mobile: false });
  await send('Page.navigate', { url: `http://127.0.0.1:${port}/` });
  await sleep(1500);
  const r = await send('Runtime.evaluate', {
    awaitPromise: true, returnByValue: true,
    expression: `(async () => { await document.fonts.ready;
      const el = document.getElementById('termine'); const b = el.getBoundingClientRect();
      return { x: b.left + scrollX, y: b.top + scrollY, w: b.width, h: b.height }; })()`
  });
  const b = r.result.result.value;
  const shot = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true, clip: { x: b.x, y: b.y, width: b.w, height: b.h, scale: 1 } });
  fs.writeFileSync(out, Buffer.from(shot.result.data, 'base64'));
  console.log('Gespeichert:', path.relative(root, out), `(${Math.round(fs.statSync(out).size / 1024)} KB)`);
  ws.close();
} finally {
  chrome.kill(); server.close();
  await sleep(500);
  try { fs.rmSync(profile, { recursive: true, force: true }); } catch { /* egal */ }
}
