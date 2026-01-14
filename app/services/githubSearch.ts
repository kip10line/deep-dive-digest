import type { ArticleResult } from "@/types";

/**
 * GitHub Search Service
 * Fetches open-source repositories from the GitHub API.
 * Uses public API (rate limited) but can be enhanced with GITHUB_TOKEN.
 */

export async function searchGitHub(query: string): Promise<ArticleResult[]> {
    try {
        // Search for repositories matching the query, sorted by stars
        const url = `https://api.github.com/search/repositories?q=${encodeURIComponent(query)}&sort=stars&order=desc&per_page=5`;

        const response = await fetch(url, {
            headers: {
                'Accept': 'application/vnd.github.v3+json',
                'User-Agent': 'Deep-Dive-Digest-App'
            }
        });

        if (!response.ok) {
            console.warn("GitHub search failed or rate limited.");
            return [];
        }

        const data = await response.json();
        if (!data.items) return [];

        return data.items.map((repo: any) => ({
            title: `[GitHub] ${repo.full_name}`,
            url: repo.html_url,
            source: `GitHub (${repo.stargazers_count} stars)`,
            snippet: repo.description ? repo.description : "No description available."
        }));
    } catch (error) {
        console.error("Error fetching from GitHub:", error);
        return [];
    }
}
