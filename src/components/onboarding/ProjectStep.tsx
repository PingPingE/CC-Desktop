import { useState } from "react";
import { invoke } from "@tauri-apps/api/core";

interface ProjectStepProps {
  onComplete: (projectPath: string, projectName: string) => void;
}

export function ProjectStep({ onComplete }: ProjectStepProps) {
  const [creating, setCreating] = useState(false);
  const [projectName, setProjectName] = useState("");

  async function handleOpenFolder() {
    const { open } = await import("@tauri-apps/plugin-dialog");
    const selected = await open({ directory: true, title: "프로젝트 폴더 선택" });
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
      <h2>프로젝트 선택</h2>
      <p className="wizard-desc">
        작업할 프로젝트 폴더를 열거나, 새 프로젝트를 만드세요.
      </p>

      <div className="project-choice-cards">
        <button className="project-choice-card" onClick={handleOpenFolder}>
          <div className="project-choice-icon">&#128194;</div>
          <strong>기존 폴더 열기</strong>
          <span>이미 있는 프로젝트 폴더를 선택합니다</span>
        </button>

        <button
          className="project-choice-card"
          onClick={() => setCreating(true)}
        >
          <div className="project-choice-icon">&#10010;</div>
          <strong>새 프로젝트 만들기</strong>
          <span>빈 프로젝트를 새로 만듭니다</span>
        </button>
      </div>

      {creating && (
        <div className="project-create-inline">
          <input
            type="text"
            className="welcome-create-input"
            placeholder="프로젝트 이름 (예: my-app)"
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
              취소
            </button>
            <button
              className="welcome-create-submit"
              disabled={!projectName.trim()}
              onClick={handleCreateProject}
            >
              만들기
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
