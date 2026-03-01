import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import type { ClaudeInstallStatus, InstallProgressEvent } from "../../types";
import { useLocale } from "../../i18n";

interface ClaudeCodeStepProps {
  onNext: () => void;
}

export function ClaudeCodeStep({ onNext }: ClaudeCodeStepProps) {
  const { t } = useLocale();
  const [status, setStatus] = useState<"checking" | "installed" | "not_installed" | "installing" | "install_error">("checking");
  const [version, setVersion] = useState<string | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [errorMsg, setErrorMsg] = useState<string>("");

  useEffect(() => {
    checkInstallation();
  }, []);

  useEffect(() => {
    const unlisten = listen<InstallProgressEvent>("install-progress", (event) => {
      setLogs((prev) => [...prev, event.payload.line]);
      if (event.payload.stage === "done") {
        setStatus("installed");
      }
    });
    return () => {
      unlisten.then((fn) => fn());
    };
  }, []);

  async function checkInstallation() {
    setStatus("checking");
    try {
      const result = await invoke<ClaudeInstallStatus>("check_claude_installed");
      if (result.installed) {
        setStatus("installed");
        setVersion(result.version);
      } else {
        setStatus("not_installed");
      }
    } catch {
      setStatus("not_installed");
    }
  }

  async function handleInstall() {
    setStatus("installing");
    setLogs([]);
    setErrorMsg("");
    try {
      await invoke("install_claude_code");
      const result = await invoke<ClaudeInstallStatus>("check_claude_installed");
      if (result.installed) {
        setStatus("installed");
        setVersion(result.version);
      }
    } catch (err) {
      setStatus("install_error");
      setErrorMsg(typeof err === "string" ? err : t("onboarding.claudeCode.installError"));
    }
  }

  return (
    <div className="onboarding-wizard-step">
      <h2>{t("onboarding.claudeCode.title")}</h2>
      <p className="wizard-desc">
        {t("onboarding.claudeCode.desc")}
      </p>

      <div className="install-status-card">
        {status === "checking" && (
          <div className="install-status-row">
            <div className="loading-spinner" />
            <span>{t("onboarding.claudeCode.checking")}</span>
          </div>
        )}

        {status === "installed" && (
          <div className="install-status-row install-status-success">
            <span className="install-check">&#10003;</span>
            <div>
              <strong>{t("onboarding.claudeCode.installed")}</strong>
              {version && <span className="install-version">v{version}</span>}
            </div>
          </div>
        )}

        {status === "not_installed" && (
          <div className="install-status-content">
            <p className="install-status-message">
              {t("onboarding.claudeCode.notInstalled")}
            </p>
            <button className="wizard-btn-primary" onClick={handleInstall}>
              {t("onboarding.claudeCode.autoInstall")}
            </button>
            <p className="install-manual-hint">
              {t("onboarding.claudeCode.manualHint")}{" "}
              <a href="https://claude.ai/download" target="_blank" rel="noopener noreferrer" className="link">claude.ai/download</a>
            </p>
          </div>
        )}

        {status === "installing" && (
          <div className="install-status-content">
            <div className="install-status-row">
              <div className="loading-spinner" />
              <span>{t("onboarding.claudeCode.installing")}</span>
            </div>
            {logs.length > 0 && (
              <div className="install-log">
                {logs.slice(-5).map((line, i) => (
                  <div key={i} className="install-log-line">{line}</div>
                ))}
              </div>
            )}
          </div>
        )}

        {status === "install_error" && (
          <div className="install-status-content">
            <div className="install-status-row install-status-error">
              <span className="install-x">&#10007;</span>
              <span>{t("onboarding.claudeCode.installFailed")}</span>
            </div>
            {errorMsg && <p className="install-error-detail">{errorMsg}</p>}
            <div className="install-error-actions">
              <button className="wizard-btn-secondary" onClick={handleInstall}>
                {t("onboarding.claudeCode.retry")}
              </button>
              <a
                href="https://claude.ai/download"
                target="_blank"
                rel="noopener noreferrer"
                className="wizard-btn-secondary"
              >
                {t("onboarding.claudeCode.manualGuide")}
              </a>
            </div>
          </div>
        )}
      </div>

      <button
        className="wizard-btn-primary"
        disabled={status !== "installed"}
        onClick={onNext}
      >
        {t("onboarding.claudeCode.next")}
      </button>
    </div>
  );
}
