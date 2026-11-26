// Dynamic sitemap: always uses your real domain.
module.exports = (req, res) => {
  const host = req.headers['x-forwarded-host'] || req.headers.host;
  const base = `https://${host}`;
  const pages = [['/', '1.0'], ['/how-it-works.html', '0.8'], ['/contact.html', '0.6'], ['/privacy.html', '0.3']];
  const today = new Date().toISOString().slice(0, 10);
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    pages.map(([p, pr]) => `  <url><loc>${base}${p}</loc><lastmod>${today}</lastmod><priority>${pr}</priority></url>`).join('\n') + `\n</urlset>`;
  res.setHeader('Content-Type', 'application/xml');
  res.setHeader('Cache-Control', 's-maxage=86400');
  res.status(200).send(xml);
};
