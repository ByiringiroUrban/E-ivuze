import { generateTextWithFallback, ensureDisclaimer } from './aiService.js';
import http from 'http';
import https from 'https';
import zlib from 'zlib';

const CACHE_TTL_MS = 26 * 60 * 60 * 1000;
const EMPTY_CACHE_TTL_MS = 5 * 60 * 1000;

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
    .trim();
};

const stripTags = (html) => {
  return String(html || '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
};

const extractFirstAllowedHref = (html) => {
  const s = String(html || '');
  const re = /href\s*=\s*"(https?:\/\/[^"]+)"/gi;
  let m;
  while ((m = re.exec(s))) {
    const href = String(m[1] || '').trim();
    if (href && isAllowedUrl(href)) return href;
  }
  return '';
};

const readStreamToBuffer = async (stream) => {
  const chunks = [];
  for await (const chunk of stream) chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  return Buffer.concat(chunks);
};

const decompressIfNeeded = async (buffer, encoding) => {
  const enc = String(encoding || '').toLowerCase();
  if (!enc || enc === 'identity') return buffer;
  if (enc.includes('gzip')) return zlib.gunzipSync(buffer);
  if (enc.includes('deflate')) return zlib.inflateSync(buffer);
  if (enc.includes('br') && typeof zlib.brotliDecompressSync === 'function') return zlib.brotliDecompressSync(buffer);
  return buffer;
};

const httpRequest = async ({ url, method = 'GET', headers = {}, timeoutMs = 12000, maxRedirects = 5 } = {}) => {
  const startUrl = String(url || '').trim();
  if (!startUrl) throw new Error('Empty URL');

  const doRequest = async (currentUrl, redirectsLeft) => {
    const u = new URL(currentUrl);
    const lib = u.protocol === 'https:' ? https : http;

    return await new Promise((resolve, reject) => {
      const req = lib.request(
        {
          method,
          protocol: u.protocol,
          hostname: u.hostname,
          port: u.port,
          path: `${u.pathname}${u.search}`,
          headers: {
            'Accept': 'application/rss+xml, application/xml;q=0.9, text/xml;q=0.8, */*;q=0.7',
            'Accept-Encoding': 'gzip, deflate, br',
            ...headers
          }
        },
        async (res) => {
          try {
            const status = res.statusCode || 0;
            const location = res.headers?.location;

            if ([301, 302, 303, 307, 308].includes(status) && location && redirectsLeft > 0) {
              const next = new URL(location, currentUrl).toString();
              res.resume();
              const nextMethod = status === 303 ? 'GET' : method;
              const out = await httpRequest({ url: next, method: nextMethod, headers, timeoutMs, maxRedirects: redirectsLeft - 1 });
              resolve(out);
              return;
            }

            const raw = await readStreamToBuffer(res);
            const decoded = await decompressIfNeeded(raw, res.headers?.['content-encoding']);
            resolve({
              ok: status >= 200 && status < 300,
              status,
              url: currentUrl,
              headers: res.headers || {},
              bodyText: decoded.toString('utf8')
            });
          } catch (e) {
            reject(e);
          }
        }
      );

      req.on('error', reject);
      req.setTimeout(timeoutMs, () => {
        req.destroy(new Error('Request timeout'));
      });
      req.end();
    });
  };

  return doRequest(startUrl, maxRedirects);
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

const toDateOrNull = (value) => {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return d;
};

const getRecencyCutoff = () => {
  const min = new Date('2025-01-01T00:00:00.000Z');
  const now = new Date();

  // Keep results fresh using a rolling window, but NEVER allow anything older than 2025.
  const days = 365;
  const rolling = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

  return rolling.getTime() > min.getTime() ? rolling : min;
};

const getDayKeyUtc = () => {
  return new Date().toISOString().slice(0, 10);
};

const extractTitleAndSource = (rawTitle) => {
  const t = String(rawTitle || '').replace(/\s+/g, ' ').trim();
  const idx = t.lastIndexOf(' - ');
  if (idx <= 0) return { title: t, source: '' };
  const title = t.slice(0, idx).trim();
  const source = t.slice(idx + 3).trim();
  return { title, source };
};

const getSourceTag = (block) => {
  const xml = String(block || '');
  const m = xml.match(/<source\s+[^>]*url="([^"]+)"[^>]*>([\s\S]*?)<\/source>/i);
  if (!m) return { url: '', name: '' };
  return { url: decodeHtml(m[1] || ''), name: decodeHtml(m[2] || '') };
};

const allowedDomains = [
  'rbc.gov.rw',
  'www.rbc.gov.rw',
  'moh.gov.rw',
  'www.moh.gov.rw',
  'afro.who.int',
  'www.afro.who.int',
  'who.int',
  'www.who.int',
  'medwell.rw',
  'www.medwell.rw',
  'cdc.gov',
  'www.cdc.gov',
  'tools.cdc.gov',
  'healthline.com',
  'www.healthline.com',
  'mayoclinic.org',
  'www.mayoclinic.org',
  'igihe.com',
  'www.igihe.com',
  'newtimes.co.rw',
  'www.newtimes.co.rw',
  'kigalitoday.com',
  'www.kigalitoday.com',
  'rba.co.rw',
  'www.rba.co.rw',
  'umuseke.rw',
  'www.umuseke.rw',
  'ktpress.rw',
  'www.ktpress.rw'
];

const priorityDomains = [
  'rbc.gov.rw',
  'moh.gov.rw',
  'afro.who.int',
  'who.int',
  'medwell.rw',
  'newtimes.co.rw'
];

const isAllowedUrl = (url) => {
  try {
    const u = new URL(url);
    return allowedDomains.includes(u.hostname);
  } catch {
    return false;
  }
};

const getHostname = (url) => {
  try {
    return new URL(url).hostname;
  } catch {
    return '';
  }
};

const pickBestArticleUrl = async ({ link, sourceUrl }) => {
  const lnk = String(link || '').trim();
  if (!lnk) return '';

  // If the <link> is already a publisher URL, use it.
  if (isAllowedUrl(lnk)) return lnk;

  // Most Google News RSS links are redirect URLs; try to resolve them.
  if (lnk.includes('news.google.') || lnk.includes('google.com')) {
    const resolved = await resolveFinalUrl(lnk);
    if (isAllowedUrl(resolved)) return resolved;
  }

  // Last resort: the <source url> is the publisher homepage (not the article).
  // Return it only if it's from an approved domain.
  const src = String(sourceUrl || '').trim();
  if (src && isAllowedUrl(src)) return src;

  return '';
};

const resolveFinalUrl = async (url) => {
  if (!url) return '';
  try {
    const res = await httpRequest({
      url,
      method: 'GET',
      timeoutMs: 8000,
      maxRedirects: 5,
      headers: {
        'User-Agent': 'E-ivuzeConnectDoctor/1.0 (+http://localhost:4000)'
      }
    });
    return res?.url || url;
  } catch {
    return url;
  }
};

const buildGoogleNewsRssUrl = ({ query, lang = 'rw', country = 'RW' }) => {
  const safeLang = ['rw', 'en', 'fr'].includes(lang) ? lang : 'rw';
  const hl = safeLang;
  const gl = country;
  const ceid = `${country}:${safeLang}`;

  return `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=${encodeURIComponent(hl)}&gl=${encodeURIComponent(gl)}&ceid=${encodeURIComponent(ceid)}`;
};

const NEWTIMES_RSS_URL = 'https://www.newtimes.co.rw/rss';
const CDC_NEWSROOM_RSS_URL = 'https://tools.cdc.gov/api/v2/resources/media/132608.rss';
const HEALTHLINE_NEWS_RSS_URL = 'https://www.healthline.com/health-news/feed.rss';

const isHealthRelated = ({ title, snippet, lang }) => {
  const hay = `${String(title || '')} ${String(snippet || '')}`.toLowerCase();
  const rw = [
    'ubuzima',
    'ubuvuzi',
    'indwara',
    'imiti',
    'inkingo',
    'malariya',
    'marburg',
    'kolera',
    'diyabete',
    'umutima',
    'ibicurane'
  ];

  const en = [
    'health',
    'hospital',
    'disease',
    'outbreak',
    'vaccin',
    'malaria',
    'marburg',
    'cholera',
    'diabetes',
    'nutrition',
    'hygiene',
    'mental',
    'maternal'
  ];

  const needles = lang === 'rw' ? [...rw, ...en] : en;
  return needles.some(k => hay.includes(k));
};

const parseRssCandidates = ({ xml, lang, max = 10, forceSourceName = '' } = {}) => {
  const blocks = String(xml || '').match(/<item>[\s\S]*?<\/item>/gi) || [];
  const out = [];

  for (const block of blocks) {
    if (out.length >= max) break;

    const rawTitle = getTagText(block, 'title');
    const link = getTagText(block, 'link');
    const pubDate = getTagText(block, 'pubDate');
    const descriptionHtml = getTagText(block, 'description');
    const snippet = stripTags(descriptionHtml);

    if (!link) continue;
    if (!isAllowedUrl(link)) continue;
    if (!pubDate) continue;

    const { title, source } = extractTitleAndSource(rawTitle);
    if (!title) continue;

    if (!isHealthRelated({ title, snippet, lang })) continue;

    out.push({
      title,
      source: forceSourceName || source,
      url: link,
      publishedAt: pubDate,
      publishedAtIso: toIsoOrNull(pubDate),
      snippet: snippet ? snippet.substring(0, 400) : ''
    });
  }

  return out;
};

const addFromRssUrl = async ({ url, lang, max = 10, sourceName = '' } = {}) => {
  try {
    const res = await httpRequest({
      url,
      method: 'GET',
      timeoutMs: 12000,
      maxRedirects: 5,
      headers: {
        'User-Agent': 'E-ivuzeConnectDoctor/1.0 (+http://localhost:4000)'
      }
    });

    if (!res.ok) return [];
    return parseRssCandidates({ xml: res.bodyText, lang, max, forceSourceName: sourceName });
  } catch {
    return [];
  }
};

const buildRwandaHealthQuery = ({ lang }) => {
  const healthKeywords = lang === 'rw'
    ? '(ubuzima OR ubuvuzi OR indwara OR imiti OR inkingo OR isuku OR imirire)'
    : '(health OR medical OR disease OR vaccine OR hygiene OR nutrition)';

  const domainFilters = allowedDomains
    .filter(d => !d.startsWith('www.'))
    .map(d => `site:${d}`)
    .join(' OR ');

  return `${healthKeywords} Rwanda (${domainFilters})`;
};

const safeJsonParse = (text) => {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
};

const normalizeUrl = (value) => {
  const u = String(value || '').trim();
  return u;
};

export const getRwandaHealthTips = async ({ lang = 'rw', limit = 3 } = {}) => {
  const safeLimit = Math.max(1, Math.min(6, parseInt(limit || '3', 10)));
  const cutoff = getRecencyCutoff();
  const cacheKey = JSON.stringify({
    lang,
    safeLimit,
    cutoff: cutoff.toISOString().slice(0, 10),
    day: getDayKeyUtc()
  });
  const cached = getCached(cacheKey);
  if (cached) return cached;

  const candidates = [];

  // Source 1: Google News RSS search (domain-restricted)
  try {
    const query = buildRwandaHealthQuery({ lang });
    const url = buildGoogleNewsRssUrl({ query, lang });

    const res = await httpRequest({
      url,
      method: 'GET',
      timeoutMs: 12000,
      maxRedirects: 5,
      headers: {
        'User-Agent': 'E-ivuzeConnectDoctor/1.0 (+http://localhost:4000)'
      }
    });

    if (res.ok) {
      const xml = res.bodyText;
      const blocks = String(xml).match(/<item>[\s\S]*?<\/item>/gi) || [];

      for (const block of blocks) {
        if (candidates.length >= 12) break;

        const rawTitle = getTagText(block, 'title');
        const link = getTagText(block, 'link');
        const pubDate = getTagText(block, 'pubDate');
        const descriptionHtml = getTagText(block, 'description');

        if (!link) continue;

        const { title, source } = extractTitleAndSource(rawTitle);
        const sourceTag = getSourceTag(block);
        const hrefUrl = extractFirstAllowedHref(descriptionHtml);
        const articleUrl = await pickBestArticleUrl({ link: hrefUrl || link, sourceUrl: sourceTag.url });
        if (!articleUrl) continue;
        const snippet = stripTags(descriptionHtml);

        if (!title) continue;

        candidates.push({
          title,
          source: sourceTag.name || source,
          url: articleUrl,
          publishedAt: pubDate || null,
          publishedAtIso: pubDate ? toIsoOrNull(pubDate) : null,
          snippet: snippet ? snippet.substring(0, 400) : ''
        });
      }
    }
  } catch {
    // ignore google rss failures
  }

  // Source 2: The New Times official RSS (health-filtered)
  try {
    const res = await httpRequest({
      url: NEWTIMES_RSS_URL,
      method: 'GET',
      timeoutMs: 12000,
      maxRedirects: 5,
      headers: {
        'User-Agent': 'E-ivuzeConnectDoctor/1.0 (+http://localhost:4000)'
      }
    });

    if (res.ok) {
      const nt = parseRssCandidates({ xml: res.bodyText, lang, max: 12, forceSourceName: 'The New Times' });
      candidates.push(...nt);
    }
  } catch {
    // ignore newtimes failures
  }

  // Source 3: CDC Online Newsroom RSS (health/public health)
  try {
    const cdc = await addFromRssUrl({ url: CDC_NEWSROOM_RSS_URL, lang, max: 12, sourceName: 'CDC' });
    candidates.push(...cdc);
  } catch {
    // ignore
  }

  // Source 4: Healthline health news RSS
  try {
    const hl = await addFromRssUrl({ url: HEALTHLINE_NEWS_RSS_URL, lang, max: 12, sourceName: 'Healthline' });
    candidates.push(...hl);
  } catch {
    // ignore
  }

  // Dedupe by URL
  const deduped = [];
  const seen = new Set();
  for (const c of candidates) {
    const u = String(c?.url || '').trim();
    if (!u || seen.has(u)) continue;
    seen.add(u);
    deduped.push(c);
    if (deduped.length >= 20) break;
  }

  if (!deduped.length) {
    setCached(cacheKey, [], EMPTY_CACHE_TTL_MS);
    return [];
  }

  deduped.sort((a, b) => {
    const ah = getHostname(a.url);
    const bh = getHostname(b.url);
    const ap = priorityDomains.includes(ah.replace(/^www\./, '')) ? 0 : 1;
    const bp = priorityDomains.includes(bh.replace(/^www\./, '')) ? 0 : 1;
    if (ap !== bp) return ap - bp;
    return 0;
  });

  const recentCandidates = deduped.filter((c) => {
    const d = toDateOrNull(c.publishedAtIso || c.publishedAt);
    if (!d) return false;
    return d.getTime() >= cutoff.getTime();
  });

  if (!recentCandidates.length) {
    setCached(cacheKey, [], EMPTY_CACHE_TTL_MS);
    return [];
  }

  const systemPrompt =
    'You are a healthcare information assistant. Your job is to create short, actionable health tips for the public. ' +
    'You MUST only use the provided article snippets/titles. Do not invent facts. ' +
    'Output must be STRICT JSON only (no markdown, no commentary) with this schema: ' +
    '{"tips":[{"title":"...","tip":"...","sourceUrl":"...","sourceName":"...","publishedAtIso":"..."}]}. ' +
    'Rules: tips must be health-related only; keep each tip 1-3 short sentences; include a practical action or warning sign; ' +
    'do not diagnose; do not mention politics or unrelated news; keep it concise. ' +
    (lang === 'rw' ? 'Write in Kinyarwanda.' : 'Write in English.');

  const userPayload = recentCandidates
    .slice(0, 8)
    .map((c, i) => {
      return [
        `#${i + 1}`,
        `title: ${c.title}`,
        `source: ${c.source}`,
        `publishedAtIso: ${c.publishedAtIso || ''}`,
        `url: ${c.url}`,
        `snippet: ${c.snippet}`
      ].join('\n');
    })
    .join('\n\n');

  let tips = [];
  try {
    const gen = await generateTextWithFallback({
      systemPrompt,
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: userPayload
            }
          ]
        }
      ]
    });

    const parsed = safeJsonParse(gen.text);
    const list = parsed?.tips;
    const candidateByUrl = new Map(recentCandidates.map((c) => [c.url, c]));

    if (Array.isArray(list)) {
      tips = list
        .filter(t => t && typeof t === 'object')
        .map((t) => {
          const rawUrl = normalizeUrl(t.sourceUrl);
          const candidate = rawUrl ? candidateByUrl.get(rawUrl) : null;
          const tipText = String(t.tip || '').trim();
          const publishedAtIso = String(t.publishedAtIso || '').trim() || candidate?.publishedAtIso || null;
          const publishedAtDate = toDateOrNull(publishedAtIso);

          return {
            title: String(t.title || '').trim() || candidate?.title || null,
            tip: tipText ? ensureDisclaimer(tipText, lang === 'rw' ? 'rw' : 'en') : '',
            sourceUrl: rawUrl,
            sourceName: String(t.sourceName || '').trim() || candidate?.source || '',
            publishedAtIso
          };
        })
        .filter((t) => {
          if (!t.tip) return false;
          if (!t.sourceUrl || !isAllowedUrl(t.sourceUrl)) return false;
          const d = toDateOrNull(t.publishedAtIso);
          if (!d) return false;
          return d.getTime() >= cutoff.getTime();
        });
    }
  } catch {
    tips = [];
  }

  // Fill remaining slots with deterministic fallback from recentCandidates.
  if (tips.length < safeLimit) {
    const used = new Set(tips.map((t) => t.sourceUrl));
    for (const c of recentCandidates) {
      if (tips.length >= safeLimit) break;
      if (used.has(c.url)) continue;
      tips.push({
        title: c.title,
        tip: ensureDisclaimer(
          lang === 'rw'
            ? `Inama: Soma iyi nkuru kugira ngo umenye amakuru yizewe ajyanye n'ubuzima. ${c.snippet}`
            : `Tip: Read this article for reliable health information. ${c.snippet}`,
          lang === 'rw' ? 'rw' : 'en'
        ),
        sourceUrl: c.url,
        sourceName: c.source,
        publishedAtIso: c.publishedAtIso
      });
      used.add(c.url);
    }
  }

  const limited = tips.slice(0, safeLimit);
  setCached(cacheKey, limited, CACHE_TTL_MS);
  return limited;
};
