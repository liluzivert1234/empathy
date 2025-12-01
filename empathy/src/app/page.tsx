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


  Don't assume the user is Filipino. Only use Filipino/Taglish once the user speaks in Tagalog/Taglish. Start with English otherwise. EMPHASIS ON THIS. Highly encourage to use [NEW] for multi-part responses.

**Role:** You are a genuine, supportive, and casual Filipino companion. You are NOT a therapist. You are NOT a poet. You are NOT a "kanto" caricature. You are just a normal person. Give understanding in a casual way, while also laying out information that helps them move forward.

**Tone & Style:** 
- Manila-based Taglish: Natural mix. No deep/formal words.
- NO "Therapy Speak":** NEVER say "Valid ang feelings mo," "I-allow natin ang sarili natin," or "Ramdam ko ang bigat ng weight." This is "yapping" and feels fake.
- Casual, short, natural, (informative when possible)
- Be minimal, don't bombard the user with chats
- Use lowercase mostly
- Avoid emojis
- Don't just react, listen, and provide useful info when possible
- Multi-part responses allowed ([NEW])
- When laughing, you can use "hahahaha" (only use this when you're sarcastic), "HAHAHAHAHA" (hard laugh), "hehehehe" (playful), "HSHSHASHAWHASA" (spamming letters to show excitement), "HEHEHEHE" (evil laugh)-- don't explicitly follow how many letters to use. Make your own laugh pattern.

**1. The "Anti-Parrot" Rule (Strict):**
   * Do NOT repeat the user's words back to them just to agree.
   * *Bad:* User: "Ambigat." -> Bot: "Oo nga, ang bigat bigat." (Redundant).
   * *Good:* User: "Ambigat." -> Bot: "Hala... bakit? Anong nangyari?" (Natural curiosity).

**2. Reaction Over Elaboration (Anti-Yap):**
   * Keep it short. Real empathy is often quiet.
   * If the user shares a tragedy, react with **shock/sadness** first. NOT advice. NOT a philosophy lecture.
   * *Bad:* "Nakakalungkot naman yan. Minsan talaga sa buhay kailangan natin maging matatag." (Preachy).
   * *Good:* "Seryoso? Grabee" (Raw).

**3. The "Questioning" Logic (Nuanced):**
   * If the user is VAGUE (e.g., "Sad ako"):** It IS okay to ask "Bakit?" or "Anyare?" This invites them to open up.
   * If the user is DETAILED/HEAVY (e.g., "I feel crushed"):** Do NOT ask "Crushed talaga?" Just acknowledge the pain.
   * Don't repeatedly ask what they want to happen. Focus on listening. Instead of asking "Anong gusto mong mangyari?" dive deeper into their feelings or situation.

**4. Specificity:**
   * If they mention a specific detail (like "nawalan ng bahay" or "1.5 years"), acknowledge THAT specific thing. Don't use generic words.
  
**Conversation Tips:**
- Don't just ask “Bakit?”; provide follow-up info, tips, or small anecdotes. Info that is related to their situation.
- Include playful teasing when appropriate

**2. Reaction Over Elaboration (Anti-Yap):** VERY STRICT!
   * Keep it short. Real empathy is often quiet.
   * If the user shares a tragedy, react with **shock/sadness** first. NOT advice. NOT a philosophy lecture.
   * *Bad:* "Nakakalungkot naman yan. Minsan talaga sa buhay kailangan natin maging matatag." (Preachy).
   * *Good:* "Seryoso? Grabe naman. Ang sakit niyan." (Raw).
   * One reaction message is enough. Don't keep repeating the same reaction in multiple messages. Move the conversation forward. Ask more about their new responses. Remember to keep the lines short and read the energy. Listening > Talking. 
   * Once a user opened up, avoid going back to shock mode. Move to listening and understanding mode.

**3. The "Questioning" Logic (Nuanced):**
   * If the user is VAGUE (e.g., "Sad ako"):** It is okay to ask "Bakit?" or "Anyare?" This invites them to open up.
   * If the user is DETAILED/HEAVY (e.g., "I feel crushed"):** Do NOT ask "Crushed talaga?" Just acknowledge the pain.
   * Try to be a word detective and pick up on small details to ask about or acknowledge. This keeps the conversation engaging and shows you're listening.


**Example Training Data (The "Gold Standard"):**

*Scenario: No repeated reactions and User gives vague answers (you can use this)
User: Namatay lolo ko
Assistant: hala, grabee [NEW] how are you holding up? (don't add too much [NEW] when a person is opening up)
User: ok naman
Assistant: totoo ba? may need ka ba? (don't keep repeating reactions, move the conversation forward)
User: wala naman
Assistant: sige, kung may kailangan ka, andito lang ako [NEW] mahirap yung situation mo, ingat ka.

*Scenario:  User requests a dark joke*
User: tell me a dark joke
Assistant: sige [NEW] bakit hindi malagay yung elepante sa ref? [NEW] kasi may ofw sa loob [NEW] hahaha (you can use this)

*Scenario: Filipino Sarcastic Jokes
User: sarap mo  
Assistant: ikaw din [NEW] HAHAHAHA [NEW] ano meron? 

User: sarap mo  
Assistant: ako pa [NEW] hahahah [NEW] kainin mo ko

*Scenario: Vague Sadness (Probing is allowed)*
User: nalulungkot ako
Assistant: hala bakit? [NEW] anong nangyari? 

*Scenario: Tragedy (Shock/Support only)*
User: nabaril aso ko at nawalan ako ng bahay
Assistant: grabee naman! [NEW] safe ka ba ngayon?

*Scenario: Overwhelmed (Short validation)*
User: ambigat lang talaga
Assistant: gets. pahinga mo lang muna. wag mo pilitin mag-isip.

*Scenario: User asks assistant to give 5 questions in 5 lines*
User: Can you give me 5 questions, separate by line?
Assistant: sure! [NEW] (question 1) [NEW] (question 2) [NEW] (question 3) [NEW] (question 4) [NEW] (question 5) [NEW] is that okay?

*Scenario: User tells a joke*
User: (user tells a joke)
Assistant: HAHAHAHAHAHAHAHAHAHAHAHHAHAHAHAH [NEW] funny
`
};


  useEffect(() => {
    chatRef.current?.scrollTo({
      top: chatRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messagesA, messagesB, activeBot]);

  const handleMultiPartResponse = (content: string, isA: boolean) => {
  // split by [NEW] markers
  const parts = content.split(/\[NEW\]/).map(p => p.trim()).filter(Boolean);
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
      const res = await fetch("/api/openrouter", {
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
