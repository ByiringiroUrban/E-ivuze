const CACHE_TTL_MS = 10 * 60 * 1000;

const cache = new Map();

const getCached = (key) => {
  const hit = cache.get(key);
  if (!hit) return null;
  if (Date.now() > hit.expiresAt) {
    cache.delete(key);
    return null;
  }
  return hit.value;
};

const setCached = (key, value, ttlMs) => {
  cache.set(key, { value, expiresAt: Date.now() + ttlMs });
};

const decodeHtml = (value) => {
  if (!value) return '';
  return String(value)
    .replace(/<!\[CDATA\[/g, '')
    .replace(/\]\]>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, n) => {
      const code = parseInt(n, 10);
      if (!Number.isFinite(code)) return _;
      try {
        return String.fromCharCode(code);
      } catch {
        return _;
      }
    })
    .trim();
};

const stripTags = (html) => {
  return String(html || '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
};

const getTagText = (block, tag) => {
  const re = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i');
  const m = String(block || '').match(re);
  return m?.[1] ? decodeHtml(m[1]) : '';
};

const toIsoOrNull = (value) => {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString();
};

const buildGoogleNewsRssUrl = ({ query, lang = 'rw', country = 'RW' }) => {
  const safeLang = ['rw', 'en', 'fr'].includes(lang) ? lang : 'rw';
  const hl = safeLang;
  const gl = country;
  const ceid = `${country}:${safeLang}`;

  return `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=${encodeURIComponent(hl)}&gl=${encodeURIComponent(gl)}&ceid=${encodeURIComponent(ceid)}`;
};

const extractTitleAndSource = (rawTitle) => {
  const t = String(rawTitle || '').replace(/\s+/g, ' ').trim();
  const idx = t.lastIndexOf(' - ');
  if (idx <= 0) return { title: t, source: '' };
  const title = t.slice(0, idx).trim();
  const source = t.slice(idx + 3).trim();
  return { title, source };
};

export const getTrendingRwandaHealthNews = async ({ lang = 'rw', limit = 3, query } = {}) => {
  const safeLimit = Math.max(1, Math.min(10, parseInt(limit || '3', 10)));
  const q = String(query || '').trim() || (lang === 'rw'
    ? '(ubuzima OR indwara OR imiti) Rwanda'
    : 'health Rwanda');

  const cacheKey = JSON.stringify({ lang, safeLimit, q });
  const cached = getCached(cacheKey);
  if (cached) return cached;

  const url = buildGoogleNewsRssUrl({ query: q, lang });
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'E-ivuzeConnectDoctor/1.0 (+ https://ivuzebackendv.vercel.app)'
    }
  });

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`Trending news fetch failed (${res.status}): ${body || res.statusText}`);
  }

  const xml = await res.text();
  const items = [];

  const blocks = String(xml).match(/<item>[\s\S]*?<\/item>/gi) || [];
  for (const block of blocks) {
    if (items.length >= safeLimit) break;

    const rawTitle = getTagText(block, 'title');
    const link = getTagText(block, 'link');
    const pubDate = getTagText(block, 'pubDate');
    const descriptionHtml = getTagText(block, 'description');

    const { title, source } = extractTitleAndSource(rawTitle);
    const snippet = stripTags(descriptionHtml);

    if (!title || !link) continue;

    items.push({
      provider: 'google_news_rss',
      title,
      source,
      url: link,
      publishedAt: pubDate || null,
      publishedAtIso: pubDate ? toIsoOrNull(pubDate) : null,
      snippet: snippet ? snippet.substring(0, 220) : ''
    });
  }

  setCached(cacheKey, items, CACHE_TTL_MS);
  return items;
};
