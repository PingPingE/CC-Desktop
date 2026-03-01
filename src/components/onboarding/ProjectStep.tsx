import { useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { useLocale } from "../../i18n";

interface ProjectStepProps {
  onComplete: (projectPath: string, projectName: string) => void;
}

export function ProjectStep({ onComplete }: ProjectStepProps) {
  const { t } = useLocale();
  const [creating, setCreating] = useState(false);
  const [projectName, setProjectName] = useState("");

  async function handleOpenFolder() {
    const { open } = await import("@tauri-apps/plugin-dialog");
    const selected = await open({ directory: true, title: t("onboarding.project.dialogTitle") });
    if (selected) {
      const path = selected as string;
      const name = path.split("/").pop() || path.split("\\").pop() || "project";
      onComplete(path, name);
    }
  }

  async function handleCreateProject() {
    if (!projectName.trim()) return;
    try {
      const path = await invoke<string>("create_project", { name: projectName });
      const name = path.split("/").pop() || path.split("\\").pop() || projectName;
      onComplete(path, name);
    } catch (err) {
      console.error("Failed to create project:", err);
    }
  }

  return (
    <div className="onboarding-wizard-step">
      <h2>{t("onboarding.project.title")}</h2>
      <p className="wizard-desc">
        {t("onboarding.project.desc")}
      </p>

      <div className="project-choice-cards">
        <button className="project-choice-card" onClick={handleOpenFolder}>
          <div className="project-choice-icon">&#128194;</div>
          <strong>{t("onboarding.project.openFolder")}</strong>
          <span>{t("onboarding.project.openFolderDesc")}</span>
        </button>

        <button
          className="project-choice-card"
          onClick={() => setCreating(true)}
        >
          <div className="project-choice-icon">&#10010;</div>
          <strong>{t("onboarding.project.createNew")}</strong>
          <span>{t("onboarding.project.createNewDesc")}</span>
        </button>
      </div>

      {creating && (
        <div className="project-create-inline">
          <input
            type="text"
            className="welcome-create-input"
            placeholder={t("onboarding.project.namePlaceholder")}
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleCreateProject();
            }}
            autoFocus
          />
          <div className="welcome-create-actions">
            <button
              className="welcome-create-cancel"
              onClick={() => {
                setCreating(false);
                setProjectName("");
              }}
            >
              {t("onboarding.project.cancel")}
            </button>
            <button
              className="welcome-create-submit"
              disabled={!projectName.trim()}
              onClick={handleCreateProject}
            >
              {t("onboarding.project.create")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
