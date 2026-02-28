import type { ProcessState } from "@/types";

interface ActivityBarProps {
  processState: ProcessState;
  text: string;
}

export function ActivityBar({ processState, text }: ActivityBarProps) {
  const isWorking = processState === "running" || processState === "starting";

  return (
    <div className="activity-bar">
      {isWorking && <div className="activity-spinner" />}
      <span className="activity-text">
        {isWorking
          ? text || "Claude is working..."
          : processState === "error"
            ? "Something went wrong. Try again."
            : "Ready"}
      </span>
    </div>
  );
}
