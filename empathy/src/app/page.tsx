"use client";
import { useState } from "react";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  reasoning_details?: unknown;
}

export default function Home() {
  const [activeBot, setActiveBot] = useState<"A" | "B" | null>(null);

  // Chatbot A state
  const [inputA, setInputA] = useState("");
  const [messagesA, setMessagesA] = useState<ChatMessage[]>([]);
  const [loadingA, setLoadingA] = useState(false);

  // Chatbot B state
  const [inputB, setInputB] = useState("");
  const [messagesB, setMessagesB] = useState<ChatMessage[]>([]);
  const [loadingB, setLoadingB] = useState(false);

  // Chatbot A handler
  const sendToBotA = async () => {
    if (inputA.trim() === "") return;

    const updatedMessages = [...messagesA, { role: "user", content: inputA }];
    setMessagesA(updatedMessages);
    setInputA("");
    setLoadingA(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: updatedMessages }),
      });

      const data = await res.json();
      if (data.message) {
        setMessagesA([...updatedMessages, data.message]);
      }
    } finally {
      setLoadingA(false);
    }
  };

  // Chatbot B handler
  const sendToBotB = async () => {
    if (inputB.trim() === "") return;

    const updatedMessages = [...messagesB, { role: "user", content: inputB }];
    setMessagesB(updatedMessages);
    setInputB("");
    setLoadingB(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: updatedMessages }),
      });

      const data = await res.json();
      if (data.message) {
        setMessagesB([...updatedMessages, data.message]);
      }
    } finally {
      setLoadingB(false);
    }
  };

  // ---------- HOMEPAGE VIEW ----------
  if (activeBot === null) {
    return (
      <div
        style={{
          padding: "2rem",
          textAlign: "center",
          fontFamily: "sans-serif",
        }}
      >
        <h1 style={{ marginBottom: "2rem", fontSize: "2rem" }}>
          Choose a chatbot to get started
        </h1>

        <div
          style={{
            display: "flex",
            gap: "2rem",
            justifyContent: "center",
            flexWrap: "wrap",
          }}
        >
          {/* Chatbot A Window */}
          <div
            onClick={() => setActiveBot("A")}
            style={{
              width: "350px",
              height: "250px",
              border: "2px solid #444",
              borderRadius: "12px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "1.4rem",
              fontWeight: "bold",
              background: "#f0f0ff",
              transition: "0.2s",
            }}
          >
            Chatbot A
          </div>

          {/* Chatbot B Window */}
          <div
            onClick={() => setActiveBot("B")}
            style={{
              width: "350px",
              height: "250px",
              border: "2px solid #444",
              borderRadius: "12px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "1.4rem",
              fontWeight: "bold",
              background: "#fff0f0",
              transition: "0.2s",
            }}
          >
            Chatbot B
          </div>
        </div>
      </div>
    );
  }

  // ---------- CHATBOT VIEW ----------
  const isA = activeBot === "A";

  const input = isA ? inputA : inputB;
  const messages = isA ? messagesA : messagesB;
  const loading = isA ? loadingA : loadingB;
  const sendMessage = isA ? sendToBotA : sendToBotB;

  return (
    <div
      style={{
        padding: "1.5rem",
        fontFamily: "sans-serif",
        maxWidth: "700px",
        margin: "0 auto",
      }}
    >
      <button
        onClick={() => setActiveBot(null)}
        style={{
          marginBottom: "1rem",
          padding: "0.5rem 1rem",
          borderRadius: "6px",
          border: "1px solid #333",
          cursor: "pointer",
        }}
      >
        ← Back
      </button>

      <h2>{isA ? "Chatbot A" : "Chatbot B"}</h2>

      <input
        value={input}
        onChange={(e) =>
          isA ? setInputA(e.target.value) : setInputB(e.target.value)
        }
        placeholder="Type your message..."
        style={{
          padding: "0.7rem",
          width: "100%",
          maxWidth: "500px",
          marginRight: "0.5rem",
        }}
      />

      <button
        onClick={sendMessage}
        disabled={loading}
        style={{
          padding: "0.7rem 1rem",
          marginLeft: "0.5rem",
          cursor: "pointer",
        }}
      >
        {loading ? "Thinking..." : "Send"}
      </button>

      <div style={{ marginTop: "1rem" }}>
        {messages.map((msg, idx) => (
          <div
            key={idx}
            style={{
              padding: "0.7rem",
              border: "1px solid #ccc",
              marginTop: "0.5rem",
              borderRadius: "6px",
              backgroundColor: msg.role === "assistant" ? "#eef" : "#ffe",
              maxWidth: "100%",
              wordBreak: "break-word",
            }}
          >
            <strong>{msg.role}: </strong> {msg.content}
          </div>
        ))}
      </div>

      {/* MOBILE: Add spacing at bottom */}
      <div style={{ height: "50px" }}></div>
    </div>
  );
}
