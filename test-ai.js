const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config({ path: '.env.local' });

async function test() {
    try {
        const list = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GOOGLE_GEMINI_API_KEY}`
        ).then(res => res.json());

        const contentModels = list.models.filter(m => m.supportedGenerationMethods.includes("generateContent"));
        console.log("Models supporting generateContent:");
        contentModels.forEach(m => console.log(`- ${m.name} (${m.displayName})`));
    } catch (e) {
        console.error("Error listing models:", e.message);
    }
}

test();
