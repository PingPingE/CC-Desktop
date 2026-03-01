import type { Project, ProcessState } from "@/types";
import { useLocale } from "../../i18n";

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
  const { t } = useLocale();

  const statusConfig: Record<ProcessState, { label: string; color: string }> = {
    idle: { label: t("header.status.idle"), color: "var(--success)" },
    starting: { label: t("header.status.starting"), color: "var(--warning)" },
    running: { label: t("header.status.running"), color: "var(--info)" },
    waiting_permission: { label: t("header.status.waiting_permission"), color: "var(--warning)" },
    error: { label: t("header.status.error"), color: "var(--error)" },
    stopped: { label: t("header.status.stopped"), color: "var(--text-muted)" },
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
          <span className="header-no-project">{t("header.noProject")}</span>
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
              ? t("header.autoApprove.onTitle")
              : t("header.autoApprove.offTitle")
            }
          >
            <span className="auto-approve-dot" />
            <span>{autoApprove ? t("header.autoApprove.on") : t("header.autoApprove.off")}</span>
          </button>
        )}

        <button className="header-btn" onClick={onOpenFolder}>
          {project ? t("header.switch") : t("header.open")}
        </button>
        <button className="header-btn" onClick={onToggleSettings}>
          {t("header.settings")}
        </button>
      </div>
    </header>
  );
}
