import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { Sidebar } from "./components/sidebar/Sidebar";
import { ChatPanel } from "./components/chat/ChatPanel";
import { FileTreePanel } from "./components/file-tree/FileTreePanel";
import { TerminalPanel } from "./components/terminal/TerminalPanel";
import { PermissionDialog } from "./components/permissions/PermissionDialog";
import { OnboardingScreen } from "./components/settings/OnboardingScreen";
import type { Project, AppSettings, ProcessState, PermissionRequest } from "./types";

function App() {
  const [claudeInstalled, setClaudeInstalled] = useState<boolean | null>(null);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [processState, setProcessState] = useState<ProcessState>("idle");
  const [permissionRequest, setPermissionRequest] = useState<PermissionRequest | null>(null);
  const [showFileTree, setShowFileTree] = useState(true);
  const [showTerminal, setShowTerminal] = useState(false);
  const [settings, setSettings] = useState<AppSettings>({
    theme: "dark",
    fontSize: 14,
    approveMode: "ask-every-time",
    showFileTree: true,
    showAgentPanel: true,
    recentProjects: [],
  });

  // Check if Claude Code is installed on launch
  useEffect(() => {
    invoke<boolean>("check_claude_code")
      .then(setClaudeInstalled)
      .catch(() => setClaudeInstalled(false));
  }, []);

  // Show loading screen
  if (claudeInstalled === null) {
    return (
      <div className="app-loading">
        <p>Starting CC Desktop...</p>
      </div>
    );
  }

  // Show onboarding if Claude Code not found
  if (claudeInstalled === false) {
    return (
      <OnboardingScreen
        onRetry={() => {
          invoke<boolean>("check_claude_code")
            .then(setClaudeInstalled)
            .catch(() => setClaudeInstalled(false));
        }}
      />
    );
  }

  return (
    <div className="app-container" data-theme={settings.theme}>
      {/* Left sidebar: project, team, templates, settings */}
      <Sidebar
        currentProject={currentProject}
        onProjectSelect={setCurrentProject}
        settings={settings}
        onSettingsChange={setSettings}
      />

      {/* File tree panel (toggleable) */}
      {showFileTree && currentProject && (
        <FileTreePanel projectPath={currentProject.path} />
      )}

      {/* Main chat area */}
      <ChatPanel
        project={currentProject}
        processState={processState}
        onProcessStateChange={setProcessState}
        onToggleFileTree={() => setShowFileTree(!showFileTree)}
        onToggleTerminal={() => setShowTerminal(!showTerminal)}
      />

      {/* Bottom terminal panel (toggleable) */}
      {showTerminal && <TerminalPanel />}

      {/* Permission dialog (modal) — only shown when not auto-approved */}
      {permissionRequest && (
        <PermissionDialog
          request={permissionRequest}
          onApprove={() => setPermissionRequest(null)}
          onDeny={() => setPermissionRequest(null)}
        />
      )}
    </div>
  );
}

export default App;
