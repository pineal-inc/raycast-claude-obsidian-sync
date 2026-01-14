import { List, ActionPanel, Action, getPreferenceValues, Icon } from "@raycast/api";
import { useState, useEffect } from "react";
import { getRecentSessions, ClaudeSession, ClaudeMessage } from "./utils/claude-parser";
import * as path from "path";

interface Preferences {
  obsidianVaultPath: string;
  claudeProjectPath: string;
  autoGitCommit: boolean;
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString("ja-JP", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDate(date: Date): string {
  return date.toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + "...";
}

function MessageDetail({ message }: { message: ClaudeMessage }) {
  const icon = message.type === "user" ? Icon.Person : Icon.Stars;
  const title = message.type === "user" ? "ユーザー" : "Claude";

  return (
    <List.Item
      icon={icon}
      title={title}
      subtitle={truncate(message.content, 80)}
      accessories={[{ text: message.timestamp ? formatTime(new Date(message.timestamp)) : "" }]}
      actions={
        <ActionPanel>
          <Action.CopyToClipboard
            title="Copy Message"
            content={message.content}
          />
        </ActionPanel>
      }
    />
  );
}

function SessionSection({ session }: { session: ClaudeSession }) {
  const sessionName = path.basename(path.dirname(session.filePath));
  const title = `${formatDate(session.lastModified)} - ${sessionName}`;

  return (
    <List.Section title={title} subtitle={`${session.messages.length} messages`}>
      {session.messages.slice(-20).map((message, index) => (
        <MessageDetail key={index} message={message} />
      ))}
    </List.Section>
  );
}

export default function ViewConversations() {
  const preferences = getPreferenceValues<Preferences>();
  const [sessions, setSessions] = useState<ClaudeSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const projectPath = preferences.claudeProjectPath || undefined;
    const recentSessions = getRecentSessions(projectPath, 5);
    setSessions(recentSessions);
    setIsLoading(false);
  }, []);

  if (sessions.length === 0 && !isLoading) {
    return (
      <List>
        <List.EmptyView
          icon={Icon.XMarkCircle}
          title="No Active Sessions"
          description="No recent Claude Code sessions found. Start a conversation in Claude Code first."
        />
      </List>
    );
  }

  return (
    <List isLoading={isLoading}>
      {sessions.map((session, index) => (
        <SessionSection key={index} session={session} />
      ))}
    </List>
  );
}
