import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";

interface TeamViewProps {
  projectPath: string | null;
}

export function TeamView({ projectPath }: TeamViewProps) {
  const [agents, setAgents] = useState<string[]>([]);
  const [skills, setSkills] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!projectPath) return;
    setLoading(true);

    Promise.all([
      invoke<string[]>("discover_agents"),
      invoke<string[]>("discover_skills"),
    ])
      .then(([a, s]) => {
        setAgents(a);
        setSkills(s);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [projectPath]);

  if (!projectPath) {
    return (
      <div className="team-view">
        <div className="empty-state">
          <h3>Team View</h3>
          <p>Open a project to see its agent team</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="team-view">
        <p className="text-muted">Scanning .claude/ directory...</p>
      </div>
    );
  }

  const hasTeam = agents.length > 0 || skills.length > 0;

  return (
    <div className="team-view">
      <div className="team-header">
        <h3>Team Composition</h3>
        {hasTeam && (
          <span className="team-count">
            {agents.length} agents, {skills.length} skills
          </span>
        )}
      </div>

      {!hasTeam ? (
        <div className="no-team">
          <p>No agents or skills found in this project.</p>
          <p className="text-muted">
            Claude Code still works without agents — you just won't have
            specialized roles like PM, developer, or tester.
          </p>
          <a
            href="https://claudetemplate.com"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary"
          >
            Get a Template
          </a>
        </div>
      ) : (
        <>
          {/* Agents */}
          {agents.length > 0 && (
            <div className="team-section">
              <h4>Agents</h4>
              <div className="team-list">
                {agents.map((agent) => (
                  <AgentCard key={agent} name={agent} />
                ))}
              </div>
            </div>
          )}

          {/* Skills */}
          {skills.length > 0 && (
            <div className="team-section">
              <h4>Skills (Slash Commands)</h4>
              <div className="skill-list">
                {skills.map((skill) => (
                  <SkillCard key={skill} name={skill} />
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function AgentCard({ name }: { name: string }) {
  // TODO: Parse YAML frontmatter from agent file for model, description, tools
  return (
    <div className="agent-card">
      <div className="agent-icon">A</div>
      <div className="agent-info">
        <span className="agent-name">{name}</span>
        <span className="agent-file">.claude/agents/{name}.md</span>
      </div>
    </div>
  );
}

function SkillCard({ name }: { name: string }) {
  return (
    <div className="skill-card">
      <code className="skill-command">/{name}</code>
      <span className="skill-file">.claude/skills/{name}.md</span>
    </div>
  );
}
