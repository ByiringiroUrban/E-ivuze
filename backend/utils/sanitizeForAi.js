const DEFAULT_MAX_CHARS = Number.parseInt(process.env.AI_PROMPT_MAX_CHARS || '2000', 10);

const EMAIL_RE = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi;
const JWT_RE = /\beyJ[a-zA-Z0-9_-]{10,}(?:\.[a-zA-Z0-9_-]{10,}){0,2}\b/g;
const OBJECT_ID_RE = /\b[a-f0-9]{24}\b/gi;
const LONG_DIGITS_RE = /\b\d{9,}\b/g;
const PHONE_RE = /\b(?:\+?\d{1,3}[\s.-]?)?(?:\(?\d{2,3}\)?[\s.-]?)?\d{3}[\s.-]?\d{4,}\b/g;

const truncate = (value, maxLen) => {
  const s = String(value ?? '');
  if (!Number.isFinite(maxLen) || maxLen <= 0) return s;
  if (s.length <= maxLen) return s;
  return s.slice(0, maxLen);
};

export const sanitizeForAiText = (value, options = {}) => {
  const {
    maxChars = Number.isFinite(DEFAULT_MAX_CHARS) && DEFAULT_MAX_CHARS > 0 ? DEFAULT_MAX_CHARS : 2000,
    redactEmails = true,
    redactPhones = true,
    redactIds = true,
    redactLongNumbers = true,
    redactTokens = true
  } = options;

  const s = String(value ?? '');
  let out = s;

  if (redactTokens) out = out.replace(JWT_RE, '[REDACTED_JWT]');
  if (redactEmails) out = out.replace(EMAIL_RE, '[REDACTED_EMAIL]');
  if (redactPhones) out = out.replace(PHONE_RE, '[REDACTED_PHONE]');
  if (redactIds) out = out.replace(OBJECT_ID_RE, '[REDACTED_ID]');
  if (redactLongNumbers) out = out.replace(LONG_DIGITS_RE, '[REDACTED_NUMBER]');

  return truncate(out, maxChars);
};

export const sanitizeForAiContents = (contents, options = {}) => {
  if (!Array.isArray(contents)) return contents;

  return contents.map((c) => {
    if (!c || typeof c !== 'object') return c;
    const parts = Array.isArray(c.parts)
      ? c.parts.map((p) => {
        if (!p || typeof p !== 'object') return p;
        if ('text' in p) {
          return {
            ...p,
            text: sanitizeForAiText(p.text, options)
          };
        }
        return p;
      })
      : c.parts;

    return {
      ...c,
      parts
    };
  });
};
