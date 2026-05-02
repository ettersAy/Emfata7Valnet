# Problem

The `git_automate` MCP tool resolves file paths relative to a fixed worktree directory (e.g., `/home/AyoubEtters/.cline/worktrees/4cf8b/moussawer/`) rather than the active shell's working directory (`/home/AyoubEtters/.cline/worktrees/e14f2/Emfata7Valnet/`). When working in a different worktree, the tool fails with "File not found" errors, requiring manual fallback to individual GitHub API tools.

# Improvement Needed

fix and improve `git_automate` , some cmd you would not be able to exec ask the user for help to execute the cmd for and provide the result. to make sure your fix works once you have done, update `.clinerules ` to add more instruction to next agent how to use this tool, than test  `git_automate` by pushing `.clinerules ` and creating a new PR, and than ask the user to restart cline and start an other task to see if the agent is able to use it without errors.

# Expected Result

Future AI agents should be able to use `git_automate` without error
