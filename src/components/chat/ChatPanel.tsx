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
}

export function ChatPanel({
  project,
  processState,
  onProcessStateChange,
  onToggleFileTree,
  onToggleTerminal,
}: ChatPanelProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (content: string) => {
    if (!project) return;

    // Add user message
    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content,
      timestamp: Date.now(),
      status: "complete",
    };
    setMessages((prev) => [...prev, userMessage]);

    // Start Claude Code process
    onProcessStateChange("running");

    // Add streaming assistant message placeholder
    const assistantMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "assistant",
      content: "",
      timestamp: Date.now(),
      status: "streaming",
    };
    setMessages((prev) => [...prev, assistantMessage]);

    // TODO: Connect to Claude Code CLI via Tauri shell plugin
    // For now, simulate a response
    setTimeout(() => {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantMessage.id
            ? {
                ...m,
                content:
                  "Claude Code integration coming soon. This is where the response will stream in real-time.",
                status: "complete",
              }
            : m
        )
      );
      onProcessStateChange("idle");
    }, 1000);
  };

  return (
    <main className="chat-panel">
      {/* Toolbar */}
      <div className="chat-toolbar">
        <div className="toolbar-left">
          <button className="toolbar-btn" onClick={onToggleFileTree} title="Toggle File Tree">
            Files
          </button>
          <button className="toolbar-btn" onClick={onToggleTerminal} title="Toggle Terminal">
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
    </main>
  );
}

function WelcomeScreen({ hasProject }: { hasProject: boolean }) {
  return (
    <div className="welcome-screen">
      <h2>CC Desktop</h2>
      <p>Your Claude Code development environment</p>
      {!hasProject ? (
        <div className="welcome-actions">
          <p>Open a project folder to get started</p>
        </div>
      ) : (
        <div className="welcome-actions">
          <p>Try these commands:</p>
          <div className="command-suggestions">
            <code>/plan-feature</code>
            <code>/implement</code>
            <code>/code-review</code>
            <code>/refactor</code>
          </div>
        </div>
      )}
    </div>
  );
}

function ProcessIndicator({ state }: { state: ProcessState }) {
  const labels: Record<ProcessState, string> = {
    idle: "Ready",
    starting: "Starting...",
    running: "Running...",
    waiting_permission: "Waiting for approval",
    error: "Error",
    stopped: "Stopped",
  };

  const colors: Record<ProcessState, string> = {
    idle: "var(--success)",
    starting: "var(--warning)",
    running: "var(--accent)",
    waiting_permission: "var(--warning)",
    error: "var(--error)",
    stopped: "var(--text-muted)",
  };

  return (
    <div className="process-indicator">
      <span
        className="status-dot"
        style={{ backgroundColor: colors[state] }}
      />
      <span className="status-label">{labels[state]}</span>
    </div>
  );
}
