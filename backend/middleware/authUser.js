import jwt from 'jsonwebtoken'

// user authentication middleware

const authUser = async (req, res, next) => {
    try {

        const { token } = req.headers
        if (!token) {
            console.log('❌ AUTH USER: No token provided');
            return res.json({ success: false, message: 'Not Authorized Login Again' })
        }

        const token_decode = jwt.verify(token, process.env.JWT_SECRET)
        req.body.userId = token_decode.id
        // Removed frequent success logging to prevent log spam

        next()


    } catch (error) {
        console.error('❌ AUTH USER ERROR:', error.message);
        res.json({ success: false, message: error.message })

    }
}

export default authUser