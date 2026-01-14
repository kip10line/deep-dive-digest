import type { YouTubeResult } from "@/types";

const YOUTUBE_API_BASE = "https://www.googleapis.com/youtube/v3";

/**
 * Search YouTube using Data API v3
 * Returns structured video data without any scraping
 */
export async function searchYouTube(query: string): Promise<YouTubeResult[]> {
    const apiKey = process.env.YOUTUBE_API_KEY;

    if (!apiKey) {
        throw new Error("YOUTUBE_API_KEY is not configured");
    }

    const params = new URLSearchParams({
        part: "snippet",
        q: query,
        type: "video",
        maxResults: "15",
        relevanceLanguage: "en",
        safeSearch: "moderate",
        key: apiKey,
    });

    const response = await fetch(`${YOUTUBE_API_BASE}/search?${params}`, {
        method: "GET",
        headers: {
            "Accept": "application/json",
        },
        next: { revalidate: 3600 }, // Cache for 1 hour
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(
            `YouTube API error: ${response.status} - ${error.error?.message || "Unknown error"}`
        );
    }

    const data = await response.json();

    if (!data.items || !Array.isArray(data.items)) {
        return [];
    }

    return data.items.map((item: any) => ({
        videoId: item.id?.videoId || "",
        title: item.snippet?.title || "",
        channelTitle: item.snippet?.channelTitle || "",
        publishedAt: item.snippet?.publishedAt || "",
        description: item.snippet?.description || "",
    }));
}
