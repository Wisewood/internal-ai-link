import { useEffect } from "react";

const Index = () => {
  useEffect(() => {
    // Load n8n chat CSS
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://cdn.jsdelivr.net/npm/@n8n/chat/style.css";
    document.head.appendChild(link);

    // Load n8n chat script
    const script = document.createElement("script");
    script.type = "module";
    script.src = "https://cdn.jsdelivr.net/npm/@n8n/chat/chat.bundle.es.js";
    
    script.onload = () => {
      // Initialize chat after script loads
      if ((window as any).createChat) {
        (window as any).createChat({
          webhookUrl: "https://witai.app.n8n.cloud/webhook/73651d1c-bb2e-4c08-846b-7695629a4d29/chat",
          mode: "fullscreen",
          chatInputKey: "chatInput",
          chatSessionKey: "sessionId",
          loadPreviousSession: true,
          showWelcomeScreen: false,
        });
      }
    };

    document.body.appendChild(script);

    return () => {
      // Cleanup on unmount
      document.body.removeChild(script);
      document.head.removeChild(link);
    };
  }, []);

  return <div id="n8n-chat" className="h-screen w-full" />;
};

export default Index;
