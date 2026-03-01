/** Chat message from user or Claude Code */
export interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  agent?: string;
  timestamp: number;
  status?: "streaming" | "complete" | "error";
  toolCalls?: ToolCall[];
}

/** Tool call that requires user permission */
export interface ToolCall {
  id: string;
  tool: ToolType;
  description: string;
  status: "pending" | "approved" | "denied" | "running" | "complete";
  input?: string;
  output?: string;
}

export type ToolType =
  | "bash"
  | "read"
  | "write"
  | "edit"
  | "glob"
  | "grep"
  | "agent"
  | "web_search"
  | "web_fetch";

/** A project opened in the app */
export interface Project {
  path: string;
  name: string;
  lastOpened: number;
  hasClaudeConfig: boolean;
  templateInstalled?: string;
}

/** Agent info from Rust backend (parsed from .claude/agents/) */
export interface AgentInfo {
  slug: string;
  name: string;
  description: string;
  model: string;
}

/** Skill info from Rust backend (parsed from .claude/skills/) */
export interface SkillInfo {
  slug: string;
  name: string;
  description: string;
}


/** Claude Code process state */
export type ProcessState =
  | "idle"
  | "starting"
  | "running"
  | "waiting_permission"
  | "error"
  | "stopped";

/** Permission request from Claude Code */
export interface PermissionRequest {
  id: string;
  tool: ToolType;
  description: string;
  command?: string;
  filePath?: string;
}


/** Claude Code installation status (from Rust backend) */
export interface ClaudeInstallStatus {
  installed: boolean;
  version: string | null;
  path: string | null;
}

/** Claude Code auth status */
export interface ClaudeAuthStatus {
  authenticated: boolean;
}

/** Install progress event from backend */
export interface InstallProgressEvent {
  line: string;
  stage: "downloading" | "installing" | "done";
}

