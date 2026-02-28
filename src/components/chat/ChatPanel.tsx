import { useState, useRef, useEffect, useCallback } from "react";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import type { ChatMessage, ProcessState, Project } from "@/types";
import { ChatInput } from "./ChatInput";
import { MessageBubble } from "./MessageBubble";

interface ChatPanelProps {
  project: Project | null;
  processState: ProcessState;
  autoApprove: boolean;
  onProcessStateChange: (state: ProcessState) => void;
  onActivityChange: (text: string) => void;
  onOpenProject: () => void;
  onCreateProject: (name: string) => void;
  recentProjects: Project[];
  onSelectRecentProject: (project: Project) => void;
}

export function ChatPanel({
  project,
  processState,
  autoApprove,
  onProcessStateChange,
  onActivityChange,
  onOpenProject,
  onCreateProject,
  recentProjects,
  onSelectRecentProject,
}: ChatPanelProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const currentAssistantIdRef = useRef<string | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Listen for Claude output events
  useEffect(() => {
    const unlisten1 = listen<{ line: string }>("claude-output", (event) => {
      const assistantId = currentAssistantIdRef.current;
      if (!assistantId) return;

      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId
            ? {
                ...m,
                content: m.content ? m.content + "\n" + event.payload.line : event.payload.line,
              }
            : m
        )
      );
      onActivityChange("Claude is responding...");
    });

    const unlisten2 = listen<{ success: boolean; full_output: string }>("claude-done", (event) => {
      const assistantId = currentAssistantIdRef.current;
      if (!assistantId) return;

      setMessages((prev) =>
        prev.map((m) => {
          if (m.id !== assistantId) return m;
          const finalContent = event.payload.full_output || m.content || "(No response)";
          return {
            ...m,
            content: event.payload.success ? finalContent : `Error: ${finalContent}`,
            status: event.payload.success ? ("complete" as const) : ("error" as const),
          };
        })
      );
      onProcessStateChange(event.payload.success ? "idle" : "error");
      onActivityChange(event.payload.success ? "" : "Something went wrong");
      currentAssistantIdRef.current = null;
    });

    return () => {
      unlisten1.then((fn) => fn());
      unlisten2.then((fn) => fn());
    };
  }, [onProcessStateChange, onActivityChange]);

  const handleSendMessage = useCallback(
    async (content: string) => {
      if (!project) return;

      const userMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: "user",
        content,
        timestamp: Date.now(),
        status: "complete",
      };

      const assistantMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: "",
        timestamp: Date.now(),
        status: "streaming",
      };

      currentAssistantIdRef.current = assistantMessage.id;
      setMessages((prev) => [...prev, userMessage, assistantMessage]);
      onProcessStateChange("running");
      onActivityChange("Claude is thinking...");

      try {
        await invoke("run_claude_prompt", { prompt: content, autoApprove });
      } catch (err) {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantMessage.id
              ? {
                  ...m,
                  content: `Error: ${err instanceof Error ? err.message : String(err)}`,
                  status: "error" as const,
                }
              : m
          )
        );
        onProcessStateChange("error");
        onActivityChange("Something went wrong");
        currentAssistantIdRef.current = null;
      }
    },
    [project, onProcessStateChange, onActivityChange]
  );

  return (
    <div className="chat-panel">
      <div className="chat-messages">
        {messages.length === 0 ? (
          <WelcomeScreen
            hasProject={!!project}
            onOpenProject={onOpenProject}
            onCreateProject={onCreateProject}
            recentProjects={recentProjects}
            onSelectRecentProject={onSelectRecentProject}
          />
        ) : (
          messages.map((msg) => <MessageBubble key={msg.id} message={msg} />)
        )}
        <div ref={messagesEndRef} />
      </div>

      <ChatInput
        onSend={handleSendMessage}
        disabled={!project || processState === "running"}
        processState={processState}
      />
    </div>
  );
}

interface WelcomeScreenProps {
  hasProject: boolean;
  onOpenProject: () => void;
  onCreateProject: (name: string) => void;
  recentProjects: Project[];
  onSelectRecentProject: (project: Project) => void;
}

function WelcomeScreen({
  hasProject,
  onOpenProject,
  onCreateProject,
  recentProjects,
  onSelectRecentProject,
}: WelcomeScreenProps) {
  const [showCreate, setShowCreate] = useState(false);
  const [projectName, setProjectName] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (showCreate) inputRef.current?.focus();
  }, [showCreate]);

  const handleCreate = () => {
    const name = projectName.trim();
    if (!name) return;
    onCreateProject(name);
    setProjectName("");
    setShowCreate(false);
  };

  if (hasProject) {
    return (
      <div className="welcome-screen">
        <div className="welcome-icon">CC</div>
        <h2>What do you want to build?</h2>
        <p>Type a message below, or try a command:</p>
        <div className="command-suggestions">
          <code>/plan-feature</code>
          <code>/implement</code>
          <code>/code-review</code>
          <code>/refactor</code>
        </div>
      </div>
    );
  }

  return (
    <div className="welcome-screen">
      <div className="welcome-icon">CC</div>
      <h2>Welcome to CC Desktop</h2>
      <p>Start something new, or continue where you left off.</p>

      <div className="welcome-actions">
        {!showCreate ? (
          <>
            <button className="welcome-action-btn welcome-action-primary" onClick={() => setShowCreate(true)}>
              <span className="welcome-action-icon">+</span>
              <span className="welcome-action-text">
                <strong>Start a new project</strong>
                <span>Create a folder and start building from scratch</span>
              </span>
            </button>

            <button className="welcome-action-btn" onClick={onOpenProject}>
              <span className="welcome-action-icon">O</span>
              <span className="welcome-action-text">
                <strong>Open existing folder</strong>
                <span>I already have a project folder</span>
              </span>
            </button>
          </>
        ) : (
          <div className="welcome-create-form">
            <label className="welcome-create-label">What are you building?</label>
            <input
              ref={inputRef}
              className="welcome-create-input"
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") handleCreate(); if (e.key === "Escape") setShowCreate(false); }}
              placeholder='e.g. "My Portfolio Website"'
            />
            <p className="welcome-create-hint">
              A folder will be created at ~/Documents/CC-Projects/
            </p>
            <div className="welcome-create-actions">
              <button className="welcome-create-cancel" onClick={() => setShowCreate(false)}>
                Cancel
              </button>
              <button
                className="welcome-create-submit"
                onClick={handleCreate}
                disabled={!projectName.trim()}
              >
                Create & Start
              </button>
            </div>
          </div>
        )}
      </div>

      {recentProjects.length > 0 && (
        <div className="recent-projects">
          <span className="recent-projects-label">Recent</span>
          {recentProjects.map((p) => (
            <button
              key={p.path}
              className="recent-project-item"
              onClick={() => onSelectRecentProject(p)}
            >
              <span className="recent-project-name">{p.name}</span>
              <span className="recent-project-path">{p.path}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
