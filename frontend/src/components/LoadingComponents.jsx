// Health-Themed Loading Components Configuration
// All loaders use brand colors from react-loading-indicators
// Website: https://react-loading-indicators.netlify.app/

import {
    Atom,
    Commet,
    OrbitProgress,
    BlinkBlur,
    FourSquare,
    TrophySpin,
    ThreeDot,
    LifeLine,
    Mosaic,
    Riple
} from 'react-loading-indicators';

// Brand Colors from tailwind.config.js
export const COLORS = {
    primary: '#064e3b',      // Dark Green
    secondary: '#1e3a8a',    // Deep Blue
    accent: '#334155',       // Slate
    white: '#FFFFFF'
};

// Health-Themed Loading Components
export const LoadingComponents = {

    // For patient/appointment lists, medical records, data tables
    // For patient/appointment lists, medical records, data tables
    DataLoader: ({ text = "" }) => (
        <div className="flex flex-col items-center justify-center py-12">
            <OrbitProgress
                variant="dotted"
                color={COLORS.primary}
                size="medium"
                text={text}
                textColor={COLORS.accent}
            />
        </div>
    ),

    // For button submissions (appointments, prescriptions, forms)
    ButtonLoader: () => (
        <ThreeDot color={COLORS.white} size="small" text="" textColor="" />
    ),

    // For full page/dashboard loading
    // For full page/dashboard loading
    PageLoader: ({ text = "" }) => (
        <div className="flex flex-col items-center justify-center min-h-[400px]">
            <Atom
                color={COLORS.primary}
                size="medium"
                text={text}
                textColor={COLORS.accent}
            />
        </div>
    ),

    // For search operations (patients, doctors, medications)
    // For search operations (patients, doctors, medications)
    SearchLoader: () => (
        <div className="flex items-center justify-center py-8">
            <Commet
                color={COLORS.secondary}
                size="small"
                text=""
                textColor=""
            />
        </div>
    ),

    // For medical/clinical data (lab results, prescriptions, records)
    // For medical/clinical data (lab results, prescriptions, records)
    MedicalLoader: ({ text = "" }) => (
        <div className="flex flex-col items-center justify-center py-12">
            <Mosaic
                color={COLORS.primary}
                size="medium"
                text={text}
                textColor={COLORS.accent}
            />
            {text && <p className="mt-4 text-xs font-black uppercase tracking-widest text-slate-400">{text}</p>}
        </div>
    ),

    // For dashboard/analytics/reports
    // For dashboard/analytics/reports
    DashboardLoader: ({ text = "" } = {}) => (
        <div className="bg-white min-h-[500px] w-full">
            <div className="animate-pulse">
                <section className="bg-[#14324f] px-4 sm:px-8 lg:px-12 py-10 sm:py-14">
                    <div className="max-w-5xl space-y-4">
                        <div className="h-3 w-40 bg-white/20 rounded" />
                        <div className="h-9 w-3/4 bg-white/20 rounded" />
                        <div className="h-4 w-2/3 bg-white/20 rounded" />
                        {text ? <div className="h-3 w-56 bg-white/20 rounded" /> : null}
                    </div>
                </section>

                <section className="py-10 sm:py-12">
                    <div className="w-full px-4 sm:px-8 lg:px-12 space-y-10">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {Array.from({ length: 4 }).map((_, idx) => (
                                <div key={idx} className="border border-border bg-white shadow-sm rounded-xl p-6">
                                    <div className="flex items-center gap-4">
                                        <div className="h-12 w-12 rounded-full bg-gray-200" />
                                        <div className="flex-1 space-y-3">
                                            <div className="h-6 w-24 bg-gray-200 rounded" />
                                            <div className="h-3 w-32 bg-gray-200 rounded" />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-6">
                            <div className="border border-border bg-white shadow-sm rounded-xl p-6">
                                <div className="h-4 w-40 bg-gray-200 rounded mb-6" />
                                <div className="h-56 w-full bg-gray-200 rounded" />
                            </div>
                            <div className="border border-border bg-white shadow-sm rounded-xl p-6">
                                <div className="h-4 w-32 bg-gray-200 rounded mb-6" />
                                <div className="h-56 w-full bg-gray-200 rounded" />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {Array.from({ length: 3 }).map((_, idx) => (
                                <div key={idx} className="border border-border bg-white shadow-sm rounded-xl p-6">
                                    <div className="h-4 w-36 bg-gray-200 rounded mb-6" />
                                    <div className="h-44 w-full bg-gray-200 rounded" />
                                </div>
                            ))}
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-6">
                            <div className="border border-border bg-white shadow-sm rounded-xl">
                                <div className="px-5 py-4 border-b border-border">
                                    <div className="h-3 w-56 bg-gray-200 rounded mb-3" />
                                    <div className="h-3 w-72 bg-gray-200 rounded" />
                                </div>
                                <div className="p-5 space-y-4">
                                    {Array.from({ length: 5 }).map((_, idx) => (
                                        <div key={idx} className="h-10 w-full bg-gray-200 rounded" />
                                    ))}
                                </div>
                            </div>

                            <div className="border border-border bg-white shadow-sm rounded-xl p-5 space-y-6">
                                <div>
                                    <div className="h-3 w-36 bg-gray-200 rounded mb-3" />
                                    <div className="h-3 w-60 bg-gray-200 rounded" />
                                </div>
                                <div className="space-y-3">
                                    {Array.from({ length: 3 }).map((_, idx) => (
                                        <div key={idx} className="h-10 w-full bg-gray-200 rounded" />
                                    ))}
                                </div>
                                <div className="border-t border-border pt-5 space-y-2">
                                    <div className="h-3 w-24 bg-gray-200 rounded" />
                                    <div className="h-3 w-48 bg-gray-200 rounded" />
                                    <div className="h-3 w-40 bg-gray-200 rounded" />
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    ),

    // For inline/small loading states
    InlineLoader: () => (
        <Riple color={COLORS.primary} size="small" text="" textColor="" />
    ),

    // For health monitoring/vital signs (special health-themed loader)
    // For health monitoring/vital signs (special health-themed loader)
    HealthLoader: () => (
        <div className="flex flex-col items-center justify-center py-10">
            <LifeLine
                color={COLORS.primary}
                size="medium"
                text=""
                textColor=""
            />
        </div>
    ),

    // For appointments/scheduling
    // For appointments/scheduling
    AppointmentLoader: () => (
        <div className="flex flex-col items-center justify-center py-12">
            <OrbitProgress
                variant="split-disc"
                color={COLORS.primary}
                size="medium"
                text=""
                textColor=""
            />
        </div>
    ),

    // For patient records/history
    // For patient records/history
    RecordsLoader: () => (
        <div className="flex flex-col items-center justify-center py-12">
            <FourSquare
                color={COLORS.primary}
                size="medium"
                text=""
                textColor=""
            />
        </div>
    ),

    // For pharmacy/medication data
    // For pharmacy/medication data
    PharmacyLoader: () => (
        <div className="flex flex-col items-center justify-center py-12">
            <TrophySpin
                color={COLORS.primary}
                size="medium"
                text=""
                textColor=""
            />
        </div>
    ),

    // For redirecting/navigation (NEW)
    // For redirecting/navigation (NEW)
    RedirectLoader: () => (
        <div className="flex flex-col items-center justify-center min-h-[300px]">
            <BlinkBlur
                color={COLORS.primary}
                size="medium"
                text=""
                textColor=""
            />
        </div>
    ),

    // For processing/submitting data (NEW)
    // For processing/submitting data (NEW)
    ProcessingLoader: () => (
        <div className="flex flex-col items-center justify-center py-10">
            <Commet
                color={COLORS.secondary}
                size="medium"
                text=""
                textColor=""
            />
        </div>
    ),

    // For lab/diagnostic center operations (NEW - SPECIFIC)
    // For lab/diagnostic center operations (NEW - SPECIFIC)
    LabLoader: () => (
        <div className="flex flex-col items-center justify-center py-12">
            <Mosaic
                color={COLORS.primary}
                size="medium"
                text=""
                textColor=""
            />
        </div>
    ),
};

// Loader Selection Guide for Developers:
// 
// DataLoader        → Patient lists, doctor lists, general tables (OrbitProgress dotted)
// ButtonLoader      → All form submit buttons (ThreeDot)
// PageLoader        → Full page loads, route transitions (Atom)
// SearchLoader      → Search bars, filter operations (Commet)
// MedicalLoader     → Lab results, prescriptions, clinical notes (Mosaic)
// DashboardLoader   → Dashboard pages, analytics (skeleton)
// InlineLoader      → Small inline actions (Riple)
// HealthLoader      → Vital signs, health monitoring (LifeLine)
// AppointmentLoader → Appointment lists, booking (OrbitProgress split-disc)
// RecordsLoader     → Medical records, patient history (FourSquare)
// PharmacyLoader    → Medication lists, pharmacy orders (TrophySpin)
// RedirectLoader    → Page redirects, navigation (BlinkBlur) ✨ NEW
// ProcessingLoader  → Data processing, calculations (Commet) ✨ NEW
// LabLoader         → Lab/diagnostic operations (Mosaic) ✨ NEW

export default LoadingComponents;
