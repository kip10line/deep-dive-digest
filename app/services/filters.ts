import type { YouTubeResult, ArticleResult } from "@/types";

/**
 * Deterministic filtering layer - NO LLM
 * Filters raw API results based on strict rules
 */

// Clickbait detection patterns
const CLICKBAIT_PATTERNS = [
    /^[A-Z\s!?]{10,}$/, // ALL CAPS titles
    /SHOCKING/i,
    /YOU WON'T BELIEVE/i,
    /MIND BLOWN/i,
    /\d+\s*(SECRETS|TRICKS|HACKS)/i,
    /WATCH BEFORE/i,
    /DELETED SOON/i,
    /EXPOSED/i,
];

/**
 * Check if title contains clickbait patterns
 */
function isClickbait(title: string): boolean {
    return CLICKBAIT_PATTERNS.some((pattern) => pattern.test(title));
}

/**
 * Check if query terms appear in text (title or snippet)
 */
function hasQueryRelevance(text: string, query: string): boolean {
    const queryTerms = query.toLowerCase().split(/\s+/).filter(t => t.length > 2);
    const textLower = text.toLowerCase();

    // At least one significant query term should appear
    return queryTerms.some((term) => textLower.includes(term));
}

/**
 * Filter YouTube results with deterministic rules
 */
export function filterYouTubeResults(
    results: YouTubeResult[],
    query: string
): YouTubeResult[] {
    const seenChannels = new Set<string>();

    return results.filter((video) => {
        // Rule 1: Must have valid videoId
        if (!video.videoId || !video.title) {
            return false;
        }

        // Rule 2: No clickbait
        if (isClickbait(video.title)) {
            return false;
        }

        // Rule 3: Must have query relevance (in title or description)
        const combinedText = `${video.title} ${video.description}`;
        if (!hasQueryRelevance(combinedText, query)) {
            return false;
        }

        // Rule 4: Max 1 video per channel
        const channelKey = video.channelTitle.toLowerCase();
        if (seenChannels.has(channelKey)) {
            return false;
        }
        seenChannels.add(channelKey);

        return true;
    });
}

/**
 * Filter article results with deterministic rules
 */
export function filterArticleResults(
    results: ArticleResult[],
    query: string
): ArticleResult[] {
    const seenDomains = new Set<string>();

    return results.filter((article) => {
        // Rule 1: Must have valid URL and title
        if (!article.url || !article.title) {
            return false;
        }

        // Rule 2: No clickbait
        if (isClickbait(article.title)) {
            return false;
        }

        // Rule 3: Must have query relevance
        const combinedText = `${article.title} ${article.snippet}`;
        if (!hasQueryRelevance(combinedText, query)) {
            return false;
        }

        // Rule 4: Max 1 article per domain
        const domainKey = article.source.toLowerCase();
        if (seenDomains.has(domainKey)) {
            return false;
        }
        seenDomains.add(domainKey);

        return true;
    });
}
