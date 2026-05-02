# Problem

The `git_automate` MCP tool resolves file paths relative to a fixed worktree directory (e.g., `/home/AyoubEtters/.cline/worktrees/4cf8b/moussawer/`) rather than the active shell's working directory (`/home/AyoubEtters/.cline/worktrees/e14f2/Emfata7Valnet/`). When working in a different worktree, the tool fails with "File not found" errors, requiring manual fallback to individual GitHub API tools.

# Improvement Needed

Document or configure that `git_automate` is unreliable in multi-worktree setups. Prefer using `create_branch` + `push_files` + `create_pull_request` individually for PR creation when in a worktree context.

# Expected Result

Future AI agents should avoid time lost to failed `git_automate` calls and use the reliable fallback path immediately.
