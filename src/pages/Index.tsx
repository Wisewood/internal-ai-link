import { useState, useRef, useEffect } from "react";
import { Paperclip, Menu, X, FileText, FileSpreadsheet, File, Send } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { supabase } from "@/integrations/supabase/client";
import logo from "@/assets/logo.png";
import witIcon from "@/assets/wit-icon.png";

interface Message {
  role: "user" | "bot";
  content: string;
  attachments?: string[];
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
  const chatEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const sessionIdRef = useRef(crypto.randomUUID());
  const { toast } = useToast();

  const menuLinks = [
    { name: "Home", url: "https://wisewoodint.com/" },
    { name: "Services", url: "https://wisewoodint.com/services" },
    { name: "Brands", url: "https://wisewoodint.com/brands" },
    { name: "Portfolio", url: "https://wisewoodint.com/portfolio" },
    { name: "Contact", url: "https://wisewoodint.com/contact" },
    { name: "About", url: "https://wisewoodint.com/about" },
  ];

  const API_URL = "https://witai.app.n8n.cloud/webhook/242b2e77-081b-4961-ba8e-4c21bb5d1bb5/chat";

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typingMessage]);

  const typeMessage = (fullMessage: string) => {
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
        setMessages(prev => [...prev, { role: "bot", content: fullMessage }]);
        setTypingMessage("");
      }
    }, 20); // 50 characters per second = 1000ms / 50 = 20ms per character
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

    files.forEach((file) => {
      const fileType = getFileType(file);
      
      if (fileType === "image") {
        const reader = new FileReader();
        reader.onloadend = () => {
          newPreviews.push({
            file,
            preview: reader.result as string,
            type: fileType,
          });
          if (newPreviews.length === files.length) {
            setSelectedFiles((prev) => [...prev, ...newPreviews]);
          }
        };
        reader.readAsDataURL(file);
      } else {
        newPreviews.push({
          file,
          preview: file.name,
          type: fileType,
        });
        if (newPreviews.length === files.length) {
          setSelectedFiles((prev) => [...prev, ...newPreviews]);
        }
      }
    });
  };

  const uploadFile = async (file: File): Promise<string | null> => {
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${crypto.randomUUID()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("chat-attachments")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("chat-attachments")
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      console.error("Error uploading file:", error);
      toast({
        title: "Upload Error",
        description: "Failed to upload file",
        variant: "destructive",
      });
      return null;
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    if (fileInputRef.current && selectedFiles.length === 1) {
      fileInputRef.current.value = "";
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = input.trim();
    if ((!text && selectedFiles.length === 0) || isLoading) return;

    const attachmentUrls: string[] = [];
    
    // Upload all files if selected
    if (selectedFiles.length > 0) {
      for (const filePreview of selectedFiles) {
        const url = await uploadFile(filePreview.file);
        if (url) {
          attachmentUrls.push(url);
        }
      }
      if (attachmentUrls.length === 0) return; // Stop if all uploads failed
    }

    // Add user message with attachments
    setMessages(prev => [...prev, { 
      role: "user", 
      content: text || "📎 Attachments", 
      attachments: attachmentUrls.length > 0 ? attachmentUrls : undefined 
    }]);
    setInput("");
    setSelectedFiles([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    setIsLoading(true);

    try {
      // Prepare chat input with JSON formatted attachments
      let chatInput = text;
      if (attachmentUrls.length > 0) {
        const attachmentsJson = JSON.stringify({
          attachments_urls: attachmentUrls
        });
        chatInput = text ? `${text}\n${attachmentsJson}` : attachmentsJson;
      }

      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: sessionIdRef.current,
          action: "sendMessage",
          chatInput: chatInput
        }),
      });

      const data = await res.json();
      const botMessage = data.text || data.output || data.ui || "…";
      setIsLoading(false);
      typeMessage(botMessage);
    } catch (err) {
      console.error(err);
      toast({
        title: "Connection Error",
        description: "There was a problem connecting to the chat.",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  const suggestionPills = [
    "What can I ask you to do?",
    "Assist me on a quotation for my project",
    "How many products categories do you work with?",
    "I want to discover products trends"
  ];

  const popularRequests = [
    { name: "Retail Apparel", icon: "👕" },
    { name: "Furniture", icon: "🪑" },
    { name: "Flags", icon: "🚩" },
    { name: "Construction", icon: "🏗️" }
  ];

  return (
    <div className="flex min-h-screen flex-col" style={{ background: "#f5f5f5", color: "#1a1a1a" }}>
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3" style={{ background: "transparent" }}>
        <img src={witIcon} alt="WIT" className="h-8 w-auto" />
        <div className="flex items-center gap-6">
          <a href="https://wisewoodint.com/services" target="_blank" rel="noopener noreferrer" className="text-sm hover:underline" style={{ color: "#1a1a1a" }}>Services</a>
          <a href="https://wisewoodint.com/brands" target="_blank" rel="noopener noreferrer" className="text-sm hover:underline" style={{ color: "#1a1a1a" }}>Brands</a>
          <a href="https://wisewoodint.com/portfolio" target="_blank" rel="noopener noreferrer" className="text-sm hover:underline" style={{ color: "#1a1a1a" }}>Portfolio</a>
          <a href="https://wisewoodint.com/contact" target="_blank" rel="noopener noreferrer" className="text-sm hover:underline" style={{ color: "#1a1a1a" }}>Contact</a>
          <a href="https://wisewoodint.com/about" target="_blank" rel="noopener noreferrer" className="text-sm hover:underline" style={{ color: "#1a1a1a" }}>About</a>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex flex-1 flex-col overflow-hidden">
        {messages.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center px-4">
            <img src={witIcon} alt="WitAI" className="mb-4 h-24 w-auto" />
            <h1 className="mb-2 text-3xl font-normal" style={{ color: "#1a1a1a" }}>
              AI powered procurement platform
            </h1>
            <p className="mb-8 text-center text-sm" style={{ color: "#666666", maxWidth: "600px" }}>
              Ask your quotation to 50.000+ certified suppliers and manage your entire order from 1 platform only
            </p>
            
            <div className="flex flex-wrap justify-center gap-3 max-w-3xl">
              {suggestionPills.map((pill, idx) => (
                <button
                  key={idx}
                  onClick={() => setInput(pill)}
                  className="px-5 py-2.5 rounded-full text-sm transition-all hover:shadow-md"
                  style={{ background: "#ffffff", border: "1px solid #e0e0e0", color: "#1a1a1a" }}
                >
                  {pill}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto px-4 py-6">
            <div className="mx-auto max-w-3xl space-y-6">
              {messages.map((msg, idx) => (
                <div key={idx}>
                  <div 
                    className="text-xs font-medium mb-1" 
                    style={{ 
                      color: "#666666",
                      textAlign: msg.role === "user" ? "right" : "left"
                    }}
                  >
                    {msg.role === "user" ? "ME" : "WIT AI"}
                  </div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: msg.role === "user" ? "flex-end" : "flex-start"
                    }}
                  >
                    <div
                      className="chat-bubble rounded-2xl max-w-[80%]"
                      style={{
                        padding: "14px 18px",
                        lineHeight: "1.6",
                        background: msg.role === "user" ? "#e8e8e8" : "transparent",
                        color: msg.role === "user" ? "#1a1a1a" : "#4a4a4a"
                      }}
                    >
                    {msg.attachments && msg.attachments.length > 0 && (
                      <div className="mb-2 flex flex-wrap gap-2">
                        {msg.attachments.map((url, i) => {
                          const isImage = url.match(/\.(jpg|jpeg|png|gif|webp)$/i);
                          const isPdf = url.match(/\.pdf$/i);
                          const isDoc = url.match(/\.(doc|docx)$/i);
                          const isExcel = url.match(/\.(xls|xlsx)$/i);
                          
                          if (isImage) {
                            return (
                              <img 
                                key={i}
                                src={url} 
                                alt="Attachment" 
                                className="rounded-lg max-w-full cursor-pointer"
                                style={{ maxHeight: "200px" }}
                                onClick={() => window.open(url, '_blank')}
                              />
                            );
                          }
                          
                          return (
                            <a
                              key={i}
                              href={url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 px-3 py-2 rounded-lg"
                              style={{ background: "rgba(74, 144, 226, 0.2)" }}
                            >
                              {isPdf && <FileText className="h-5 w-5" />}
                              {isDoc && <FileText className="h-5 w-5" />}
                              {isExcel && <FileSpreadsheet className="h-5 w-5" />}
                              {!isPdf && !isDoc && !isExcel && <File className="h-5 w-5" />}
                              <span className="text-sm">
                                {url.split('/').pop()?.substring(0, 20) || 'File'}
                              </span>
                            </a>
                          );
                        })}
                      </div>
                    )}
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        p: ({ children }) => <p style={{ margin: "8px 0" }}>{children}</p>,
                        strong: ({ children }) => (
                          <strong style={{ fontWeight: 600, color: msg.role === "user" ? "#1a1a1a" : "#000000" }}>
                            {children}
                          </strong>
                        ),
                        em: ({ children }) => (
                          <em style={{ color: "#999999", fontStyle: "italic" }}>
                            {children}
                          </em>
                        ),
                        ul: ({ children }) => (
                          <ul style={{ margin: "8px 0", paddingLeft: "18px", listStyleType: "disc", display: "block" }}>{children}</ul>
                        ),
                        li: ({ children }) => (
                          <li style={{ lineHeight: "1.6", marginBottom: "4px", display: "list-item" }}>{children}</li>
                        ),
                        h2: ({ children }) => (
                          <h2 style={{ fontSize: "1.1rem", fontWeight: 600, marginTop: "10px", color: msg.role === "user" ? "#1a1a1a" : "#000000" }}>
                            {children}
                          </h2>
                        ),
                        h3: ({ children }) => (
                          <h3 style={{ fontSize: "1rem", fontWeight: 600, marginTop: "8px", color: msg.role === "user" ? "#1a1a1a" : "#000000" }}>
                            {children}
                          </h3>
                        ),
                        a: ({ href, children }) => (
                          <a href={href} target="_blank" rel="noopener noreferrer" style={{ color: "#5AB3FF", textDecoration: "underline" }}>
                            {children}
                          </a>
                        ),
                      }}
                    >
                      {msg.content}
                    </ReactMarkdown>
                    </div>
                  </div>
                </div>
              ))}
              {(isLoading || isTyping) && (
                <div>
                  <div className="text-xs font-medium mb-1" style={{ color: "#666666" }}>WIT AI</div>
                  {isLoading ? (
                    <div className="flex gap-1 text-left" style={{ color: "#666666" }}>
                      <span className="animate-bounce" style={{ animationDelay: "0ms" }}>●</span>
                      <span className="animate-bounce" style={{ animationDelay: "150ms" }}>●</span>
                      <span className="animate-bounce" style={{ animationDelay: "300ms" }}>●</span>
                    </div>
                  ) : isTyping && typingMessage && (
                    <div
                      className="chat-bubble rounded-2xl max-w-[80%]"
                      style={{
                        padding: "14px 18px",
                        lineHeight: "1.6",
                        background: "transparent",
                        color: "#4a4a4a"
                      }}
                    >
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                          p: ({ children }) => <p style={{ margin: "8px 0" }}>{children}</p>,
                          strong: ({ children }) => (
                            <strong style={{ fontWeight: 600, color: "#000000" }}>
                              {children}
                            </strong>
                          ),
                          em: ({ children }) => (
                            <em style={{ color: "#999999", fontStyle: "italic" }}>
                              {children}
                            </em>
                          ),
                          ul: ({ children }) => (
                            <ul style={{ margin: "8px 0", paddingLeft: "18px", listStyleType: "disc", display: "block" }}>{children}</ul>
                          ),
                          li: ({ children }) => (
                            <li style={{ lineHeight: "1.6", marginBottom: "4px", display: "list-item" }}>{children}</li>
                          ),
                          h2: ({ children }) => (
                            <h2 style={{ fontSize: "1.1rem", fontWeight: 600, marginTop: "10px", color: "#000000" }}>
                              {children}
                            </h2>
                          ),
                          h3: ({ children }) => (
                            <h3 style={{ fontSize: "1rem", fontWeight: 600, marginTop: "8px", color: "#000000" }}>
                              {children}
                            </h3>
                          ),
                          a: ({ href, children }) => (
                            <a href={href} target="_blank" rel="noopener noreferrer" style={{ color: "#5AB3FF", textDecoration: "underline" }}>
                              {children}
                            </a>
                          ),
                        }}
                      >
                        {typingMessage}
                      </ReactMarkdown>
                    </div>
                  )}
                </div>
              )}
              <div ref={chatEndRef} />
            </div>
          </div>
        )}

        {/* Popular Requests - shown above input */}
        {messages.length === 0 && (
          <div className="w-full px-4 pb-6">
            <div className="mx-auto max-w-5xl">
              <h2 className="text-lg font-medium mb-4" style={{ color: "#666666" }}>Popular Requests</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                {popularRequests.map((request, idx) => (
                  <button
                    key={idx}
                    onClick={() => setInput(`Tell me about ${request.name}`)}
                    className="p-6 rounded-2xl text-center transition-all hover:shadow-lg"
                    style={{ background: "#ffffff", border: "1px solid #e0e0e0" }}
                  >
                    <div className="text-4xl mb-3">{request.icon}</div>
                    <div className="text-sm font-medium" style={{ color: "#1a1a1a" }}>{request.name}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Input Area */}
        <div className="px-4 pb-6">
          <form onSubmit={sendMessage} className="mx-auto max-w-3xl">
            {selectedFiles.length > 0 && (
              <div className="mb-2 flex flex-wrap gap-2">
                {selectedFiles.map((filePreview, index) => (
                  <div key={index} className="relative">
                    {filePreview.type === "image" ? (
                      <img 
                        src={filePreview.preview} 
                        alt="Preview" 
                        className="rounded-lg"
                        style={{ maxHeight: "100px", maxWidth: "100px" }}
                      />
                    ) : (
                      <div 
                        className="flex items-center gap-2 px-3 py-2 rounded-lg"
                        style={{ background: "#f0f0f0", minWidth: "150px" }}
                      >
                        {filePreview.type === "pdf" && <FileText className="h-5 w-5" style={{ color: "#ff8c42" }} />}
                        {filePreview.type === "doc" && <FileText className="h-5 w-5" style={{ color: "#ff8c42" }} />}
                        {filePreview.type === "excel" && <FileSpreadsheet className="h-5 w-5" style={{ color: "#ff8c42" }} />}
                        {filePreview.type === "other" && <File className="h-5 w-5" style={{ color: "#ff8c42" }} />}
                        <span className="text-sm truncate" style={{ color: "#1a1a1a", maxWidth: "100px" }}>
                          {filePreview.file.name}
                        </span>
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      className="absolute -top-2 -right-2 rounded-full p-1"
                      style={{ background: "#5271ff" }}
                    >
                      <X className="h-4 w-4" style={{ color: "#ffffff" }} />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <div className="flex items-center gap-3 rounded-full px-4 py-3" style={{ background: "#ffffff", border: "1px solid #d0d0d0" }}>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"
                multiple
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="shrink-0"
              >
                <Paperclip className="h-5 w-5" style={{ color: "#ff8c42" }} />
              </button>
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask me anything about your projects"
                disabled={isLoading}
                className="flex-1 border-0 bg-transparent p-0 text-base focus:outline-none"
                style={{ color: "#1a1a1a" }}
              />
              <button
                type="submit"
                disabled={isLoading || (!input.trim() && selectedFiles.length === 0)}
                className="shrink-0 rounded-full p-2 transition-all duration-300 hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ background: "#5271ff" }}
              >
                <Send className="h-5 w-5" style={{ color: "#ffffff" }} />
              </button>
            </div>
          </form>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t px-4 py-4 text-center text-xs" style={{ borderColor: "#e0e0e0", color: "#999999", background: "#ffffff" }}>
        By messaging WitAI, you agree to our{" "}
        <a href="#" className="underline" style={{ color: "#5271ff" }}>
          Terms
        </a>{" "}
        and have read our{" "}
        <a href="#" className="underline" style={{ color: "#5271ff" }}>
          Privacy Policy
        </a>
        .
      </footer>
    </div>
  );
};

export default Index;
