import type { ChatMessage } from "@/types";

interface MessageBubbleProps {
  message: ChatMessage;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === "user";
  const isStreaming = message.status === "streaming";

  return (
    <div className={`message ${isUser ? "message-user" : "message-assistant"}`}>
      {/* Agent badge */}
      {message.agent && (
        <span className="agent-badge">{message.agent}</span>
      )}

      {/* Message content */}
      <div className="message-content">
        {isStreaming && !message.content ? (
          <span className="typing-indicator">
            <span />
            <span />
            <span />
          </span>
        ) : (
          <div className="markdown-body">
            {/* TODO: Replace with react-markdown for proper rendering */}
            {message.content.split("\n").map((line, i) => (
              <p key={i}>{line || "\u00A0"}</p>
            ))}
          </div>
        )}
      </div>

      {/* Tool calls */}
      {message.toolCalls && message.toolCalls.length > 0 && (
        <div className="tool-calls">
          {message.toolCalls.map((tc) => (
            <div key={tc.id} className={`tool-call tool-call-${tc.status}`}>
              <span className="tool-type">{tc.tool}</span>
              <span className="tool-desc">{tc.description}</span>
              {tc.status === "pending" && (
                <span className="tool-pending">Waiting for approval...</span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Timestamp */}
      <span className="message-time">
        {new Date(message.timestamp).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })}
      </span>
    </div>
  );
}
