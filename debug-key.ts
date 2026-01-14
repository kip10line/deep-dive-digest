import * as fs from "fs";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const key = process.env.GEMINI_API_KEY;
if (!key) {
    console.log("KEY_NOT_FOUND");
} else {
    console.log(`KEY_LENGTH: ${key.length}`);
    console.log(`KEY_START: ${key.substring(0, 4)}...${key.substring(key.length - 4)}`);
}
