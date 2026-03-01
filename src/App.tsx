import { useState, useEffect, useCallback } from "react";
import { invoke } from "@tauri-apps/api/core";
import { HeaderBar } from "./components/header/HeaderBar";
import { ProjectBar } from "./components/project/ProjectBar";
import { ChatPanel } from "./components/chat/ChatPanel";
import { ActivityBar } from "./components/activity/ActivityBar";
import { PermissionDialog } from "./components/permissions/PermissionDialog";
import { SettingsPanel } from "./components/settings/SettingsPanel";
import { OnboardingWizard } from "./components/onboarding/OnboardingWizard";
import type { Project, ProcessState, PermissionRequest } from "./types";

const RECENT_PROJECTS_KEY = "cc-desktop-recent-projects";
const MAX_RECENT = 5;

export interface ProjectAnalysis {
  languages: string[];
  framework: string | null;
  has_claude_config: boolean;
  agent_count: number;
  skill_count: number;
  agents: string[];
  skills: string[];
  has_git: boolean;
  suggestion: string | null;
}

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
  const [onboardingDone, setOnboardingDone] = useState(
    localStorage.getItem("onboarding_completed") === "true"
  );
  const [appReady, setAppReady] = useState(false);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [processState, setProcessState] = useState<ProcessState>("idle");
  const [activityText, setActivityText] = useState("");
  const [permissionRequest, setPermissionRequest] = useState<PermissionRequest | null>(null);
  const [recentProjects, setRecentProjects] = useState<Project[]>(loadRecentProjects);
  const [projectAnalysis, setProjectAnalysis] = useState<ProjectAnalysis | null>(null);
  const [autoApprove, setAutoApprove] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    try {
      return (localStorage.getItem("cc-desktop-theme") as "light" | "dark") || "light";
    } catch {
      return "light";
    }
  });

  const handleThemeChange = useCallback((newTheme: "light" | "dark") => {
    setTheme(newTheme);
    localStorage.setItem("cc-desktop-theme", newTheme);
  }, []);

  // Quick check on startup — just verify app can start
  useEffect(() => {
    // Small delay to allow Tauri bridge to initialize
    const timer = setTimeout(() => setAppReady(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const handleProjectSelect = useCallback(async (project: Project) => {
    await invoke("set_project_dir", { path: project.path });
    setCurrentProject(project);

    // Analyze project automatically
    try {
      const analysis = await invoke<ProjectAnalysis>("analyze_project");
      setProjectAnalysis(analysis);
    } catch {
      setProjectAnalysis(null);
    }

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

  const handleCreateProject = useCallback(async (name: string) => {
    const path = await invoke<string>("create_project", { name });
    const projectName = path.split("/").pop() || name;
    handleProjectSelect({
      path,
      name: projectName,
      lastOpened: Date.now(),
      hasClaudeConfig: false,
    });
  }, [handleProjectSelect]);

  const handleStop = useCallback(async () => {
    try {
      await invoke("stop_claude");
      setProcessState("stopped");
    } catch {
      // No running process — ignore
    }
  }, []);

  const handleOnboardingComplete = useCallback((projectPath: string, projectName: string) => {
    setOnboardingDone(true);
    handleProjectSelect({
      path: projectPath,
      name: projectName,
      lastOpened: Date.now(),
      hasClaudeConfig: false,
    });
  }, [handleProjectSelect]);

  // Loading state
  if (!appReady) {
    return (
      <div className="app-loading" data-theme={theme}>
        <div className="loading-spinner" />
        <p>Starting CC Desktop...</p>
      </div>
    );
  }

  // Onboarding wizard for first-time users
  if (!onboardingDone) {
    return (
      <div data-theme={theme}>
        <OnboardingWizard onComplete={handleOnboardingComplete} />
      </div>
    );
  }

  return (
    <div className="app-container" data-theme={theme}>
      <HeaderBar
        project={currentProject}
        processState={processState}
        autoApprove={autoApprove}
        onAutoApproveChange={setAutoApprove}
        onOpenFolder={handleOpenFolder}
        onToggleSettings={() => setShowSettings((v) => !v)}
      />

      {currentProject && projectAnalysis && (
        <ProjectBar analysis={projectAnalysis} />
      )}

      <div className="app-body">
        <div className="main-column">
          <ChatPanel
            project={currentProject}
            processState={processState}
            autoApprove={autoApprove}
            onProcessStateChange={setProcessState}
            onActivityChange={setActivityText}
            onOpenProject={handleOpenFolder}
            onCreateProject={handleCreateProject}
            recentProjects={recentProjects}
            onSelectRecentProject={handleProjectSelect}
            onStop={handleStop}
          />
        </div>
      </div>

      <ActivityBar processState={processState} text={activityText} onStop={handleStop} />

      {permissionRequest && (
        <PermissionDialog
          request={permissionRequest}
          onApprove={() => setPermissionRequest(null)}
          onDeny={() => setPermissionRequest(null)}
        />
      )}

      {showSettings && (
        <SettingsPanel
          theme={theme}
          onThemeChange={handleThemeChange}
          onClose={() => setShowSettings(false)}
        />
      )}
    </div>
  );
}

export default App;
