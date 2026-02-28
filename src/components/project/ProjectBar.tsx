import type { ProjectAnalysis } from "@/App";

interface ProjectBarProps {
  analysis: ProjectAnalysis;
}

export function ProjectBar({ analysis }: ProjectBarProps) {
  const techLabel = analysis.framework
    ? `${analysis.framework} (${analysis.languages[0]})`
    : analysis.languages.join(", ");

  const teamLabel =
    analysis.agent_count > 0 || analysis.skill_count > 0
      ? `${analysis.agent_count} agents, ${analysis.skill_count} skills`
      : "No team";

  return (
    <div className="project-bar">
      <div className="project-bar-info">
        <span className="project-bar-tag">{techLabel}</span>
        {analysis.has_git && <span className="project-bar-tag project-bar-tag-git">Git</span>}
        <span className={`project-bar-tag ${analysis.has_claude_config ? "project-bar-tag-active" : "project-bar-tag-inactive"}`}>
          {teamLabel}
        </span>
      </div>

      {analysis.suggestion && (
        <span className="project-bar-suggestion">{analysis.suggestion}</span>
      )}
    </div>
  );
}
