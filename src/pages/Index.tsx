import { useState, useRef, useEffect } from "react";
import { Plus, Mic, HelpCircle, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import logo from "@/assets/logo.png";

interface Message {
  role: "user" | "bot";
  content: string;
}

const Index = () => {
  const [messages, setMessages] = useState<Message[]>([]);
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
    <div className="flex min-h-screen flex-col" style={{ background: "#212121", color: "#ececec" }}>
      {/* Header */}
      <header className="flex items-center justify-between border-b px-4 py-3" style={{ borderColor: "#424242" }}>
        <div className="flex items-center gap-2">
          <img src={logo} alt="Logo" className="h-6 w-6" />
          <span className="text-sm font-medium">ChatGPT</span>
          <ChevronDown className="h-4 w-4 text-gray-400" />
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" className="text-sm" style={{ color: "#ececec" }}>
            Log in
          </Button>
          <Button variant="outline" size="sm" className="text-sm" style={{ borderColor: "#565656", color: "#ececec" }}>
            Sign up for free
          </Button>
          <Button variant="ghost" size="icon">
            <HelpCircle className="h-5 w-5" />
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex flex-1 flex-col overflow-hidden">
        {messages.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center px-4">
            <h1 className="mb-8 text-2xl font-normal" style={{ color: "#ececec" }}>
              What are you working on?
            </h1>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto px-4 py-6">
            <div className="mx-auto max-w-3xl space-y-6">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className="whitespace-pre-wrap"
                  style={{
                    textAlign: msg.role === "user" ? "right" : "left",
                    color: msg.role === "user" ? "#10a37f" : "#ececec"
                  }}
                >
                  {msg.content}
                </div>
              ))}
              {isLoading && (
                <div className="text-left" style={{ color: "#ececec" }}>
                  …
                </div>
              )}
              <div ref={chatEndRef} />
            </div>
          </div>
        )}

        {/* Input Area */}
        <div className="px-4 pb-6">
          <form onSubmit={sendMessage} className="mx-auto max-w-3xl">
            <div className="flex items-center gap-3 rounded-full px-4 py-3" style={{ background: "#2f2f2f", border: "1px solid #565656" }}>
              <Plus className="h-5 w-5 shrink-0 text-gray-400" />
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask anything"
                disabled={isLoading}
                className="flex-1 border-0 bg-transparent p-0 text-base focus:outline-none"
                style={{ color: "#ececec" }}
              />
              <button
                type="button"
                className="shrink-0 rounded-full p-2 transition-colors"
                style={{ background: "transparent" }}
              >
                <Mic className="h-5 w-5 text-gray-400" />
              </button>
            </div>
          </form>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t px-4 py-4 text-center text-xs" style={{ borderColor: "#424242", color: "#b4b4b4" }}>
        By messaging ChatGPT, you agree to our{" "}
        <a href="#" className="underline">
          Terms
        </a>{" "}
        and have read our{" "}
        <a href="#" className="underline">
          Privacy Policy
        </a>
        .
      </footer>
    </div>
  );
};

export default Index;
