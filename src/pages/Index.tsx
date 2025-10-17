import { useState, useRef, useEffect } from "react";
import { Paperclip, Mic, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { supabase } from "@/integrations/supabase/client";
import logo from "@/assets/logo.png";

interface Message {
  role: "user" | "bot";
  content: string;
  imageUrl?: string;
}

const Index = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
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

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadImage = async (file: File): Promise<string | null> => {
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${crypto.randomUUID()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError, data } = await supabase.storage
        .from("chat-images")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("chat-images")
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      console.error("Error uploading image:", error);
      toast({
        title: "Upload Error",
        description: "Failed to upload image",
        variant: "destructive",
      });
      return null;
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = input.trim();
    if ((!text && !selectedImage) || isLoading) return;

    let imageUrl: string | null = null;
    
    // Upload image if selected
    if (selectedImage) {
      imageUrl = await uploadImage(selectedImage);
      if (!imageUrl) return; // Stop if upload failed
    }

    // Add user message with image
    setMessages(prev => [...prev, { role: "user", content: text || "📷 Image", imageUrl: imageUrl || undefined }]);
    setInput("");
    removeImage();
    setIsLoading(true);

    try {
      // Prepare chat input with hidden image URL
      let chatInput = text;
      if (imageUrl) {
        chatInput = text ? `${text}\n[Image: ${imageUrl}]` : `[Image: ${imageUrl}]`;
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
            <Button variant="ghost" size="icon">
              <Menu className="h-6 w-6" style={{ color: "#ececec" }} />
            </Button>
          </SheetTrigger>
          <SheetContent style={{ background: "#2f2f2f", borderColor: "#565656" }}>
            <nav className="flex flex-col gap-4 mt-8">
              {menuLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-lg px-4 py-2 rounded-lg transition-colors"
                  style={{ color: "#ececec" }}
                  onMouseEnter={(e) => e.currentTarget.style.background = "#424242"}
                  onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                >
                  {link.name}
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
                    {msg.imageUrl && (
                      <img 
                        src={msg.imageUrl} 
                        alt="Uploaded" 
                        className="rounded-lg mb-2 max-w-full"
                        style={{ maxHeight: "200px" }}
                      />
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
            {imagePreview && (
              <div className="mb-2 relative inline-block">
                <img 
                  src={imagePreview} 
                  alt="Preview" 
                  className="rounded-lg"
                  style={{ maxHeight: "100px", maxWidth: "100px" }}
                />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute -top-2 -right-2 rounded-full p-1"
                  style={{ background: "#4a90e2" }}
                >
                  <X className="h-4 w-4" style={{ color: "#ececec" }} />
                </button>
              </div>
            )}
            <div className="flex items-center gap-3 rounded-full px-4 py-3" style={{ background: "#2f2f2f", border: "1px solid #565656" }}>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageSelect}
                accept="image/*"
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
