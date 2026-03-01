import { useLocale } from "../../i18n";

interface SettingsPanelProps {
  theme: "light" | "dark";
  onThemeChange: (theme: "light" | "dark") => void;
  onClose: () => void;
}

export function SettingsPanel({ theme, onThemeChange, onClose }: SettingsPanelProps) {
  const { locale, setLocale, t } = useLocale();

  return (
    <>
      <div className="settings-overlay" onClick={onClose} />
      <div className="settings-drawer">
        <div className="settings-header">
          <h3>{t("settings.title")}</h3>
          <button className="settings-close" onClick={onClose}>
            &times;
          </button>
        </div>

        <div className="setting-group">
          <h4>{t("settings.appearance")}</h4>
          <div className="setting-row">
            <span>{t("settings.theme")}</span>
            <select
              value={theme}
              onChange={(e) => onThemeChange(e.target.value as "light" | "dark")}
            >
              <option value="light">{t("settings.theme.light")}</option>
              <option value="dark">{t("settings.theme.dark")}</option>
            </select>
          </div>
          <div className="setting-row">
            <span>{t("settings.language")}</span>
            <select
              value={locale}
              onChange={(e) => setLocale(e.target.value as "ko" | "en")}
            >
              <option value="ko">{t("settings.language.ko")}</option>
              <option value="en">{t("settings.language.en")}</option>
            </select>
          </div>
        </div>

        <div className="setting-group">
          <h4>{t("settings.about")}</h4>
          <div className="setting-about">
            <p><strong>CC Desktop</strong> v0.1.0</p>
            <p>{t("settings.aboutDesc")}</p>
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
          <h4>{t("settings.data")}</h4>
          <button
            className="setting-secondary-btn"
            onClick={() => {
              localStorage.removeItem("onboarding_completed");
              window.location.reload();
            }}
          >
            {t("settings.replayOnboarding")}
          </button>
          <button
            className="setting-danger-btn"
            onClick={() => {
              if (confirm(t("settings.clearConfirm"))) {
                // Clear all cc-chat-*, recent projects, and onboarding
                const keysToRemove: string[] = [];
                for (let i = 0; i < localStorage.length; i++) {
                  const key = localStorage.key(i);
                  if (key && (key.startsWith("cc-chat-") || key === "cc-desktop-recent-projects")) {
                    keysToRemove.push(key);
                  }
                }
                keysToRemove.forEach((k) => localStorage.removeItem(k));
                localStorage.removeItem("onboarding_completed");
                window.location.reload();
              }
            }}
          >
            {t("settings.clearData")}
          </button>
        </div>
      </div>
    </>
  );
}
