import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";

interface FileTreePanelProps {
  projectPath: string;
}

export function FileTreePanel({ projectPath }: FileTreePanelProps) {
  const [files, setFiles] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    invoke<string[]>("list_project_files")
      .then(setFiles)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [projectPath]);

  return (
    <aside className="file-tree-panel">
      <div className="panel-header">
        <h3>Files</h3>
      </div>
      <div className="file-tree">
        {loading ? (
          <p className="text-muted">Loading...</p>
        ) : files.length === 0 ? (
          <p className="text-muted">No files found</p>
        ) : (
          <ul className="file-list">
            {files.map((file) => (
              <li key={file} className="file-item">
                <span className="file-icon">
                  {file.includes("/") ? "D" : "F"}
                </span>
                <span className="file-name">{file}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </aside>
  );
}
