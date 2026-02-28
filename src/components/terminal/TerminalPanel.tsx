import { useState } from "react";

export function TerminalPanel() {
  const [output] = useState<string[]>([
    "CC Desktop Terminal — build output, test results, and command output will appear here.",
  ]);

  return (
    <div className="terminal-panel">
      <div className="panel-header">
        <h3>Terminal Output</h3>
      </div>
      <div className="terminal-output">
        {output.map((line, i) => (
          <pre key={i} className="terminal-line">
            {line}
          </pre>
        ))}
      </div>
    </div>
  );
}
