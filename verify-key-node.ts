import * as dotenv from "dotenv";
import fetch from "node-fetch";

dotenv.config({ path: ".env.local" });

async function verify() {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
        console.log("NOT_FOUND");
        return;
    }

    console.log(`Verifying key: ${key.substring(0, 4)}... (length: ${key.length})`);

    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`;
    try {
        const res = await fetch(url);
        const data = await res.json();
        console.log("Response:", JSON.stringify(data, null, 2));
    } catch (e) {
        console.error("Fetch Error:", e);
    }
}

verify();
