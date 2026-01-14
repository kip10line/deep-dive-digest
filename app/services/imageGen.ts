/**
 * Image Generation Service
 * For this implementation, we'll use a fast, public-access API (Pollinations.ai) 
 * to ensure images are generated reliably without complex billing setup, 
 * but it can be swapped for Gemini's Imagen API if desired.
 */

export async function generateSectionImage(prompt: string): Promise<string> {
    try {
        // We encode the prompt and return a static URL that generates the image on-the-fly.
        // Pollinations.ai is excellent for this as it's purely URL-based and fast.
        const encodedPrompt = encodeURIComponent(prompt);
        const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1024&height=600&nologo=true&seed=${Math.floor(Math.random() * 1000000)}`;

        // We optionally verify if the image is ready/valid, but Pollinations returns a direct image stream.
        return imageUrl;
    } catch (error) {
        console.error("Error creating image URL:", error);
        return "";
    }
}
