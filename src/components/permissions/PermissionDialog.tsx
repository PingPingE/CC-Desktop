import { useEffect, useRef } from "react";
import type { PermissionRequest } from "@/types";

interface PermissionDialogProps {
  request: PermissionRequest;
  onApprove: () => void;
  onDeny: () => void;
}

export function PermissionDialog({
  request,
  onApprove,
  onDeny,
}: PermissionDialogProps) {
  const denyRef = useRef<HTMLButtonElement>(null);

  // Focus deny button on mount (safer default), trap Escape key
  useEffect(() => {
    denyRef.current?.focus();

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onDeny();
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onDeny]);

  return (
    <div
      className="permission-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="permission-title"
    >
      <div className="permission-dialog">
        <div className="permission-header">
          <h3 id="permission-title">Permission Required</h3>
          <span className="permission-tool">{request.tool}</span>
        </div>

        <div className="permission-body">
          <p className="permission-desc">{request.description}</p>

          {request.command && (
            <div className="permission-detail">
              <span className="detail-label">Command</span>
              <code>{request.command}</code>
            </div>
          )}

          {request.filePath && (
            <div className="permission-detail">
              <span className="detail-label">File</span>
              <code>{request.filePath}</code>
            </div>
          )}
        </div>

        <div className="permission-actions">
          <button ref={denyRef} className="btn-deny" onClick={onDeny}>
            Deny
          </button>
          <button className="btn-approve" onClick={onApprove}>
            Approve
          </button>
        </div>
      </div>
    </div>
  );
}
