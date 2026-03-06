import { v2 as cloudinary } from 'cloudinary'

const connectCloudinary = async () => {
    try {
        const cloudName = process.env.CLOUDINARY_NAME;
        const apiKey = process.env.CLOUDINARY_API_KEY;
        const apiSecret = process.env.CLOUDINARY_SECRET_KEY;

        if (!cloudName || !apiKey || !apiSecret) {
            console.warn('⚠️  Cloudinary credentials not configured in .env file');
            console.warn('   Set the following in your .env file:');
            console.warn('   CLOUDINARY_NAME=your_cloud_name');
            console.warn('   CLOUDINARY_API_KEY=your_api_key');
            console.warn('   CLOUDINARY_SECRET_KEY=your_api_secret');
            console.warn('   Get your credentials from: https://cloudinary.com/console');
            return;
        }

        await cloudinary.config({
            cloud_name: cloudName,
            api_key: apiKey,
            api_secret: apiSecret
        });
        
        console.log('✅ Cloudinary configured successfully');
    } catch (error) {
        console.error('❌ Error configuring Cloudinary:', error.message);
    }
}

export default connectCloudinary;