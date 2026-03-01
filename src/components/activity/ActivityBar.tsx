import type { ProcessState } from "@/types";

interface ActivityBarProps {
  processState: ProcessState;
  text: string;
  onStop?: () => void;
}

export function ActivityBar({ processState, text, onStop }: ActivityBarProps) {
  const isWorking = processState === "running" || processState === "starting";

  return (
    <div className="activity-bar">
      {isWorking && <div className="activity-spinner" />}
      <span className="activity-text">
        {isWorking
          ? text || "Claude is working..."
          : processState === "error"
            ? "Something went wrong. Try again."
            : processState === "stopped"
              ? "Stopped."
              : "Ready"}
      </span>
      {isWorking && onStop && (
        <button className="activity-stop-btn" onClick={onStop}>
          Stop
        </button>
      )}
    </div>
  );
}
