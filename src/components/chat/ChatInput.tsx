import { useState, useRef, useEffect } from "react";
import type { ProcessState } from "@/types";

interface ChatInputProps {
  onSend: (content: string) => void;
  disabled: boolean;
  processState: ProcessState;
  onStop: () => void;
  onClear?: () => void;
}

export function ChatInput({ onSend, disabled, processState, onStop, onClear }: ChatInputProps) {
  const [input, setInput] = useState("");
  const [showCommands, setShowCommands] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isRunning = processState === "running";

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [input]);

  // Show slash command palette when typing "/"
  useEffect(() => {
    if (input === "/") {
      setShowCommands(true);
    } else if (!input.startsWith("/")) {
      setShowCommands(false);
    }
  }, [input]);

  const handleSubmit = () => {
    if (!input.trim() || disabled) return;
    onSend(input.trim());
    setInput("");
    setShowCommands(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
    if (e.key === "Escape") {
      setShowCommands(false);
    }
  };

  const commands = [
    { name: "/plan-feature", desc: "Break a feature into tasks" },
    { name: "/implement", desc: "Quick implementation" },
    { name: "/code-review", desc: "Security + quality review" },
    { name: "/refactor", desc: "Optimize without behavior change" },
    { name: "/auto-fix", desc: "Fix build/lint/type errors" },
    { name: "/ship", desc: "Pre-ship verification" },
  ];

  const filteredCommands = commands.filter((cmd) =>
    cmd.name.startsWith(input.toLowerCase())
  );

  return (
    <div className="chat-input-container">
      {/* Slash command palette */}
      {showCommands && filteredCommands.length > 0 && (
        <div className="command-palette">
          {filteredCommands.map((cmd) => (
            <button
              key={cmd.name}
              className="command-option"
              onClick={() => {
                setInput(cmd.name + " ");
                setShowCommands(false);
                textareaRef.current?.focus();
              }}
            >
              <span className="command-name">{cmd.name}</span>
              <span className="command-desc">{cmd.desc}</span>
            </button>
          ))}
        </div>
      )}

      <div className="chat-input-row">
        <textarea
          ref={textareaRef}
          className="chat-textarea"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={
            disabled
              ? isRunning
                ? "Claude is working..."
                : "Open a project to start"
              : 'Type a message or "/" for commands...'
          }
          disabled={disabled}
          rows={1}
        />
        {isRunning ? (
          <button className="stop-btn" onClick={onStop}>
            Stop
          </button>
        ) : (
          <button
            className="send-btn"
            onClick={handleSubmit}
            disabled={!input.trim() || disabled}
          >
            Send
          </button>
        )}
      </div>

      <div className="chat-input-hint">
        {isRunning ? (
          <span>Claude is working... press Stop to interrupt</span>
        ) : (
          <span>
            Enter to send, Shift+Enter for new line, / for commands
            {onClear && (
              <>
                {" · "}
                <button className="clear-chat-btn" onClick={onClear}>Clear chat</button>
              </>
            )}
          </span>
        )}
      </div>
    </div>
  );
}
