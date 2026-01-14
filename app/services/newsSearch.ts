import type { ArticleResult } from "@/types";

/**
 * International News Service
 * Uses Google Search API restricted to news domains or specialized news query parameters.
 * We'll use the existing GOOGLE_PSE_API_KEY but refine the search for "news" specifically.
 */

export async function searchNews(query: string): Promise<ArticleResult[]> {
    const apiKey = process.env.GOOGLE_PSE_API_KEY;
    const cx = process.env.GOOGLE_PSE_CX;

    if (!apiKey || !cx) {
        console.error("News search failed: API keys not configured.");
        return [];
    }

    try {
        // Add "news" keyword and restrict to recent results (last month)
        const newsQuery = `${query} news`;
        const url = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${cx}&q=${encodeURIComponent(newsQuery)}&sort=date:r:pastMonth&num=5`;

        const response = await fetch(url);
        const data = await response.json();

        if (!data.items) return [];

        return data.items.map((item: any) => ({
            title: `[News] ${item.title || ""}`,
            url: item.link || "",
            source: extractDomain(item.displayLink || item.link || ""),
            snippet: item.snippet || "",
        }));
    } catch (error) {
        console.error("Error fetching international news:", error);
        return [];
    }
}

function extractDomain(url: string): string {
    try {
        const domain = new URL(url.startsWith('http') ? url : `https://${url}`).hostname;
        return domain.replace('www.', '');
    } catch {
        return url;
    }
}
