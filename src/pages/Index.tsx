import { useEffect } from "react";
import "@n8n/chat/style.css";
import { createChat } from "@n8n/chat";

const Index = () => {
  useEffect(() => {
    createChat({
      webhookUrl: "https://witai.app.n8n.cloud/webhook/73651d1c-bb2e-4c08-846b-7695629a4d29/chat",
      mode: "fullscreen",
      chatInputKey: "chatInput",
      chatSessionKey: "sessionId",
      loadPreviousSession: true,
      showWelcomeScreen: false,
    });
  }, []);

  return <div />;
};

export default Index;
