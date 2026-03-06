import jwt from 'jsonwebtoken';

// Lab authentication middleware
const authLab = async (req, res, next) => {
    try {
        const { token } = req.headers;
        if (!token) {
            return res.json({ success: false, message: 'Not Authorized Login Again' });
        }
        const token_decode = jwt.verify(token, process.env.JWT_SECRET);

        if (token_decode.role !== 'lab') {
            return res.json({ success: false, message: 'Not Authorized Login Again' });
        }

        req.labId = token_decode.id;
        next();
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

export default authLab;
