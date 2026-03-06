/**
 * Simple Language Test - Can be run in browser console
 * Usage: Import and call runLanguageTest() or access via window.runLanguageTest()
 */

import i18n from '../i18n';

export const runLanguageTest = () => {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🌐 LANGUAGE SWITCHING TEST');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // Test current state
  console.log('📋 Current State:');
  console.log('   i18n.language:', i18n.language);
  console.log('   localStorage preferredLanguage:', localStorage.getItem('preferredLanguage'));
  console.log('   Has English bundle:', i18n.hasResourceBundle('en', 'translation'));
  console.log('   Has Kinyarwanda bundle:', i18n.hasResourceBundle('rw', 'translation'));
  console.log('');

  // Test switching to English
  console.log('📋 Testing Switch to English:');
  i18n.changeLanguage('en').then(() => {
    console.log('   ✅ Switched to English');
    console.log('   Current language:', i18n.language);
    console.log('   Test translation (doctor.dashboard):', i18n.t('doctor.dashboard'));
    console.log('   Test translation (Logout):', i18n.t('Logout'));
    
    // Test switching to Kinyarwanda
    setTimeout(() => {
      console.log('\n📋 Testing Switch to Kinyarwanda:');
      i18n.changeLanguage('rw').then(() => {
        console.log('   ✅ Switched to Kinyarwanda');
        console.log('   Current language:', i18n.language);
        console.log('   Test translation (doctor.dashboard):', i18n.t('doctor.dashboard'));
        console.log('   Test translation (Logout):', i18n.t('Logout'));
        
        console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('✅ LANGUAGE TEST COMPLETE');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
      });
    }, 1000);
  });

  return 'Language test started. Check console for results.';
};

// Make available globally
if (typeof window !== 'undefined') {
  window.runLanguageTest = runLanguageTest;
  console.log('🌐 Language test available. Run: runLanguageTest()');
}

export default runLanguageTest;
