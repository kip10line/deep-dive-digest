// YouTube Data API v3 Types
export type YouTubeResult = {
    videoId: string;
    title: string;
    channelTitle: string;
    publishedAt: string;
    description: string;
};

// Web Search Types
export type ArticleResult = {
    title: string;
    url: string;
    source: string;
    snippet: string;
};

// Digest Types (updated with real data fields)
export type DigestData = {
    topic: string;
    user_level: "intermediate";
    summary: string;
    sections: Section[];
};

export type Section = {
    title: string;
    importance: string;
    overview: string;
    imageUrl?: string; // AI generated image
    imagePrompt?: string; // The prompt used to generate the image
    youtube: {
        videoId: string;
        channel: string;
        title: string;
        reason: string;
    };
    article: {
        url: string;
        source: string;
        note: string;
    };
};

export type YouTubeRecommendation = {
    videoId: string;
    channel: string;
    title: string;
    reason: string;
};

export type ArticleRecommendation = {
    url: string;
    source: string;
    note: string;
};

// Error types for UI
export type FetchError = {
    type: "youtube" | "web" | "llm" | "validation";
    message: string;
};

export type DigestResult =
    | { success: true; data: DigestData }
    | { success: false; error: FetchError };
