import { useState } from "react";
import { TeamView } from "../team/TeamView";
import type { Project, AppSettings, ApproveMode } from "@/types";

interface SidebarProps {
  currentProject: Project | null;
  onProjectSelect: (project: Project) => void;
  settings: AppSettings;
  onSettingsChange: (settings: AppSettings) => void;
}

type SidebarTab = "projects" | "team" | "templates" | "settings";

export function Sidebar({
  currentProject,
  onProjectSelect,
  settings,
  onSettingsChange,
}: SidebarProps) {
  const [activeTab, setActiveTab] = useState<SidebarTab>("projects");

  const tabs: { id: SidebarTab; label: string }[] = [
    { id: "projects", label: "Projects" },
    { id: "team", label: "Team" },
    { id: "templates", label: "Templates" },
    { id: "settings", label: "Settings" },
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
          >
            {tab.label}
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
        {activeTab === "team" && (
          <TeamView projectPath={currentProject?.path ?? null} />
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
        hasClaudeConfig: false,
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
      <p className="text-muted">
        Templates are optional — CC Desktop works with any Claude Code project.
      </p>
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
  const approveModes: { value: ApproveMode; label: string; description: string }[] = [
    {
      value: "ask-every-time",
      label: "Ask Every Time",
      description: "You approve each action individually. Best for learning and reviewing unfamiliar code.",
    },
    {
      value: "auto-approve-safe",
      label: "Auto-Approve Safe Actions",
      description: "File reads and searches run automatically. Edits and commands still ask. Good for daily development.",
    },
    {
      value: "auto-approve-all",
      label: "Auto-Approve Everything",
      description: "All actions run without asking. Maximum speed for trusted projects. You can switch back anytime.",
    },
  ];

  return (
    <div className="panel-section">
      <h3>Settings</h3>

      {/* Approve Mode */}
      <div className="setting-group">
        <h4>Permission Mode</h4>
        {approveModes.map((mode) => (
          <label key={mode.value} className="setting-radio">
            <input
              type="radio"
              name="approveMode"
              value={mode.value}
              checked={settings.approveMode === mode.value}
              onChange={() => onChange({ ...settings, approveMode: mode.value })}
            />
            <div className="radio-content">
              <span className="radio-label">{mode.label}</span>
              <span className="radio-desc">{mode.description}</span>
            </div>
          </label>
        ))}
      </div>

      {/* Theme */}
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

      {/* Font Size */}
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
