const dotenv = require("dotenv");
const fetch = require("node-fetch");

dotenv.config({ path: ".env.local" });

async function verify() {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
        console.log("NOT_FOUND");
        return;
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`;
    try {
        const res = await fetch(url);
        const data = await res.json();
        const flashModels = data.models?.filter(m => m.name.includes("flash")) || [];
        console.log("Found Flash Models:", flashModels.map(m => m.name));

        if (flashModels.some(m => m.name === "models/gemini-1.5-flash")) {
            console.log("VERIFIED: models/gemini-1.5-flash is available.");
        } else {
            console.log("FAILED: models/gemini-1.5-flash NOT found.");
        }
    } catch (e) {
        console.error("Fetch Error:", e);
    }
}

verify();
