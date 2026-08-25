/* Local dev server: static files + the /api routes, so the booking flow can be
   exercised end to end without deploying. Vercel does this in production; this
   is only so the same code can be tested here. Not shipped. */
const http = require("http"), fs = require("fs"), path = require("path");
const ROOT = path.join(__dirname, "..");
const TYPES = { ".html":"text/html", ".css":"text/css", ".js":"text/javascript", ".json":"application/json",
  ".mp4":"video/mp4", ".jpg":"image/jpeg", ".png":"image/png", ".svg":"image/svg+xml" };

http.createServer(async (req, res) => {
  const url = new URL(req.url, "http://localhost");
  if (url.pathname.startsWith("/api/")) {
    const name = url.pathname.replace("/api/", "").replace(/\W/g, "");
    let handler;
    try {
      delete require.cache[require.resolve(`${ROOT}/api/${name}.js`)];
      handler = require(`${ROOT}/api/${name}.js`);
    } catch { res.writeHead(404).end("no such route"); return; }
    let body = "";
    for await (const c of req) body += c;
    req.body = body ? JSON.parse(body) : {};
    res.status = (c) => { res.statusCode = c; return res; };
    res.json = (o) => { res.setHeader("content-type","application/json"); res.end(JSON.stringify(o)); };
    try { await handler(req, res); } catch (e) { res.writeHead(500).end(String(e)); }
    return;
  }
  let f = path.join(ROOT, url.pathname === "/" ? "index.html" : decodeURIComponent(url.pathname));
  fs.readFile(f, (err, data) => {
    if (err) { res.writeHead(404).end("not found"); return; }
    res.writeHead(200, { "content-type": TYPES[path.extname(f)] || "application/octet-stream" });
    res.end(data);
  });
}).listen(4188, () => console.log("dev server on 4188 (static + /api)"));
