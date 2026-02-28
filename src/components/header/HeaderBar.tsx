import type { Project, ProcessState } from "@/types";

interface HeaderBarProps {
  project: Project | null;
  processState: ProcessState;
  autoApprove: boolean;
  onAutoApproveChange: (value: boolean) => void;
  onOpenFolder: () => void;
  onToggleSettings: () => void;
}

export function HeaderBar({
  project,
  processState,
  autoApprove,
  onAutoApproveChange,
  onOpenFolder,
  onToggleSettings,
}: HeaderBarProps) {
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
          <span className="header-no-project">No project open</span>
        )}
      </div>

      <div className="header-actions">
        <div className="status-badge">
          <span className="status-dot" style={{ backgroundColor: color }} />
          <span>{label}</span>
        </div>

        {project && (
          <button
            className={`auto-approve-toggle ${autoApprove ? "auto-approve-on" : ""}`}
            onClick={() => onAutoApproveChange(!autoApprove)}
            title={autoApprove
              ? "Auto-approve ON: Claude works freely without asking permission"
              : "Auto-approve OFF: Claude asks before each action"
            }
          >
            <span className="auto-approve-dot" />
            <span>{autoApprove ? "Auto" : "Ask"}</span>
          </button>
        )}

        <button className="header-btn" onClick={onOpenFolder}>
          {project ? "Switch" : "Open"}
        </button>
        <button className="header-btn" onClick={onToggleSettings}>
          Settings
        </button>
      </div>
    </header>
  );
}
