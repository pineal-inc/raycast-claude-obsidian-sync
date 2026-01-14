import { showHUD, getPreferenceValues, showToast, Toast } from "@raycast/api";
import { findSessionFiles, parseSessionFile } from "./utils/claude-parser";
import { syncToObsidian } from "./utils/obsidian-sync";

interface Preferences {
  obsidianVaultPath: string;
  claudeProjectPath: string;
  autoGitCommit: boolean;
}

export default async function Command() {
  const preferences = getPreferenceValues<Preferences>();

  try {
    const projectPath = preferences.claudeProjectPath || undefined;
    const sessionFiles = findSessionFiles(projectPath);

    if (sessionFiles.length === 0) {
      await showHUD("No active Claude sessions found");
      return;
    }

    let totalMessages = 0;
    let syncedFiles = 0;

    for (const sessionFile of sessionFiles.slice(0, 3)) {
      const messages = parseSessionFile(sessionFile);
      const result = syncToObsidian(
        sessionFile,
        messages,
        preferences.obsidianVaultPath,
        preferences.autoGitCommit
      );

      if (result.success && result.messagesAdded > 0) {
        totalMessages += result.messagesAdded;
        syncedFiles++;
      }
    }

    if (totalMessages > 0) {
      await showHUD(`Synced ${totalMessages} messages from ${syncedFiles} session(s)`);
    } else {
      await showHUD("No new messages to sync");
    }
  } catch (error) {
    await showToast({
      style: Toast.Style.Failure,
      title: "Sync Failed",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
