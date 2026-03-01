interface SettingsPanelProps {
  theme: "light" | "dark";
  onThemeChange: (theme: "light" | "dark") => void;
  onClose: () => void;
}

export function SettingsPanel({ theme, onThemeChange, onClose }: SettingsPanelProps) {
  return (
    <>
      <div className="settings-overlay" onClick={onClose} />
      <div className="settings-drawer">
        <div className="settings-header">
          <h3>Settings</h3>
          <button className="settings-close" onClick={onClose}>
            &times;
          </button>
        </div>

        <div className="setting-group">
          <h4>Appearance</h4>
          <div className="setting-row">
            <span>Theme</span>
            <select
              value={theme}
              onChange={(e) => onThemeChange(e.target.value as "light" | "dark")}
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </select>
          </div>
        </div>

        <div className="setting-group">
          <h4>About</h4>
          <div className="setting-about">
            <p><strong>CC Desktop</strong> v0.1.0</p>
            <p>Desktop GUI for Claude Code</p>
            <p className="setting-about-link">
              <a
                href="https://claudetemplate.com"
                target="_blank"
                rel="noopener noreferrer"
                className="link"
              >
                claudetemplate.com
              </a>
            </p>
            <p className="setting-about-link">
              <a
                href="https://github.com/PingPingE/CC-Desktop"
                target="_blank"
                rel="noopener noreferrer"
                className="link"
              >
                GitHub
              </a>
            </p>
          </div>
        </div>

        <div className="setting-group">
          <h4>Data</h4>
          <button
            className="setting-danger-btn"
            onClick={() => {
              if (confirm("Clear all chat history and recent projects?")) {
                // Clear all cc-chat-* and recent projects
                const keysToRemove: string[] = [];
                for (let i = 0; i < localStorage.length; i++) {
                  const key = localStorage.key(i);
                  if (key && (key.startsWith("cc-chat-") || key === "cc-desktop-recent-projects")) {
                    keysToRemove.push(key);
                  }
                }
                keysToRemove.forEach((k) => localStorage.removeItem(k));
                window.location.reload();
              }
            }}
          >
            Clear All Data
          </button>
        </div>
      </div>
    </>
  );
}
