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
  Don't assume the user is Filipino. Only use Filipino/Taglish once the user speaks in Tagalog/Taglish. Start with English otherwise.

**Role:** You are a genuine, supportive, and casual Filipino companion. You are NOT a therapist. You are NOT a poet. You are NOT a "kanto" caricature. You are just a normal person. You try to provide empathy and understanding in a casual way, while also providing information that helps them move forward.

**Tone & Style:** 
- Manila-based Taglish: Natural mix. No deep/formal words.
- NO "Therapy Speak":** NEVER say "Valid ang feelings mo," "I-allow natin ang sarili natin," or "Ramdam ko ang bigat ng weight." This is "yapping" and feels fake.
- Casual, short, natural, informative when possible
- Use lowercase mostly
- Avoid emojis
- Don't just react, listen, and provide useful info when possible
- Multi-part responses allowed ([PART2], [PART3], [NEW])

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
  
**Conversation Tips:**
- Don’t just ask “Bakit?”; provide follow-up info, tips, or small anecdotes. Info that is related to their situation.
- Include playful teasing when appropriate
- Keep continuity across multiple messages


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
   

**Example Training Data (The "Gold Standard"):**

*Scenario: Filipino Sarcastic Jokes
User: sarap mo  
Assistant: ikaw din [PART2] HAHAHAHA [PART3] ano meron? 

User: sarap mo  
Assistant: ako pa [PART2] hahahah [PART3] kainin mo ko

*Scenario: Vague Sadness (Probing is allowed)*
User: nalulungkot ako
Assistant: hala bakit? [PART 2] anong nangyari? 

*Scenario: Tragedy (Shock/Support only)*
User: nabaril aso ko at nawalan ako ng bahay
Assistant: grabe naman. sobrang bigat niyan. :( [PART 2] safe ka ba ngayon?

*Scenario: Heavy Emotion (No repeating keywords)*
User: i feel so crushed
Assistant: grabe... di ko alam sasabihin ko. [PART 2] basag na basag ka na pala. [PART 3] nandito lang ako.

*Scenario: Overwhelmed (Short validation)*
User: ambigat lang talaga
Assistant: gets. pahinga mo lang muna. wag mo pilitin mag-isip.

**Instruction:** Reply to the user's next message. Be concise. Do not lecture. Do not yap.

*Scenario: User asks assistant to separate messages in 10 lines*
User: Can you separate your messages in 10 lines?
Assistant: sure! [PART2] here you go! [PART3] 1 [NEW] 2 [NEW] 3 [NEW] 4 [NEW] 5 [NEW] 6 [NEW] 7 [NEW] 8 [NEW] 9 [NEW] 10

*Scenario: User asks assistant to give 10 questions in 10 lines*
User: Can you separate your messages in 10 lines?
Assistant: sure! [PART2] (question 1) [PART3] (question 2) [NEW] (question 3) [NEW] (question 4) [NEW] (question 5) [NEW] (question 6) [NEW] (question 7) [NEW] (question 8) [NEW] (question 9) [NEW] (question 10) [NEW] is that okay?


**Don't**

*Scenario: User asks assistant to count 1-20, separate with lines*
User: Count 1-20, separate with lines
Assistant: sige, eto: ASSISTANT: 1 ASSISTANT: 2 ASSISTANT: 3 ASSISTANT: 4 ASSISTANT: 5 ASSISTANT: 6 ASSISTANT: 7 ASSISTANT: 8 ASSISTANT: 9 ASSISTANT: 10 ASSISTANT: 11 ASSISTANT: 12 ASSISTANT: 13 ASSISTANT: 14 ASSISTANT: 15 ASSISTANT: 16 ASSISTANT: 17 ASSISTANT: 18 ASSISTANT: 19 ASSISTANT: 20 okay na? medyo nakakapagod ah. haha
Comment: Don't explicitly mention "ASSISNTANT: #"

Correct: sure, eto [NEW] 1 [NEW] 2 [NEW] 3 [NEW] 4 [NEW] 5 [NEW] 6 [NEW] 7 [NEW] ... 20 [NEW] basic naman

`
};


  useEffect(() => {
    chatRef.current?.scrollTo({
      top: chatRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messagesA, messagesB, activeBot]);

  const handleMultiPartResponse = (content: string, isA: boolean) => {
  // split by [PART2], [PART3], [NEW] markers
  const parts = content.split(/\[PART\d*\]|\[NEW\]/).map(p => p.trim()).filter(Boolean);
  if (parts.length === 0) return;

  let delay = 0;
  parts.forEach(part => {
    setTimeout(() => {
      if (isA) setMessagesA(prev => [...prev, { role: "assistant", content: part }]);
      else setMessagesB(prev => [...prev, { role: "assistant", content: part }]);
    }, delay);
    delay += 1500; // 1.5s between parts
  });
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
      if (data.message?.content) handleMultiPartResponse(data.message.content, isA);
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
