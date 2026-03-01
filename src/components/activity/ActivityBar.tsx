import type { ProcessState } from "@/types";
import { useLocale } from "../../i18n";

interface ActivityBarProps {
  processState: ProcessState;
  text: string;
  onStop?: () => void;
}

export function ActivityBar({ processState, text, onStop }: ActivityBarProps) {
  const { t } = useLocale();
  const isWorking = processState === "running" || processState === "starting";

  return (
    <div className="activity-bar">
      {isWorking && <div className="activity-spinner" />}
      <span className="activity-text">
        {isWorking
          ? text || t("activity.working")
          : processState === "error"
            ? t("activity.error")
            : processState === "stopped"
              ? t("activity.stopped")
              : t("activity.ready")}
      </span>
      {isWorking && onStop && (
        <button className="activity-stop-btn" onClick={onStop}>
          {t("activity.stop")}
        </button>
      )}
    </div>
  );
}
