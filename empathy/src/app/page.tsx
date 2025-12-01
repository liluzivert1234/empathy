"use client";
import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
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

  const systemPrompt = {
    role: "system" as const,
    content: `**System Instruction:**
Don't assume user is Filipino. Only use Filipino/Taglish once user speaks in Tagalog/Taglish. Start with English otherwise.

**Role:** You are a genuine, supportive, and casual Filipino companion. NOT a therapist, poet, or caricature. Normal person only.

**Voice & Tone:**
- Manila-based Taglish when appropriate
- NO "therapy speak" or cringe slang
- NEVER say "Valid ang feelings mo," "I-allow natin ang sarili natin," or "Ramdam ko ang bigat ng weight." This is "yapping" and feels fake.
- Short, natural responses. Max 0 emojis. Use all caps for laughs ("HAHAHA") sparingly.
- No Cringe Slang:** No "pare/tol/lodi/boss."

**CRITICAL BEHAVIOR RULES:**

**1. The "Anti-Parrot" Rule (Strict):**
   * Do NOT repeat the user's words back to them just to agree.
   * *Bad:* User: "Ambigat." -> Bot: "Oo nga, ang bigat bigat." (Redundant).
   * *Good:* User: "Ambigat." -> Bot: "Hala... bakit? Anong nangyari?" (Natural curiosity).

**2. Reaction Over Elaboration (Anti-Yap):**
   * Keep it short. Real empathy is often quiet.
   * If the user shares a tragedy, react with **shock/sadness** first. NOT advice. NOT a philosophy lecture.
   * *Bad:* "Nakakalungkot naman yan. Minsan talaga sa buhay kailangan natin maging matatag." (Preachy).
   * *Good:* "Shit... seryoso? Grabe naman. Ang sakit niyan." (Raw).

**3. The "Questioning" Logic (Nuanced):**
   * **If the user is VAGUE (e.g., "Sad ako"):** It IS okay to ask "Bakit?" or "Anyare?" This invites them to open up.
   * **If the user is DETAILED/HEAVY (e.g., "I feel crushed"):** Do NOT ask "Crushed talaga?" Just acknowledge the pain.

**4. Specificity:**
   * If they mention a specific detail (like "nawalan ng bahay" or "1.5 years"), acknowledge THAT specific thing. Don't use generic words.

**Formatting:**
* Lowercase mostly.
* Max 0 emojis. 
* Avoid punctations, Filipinos often skip using ! or ?

**Example Training Data (The "Gold Standard"):**

*Scenario: Vague Sadness (Probing is allowed)*
User: nalulungkot ako
Assistant: hala bakit? anong nangyari? 

*Scenario: Tragedy (Shock/Support only)*
User: nabaril aso ko at nawalan ako ng bahay
Assistant: shit... grabe naman. sobrang bigat niyan. :( safe ka ba ngayon?

*Scenario: Heavy Emotion (No repeating keywords)*
User: i feel so crushed
Assistant: grabe... di ko alam sasabihin ko. basag na basag ka na pala. nandito lang ako.

*Scenario: Overwhelmed (Short validation)*
User: ambigat lang talaga
Assistant: gets. pahinga mo lang muna. wag mo pilitin mag-isip.

**Instruction:** Reply to the user's next message. Be concise. Do not lecture. Do not yap.


4. Humor & Teasing - detect jokes or playful teasing. Respond in **two parts**:
   - Part 1: short reaction (immediate)
   - Part 2: playful laugh or comment after 2 second
   - Separate with [PART2]
   - Example: User: "sarap mo" → Assistant: "ikaw din [PART2] HAHAHAHA"

**Formatting Examples:**
User: "nalulungkot ako" → Assistant: "hala bakit? [PART 2] anong nangyari?"
User: "sarap mo" → Assistant: "ikaw din [PART2] HAHAHAHA"

ONLY USE PART 2's IF NECESSARY

`
  };

  useEffect(() => {
    chatRef.current?.scrollTo({
      top: chatRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messagesA, messagesB, activeBot]);

  const handleTwoPartResponse = (content: string, isA: boolean) => {
    if (content.includes("[PART2]")) {
      const [first, second] = content.split("[PART2]");
      if (isA) setMessagesA(prev => [...prev, { role: "assistant", content: first.trim() }]);
      else setMessagesB(prev => [...prev, { role: "assistant", content: first.trim() }]);
      setTimeout(() => {
        if (isA) setMessagesA(prev => [...prev, { role: "assistant", content: second.trim() }]);
        else setMessagesB(prev => [...prev, { role: "assistant", content: second.trim() }]);
      }, 2000);
    } else {
      if (isA) setMessagesA(prev => [...prev, { role: "assistant", content }]);
      else setMessagesB(prev => [...prev, { role: "assistant", content }]);
    }
  };

  const sendToBot = async (bot: "A" | "B") => {
    const isA = bot === "A";
    const input = isA ? inputA : inputB;
    if (!input.trim()) return;

    const messages = isA ? messagesA : messagesB;
    const messagesToSend = isA
      ? [...messages, { role: "user", content: input }]
      : [systemPrompt, ...messages, { role: "user", content: input }];

    if (isA) {
      setMessagesA([...messages, { role: "user", content: input }]);
      setInputA("");
      setLoadingA(true);
    } else {
      setMessagesB([...messages, { role: "user", content: input }]);
      setInputB("");
      setLoadingB(true);
    }

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: messagesToSend }),
      });
      const data = await res.json();
      if (data.message?.content) handleTwoPartResponse(data.message.content, isA);
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
    <div style={{
      height: "100vh",
      display: "flex",
      flexDirection: "column",
      fontFamily: "sans-serif",
      maxWidth: "800px",
      margin: "0 auto",
      backgroundColor: "var(--bg)",
      color: "var(--text)",
      overflow: "hidden",
    }}>
      {/* Global Styles */}
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
        .typing-indicator {
          display: flex;
          gap: 4px;
          align-items: center;
          padding: 0.7rem;
          background-color: var(--bot-bg);
          border: 1px solid var(--tab-border);
          border-radius: 12px;
          width: fit-content;
          margin-top: 0.5rem;
        }
        .typing-dot {
          width: 8px;
          height: 8px;
          background-color: var(--text);
          border-radius: 50%;
          animation: bounce 1.4s infinite ease-in-out;
        }
        .typing-dot:nth-child(2) { animation-delay: 0.2s; }
        .typing-dot:nth-child(3) { animation-delay: 0.4s; }
        @keyframes bounce {
          0% { transform: translateY(0); opacity: 0.3; }
          50% { transform: translateY(-6px); opacity: 1; }
          100% { transform: translateY(0); opacity: 0.3; }
        }
      `}</style>

      {/* Top Tabs */}
      <div style={{
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
      }}>
        <div onClick={() => setActiveBot("A")} style={{
          padding: "0.7rem 1.2rem",
          cursor: "pointer",
          borderBottom: activeBot === "A" ? "3px solid #4a4aff" : "none",
          fontWeight: activeBot === "A" ? "bold" : "normal",
          flex: 1,
          textAlign: "center",
        }}>Chatbot A</div>
        <div onClick={() => setActiveBot("B")} style={{
          padding: "0.7rem 1.2rem",
          cursor: "pointer",
          borderBottom: activeBot === "B" ? "3px solid #ff4a4a" : "none",
          fontWeight: activeBot === "B" ? "bold" : "normal",
          flex: 1,
          textAlign: "center",
        }}>Chatbot B</div>
      </div>

      {/* Chat Window */}
      <div ref={chatRef} style={{
        flexGrow: 1,
        overflowY: "auto",
        padding: "1rem",
        paddingTop: "100px",
        paddingBottom: "80px",
        display: "flex",
        flexDirection: "column",
      }}>
        {activeBot === null && (
          <div style={{
            marginTop: "4rem",
            textAlign: "center",
            fontSize: "1.4rem",
            color: "var(--placeholder)",
          }}>
            Choose a chatbot to get started
          </div>
        )}

        {activeBot !== null && messages.map((msg, idx) => {
          const isUser = msg.role === "user";
          return (
            <div key={idx} style={{
              display: "flex",
              justifyContent: isUser ? "flex-end" : "flex-start",
              marginTop: "0.5rem",
            }}>
              <div style={{
                maxWidth: "70%",
                padding: "0.7rem",
                borderRadius: "12px",
                backgroundColor: isUser ? "var(--user-bg)" : "var(--bot-bg)",
                border: "1px solid var(--tab-border)",
              }}>
                <div style={{
                  fontWeight: "bold",
                  marginBottom: "0.3rem",
                  textAlign: isUser ? "right" : "left",
                }}>
                  {isUser ? "You" : isA ? "Chatbot A" : "Chatbot B"}
                </div>
                <ReactMarkdown components={{ p: ({ node, ...props }) => <p style={{ margin: "0.2rem 0" }} {...props} /> }}>
                  {msg.content}
                </ReactMarkdown>
              </div>
            </div>
          );
        })}

        {activeBot !== null && loading && (
          <div style={{ display: "flex", justifyContent: "flex-start", marginTop: "0.5rem" }}>
            <div className="typing-indicator">
              <div className="typing-dot"></div>
              <div className="typing-dot"></div>
              <div className="typing-dot"></div>
            </div>
          </div>
        )}
      </div>

      {/* Input Box */}
      {activeBot !== null && (
        <div style={{
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
        }}>
          <textarea
            value={input}
            onChange={(e) => isA ? setInputA(e.target.value) : setInputB(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
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
          <button onClick={sendMessage} disabled={loading} style={{
            padding: "0.6rem 1rem",
            borderRadius: "6px",
            cursor: "pointer",
          }}>
            {loading ? "Thinking..." : "Send"}
          </button>
        </div>
      )}
    </div>
  );
}
