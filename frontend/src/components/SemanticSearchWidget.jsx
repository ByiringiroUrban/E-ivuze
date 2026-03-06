import React, { useContext, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FaSearch, FaTimes } from 'react-icons/fa';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { AppContext } from '../context/AppContext';
import { AdminContext } from '../context/AdminContext';
import { DoctorContext } from '../context/DoctorContext';
import { HospitalContext } from '../context/HospitalContext';
import { PharmacyContext } from '../context/PharmacyContext';
import { LabContext } from '../context/LabContext';

const SemanticSearchWidget = () => {
  const { t, i18n } = useTranslation();
  const { backendUrl, token } = useContext(AppContext);
  const { aToken } = useContext(AdminContext);
  const { dToken } = useContext(DoctorContext);
  const { hToken } = useContext(HospitalContext);
  const { pToken } = useContext(PharmacyContext);
  const { lToken } = useContext(LabContext);

  const patientToken = typeof token === 'string' ? token : '';

  const role = aToken
    ? 'admin'
    : dToken
      ? 'doctor'
      : hToken
        ? 'hospital'
        : pToken
          ? 'pharmacy'
          : lToken
            ? 'lab'
            : patientToken
              ? 'patient'
              : 'guest';

  const activeToken =
    role === 'admin'
      ? aToken
      : role === 'doctor'
        ? dToken
        : role === 'hospital'
          ? hToken
          : role === 'pharmacy'
            ? pToken
            : role === 'lab'
              ? lToken
              : role === 'patient'
                ? patientToken
                : '';

  const headers = useMemo(() => {
    if (!activeToken) return {};
    if (role === 'doctor') return { dToken: activeToken };
    if (role === 'admin') return { aToken: activeToken };
    if (role === 'hospital') return { hToken: activeToken };
    if (role === 'pharmacy') return { pToken: activeToken };
    if (role === 'lab') return { lToken: activeToken };
    return { token: activeToken };
  }, [activeToken, role]);

  const language = i18n.language?.split('-')[0] || 'rw';

  const [isOpen, setIsOpen] = useState(false);
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(false);
  const [answer, setAnswer] = useState('');
  const [results, setResults] = useState([]);
  const [externalResults, setExternalResults] = useState([]);

  const runSearch = async (e) => {
    e?.preventDefault();
    if (!String(q || '').trim() || loading) return;

    setLoading(true);
    setAnswer('');
    setResults([]);
    setExternalResults([]);

    try {
      const { data } = await axios.post(
        `${backendUrl}/api/search/semantic`,
        { q: String(q).trim(), topK: 5, includeAnswer: true, includeExternal: true, externalTopK: 6, language },
        { headers }
      );

      if (data?.success) {
        setAnswer(data.answer || '');
        setResults(Array.isArray(data.results) ? data.results : []);
        setExternalResults(Array.isArray(data.externalResults) ? data.externalResults : []);
      } else {
        setAnswer(data?.message || 'Search failed');
      }
    } catch (err) {
      setAnswer(err?.response?.data?.message || err?.message || 'Search failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label={t('ai.search.open') || 'Open AI search'}
        title={t('ai.search.open') || 'AI Search'}
        className="fixed bottom-24 right-24 z-[9999] flex h-14 w-14 items-center justify-center border border-white bg-white/90 text-primary shadow-xl backdrop-blur transition hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary/40"
      >
        <FaSearch className="text-xl" />
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[10000] flex items-end sm:items-center justify-center bg-black/50 p-3">
          <div className="w-full max-w-2xl bg-white border border-slate-200 shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between bg-primary px-5 py-4 text-white">
              <div className="font-semibold">{t('ai.search.title') || 'Semantic Search'}</div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 transition hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/40"
              >
                <FaTimes />
              </button>
            </div>

            <form onSubmit={runSearch} className="p-4 border-b border-slate-200">
              <div className="flex gap-2">
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder={t('ai.search.placeholder') || 'Ask a health question...'}
                  className="flex-1 border border-slate-200 px-4 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/40"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-primary px-4 py-2 text-white text-sm transition hover:bg-primary/90 disabled:opacity-60"
                >
                  {loading ? (t('ai.search.loading') || 'Searching...') : (t('ai.search.go') || 'Search')}
                </button>
              </div>
            </form>

            <div className="max-h-[70vh] overflow-y-auto bg-slate-50 p-4 space-y-4">
              {answer ? (
                <div className="bg-white border border-slate-200 p-4 text-sm text-slate-800">
                  <div className="prose prose-slate max-w-none">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        p: ({ node, ...props }) => <p className="mb-3 last:mb-0 whitespace-pre-wrap" {...props} />,
                        ul: ({ node, ...props }) => <ul className="list-disc pl-5 mb-3" {...props} />,
                        ol: ({ node, ...props }) => <ol className="list-decimal pl-5 mb-3" {...props} />,
                        li: ({ node, ...props }) => <li className="mb-1" {...props} />,
                        a: ({ node, ...props }) => (
                          <a className="text-primary hover:underline" target="_blank" rel="noopener noreferrer" {...props} />
                        ),
                        code: ({ node, inline, ...props }) =>
                          inline
                            ? <code className="bg-slate-100 px-1 rounded" {...props} />
                            : <code className="block bg-slate-100 p-3 rounded my-2 overflow-x-auto" {...props} />
                      }}
                    >
                      {answer}
                    </ReactMarkdown>
                  </div>
                </div>
              ) : null}

              {results.length ? (
                <div className="space-y-3">
                  <div className="text-xs uppercase tracking-[0.3em] text-slate-500">
                    {t('ai.search.sources') || 'Sources'}
                  </div>
                  {results.map((r) => (
                    <div key={r.chunkId || r.rank} className="bg-white border border-slate-200 p-4">
                      <div className="text-xs text-slate-500">
                        [{r.rank}] {r?.document?.title || 'Source'}
                      </div>
                      <div className="mt-2 text-sm text-slate-700 whitespace-pre-wrap">{r.text}</div>
                      {r?.document?.url ? (
                        <a
                          href={r.document.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-2 inline-block text-xs text-primary hover:underline"
                        >
                          {r.document.url}
                        </a>
                      ) : null}
                    </div>
                  ))}
                </div>
              ) : null}

              {externalResults.length ? (
                <div className="space-y-3">
                  <div className="text-xs uppercase tracking-[0.3em] text-slate-500">
                    {t('ai.search.externalSources') || 'External sources'}
                  </div>
                  {externalResults.map((r) => (
                    <div key={r.id || r.url} className="bg-white border border-slate-200 p-4">
                      <div className="text-sm font-medium text-slate-800">{r.title || 'Article'}</div>
                      <div className="mt-1 text-xs text-slate-500">
                        {(r.journal || '').trim() ? r.journal : null}
                        {r.pubDate ? (r.journal ? ` • ${r.pubDate}` : r.pubDate) : null}
                      </div>
                      {Array.isArray(r.authors) && r.authors.length ? (
                        <div className="mt-2 text-xs text-slate-600">
                          {(t('ai.search.authors') || 'Authors')}: {r.authors.slice(0, 6).join(', ')}{r.authors.length > 6 ? '…' : ''}
                        </div>
                      ) : null}
                      {r.url ? (
                        <a
                          href={r.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-2 inline-block text-xs text-primary hover:underline"
                        >
                          {r.url}
                        </a>
                      ) : null}
                    </div>
                  ))}
                </div>
              ) : null}

              {!loading && !answer && !results.length ? (
                <div className="text-sm text-slate-600">
                  {t('ai.search.empty') || 'Search across trusted knowledge sources.'}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SemanticSearchWidget;
