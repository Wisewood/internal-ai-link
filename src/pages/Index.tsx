import { useState, useRef, useEffect } from "react";
import { Paperclip, Menu, X, FileText, FileSpreadsheet, File, Send, Shirt, Armchair, Flag, HardHat } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { supabase } from "@/integrations/supabase/client";
import { useIsMobile } from "@/hooks/use-mobile";
import logo from "@/assets/logo.png";
import witIcon from "@/assets/wit-embossed.png";
import witLogo from "@/assets/wit-corporate-logo-white.png";
import witAiLogo from "@/assets/wit-ai-logo.png";
import sendButton from "@/assets/send-button.png";
import { DemoProductCard, type DemoProduct } from "@/components/DemoProductCard";
interface Message {
  role: "user" | "bot";
  content: string;
  attachments?: string[];
  products?: DemoProduct[];
}
interface FilePreview {
  file: File;
  preview: string;
  type: "image" | "pdf" | "doc" | "excel" | "other";
}
const Index = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<FilePreview[]>([]);
  const [typingMessage, setTypingMessage] = useState<string>("");
  const [isTyping, setIsTyping] = useState(false);
  const [isLogoFlipped, setIsLogoFlipped] = useState(false);
  const [isLandscape, setIsLandscape] = useState(false);
  const [isTextareaMaxHeight, setIsTextareaMaxHeight] = useState(false);
  const [isTextareaScrolled, setIsTextareaScrolled] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const sessionIdRef = useRef(crypto.randomUUID());
  const {
    toast
  } = useToast();
  const isMobile = useIsMobile();
  const menuLinks = [
    { name: "Clients", url: "https://wisewoodint.com/en/projects" },
    { name: "Services", url: "https://wisewoodint.com/en/services" },
    { name: "About", url: "https://wisewoodint.com/en/about" },
    { name: "witAI", url: "https://wisewoodint.com/en/witai" },
    { name: "Team", url: "https://wisewoodint.com/en/team" },
    { name: "Journal", url: "https://wisewoodint.com/en/journal" },
    { name: "FAQ", url: "https://wisewoodint.com/en/faq" },
    { name: "Contact", url: "https://wisewoodint.com/en/contact" },
  ];
  // WitAI public demo chat — points at dealflow-wisely's `ai-chat-demo` edge function.
  // Anon key is public by design; CORS is open; backend rate-limits by IP.
  const WITAI_SUPABASE_URL = "https://kgrlqsdltjjdykceovrt.supabase.co";
  const WITAI_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtncmxxc2RsdGpqZHlrY2VvdnJ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc2OTI4MDMsImV4cCI6MjA4MzI2ODgwM30.zfKlCAgsIzsoe962-VeUDuFVYvSTbRZpz0ttR19gegA";
  const API_URL = `${WITAI_SUPABASE_URL}/functions/v1/ai-chat-demo`;
  // Internal route — a form goes through manual team review, no auto-signup.
  const SIGNUP_URL = "/request-account";
  const SIGNUP_PITCH_MD = `\n\n---\n\n**Want the full picture?** [Request a free WitAI account](${SIGNUP_URL}) — our team will set you up with pricing, quotes, and supplier access within a business day.`;
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({
      behavior: "smooth"
    });
  }, [messages, typingMessage]);

  useEffect(() => {
    if (textareaRef.current && input) {
      textareaRef.current.style.height = 'auto';
      const newHeight = Math.min(textareaRef.current.scrollHeight, 200);
      textareaRef.current.style.height = newHeight + 'px';
      setIsTextareaMaxHeight(textareaRef.current.scrollHeight > 200);
    } else if (textareaRef.current && !input) {
      textareaRef.current.style.height = '24px';
      setIsTextareaMaxHeight(false);
    }
  }, [input]);
  useEffect(() => {
    const checkOrientation = () => {
      setIsLandscape(window.innerWidth > window.innerHeight && isMobile);
    };
    checkOrientation();
    window.addEventListener('resize', checkOrientation);
    window.addEventListener('orientationchange', checkOrientation);
    return () => {
      window.removeEventListener('resize', checkOrientation);
      window.removeEventListener('orientationchange', checkOrientation);
    };
  }, [isMobile]);
  const typeMessage = (fullMessage: string, products?: DemoProduct[]) => {
    setIsTyping(true);
    setTypingMessage("");
    let currentIndex = 0;
    const interval = setInterval(() => {
      if (currentIndex < fullMessage.length) {
        setTypingMessage(fullMessage.slice(0, currentIndex + 1));
        currentIndex++;
      } else {
        clearInterval(interval);
        setIsTyping(false);
        setMessages(prev => [...prev, {
          role: "bot",
          content: fullMessage,
          products: products && products.length > 0 ? products : undefined,
        }]);
        setTypingMessage("");
      }
    }, 5); // 200 characters per second = 1000ms / 200 = 5ms per character
  };
  const getFileType = (file: File): "image" | "pdf" | "doc" | "excel" | "other" => {
    if (file.type.startsWith("image/")) return "image";
    if (file.type === "application/pdf") return "pdf";
    if (file.type.includes("word")) return "doc";
    if (file.type.includes("sheet") || file.type.includes("excel")) return "excel";
    return "other";
  };
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const newPreviews: FilePreview[] = [];
    files.forEach(file => {
      const fileType = getFileType(file);
      if (fileType === "image") {
        const reader = new FileReader();
        reader.onloadend = () => {
          newPreviews.push({
            file,
            preview: reader.result as string,
            type: fileType
          });
          if (newPreviews.length === files.length) {
            setSelectedFiles(prev => [...prev, ...newPreviews]);
          }
        };
        reader.readAsDataURL(file);
      } else {
        newPreviews.push({
          file,
          preview: file.name,
          type: fileType
        });
        if (newPreviews.length === files.length) {
          setSelectedFiles(prev => [...prev, ...newPreviews]);
        }
      }
    });
  };
  const uploadFile = async (file: File): Promise<string | null> => {
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${crypto.randomUUID()}.${fileExt}`;
      const filePath = `${fileName}`;
      const {
        error: uploadError
      } = await supabase.storage.from("chat-attachments").upload(filePath, file);
      if (uploadError) throw uploadError;
      const {
        data: {
          publicUrl
        }
      } = supabase.storage.from("chat-attachments").getPublicUrl(filePath);
      return publicUrl;
    } catch (error) {
      console.error("Error uploading file:", error);
      toast({
        title: "Upload Error",
        description: "Failed to upload file",
        variant: "destructive"
      });
      return null;
    }
  };
  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    if (fileInputRef.current && selectedFiles.length === 1) {
      fileInputRef.current.value = "";
    }
  };
  const sendMessage = async (e?: React.FormEvent, customMessage?: string) => {
    if (e) e.preventDefault();
    const text = customMessage || input.trim();
    if (!text && selectedFiles.length === 0 || isLoading) return;

    // Capture values and clear UI immediately
    const messagesToSend = text;
    const filesToUpload = [...selectedFiles];
    setInput("");
    setSelectedFiles([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    const attachmentUrls: string[] = [];

    // Upload all files if selected
    if (filesToUpload.length > 0) {
      for (const filePreview of filesToUpload) {
        const url = await uploadFile(filePreview.file);
        if (url) {
          attachmentUrls.push(url);
        }
      }
      if (attachmentUrls.length === 0) {
        // Restore input if uploads failed
        setInput(messagesToSend);
        setSelectedFiles(filesToUpload);
        return;
      }
    }

    // Add user message with attachments
    setMessages(prev => [...prev, {
      role: "user",
      content: messagesToSend || "📎 Attachments",
      attachments: attachmentUrls.length > 0 ? attachmentUrls : undefined
    }]);
    setIsLoading(true);
    try {
      // Compose message with attachments inline (ai-chat-demo accepts a single message string).
      let chatInput = messagesToSend;
      if (attachmentUrls.length > 0) {
        const attachmentList = attachmentUrls.map(u => `- ${u}`).join("\n");
        chatInput = messagesToSend
          ? `${messagesToSend}\n\nAttachments:\n${attachmentList}`
          : `Attachments:\n${attachmentList}`;
      }

      // Build conversation history for context (last 10 turns).
      const conversationHistory = messages.slice(-10).map(m => ({
        role: m.role === "bot" ? "assistant" : "user",
        content: m.content,
      }));

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);

      const res = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${WITAI_ANON_KEY}`,
          "apikey": WITAI_ANON_KEY,
        },
        body: JSON.stringify({
          message: chatInput,
          mode: "explore",
          conversationHistory,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const data = await res.json();

      // Rate limit — push account creation as the way forward.
      if (data?.error === "rate_limited") {
        setIsLoading(false);
        typeMessage(
          (data.ui_message || "You've reached the free demo limit.") +
            `\n\n**[Request a free WitAI account](${SIGNUP_URL})** and our team will set you up with full pricing, quotes, and supplier access within a business day.`
        );
        return;
      }

      if (!res.ok || data?.error) {
        throw new Error(data?.error || `API error: ${res.status}`);
      }

      let botMessage: string = data.ui_message || "…";
      const products: DemoProduct[] | undefined = Array.isArray(data.products) && data.products.length > 0
        ? data.products.map((p: DemoProduct) => ({
            ref: p.ref,
            name: p.name,
            image: p.image,
            category: p.category,
            quantity: p.quantity,
          }))
        : undefined;

      if (products) {
        if (data.savings_message) {
          botMessage += `\n\n_${data.savings_message}_`;
        }
        botMessage += SIGNUP_PITCH_MD;
      } else if (data.lead_capture_prompt) {
        botMessage += SIGNUP_PITCH_MD;
      }

      setIsLoading(false);
      typeMessage(botMessage, products);
    } catch (err) {
      console.error("Chat error:", err);
      const errorMessage = err instanceof Error && err.name === 'AbortError' 
        ? "Request timed out. Please try again."
        : "There was a problem connecting to the chat.";
      
      toast({
        title: "Connection Error",
        description: errorMessage,
        variant: "destructive"
      });
      setIsLoading(false);
    }
  };
  const suggestionPills = ["What can you do?", "Help me with a quotation", "How many product categories do you work with?", "Suggest me gadgets for my event"];
  const mobileSuggestionPills = ["What can you do?", "Help me with a quotation", "What products can I ask?"];
  const popularRequests = [{
    name: "Retail Apparel",
    icon: Shirt
  }, {
    name: "Furniture",
    icon: Armchair
  }, {
    name: "Flags",
    icon: Flag
  }, {
    name: "Construction",
    icon: HardHat
  }];
  return <div className="flex min-h-screen flex-col" style={{
    background: "#0a0a0a",
    color: "#ffffff"
  }}>
      {/* Header */}
      <header className="flex items-center relative" style={{
      background: messages.length > 0 ? "linear-gradient(to bottom, rgba(10,10,10,0.95) 0%, rgba(10,10,10,0.85) 50%, transparent 100%)" : "transparent",
      backdropFilter: messages.length > 0 ? "blur(12px)" : "none",
      paddingTop: "23px",
      paddingBottom: "20px",
      paddingLeft: isMobile ? "16px" : "32px",
      paddingRight: isMobile ? "16px" : "32px",
      position: messages.length > 0 ? "sticky" : "relative",
      top: messages.length > 0 ? 0 : "auto",
      zIndex: messages.length > 0 ? 50 : "auto"
    }}>
        <div className="h-8 cursor-pointer relative" style={{
        position: "absolute",
        left: isMobile && messages.length === 0 ? "16px" : messages.length === 0 ? "80px" : "50%",
        top: "50%",
        transform: isMobile && messages.length === 0 ? "translateY(-50%)" : messages.length === 0 ? "translateY(-50%)" : "translate(-50%, -50%)",
        transition: "all 0.5s ease-in-out"
      }} onClick={() => {
        setMessages([]);
        setInput("");
        setSelectedFiles([]);
        setTypingMessage("");
        setIsTyping(false);
      }}>
          <img src={witLogo} alt="WIT" className="absolute top-0 left-0" style={{
          maxHeight: messages.length === 0 ? "var(--logo-height)" : "var(--logo-height-active)",
          width: "auto",
          opacity: messages.length === 0 ? 1 : 0,
          transition: "opacity 0.5s ease-in-out, max-height 0.3s ease-in-out"
        }} />
          <img src={witAiLogo} alt="WIT AI" className="" style={{
          maxHeight: messages.length === 0 ? "var(--logo-height)" : "var(--logo-height-active)",
          width: "auto",
          filter: "brightness(0) invert(1)",
          opacity: messages.length === 0 ? 0 : 1,
          transition: "opacity 0.5s ease-in-out, max-height 0.3s ease-in-out"
        }} />
        </div>
        {messages.length === 0 && !isMobile && <nav className="flex items-center gap-8 absolute left-1/2 transform -translate-x-1/2">
            {menuLinks.map((link) => (
              <a
                key={link.name}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-medium uppercase tracking-[0.12em] opacity-70 hover:opacity-100 transition-opacity"
                style={{ color: "#ffffff" }}
              >
                {link.name}
              </a>
            ))}
          </nav>}
        {!isMobile && <div className="absolute right-8 top-1/2 -translate-y-1/2 flex items-center gap-3">
          <a
            href="https://wisewoodint.com/it/witai"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full border px-3 py-1.5 text-[0.65rem] font-medium uppercase tracking-wider transition-all"
            style={{ borderColor: "rgba(255,255,255,0.2)", color: "rgba(255,255,255,0.7)" }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.4)"; e.currentTarget.style.color = "#ffffff"; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)"; e.currentTarget.style.color = "rgba(255,255,255,0.7)"; }}
          >
            Italiano
          </a>
          <a
            href={SIGNUP_URL}
            className="text-sm font-semibold rounded-full px-4 py-2 transition-colors"
            style={{ background: "#ffffff", color: "#0a0a0a" }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.9)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "#ffffff"; }}
          >
            Request account
          </a>
        </div>}
        {messages.length === 0 && isMobile && <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
            <SheetTrigger asChild>
              <button className="absolute right-4 top-1/2 -translate-y-1/2 p-2">
                <Menu style={{
              color: "#ffffff",
              width: "var(--icon-md)",
              height: "var(--icon-md)"
            }} />
              </button>
            </SheetTrigger>
            <SheetContent side="right" className="w-64 border-white/10" style={{ background: "#0a0a0a" }}>
              <nav className="flex flex-col gap-4 mt-8">
                <a
                  href={SIGNUP_URL}
                  className="text-base font-semibold rounded-full px-4 py-2 text-center"
                  style={{ background: "#ffffff", color: "#0a0a0a" }}
                >
                  Request account
                </a>
                {menuLinks.map((link) => (
                  <a
                    key={link.name}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-medium uppercase tracking-[0.12em] hover:opacity-100 opacity-70"
                    style={{ color: "#ffffff" }}
                  >
                    {link.name}
                  </a>
                ))}
                <a
                  href="https://wisewoodint.com/it/witai"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 self-start rounded-full border px-3 py-1.5 text-[0.65rem] font-medium uppercase tracking-wider"
                  style={{ borderColor: "rgba(255,255,255,0.2)", color: "rgba(255,255,255,0.7)" }}
                >
                  Italiano
                </a>
              </nav>
            </SheetContent>
          </Sheet>}
      </header>

      {/* Main Content */}
      <main className="flex flex-1 flex-col" style={{
      paddingBottom: isMobile && messages.length === 0 ? "clamp(140px, 25vh, 180px)" : "0",
      overflow: messages.length > 0 ? "auto" : "hidden"
    }}>
        {messages.length === 0 ? <div className="flex flex-1 flex-col items-center justify-center px-4" style={{
        marginTop: isLandscape ? "-80px" : isMobile ? "-100px" : "-260px",
        marginBottom: isLandscape ? "-50px" : isMobile ? "-120px" : "-180px"
      }}>
            <div className="relative mb-0">
              <div className="absolute inset-0 rounded-full" style={{
            background: "radial-gradient(circle, rgba(6,182,212,0.45) 0%, rgba(139,92,246,0.25) 35%, rgba(139,92,246,0.1) 55%, transparent 80%)",
            animation: "expand-gradient 6s ease-out infinite",
            filter: "blur(60px)",
            transform: "scale(1)"
          }} />
              <img src={witIcon} alt="WitAI" className="relative w-auto cursor-pointer" style={{
            height: isLandscape ? "clamp(50px, 8vw, 60px)" : "clamp(70px, 12vw, 136px)",
            transition: "transform 0.6s ease-in-out",
            transformStyle: "preserve-3d",
            transform: isLogoFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
            filter: "brightness(0) invert(1)",
            zIndex: 1
          }} onClick={() => isMobile && setIsLogoFlipped(!isLogoFlipped)} onMouseEnter={() => !isMobile && setIsLogoFlipped(true)} onMouseLeave={() => !isMobile && setIsLogoFlipped(false)} />
            </div>
            <style>{`
              @keyframes expand-gradient {
                0% { 
                  opacity: 0.5;
                  transform: scale(1);
                }
                50% { 
                  opacity: 0.3;
                  transform: scale(2.5);
                }
                100% { 
                  opacity: 0.5;
                  transform: scale(1);
                }
              }
            `}</style>
            <h1 className="font-light tracking-tight" style={{
          color: "#ffffff",
          fontSize: isLandscape ? "clamp(16px, 3vw, 18px)" : "var(--text-heading)",
          textAlign: "center",
          marginBottom: "var(--space-sm)"
        }}>AI-powered procurement platform</h1>
            {!isLandscape && <p className="text-center" style={{
          color: "rgba(255,255,255,0.6)",
          maxWidth: "480px",
          fontSize: "var(--text-subheading)",
          marginBottom: "var(--space-md)"
        }}>Request your quotation to suppliers selected from a list of over 50,000 and manage your entire order - all in one platform</p>}
            
            <div className="flex flex-wrap justify-center gap-2 max-w-3xl" style={{
          marginTop: isLandscape ? "var(--space-sm)" : "0",
          marginBottom: isMobile ? "clamp(16px, 4vh, 32px)" : "clamp(12px, 2vh, 24px)"
        }}>
              {(isMobile ? mobileSuggestionPills : suggestionPills).map((pill, idx) => <button key={idx} onClick={() => sendMessage(undefined, pill)} className="rounded-full transition-all hover:bg-white/10" style={{
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.15)",
            color: "rgba(255,255,255,0.85)",
            backdropFilter: "blur(8px)",
            padding: isLandscape ? "clamp(4px, 1vw, 5px) clamp(8px, 2vw, 10px)" : "var(--space-sm) var(--space-md)",
            fontSize: isLandscape ? "clamp(10px, 1.5vw, 11px)" : "var(--text-pill)",
            borderRadius: "var(--radius-lg)"
          }}>
                  {pill}
                </button>)}
            </div>
          </div> : <div className="flex-1 overflow-y-auto px-4 py-6" style={{
        paddingBottom: isMobile ? "160px" : "24px"
      }}>
            <div className="mx-auto max-w-3xl space-y-3">
              {messages.map((msg, idx) => <div key={idx}>
                  <div className="text-xs font-semibold uppercase tracking-[0.2em] mb-0.5" style={{
              color: msg.role === "user" ? "rgba(255,255,255,0.5)" : "#06B6D4",
              textAlign: msg.role === "user" ? "right" : "left"
            }}>
                    {msg.role === "user" ? "ME" : "WIT AI"}
                  </div>
                  <div style={{
              display: "flex",
              justifyContent: msg.role === "user" ? "flex-end" : "flex-start"
            }}>
                    <div className="chat-bubble rounded-2xl max-w-[80%]" style={{
                padding: "10px 14px",
                lineHeight: "1.5",
                background: msg.role === "user" ? "rgba(255,255,255,0.08)" : "transparent",
                border: msg.role === "user" ? "1px solid rgba(255,255,255,0.1)" : "none",
                color: msg.role === "user" ? "#ffffff" : "rgba(255,255,255,0.85)",
                textAlign: "left"
              }}>
                    {msg.attachments && msg.attachments.length > 0 && <div className="mb-2 flex flex-wrap gap-2">
                        {msg.attachments.map((url, i) => {
                    const isImage = url.match(/\.(jpg|jpeg|png|gif|webp)$/i);
                    const isPdf = url.match(/\.pdf$/i);
                    const isDoc = url.match(/\.(doc|docx)$/i);
                    const isExcel = url.match(/\.(xls|xlsx)$/i);
                    if (isImage) {
                      return <img key={i} src={url} alt="Attachment" className="rounded-lg max-w-full cursor-pointer" style={{
                        maxHeight: "200px"
                      }} onClick={() => window.open(url, '_blank')} />;
                    }
                    return <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{
                      background: "rgba(6,182,212,0.15)",
                      border: "1px solid rgba(6,182,212,0.3)",
                      color: "#ffffff"
                    }}>
                              {isPdf && <FileText className="h-5 w-5" />}
                              {isDoc && <FileText className="h-5 w-5" />}
                              {isExcel && <FileSpreadsheet className="h-5 w-5" />}
                              {!isPdf && !isDoc && !isExcel && <File className="h-5 w-5" />}
                              <span className="text-sm">
                                {url.split('/').pop()?.substring(0, 20) || 'File'}
                              </span>
                            </a>;
                  })}
                      </div>}
                    <ReactMarkdown remarkPlugins={[remarkGfm]} components={{
                  p: ({
                    children
                  }) => <p style={{
                    margin: "4px 0"
                  }}>{children}</p>,
                  strong: ({
                    children
                  }) => <strong style={{
                    fontWeight: 700,
                    color: "#ffffff",
                    display: "inline-block"
                  }}>
                            {children}
                          </strong>,
                  em: ({
                    children
                  }) => <em style={{
                    color: "rgba(255,255,255,0.5)",
                    fontStyle: "italic"
                  }}>
                            {children}
                          </em>,
                  ul: ({
                    children
                  }) => <ul style={{
                    margin: "2px 0",
                    paddingLeft: "16px",
                    listStyleType: "disc",
                    display: "block"
                  }}>{children}</ul>,
                  li: ({
                    children
                  }) => <li style={{
                    lineHeight: "1.4",
                    marginBottom: "2px",
                    display: "list-item"
                  }}>{children}</li>,
                  h2: ({
                    children
                  }) => <h2 style={{
                    fontSize: "1.1rem",
                    fontWeight: 600,
                    marginTop: "6px",
                    marginBottom: "4px",
                    color: "#ffffff"
                  }}>
                            {children}
                          </h2>,
                  h3: ({
                    children
                  }) => <h3 style={{
                    fontSize: "1rem",
                    fontWeight: 600,
                    marginTop: "6px",
                    marginBottom: "4px",
                    color: "#ffffff"
                  }}>
                            {children}
                          </h3>,
                  a: ({
                    href,
                    children
                  }) => <a href={href} target="_blank" rel="noopener noreferrer" style={{
                    color: "#06B6D4",
                    textDecoration: "underline"
                  }}>
                            {children}
                          </a>
                }}>
                      {msg.content}
                    </ReactMarkdown>
                    {msg.role === "bot" && msg.products && msg.products.length > 0 && (
                      <div className="mt-3 flex gap-3 overflow-x-auto pb-2 -mx-1 px-1">
                        {msg.products.map((product) => (
                          <DemoProductCard key={product.ref} product={product} />
                        ))}
                      </div>
                    )}
                    </div>
                  </div>
                </div>)}
              {(isLoading || isTyping) && <div>
                  <div className="text-xs font-semibold uppercase tracking-[0.2em] mb-1" style={{
              color: "#06B6D4"
            }}>WIT AI</div>
                  {isLoading ? <div className="flex gap-1 text-left" style={{
              color: "rgba(255,255,255,0.6)"
            }}>
                      <span className="animate-bounce" style={{
                animationDelay: "0ms"
              }}>●</span>
                      <span className="animate-bounce" style={{
                animationDelay: "150ms"
              }}>●</span>
                      <span className="animate-bounce" style={{
                animationDelay: "300ms"
              }}>●</span>
                    </div> : isTyping && typingMessage && <div className="chat-bubble rounded-2xl max-w-[80%]" style={{
              padding: "10px 14px",
              lineHeight: "1.5",
              background: "transparent",
              color: "rgba(255,255,255,0.85)",
              textAlign: "left"
            }}>
                      <ReactMarkdown remarkPlugins={[remarkGfm]} components={{
                p: ({
                  children
                }) => <p style={{
                  margin: "4px 0"
                }}>{children}</p>,
                strong: ({
                  children
                }) => <strong style={{
                  fontWeight: 700,
                  color: "#000000",
                  display: "inline-block"
                }}>
                              {children}
                            </strong>,
                em: ({
                  children
                }) => <em style={{
                  color: "#999999",
                  fontStyle: "italic"
                }}>
                              {children}
                            </em>,
                ul: ({
                  children
                }) => <ul style={{
                  margin: "2px 0",
                  paddingLeft: "16px",
                  listStyleType: "disc",
                  display: "block"
                }}>{children}</ul>,
                li: ({
                  children
                }) => <li style={{
                  lineHeight: "1.4",
                  marginBottom: "2px",
                  display: "list-item"
                }}>{children}</li>,
                h2: ({
                  children
                }) => <h2 style={{
                  fontSize: "1.1rem",
                  fontWeight: 600,
                  marginTop: "6px",
                  marginBottom: "4px",
                  color: "#000000"
                }}>
                              {children}
                            </h2>,
                h3: ({
                  children
                }) => <h3 style={{
                  fontSize: "1rem",
                  fontWeight: 600,
                  marginTop: "6px",
                  marginBottom: "4px",
                  color: "#000000"
                }}>
                              {children}
                            </h3>,
                a: ({
                  href,
                  children
                }) => <a href={href} target="_blank" rel="noopener noreferrer" style={{
                  color: "#5AB3FF",
                  textDecoration: "underline"
                }}>
                              {children}
                            </a>
              }}>
                        {typingMessage}
                      </ReactMarkdown>
                    </div>}
                </div>}
              <div ref={chatEndRef} />
            </div>
          </div>}

        {/* Popular Requests - shown above input */}
        {messages.length === 0 && !isLandscape && <div className="w-full px-4 pb-6" style={{
        marginTop: isMobile ? "clamp(-30px, -3vh, -20px)" : "-60px",
        marginBottom: isMobile ? "clamp(20px, 5vh, 30px)" : "50px"
      }}>
            <div className="mx-auto max-w-5xl">
              <h2 className="font-semibold uppercase tracking-[0.25em] mb-4" style={{
            color: "#06B6D4",
            fontSize: isMobile ? "clamp(11px, 2.5vw, 12px)" : "12px",
            marginBottom: isMobile ? "clamp(12px, 2.5vh, 16px)" : "var(--space-md)"
          }}>Popular Requests</h2>
              {isMobile ? <div className="flex gap-4 overflow-x-auto pb-2" style={{
            scrollSnapType: "x mandatory",
            WebkitOverflowScrolling: "touch",
            scrollbarWidth: "none",
            msOverflowStyle: "none"
          }}>
                  <style>{`
                    .flex.gap-4.overflow-x-auto::-webkit-scrollbar {
                      display: none;
                    }
                  `}</style>
                  {popularRequests.map((request, idx) => <button key={idx} onClick={() => sendMessage(undefined, `Tell me about ${request.name}`)} className="flex-shrink-0 p-4 rounded-2xl transition-all hover:border-white/20" style={{
              background: "rgba(255,255,255,0.02)",
              border: "1px solid rgba(255,255,255,0.1)",
              width: "134px",
              scrollSnapAlign: "start",
              textAlign: "left"
            }}>
                      <request.icon className="w-5 h-5 mb-11" style={{
                color: "#06B6D4"
              }} />
                      <div className="text-xs font-medium" style={{
                color: "rgba(255,255,255,0.85)"
              }}>{request.name}</div>
                    </button>)}
                </div> : <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                  {popularRequests.map((request, idx) => <button key={idx} onClick={() => sendMessage(undefined, `Tell me about ${request.name}`)} className="transition-all hover:border-white/20" style={{
              background: "rgba(255,255,255,0.02)",
              border: "1px solid rgba(255,255,255,0.1)",
              textAlign: "left",
              minWidth: "clamp(140px, 30vw, 180px)",
              padding: "var(--space-md)",
              borderRadius: "var(--radius-md)"
            }}>
                      <request.icon style={{
                color: "#06B6D4",
                width: "var(--icon-lg)",
                height: "var(--icon-lg)",
                marginBottom: "clamp(40px, 8vw, 56px)"
              }} />
                      <div className="font-medium" style={{
                color: "rgba(255,255,255,0.85)",
                fontSize: "var(--text-subheading)"
              }}>{request.name}</div>
                    </button>)}
                </div>}
            </div>
          </div>}

        {/* Bottom Section Wrapper - Fixed on mobile empty state */}
        <div style={{
        position: isMobile && messages.length === 0 ? "fixed" : "relative",
        bottom: isMobile && messages.length === 0 ? 0 : "auto",
        left: isMobile && messages.length === 0 ? 0 : "auto",
        right: isMobile && messages.length === 0 ? 0 : "auto",
        zIndex: isMobile && messages.length === 0 ? 40 : "auto",
        background: isMobile && messages.length === 0 ? "#0a0a0a" : "transparent",
        width: isMobile && messages.length === 0 ? "100%" : "auto"
      }}>
          {/* Input Area */}
          <div className="px-4 pb-6" style={isMobile && messages.length > 0 ? {
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 40,
          background: "#0a0a0a",
          paddingTop: "12px"
        } : {}}>
          <form onSubmit={sendMessage} className="mx-auto max-w-3xl">
            {selectedFiles.length > 0 && <div className="mb-2 flex flex-wrap gap-2">
                {selectedFiles.map((filePreview, index) => <div key={index} className="relative">
                    {filePreview.type === "image" ? <img src={filePreview.preview} alt="Preview" className="rounded-lg" style={{
                  maxHeight: "100px",
                  maxWidth: "100px"
                }} /> : <div className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{
                  background: "rgba(255,255,255,0.08)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  minWidth: "150px"
                }}>
                        {filePreview.type === "pdf" && <FileText style={{
                    color: "#06B6D4",
                    width: "var(--icon-sm)",
                    height: "var(--icon-sm)"
                  }} />}
                        {filePreview.type === "doc" && <FileText style={{
                    color: "#06B6D4",
                    width: "var(--icon-sm)",
                    height: "var(--icon-sm)"
                  }} />}
                        {filePreview.type === "excel" && <FileSpreadsheet style={{
                    color: "#06B6D4",
                    width: "var(--icon-sm)",
                    height: "var(--icon-sm)"
                  }} />}
                        {filePreview.type === "other" && <File style={{
                    color: "#06B6D4",
                    width: "var(--icon-sm)",
                    height: "var(--icon-sm)"
                  }} />}
                        <span className="text-sm truncate" style={{
                    color: "#ffffff",
                    maxWidth: "100px"
                  }}>
                          {filePreview.file.name}
                        </span>
                      </div>}
                    <button type="button" onClick={() => removeFile(index)} className="absolute -top-2 -right-2 rounded-full p-1" style={{
                  background: "#06B6D4"
                }}>
                      <X style={{
                    color: "#ffffff",
                    width: "var(--icon-sm)",
                    height: "var(--icon-sm)"
                  }} />
                    </button>
                  </div>)}
              </div>}
            <div className="flex items-center relative" style={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.15)",
              borderRadius: "var(--input-border-radius)",
              padding: "var(--input-padding)",
              backdropFilter: "blur(12px)",
              gap: "var(--space-sm)"
            }}>
              <input type="file" ref={fileInputRef} onChange={handleFileSelect} accept="image/*" multiple className="hidden" />
              <button type="button" onClick={() => fileInputRef.current?.click()} className="shrink-0">
                <Paperclip style={{
                  color: "#06B6D4",
                  width: "var(--icon-md)",
                  height: "var(--icon-md)"
                }} />
              </button>
              <div className="flex-1 relative">
                {isTextareaMaxHeight && isTextareaScrolled && (
                  <div
                    className="absolute top-0 left-0 right-0 pointer-events-none"
                    style={{
                      height: "30px",
                      background: "linear-gradient(to bottom, rgba(20,20,20,0.95) 0%, rgba(20,20,20,0) 100%)",
                      zIndex: 1
                    }}
                  />
                )}
                <textarea 
                  ref={textareaRef}
                  value={input} 
                  onChange={e => setInput(e.target.value)}
                  onScroll={e => {
                    const target = e.target as HTMLTextAreaElement;
                    setIsTextareaScrolled(target.scrollTop > 0);
                  }}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage(e as any);
                    }
                  }}
                  placeholder={isMobile ? "What's your project?" : "Ask me anything about your projects"}
                  disabled={isLoading}
                  className="flex-1 border-0 bg-transparent p-0 focus:outline-none resize-none w-full placeholder:text-white/40"
                  rows={1}
                  style={{
                    color: "#ffffff",
                    fontSize: "var(--text-body)",
                    height: input ? "auto" : "24px",
                    minHeight: "24px",
                    maxHeight: "200px",
                    overflowY: input ? "auto" : "hidden",
                    lineHeight: "24px"
                  }} 
                />
              </div>
              <button type="submit" disabled={isLoading || !input.trim() && selectedFiles.length === 0} className="shrink-0">
                <img src={sendButton} alt="Send" style={{
                  width: "var(--icon-md)",
                  height: "var(--icon-md)",
                  filter: 'brightness(0) saturate(100%) invert(67%) sepia(82%) saturate(2647%) hue-rotate(155deg) brightness(95%) contrast(101%)'
                }} />
              </button>
            </div>
          </form>
        </div>

        {/* Footer */}
        <footer className="border-t px-4 text-center" style={{
          borderColor: "rgba(255,255,255,0.08)",
          color: "rgba(255,255,255,0.4)",
          background: "transparent",
          paddingTop: "var(--space-sm)",
          paddingBottom: "var(--space-sm)",
          fontSize: "var(--text-footer)",
          lineHeight: "1.4"
        }}>
        <span style={{
            whiteSpace: isMobile ? "nowrap" : "normal"
          }}>
          By messaging WitAI, you agree to our{" "}
          <a href="/terms" className="underline" style={{
              color: "#06B6D4"
            }}>
            Terms
          </a>{" "}
          and have read our{" "}
          <a href="/privacy" className="underline" style={{
              color: "#06B6D4"
            }}>
            Privacy Policy
          </a>
          .
        </span>
      </footer>
        </div>
      </main>
    </div>;
};
export default Index;