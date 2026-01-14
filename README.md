# Claude Obsidian Sync

Raycast extension to automatically sync Claude Code conversations to Obsidian.

## Features

- **Menu Bar Status**: Shows sync status and runs background sync every minute
- **Manual Sync**: Instantly sync conversations with a command
- **View Conversations**: Browse recent Claude Code conversations directly in Raycast

## Installation

1. Clone this repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Import to Raycast:
   ```bash
   npm run dev
   ```

## Configuration

Set these preferences in Raycast:

| Preference | Description | Required |
|------------|-------------|----------|
| Obsidian Vault Path | Path to your Obsidian vault's claude folder (e.g., `~/obsidian/claude`) | Yes |
| Claude Project Path | Path to specific Claude Code project directory | No |
| Auto Git Commit | Automatically commit changes after sync | No (default: true) |

## How It Works

1. The extension monitors `~/.claude/projects/` for active session files
2. Parses JSONL session files to extract user and assistant messages
3. Filters out system messages and noise
4. Saves conversations to Obsidian as daily markdown files (e.g., `2026年1月14日.md`)
5. Optionally commits changes to git

## Output Format

```markdown
# 2026年1月14日 Claudeとの会話

**ユーザー**: Hello, Claude!

**Claude**: Hello! How can I help you today?
```

## Credits

Inspired by [栗林健太郎's article](https://zenn.dev/kentaro/articles/claude-code-obsidian-sync) on syncing Claude Code conversations to Obsidian.

## License

MIT
