
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
dotenv.config();

const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY;

async function testConnection(modelName) {
    console.log(`Testing model: ${modelName} using v1 API...`);
    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: modelName }, { apiVersion: 'v1' });

        const systemPrompt = "You are a helpful assistant.";
        const userMessage = "Explain in one sentence what a vaccine is.";

        const finalContents = [
            {
                role: 'user',
                parts: [{ text: `SYSTEM INSTRUCTIONS: ${systemPrompt}\n\nUSER INPUT FOLLOWS: ${userMessage}` }]
            }
        ];

        const result = await model.generateContent({ contents: finalContents });
        console.log(`SUCCESS [${modelName}]: ${result.response.text().substring(0, 50)}...`);
    } catch (error) {
        console.error(`FAILURE [${modelName}]:`, error.message);
    }
}

async function run() {
    const models = [
        'gemini-1.5-flash',
        'gemini-1.5-pro'
    ];
    for (const m of models) {
        await testConnection(m);
    }
}

run();
