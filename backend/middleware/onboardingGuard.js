import userModel from "../models/userModel.js";

/**
 * Middleware to enforce onboarding completion for patients.
 * If a patient (role: 'user') has not completed onboarding,
 * they are restricted to profile and onboarding completion routes.
 */
const onboardingGuard = async (req, res, next) => {
    try {
        const { userId } = req.body;

        if (!userId) {
            return res.json({ success: false, message: "Authentication required" });
        }

        const user = await userModel.findById(userId);

        if (!user) {
            return res.json({ success: false, message: "User not found" });
        }

        // Only enforce for patients (role: 'user')
        if (user.role === 'user' && !user.onboardingCompleted) {
            // List of allowed endpoints for patients mid-onboarding
            // We use req.baseUrl and req.path to identify the route
            const allowedPaths = [
                '/get-profile',
                '/complete-onboarding',
                '/logout', // Allow logout if exists
                '/change-password' // Allow if needed for first-time login
            ];

            // Normalize path to check
            const path = req.path;

            const isAllowed = allowedPaths.some(p => path.includes(p));

            if (!isAllowed) {
                return res.json({
                    success: false,
                    message: "ONBOARDING_REQUIRED",
                    onboardingCompleted: false
                });
            }
        }

        next();
    } catch (error) {
        console.error('❌ ONBOARDING GUARD ERROR:', error.message);
        res.json({ success: false, message: error.message });
    }
}

export default onboardingGuard;
