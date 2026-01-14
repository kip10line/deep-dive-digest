import { GoogleGenerativeAI } from "@google/generative-ai";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

async function discoverModels() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        console.error("GEMINI_API_KEY not found in .env.local");
        return;
    }

    const genAI = new GoogleGenerativeAI(apiKey);

    try {
        console.log("Testing gemini-1.5-flash-latest...");
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });
        const result = await model.generateContent("test");
        console.log("Success with gemini-1.5-flash-latest!");
        return;
    } catch (e) {
        console.log("gemini-1.5-flash-latest failed.");
    }

    try {
        console.log("Testing gemini-1.5-flash...");
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent("test");
        console.log("Success with gemini-1.5-flash!");
        return;
    } catch (e) {
        console.log("gemini-1.5-flash failed.");
    }

    // If both failed, let's try a direct curl to list models to see what we CAN see
    console.log("Both failed. Checking key validity again...");
}

discoverModels();
