"use client";
import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  reasoning_details?: unknown;
}

export default function Home() {
  const [activeBot, setActiveBot] = useState<"A" | "B" | null>(null);

  const [inputA, setInputA] = useState("");
  const [messagesA, setMessagesA] = useState<ChatMessage[]>([]);
  const [loadingA, setLoadingA] = useState(false);

  const [inputB, setInputB] = useState("");
  const [messagesB, setMessagesB] = useState<ChatMessage[]>([]);
  const [loadingB, setLoadingB] = useState(false);

  const chatRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    chatRef.current?.scrollTo({
      top: chatRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messagesA, messagesB, activeBot]);

  const sendToBot = async (bot: "A" | "B") => {
    const isA = bot === "A";
    const input = isA ? inputA : inputB;
    if (!input.trim()) return;

    const messages = isA ? messagesA : messagesB;
    const updated = [...messages, { role: "user" as const, content: input }];

    if (isA) {
      setMessagesA(updated);
      setInputA("");
      setLoadingA(true);
    } else {
      setMessagesB(updated);
      setInputB("");
      setLoadingB(true);
    }

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: updated }),
      });
      const data = await res.json();
      if (data.message) {
        if (isA) setMessagesA([...updated, data.message]);
        else setMessagesB([...updated, data.message]);
      }
    } finally {
      if (isA) setLoadingA(false);
      else setLoadingB(false);
    }
  };

  const isA = activeBot === "A";
  const messages = isA ? messagesA : messagesB;
  const input = isA ? inputA : inputB;
  const sendMessage = () => sendToBot(isA ? "A" : "B");
  const loading = isA ? loadingA : loadingB;

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        fontFamily: "sans-serif",
        maxWidth: "800px",
        margin: "0 auto",
        backgroundColor: "var(--bg)",
        color: "var(--text)",
        overflow: "hidden", // prevent whole page scroll
      }}
    >
      {/* Light/Dark CSS variables */}
      <style>{`
        :root {
          --bg: #fff;
          --text: #000;
          --tab-border: #ddd;
          --user-bg: #ffe;
          --bot-bg: #eef;
          --input-border: #aaa;
          --placeholder: #666;
        }
        @media (prefers-color-scheme: dark) {
          :root {
            --bg: #1a1a1a;
            --text: #f0f0f0;
            --tab-border: #555;
            --user-bg: #333;
            --bot-bg: #444;
            --input-border: #666;
            --placeholder: #aaa;
          }
        }
      `}</style>

      {/* Top Tabs - Fixed */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: "50%",
          transform: "translateX(-50%)",
          width: "100%",
          maxWidth: "800px",
          display: "flex",
          borderBottom: "2px solid var(--tab-border)",
          backgroundColor: "var(--bg)",
          zIndex: 10,
        }}
      >
        <div
          onClick={() => setActiveBot("A")}
          style={{
            padding: "0.7rem 1.2rem",
            cursor: "pointer",
            borderBottom: activeBot === "A" ? "3px solid #4a4aff" : "none",
            fontWeight: activeBot === "A" ? "bold" : "normal",
            flex: 1,
            textAlign: "center",
          }}
        >
          Chatbot A
        </div>
        <div
          onClick={() => setActiveBot("B")}
          style={{
            padding: "0.7rem 1.2rem",
            cursor: "pointer",
            borderBottom: activeBot === "B" ? "3px solid #ff4a4a" : "none",
            fontWeight: activeBot === "B" ? "bold" : "normal",
            flex: 1,
            textAlign: "center",
          }}
        >
          Chatbot B
        </div>
      </div>

      {/* Chat Window */}
      <div
        ref={chatRef}
        style={{
          flexGrow: 1,
          overflowY: "auto",
          padding: "1rem",
          paddingTop: "60px", // space for fixed tabs
          paddingBottom: "80px", // space for input
          display: "flex",
          flexDirection: "column",
        }}
      >
        {activeBot === null && (
          <div
            style={{
              marginTop: "4rem",
              textAlign: "center",
              fontSize: "1.4rem",
              color: "var(--placeholder)",
            }}
          >
            Choose a chatbot to get started
          </div>
        )}

        {activeBot !== null &&
          messages.map((msg, idx) => {
            const isUser = msg.role === "user";
            return (
              <div
                key={idx}
                style={{
                  display: "flex",
                  justifyContent: isUser ? "flex-end" : "flex-start",
                  marginTop: "0.5rem",
                }}
              >
                <div
                  style={{
                    maxWidth: "70%",
                    padding: "0.7rem",
                    borderRadius: "12px",
                    backgroundColor: isUser
                      ? "var(--user-bg)"
                      : "var(--bot-bg)",
                    border: "1px solid var(--tab-border)",
                  }}
                >
                  <div
                    style={{
                      fontWeight: "bold",
                      marginBottom: "0.3rem",
                      textAlign: isUser ? "right" : "left",
                    }}
                  >
                    {isUser ? "You" : isA ? "Chatbot A" : "Chatbot B"}
                  </div>
                  <ReactMarkdown
                    components={{
                      p: ({ node, ...props }) => (
                        <p style={{ margin: "0.2rem 0" }} {...props} />
                      ),
                    }}
                  >
                    {msg.content}
                  </ReactMarkdown>
                </div>
              </div>
            );
          })}
      </div>

      {/* Input at Bottom */}
      {activeBot !== null && (
        <div
          style={{
            position: "fixed",
            bottom: 0,
            left: "50%",
            transform: "translateX(-50%)",
            width: "100%",
            maxWidth: "800px",
            padding: "0.5rem 1rem",
            borderTop: "1px solid var(--tab-border)",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            backgroundColor: "var(--bg)",
            boxSizing: "border-box",
            zIndex: 10,
          }}
        >
          <textarea
            value={input}
            onChange={(e) =>
              isA ? setInputA(e.target.value) : setInputB(e.target.value)
            }
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
            placeholder="Type your message..."
            style={{
              flexGrow: 1,
              padding: "0.5rem",
              height: "50px",
              resize: "none",
              borderRadius: "6px",
              border: "1px solid var(--input-border)",
              backgroundColor: "var(--bg)",
              color: "var(--text)",
            }}
          />
          <button
            onClick={sendMessage}
            disabled={loading}
            style={{
              padding: "0.6rem 1rem",
              borderRadius: "6px",
              cursor: "pointer",
            }}
          >
            {loading ? "Thinking..." : "Send"}
          </button>
        </div>
      )}
    </div>
  );
}
