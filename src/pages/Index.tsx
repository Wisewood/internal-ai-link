import { useState, useRef, useEffect } from "react";
import { Paperclip, Menu, X, FileText, FileSpreadsheet, File, Send } from "lucide-react";
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
  }, [messages]);

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
          <img src={logo} alt="Logo" className="h-10 w-auto" />
        </div>

        <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
          <SheetTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon"
              className="relative hover:bg-white/10 transition-all duration-300"
            >
              <Menu className="h-6 w-6 transition-transform duration-300 hover:scale-110" style={{ color: "#ececec" }} />
            </Button>
          </SheetTrigger>
          <SheetContent 
            className="border-l backdrop-blur-sm"
            style={{ 
              background: "linear-gradient(135deg, #2a2a2a 0%, #1f1f1f 100%)", 
              borderColor: "#3a3a3a" 
            }}
          >
            <nav className="flex flex-col gap-2 mt-12">
              {menuLinks.map((link, index) => (
                <a
                  key={link.name}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative text-lg px-5 py-3 rounded-xl transition-all duration-300 hover:translate-x-1"
                  style={{ 
                    color: "#ececec",
                    animationDelay: `${index * 50}ms`
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "rgba(74, 144, 226, 0.15)";
                    e.currentTarget.style.borderLeft = "3px solid #4a90e2";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "transparent";
                    e.currentTarget.style.borderLeft = "3px solid transparent";
                  }}
                >
                  <span className="relative z-10">{link.name}</span>
                  <div 
                    className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{
                      background: "linear-gradient(90deg, rgba(74, 144, 226, 0.1) 0%, transparent 100%)"
                    }}
                  />
                </a>
              ))}
            </nav>
          </SheetContent>
        </Sheet>
      </header>

      {/* Main Content */}
      <main className="flex flex-1 flex-col overflow-hidden">
        {messages.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center px-4">
            <img src={witIcon} alt="WitAI" className="mb-6 h-20 w-auto" />
            <h1 className="mb-8 text-2xl font-normal" style={{ color: "#ececec" }}>
              What are you looking for?
            </h1>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto px-4 py-6">
            <div className="mx-auto max-w-3xl space-y-6">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  style={{
                    display: "flex",
                    justifyContent: msg.role === "user" ? "flex-end" : "flex-start"
                  }}
                >
                  <div
                    className="rounded-2xl max-w-[80%]"
                    style={{
                      color: msg.role === "user" ? "#4a90e2" : "#ececec",
                      background: msg.role === "user" ? "rgba(74, 144, 226, 0.15)" : "transparent",
                      padding: msg.role === "user" ? "12px 16px" : "0"
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
                    <div className="whitespace-pre-wrap">{msg.content}</div>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex gap-1 text-left" style={{ color: "#ececec" }}>
                  <span className="animate-bounce" style={{ animationDelay: "0ms" }}>●</span>
                  <span className="animate-bounce" style={{ animationDelay: "150ms" }}>●</span>
                  <span className="animate-bounce" style={{ animationDelay: "300ms" }}>●</span>
                </div>
              )}
              <div ref={chatEndRef} />
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
                        style={{ background: "#2f2f2f", minWidth: "150px" }}
                      >
                        {filePreview.type === "pdf" && <FileText className="h-5 w-5" style={{ color: "#4a90e2" }} />}
                        {filePreview.type === "doc" && <FileText className="h-5 w-5" style={{ color: "#4a90e2" }} />}
                        {filePreview.type === "excel" && <FileSpreadsheet className="h-5 w-5" style={{ color: "#4a90e2" }} />}
                        {filePreview.type === "other" && <File className="h-5 w-5" style={{ color: "#4a90e2" }} />}
                        <span className="text-sm truncate" style={{ color: "#ececec", maxWidth: "100px" }}>
                          {filePreview.file.name}
                        </span>
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      className="absolute -top-2 -right-2 rounded-full p-1"
                      style={{ background: "#4a90e2" }}
                    >
                      <X className="h-4 w-4" style={{ color: "#ececec" }} />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <div className="flex items-center gap-3 rounded-full px-4 py-3" style={{ background: "#2f2f2f", border: "1px solid #565656" }}>
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
                <Paperclip className="h-5 w-5 text-gray-400" />
              </button>
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Describe the product you want to source"
                disabled={isLoading}
                className="flex-1 border-0 bg-transparent p-0 text-base focus:outline-none"
                style={{ color: "#ececec" }}
              />
              <button
                type="submit"
                disabled={isLoading || (!input.trim() && selectedFiles.length === 0)}
                className="shrink-0 rounded-full p-2 transition-all duration-300 hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ background: "#4a90e2" }}
              >
                <Send className="h-5 w-5" style={{ color: "#ececec" }} />
              </button>
            </div>
          </form>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t px-4 py-4 text-center text-xs" style={{ borderColor: "#424242", color: "#b4b4b4" }}>
        By messaging WitAI, you agree to our{" "}
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
