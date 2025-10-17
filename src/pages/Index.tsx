import { useState, useRef, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

interface Message {
  role: "user" | "bot";
  content: string;
}

const Index = () => {
  const [messages, setMessages] = useState<Message[]>([
    { role: "bot", content: "What are you working on?" }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const sessionIdRef = useRef(crypto.randomUUID());
  const { toast } = useToast();

  const API_URL = "https://witai.app.n8n.cloud/webhook/242b2e77-081b-4961-ba8e-4c21bb5d1bb5/chat";

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || isLoading) return;

    setMessages(prev => [...prev, { role: "user", content: text }]);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: sessionIdRef.current,
          action: "sendMessage",
          chatInput: text
        }),
      });

      const data = await res.json();
      const botMessage = data.text || data.output || data.ui || "…";
      setMessages(prev => [...prev, { role: "bot", content: botMessage }]);
    } catch (err) {
      console.error(err);
      toast({
        title: "Connection Error",
        description: "There was a problem connecting to the chat.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{
      margin: 0,
      background: "#141619",
      color: "#f1f1f1",
      fontFamily: "'Inter', sans-serif",
      height: "100vh",
      display: "flex",
      flexDirection: "column"
    }}>
      <div style={{
        flex: 1,
        maxWidth: "780px",
        margin: "auto",
        width: "100%",
        padding: "40px 24px 120px",
        overflowY: "auto"
      }}>
        {messages.map((msg, idx) => (
          <div
            key={idx}
            style={{
              margin: "12px 0",
              lineHeight: "1.5",
              whiteSpace: "pre-wrap",
              textAlign: msg.role === "user" ? "right" : "left",
              color: msg.role === "user" ? "#364ced" : "#f1f1f1"
            }}
          >
            {msg.content}
          </div>
        ))}
        {isLoading && (
          <div style={{
            margin: "12px 0",
            lineHeight: "1.5",
            textAlign: "left",
            color: "#f1f1f1"
          }}>
            …
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      <form
        onSubmit={sendMessage}
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          background: "#1e1f23",
          padding: "16px 24px",
          display: "flex",
          justifyContent: "center",
          boxShadow: "0 -2px 10px rgba(0,0,0,0.4)"
        }}
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask anything..."
          autoComplete="off"
          disabled={isLoading}
          required
          style={{
            width: "100%",
            maxWidth: "780px",
            padding: "14px 18px",
            borderRadius: "12px",
            border: "1px solid #333",
            background: "#0f1012",
            color: "#f1f1f1",
            fontSize: "16px",
            outline: "none"
          }}
          onFocus={(e) => e.target.style.outline = "1px solid #364ced"}
          onBlur={(e) => e.target.style.outline = "none"}
        />
      </form>
    </div>
  );
};

export default Index;
