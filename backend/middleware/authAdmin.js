import jwt from 'jsonwebtoken'

// admin authentication middleware

const authAdmin = async (req, res, next) => {
    try {
        // Reduced logging to prevent infinite logs - only log errors and critical info
        const atoken = req.headers.atoken || req.headers['atoken'] || req.headers['aToken'];
        const dtoken = req.headers.dtoken || req.headers['dtoken'] || req.headers['dToken'];

        // Block doctors from accessing admin routes
        if (dtoken && !atoken) {
            console.log('❌ Admin Auth: Doctor token detected on admin route - Access denied');
            return res.json({
                success: false,
                message: 'Doctors cannot access admin pages. Please wait for approval to access your dashboard.'
            });
        }

        if (!atoken) {
            console.log('❌ Admin Auth: No admin token provided');
            return res.json({ success: false, message: 'Not Authorized Login Again' })
        }

        const adminEmail = process.env.ADMIN_EMAIL || 'admin@rwandahealth.com';
        const adminPassword = process.env.ADMIN_PASSWORD || 'Admin123456';
        const expectedTokenValue = adminEmail + adminPassword;

        let token_decode;
        try {
            token_decode = jwt.verify(atoken, process.env.JWT_SECRET);
        } catch (verifyError) {
            console.log('❌ Admin Auth: JWT Verification failed -', verifyError.message);
            return res.json({ success: false, message: 'Invalid token. Please login again.' })
        }

        if (token_decode === expectedTokenValue) {
            // Legacy / Super Admin Login (Hardcoded Email+Pass combination)
            next();
            return;
        }

        // Check if this is a database admin token
        if (token_decode && typeof token_decode === 'object' && token_decode.role === 'admin') {
            console.log('✅ Admin Auth: Database admin token verified');
            next();
            return;
        }

        // If it's a doctor token (has id) but NOT an admin role
        if (token_decode && typeof token_decode === 'object' && token_decode.id && token_decode.role !== 'admin') {
            const role = token_decode.role || 'doctor';
            console.log(`❌ Admin Auth: unauthorized role '${role}' on admin route`);
            return res.json({
                success: false,
                message: `${role.charAt(0).toUpperCase() + role.slice(1)}s cannot access admin pages.`
            });
        }

        console.log('❌ Admin Auth: Token not recognized as any type of admin');
        return res.json({ success: false, message: 'Not Authorized. Please login as admin again.' });

        // Success - no logging to prevent spam
        next()


    } catch (error) {
        console.error('❌ Admin auth error:', error.message);
        res.json({ success: false, message: error.message })

    }
}

export default authAdmin