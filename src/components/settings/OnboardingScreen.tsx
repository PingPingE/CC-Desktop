interface OnboardingScreenProps {
  onRetry: () => void;
}

export function OnboardingScreen({ onRetry }: OnboardingScreenProps) {
  return (
    <div className="onboarding-screen">
      <div className="onboarding-card">
        <h1>Welcome to CC Desktop</h1>
        <p className="onboarding-subtitle">
          A friendly interface for Claude Code development workflows
        </p>

        <div className="onboarding-step">
          <div className="step-number">1</div>
          <div className="step-content">
            <h3>Install Claude Code</h3>
            <p>CC Desktop needs Claude Code CLI installed on your system.</p>
            <code className="install-command">npm install -g @anthropic-ai/claude-code</code>
          </div>
        </div>

        <div className="onboarding-step">
          <div className="step-number">2</div>
          <div className="step-content">
            <h3>Set up your API key</h3>
            <p>You need an Anthropic API key or Claude Pro/Max subscription.</p>
            <a
              href="https://console.anthropic.com"
              target="_blank"
              rel="noopener noreferrer"
              className="link"
            >
              Get an API key
            </a>
          </div>
        </div>

        <div className="onboarding-step">
          <div className="step-number">3</div>
          <div className="step-content">
            <h3>Get a template (optional)</h3>
            <p>Templates give Claude Code pre-built agent teams for specific workflows.</p>
            <a
              href="https://claudetemplate.com"
              target="_blank"
              rel="noopener noreferrer"
              className="link"
            >
              Browse templates
            </a>
          </div>
        </div>

        <button className="btn-primary" onClick={onRetry}>
          I've installed Claude Code — Check Again
        </button>
      </div>
    </div>
  );
}
