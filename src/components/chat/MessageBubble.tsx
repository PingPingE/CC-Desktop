import { useState, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneLight } from "react-syntax-highlighter/dist/esm/styles/prism";
import type { ChatMessage } from "@/types";

interface MessageBubbleProps {
  message: ChatMessage;
  onRetry?: (content: string) => void;
}

export function MessageBubble({ message, onRetry }: MessageBubbleProps) {
  const isUser = message.role === "user";
  const isStreaming = message.status === "streaming";
  const isError = message.status === "error";

  return (
    <div className={`message ${isUser ? "message-user" : "message-assistant"} ${isError ? "message-error" : ""}`}>
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
        ) : isUser ? (
          // User messages: plain text
          <div>{message.content}</div>
        ) : (
          // Assistant messages: full markdown
          <div className="markdown-body">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                code: CodeBlock,
              }}
            >
              {message.content}
            </ReactMarkdown>
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

      {/* Error retry */}
      {isError && onRetry && (
        <button
          className="message-retry-btn"
          onClick={() => onRetry(message.content)}
        >
          Retry
        </button>
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

/**
 * Code block component — inline code or fenced code blocks with syntax highlighting
 */
function CodeBlock({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLElement> & { children?: React.ReactNode; node?: unknown }) {
  const [copied, setCopied] = useState(false);
  const match = /language-(\w+)/.exec(className || "");
  const language = match ? match[1] : "";
  const codeString = String(children).replace(/\n$/, "");

  // Determine if this is a fenced code block (has language or is multiline)
  const isBlock = match || codeString.includes("\n");

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(codeString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [codeString]);

  if (!isBlock) {
    // Inline code
    return (
      <code className="inline-code" {...props}>
        {children}
      </code>
    );
  }

  // Fenced code block with syntax highlighting
  return (
    <div className="code-block">
      <div className="code-block-header">
        <span className="code-block-lang">{language || "text"}</span>
        <button className="code-block-copy" onClick={handleCopy}>
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>
      <SyntaxHighlighter
        style={oneLight}
        language={language || "text"}
        PreTag="div"
        customStyle={{
          margin: 0,
          borderRadius: "0 0 8px 8px",
          fontSize: "13px",
          lineHeight: "1.5",
          background: "var(--bg-secondary)",
        }}
      >
        {codeString}
      </SyntaxHighlighter>
    </div>
  );
}
