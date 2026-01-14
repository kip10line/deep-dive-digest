import { GoogleGenerativeAI } from "@google/generative-ai";
import type { YouTubeResult, ArticleResult, DigestData } from "@/types";

/**
 * LLM Analysis Layer - SELECTION ONLY
 * Uses Google Gemini to select best resources from candidates
 * 
 * Client is initialized lazily to allow graceful error handling
 * when API key is missing
 */

// Lazy initialization - client created only when needed
let geminiClient: GoogleGenerativeAI | null = null;

function getGeminiClient(): GoogleGenerativeAI {
    if (!process.env.GEMINI_API_KEY) {
        throw new Error("GEMINI_API_KEY is not configured");
    }

    if (!geminiClient) {
        geminiClient = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    }

    return geminiClient;
}

type AnalysisInput = {
    topic: string;
    lang: "en" | "tr";
    youtube_candidates: YouTubeResult[];
    article_candidates: ArticleResult[];
};

/**
 * Build the strict selection-only prompt
 */
function buildPrompt(input: AnalysisInput): string {
    const { topic, lang, youtube_candidates, article_candidates } = input;

    const langInstruction = lang === "tr"
        ? "Write summary, importance, overview, reason, and note in TURKISH. Keep resource titles in original language."
        : "Write summary, importance, overview, reason, and note in ENGLISH.";

    return `You are selecting resources for a topic digest about: "${topic}"

${langInstruction}

AVAILABLE YOUTUBE VIDEOS (select from these ONLY):
${JSON.stringify(youtube_candidates, null, 2)}

AVAILABLE ARTICLES (select from these ONLY):
${JSON.stringify(article_candidates, null, 2)}

YOUR TASK:
1. Create exactly 3 sections that cover the key aspects of "${topic}"
2. For EACH section, SELECT:
   - 1 YouTube video (by exact videoId) from the list above
   - 1 article/source (by exact url) from the list above. 
   - **IMPORTANT**: Aim for a mix of standard web, [News] for timeliness, [Tor] for alternative views, [Paper] for academic depth, and [GitHub] for real-world code/tools.
3. Explain WHY you selected each resource (in ${lang === "tr" ? "Turkish" : "English"})
4. Write a 4-6 sentence summary of the topic

STRICT RULES - VIOLATIONS WILL CAUSE FAILURE:
❌ DO NOT invent new video titles - use EXACT titles from candidates
❌ DO NOT invent new channel names - use EXACT channelTitle from candidates
❌ DO NOT create new URLs - use EXACT url from candidates
❌ DO NOT add resources not in the provided lists
✅ You MAY leave youtube or article fields empty if nothing relevant fits
✅ You MUST use exact videoId/url values from the candidate lists
✅ Each section should focus on a different aspect of the topic

OUTPUT FORMAT (JSON only, no markdown, no code fences):
{
  "topic": "${topic}",
  "user_level": "intermediate",
  "summary": "4-6 sentences about the topic in ${lang === "tr" ? "Turkish" : "English"}",
  "sections": [
    {
      "title": "Section title in ${lang === "tr" ? "Turkish" : "English"}",
      "importance": "Why this section matters - one sentence",
      "overview": "Focused explanation of this aspect",
      "imagePrompt": "A detailed English prompt for an AI image generator",
      "youtube": {
        "videoId": "exact videoId from candidates",
        "channel": "exact channelTitle from candidates",
        "title": "exact title from candidates",
        "reason": "Why this video helps understand this section"
      },
      "article": {
        "url": "exact url from candidates",
        "source": "domain name",
        "note": "What you learn from this source"
      }
    }
  ]
}`;
}

/**
 * Validate that LLM output only uses provided candidates
 */
function validateSelection(
    output: DigestData,
    candidates: { youtube: YouTubeResult[]; articles: ArticleResult[] }
): boolean {
    const validVideoIds = new Set(candidates.youtube.map((v) => v.videoId));
    const validUrls = new Set(candidates.articles.map((a) => a.url));

    for (const section of output.sections) {
        // Check YouTube selection (skip if empty - allowed)
        if (section.youtube.videoId && !validVideoIds.has(section.youtube.videoId)) {
            console.error(`Invalid videoId: ${section.youtube.videoId}`);
            return false;
        }

        // Check article selection (skip if empty - allowed)
        if (section.article.url && !validUrls.has(section.article.url)) {
            console.error(`Invalid URL: ${section.article.url}`);
            return false;
        }
    }

    return true;
}

/**
 * Clean JSON response from potential markdown formatting
 */
function cleanJsonResponse(text: string): string {
    // Remove markdown code fences if present
    let cleaned = text.trim();
    if (cleaned.startsWith("```json")) {
        cleaned = cleaned.slice(7);
    } else if (cleaned.startsWith("```")) {
        cleaned = cleaned.slice(3);
    }
    if (cleaned.endsWith("```")) {
        cleaned = cleaned.slice(0, -3);
    }
    return cleaned.trim();
}

/**
 * Analyze candidates with LLM and return structured digest
 */
export async function analyzeWithLLM(input: AnalysisInput): Promise<DigestData> {
    // Lazy initialization - throws if API key missing
    const genAI = getGeminiClient();
    const model = genAI.getGenerativeModel({
        model: "gemini-2.5-flash",
        generationConfig: {
            temperature: 0.3,
            responseMimeType: "application/json",
        },
    });

    const prompt = buildPrompt(input);

    const result = await model.generateContent([
        {
            text: "You are a research assistant that ONLY selects and organizes resources from provided lists. You NEVER invent new resources. Always respond with valid JSON only.",
        },
        {
            text: prompt,
        },
    ]);

    const response = result.response;
    const content = response.text();

    if (!content) {
        throw new Error("No response from LLM");
    }

    let parsed: DigestData;
    try {
        const cleanedContent = cleanJsonResponse(content);
        parsed = JSON.parse(cleanedContent);
    } catch {
        throw new Error("Failed to parse LLM response as JSON");
    }

    // Validate sections count
    if (!parsed.sections || parsed.sections.length !== 3) {
        throw new Error("LLM did not return exactly 3 sections");
    }

    // Validate all selections are from candidates
    const isValid = validateSelection(parsed, {
        youtube: input.youtube_candidates,
        articles: input.article_candidates,
    });

    if (!isValid) {
        throw new Error("LLM returned resources not in candidate lists (hallucination detected)");
    }

    return parsed;
}
