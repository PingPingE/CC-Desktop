import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import type { Project } from "@/types";

interface FileSidebarProps {
  project: Project | null;
}

export function FileSidebar({ project }: FileSidebarProps) {
  const [files, setFiles] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!project) {
      setFiles([]);
      return;
    }
    setLoading(true);
    invoke<string[]>("list_project_files")
      .then(setFiles)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [project?.path]);

  return (
    <aside className="file-sidebar">
      <div className="file-sidebar-header">
        <span className="file-sidebar-title">Files</span>
      </div>

      {!project ? (
        <div className="file-sidebar-empty">
          <p>Open a project to see files here.</p>
        </div>
      ) : loading ? (
        <div className="file-tree-loading">
          <div className="shimmer" />
          <div className="shimmer" />
          <div className="shimmer" />
          <div className="shimmer" />
        </div>
      ) : (
        <div className="file-tree">
          {files.length === 0 ? (
            <p className="text-muted" style={{ padding: 8 }}>Empty project</p>
          ) : (
            <ul className="file-list">
              {files.map((file) => {
                const isDir = file.endsWith("/") || files.some((f) => f.startsWith(file + "/"));
                return (
                  <li key={file} className="file-item">
                    <span className="file-icon">{isDir ? "D" : "F"}</span>
                    <span className="file-name">{file}</span>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </aside>
  );
}
