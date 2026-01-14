import type { ArticleResult } from "@/types";

/**
 * Tor Search Service - Using Ahmia.fi aggregator
 * Ahmia provides a clearnet entry point to search the Tor index (.onion sites).
 */

export async function searchTor(query: string): Promise<ArticleResult[]> {
    try {
        // Ahmia search URL (clearnet)
        // We use the human-readable search page and parse it, or hit their public-facing search logic if available.
        const searchUrl = `https://ahmia.fi/search/?q=${encodeURIComponent(query)}`;

        const response = await fetch(searchUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });

        if (!response.ok) {
            console.warn("Tor search (Ahmia) failed or timed out.");
            return [];
        }

        const html = await response.text();

        // Basic parsing logic for Ahmia search results
        // Results are typically in <li class="result">
        const results: ArticleResult[] = [];

        // Regex to find onion links and titles in the HTML
        // Pattern: <cite>(.*?)<\/cite> for the link, <h4><a href="...">(.*?)</a></h4> for title
        const resultPattern = /<li class="result">[\s\S]*?<h4><a href="\/redirect\/\?search_term=.*?&redirect_url=(.*?)">([\s\S]*?)<\/a><\/h4>[\s\S]*?<p>([\s\S]*?)<\/p>/g;

        let match;
        let count = 0;
        while ((match = resultPattern.exec(html)) !== null && count < 5) {
            let url = decodeURIComponent(match[1]);
            const title = match[2].replace(/<[^>]*>?/gm, '').trim();
            const snippet = match[3].replace(/<[^>]*>?/gm, '').trim();

            // Ensure it's an onion link
            if (url.includes('.onion')) {
                results.push({
                    title: `[Tor] ${title}`,
                    url: url,
                    source: "Tor Network (Onion Site)",
                    snippet: snippet
                });
                count++;
            }
        }

        return results;
    } catch (error) {
        console.error("Error fetching from Tor search:", error);
        return [];
    }
}
