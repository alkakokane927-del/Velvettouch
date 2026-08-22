import express from 'express';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import fs from 'fs';
import dotenv from 'dotenv';
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());

app.use(express.static(__dirname, {
  etag: false,
  lastModified: false,
  setHeaders: (res, path) => {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.setHeader('Surrogate-Control', 'no-store');
  }
}));

const apiDir = path.join(__dirname, 'api');
const files = fs.readdirSync(apiDir);
for (const file of files) {
  if (file.endsWith('.js') && file !== 'init.js') {
    const route = `/api/${file.replace('.js', '')}`;
    app.all(route, async (req, res) => {
      try {
        const handlerPath = pathToFileURL(path.join(__dirname, 'api', file)).href + '?update=' + Date.now();
        const handler = await import(handlerPath);
        await handler.default(req, res);
      } catch (err) {
        console.error(`Error in ${route}:`, err);
        if (!res.headersSent) res.status(500).json({error: "Server endpoint error or not found", details: err.message});
      }
    });
  }
}

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Local server running at http://localhost:${PORT}`);
});
