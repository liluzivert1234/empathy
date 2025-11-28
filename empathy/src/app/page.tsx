"use client";
import { useState } from "react";

export default function Home() {
  const [inputValue, setInputValue] = useState("");
  const [messages, setMessages] = useState<string[]>([]);

  const handleAddMessage = () => {
  if (inputValue.trim() === "") return;
  setMessages([...messages, inputValue]);
  setInputValue("");
};


  return (
    <div style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h1>Enter Prompt</h1>
      <input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        placeholder="Type something..."
        style={{ padding: "0.5rem", width: "300px", marginRight: "0.5rem" }}
        />
      <button
        onClick={handleAddMessage}
        style={{ padding: "0.5rem 1rem", cursor: "pointer" }}
      >
        Add Text
      </button>

      <div style={{ marginTop: "2rem" }}>
        {messages.map((msg, index) => (
          <div
            key={index}
            style={{
              padding: "0.5rem",
              border: "1px solid #ccc",
              marginTop: "0.5rem",
              borderRadius: "4px",
              width: "fit-content",
            }}
          >
            {msg}
          </div>
        ))}
      </div>

    </div>
  )
}