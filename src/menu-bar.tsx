import { MenuBarExtra, getPreferenceValues, showHUD, LaunchType, launchCommand, Icon } from "@raycast/api";
import { useEffect, useState } from "react";
import { findSessionFiles, parseSessionFile } from "./utils/claude-parser";
import { syncToFolder } from "./utils/sync";

interface Preferences {
  outputPath: string;
}

interface SyncStatus {
  lastSync: Date | null;
  messageCount: number;
  isSyncing: boolean;
  error?: string;
}

export default function MenuBar() {
  const preferences = getPreferenceValues<Preferences>();
  const [status, setStatus] = useState<SyncStatus>({
    lastSync: null,
    messageCount: 0,
    isSyncing: false,
  });

  async function performSync() {
    setStatus((prev) => ({ ...prev, isSyncing: true }));

    try {
      const sessionFiles = findSessionFiles();

      if (sessionFiles.length === 0) {
        setStatus({
          lastSync: new Date(),
          messageCount: 0,
          isSyncing: false,
        });
        return;
      }

      let totalMessages = 0;
      for (const sessionFile of sessionFiles.slice(0, 5)) {
        const messages = parseSessionFile(sessionFile);
        const result = syncToFolder(
          sessionFile,
          messages,
          preferences.outputPath
        );
        if (result.success) {
          totalMessages += result.messagesAdded;
        }
      }

      setStatus({
        lastSync: new Date(),
        messageCount: totalMessages,
        isSyncing: false,
      });
    } catch (error) {
      setStatus((prev) => ({
        ...prev,
        isSyncing: false,
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

  const icon = status.isSyncing ? Icon.ArrowClockwise : Icon.Stars;
  const title = status.isSyncing ? "Syncing..." : "";

  return (
    <MenuBarExtra icon={icon} title={title} tooltip="Claude Sync">
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
