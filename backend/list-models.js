
import https from 'https';
import dotenv from 'dotenv';
dotenv.config();

const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY;

function listModels() {
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

    https.get(url, (res) => {
        let rawData = '';
        res.on('data', (chunk) => { rawData += chunk; });
        res.on('end', () => {
            try {
                const data = JSON.parse(rawData);
                if (data.models) {
                    console.log("AVAILABLE MODELS:");
                    data.models.filter(m => m.supportedGenerationMethods.includes('generateContent'))
                        .forEach(m => console.log(`- ${m.name.replace('models/', '')}`));
                } else {
                    console.log("NO MODELS FOUND. Check API key.");
                    console.log(JSON.stringify(data, null, 2));
                }
            } catch (e) {
                console.error("JSON parse error:", e.message);
            }
        });
    }).on('error', (e) => {
        console.error("HTTP error:", e.message);
    });
}

listModels();
