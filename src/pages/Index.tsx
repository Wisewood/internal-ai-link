import { useEffect } from "react";

const Index = () => {
  useEffect(() => {
    // Load the n8n chat script
    const script = document.createElement('script');
    script.type = 'module';
    script.innerHTML = `
      import { createChat } from "https://cdn.jsdelivr.net/npm/@n8n/chat/dist/chat.bundle.es.js";
      
      createChat({
        webhookUrl: "https://witai.app.n8n.cloud/webhook/242b2e77-081b-4961-ba8e-4c21bb5d1bb5/chat",
        mode: "embedded",
        target: "#witai-chat",
        showWelcomeScreen: true,
        metadata: { source: "lovable" },
      });
    `;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return (
    <>
      <style>{`
        #witai-chat {
          max-width: 400px;
          height: 600px;
          margin: 40px auto;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
        }

        .n8n-chat {
          background-color: #f8f9fa;
          font-family: "Inter", sans-serif;
        }

        .n8n-chat-header {
          background-color: #141619;
          color: white;
          font-weight: 600;
          padding: 12px 16px;
        }

        .n8n-chat-bubble-user {
          background-color: #364ced;
          color: white;
          border-radius: 12px 12px 0 12px;
        }

        .n8n-chat-bubble-bot {
          background-color: #e9ecef;
          color: #141619;
          border-radius: 12px 12px 12px 0;
        }

        .n8n-chat-input {
          border-top: 1px solid #ddd;
          padding: 10px;
        }
      `}</style>
      <div id="witai-chat"></div>
    </>
  );
};

export default Index;
