import { useState } from "react";
import type { RemoteSession } from "@/types";

export function RemotePanel() {
  const [sessions, setSessions] = useState<RemoteSession[]>([]);
  const [host, setHost] = useState("");
  const [port, setPort] = useState("22");

  const handleConnect = () => {
    if (!host) return;
    const session: RemoteSession = {
      id: crypto.randomUUID(),
      host,
      port: Number(port),
      status: "connecting",
    };
    setSessions((prev) => [...prev, session]);

    // TODO: Implement SSH tunnel connection to remote Claude Code
    setTimeout(() => {
      setSessions((prev) =>
        prev.map((s) =>
          s.id === session.id ? { ...s, status: "connected" } : s
        )
      );
    }, 2000);
  };

  return (
    <div className="remote-panel">
      <h3>Remote Sessions</h3>
      <p className="text-muted">
        Connect to Claude Code running on remote machines.
      </p>

      <div className="remote-connect">
        <input
          type="text"
          placeholder="hostname or IP"
          value={host}
          onChange={(e) => setHost(e.target.value)}
          className="remote-input"
        />
        <input
          type="number"
          placeholder="port"
          value={port}
          onChange={(e) => setPort(e.target.value)}
          className="remote-port"
        />
        <button className="btn-primary" onClick={handleConnect}>
          Connect
        </button>
      </div>

      {sessions.length > 0 && (
        <div className="session-list">
          {sessions.map((s) => (
            <div key={s.id} className={`session-item session-${s.status}`}>
              <span className="session-host">
                {s.host}:{s.port}
              </span>
              <span className="session-status">{s.status}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
