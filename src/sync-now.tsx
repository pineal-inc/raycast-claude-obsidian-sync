import { showHUD, getPreferenceValues, showToast, Toast } from "@raycast/api";
import { findSessionFiles, parseSessionFile } from "./utils/claude-parser";
import { syncToFolder } from "./utils/sync";

interface Preferences {
  outputPath: string;
}

export default async function Command() {
  const preferences = getPreferenceValues<Preferences>();

  try {
    const sessionFiles = findSessionFiles();

    if (sessionFiles.length === 0) {
      await showHUD("No active Claude sessions found");
      return;
    }

    let totalMessages = 0;
    let syncedProjects = 0;

    for (const sessionFile of sessionFiles.slice(0, 5)) {
      const messages = parseSessionFile(sessionFile);
      const result = syncToFolder(
        sessionFile,
        messages,
        preferences.outputPath
      );

      if (result.success && result.messagesAdded > 0) {
        totalMessages += result.messagesAdded;
        syncedProjects++;
      }
    }

    if (totalMessages > 0) {
      await showHUD(`Synced ${totalMessages} messages from ${syncedProjects} project(s)`);
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
