import { useState, useRef, useEffect } from "react";
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
    onActivityChange("Claude is thinking...");

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
      onActivityChange("");
    }, 1500);
  };

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
