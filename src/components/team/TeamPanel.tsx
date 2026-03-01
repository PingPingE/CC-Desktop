import { useState } from "react";
import type { AgentInfo, SkillInfo } from "@/types";
import { useLocale } from "../../i18n";

interface TeamPanelProps {
  agents: AgentInfo[];
  skills: SkillInfo[];
  onSkillClick: (slug: string) => void;
}

const MODEL_LABELS: Record<string, string> = {
  opus: "Opus",
  sonnet: "Sonnet",
  haiku: "Haiku",
  inherit: "Inherit",
};

export function TeamPanel({ agents, skills, onSkillClick }: TeamPanelProps) {
  const { t } = useLocale();
  const [expanded, setExpanded] = useState(true);

  if (agents.length === 0 && skills.length === 0) {
    return null;
  }

  return (
    <div className={`team-panel ${expanded ? "" : "team-panel-collapsed"}`}>
      <button
        className="team-panel-toggle"
        onClick={() => setExpanded((v) => !v)}
      >
        <span className="team-panel-title">
          {t("team.title")} ({agents.length}A / {skills.length}S)
        </span>
        <span className="team-panel-arrow">{expanded ? "\u25BE" : "\u25B8"}</span>
      </button>

      {expanded && (
        <div className="team-panel-content">
          {agents.length > 0 && (
            <div className="team-section">
              <div className="team-section-label">{t("team.agents")}</div>
              {agents.map((agent) => (
                <div key={agent.slug} className="team-item team-item-agent">
                  <div className="team-item-header">
                    <span className="team-item-name">{agent.name}</span>
                    <span className="team-item-model">
                      {MODEL_LABELS[agent.model] || agent.model}
                    </span>
                  </div>
                  {agent.description && (
                    <div className="team-item-desc">{agent.description}</div>
                  )}
                </div>
              ))}
            </div>
          )}

          {skills.length > 0 && (
            <div className="team-section">
              <div className="team-section-label">{t("team.skills")}</div>
              {skills.map((skill) => (
                <button
                  key={skill.slug}
                  className="team-item team-item-skill"
                  onClick={() => onSkillClick(skill.slug)}
                >
                  <div className="team-item-header">
                    <span className="team-item-name">/{skill.slug}</span>
                  </div>
                  {skill.description && (
                    <div className="team-item-desc">{skill.description}</div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
