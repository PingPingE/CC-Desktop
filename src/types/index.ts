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

/** A skill (slash command) discovered from .claude/skills/ */
export interface Skill {
  name: string;
  description?: string;
  filePath: string;
}

/** An agent discovered from .claude/agents/ */
export interface Agent {
  name: string;
  description?: string;
  model?: string;
  tools?: string[];
  permissionMode?: string;
  filePath: string;
}

/** File tree node */
export interface FileNode {
  name: string;
  path: string;
  type: "file" | "directory";
  children?: FileNode[];
  modified?: boolean;
}

/** Auto-approve mode for permissions */
export type ApproveMode =
  | "ask-every-time"     // Default: approve each action individually
  | "auto-approve-safe"  // File reads/searches auto, edits/commands ask
  | "auto-approve-all";  // Everything runs without asking (skip-permissions)

/** App-wide settings */
export interface AppSettings {
  theme: "light" | "dark" | "system";
  fontSize: number;
  approveMode: ApproveMode;
  showFileTree: boolean;
  showAgentPanel: boolean;
  recentProjects: Project[];
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

/** Git status for current project */
export interface GitStatus {
  branch: string;
  modified: string[];
  staged: string[];
  untracked: string[];
  ahead: number;
  behind: number;
}

/** Template info from CC-Marketplace */
export interface TemplateInfo {
  slug: string;
  name: string;
  description: string;
  price: number;
  agents: number;
  skills: number;
  checkoutUrl: string;
  installed: boolean;
}

/** Remote session connection */
export interface RemoteSession {
  id: string;
  host: string;
  port: number;
  status: "connecting" | "connected" | "disconnected" | "error";
  projectPath?: string;
}

/** Team composition — parsed from .claude/ directory */
export interface TeamComposition {
  agents: Agent[];
  skills: Skill[];
  hasTemplate: boolean;
  templateName?: string;
}
