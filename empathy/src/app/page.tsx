"use client";
import { useState } from "react";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  reasoning_details?: unknown;
}

export default function Home() {
  const [inputValue, setInputValue] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);

  const handleAddMessage = async () => {
    if (inputValue.trim() === "") return;

    // Add user's message first
    const newMessages = [
      ...messages,
      { role: "user", content: inputValue },
    ];

    
    setMessages(newMessages);
    setInputValue("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages }),
      });

      const data = await res.json();

      if (data.message) {
        setMessages([...newMessages, data.message]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h1>Chat with GPT</h1>
      <input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        placeholder="Type your message..."
        style={{ padding: "0.5rem", width: "300px", marginRight: "0.5rem" }}
      />
      <button
        onClick={handleAddMessage}
        disabled={loading}
        style={{ padding: "0.5rem 1rem", cursor: "pointer" }}
      >
        {loading ? "Thinking..." : "Send"}
      </button>

      <div style={{ marginTop: "2rem" }}>
        {messages.map((msg, idx) => (
          <div
            key={idx}
            style={{
              padding: "0.5rem",
              border: "1px solid #ccc",
              marginTop: "0.5rem",
              borderRadius: "4px",
              width: "fit-content",
              backgroundColor: msg.role === "assistant" ? "#eef" : "#ffe",
            }}
          >
            <strong>{msg.role}:</strong> {msg.content}
          </div>
        ))}
      </div>
    </div>
  );
}
