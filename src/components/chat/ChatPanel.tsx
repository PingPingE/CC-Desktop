import { useState, useRef, useEffect } from "react";
import type { ChatMessage, ProcessState, Project } from "@/types";
import { ChatInput } from "./ChatInput";
import { MessageBubble } from "./MessageBubble";

interface ChatPanelProps {
  project: Project | null;
  processState: ProcessState;
  onProcessStateChange: (state: ProcessState) => void;
  onToggleFileTree: () => void;
  onToggleTerminal: () => void;
  showFileTree: boolean;
  showTerminal: boolean;
}

export function ChatPanel({
  project,
  processState,
  onProcessStateChange,
  onToggleFileTree,
  onToggleTerminal,
  showFileTree,
  showTerminal,
}: ChatPanelProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (content: string) => {
    if (!project) return;

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content,
      timestamp: Date.now(),
      status: "complete",
    };
    setMessages((prev) => [...prev, userMessage]);
    onProcessStateChange("running");

    const assistantMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "assistant",
      content: "",
      timestamp: Date.now(),
      status: "streaming",
    };
    setMessages((prev) => [...prev, assistantMessage]);

    // TODO: Connect to Claude Code CLI via Tauri shell plugin
    setTimeout(() => {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantMessage.id
            ? {
                ...m,
                content: "Claude Code integration coming soon. This is where the response will stream in real-time.",
                status: "complete" as const,
              }
            : m
        )
      );
      onProcessStateChange("idle");
    }, 1500);
  };

  return (
    <div className="chat-panel">
      {/* Toolbar */}
      <div className="chat-toolbar">
        <div className="toolbar-left">
          <button
            className={`toolbar-btn ${showFileTree ? "active" : ""}`}
            onClick={onToggleFileTree}
            title="Toggle File Tree"
          >
            Files
          </button>
          <button
            className={`toolbar-btn ${showTerminal ? "active" : ""}`}
            onClick={onToggleTerminal}
            title="Toggle Terminal"
          >
            Terminal
          </button>
        </div>
        <div className="toolbar-center">
          {project ? (
            <span className="project-indicator">{project.name}</span>
          ) : (
            <span className="text-muted">No project open</span>
          )}
        </div>
        <div className="toolbar-right">
          <ProcessIndicator state={processState} />
        </div>
      </div>

      {/* Messages */}
      <div className="chat-messages">
        {messages.length === 0 ? (
          <WelcomeScreen hasProject={!!project} />
        ) : (
          messages.map((msg) => <MessageBubble key={msg.id} message={msg} />)
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <ChatInput
        onSend={handleSendMessage}
        disabled={!project || processState === "running"}
        processState={processState}
      />
    </div>
  );
}

function WelcomeScreen({ hasProject }: { hasProject: boolean }) {
  return (
    <div className="welcome-screen">
      <div className="welcome-icon">CC</div>
      {!hasProject ? (
        <>
          <h2>Welcome to CC Desktop</h2>
          <p>Open a project folder from the sidebar to get started.</p>
        </>
      ) : (
        <>
          <h2>What do you want to build?</h2>
          <p>Type a message below, or try a slash command:</p>
          <div className="command-suggestions">
            <code>/plan-feature</code>
            <code>/implement</code>
            <code>/code-review</code>
            <code>/refactor</code>
          </div>
        </>
      )}
    </div>
  );
}

function ProcessIndicator({ state }: { state: ProcessState }) {
  const config: Record<ProcessState, { label: string; color: string }> = {
    idle: { label: "Ready", color: "var(--success)" },
    starting: { label: "Starting...", color: "var(--warning)" },
    running: { label: "Running...", color: "var(--accent)" },
    waiting_permission: { label: "Waiting", color: "var(--warning)" },
    error: { label: "Error", color: "var(--error)" },
    stopped: { label: "Stopped", color: "var(--text-muted)" },
  };

  const { label, color } = config[state];

  return (
    <div className="process-indicator">
      <span className="status-dot" style={{ backgroundColor: color }} />
      <span className="status-label">{label}</span>
    </div>
  );
}
