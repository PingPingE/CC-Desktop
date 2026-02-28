import { useState, useEffect, useCallback } from "react";
import { invoke } from "@tauri-apps/api/core";
import { HeaderBar } from "./components/header/HeaderBar";
import { FileSidebar } from "./components/file-sidebar/FileSidebar";
import { ChatPanel } from "./components/chat/ChatPanel";
import { ActivityBar } from "./components/activity/ActivityBar";
import { PermissionDialog } from "./components/permissions/PermissionDialog";
import { OnboardingScreen } from "./components/settings/OnboardingScreen";
import type { Project, AppSettings, ProcessState, PermissionRequest } from "./types";

function App() {
  const [claudeInstalled, setClaudeInstalled] = useState<boolean | null>(null);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [processState, setProcessState] = useState<ProcessState>("idle");
  const [activityText, setActivityText] = useState("");
  const [permissionRequest, setPermissionRequest] = useState<PermissionRequest | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [settings] = useState<AppSettings>({
    theme: "light",
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

  const handleProjectSelect = useCallback(async (project: Project) => {
    await invoke("set_project_dir", { path: project.path });
    setCurrentProject(project);
  }, []);

  if (claudeInstalled === null) {
    return (
      <div className="app-loading">
        <div className="loading-spinner" />
        <p>Starting CC Desktop...</p>
      </div>
    );
  }

  if (claudeInstalled === false) {
    return <OnboardingScreen onRetry={checkClaude} />;
  }

  return (
    <div className="app-container" data-theme={settings.theme}>
      <HeaderBar
        project={currentProject}
        processState={processState}
        onOpenProject={handleProjectSelect}
        onToggleSettings={() => setShowSettings(!showSettings)}
      />

      <div className="app-body">
        <FileSidebar project={currentProject} />

        <div className="main-column">
          <ChatPanel
            project={currentProject}
            processState={processState}
            onProcessStateChange={setProcessState}
            onActivityChange={setActivityText}
          />
        </div>
      </div>

      <ActivityBar processState={processState} text={activityText} />

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
