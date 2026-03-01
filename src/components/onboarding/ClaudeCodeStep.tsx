import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import type { ClaudeInstallStatus, InstallProgressEvent } from "../../types";

interface ClaudeCodeStepProps {
  onNext: () => void;
}

export function ClaudeCodeStep({ onNext }: ClaudeCodeStepProps) {
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
      // Status will be updated via event listener ("done" stage)
      const result = await invoke<ClaudeInstallStatus>("check_claude_installed");
      if (result.installed) {
        setStatus("installed");
        setVersion(result.version);
      }
    } catch (err) {
      setStatus("install_error");
      setErrorMsg(typeof err === "string" ? err : "설치에 실패했습니다.");
    }
  }

  return (
    <div className="onboarding-wizard-step">
      <h2>Claude Code 설치</h2>
      <p className="wizard-desc">
        CC Desktop은 Claude Code를 통해 동작합니다.
      </p>

      <div className="install-status-card">
        {status === "checking" && (
          <div className="install-status-row">
            <div className="loading-spinner" />
            <span>Claude Code 확인 중...</span>
          </div>
        )}

        {status === "installed" && (
          <div className="install-status-row install-status-success">
            <span className="install-check">&#10003;</span>
            <div>
              <strong>Claude Code 설치됨</strong>
              {version && <span className="install-version">v{version}</span>}
            </div>
          </div>
        )}

        {status === "not_installed" && (
          <div className="install-status-content">
            <p className="install-status-message">
              Claude Code가 설치되어 있지 않습니다.
            </p>
            <button className="wizard-btn-primary" onClick={handleInstall}>
              자동 설치
            </button>
            <p className="install-manual-hint">
              수동 설치: <a href="https://claude.ai/download" target="_blank" rel="noopener noreferrer" className="link">claude.ai/download</a>
            </p>
          </div>
        )}

        {status === "installing" && (
          <div className="install-status-content">
            <div className="install-status-row">
              <div className="loading-spinner" />
              <span>설치 중...</span>
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
              <span>설치 실패</span>
            </div>
            {errorMsg && <p className="install-error-detail">{errorMsg}</p>}
            <div className="install-error-actions">
              <button className="wizard-btn-secondary" onClick={handleInstall}>
                다시 시도
              </button>
              <a
                href="https://claude.ai/download"
                target="_blank"
                rel="noopener noreferrer"
                className="wizard-btn-secondary"
              >
                수동 설치 안내
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
        다음
      </button>
    </div>
  );
}
