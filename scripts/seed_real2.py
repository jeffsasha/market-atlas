#!/usr/bin/env python3
"""Seed data/cache.json with REAL GitHub data via gh_api.py CLI. No mock data."""
import json, subprocess, time, os, urllib.parse

BIN = "/home/hatch/workspace/skills/github/bin/gh_api.py"
OUT = "/home/hatch/workspace/market-atlas/data/cache.json"

QUERIES = [
    ("stock analysis language:python stars:>200", "us-equity"),
    ("quantitative finance backtesting stars:>200", "backtest"),
    ("algorithmic trading python stars:>200", "quant"),
    ("portfolio optimization python stars:>100", "portfolio"),
    ("cryptocurrency trading bot stars:>200", "crypto"),
    ("financial data api stocks stars:>100", "findata"),
    ("technical analysis indicators python stars:>150", "ta"),
]

def gh_get(path):
    # retry 3x
    for i in range(3):
        p = subprocess.run(["python3", BIN, "GET", path], capture_output=True, text=True, timeout=90)
        if p.returncode == 0:
            return json.loads(p.stdout)
        print(f"  retry {i+1} failed: {p.stderr[:200]}")
        time.sleep(2*(i+1))
    raise RuntimeError(f"gh_api failed for {path}")

def main():
    seen = {}
    for q, cat in QUERIES:
        print(f"Query: {q}", flush=True)
        qp = urllib.parse.quote(q)
        try:
            data = gh_get(f"/search/repositories?q={qp}&sort=stars&order=desc&per_page=20&page=1")
        except Exception as e:
            print(f"  failed: {e}", flush=True)
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
        time.sleep(3)
    repos = sorted(seen.values(), key=lambda r: r["stars"], reverse=True)
    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    payload = {"repositories": repos, "cached_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()), "count": len(repos)}
    with open(OUT, "w") as f: json.dump(payload, f, indent=2)
    print(f"Wrote {len(repos)} real repositories to {OUT}")
    # print sample for verification
    for r in repos[:5]:
        print(f"  {r['full_name']} ★{r['stars']}")

if __name__ == "__main__":
    main()
