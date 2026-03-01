import { useState, useRef, useEffect, useMemo } from "react";
import type { ProcessState, SkillInfo } from "@/types";
import { useLocale } from "../../i18n";

interface ChatInputProps {
  onSend: (content: string) => void;
  disabled: boolean;
  processState: ProcessState;
  onStop: () => void;
  onClear?: () => void;
  skills?: SkillInfo[];
}

// Default commands when no skills are discovered
const DEFAULT_COMMANDS = [
  { name: "/plan-feature", desc: "Break a feature into tasks" },
  { name: "/implement", desc: "Quick implementation" },
  { name: "/code-review", desc: "Security + quality review" },
  { name: "/refactor", desc: "Optimize without behavior change" },
];

export function ChatInput({ onSend, disabled, processState, onStop, onClear, skills }: ChatInputProps) {
  const { t } = useLocale();
  const [input, setInput] = useState("");
  const [showCommands, setShowCommands] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isRunning = processState === "running";

  // Build command list from discovered skills or fallback to defaults
  const commands = useMemo(() => {
    if (skills && skills.length > 0) {
      return skills.map((s) => ({
        name: `/${s.slug}`,
        desc: s.description || s.name,
      }));
    }
    return DEFAULT_COMMANDS;
  }, [skills]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [input]);

  // Show slash command palette when typing "/"
  useEffect(() => {
    if (input.startsWith("/")) {
      setShowCommands(true);
    } else {
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

  const filteredCommands = commands.filter((cmd) =>
    cmd.name.toLowerCase().startsWith(input.toLowerCase())
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
                ? t("chatInput.placeholder.working")
                : t("chatInput.placeholder.noProject")
              : t("chatInput.placeholder.ready")
          }
          disabled={disabled}
          rows={1}
        />
        {isRunning ? (
          <button className="stop-btn" onClick={onStop}>
            {t("chatInput.stop")}
          </button>
        ) : (
          <button
            className="send-btn"
            onClick={handleSubmit}
            disabled={!input.trim() || disabled}
          >
            {t("chatInput.send")}
          </button>
        )}
      </div>

      <div className="chat-input-hint">
        {isRunning ? (
          <span>{t("chatInput.hint.working")}</span>
        ) : (
          <span>
            {t("chatInput.hint.ready")}
            {onClear && (
              <>
                {" · "}
                <button className="clear-chat-btn" onClick={onClear}>{t("chatInput.clearChat")}</button>
              </>
            )}
          </span>
        )}
      </div>
    </div>
  );
}
