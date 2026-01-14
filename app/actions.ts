import type { DigestResult, YouTubeResult, ArticleResult } from "@/types";
import { searchYouTube } from "./services/youtube";
import { searchWeb } from "./services/webSearch";
import { searchTor } from "./services/torSearch";
import { searchNews } from "./services/newsSearch";
import { searchArXiv } from "./services/arxivSearch";
import { searchGitHub } from "./services/githubSearch";
import { filterYouTubeResults, filterArticleResults } from "./services/filters";
import { analyzeWithLLM } from "./services/llmAnalysis";
import { generateSectionImage } from "./services/imageGen";

/**
 * Main server action: 3-Layer Research Pipeline
 * 
 * Layer 1: External Data Fetch (YouTube API + Google PSE + Tor Search)
 * Layer 2: Deterministic Validation & Filtering
 * Layer 3: LLM Analysis (Selection Only)
 * 
 * NO MOCK DATA FALLBACK - Shows clear error if APIs unavailable
 */
export async function generateTopicDigest(
    topic: string,
    lang: "en" | "tr" = "tr"
): Promise<DigestResult> {
    try {
        // ─────────────────────────────────────────────────
        // LAYER 1: External Data Fetch
        // ─────────────────────────────────────────────────
        console.log(`[Layer 1] Fetching data for: ${topic}`);

        let rawVideos: YouTubeResult[] = [];
        let rawArticles: ArticleResult[] = [];
        let torArticles: ArticleResult[] = [];
        let rawNews: ArticleResult[] = [];
        let rawPapers: ArticleResult[] = [];
        let rawRepos: ArticleResult[] = [];

        try {
            rawVideos = await searchYouTube(topic);
        } catch (error) {
            console.error("[Layer 1] YouTube fetch failed:", error instanceof Error ? error.message : error);
            // Do not return here, try to fetch other sources
        }

        try {
            rawArticles = await searchWeb(topic);
        } catch (error) {
            console.error("[Layer 1] Web search failed:", error instanceof Error ? error.message : error);
            // Do not return here, try to fetch other sources
        }

        try {
            torArticles = await searchTor(topic);
        } catch (error) {
            console.error("[Layer 1] Tor search failed:", error instanceof Error ? error.message : error);
            // Do not return here, try to fetch other sources
        }

        try {
            rawNews = await searchNews(topic);
        } catch (error) {
            console.error("[Layer 1] News search failed:", error instanceof Error ? error.message : error);
            // Do not return here, try to fetch other sources
        }

        try {
            rawPapers = await searchArXiv(topic);
        } catch (error) {
            console.error("[Layer 1] ArXiv search failed:", error instanceof Error ? error.message : error);
            // Do not return here, try to fetch other sources
        }

        try {
            rawRepos = await searchGitHub(topic);
        } catch (error) {
            console.error("[Layer 1] GitHub search failed:", error instanceof Error ? error.message : error);
            // Do not return here, try to fetch other sources
        }

        // Combine all article sources (Web, Tor, News, Papers, GitHub)
        const combinedArticles = [...rawArticles, ...torArticles, ...rawNews, ...rawPapers, ...rawRepos];

        console.log(`[Layer 1] Fetched ${rawVideos.length} videos, ${rawArticles.length} web, ${torArticles.length} tor, ${rawNews.length} news, ${rawPapers.length} papers, ${rawRepos.length} repos`);

        // ─────────────────────────────────────────────────
        // LAYER 2: Validation & Filtering (Deterministic)
        // ─────────────────────────────────────────────────
        console.log("[Layer 2] Filtering results...");

        const filteredVideos = filterYouTubeResults(rawVideos, topic);
        const filteredArticles = filterArticleResults(combinedArticles, topic);

        console.log(`[Layer 2] After filtering: ${filteredVideos.length} videos, ${filteredArticles.length} articles`);

        // Check if we have enough data to proceed
        if (filteredVideos.length === 0 && filteredArticles.length === 0) {
            return {
                success: false,
                error: {
                    type: "validation",
                    message: "External sources temporarily unavailable: No relevant results found for this topic after filtering.",
                },
            };
        }

        // ─────────────────────────────────────────────────
        // LAYER 3: LLM Analysis (Selection Only)
        // ─────────────────────────────────────────────────
        console.log("[Layer 3] Analyzing with LLM...");

        try {
            const digest = await analyzeWithLLM({
                topic,
                lang,
                youtube_candidates: filteredVideos,
                article_candidates: filteredArticles,
            });

            console.log("[Layer 3] Analysis complete");

            // LAYER 4: Image Generation (Augmentation)
            console.log("[Layer 4] Generating section images...");
            const sectionsWithImages = await Promise.all(
                digest.sections.map(async (section) => {
                    const imageUrl = await generateSectionImage(section.imagePrompt || section.title);
                    return { ...section, imageUrl };
                })
            );

            const finalDigest = { ...digest, sections: sectionsWithImages };

            console.log("[Layer 4] Image generation complete");

            return {
                success: true,
                data: finalDigest,
            };
        } catch (error) {
            const message = error instanceof Error ? error.message : "Unknown error";
            console.error("[Layer 3] LLM analysis failed:", message);
            return {
                success: false,
                error: {
                    type: "llm",
                    message: `External sources temporarily unavailable: Analysis error. ${message}`,
                },
            };
        }
    } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
        console.error("[Pipeline] Unexpected error:", message);
        return {
            success: false,
            error: {
                type: "validation",
                message: `External sources temporarily unavailable: ${message}`,
            },
        };
    }
}
