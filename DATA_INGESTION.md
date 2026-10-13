# Catalog refresh

The included catalog contains actual GitHub metadata, not example projects. Repository descriptions and statistics are captured with `last_synced_at`; categories are editorial, with multiple memberships permitted.

Run `npm run discover` to refresh the repositories in `data/sources.json`. Export an optional `GITHUB_TOKEN` for higher API rate limits. No browser-side credentials are needed. Use `npm run discover -- --snapshot` to update the checked-in catalog for review and redistribution with the app.

Records are keyed by GitHub's stable repository ID, including when upstream projects rename. Failed requests preserve the previous record. A completely failed run exits unsuccessfully without replacing the catalog. Requests time out after 20 seconds; rate limits do not trigger an indefinite sleep.

Daily snapshots are retained locally in ignored `data/history.json` for 60 days. Weekly growth compares the newest count with a real observation between seven and eight days old. It remains null until suitable history exists. Total-star ranking is explicitly labeled as popular, never weekly growth. Run refreshes regularly to accumulate history; this repo does not currently include a scheduler.

The source manifest declares explicit Skill paths and MCP documentation paths. A repository can contain multiple Skills: each is indexed separately by repository plus path, with its own name, description, topics, source URL, content SHA-256, verification time, and pinned Git commit. The refresh resolves the current branch to a commit before fetching files. Only manifests with `name` and `description` frontmatter are listed. These files are treated as data and never executed.

The bundled catalog includes 25 Skills from seven repositories and eight MCP servers. Source documentation is checked for an MCP description; transport, access requirements, topic tags, and publisher status are curated from upstream documentation. Stars always belong to the source repository. Publisher-maintained badges are limited to sources explicitly verified from publisher documentation. A source check is not a code audit or security approval.

`npm run discover -- --only=owner/repo --snapshot` refreshes an existing source selectively. Missing/invalid manifests are removed from that source's listings; request failures preserve the previous repository record. The catalog mirrors metadata and links, not upstream code. No installation commands are run or invented, and no provider credentials are collected.

## Global weekly Lab snapshot

`npm run refresh:weekly -- --snapshot` updates the ten highest weekly-star counts from the repositories present on GitHub’s public weekly Trending page. It records candidate count, source URL, and capture time. GitHub repository metadata supplies stars, forks, license, creation date, language, and topics. Paginated contributor/commit endpoints supply contributor counts (including anonymous) and commits on the default branch since seven days before capture. Failed optional activity requests become null; failed required metadata or fewer than ten candidates abort without replacing the snapshot. Writes use temporary files and atomic renames.

The checked-in `data/github-weekly.json` makes the Lab work in fresh clones without visiting GitHub from the browser. The ignored `data/weekly-cache.json` takes precedence locally. The snapshot refresh is separate from the finance catalog and its locally measured seven-day growth. The Lab ranking describes GitHub’s Trending selection, not every repository on GitHub. There is no scheduled refresh job in this change.
