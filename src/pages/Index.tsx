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
import witLogo from "@/assets/wit-logo.png";
import witAiLogo from "@/assets/wit-ai-logo.png";
import sendButton from "@/assets/send-button.png";
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
  const [isLogoFlipped, setIsLogoFlipped] = useState(false);
  const [isLandscape, setIsLandscape] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const sessionIdRef = useRef(crypto.randomUUID());
  const {
    toast
  } = useToast();
  const isMobile = useIsMobile();
  const menuLinks = [{
    name: "Home",
    url: "https://wisewoodint.com/"
  }, {
    name: "Services",
    url: "https://wisewoodint.com/services"
  }, {
    name: "Brands",
    url: "https://wisewoodint.com/brands"
  }, {
    name: "Portfolio",
    url: "https://wisewoodint.com/portfolio"
  }, {
    name: "Contact",
    url: "https://wisewoodint.com/contact"
  }, {
    name: "About",
    url: "https://wisewoodint.com/about"
  }];
  const API_URL = "https://witai.app.n8n.cloud/webhook/242b2e77-081b-4961-ba8e-4c21bb5d1bb5/chat";
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({
      behavior: "smooth"
    });
  }, [messages, typingMessage]);

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
        setMessages(prev => [...prev, {
          role: "bot",
          content: fullMessage
        }]);
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
  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = input.trim();
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
      // Prepare chat input with JSON formatted attachments
      let chatInput = messagesToSend;
      if (attachmentUrls.length > 0) {
        const attachmentsJson = JSON.stringify({
          attachments_urls: attachmentUrls
        });
        chatInput = messagesToSend ? `${messagesToSend}\n${attachmentsJson}` : attachmentsJson;
      }
      const res = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          sessionId: sessionIdRef.current,
          action: "sendMessage",
          chatInput: chatInput
        })
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
    background: "#f5f5f5",
    color: "#1a1a1a"
  }}>
      {/* Header */}
      <header className="flex items-center relative" style={{
      background: messages.length > 0 ? "linear-gradient(to bottom, rgb(255, 255, 255) 0%, rgba(255, 255, 255, 0.9) 50%, transparent 100%)" : "transparent",
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
          maxHeight: isMobile ? messages.length === 0 ? "64px" : "48px" : messages.length === 0 ? "59px" : "45px",
          width: "auto",
          filter: "brightness(0)",
          opacity: messages.length === 0 ? 1 : 0,
          transition: "opacity 0.5s ease-in-out, max-height 0.3s ease-in-out"
        }} />
          <img src={witAiLogo} alt="WIT AI" className="" style={{
          maxHeight: isMobile ? messages.length === 0 ? "64px" : "48px" : messages.length === 0 ? "59px" : "45px",
          width: "auto",
          filter: "brightness(0)",
          opacity: messages.length === 0 ? 0 : 1,
          transition: "opacity 0.5s ease-in-out, max-height 0.3s ease-in-out"
        }} />
        </div>
        {messages.length === 0 && !isMobile && <div className="flex items-center gap-6 absolute left-1/2 transform -translate-x-1/2">
            <a href="https://wisewoodint.com/services" target="_blank" rel="noopener noreferrer" className="text-sm hover:underline" style={{
          color: "#1a1a1a"
        }}>Services</a>
            <a href="https://wisewoodint.com/brands" target="_blank" rel="noopener noreferrer" className="text-sm hover:underline" style={{
          color: "#1a1a1a"
        }}>Brands</a>
            <a href="https://wisewoodint.com/portfolio" target="_blank" rel="noopener noreferrer" className="text-sm hover:underline" style={{
          color: "#1a1a1a"
        }}>Portfolio</a>
            <a href="https://wisewoodint.com/contact" target="_blank" rel="noopener noreferrer" className="text-sm hover:underline" style={{
          color: "#1a1a1a"
        }}>Contact</a>
            <a href="https://wisewoodint.com/about" target="_blank" rel="noopener noreferrer" className="text-sm hover:underline" style={{
          color: "#1a1a1a"
        }}>About</a>
          </div>}
        {messages.length === 0 && isMobile && <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
            <SheetTrigger asChild>
              <button className="absolute right-4 top-1/2 -translate-y-1/2 p-2">
                <Menu className="h-6 w-6" style={{
              color: "#1a1a1a"
            }} />
              </button>
            </SheetTrigger>
            <SheetContent side="right" className="w-64">
              <nav className="flex flex-col gap-4 mt-8">
                <a href="https://wisewoodint.com/" target="_blank" rel="noopener noreferrer" className="text-base hover:underline" style={{
              color: "#999999"
            }}>Home</a>
                <a href="https://wisewoodint.com/services" target="_blank" rel="noopener noreferrer" className="text-base hover:underline" style={{
              color: "#999999"
            }}>Services</a>
                <a href="https://wisewoodint.com/brands" target="_blank" rel="noopener noreferrer" className="text-base hover:underline" style={{
              color: "#999999"
            }}>Brands</a>
                <a href="https://wisewoodint.com/portfolio" target="_blank" rel="noopener noreferrer" className="text-base hover:underline" style={{
              color: "#999999"
            }}>Portfolio</a>
                <a href="https://wisewoodint.com/contact" target="_blank" rel="noopener noreferrer" className="text-base hover:underline" style={{
              color: "#999999"
            }}>Contact</a>
                <a href="https://wisewoodint.com/about" target="_blank" rel="noopener noreferrer" className="text-base hover:underline" style={{
              color: "#999999"
            }}>About</a>
              </nav>
            </SheetContent>
          </Sheet>}
      </header>

      {/* Main Content */}
      <main className="flex flex-1 flex-col overflow-hidden" style={{
        paddingBottom: isMobile && messages.length === 0 ? "140px" : "0"
      }}>
        {messages.length === 0 ? <div className="flex flex-1 flex-col items-center justify-center px-4" style={{
          marginTop: isLandscape ? "-100px" : "-260px",
          marginBottom: isLandscape ? "-50px" : "-180px"
        }}>
            <div className="relative mb-0">
              <div className="absolute inset-0 rounded-full" style={{
            background: "radial-gradient(circle, #dadada 0%, rgba(218, 218, 218, 0.6) 15%, rgba(218, 218, 218, 0.3) 30%, rgba(218, 218, 218, 0.1) 50%, transparent 80%)",
            animation: "expand-gradient 6s ease-out infinite",
            filter: "blur(40px)",
            transform: "scale(1)"
          }} />
              <img src={witIcon} alt="WitAI" className="relative w-auto cursor-pointer" style={{
            height: isLandscape ? "60px" : isMobile ? "91px" : "136px",
            transition: "transform 0.6s ease-in-out",
            transformStyle: "preserve-3d",
            transform: isLogoFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
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
            <h1 className="mb-0.5 font-normal" style={{
          color: "#1a1a1a",
          fontSize: isLandscape ? "18px" : isMobile ? "25px" : "32px",
          textAlign: "center"
        }}>
              AI powered procurement platform
            </h1>
            {!isLandscape && <p className="mb-3 text-center" style={{
          color: "#666666",
          maxWidth: "480px",
          fontSize: isMobile ? "13px" : "14px"
        }}>Request your quotation to suppliers selected from a list of over 50,000 and manage your entire order - all in one platform</p>}
            
            <div className="flex flex-wrap justify-center gap-2 max-w-3xl" style={{
              marginTop: isLandscape ? "8px" : "0"
            }}>
              {(isMobile ? mobileSuggestionPills : suggestionPills).map((pill, idx) => <button key={idx} onClick={() => setInput(pill)} className="rounded-full transition-all hover:shadow-md" style={{
            background: "#ffffff",
            border: "1px solid #e0e0e0",
            color: "#1a1a1a",
            padding: isLandscape ? "5px 10px" : isMobile ? "7px 13px" : "11px 21px",
            fontSize: isLandscape ? "11px" : isMobile ? "13px" : "14px"
          }}>
                  {pill}
                </button>)}
            </div>
          </div> : <div className="flex-1 overflow-y-auto px-4 py-6" style={{
        paddingBottom: isMobile ? "120px" : "24px"
      }}>
            <div className="mx-auto max-w-3xl space-y-6">
              {messages.map((msg, idx) => <div key={idx}>
                  <div className="text-xs font-medium mb-1" style={{
              color: "#666666",
              textAlign: msg.role === "user" ? "right" : "left"
            }}>
                    {msg.role === "user" ? "ME" : "WIT AI"}
                  </div>
                  <div style={{
              display: "flex",
              justifyContent: msg.role === "user" ? "flex-end" : "flex-start"
            }}>
                    <div className="chat-bubble rounded-2xl max-w-[80%]" style={{
                padding: "14px 18px",
                lineHeight: "1.6",
                background: msg.role === "user" ? "#e8e8e8" : "transparent",
                color: msg.role === "user" ? "#1a1a1a" : "#4a4a4a"
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
                      background: "rgba(74, 144, 226, 0.2)"
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
                    margin: "8px 0"
                  }}>{children}</p>,
                  strong: ({
                    children
                  }) => <strong style={{
                    fontWeight: 600,
                    color: msg.role === "user" ? "#1a1a1a" : "#000000"
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
                    margin: "8px 0",
                    paddingLeft: "18px",
                    listStyleType: "disc",
                    display: "block"
                  }}>{children}</ul>,
                  li: ({
                    children
                  }) => <li style={{
                    lineHeight: "1.6",
                    marginBottom: "4px",
                    display: "list-item"
                  }}>{children}</li>,
                  h2: ({
                    children
                  }) => <h2 style={{
                    fontSize: "1.1rem",
                    fontWeight: 600,
                    marginTop: "10px",
                    color: msg.role === "user" ? "#1a1a1a" : "#000000"
                  }}>
                            {children}
                          </h2>,
                  h3: ({
                    children
                  }) => <h3 style={{
                    fontSize: "1rem",
                    fontWeight: 600,
                    marginTop: "8px",
                    color: msg.role === "user" ? "#1a1a1a" : "#000000"
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
                      {msg.content}
                    </ReactMarkdown>
                    </div>
                  </div>
                </div>)}
              {(isLoading || isTyping) && <div>
                  <div className="text-xs font-medium mb-1" style={{
              color: "#666666"
            }}>WIT AI</div>
                  {isLoading ? <div className="flex gap-1 text-left" style={{
              color: "#666666"
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
              padding: "14px 18px",
              lineHeight: "1.6",
              background: "transparent",
              color: "#4a4a4a"
            }}>
                      <ReactMarkdown remarkPlugins={[remarkGfm]} components={{
                p: ({
                  children
                }) => <p style={{
                  margin: "8px 0"
                }}>{children}</p>,
                strong: ({
                  children
                }) => <strong style={{
                  fontWeight: 600,
                  color: "#000000"
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
                  margin: "8px 0",
                  paddingLeft: "18px",
                  listStyleType: "disc",
                  display: "block"
                }}>{children}</ul>,
                li: ({
                  children
                }) => <li style={{
                  lineHeight: "1.6",
                  marginBottom: "4px",
                  display: "list-item"
                }}>{children}</li>,
                h2: ({
                  children
                }) => <h2 style={{
                  fontSize: "1.1rem",
                  fontWeight: 600,
                  marginTop: "10px",
                  color: "#000000"
                }}>
                              {children}
                            </h2>,
                h3: ({
                  children
                }) => <h3 style={{
                  fontSize: "1rem",
                  fontWeight: 600,
                  marginTop: "8px",
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
        {messages.length === 0 && !isLandscape && <div className="w-full px-4 pb-6" style={{ marginTop: "-60px", marginBottom: "50px" }}>
            <div className="mx-auto max-w-5xl">
              <h2 className="font-medium mb-4" style={{
            color: "#666666",
            fontSize: isMobile ? "17px" : "20px"
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
                  {popularRequests.map((request, idx) => <button key={idx} onClick={() => setInput(`Tell me about ${request.name}`)} className="flex-shrink-0 p-4 rounded-2xl transition-all hover:shadow-lg" style={{
              background: "#ffffff",
              border: "1px solid #e0e0e0",
              width: "134px",
              scrollSnapAlign: "start",
              textAlign: "left"
            }}>
                      <request.icon className="w-5 h-5 mb-11" style={{
                color: "#1a1a1a"
              }} />
                      <div className="text-xs font-medium" style={{
                color: "#666666"
              }}>{request.name}</div>
                    </button>)}
                </div> : <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                  {popularRequests.map((request, idx) => <button key={idx} onClick={() => setInput(`Tell me about ${request.name}`)} className="p-4 rounded-2xl transition-all hover:shadow-lg" style={{
              background: "#ffffff",
              border: "1px solid #e0e0e0",
              textAlign: "left",
              minWidth: "180px"
            }}>
                      <request.icon className="w-6 h-6 mb-14" style={{
                color: "#1a1a1a"
              }} />
                      <div className="text-xs font-medium" style={{
                color: "#666666"
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
          background: isMobile && messages.length === 0 ? "#f5f5f5" : "transparent",
          width: isMobile && messages.length === 0 ? "100%" : "auto"
        }}>
          {/* Input Area */}
          <div className="px-4 pb-6" style={isMobile && messages.length > 0 ? {
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 40,
        background: "#f5f5f5",
        paddingTop: "12px"
      } : {}}>
          <form onSubmit={sendMessage} className="mx-auto max-w-3xl">
            {selectedFiles.length > 0 && <div className="mb-2 flex flex-wrap gap-2">
                {selectedFiles.map((filePreview, index) => <div key={index} className="relative">
                    {filePreview.type === "image" ? <img src={filePreview.preview} alt="Preview" className="rounded-lg" style={{
                maxHeight: "100px",
                maxWidth: "100px"
              }} /> : <div className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{
                background: "#f0f0f0",
                minWidth: "150px"
              }}>
                        {filePreview.type === "pdf" && <FileText className="h-5 w-5" style={{
                  color: "#ff8c42"
                }} />}
                        {filePreview.type === "doc" && <FileText className="h-5 w-5" style={{
                  color: "#ff8c42"
                }} />}
                        {filePreview.type === "excel" && <FileSpreadsheet className="h-5 w-5" style={{
                  color: "#ff8c42"
                }} />}
                        {filePreview.type === "other" && <File className="h-5 w-5" style={{
                  color: "#ff8c42"
                }} />}
                        <span className="text-sm truncate" style={{
                  color: "#1a1a1a",
                  maxWidth: "100px"
                }}>
                          {filePreview.file.name}
                        </span>
                      </div>}
                    <button type="button" onClick={() => removeFile(index)} className="absolute -top-2 -right-2 rounded-full p-1" style={{
                background: "#5271ff"
              }}>
                      <X className="h-4 w-4" style={{
                  color: "#ffffff"
                }} />
                    </button>
                  </div>)}
              </div>}
            <div className="flex items-center gap-3 rounded-full px-4 py-3" style={{
            background: "#ffffff",
            border: "1px solid #d0d0d0"
          }}>
              <input type="file" ref={fileInputRef} onChange={handleFileSelect} accept="image/*,.pdf,.doc,.docx,.xls,.xlsx" multiple className="hidden" />
              <button type="button" onClick={() => fileInputRef.current?.click()} className="shrink-0">
                <Paperclip className="h-5 w-5" style={{
                color: "#ff8c42"
              }} />
              </button>
              <input value={input} onChange={e => setInput(e.target.value)} placeholder={isMobile ? "What's your project?" : "Ask me anything about your projects"} disabled={isLoading} className="flex-1 border-0 bg-transparent p-0 text-base focus:outline-none" style={{
              color: "#1a1a1a"
            }} />
              <button type="submit" disabled={isLoading || (!input.trim() && selectedFiles.length === 0)} className="shrink-0">
                <img src={sendButton} alt="Send" className="h-6 w-6" style={{
                  filter: 'brightness(0) saturate(100%) invert(37%) sepia(92%) saturate(2463%) hue-rotate(220deg) brightness(101%) contrast(101%)'
                }} />
              </button>
            </div>
          </form>
        </div>

        {/* Footer */}
        <footer className="border-t px-4 text-center" style={{
      borderColor: "#e0e0e0",
      color: "#999999",
      background: isMobile ? "transparent" : "#ffffff",
      paddingTop: isMobile ? "8px" : "12px",
      paddingBottom: isMobile ? "8px" : "12px",
      fontSize: isMobile ? "8px" : "11px",
      lineHeight: "1.2"
    }}>
        <span style={{
        whiteSpace: isMobile ? "nowrap" : "normal"
      }}>
          By messaging WitAI, you agree to our{" "}
          <a href="#" className="underline" style={{
          color: "#5271ff"
        }}>
            Terms
          </a>{" "}
          and have read our{" "}
          <a href="#" className="underline" style={{
          color: "#5271ff"
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