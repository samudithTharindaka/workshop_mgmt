#!/usr/bin/env python3
"""One-off dual-theme class pass: base = light, dark: = existing dark (selector [data-theme='dark'])."""
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1] / "src"

FILES = [
    ROOT / "views" / "DashboardView.vue",
    ROOT / "views" / "AppointmentsView.vue",
    ROOT / "views" / "InspectionsView.vue",
    ROOT / "views" / "JobCardsView.vue",
]

# (pattern, repl) — apply in order; patterns skip tokens already prefixed with dark:
RULES = [
    (r"(?<!dark:)text-slate-50\b", "text-slate-950 dark:text-slate-50"),
    (r"(?<!dark:)text-slate-100\b", "text-slate-900 dark:text-slate-100"),
    (r"(?<!dark:)text-slate-200\b", "text-slate-800 dark:text-slate-200"),
    (r"(?<!dark:)text-slate-300\b", "text-slate-700 dark:text-slate-300"),
    (r"(?<!dark:)text-slate-400\b", "text-slate-600 dark:text-slate-400"),
    (r"(?<!dark:)text-slate-500\b", "text-slate-600 dark:text-slate-500"),
    (r"(?<!dark:)text-slate-600\b", "text-slate-600 dark:text-slate-600"),
    (r"(?<!dark:)text-blue-300\b", "text-blue-700 dark:text-blue-300"),
    (r"(?<!dark:)text-blue-400\b", "text-blue-600 dark:text-blue-400"),
    (r"(?<!dark:)text-red-200\b", "text-red-800 dark:text-red-200"),
    (r"(?<!dark:)text-red-300\b", "text-red-700 dark:text-red-300"),
    (r"(?<!dark:)text-amber-100\b", "text-amber-900 dark:text-amber-100"),
    (r"(?<!dark:)text-emerald-300\b", "text-emerald-800 dark:text-emerald-300"),
    (r"(?<!dark:)border-slate-800/90\b", "border-slate-200/90 dark:border-slate-800/90"),
    (r"(?<!dark:)border-slate-800/80\b", "border-slate-200/90 dark:border-slate-800/80"),
    (r"(?<!dark:)border-slate-800/60\b", "border-slate-200/80 dark:border-slate-800/60"),
    (r"(?<!dark:)border-slate-700/90\b", "border-slate-300/90 dark:border-slate-700/90"),
    (r"(?<!dark:)border-slate-800\b", "border-slate-200 dark:border-slate-800"),
    (r"(?<!dark:)border-slate-700\b", "border-slate-300 dark:border-slate-700"),
    (r"(?<!dark:)bg-\[#0B0F19\]/90\b", "bg-white/90 dark:bg-[#0B0F19]/90"),
    (r"(?<!dark:)bg-\[#0B0F19\]\b", "bg-slate-50 dark:bg-[#0B0F19]"),
    (r"(?<!dark:)bg-slate-900/95\b", "bg-slate-100/95 dark:bg-slate-900/95"),
    (r"(?<!dark:)bg-slate-950/80\b", "bg-white/95 dark:bg-slate-950/80"),
    (r"(?<!dark:)bg-slate-900/40\b", "bg-slate-100/80 dark:bg-slate-900/40"),
    (r"(?<!dark:)bg-slate-900/50\b", "bg-slate-100/90 dark:bg-slate-900/50"),
    (r"(?<!dark:)bg-slate-900/30\b", "bg-slate-100/70 dark:bg-slate-900/30"),
    (r"(?<!dark:)bg-slate-950\b", "bg-slate-50 dark:bg-slate-950"),
    (r"(?<!dark:)bg-slate-900\b", "bg-white dark:bg-slate-900"),
    (r"(?<!dark:)bg-slate-800/30\b", "bg-slate-200/50 dark:bg-slate-800/30"),
    (r"(?<!dark:)bg-slate-800\b", "bg-slate-200 dark:bg-slate-800"),
    (r"(?<!dark:)hover:bg-slate-800/80\b", "hover:bg-slate-200/80 dark:hover:bg-slate-800/80"),
    (r"(?<!dark:)hover:bg-slate-800/60\b", "hover:bg-slate-200/60 dark:hover:bg-slate-800/60"),
    (r"(?<!dark:)hover:bg-slate-800/50\b", "hover:bg-slate-200/70 dark:hover:bg-slate-800/50"),
    (r"(?<!dark:)hover:bg-slate-800/30\b", "hover:bg-slate-200/50 dark:hover:bg-slate-800/30"),
    (r"(?<!dark:)hover:bg-slate-800\b", "hover:bg-slate-200 dark:hover:bg-slate-800"),
    (r"(?<!dark:)hover:text-slate-300\b", "hover:text-slate-800 dark:hover:text-slate-300"),
    (r"(?<!dark:)hover:text-blue-400\b", "hover:text-blue-600 dark:hover:text-blue-400"),
    (r"(?<!dark:)border-t border-slate-800\b", "border-t border-slate-200 dark:border-slate-800"),
    (r"(?<!dark:)border-b border-slate-800\b", "border-b border-slate-200 dark:border-slate-800"),
    (r"(?<!dark:)ring-blue-500/30\b", "ring-blue-400/40 dark:ring-blue-500/30"),
]


def transform(s: str) -> str:
    for pat, repl in RULES:
        s = re.sub(pat, repl, s)
    return s


def main():
    for path in FILES:
        if not path.exists():
            raise SystemExit(f"missing {path}")
        orig = path.read_text(encoding="utf-8")
        new = transform(orig)
        if new != orig:
            path.write_text(new, encoding="utf-8")
            print("updated", path.relative_to(ROOT.parent))


if __name__ == "__main__":
    main()
