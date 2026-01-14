"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

export default function ThemeToggle() {
    const [theme, setTheme] = useState<"light" | "dark">("dark");
    const [mounted, setMounted] = useState(false);

    // Only run on client after mount
    useEffect(() => {
        setMounted(true);
        // Check localStorage or system preference
        const stored = localStorage.getItem("theme") as "light" | "dark" | null;
        if (stored) {
            setTheme(stored);
            document.documentElement.classList.toggle("dark", stored === "dark");
        } else {
            const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
            const initialTheme = prefersDark ? "dark" : "light";
            setTheme(initialTheme);
            document.documentElement.classList.toggle("dark", prefersDark);
        }
    }, []);

    const toggleTheme = () => {
        const newTheme = theme === "light" ? "dark" : "light";
        setTheme(newTheme);
        localStorage.setItem("theme", newTheme);
        document.documentElement.classList.toggle("dark");
    };

    // Avoid hydration mismatch
    if (!mounted) {
        return <div className="fixed top-6 right-6 z-50 w-10 h-10" />;
    }

    return (
        <button
            onClick={toggleTheme}
            className="fixed top-6 right-6 z-50 p-2.5 rounded-full bg-[var(--card)] border border-[var(--card-border)] hover:border-[var(--accent)] transition-all duration-200 shadow-lg hover:shadow-xl"
            aria-label="Toggle theme"
        >
            {theme === "light" ? (
                <Moon className="w-5 h-5 text-[var(--foreground)]" />
            ) : (
                <Sun className="w-5 h-5 text-[var(--foreground)]" />
            )}
        </button>
    );
}
