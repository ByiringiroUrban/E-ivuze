import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import en from './locales/en/translation.json' with { type: 'json' };
import rw from './locales/rw/translation.json' with { type: 'json' };

const hasImportMeta = typeof import.meta !== 'undefined';
const isDev = hasImportMeta && import.meta.env && import.meta.env.DEV;
const loggedMissingKeys = new Set();
const isBrowser = typeof window !== 'undefined';

// Safe storage wrapper for Node/test environments
const storage = isBrowser && window.localStorage
	? window.localStorage
	: {
			getItem: () => null,
			setItem: () => {},
			removeItem: () => {},
		};

// Debug: Verify JSON files are loaded (log only in dev)
if (!en && isDev) console.error('[i18n] ERROR: English translations failed to load!');
if (!rw && isDev) console.error('[i18n] ERROR: Rwandan translations failed to load!');
if (en && typeof en !== 'object' && isDev) console.error('[i18n] ERROR: English translations is not an object!', typeof en);
if (rw && typeof rw !== 'object' && isDev) console.error('[i18n] ERROR: Rwandan translations is not an object!', typeof rw);
if (isDev) {
	console.log('[i18n] English translations loaded:', en ? `Yes (${Object.keys(en).length} top-level keys)` : 'No');
	console.log('[i18n] Rwandan translations loaded:', rw ? `Yes (${Object.keys(rw).length} top-level keys)` : 'No');
}

const resources = {
	en: { translation: en || {} },
	rw: { translation: rw || {} },
};

i18n
	// LanguageDetector depends on window/navigator; only enable it in the browser
	.use(isBrowser ? LanguageDetector : { type: 'languageDetector', detect: () => null, init: () => {}, cacheUserLanguage: () => {} })
	.use(initReactI18next)
	.init({
		resources,
		lng: storage.getItem('preferredLanguage') || 'rw',
		fallbackLng: 'en',
		interpolation: { escapeValue: false },
		react: { useSuspense: false },
		...(isBrowser
			? {
		detection: {
			order: ['localStorage', 'navigator'],
			caches: ['localStorage'],
			lookupLocalStorage: 'preferredLanguage',
		},
				}
			: {}),
		missingKeyHandler: (lng, ns, key) => {
			if (!isDev) return;
			const normalizedLng = Array.isArray(lng) ? lng.join(',') : String(lng);
			const id = `${normalizedLng}:${ns}:${key}`;
			if (loggedMissingKeys.has(id)) return;
			loggedMissingKeys.add(id);
			console.warn(`[i18n] Missing translation key: "${key}" (lang="${normalizedLng}", ns="${ns}")`);
		},
		saveMissing: false, // Don't save missing keys to avoid cluttering
		parseMissingKeyHandler: (key) => key,
	})
	.then(() => {
		if (isDev) {
			console.log('[i18n] Initialized successfully. Current language:', i18n.language);
			console.log('[i18n] Available languages:', Object.keys(resources));
			i18n.on('languageChanged', (lng) => {
				console.log('[i18n] Language changed to:', lng);
			});
		}
	})
	.catch((error) => {
		if (isDev) console.error('[i18n] Initialization error:', error);
	});

export default i18n;

