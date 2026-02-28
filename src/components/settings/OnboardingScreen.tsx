interface OnboardingScreenProps {
  onRetry: () => void;
}

export function OnboardingScreen({ onRetry }: OnboardingScreenProps) {
  return (
    <div className="onboarding-screen">
      <div className="onboarding-card">
        <h1>Welcome to CC Desktop</h1>
        <p className="onboarding-subtitle">
          A friendly interface for Claude Code — no terminal needed
        </p>

        <div className="onboarding-step">
          <div className="step-number">1</div>
          <div className="step-content">
            <h3>Install Claude Code</h3>
            <p>CC Desktop wraps Claude Code CLI. Install it first:</p>
            <code className="install-command">npm install -g @anthropic-ai/claude-code</code>
            <p className="step-note">
              Claude Code will ask for your API key or login on first run — CC Desktop handles this automatically.
            </p>
          </div>
        </div>

        <div className="onboarding-step">
          <div className="step-number">2</div>
          <div className="step-content">
            <h3>Open a project folder</h3>
            <p>Pick any folder — CC Desktop works with any project, with or without templates.</p>
          </div>
        </div>

        <div className="onboarding-step">
          <div className="step-number">3</div>
          <div className="step-content">
            <h3>Start chatting</h3>
            <p>
              Type a message or use <code>/</code> to see available commands.
              Claude Code does the rest.
            </p>
          </div>
        </div>

        <div className="onboarding-optional">
          <h3>Optional: Install a template</h3>
          <p>
            Templates add pre-built agent teams (PM, developer, tester, etc.) to your project.
            CC Desktop works great without them too.
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

        <button className="btn-primary" onClick={onRetry}>
          I've installed Claude Code — Let's Go
        </button>
      </div>
    </div>
  );
}
