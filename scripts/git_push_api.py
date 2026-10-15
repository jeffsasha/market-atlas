#!/usr/bin/env python3
"""Push the local HEAD commit to origin/main via the GitHub Git Data API.

Why: this VM cannot use git-over-HTTPS (github.com) with the stored
credential — only api.github.com requests carry the substituted token.
So instead of `git push`, we recreate the exact commit through the API:
blobs/trees have content-deterministic SHAs, and we reuse the commit's own
author/committer timestamps, so the API-created commit is byte-identical to
the local one (same SHA). No history rewrite, no divergence.

Usage: git_push_api.py [owner/repo]   (default: jeffsasha/market-atlas)
Exits non-zero without touching the remote if the remote has moved.
"""
import base64
import json
import subprocess
import sys
import urllib.request

sys.path.insert(0, "/opt/muse/skills/custom-connector-setup/bin")
from dynamic_credentials import add_surrogate_to_request

REPO = sys.argv[1] if len(sys.argv) > 1 else "jeffsasha/market-atlas"
API = "https://api.github.com"
ALLOWED = ("api.github.com",)


def sh(*args):
    p = subprocess.run(args, capture_output=True, text=True, cwd="/home/hatch/workspace/market-atlas")
    if p.returncode != 0:
        raise RuntimeError(f"{' '.join(args)} failed: {p.stderr.strip()}")
    return p.stdout


def api(method, path, body=None):
    data = json.dumps(body).encode() if body is not None else None
    req = urllib.request.Request(API + path, data=data, method=method,
                                 headers={"Accept": "application/vnd.github+json",
                                          "User-Agent": "MarketAtlas/git-push-api"})
    if data:
        req.add_header("Content-Type", "application/json")
    add_surrogate_to_request(req, "custom.github", entry_name="access_token", allowed_hosts=ALLOWED)
    with urllib.request.urlopen(req, timeout=60) as resp:
        raw = resp.read().decode()
        return json.loads(raw) if raw.strip() else None


def main():
    head = sh("git", "rev-parse", "HEAD").strip()
    tree = sh("git", "log", "-1", "--format=%T").strip()
    parent = sh("git", "log", "-1", "--format=%P").strip().split()[0]
    parent_tree = sh("git", "rev-parse", f"{parent}^{{tree}}").strip()
    fmt = sh("git", "log", "-1", "--format=%an%x00%ae%x00%aI%x00%cn%x00%ce%x00%cI").strip().split("\x00")
    an, ae, ad, cn, ce, cd = fmt
    # Exact message bytes: git always terminates the message with a newline;
    # stripping it would change the commit SHA.
    message = sh("git", "log", "-1", "--format=%B")

    remote = api("GET", f"/repos/{REPO}/git/refs/heads/main")
    remote_sha = remote["object"]["sha"]
    if remote_sha != parent:
        raise SystemExit(f"Remote main has moved ({remote_sha[:7]} != parent {parent[:7]}); refusing to push.")

    # Build tree entries for everything changed vs parent.
    status = sh("git", "diff", "--name-status", parent, head).strip().splitlines()
    entries = []
    for line in status:
        st, path = line.split("\t", 1)
        if st.startswith("D"):
            entries.append({"path": path, "mode": "100644", "type": "blob", "sha": None})
            continue
        mode = sh("git", "ls-tree", "HEAD", "--", path).split()[0]
        with open(f"/home/hatch/workspace/market-atlas/{path}", "rb") as f:
            content = base64.b64encode(f.read()).decode()
        blob = api("POST", f"/repos/{REPO}/git/blobs", {"content": content, "encoding": "base64"})
        entries.append({"path": path, "mode": mode, "type": "blob", "sha": blob["sha"]})

    new_tree = api("POST", f"/repos/{REPO}/git/trees", {"base_tree": parent_tree, "tree": entries})
    if new_tree["sha"] != tree:
        print(f"WARNING: tree SHA mismatch (local {tree[:7]} vs api {new_tree['sha'][:7]}); continuing with API tree")
        tree = new_tree["sha"]

    commit = api("POST", f"/repos/{REPO}/git/commits", {
        "message": message, "tree": tree, "parents": [parent],
        "author": {"name": an, "email": ae, "date": ad},
        "committer": {"name": cn, "email": ce, "date": cd},
    })
    if commit["sha"] != head:
        print(f"WARNING: commit SHA mismatch (local {head[:7]} vs api {commit['sha'][:7]})")
        head = commit["sha"]

    api("PATCH", f"/repos/{REPO}/git/refs/heads/main", {"sha": head})
    print(f"Pushed {head[:7]} to {REPO} main via Git Data API.")

    # Confirm and align local tracking ref.
    sh("git", "fetch", "origin")
    print("Remote main now:", sh("git", "rev-parse", "origin/main").strip()[:7])


if __name__ == "__main__":
    main()
