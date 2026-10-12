#!/usr/bin/env python3
"""Seed data/cache.json with REAL GitHub data via the connected github skill. No mock data."""
import json, sys, time, os
sys.path.insert(0, "/home/hatch/workspace/skills/github/bin")
sys.path.insert(0, "/opt/hatch/skills/skill-creator/bin")
from gh_api import api_call

QUERIES = [
    ("stock analysis language:python stars:>200", "us-equity"),
    ("quantitative finance backtesting stars:>200", "backtest"),
    ("algorithmic trading python stars:>200", "quant"),
    ("portfolio optimization python stars:>100", "portfolio"),
    ("cryptocurrency trading bot stars:>200", "crypto"),
    ("financial data api stocks stars:>100", "findata"),
    ("technical analysis indicators python stars:>150", "ta"),
]

def main():
    seen = {}
    for q, cat in QUERIES:
        print(f"Query: {q}", flush=True)
        status, data = api_call("GET", f"/search/repositories?q={q.replace(' ', '+')}&sort=stars&order=desc&per_page=20&page=1")
        if status >= 400:
            print(f"  failed {status}: {data}", flush=True)
            continue
        for item in data.get("items", []):
            gid = item["id"]
            if gid in seen: continue
            owner, name = item["full_name"].split("/", 1)
            seen[gid] = {
                "github_id": gid, "owner": owner, "name": name, "full_name": item["full_name"],
                "description": item.get("description"), "html_url": item["html_url"],
                "homepage": item.get("homepage"), "language": item.get("language"),
                "stars": item.get("stargazers_count", 0), "forks": item.get("forks_count", 0),
                "open_issues": item.get("open_issues_count", 0),
                "license_spdx": (item.get("license") or {}).get("spdx_id"),
                "topics": item.get("topics", []), "created_at": item.get("created_at"),
                "pushed_at": item.get("pushed_at"), "updated_at": item.get("updated_at"),
                "avatar_url": (item.get("owner") or {}).get("avatar_url"),
                "category": cat, "stars_growth_7d": None,
                "last_synced_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
                "has_skill_md": False, "is_mcp": "mcp" in (item.get("topics") or []),
            }
        time.sleep(2)
    repos = sorted(seen.values(), key=lambda r: r["stars"], reverse=True)
    out = os.path.join(os.getcwd(), "data", "cache.json")
    # when run from repo root
    alt = "/home/hatch/workspace/market-atlas/data/cache.json"
    os.makedirs(os.path.dirname(alt), exist_ok=True)
    payload = {"repositories": repos, "cached_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()), "count": len(repos)}
    with open(alt, "w") as f: json.dump(payload, f, indent=2)
    print(f"Wrote {len(repos)} real repositories to {alt}")

if __name__ == "__main__":
    main()
