#!/usr/bin/env python3
"""Fold WeRead /readdata snapshots into one small stats payload for the launcher.

Sources (all read-only, no account credentials leave .private):
  stats-overall.json    readDays, readStat, preferTime, preferCategory, readTimes(per year)
  stats-weekly.json     per-day seconds for the last seven days
  stats-{year}.json     per-month seconds for 2021..2025
  stats-annually.json   per-month seconds for the current year

Output: .private/stats.json  (copied into the APK as assets/stats.json)
"""
import datetime
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
PRIVATE = ROOT / ".private"

HEAT_STEPS = [(60, 1), (240, 2), (600, 3)]      # minutes -> level, else 4


def load(name):
    p = PRIVATE / name
    if not p.exists():
        return None
    return json.loads(p.read_text(encoding="utf-8")).get("response", {})


def months_from(read_times):
    """12 month-start buckets -> 12 second values, ordered by month."""
    out = [0] * 12
    for k, v in sorted(read_times.items(), key=lambda kv: int(kv[0])):
        d = datetime.datetime.fromtimestamp(int(k))
        out[d.month - 1] += int(v)
    return out


def level(seconds):
    m = seconds / 60.0
    for edge, lv in HEAT_STEPS:
        if m < edge:
            return lv
    return 4


def main():
    overall = load("stats-overall.json") or {}
    weekly = load("stats-weekly.json") or {}
    annually = load("stats-annually.json") or {}

    years = []
    for y in range(2021, 2027):
        src = load("stats-annually.json") if y == 2026 else load(f"stats-{y}.json")
        if not src:
            continue
        months = months_from(src.get("readTimes", {}))
        if not any(months):
            continue
        years.append({"year": y, "months": months, "level": [level(m) for m in months]})

    daily = {}
    for k, v in (weekly.get("readTimes") or {}).items():
        d = datetime.datetime.fromtimestamp(int(k)).date().isoformat()
        daily[d] = int(v)

    cats = sorted(overall.get("preferCategory", []), key=lambda c: -c.get("readingTime", 0))
    cat_total = sum(c.get("readingTime", 0) for c in cats) or 1

    payload = {
        "generatedAt": datetime.datetime.now().astimezone().isoformat(timespec="seconds"),
        "snapshotFetchedAt": (json.loads((PRIVATE / "stats-overall.json").read_text(encoding="utf-8"))
                              .get("fetchedAt") if (PRIVATE / "stats-overall.json").exists() else None),
        "readDays": overall.get("readDays"),
        "totalReadTime": overall.get("totalReadTime"),
        "readStat": [{"label": s["stat"], "value": s["counts"]} for s in overall.get("readStat", [])],
        "daily": daily,
        "years": years,
        "hours": [int(v) for v in overall.get("preferTime", [])],
        "categories": [
            {"title": c["categoryTitle"], "books": c["readingCount"],
             "hours": round(c["readingTime"] / 3600.0, 1),
             "share": round(c["readingTime"] / cat_total * 100)}
            for c in cats[:5]
        ],
    }
    out = PRIVATE / "stats.json"
    out.write_text(json.dumps(payload, ensure_ascii=False, indent=1), encoding="utf-8")
    print("wrote", out, out.stat().st_size, "B")
    print("years", [(y["year"], sum(y["months"]) // 3600) for y in years])
    print("daily", payload["daily"])
    print("cats", [(c["title"], c["hours"], c["share"]) for c in payload["categories"]])


if __name__ == "__main__":
    main()
