import { AlertTriangle } from "lucide-react";
import type { FetchError } from "@/types";

type ErrorDisplayProps = {
    error: FetchError;
};

export default function ErrorDisplay({ error }: ErrorDisplayProps) {
    return (
        <div className="mt-12 p-6 rounded-2xl bg-red-500/10 border border-red-500/20">
            <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                    <AlertTriangle className="w-8 h-8 text-red-500" />
                </div>
                <div>
                    <h3 className="text-xl font-semibold text-[var(--foreground)] mb-2">
                        External Sources Temporarily Unavailable
                    </h3>
                    <p className="text-[var(--muted)] leading-relaxed">
                        {error.message}
                    </p>
                    <p className="mt-4 text-sm text-[var(--muted)]">
                        Please try again later or check your API configuration.
                    </p>
                </div>
            </div>
        </div>
    );
}
