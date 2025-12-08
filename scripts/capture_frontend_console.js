const fs = require('fs');
const http = require('http');
const puppeteer = require('puppeteer');

const ports = [5173, 5174, 5175];

async function checkPort(port) {
  return new Promise((resolve) => {
    const req = http.request({ hostname: '127.0.0.1', port, path: '/', method: 'GET', timeout: 2000 }, (res) => {
      resolve(res.statusCode === 200);
    });
    req.on('error', () => resolve(false));
    req.on('timeout', () => { req.destroy(); resolve(false); });
    req.end();
  });
}

(async () => {
  let foundPort = null;
  for (const port of ports) {
    // console.log('checking', port)
    // eslint-disable-next-line no-await-in-loop
    const ok = await checkPort(port);
    if (ok) { foundPort = port; break; }
  }

  if (!foundPort) {
    console.error('No accessible vite dev server found on ports', ports);
    process.exit(2);
  }

  const url = `http://127.0.0.1:${foundPort}/`;
  console.log('Using URL:', url);

  const browser = await puppeteer.launch({ args: ['--no-sandbox','--disable-setuid-sandbox'] });
  const page = await browser.newPage();

  const logs = { url, port: foundPort, console: [], pageErrors: [], requestsFailed: [], responses: [] };

  page.on('console', async (msg) => {
    try {
      const args = [];
      for (const a of msg.args()) {
        try {
          // If the arg is an Error-like object, extract message/stack
          const maybeErr = await a.evaluate((v) => {
            try {
              return { message: v && v.message, stack: v && v.stack, name: v && v.name };
            } catch (e) {
              return null;
            }
          }).catch(() => null);

          if (maybeErr && (maybeErr.message || maybeErr.stack)) {
            args.push(maybeErr);
          } else {
            // fallback to jsonValue
            const val = await a.jsonValue().catch(() => String(a));
            args.push(val);
          }
        } catch (e) {
          args.push(String(a));
        }
      }
      logs.console.push({ type: msg.type(), text: msg.text(), args, location: msg.location() });
    } catch (e) {
      logs.console.push({ type: 'unknown', text: String(msg) });
    }
  });

  page.on('pageerror', (err) => {
    logs.pageErrors.push(String(err && err.stack ? err.stack : err));
  });

  page.on('requestfailed', (req) => {
    logs.requestsFailed.push({ url: req.url(), method: req.method(), failure: req.failure() });
  });

  page.on('response', async (res) => {
    try {
      const req = res.request();
      logs.responses.push({ url: res.url(), status: res.status(), ok: res.ok(), requestUrl: req.url(), requestMethod: req.method() });
    } catch (e) {
      // ignore
    }
  });

  // increase timeout to allow AI requests or slow bundles
  await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 }).catch(e => logs.pageErrors.push('goto_error: ' + String(e)));

  // wait a bit for dynamic errors
  await new Promise((r) => setTimeout(r, 2000));

  const html = await page.content();
  fs.writeFileSync('scripts/frontend_page.html', html, 'utf8');
  fs.writeFileSync('scripts/frontend_console_log.json', JSON.stringify(logs, null, 2), 'utf8');

  console.log('Saved logs to scripts/frontend_console_log.json and scripts/frontend_page.html');
  await browser.close();
  process.exit(0);
})();
