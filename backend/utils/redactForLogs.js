const DEFAULT_MAX_STRING_LENGTH = 180;
const DEFAULT_MAX_JSON_LENGTH = 2000;

const EMAIL_RE = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi;
const JWT_RE = /\beyJ[a-zA-Z0-9_-]{10,}(?:\.[a-zA-Z0-9_-]{10,}){0,2}\b/g;
const OBJECT_ID_RE = /\b[a-f0-9]{24}\b/gi;
const LONG_DIGITS_RE = /\b\d{9,}\b/g;
const PHONE_RE = /\b(?:\+?\d{1,3}[\s.-]?)?(?:\(?\d{2,3}\)?[\s.-]?)?\d{3}[\s.-]?\d{4,}\b/g;

const truncate = (value, maxLen) => {
  const s = String(value ?? '');
  if (!maxLen || s.length <= maxLen) return s;
  return `${s.slice(0, Math.max(0, maxLen - 1))}…`;
};

const redactString = (value, maxLen) => {
  const s = String(value ?? '');
  let out = s;
  out = out.replace(JWT_RE, '[REDACTED_JWT]');
  out = out.replace(EMAIL_RE, '[REDACTED_EMAIL]');
  out = out.replace(PHONE_RE, '[REDACTED_PHONE]');
  out = out.replace(OBJECT_ID_RE, '[REDACTED_ID]');
  out = out.replace(LONG_DIGITS_RE, '[REDACTED_NUMBER]');
  return truncate(out, maxLen);
};

const isSensitiveKey = (key) => {
  const k = String(key || '');
  return /(pass(word)?|token|secret|authorization|api[_-]?key|jwt|email|phone|mobile)/i.test(k);
};

const isTextKey = (key) => {
  const k = String(key || '');
  return /(text|message|note|prompt|query|q|content|diagnosis|symptom|complaint|assessment|plan|history|transcript)/i.test(k);
};

const isEmbeddingKey = (key) => {
  const k = String(key || '');
  return /(embedding|vector|values)/i.test(k);
};

const looksLikeJsonString = (s) => {
  const t = String(s ?? '').trim();
  if (!t) return false;
  if (t.length > 10000) return false;
  const startsOk = t.startsWith('{') || t.startsWith('[');
  const endsOk = t.endsWith('}') || t.endsWith(']');
  return startsOk && endsOk;
};

const looksLikeFreeText = (s) => {
  const t = String(s ?? '').trim();
  if (!t) return false;
  if (t.length >= 160) return true;
  if (t.includes('\n')) return t.length >= 80;
  const words = t.split(/\s+/).filter(Boolean).length;
  return words >= 18 && t.length >= 90;
};

const looksLikeStackTrace = (s) => {
  const t = String(s ?? '');
  if (!t) return false;
  if (t.length < 80) return false;
  return /\n\s*at\s+/.test(t) || /^Error:/.test(t) || /\s+at\s+\S+\s*\(/.test(t);
};

const sanitizeAny = (value, opts, depth, seen, parentKey = '') => {
  const { maxDepth, maxArrayLength, maxStringLength } = opts;

  if (value === null || value === undefined) return value;

  if (typeof value === 'string') {
    if (looksLikeJsonString(value)) {
      try {
        const parsed = JSON.parse(value);
        const sanitizedParsed = sanitizeAny(parsed, opts, depth + 1, seen);
        return truncate(redactString(JSON.stringify(sanitizedParsed), opts.maxJsonLength), opts.maxJsonLength);
      } catch {
        // fallthrough
      }
    }

    if (looksLikeStackTrace(value)) {
      return redactString(value, Math.max(maxStringLength * 3, 600));
    }

    if (parentKey && isTextKey(parentKey)) {
      return `[REDACTED_TEXT len=${value.length}]`;
    }
    if (looksLikeFreeText(value)) {
      return `[REDACTED_TEXT len=${value.length}]`;
    }
    return redactString(value, maxStringLength);
  }

  if (typeof value === 'number' || typeof value === 'boolean') return value;
  if (typeof value === 'bigint') return value.toString();

  if (value instanceof Date) return value.toISOString();

  if (value instanceof Error) {
    return {
      name: value.name,
      message: redactString(value.message, maxStringLength),
      stack: redactString(value.stack || '', Math.max(maxStringLength * 3, 300))
    };
  }

  if (typeof value !== 'object') {
    return redactString(String(value), maxStringLength);
  }

  if (seen.has(value)) return '[CIRCULAR]';
  seen.add(value);

  if (depth >= maxDepth) {
    if (Array.isArray(value)) return `[Array(${value.length})]`;
    return '[Object]';
  }

  if (Array.isArray(value)) {
    return value.slice(0, maxArrayLength).map(v => sanitizeAny(v, opts, depth + 1, seen));
  }

  const out = {};
  for (const [k, v] of Object.entries(value)) {
    if (isSensitiveKey(k)) {
      out[k] = '[REDACTED]';
      continue;
    }
    if (isEmbeddingKey(k)) {
      out[k] = '[REDACTED_EMBEDDING]';
      continue;
    }
    if (typeof v === 'string' && isTextKey(k)) {
      out[k] = `[REDACTED_TEXT len=${v.length}]`;
      continue;
    }
    out[k] = sanitizeAny(v, opts, depth + 1, seen, k);
  }
  return out;
};

export const redactForLogs = (value, options = {}) => {
  const opts = {
    maxStringLength: Number(options.maxStringLength || DEFAULT_MAX_STRING_LENGTH),
    maxJsonLength: Number(options.maxJsonLength || DEFAULT_MAX_JSON_LENGTH),
    maxDepth: Number(options.maxDepth || 4),
    maxArrayLength: Number(options.maxArrayLength || 20)
  };

  try {
    if (typeof value === 'string') {
      return sanitizeAny(value, opts, 0, new WeakSet());
    }

    const sanitized = sanitizeAny(value, opts, 0, new WeakSet());
    const json = JSON.stringify(sanitized);
    return truncate(redactString(json, opts.maxJsonLength), opts.maxJsonLength);
  } catch {
    try {
      return redactString(String(value), opts.maxStringLength);
    } catch {
      return '[UNSERIALIZABLE]';
    }
  }
};

let consoleRedactionInstalled = false;

export const installConsoleRedaction = (options = {}) => {
  if (consoleRedactionInstalled) return;
  consoleRedactionInstalled = true;

  const methods = ['log', 'info', 'warn', 'error', 'debug'];
  for (const m of methods) {
    if (typeof console[m] !== 'function') continue;
    const original = console[m].bind(console);
    console[m] = (...args) => {
      try {
        const redactedArgs = args.map((a, idx) => {
          const prev = idx > 0 ? args[idx - 1] : null;
          if (typeof prev === 'string') {
            if (isSensitiveKey(prev)) return '[REDACTED]';
            if (isTextKey(prev)) {
              if (typeof a === 'string') return `[REDACTED_TEXT len=${a.length}]`;
              return '[REDACTED_TEXT]';
            }
          }
          return redactForLogs(a, options);
        });
        original(...redactedArgs);
      } catch {
        original(...args);
      }
    };
  }
};
