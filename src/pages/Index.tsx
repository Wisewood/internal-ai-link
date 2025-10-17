import { useEffect } from "react";

declare global {
  interface Window {
    createChat?: (config: {
      webhookUrl: string;
      mode?: 'window' | 'fullscreen';
      chatInputKey?: string;
      chatSessionKey?: string;
      loadPreviousSession?: boolean;
      showWelcomeScreen?: boolean;
    }) => void;
  }
}

const Index = () => {
  useEffect(() => {
    // Wait for n8n chat script to load
    const initializeChat = () => {
      if (window.createChat) {
        window.createChat({
          webhookUrl: "https://witai.app.n8n.cloud/webhook/73651d1c-bb2e-4c08-846b-7695629a4d29/chat",
          mode: "fullscreen",
          chatInputKey: "chatInput",
          chatSessionKey: "sessionId",
          loadPreviousSession: true,
          showWelcomeScreen: false,
        });
      } else {
        // Retry after a short delay if script isn't loaded yet
        setTimeout(initializeChat, 100);
      }
    };

    initializeChat();
  }, []);

  return <div id="n8n-chat" className="h-screen w-full" />;
};

export default Index;
