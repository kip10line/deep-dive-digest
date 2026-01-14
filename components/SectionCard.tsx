import { Video, FileText, Sparkles, ExternalLink } from "lucide-react";
import type { Section } from "@/types";

type SectionCardProps = {
    section: Section;
    index: number;
};

export default function SectionCard({ section, index }: SectionCardProps) {
    // Build YouTube watch URL from videoId
    const youtubeUrl = section.youtube.videoId
        ? `https://www.youtube.com/watch?v=${section.youtube.videoId}`
        : null;

    return (
        <div className="rounded-2xl bg-[var(--card)] border border-[var(--card-border)] p-6 hover:border-[var(--accent)] transition-all duration-200 hover:shadow-lg">
            {/* Header */}
            <div className="mb-4">
                {/* Section Image */}
                {section.imageUrl && (
                    <div className="relative w-full h-48 sm:h-64 mb-6 rounded-xl overflow-hidden border border-[var(--card-border)] bg-black/20">
                        <img
                            src={section.imageUrl}
                            alt={section.title}
                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                            loading="lazy"
                        />
                        <div className="absolute bottom-3 right-3 px-2 py-1 rounded bg-black/60 backdrop-blur-md border border-white/10">
                            <span className="text-[10px] text-white/70 font-mono tracking-wider italic">AI GENERATED</span>
                        </div>
                    </div>
                )}

                <div className="flex items-center gap-2 mb-2">
                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-white text-sm font-bold">
                        {index + 1}
                    </span>
                    <h3 className="text-2xl font-bold text-[var(--foreground)]">
                        {section.title}
                    </h3>
                </div>

                {/* Importance Badge */}
                <div className="flex items-start gap-2 mt-3 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                    <Sparkles className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                    <p className="text-sm font-medium text-[var(--foreground)]">
                        <span className="text-amber-500 font-semibold">Why important:</span> {section.importance}
                    </p>
                </div>
            </div>

            {/* Overview */}
            <p className="text-base leading-relaxed text-[var(--foreground)] opacity-80 mb-6">
                {section.overview}
            </p>

            {/* Resources Grid */}
            <div className="grid md:grid-cols-2 gap-4">
                {/* YouTube Recommendation */}
                <div className="p-4 rounded-xl bg-[var(--background)] border border-[var(--card-border)]">
                    <div className="flex items-center gap-2 mb-3">
                        <Video className="w-5 h-5 text-red-500" />
                        <h4 className="font-semibold text-[var(--foreground)]">Video Resource</h4>
                    </div>
                    {section.youtube.videoId ? (
                        <div className="space-y-2">
                            <p className="text-sm">
                                <span className="font-medium text-[var(--muted)]">Channel:</span>{" "}
                                <span className="text-[var(--foreground)]">{section.youtube.channel}</span>
                            </p>
                            <p className="text-sm">
                                <span className="font-medium text-[var(--muted)]">Video:</span>{" "}
                                <span className="text-[var(--foreground)]">{section.youtube.title}</span>
                            </p>
                            {youtubeUrl && (
                                <a
                                    href={youtubeUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 text-sm text-[var(--accent)] hover:underline mt-2"
                                >
                                    Watch on YouTube <ExternalLink className="w-3 h-3" />
                                </a>
                            )}
                            <p className="text-xs text-[var(--muted)] italic mt-2">
                                ↳ {section.youtube.reason}
                            </p>
                        </div>
                    ) : (
                        <p className="text-sm text-[var(--muted)] italic">
                            No suitable video found for this section.
                        </p>
                    )}
                </div>

                {/* Article Recommendation */}
                <div className="p-4 rounded-xl bg-[var(--background)] border border-[var(--card-border)]">
                    <div className="flex items-center gap-2 mb-3">
                        <FileText className="w-5 h-5 text-blue-500" />
                        <h4 className="font-semibold text-[var(--foreground)]">Article Resource</h4>
                    </div>
                    {section.article.url ? (
                        <div className="space-y-2">
                            <p className="text-sm">
                                <span className="font-medium text-[var(--muted)]">Source:</span>{" "}
                                <span className="text-[var(--foreground)]">{section.article.source}</span>
                            </p>
                            <a
                                href={section.article.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-sm text-[var(--accent)] hover:underline mt-2"
                            >
                                Read Article <ExternalLink className="w-3 h-3" />
                            </a>
                            <p className="text-xs text-[var(--muted)] italic mt-2">
                                ↳ {section.article.note}
                            </p>
                        </div>
                    ) : (
                        <p className="text-sm text-[var(--muted)] italic">
                            No suitable article found for this section.
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}
