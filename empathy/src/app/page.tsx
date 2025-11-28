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

  // Chatbot A
  const [inputA, setInputA] = useState("");
  const [messagesA, setMessagesA] = useState<ChatMessage[]>([]);
  const [loadingA, setLoadingA] = useState(false);

  // Chatbot B
  const [inputB, setInputB] = useState("");
  const [messagesB, setMessagesB] = useState<ChatMessage[]>([]);
  const [loadingB, setLoadingB] = useState(false);

  const chatRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll
  useEffect(() => {
    chatRef.current?.scrollTo({
      top: chatRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messagesA, messagesB, activeBot]);

  // BOT A send
  const sendToBotA = async () => {
    if (inputA.trim() === "") return;
    const updated = [...messagesA, { role: "user" as const, content: inputA }];

    setMessagesA(updated);
    setInputA("");
    setLoadingA(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: updated }),
      });

      const data = await res.json();
      if (data.message) setMessagesA([...updated, data.message]);
    } finally {
      setLoadingA(false);
    }
  };

  // BOT B send
  const sendToBotB = async () => {
    if (inputB.trim() === "") return;
    const updated = [...messagesB, { role: "user" as const, content: inputB }];

    setMessagesB(updated);
    setInputB("");
    setLoadingB(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: updated }),
      });

      const data = await res.json();
      if (data.message) setMessagesB([...updated, data.message]);
    } finally {
      setLoadingB(false);
    }
  };

  const isA = activeBot === "A";
  const messages = isA ? messagesA : messagesB;
  const input = isA ? inputA : inputB;
  const sendMessage = isA ? sendToBotA : sendToBotB;
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
      }}
    >
      {/* Top Tabs */}
      <div
        style={{
          display: "flex",
          borderBottom: "2px solid #ddd",
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
              color: "#666",
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
                    backgroundColor: isUser ? "#ffe" : "#eef",
                    border: "1px solid #ccc",
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
            padding: "1rem",
            borderTop: "1px solid #ddd",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
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
              padding: "0.7rem",
              height: "60px",
              resize: "none",
              borderRadius: "6px",
              border: "1px solid #aaa",
            }}
          />

          <button
            onClick={sendMessage}
            disabled={loading}
            style={{
              padding: "0.8rem 1rem",
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
