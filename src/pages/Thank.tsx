import { useEffect, useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import witAiLogo from "../assets/wit-ai-logo.png";

const Thank = () => {
  const isMobile = useIsMobile();
  const [status, setStatus] = useState<'initial' | 'loading' | 'success' | 'error'>('initial');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get('session_id');
    const messageId = params.get('message_id');
    const action = params.get('action');
    const lang = (params.get('lang') || 'en').toLowerCase();

    const localizedText: Record<string, any> = {
      en: {
        title: "Thank you!",
        message: "Your request has been confirmed. Our team is now preparing your quotation.",
        error: "Oops! We couldn't confirm your request. Please contact our support.",
        notify: "Team notified successfully."
      },
      it: {
        title: "Grazie!",
        message: "La tua richiesta è stata confermata. Il nostro team sta preparando il tuo preventivo.",
        error: "Ops! Non siamo riusciti a confermare la tua richiesta. Contatta il nostro supporto.",
        notify: "Team notificato correttamente."
      },
      fr: {
        title: "Merci!",
        message: "Votre demande a été confirmée. Notre équipe prépare votre devis.",
        error: "Oups ! Impossible de confirmer votre demande. Veuillez contacter notre support.",
        notify: "Équipe notifiée avec succès."
      },
      es: {
        title: "¡Gracias!",
        message: "Tu solicitud ha sido confirmada. Nuestro equipo está preparando tu cotización.",
        error: "¡Ups! No pudimos confirmar tu solicitud. Contacta a nuestro soporte.",
        notify: "Equipo notificado correctamente."
      },
      de: {
        title: "Danke!",
        message: "Ihre Anfrage wurde bestätigt. Unser Team bereitet nun Ihr Angebot vor.",
        error: "Hoppla! Wir konnten Ihre Anfrage nicht bestätigen. Bitte kontaktieren Sie unseren Support.",
        notify: "Team erfolgreich benachrichtigt."
      },
      ar: {
        title: "شكرًا لك!",
        message: "تم تأكيد طلبك. فريقنا الآن بصدد إعداد عرض الأسعار الخاص بك.",
        error: "عذرًا! لم نتمكن من تأكيد طلبك. يرجى الاتصال بالدعم.",
        notify: "تم إخطار الفريق بنجاح."
      },
      zh: {
        title: "谢谢！",
        message: "您的请求已确认。我们的团队正在准备您的报价。",
        error: "抱歉！无法确认您的请求。请联系我们的支持团队。",
        notify: "团队已成功收到通知。"
      },
      pt: {
        title: "Obrigado!",
        message: "O seu pedido foi confirmado. A nossa equipa está agora a preparar a sua cotação.",
        error: "Ops! Não conseguimos confirmar o seu pedido. Contacte o nosso suporte.",
        notify: "Equipa notificada com sucesso."
      }
    };

    const t = localizedText[lang] || localizedText.en;

    // Store localized text in state for rendering
    (window as any).__thankPageText = t;
    (window as any).__sessionId = sessionId;

    // Send notification to webhook
    if (action === 'proceed' && sessionId) {
      setStatus('loading');
      fetch('https://witai.app.n8n.cloud/webhook-test/59c0e31d-8160-439a-918d-12ad00a405d4', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': 'Bearer witai-client-confirm-2025'
        },
        body: JSON.stringify({
          session_id: sessionId,
          message_id: messageId,
          action,
          lang,
          origin: window.location.hostname,
          timestamp: new Date().toISOString()
        })
      })
        .then(() => {
          console.log('✅ Notification sent to WitAI webhook:', sessionId);
          setStatus('success');
        })
        .catch((err) => {
          console.error('❌ Failed to notify backend:', err);
          setStatus('error');
          setErrorMessage(t.error);
        });
    }
  }, []);

  const t = (window as any).__thankPageText || {
    title: "Thank you!",
    message: "Your request has been confirmed. Our team is now preparing your quotation.",
    notify: "Team notified successfully.",
    error: "Oops! We couldn't confirm your request. Please contact our support."
  };

  const sessionId = (window as any).__sessionId;

  return (
    <div style={{
      minHeight: "100vh",
      backgroundColor: "#f5f5f5",
      display: "flex",
      flexDirection: "column",
      alignItems: "center"
    }}>
      {/* Header with Logo */}
      <div style={{
        width: "100%",
        position: "relative",
        paddingTop: "23px",
        paddingBottom: "20px",
        textAlign: "center"
      }}>
        <img
          src={witAiLogo}
          alt="WIT AI Logo"
          style={{
            height: isMobile ? "48px" : "45px",
            filter: "brightness(0)",
            display: "inline-block"
          }}
        />
      </div>

      {/* Content Card */}
      <div style={{
        maxWidth: "600px",
        width: "100%",
        padding: isMobile ? "0 20px" : "0 40px",
        marginTop: isMobile ? "40px" : "60px"
      }}>
        <div style={{
          backgroundColor: "#ffffff",
          border: "1px solid #e0e0e0",
          borderRadius: "16px",
          padding: isMobile ? "24px" : "32px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
          textAlign: "center"
        }}>
          <h1 style={{
            fontSize: isMobile ? "25px" : "32px",
            fontWeight: 600,
            color: "#364CED",
            marginBottom: "16px",
            lineHeight: 1.2
          }}>
            {t.title}
          </h1>

          <p style={{
            fontSize: isMobile ? "13px" : "14px",
            color: "#1a1a1a",
            lineHeight: 1.6,
            marginBottom: "24px"
          }}>
            {t.message}
          </p>

          {sessionId && (
            <p style={{
              fontSize: "12px",
              color: "#666666",
              marginTop: "20px",
              fontFamily: "monospace"
            }}>
              Session ID: <code style={{ 
                backgroundColor: "#f5f5f5", 
                padding: "2px 6px", 
                borderRadius: "4px" 
              }}>{sessionId}</code>
            </p>
          )}

          {status === 'loading' && (
            <p style={{
              fontSize: "14px",
              color: "#666666",
              marginTop: "16px"
            }}>
              Sending notification...
            </p>
          )}

          {status === 'success' && (
            <p style={{
              fontSize: "16px",
              color: "#364CED",
              marginTop: "24px",
              fontWeight: 600
            }}>
              {t.notify}
            </p>
          )}

          {status === 'error' && (
            <p style={{
              fontSize: "16px",
              color: "#e63946",
              marginTop: "24px"
            }}>
              {errorMessage || t.error}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Thank;
