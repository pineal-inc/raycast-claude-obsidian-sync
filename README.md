# Claude Conversation Sync

Raycast extension to sync Claude Code conversations to a folder, organized by date and project.

## Output Structure

```
output-folder/
  2026-01-14/
    project-name-1.md
    project-name-2.md
  2026-01-15/
    project-name-1.md
```

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
| Output Folder | Path to save conversations (e.g., `~/Documents/claude-logs`) | Yes |

## How It Works

1. The extension monitors `~/.claude/projects/` for active session files
2. Parses JSONL session files to extract user and assistant messages
3. Filters out system messages and noise
4. Creates date-based folders (e.g., `2026-01-14/`)
5. Saves conversations as project-based markdown files (e.g., `my-project.md`)

## Output Format

`2026-01-14/my-project.md`:

```markdown
# 2026年1月14日 - my-project

## User

Hello, Claude!

---

## Claude

Hello! How can I help you today?

---
```

## License

MIT
