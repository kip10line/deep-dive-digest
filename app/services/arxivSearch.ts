import type { ArticleResult } from "@/types";

/**
 * ArXiv Search Service
 * Fetches scientific papers from the ArXiv API.
 * No API key required.
 */

export async function searchArXiv(query: string): Promise<ArticleResult[]> {
    try {
        const url = `https://export.arxiv.org/api/query?search_query=all:${encodeURIComponent(query)}&start=0&max_results=5`;

        const response = await fetch(url);
        if (!response.ok) {
            console.warn("ArXiv search failed.");
            return [];
        }

        const xml = await response.text();

        // Simplistic XML parsing for ArXiv as we don't want heavy dependencies
        const results: ArticleResult[] = [];
        const entryPattern = /<entry>([\s\S]*?)<\/entry>/g;
        const titlePattern = /<title>([\s\S]*?)<\/title>/;
        const summaryPattern = /<summary>([\s\S]*?)<\/summary>/;
        const idPattern = /<id>([\s\S]*?)<\/id>/;

        let match;
        let count = 0;
        while ((match = entryPattern.exec(xml)) !== null && count < 5) {
            const entryContent = match[1];
            const titleMatch = entryContent.match(titlePattern);
            const summaryMatch = entryContent.match(summaryPattern);
            const idMatch = entryContent.match(idPattern);

            if (titleMatch && idMatch) {
                results.push({
                    title: `[Paper] ${titleMatch[1].replace(/\n/g, ' ').trim()}`,
                    url: idMatch[1].trim(),
                    source: "ArXiv.org (Scientific Paper)",
                    snippet: summaryMatch ? summaryMatch[1].replace(/\n/g, ' ').trim().slice(0, 200) + "..." : "No summary available."
                });
                count++;
            }
        }

        return results;
    } catch (error) {
        console.error("Error fetching from ArXiv:", error);
        return [];
    }
}
