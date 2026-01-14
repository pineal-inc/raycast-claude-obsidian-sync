import * as fs from "fs";
import * as path from "path";
import { ClaudeMessage, getTodayMessages } from "./claude-parser";

export interface SyncResult {
  success: boolean;
  filePath: string;
  messagesAdded: number;
  error?: string;
}

export interface SyncState {
  lastSyncedLines: Record<string, number>;
}

const STATE_FILE = ".claude-sync-state.json";

function getStateFilePath(outputDir: string): string {
  return path.join(outputDir, STATE_FILE);
}

export function loadSyncState(outputDir: string): SyncState {
  const stateFile = getStateFilePath(outputDir);
  try {
    if (fs.existsSync(stateFile)) {
      const content = fs.readFileSync(stateFile, "utf-8");
      return JSON.parse(content);
    }
  } catch {
    // Ignore errors, return default state
  }
  return { lastSyncedLines: {} };
}

export function saveSyncState(outputDir: string, state: SyncState): void {
  const stateFile = getStateFilePath(outputDir);
  try {
    fs.writeFileSync(stateFile, JSON.stringify(state, null, 2));
  } catch {
    // Ignore errors
  }
}

function formatDateFolder(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatDateJapanese(date: Date): string {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  return `${year}年${month}月${day}日`;
}

function extractProjectName(sessionFilePath: string): string {
  // Session path looks like: ~/.claude/projects/-Users-username-project-name/session-id.jsonl
  // Extract the project part
  const projectDir = path.dirname(sessionFilePath);
  const projectHash = path.basename(projectDir);

  // Convert -Users-username-project-name to a readable name
  // Remove the leading user path parts and clean up
  const parts = projectHash.split("-").filter((p) => p.length > 0);

  // Skip common path prefixes like "Users", username
  let startIndex = 0;
  for (let i = 0; i < parts.length; i++) {
    if (parts[i].toLowerCase() === "users" || i < 2) {
      startIndex = i + 1;
    } else {
      break;
    }
  }

  const projectParts = parts.slice(startIndex);
  if (projectParts.length === 0) {
    return "default";
  }

  return projectParts.join("-").toLowerCase() || "default";
}

function formatMessagesToMarkdown(messages: ClaudeMessage[], projectName: string): string {
  const today = formatDateJapanese(new Date());
  const lines: string[] = [`# ${today} - ${projectName}`, ""];

  for (const msg of messages) {
    if (msg.type === "user") {
      lines.push(`## User`);
      lines.push("");
      lines.push(msg.content);
    } else {
      lines.push(`## Claude`);
      lines.push("");
      lines.push(msg.content);
    }
    lines.push("");
    lines.push("---");
    lines.push("");
  }

  return lines.join("\n");
}

export function syncToFolder(
  sessionFilePath: string,
  allMessages: ClaudeMessage[],
  outputDir: string
): SyncResult {
  try {
    // Get today's date folder
    const dateFolder = formatDateFolder(new Date());
    const datePath = path.join(outputDir, dateFolder);

    // Ensure date directory exists
    if (!fs.existsSync(datePath)) {
      fs.mkdirSync(datePath, { recursive: true });
    }

    // Filter to today's messages
    const messages = getTodayMessages(allMessages);
    if (messages.length === 0) {
      return {
        success: true,
        filePath: "",
        messagesAdded: 0,
      };
    }

    // Load sync state
    const state = loadSyncState(outputDir);
    const lastSyncedLine = state.lastSyncedLines[sessionFilePath] || 0;

    // Get the current line count of the session file
    const sessionContent = fs.readFileSync(sessionFilePath, "utf-8");
    const currentLineCount = sessionContent.split("\n").filter((l) => l.trim()).length;

    // If no new lines, nothing to sync
    if (currentLineCount <= lastSyncedLine) {
      return {
        success: true,
        filePath: "",
        messagesAdded: 0,
      };
    }

    // Extract project name from session path
    const projectName = extractProjectName(sessionFilePath);
    const outputFile = path.join(datePath, `${projectName}.md`);

    // Format and write
    const markdown = formatMessagesToMarkdown(messages, projectName);
    fs.writeFileSync(outputFile, markdown);

    // Update sync state
    state.lastSyncedLines[sessionFilePath] = currentLineCount;
    saveSyncState(outputDir, state);

    return {
      success: true,
      filePath: outputFile,
      messagesAdded: messages.length,
    };
  } catch (error) {
    return {
      success: false,
      filePath: "",
      messagesAdded: 0,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
