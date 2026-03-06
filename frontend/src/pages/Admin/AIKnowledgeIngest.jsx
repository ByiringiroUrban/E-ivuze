import React, { useContext, useMemo, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import { AdminContext } from '../../context/AdminContext';

const AIKnowledgeIngest = () => {
  const { t } = useTranslation();
  const { backendUrl, aToken } = useContext(AdminContext);

  const [documentId, setDocumentId] = useState('');
  const [title, setTitle] = useState('');
  const [source, setSource] = useState('');
  const [url, setUrl] = useState('');
  const [language, setLanguage] = useState('en');
  const [visibility, setVisibility] = useState('public');
  const [tagsRaw, setTagsRaw] = useState('');
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [lastResult, setLastResult] = useState(null);

  const tags = useMemo(() => {
    return String(tagsRaw || '')
      .split(',')
      .map(s => s.trim())
      .filter(Boolean)
      .slice(0, 30);
  }, [tagsRaw]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!aToken) return toast.error('Not authorized');

    if (!String(title || '').trim()) return toast.error('Title is required');
    if (!String(text || '').trim()) return toast.error('Text is required');

    try {
      setLoading(true);
      setLastResult(null);
      const payload = {
        title: String(title).trim(),
        text: String(text).trim(),
        source: String(source || ''),
        url: String(url || ''),
        language,
        visibility,
        tags
      };
      if (String(documentId || '').trim()) payload.documentId = String(documentId).trim();

      const { data } = await axios.post(`${backendUrl}/api/search/ingest`, payload, {
        headers: { aToken }
      });

      if (data?.success) {
        setLastResult(data);
        toast.success('Document ingested');
      } else {
        toast.error(data?.message || 'Failed to ingest document');
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || err?.message || 'Failed to ingest document');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white min-h-screen">
      <section className="bg-[#14324f] text-white px-4 sm:px-8 lg:px-12 py-10 sm:py-14">
        <div className="max-w-5xl space-y-3">
          <p className="text-xs   tracking-widest text-white/70">{t('ai.header.title') || 'AI'} / Knowledge</p>
          <h1 className="text-3xl sm:text-4xl font-semibold">AI Knowledge Ingest</h1>
          <p className="text-sm sm:text-base text-white/80 max-w-3xl">
            Add curated sources to power semantic search and grounded answers.
          </p>
        </div>
      </section>

      <section className="py-10 sm:py-12">
        <div className="w-full px-4 sm:px-8 lg:px-12">
          <div className="max-w-4xl">
            <form onSubmit={handleSubmit} className="border border-border rounded-lg p-5 sm:p-7 space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="  text-[11px] tracking-[0.3em] text-muted-foreground">Document Id (optional)</label>
                  <input
                    className="w-full border border-border px-4 py-3 mt-2"
                    value={documentId}
                    onChange={(e) => setDocumentId(e.target.value)}
                    placeholder="Existing document _id to update"
                  />
                </div>
                <div>
                  <label className="  text-[11px] tracking-[0.3em] text-muted-foreground">Visibility</label>
                  <select
                    className="w-full border border-border px-4 py-3 mt-2"
                    value={visibility}
                    onChange={(e) => setVisibility(e.target.value)}
                  >
                    <option value="public">public</option>
                    <option value="internal">internal</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="  text-[11px] tracking-[0.3em] text-muted-foreground">Title *</label>
                <input
                  className="w-full border border-border px-4 py-3 mt-2"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="E.g. Hypertension guidance"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="  text-[11px] tracking-[0.3em] text-muted-foreground">Source</label>
                  <input
                    className="w-full border border-border px-4 py-3 mt-2"
                    value={source}
                    onChange={(e) => setSource(e.target.value)}
                    placeholder="WHO, Ministry of Health, etc."
                  />
                </div>
                <div>
                  <label className="  text-[11px] tracking-[0.3em] text-muted-foreground">URL</label>
                  <input
                    className="w-full border border-border px-4 py-3 mt-2"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://..."
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="  text-[11px] tracking-[0.3em] text-muted-foreground">Language</label>
                  <select
                    className="w-full border border-border px-4 py-3 mt-2"
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                  >
                    <option value="en">en</option>
                    <option value="rw">rw</option>
                  </select>
                </div>
                <div>
                  <label className="  text-[11px] tracking-[0.3em] text-muted-foreground">Tags (comma-separated)</label>
                  <input
                    className="w-full border border-border px-4 py-3 mt-2"
                    value={tagsRaw}
                    onChange={(e) => setTagsRaw(e.target.value)}
                    placeholder="hypertension, bp, cardiology"
                  />
                </div>
              </div>

              <div>
                <label className="  text-[11px] tracking-[0.3em] text-muted-foreground">Text *</label>
                <textarea
                  className="w-full border border-border px-4 py-3 mt-2 min-h-[220px]"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Paste the knowledge content here..."
                  required
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full sm:w-auto bg-primary text-white px-6 py-3 text-xs   tracking-[0.4em] rounded disabled:opacity-60"
                >
                  {loading ? 'Ingesting...' : 'Ingest'}
                </button>
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => {
                    setDocumentId('');
                    setTitle('');
                    setSource('');
                    setUrl('');
                    setLanguage('en');
                    setVisibility('public');
                    setTagsRaw('');
                    setText('');
                    setLastResult(null);
                  }}
                  className="w-full sm:w-auto border border-border text-accent px-6 py-3 text-xs   tracking-[0.4em] rounded disabled:opacity-60"
                >
                  Clear
                </button>
              </div>
            </form>

            {lastResult?.success && (
              <div className="mt-6 border border-border rounded-lg p-5">
                <p className="text-xs   tracking-[0.3em] text-muted-foreground">Result</p>
                <div className="mt-2 text-sm text-accent space-y-1">
                  <div>Document: <span className="font-mono">{lastResult?.document?._id}</span></div>
                  <div>Chunks: {lastResult?.chunks}</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default AIKnowledgeIngest;
