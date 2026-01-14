type TopicSummaryProps = {
    topic: string;
    summary: string;
    userLevel: string;
};

export default function TopicSummary({ topic, summary, userLevel }: TopicSummaryProps) {
    return (
        <div className="rounded-2xl bg-gradient-to-br from-blue-500/10 to-purple-600/10 border border-[var(--card-border)] p-8">
            <div className="flex items-start justify-between mb-4">
                <h2 className="text-3xl font-bold text-[var(--foreground)]">
                    {topic}
                </h2>
                <span className="px-3 py-1 rounded-full bg-[var(--card)] border border-[var(--card-border)] text-sm font-medium text-[var(--muted)]">
                    {userLevel}
                </span>
            </div>
            <p className="text-lg leading-relaxed text-[var(--foreground)] opacity-90">
                {summary}
            </p>
        </div>
    );
}
