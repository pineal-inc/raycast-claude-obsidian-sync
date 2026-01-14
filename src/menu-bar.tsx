import { MenuBarExtra, getPreferenceValues, showHUD, LaunchType, launchCommand, Icon } from "@raycast/api";
import { useEffect, useState } from "react";
import { findSessionFiles, parseSessionFile } from "./utils/claude-parser";
import { syncToObsidian } from "./utils/obsidian-sync";

interface Preferences {
  obsidianVaultPath: string;
  claudeProjectPath: string;
  autoGitCommit: boolean;
}

interface SyncStatus {
  lastSync: Date | null;
  messageCount: number;
  issyncing: boolean;
  error?: string;
}

export default function MenuBar() {
  const preferences = getPreferenceValues<Preferences>();
  const [status, setStatus] = useState<SyncStatus>({
    lastSync: null,
    messageCount: 0,
    issyncing: false,
  });

  async function performSync() {
    setStatus((prev) => ({ ...prev, issyncing: true }));

    try {
      const projectPath = preferences.claudeProjectPath || undefined;
      const sessionFiles = findSessionFiles(projectPath);

      if (sessionFiles.length === 0) {
        setStatus({
          lastSync: new Date(),
          messageCount: 0,
          issyncing: false,
        });
        return;
      }

      let totalMessages = 0;
      for (const sessionFile of sessionFiles.slice(0, 3)) {
        const messages = parseSessionFile(sessionFile);
        const result = syncToObsidian(
          sessionFile,
          messages,
          preferences.obsidianVaultPath,
          preferences.autoGitCommit
        );
        if (result.success) {
          totalMessages += result.messagesAdded;
        }
      }

      setStatus({
        lastSync: new Date(),
        messageCount: totalMessages,
        issyncing: false,
      });
    } catch (error) {
      setStatus((prev) => ({
        ...prev,
        issyncing: false,
        error: error instanceof Error ? error.message : "Unknown error",
      }));
    }
  }

  // Background sync on interval
  useEffect(() => {
    performSync();
  }, []);

  const formatTime = (date: Date | null) => {
    if (!date) return "Never";
    return date.toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit" });
  };

  const icon = status.issyncing ? Icon.ArrowClockwise : Icon.Stars;
  const title = status.issyncing ? "Syncing..." : "";

  return (
    <MenuBarExtra icon={icon} title={title} tooltip="Claude Obsidian Sync">
      <MenuBarExtra.Section title="Status">
        <MenuBarExtra.Item
          title={`Last Sync: ${formatTime(status.lastSync)}`}
          icon={Icon.CheckCircle}
        />
        <MenuBarExtra.Item
          title={`Messages: ${status.messageCount}`}
          icon={Icon.Document}
        />
        {status.error && (
          <MenuBarExtra.Item
            title={`Error: ${status.error}`}
            icon={Icon.XMarkCircle}
          />
        )}
      </MenuBarExtra.Section>

      <MenuBarExtra.Section>
        <MenuBarExtra.Item
          title="Sync Now"
          icon={Icon.ArrowClockwise}
          shortcut={{ modifiers: ["cmd"], key: "s" }}
          onAction={async () => {
            await performSync();
            await showHUD(`Synced ${status.messageCount} messages`);
          }}
        />
        <MenuBarExtra.Item
          title="View Conversations"
          icon={Icon.List}
          shortcut={{ modifiers: ["cmd"], key: "o" }}
          onAction={() => {
            launchCommand({ name: "view-conversations", type: LaunchType.UserInitiated });
          }}
        />
      </MenuBarExtra.Section>
    </MenuBarExtra>
  );
}
