# MoodLens by KacemLabs
Static site, AI runs in the browser (TensorFlow.js). No backend needed.

## Deploy
1. Push this folder to GitHub (`git init`, `git add .`, `git commit`, `git push`).
2. vercel.com -> Add New -> Project -> import repo -> Deploy.

## SEO (Google)
- `/sitemap.xml` and `/robots.txt` are generated automatically with your real domain (see `api/`).
- Submit `https://YOUR-DOMAIN/sitemap.xml` in Google Search Console.
- Each page has its own title, description, Open Graph tags and JSON-LD structured data.

## Local run
`cd public && python -m http.server 8000` (camera works on localhost).

## Performance
All AI runs in a Web Worker (worker.js) so the page stays smooth; falls back to the main thread if unsupported.

## Speed
The AI auto-picks the fastest backend (GPU or WASM) on each device. Live uses a light face tracker + per-frame CNN; uploads use a fast detector with an accurate fallback.
