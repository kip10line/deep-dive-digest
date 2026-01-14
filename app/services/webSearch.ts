import type { ArticleResult } from "@/types";

const GOOGLE_PSE_BASE = "https://www.googleapis.com/customsearch/v1";

/**
 * Search web using Google Programmable Search Engine
 * Returns structured article data without any scraping
 */
export async function searchWeb(query: string): Promise<ArticleResult[]> {
    const apiKey = process.env.GOOGLE_PSE_API_KEY;
    const cx = process.env.GOOGLE_PSE_CX;

    if (!apiKey || !cx) {
        throw new Error("GOOGLE_PSE_API_KEY or GOOGLE_PSE_CX is not configured");
    }

    const params = new URLSearchParams({
        key: apiKey,
        cx: cx,
        q: query,
        num: "10",
        safe: "active",
    });

    const response = await fetch(`${GOOGLE_PSE_BASE}?${params}`, {
        method: "GET",
        headers: {
            "Accept": "application/json",
        },
        next: { revalidate: 3600 }, // Cache for 1 hour
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(
            `Google PSE error: ${response.status} - ${error.error?.message || "Unknown error"}`
        );
    }

    const data = await response.json();

    if (!data.items || !Array.isArray(data.items)) {
        return [];
    }

    return data.items.map((item: any) => ({
        title: item.title || "",
        url: item.link || "",
        source: extractDomain(item.displayLink || item.link || ""),
        snippet: item.snippet || "",
    }));
}

/**
 * Extract clean domain name from URL
 */
function extractDomain(url: string): string {
    try {
        const domain = new URL(url.startsWith("http") ? url : `https://${url}`).hostname;
        return domain.replace(/^www\./, "");
    } catch {
        return url;
    }
}
