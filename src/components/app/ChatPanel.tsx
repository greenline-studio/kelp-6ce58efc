import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Flow } from "@/pages/App";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

interface ChatPanelProps {
  flow: Flow | null;
}

const quickActions = [
  "Make it cheaper",
  "More romantic spots",
  "Add outdoor options",
  "Shorter evening",
];

export const ChatPanel = ({ flow }: ChatPanelProps) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: flow
        ? "Your flow is ready! Ask me to refine it – swap stops, change the vibe, adjust timing, or add more options."
        : "Hi! Describe your ideal outing and I'll create a personalized flow for you. Or use the form on the left to get started.",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = (message: string) => {
    if (!message.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: message,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    // Mock AI response - will be replaced with actual Yelp AI integration
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: getAIResponse(message, flow),
      };
      setMessages((prev) => [...prev, aiResponse]);
      setIsLoading(false);
    }, 1500);
  };

  const getAIResponse = (message: string, flow: Flow | null): string => {
    const lowerMessage = message.toLowerCase();

    if (lowerMessage.includes("cheaper") || lowerMessage.includes("budget")) {
      return "I've found some more budget-friendly alternatives! Try swapping 'Ember & Oak' with 'Luna Street Kitchen' - similar vibe, about 30% less expensive. Want me to make that change?";
    }
    if (lowerMessage.includes("romantic")) {
      return "For a more romantic atmosphere, I'd suggest adding 'The Secret Garden' - a hidden courtyard wine bar with string lights and live acoustic music. Perfect for that intimate feel!";
    }
    if (lowerMessage.includes("outdoor")) {
      return "Great choice! I can swap your first stop to 'The Garden Terrace' - they have a beautiful patio with city views. It's also pet-friendly if that matters!";
    }
    if (lowerMessage.includes("shorter") || lowerMessage.includes("quick")) {
      return "To shorten your evening, we could skip the jazz club and end dinner around 10PM. That would save about 90 minutes. Shall I update the flow?";
    }

    if (!flow) {
      return "Let's create your perfect night out! Tell me more about what you're in the mood for - what vibe are you going for? Who are you going with? Any budget or time constraints?";
    }

    return "I can help you refine your flow! Try asking me to make it cheaper, add more romantic spots, include outdoor options, or adjust the timing.";
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border/50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-sm">Kelp AI</h3>
            <p className="text-xs text-muted-foreground">Powered by Yelp AI</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <AnimatePresence>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className={`flex ${
                message.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                  message.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "glass-card"
                }`}
              >
                <p className="text-sm leading-relaxed">{message.content}</p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-start"
          >
            <div className="glass-card px-4 py-3 flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-primary" />
              <span className="text-sm text-muted-foreground">Thinking...</span>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick actions */}
      {flow && (
        <div className="px-4 pb-2">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {quickActions.map((action) => (
              <Button
                key={action}
                variant="outline"
                size="sm"
                className="shrink-0 text-xs"
                onClick={() => handleSend(action)}
              >
                {action}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="p-4 border-t border-border/50">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend(input);
          }}
          className="flex gap-2"
        >
          <Input
            placeholder="Refine your flow..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1"
          />
          <Button
            type="submit"
            variant="glow"
            size="icon"
            disabled={!input.trim() || isLoading}
          >
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </div>
  );
};
