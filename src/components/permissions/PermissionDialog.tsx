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
  return (
    <div className="permission-overlay">
      <div className="permission-dialog">
        <div className="permission-header">
          <h3>Permission Required</h3>
          <span className="permission-tool">{request.tool}</span>
        </div>

        <div className="permission-body">
          <p className="permission-desc">{request.description}</p>

          {request.command && (
            <div className="permission-detail">
              <span className="label">Command:</span>
              <code>{request.command}</code>
            </div>
          )}

          {request.filePath && (
            <div className="permission-detail">
              <span className="label">File:</span>
              <code>{request.filePath}</code>
            </div>
          )}
        </div>

        <div className="permission-actions">
          <button className="btn-deny" onClick={onDeny}>
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
