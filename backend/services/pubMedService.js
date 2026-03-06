const PUBMED_BASE = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils';

const toIsoOrNull = (value) => {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString();
};

const normalizeAuthor = (a) => {
  const name = String(a?.name || '').trim();
  if (!name) return null;
  return name;
};

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

export const searchPubMed = async ({ q, retmax = 6 } = {}) => {
  const query = String(q || '').trim();
  if (!query) return [];

  const key = JSON.stringify({ query, retmax });
  const cached = getCached(key);
  if (cached) return cached;

  const searchUrl = `${PUBMED_BASE}/esearch.fcgi?db=pubmed&retmode=json&retmax=${encodeURIComponent(String(retmax))}&term=${encodeURIComponent(query)}`;
  const searchRes = await fetch(searchUrl);
  if (!searchRes.ok) {
    const body = await searchRes.text().catch(() => '');
    throw new Error(`PubMed search failed (${searchRes.status}): ${body || searchRes.statusText}`);
  }

  const searchJson = await searchRes.json();
  const ids = searchJson?.esearchresult?.idlist || [];
  if (!Array.isArray(ids) || ids.length === 0) {
    setCached(key, [], 60_000);
    return [];
  }

  const summaryUrl = `${PUBMED_BASE}/esummary.fcgi?db=pubmed&retmode=json&id=${encodeURIComponent(ids.join(','))}`;
  const summaryRes = await fetch(summaryUrl);
  if (!summaryRes.ok) {
    const body = await summaryRes.text().catch(() => '');
    throw new Error(`PubMed summary failed (${summaryRes.status}): ${body || summaryRes.statusText}`);
  }

  const summaryJson = await summaryRes.json();
  const result = summaryJson?.result || {};
  const uids = result?.uids || [];

  const articles = (Array.isArray(uids) ? uids : [])
    .map((uid) => {
      const row = result?.[uid];
      if (!row) return null;

      const title = String(row?.title || '').replace(/\s+/g, ' ').trim();
      const journal = String(row?.fulljournalname || row?.source || '').trim();
      const pubDateRaw = String(row?.pubdate || '').trim();
      const pubDateIso = pubDateRaw ? toIsoOrNull(pubDateRaw) : null;

      const authors = Array.isArray(row?.authors)
        ? row.authors.map(normalizeAuthor).filter(Boolean)
        : [];

      return {
        provider: 'pubmed',
        id: String(uid),
        title,
        journal,
        pubDate: pubDateRaw,
        pubDateIso,
        authors,
        url: `https://pubmed.ncbi.nlm.nih.gov/${encodeURIComponent(String(uid))}/`,
        imageUrl: null
      };
    })
    .filter(Boolean);

  setCached(key, articles, 5 * 60_000);
  return articles;
};
