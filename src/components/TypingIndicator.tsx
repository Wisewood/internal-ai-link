import { Bot } from "lucide-react";

const TypingIndicator = () => {
  return (
    <div className="flex gap-4 p-6 bg-muted/50 animate-in fade-in duration-300">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-accent text-white">
        <Bot className="h-4 w-4" />
      </div>
      <div className="flex-1 space-y-2">
        <p className="text-sm font-medium">Assistant</p>
        <div className="flex gap-1">
          <span className="h-2 w-2 animate-bounce rounded-full bg-primary [animation-delay:-0.3s]"></span>
          <span className="h-2 w-2 animate-bounce rounded-full bg-primary [animation-delay:-0.15s]"></span>
          <span className="h-2 w-2 animate-bounce rounded-full bg-primary"></span>
        </div>
      </div>
    </div>
  );
};

export default TypingIndicator;
