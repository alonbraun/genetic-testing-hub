#!/usr/bin/env python3
"""
Posts new genetictesting.com news articles to LinkedIn via Buffer.
Tracks already-posted articles in content/news/.linkedin-posted.json.
Outputs the post payload as JSON to stdout — actual Buffer API call
is made by the calling agent (Claude) using Buffer MCP tools.
"""

import os, re, json, glob, sys

NEWS_DIR     = os.path.join(os.path.dirname(__file__), "../content/news")
TRACKER_FILE = os.path.join(NEWS_DIR, ".linkedin-posted.json")
SITE_URL     = "https://genetictesting.com"

CATEGORY_HASHTAGS = {
    "Funding":   ["#VentureCapital", "#HealthTech", "#Innovation", "#Genomics", "#PrecisionMedicine"],
    "Research":  ["#Genomics", "#Innovation", "#HealthTech", "#PrecisionMedicine", "#Genetics"],
    "Product":   ["#Innovation", "#HealthTech", "#MedTech", "#Genomics", "#DNATesting"],
    "Industry":  ["#HealthTech", "#Innovation", "#Genomics", "#MedTech", "#DigitalHealth"],
    "Policy":    ["#Healthcare", "#Policy", "#Innovation", "#Genomics", "#PrecisionMedicine"],
}
DEFAULT_HASHTAGS = ["#Genomics", "#HealthTech", "#Innovation", "#PrecisionMedicine"]

CATEGORY_HOOKS = {
    "Funding":  "💰 Capital keeps flowing into genomics.",
    "Research": "🧬 New research worth a closer look.",
    "Product":  "🚀 A new product just hit the market.",
    "Industry": "📡 An industry milestone worth tracking.",
    "Policy":   "⚖️ A policy shift that could reshape the field.",
}
DEFAULT_HOOK = "🧬 What's new in genetic testing."


def parse_frontmatter(filepath):
    content = open(filepath).read()
    parts = content.split("---")
    if len(parts) < 3:
        return None, None
    fm_raw, body = parts[1], "---".join(parts[2:])
    fm = {}
    for line in fm_raw.strip().split("\n"):
        if ":" in line:
            k, _, v = line.partition(":")
            fm[k.strip()] = v.strip().strip('"')
    return fm, body.strip()


def load_tracker():
    if os.path.exists(TRACKER_FILE):
        data = json.load(open(TRACKER_FILE))
        if isinstance(data, list):
            return {"posted": [e["slug"] for e in data if "slug" in e], "_entries": data}
        return data
    return {"posted": [], "_entries": []}


def save_tracker(tracker):
    with open(TRACKER_FILE, "w") as f:
        json.dump(tracker.get("_entries", []), f, indent=2)


def slug_from_filename(filepath):
    return os.path.basename(filepath).replace(".md", "")


def make_post_copy(title, excerpt, category, slug):
    url = f"{SITE_URL}/news/{slug}"
    hashtags = CATEGORY_HASHTAGS.get(category, DEFAULT_HASHTAGS)
    hook = CATEGORY_HOOKS.get(category, DEFAULT_HOOK)
    text = f"{hook}\n\n{title}\n\n{excerpt}\n\nRead more on GeneticTesting.com 👉 {url}\n\n{' '.join(hashtags)}"
    return text


def utf16_len(s):
    return len(s.encode("utf-16-le")) // 2


def main():
    tracker = load_tracker()
    posted_slugs = set(tracker["posted"])

    files = sorted(glob.glob(f"{NEWS_DIR}/*.md"))
    pending = []

    for filepath in files:
        slug = slug_from_filename(filepath)
        if slug in posted_slugs:
            continue
        fm, body = parse_frontmatter(filepath)
        if not fm:
            continue
        if fm.get("sponsored", "false").lower() == "true":
            continue
        text = make_post_copy(fm.get("title", ""), fm.get("excerpt", ""), fm.get("category", ""), slug)
        pending.append({
            "slug": slug,
            "title": fm.get("title", ""),
            "excerpt": fm.get("excerpt", ""),
            "category": fm.get("category", ""),
            "date": fm.get("date", ""),
            "text": text,
            "annotations": [],
        })

    next_up = []
    if pending:
        next_up.append(pending[0])
        if len(pending) > 1 and pending[-1]["slug"] != pending[0]["slug"]:
            next_up.append(pending[-1])

    print(json.dumps({"pending": next_up, "remaining_after": len(pending) - len(next_up), "tracker_file": TRACKER_FILE}, indent=2))


if __name__ == "__main__":
    main()
