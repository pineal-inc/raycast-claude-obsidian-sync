/// <reference types="@raycast/api">

/* 🚧 🚧 🚧
 * This file is auto-generated from the extension's manifest.
 * Do not modify manually. Instead, update the `package.json` file.
 * 🚧 🚧 🚧 */

/* eslint-disable @typescript-eslint/ban-types */

type ExtensionPreferences = {
  /** Obsidian Vault Path - Path to your Obsidian vault's claude folder (e.g., ~/obsidian/claude) */
  "obsidianVaultPath": string,
  /** Claude Project Path - Path to Claude Code project directory (e.g., ~/.claude/projects/-Users-username-project) */
  "claudeProjectPath": string,
  /** Auto Git Commit - Automatically commit changes to git after sync */
  "autoGitCommit": boolean
}

/** Preferences accessible in all the extension's commands */
declare type Preferences = ExtensionPreferences

declare namespace Preferences {
  /** Preferences accessible in the `menu-bar` command */
  export type MenuBar = ExtensionPreferences & {}
  /** Preferences accessible in the `sync-now` command */
  export type SyncNow = ExtensionPreferences & {}
  /** Preferences accessible in the `view-conversations` command */
  export type ViewConversations = ExtensionPreferences & {}
}

declare namespace Arguments {
  /** Arguments passed to the `menu-bar` command */
  export type MenuBar = {}
  /** Arguments passed to the `sync-now` command */
  export type SyncNow = {}
  /** Arguments passed to the `view-conversations` command */
  export type ViewConversations = {}
}

