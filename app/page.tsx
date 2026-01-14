import SearchInput from "@/components/SearchInput";
import TopicSummary from "@/components/TopicSummary";
import SectionCard from "@/components/SectionCard";
import ErrorDisplay from "@/components/ErrorDisplay";
import PDFButton from "@/components/PDFButton";
import type { DigestResult } from "@/types";
import { generateTopicDigest } from "./actions";

export default async function Home({
    searchParams,
}: {
    searchParams: Promise<{ topic?: string }>;
}) {
    const params = await searchParams;
    const topic = params.topic;

    // Generate digest if topic is provided
    const result = topic ? await generateTopicDigest(topic) : null;

    return (
        <main className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl sm:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
                        Deep-Dive Digest
                    </h1>
                    <p className="text-lg text-[var(--muted)] max-w-2xl mx-auto">
                        Quick, reliable overviews of any topic. 20-30 minutes of research, cleanly organized.
                    </p>
                </div>

                {/* Search Input */}
                <SearchInput />

                {/* Error State */}
                {result && !result.success && (
                    <ErrorDisplay error={result.error} />
                )}

                {/* Results */}
                {result && result.success && (
                    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-1000">
                        <div id="digest-content">
                            <TopicSummary
                                topic={topic || "Research Deep-Dive"}
                                summary={result.data.summary}
                            />

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {result.data.sections.map((section, idx) => (
                                    <SectionCard
                                        key={idx}
                                        section={section}
                                        index={idx}
                                    />
                                ))}
                            </div>
                        </div>

                        <div className="flex justify-center pb-12">
                            <PDFButton />
                        </div>
                    </div>
                )}

                {/* Empty State */}
                {!result && (
                    <div className="mt-16 text-center">
                        <p className="text-[var(--muted)] text-lg">
                            Enter a topic to generate a focused digest
                        </p>
                    </div>
                )}
            </div>
        </main>
    );
}
