import { useState, useEffect, useCallback } from "react";
import { invoke } from "@tauri-apps/api/core";
import { HeaderBar } from "./components/header/HeaderBar";
import { ChatPanel } from "./components/chat/ChatPanel";
import { ActivityBar } from "./components/activity/ActivityBar";
import { PermissionDialog } from "./components/permissions/PermissionDialog";
import { OnboardingScreen } from "./components/settings/OnboardingScreen";
import type { Project, AppSettings, ProcessState, PermissionRequest } from "./types";

const RECENT_PROJECTS_KEY = "cc-desktop-recent-projects";
const MAX_RECENT = 5;

function loadRecentProjects(): Project[] {
  try {
    const raw = localStorage.getItem(RECENT_PROJECTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveRecentProjects(projects: Project[]) {
  localStorage.setItem(RECENT_PROJECTS_KEY, JSON.stringify(projects.slice(0, MAX_RECENT)));
}

function App() {
  const [claudeInstalled, setClaudeInstalled] = useState<boolean | null>(null);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [processState, setProcessState] = useState<ProcessState>("idle");
  const [activityText, setActivityText] = useState("");
  const [permissionRequest, setPermissionRequest] = useState<PermissionRequest | null>(null);
  const [recentProjects, setRecentProjects] = useState<Project[]>(loadRecentProjects);
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

    // Update recent projects
    setRecentProjects((prev) => {
      const filtered = prev.filter((p) => p.path !== project.path);
      const updated = [{ ...project, lastOpened: Date.now() }, ...filtered].slice(0, MAX_RECENT);
      saveRecentProjects(updated);
      return updated;
    });
  }, []);

  const handleOpenFolder = useCallback(async () => {
    const { open } = await import("@tauri-apps/plugin-dialog");
    const selected = await open({ directory: true, title: "Open Project Folder" });
    if (selected) {
      handleProjectSelect({
        path: selected as string,
        name: (selected as string).split("/").pop() || "project",
        lastOpened: Date.now(),
        hasClaudeConfig: false,
      });
    }
  }, [handleProjectSelect]);

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
        onOpenFolder={handleOpenFolder}
        onToggleSettings={() => {}}
      />

      <div className="app-body">
        <div className="main-column">
          <ChatPanel
            project={currentProject}
            processState={processState}
            onProcessStateChange={setProcessState}
            onActivityChange={setActivityText}
            onOpenProject={handleOpenFolder}
            recentProjects={recentProjects}
            onSelectRecentProject={handleProjectSelect}
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
