import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import './styles/animations.css'
// import './styles/toast.css' // Removed old bubble toast styles
import { BrowserRouter } from 'react-router-dom'
import { GoogleOAuthProvider } from '@react-oauth/google'
import AdminContextProvider from './context/AdminContext.jsx'
import DoctorContextProvider from './context/DoctorContext.jsx'
import HospitalContextProvider from './context/HospitalContext.jsx'
import PharmacyContextProvider from './context/PharmacyContext.jsx'
import LabContextProvider from './context/LabContext.jsx'
import AppContextProvider from './context/AppContext.jsx'
import './i18n'
import LanguageSwitch from './components/LanguageSwitch.jsx'
import { runLanguageTest } from './utils/runLanguageTest.js'
import { validateTranslations } from './utils/languageValidator.js'
import { installConsoleRedaction } from './utils/redactForLogs.js'

// Install console redaction for PHI/PII protection (unless disabled)
if (import.meta.env.VITE_LOG_REDACTION_DISABLED !== 'true') {
  installConsoleRedaction();
}

// Google OAuth Client ID - should be in environment variables
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || 'YOUR_GOOGLE_CLIENT_ID'

// Debug: Log the client ID (remove in production)
if (typeof window !== 'undefined') {
  if (GOOGLE_CLIENT_ID === 'YOUR_GOOGLE_CLIENT_ID' || !GOOGLE_CLIENT_ID) {
    console.error('❌ Google Client ID not configured! Please add VITE_GOOGLE_CLIENT_ID to your .env file');
  } else {
    console.log('✅ Google Client ID loaded:', GOOGLE_CLIENT_ID.substring(0, 20) + '...');
  }
}

// Make language test utilities available in browser console
if (typeof window !== 'undefined') {
  window.runLanguageTest = runLanguageTest;
  window.validateTranslations = validateTranslations;
}

createRoot(document.getElementById('root')).render(
  <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
    <BrowserRouter>
      <AdminContextProvider>
        <DoctorContextProvider>
          <HospitalContextProvider>
            <PharmacyContextProvider>
              <LabContextProvider>
                <AppContextProvider>
                  <App />
                  <LanguageSwitch />
                </AppContextProvider>
              </LabContextProvider>
            </PharmacyContextProvider>
          </HospitalContextProvider>
        </DoctorContextProvider>
      </AdminContextProvider>
    </BrowserRouter>
  </GoogleOAuthProvider>,
)
