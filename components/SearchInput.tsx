"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";

export default function SearchInput() {
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!input.trim()) return;

        setIsLoading(true);

        // Navigate to page with topic as search param
        router.push(`/?topic=${encodeURIComponent(input.trim())}`);
    };

    return (
        <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto">
            <div className="relative">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Enter any topic (e.g., Quantum Computing, Stoicism, Blockchain)"
                    className="w-full px-6 py-4 pr-14 text-lg rounded-2xl bg-[var(--card)] border-2 border-[var(--card-border)] focus:border-[var(--accent)] outline-none transition-all duration-200 placeholder:text-[var(--muted)]"
                    disabled={isLoading}
                />
                <button
                    type="submit"
                    disabled={isLoading || !input.trim()}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                    <Search className="w-5 h-5 text-white" />
                </button>
            </div>
        </form>
    );
}
