import { useState, useRef, useEffect, useCallback } from "react";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import type { ChatMessage, ProcessState, Project } from "@/types";
import { ChatInput } from "./ChatInput";
import { MessageBubble } from "./MessageBubble";

interface ChatPanelProps {
  project: Project | null;
  processState: ProcessState;
  onProcessStateChange: (state: ProcessState) => void;
  onActivityChange: (text: string) => void;
}

export function ChatPanel({
  project,
  processState,
  onProcessStateChange,
  onActivityChange,
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
        prev.map((m) =>
          m.id === assistantId
            ? {
                ...m,
                content: event.payload.full_output || m.content || "(No response)",
                status: event.payload.success ? ("complete" as const) : ("error" as const),
              }
            : m
        )
      );
      onProcessStateChange("idle");
      onActivityChange("");
      currentAssistantIdRef.current = null;
    });

    const unlisten3 = listen<{ message: string }>("claude-error", () => {
      // stderr from claude — usually progress info, not fatal errors
    });

    return () => {
      unlisten1.then((fn) => fn());
      unlisten2.then((fn) => fn());
      unlisten3.then((fn) => fn());
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
        await invoke("run_claude_prompt", { prompt: content });
      } catch (err) {
        // invoke itself errored (e.g., claude not found)
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
          <WelcomeScreen hasProject={!!project} />
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

function WelcomeScreen({ hasProject }: { hasProject: boolean }) {
  return (
    <div className="welcome-screen">
      <div className="welcome-icon">CC</div>
      {!hasProject ? (
        <>
          <h2>Welcome to CC Desktop</h2>
          <p>Open a project folder to get started. Use the "Open Project" button above.</p>
        </>
      ) : (
        <>
          <h2>What do you want to build?</h2>
          <p>Type a message below, or try a command:</p>
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
