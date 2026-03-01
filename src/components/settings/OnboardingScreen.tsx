import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";

interface OnboardingScreenProps {
  onRetry: () => void;
}

interface InstallProgress {
  line: string;
  stage: string;
}

export function OnboardingScreen({ onRetry }: OnboardingScreenProps) {
  const [installing, setInstalling] = useState(false);
  const [installLog, setInstallLog] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unlisten = listen<InstallProgress>("install-progress", (event) => {
      setInstallLog((prev) => [...prev.slice(-20), event.payload.line]);
      if (event.payload.stage === "done") {
        setInstalling(false);
        // Auto-retry after successful install
        setTimeout(() => onRetry(), 1000);
      }
    });
    return () => { unlisten.then((fn) => fn()); };
  }, [onRetry]);

  const handleInstall = async () => {
    setInstalling(true);
    setError(null);
    setInstallLog([]);
    try {
      await invoke("install_claude_code");
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setInstalling(false);
    }
  };

  return (
    <div className="onboarding-screen">
      <div className="onboarding-card">
        <h1>Welcome to CC Desktop</h1>
        <p className="onboarding-subtitle">
          A friendly interface for Claude Code — no terminal needed
        </p>

        {!installing && installLog.length === 0 && (
          <>
            <div className="onboarding-step">
              <div className="step-number">1</div>
              <div className="step-content">
                <h3>Install Claude Code</h3>
                <p>CC Desktop needs Claude Code CLI to work. You can install it automatically or manually:</p>
                <code className="install-command">npm install -g @anthropic-ai/claude-code</code>
                <p className="step-note">
                  Claude Code will ask for your API key on first use.
                </p>
              </div>
            </div>

            <div className="onboarding-step">
              <div className="step-number">2</div>
              <div className="step-content">
                <h3>Open a project and start chatting</h3>
                <p>Pick any folder and start building with AI — no terminal needed.</p>
              </div>
            </div>

            <div className="onboarding-optional">
              <h3>Optional: Install a template</h3>
              <p>
                Templates add pre-built agent teams to your project.
              </p>
              <a
                href="https://claudetemplate.com"
                target="_blank"
                rel="noopener noreferrer"
                className="link"
              >
                Browse templates at claudetemplate.com
              </a>
            </div>

            <div className="onboarding-actions">
              <button className="btn-primary" onClick={handleInstall}>
                Install Claude Code Automatically
              </button>
              <button className="btn-secondary" onClick={onRetry}>
                I've already installed it
              </button>
            </div>
          </>
        )}

        {installing && (
          <div className="install-progress">
            <div className="loading-spinner" />
            <p>Installing Claude Code...</p>
            <div className="install-log">
              {installLog.map((line, i) => (
                <div key={i} className="install-log-line">{line}</div>
              ))}
            </div>
          </div>
        )}

        {error && (
          <div className="install-error">
            <p>Installation failed:</p>
            <pre>{error}</pre>
            <div className="onboarding-actions">
              <button className="btn-primary" onClick={handleInstall}>
                Try Again
              </button>
              <button className="btn-secondary" onClick={onRetry}>
                I installed it manually
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
