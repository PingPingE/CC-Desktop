import type { Project, ProcessState } from "@/types";

interface HeaderBarProps {
  project: Project | null;
  processState: ProcessState;
  onOpenProject: (project: Project) => void;
  onToggleSettings: () => void;
}

export function HeaderBar({
  project,
  processState,
  onOpenProject,
  onToggleSettings,
}: HeaderBarProps) {
  const handleOpenFolder = async () => {
    const { open } = await import("@tauri-apps/plugin-dialog");
    const selected = await open({ directory: true, title: "Open Project Folder" });
    if (selected) {
      onOpenProject({
        path: selected as string,
        name: (selected as string).split("/").pop() || "project",
        lastOpened: Date.now(),
        hasClaudeConfig: false,
      });
    }
  };

  const statusConfig: Record<ProcessState, { label: string; color: string }> = {
    idle: { label: "Ready", color: "var(--success)" },
    starting: { label: "Starting...", color: "var(--warning)" },
    running: { label: "Working...", color: "var(--info)" },
    waiting_permission: { label: "Waiting", color: "var(--warning)" },
    error: { label: "Error", color: "var(--error)" },
    stopped: { label: "Stopped", color: "var(--text-muted)" },
  };

  const { label, color } = statusConfig[processState];

  return (
    <header className="header-bar">
      <div className="header-logo">
        [CC] <span>Desktop</span>
      </div>

      <div className="header-project">
        {project ? (
          <>
            <span className="header-project-name">{project.name}</span>
            <span className="header-project-path">{project.path}</span>
          </>
        ) : (
          <button className="header-btn" onClick={handleOpenFolder}>
            Open Project
          </button>
        )}
      </div>

      <div className="header-actions">
        <div className="status-badge">
          <span className="status-dot" style={{ backgroundColor: color }} />
          <span>{label}</span>
        </div>
        {project && (
          <button className="header-btn" onClick={handleOpenFolder}>
            Switch
          </button>
        )}
        <button className="header-btn" onClick={onToggleSettings}>
          Settings
        </button>
      </div>
    </header>
  );
}
