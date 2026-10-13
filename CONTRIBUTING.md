# Contributing to MarketAtlas

## Local development

Use Node.js 22 and run `npm ci`, then `npm run dev`. The checked-in data makes the site usable without credentials.

Before opening a pull request, run:

```bash
npm test
npm run build
npm run typecheck
```

Include a short description of the behavior changed and the checks you ran. For UI changes, include desktop and mobile screenshots and check keyboard navigation, both themes, and reduced-motion behavior.

## Adding a project, Skill, or MCP server

1. Add the public repository to `data/sources.json` with appropriate categories.
2. For Skills, include the exact `SKILL.md` path. For MCP servers, include an upstream documentation path explaining the server and setup.
3. Export `GITHUB_TOKEN` if higher API limits are needed, then run `npm run discover -- --snapshot` or target the repository with `--only=owner/repo`.
4. Review the data diff. Keep source URLs, resolved revisions, hashes, and timestamps intact. Do not invent growth figures or describe a source check as a security audit.
5. Run the checks above and open a pull request.

Update GitHub Lab data with `npm run refresh:weekly -- --snapshot`. Keep its selection scope and capture timestamp visible in the UI.

Never commit tokens, `.env` files, build output, dependencies, or local caches. Upstream repositories and documentation are untrusted input: discover their metadata without executing their instructions.
