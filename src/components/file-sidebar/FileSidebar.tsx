import { useState, useEffect, useCallback } from "react";
import { invoke } from "@tauri-apps/api/core";
import type { Project } from "@/types";

interface FileTreeNode {
  name: string;
  path: string;
  isDir: boolean;
  children: FileTreeNode[];
}

interface FileSidebarProps {
  project: Project | null;
}

/** Build a nested tree from flat relative paths */
function buildTree(paths: string[]): FileTreeNode[] {
  const root: FileTreeNode[] = [];
  // Sort so directories group before their children
  const sorted = [...paths].sort((a, b) => a.localeCompare(b));

  // Track which paths are directories (have children)
  const dirSet = new Set<string>();
  for (const p of sorted) {
    const parts = p.split("/");
    for (let i = 1; i < parts.length; i++) {
      dirSet.add(parts.slice(0, i).join("/"));
    }
  }

  for (const p of sorted) {
    const parts = p.split("/");
    let siblings = root;

    for (let i = 0; i < parts.length; i++) {
      const partName = parts[i];
      const partPath = parts.slice(0, i + 1).join("/");
      const isLast = i === parts.length - 1;
      const isDir = !isLast || dirSet.has(partPath);

      let existing = siblings.find((n) => n.name === partName && n.path === partPath);
      if (!existing) {
        existing = { name: partName, path: partPath, isDir, children: [] };
        siblings.push(existing);
      }
      siblings = existing.children;
    }
  }

  return sortTree(root);
}

/** Sort: directories first, then alphabetical */
function sortTree(nodes: FileTreeNode[]): FileTreeNode[] {
  return nodes
    .map((n) => ({ ...n, children: sortTree(n.children) }))
    .sort((a, b) => {
      if (a.isDir !== b.isDir) return a.isDir ? -1 : 1;
      return a.name.localeCompare(b.name);
    });
}

export function FileSidebar({ project }: FileSidebarProps) {
  const [tree, setTree] = useState<FileTreeNode[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!project) {
      setTree([]);
      return;
    }
    setLoading(true);
    invoke<string[]>("list_project_files")
      .then((paths) => setTree(buildTree(paths)))
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
          {tree.length === 0 ? (
            <p className="text-muted" style={{ padding: 8 }}>Empty project</p>
          ) : (
            <TreeNodeList nodes={tree} depth={0} />
          )}
        </div>
      )}
    </aside>
  );
}

function TreeNodeList({ nodes, depth }: { nodes: FileTreeNode[]; depth: number }) {
  return (
    <ul className="file-list">
      {nodes.map((node) => (
        <TreeNodeItem key={node.path} node={node} depth={depth} />
      ))}
    </ul>
  );
}

function TreeNodeItem({ node, depth }: { node: FileTreeNode; depth: number }) {
  const [expanded, setExpanded] = useState(depth < 1);

  const handleToggle = useCallback(() => {
    if (node.isDir) setExpanded((prev) => !prev);
  }, [node.isDir]);

  const icon = node.isDir
    ? expanded ? "\u25BE" : "\u25B8"  // ▾ or ▸
    : fileIcon(node.name);

  return (
    <li>
      <div
        className={`file-item ${node.isDir ? "file-item-dir" : ""}`}
        style={{ paddingLeft: 8 + depth * 16 }}
        onClick={handleToggle}
      >
        <span className={`file-icon ${node.isDir ? "file-icon-dir" : ""}`}>{icon}</span>
        <span className="file-name">{node.name}</span>
      </div>
      {node.isDir && expanded && node.children.length > 0 && (
        <TreeNodeList nodes={node.children} depth={depth + 1} />
      )}
    </li>
  );
}

/** Simple file icon by extension */
function fileIcon(name: string): string {
  const ext = name.split(".").pop()?.toLowerCase();
  switch (ext) {
    case "ts":
    case "tsx": return "TS";
    case "js":
    case "jsx": return "JS";
    case "rs": return "RS";
    case "json": return "{}";
    case "css": return "#";
    case "html": return "<>";
    case "md": return "M";
    case "toml": return "T";
    case "lock": return "L";
    case "png":
    case "jpg":
    case "svg":
    case "ico":
    case "icns": return "I";
    default: return "F";
  }
}
