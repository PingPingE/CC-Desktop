import { useState } from "react";
import type { Project, AppSettings } from "@/types";

interface SidebarProps {
  currentProject: Project | null;
  onProjectSelect: (project: Project) => void;
  settings: AppSettings;
  onSettingsChange: (settings: AppSettings) => void;
}

type SidebarTab = "projects" | "agents" | "templates" | "settings";

export function Sidebar({
  currentProject,
  onProjectSelect,
  settings,
  onSettingsChange,
}: SidebarProps) {
  const [activeTab, setActiveTab] = useState<SidebarTab>("projects");

  const tabs: { id: SidebarTab; label: string; icon: string }[] = [
    { id: "projects", label: "Projects", icon: "folder" },
    { id: "agents", label: "Agents", icon: "users" },
    { id: "templates", label: "Templates", icon: "package" },
    { id: "settings", label: "Settings", icon: "settings" },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h1 className="sidebar-logo">CC Desktop</h1>
      </div>

      <nav className="sidebar-tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`sidebar-tab ${activeTab === tab.id ? "active" : ""}`}
            onClick={() => setActiveTab(tab.id)}
            title={tab.label}
          >
            <span className="sidebar-tab-icon">{tab.icon[0].toUpperCase()}</span>
          </button>
        ))}
      </nav>

      <div className="sidebar-content">
        {activeTab === "projects" && (
          <ProjectList
            current={currentProject}
            recent={settings.recentProjects}
            onSelect={onProjectSelect}
          />
        )}
        {activeTab === "agents" && (
          <AgentList project={currentProject} />
        )}
        {activeTab === "templates" && (
          <TemplateList />
        )}
        {activeTab === "settings" && (
          <SettingsPanel settings={settings} onChange={onSettingsChange} />
        )}
      </div>
    </aside>
  );
}

function ProjectList({
  current,
  recent,
  onSelect,
}: {
  current: Project | null;
  recent: Project[];
  onSelect: (project: Project) => void;
}) {
  const handleOpenFolder = async () => {
    const { open } = await import("@tauri-apps/plugin-dialog");
    const selected = await open({ directory: true, title: "Open Project Folder" });
    if (selected) {
      onSelect({
        path: selected as string,
        name: (selected as string).split("/").pop() || "project",
        lastOpened: Date.now(),
        hasClaudeConfig: false, // will be checked after selection
      });
    }
  };

  return (
    <div className="panel-section">
      <button className="btn-primary" onClick={handleOpenFolder}>
        Open Project Folder
      </button>
      {current && (
        <div className="current-project">
          <span className="label">Current</span>
          <span className="project-name">{current.name}</span>
          <span className="project-path">{current.path}</span>
        </div>
      )}
      {recent.length > 0 && (
        <>
          <span className="label">Recent</span>
          {recent.map((p) => (
            <button
              key={p.path}
              className="project-item"
              onClick={() => onSelect(p)}
            >
              {p.name}
            </button>
          ))}
        </>
      )}
    </div>
  );
}

function AgentList({ project }: { project: Project | null }) {
  if (!project) {
    return <p className="empty-state">Open a project to see agents</p>;
  }
  return (
    <div className="panel-section">
      <p className="text-muted">Agents from .claude/agents/</p>
      {/* Will be populated by discover_agents command */}
    </div>
  );
}

function TemplateList() {
  const templates = [
    { name: "Startup Dev Team", price: "Free", url: "https://claudetemplate.com" },
    { name: "Test & Bug Fix Kit", price: "$9", url: "https://claudetemplate.com" },
    { name: "UX Review Team", price: "$19", url: "https://claudetemplate.com" },
    { name: "Enterprise Dev Team", price: "$19", url: "https://claudetemplate.com" },
  ];

  return (
    <div className="panel-section">
      <h3>CC-Marketplace Templates</h3>
      {templates.map((t) => (
        <div key={t.name} className="template-item">
          <span className="template-name">{t.name}</span>
          <span className="template-price">{t.price}</span>
        </div>
      ))}
      <a
        href="https://claudetemplate.com"
        target="_blank"
        rel="noopener noreferrer"
        className="btn-secondary"
      >
        Browse All Templates
      </a>
    </div>
  );
}

function SettingsPanel({
  settings,
  onChange,
}: {
  settings: AppSettings;
  onChange: (s: AppSettings) => void;
}) {
  return (
    <div className="panel-section">
      <h3>Settings</h3>
      <label className="setting-row">
        <span>Theme</span>
        <select
          value={settings.theme}
          onChange={(e) =>
            onChange({ ...settings, theme: e.target.value as AppSettings["theme"] })
          }
        >
          <option value="dark">Dark</option>
          <option value="light">Light</option>
          <option value="system">System</option>
        </select>
      </label>
      <label className="setting-row">
        <span>Font Size</span>
        <input
          type="number"
          min={12}
          max={20}
          value={settings.fontSize}
          onChange={(e) =>
            onChange({ ...settings, fontSize: Number(e.target.value) })
          }
        />
      </label>
    </div>
  );
}
