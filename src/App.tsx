import { useState, useEffect, useCallback } from "react";
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

  const checkClaude = useCallback(() => {
    invoke<boolean>("check_claude_code")
      .then(setClaudeInstalled)
      .catch(() => setClaudeInstalled(false));
  }, []);

  useEffect(() => { checkClaude(); }, [checkClaude]);

  // Loading
  if (claudeInstalled === null) {
    return (
      <div className="app-loading">
        <div className="loading-spinner" />
        <p>Starting CC Desktop...</p>
      </div>
    );
  }

  // Onboarding
  if (claudeInstalled === false) {
    return <OnboardingScreen onRetry={checkClaude} />;
  }

  return (
    <div className="app-container" data-theme={settings.theme}>
      {/* Left sidebar */}
      <Sidebar
        currentProject={currentProject}
        onProjectSelect={setCurrentProject}
        settings={settings}
        onSettingsChange={setSettings}
      />

      {/* File tree (toggleable) */}
      {showFileTree && currentProject && (
        <FileTreePanel projectPath={currentProject.path} />
      )}

      {/* Main column: chat + terminal */}
      <div className="main-column">
        <ChatPanel
          project={currentProject}
          processState={processState}
          onProcessStateChange={setProcessState}
          onToggleFileTree={() => setShowFileTree(!showFileTree)}
          onToggleTerminal={() => setShowTerminal(!showTerminal)}
          showFileTree={showFileTree}
          showTerminal={showTerminal}
        />

        {showTerminal && <TerminalPanel />}
      </div>

      {/* Permission dialog (modal) */}
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
