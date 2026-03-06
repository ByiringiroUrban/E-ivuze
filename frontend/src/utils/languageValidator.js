/**
 * Language Validator - Validates translation files and checks for missing keys
 */

import enTranslations from '../locales/en/translation.json';
import rwTranslations from '../locales/rw/translation.json';

/**
 * Recursively get all keys from a nested object
 */
const getAllKeys = (obj, prefix = '') => {
  let keys = [];
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const fullKey = prefix ? `${prefix}.${key}` : key;
      if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
        keys = keys.concat(getAllKeys(obj[key], fullKey));
      } else {
        keys.push(fullKey);
      }
    }
  }
  return keys;
};

/**
 * Get nested value from object using dot notation
 */
const getNestedValue = (obj, path) => {
  return path.split('.').reduce((current, key) => current && current[key], obj);
};

/**
 * Run validation and return result (no side effects). Use for CI or when you need the result only.
 */
export const validateTranslationsForCI = () => {
  const enKeys = getAllKeys(enTranslations);
  const rwKeys = getAllKeys(rwTranslations);
  const missingInRw = enKeys.filter(key => !rwKeys.includes(key));
  const missingInEn = rwKeys.filter(key => !enKeys.includes(key));
  const emptyEn = enKeys.filter(key => {
    const value = getNestedValue(enTranslations, key);
    return typeof value === 'string' && value.trim() === '';
  });
  const emptyRw = rwKeys.filter(key => {
    const value = getNestedValue(rwTranslations, key);
    return typeof value === 'string' && value.trim() === '';
  });
  return {
    enKeys: enKeys.length,
    rwKeys: rwKeys.length,
    missingInRw,
    missingInEn,
    emptyEn,
    emptyRw,
    isValid: missingInRw.length === 0 && missingInEn.length === 0 && emptyEn.length === 0 && emptyRw.length === 0
  };
};

/**
 * Validate translation files. Logs to console when verbose is true (default: true in dev).
 */
export const validateTranslations = (options = {}) => {
  const verbose = options.verbose ?? (typeof process !== 'undefined' && process.env?.NODE_ENV !== 'production');
  const result = validateTranslationsForCI();

  if (verbose) {
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔍 TRANSLATION VALIDATION');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log(`📊 Statistics:`);
    console.log(`   English keys: ${result.enKeys}`);
    console.log(`   Kinyarwanda keys: ${result.rwKeys}`);
    console.log('');

    if (result.missingInRw.length > 0) {
      console.log(`❌ Missing in Kinyarwanda (${result.missingInRw.length}):`);
      result.missingInRw.slice(0, 20).forEach(key => console.log(`   - ${key}`));
      if (result.missingInRw.length > 20) console.log(`   ... and ${result.missingInRw.length - 20} more`);
      console.log('');
    }
    if (result.missingInEn.length > 0) {
      console.log(`⚠️  Missing in English (${result.missingInEn.length}):`);
      result.missingInEn.slice(0, 20).forEach(key => console.log(`   - ${key}`));
      if (result.missingInEn.length > 20) console.log(`   ... and ${result.missingInEn.length - 20} more`);
      console.log('');
    }
    if (result.emptyEn.length > 0) {
      console.log(`⚠️  Empty values in English (${result.emptyEn.length}):`);
      result.emptyEn.slice(0, 10).forEach(key => console.log(`   - ${key}`));
      if (result.emptyEn.length > 10) console.log(`   ... and ${result.emptyEn.length - 10} more`);
      console.log('');
    }
    if (result.emptyRw.length > 0) {
      console.log(`⚠️  Empty values in Kinyarwanda (${result.emptyRw.length}):`);
      result.emptyRw.slice(0, 10).forEach(key => console.log(`   - ${key}`));
      if (result.emptyRw.length > 10) console.log(`   ... and ${result.emptyRw.length - 10} more`);
      console.log('');
    }
    if (result.isValid) console.log('✅ All translations are complete and valid!\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  }

  return result;
};

// Make available in browser console
if (typeof window !== 'undefined') {
  window.validateTranslations = validateTranslations;
  window.validateTranslationsForCI = validateTranslationsForCI;
}

export default validateTranslations;
