import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { Flow, FlowStop } from "@/pages/App";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

interface ChatPanelProps {
  flow: Flow | null;
  onUpdateFlow?: (updatedFlow: Flow) => void;
}

const quickActions = [
  "Make it cheaper",
  "More romantic spots",
  "Add outdoor options",
  "Shorter evening",
];

export const ChatPanel = ({ flow, onUpdateFlow }: ChatPanelProps) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: flow
        ? "Your flow is ready! Ask me to refine it – swap stops, change the vibe, adjust timing, or add more options."
        : "Hi! Describe your ideal outing and I'll help you plan it. Or use the form on the left to get started.",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Update initial message when flow changes
  useEffect(() => {
    if (flow && messages.length === 1 && messages[0].id === "1") {
      setMessages([{
        id: "1",
        role: "assistant",
        content: "Your flow is ready! Ask me to refine it – swap stops, change the vibe, adjust timing, or add more options.",
      }]);
    }
  }, [flow]);

  const handleSend = async (message: string) => {
    if (!message.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: message,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      // Build conversation history for context
      const conversationHistory = messages
        .filter(m => m.id !== "1") // Skip initial welcome message
        .map(m => ({ role: m.role, content: m.content }));

      const { data, error } = await supabase.functions.invoke("chat-assistant", {
        body: {
          message,
          flow,
          conversationHistory,
        },
      });

      if (error) {
        throw error;
      }

      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.message || "I apologize, I couldn't generate a response. Please try again.",
      };
      setMessages((prev) => [...prev, aiResponse]);

      // Apply flow changes if any
      if (data.flowChanges && flow && onUpdateFlow) {
        applyFlowChanges(data.flowChanges, flow);
      }
    } catch (error: any) {
      console.error("Chat error:", error);
      
      let errorMessage = "Sorry, I encountered an error. Please try again.";
      if (error.message?.includes("429") || error.status === 429) {
        errorMessage = "I'm receiving too many requests. Please wait a moment and try again.";
      } else if (error.message?.includes("402") || error.status === 402) {
        errorMessage = "AI credits exhausted. Please add credits to continue using the assistant.";
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });

      const errorResponse: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: errorMessage,
      };
      setMessages((prev) => [...prev, errorResponse]);
    } finally {
      setIsLoading(false);
    }
  };

  const applyFlowChanges = (flowChanges: any, currentFlow: Flow) => {
    if (!flowChanges || flowChanges.action !== "update_flow" || !onUpdateFlow) return;

    const changes = flowChanges.changes;
    let newStops = [...currentFlow.stops];

    // Handle swaps
    if (changes.swap && Array.isArray(changes.swap)) {
      changes.swap.forEach((swap: any) => {
        if (swap.stopIndex >= 0 && swap.stopIndex < newStops.length && swap.newStop) {
          const existingStop = newStops[swap.stopIndex];
          newStops[swap.stopIndex] = {
            id: existingStop.id,
            name: swap.newStop.name || existingStop.name,
            category: swap.newStop.category || existingStop.category,
            rating: swap.newStop.rating || existingStop.rating,
            price: swap.newStop.price || existingStop.price,
            reason: swap.newStop.reason || existingStop.reason,
            time: existingStop.time,
            duration: swap.newStop.duration || existingStop.duration,
            tags: swap.newStop.tags || existingStop.tags,
            yelpUrl: existingStop.yelpUrl,
            imageUrl: existingStop.imageUrl,
          };
        }
      });
    }

    // Handle removals
    if (changes.remove && Array.isArray(changes.remove)) {
      const removeIndices = new Set(changes.remove);
      newStops = newStops.filter((_, i) => !removeIndices.has(i));
    }

    // Calculate new total duration
    const totalDuration = newStops.reduce((sum, stop) => sum + stop.duration, 0);

    const updatedFlow: Flow = {
      ...currentFlow,
      stops: newStops,
      totalDuration,
    };

    onUpdateFlow(updatedFlow);
    
    toast({
      title: "Flow Updated",
      description: "I've made the changes to your itinerary.",
    });
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border/50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-primary" />
          </div>
          <h3 className="font-semibold text-sm">Kelp AI Assistant</h3>
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
                disabled={isLoading}
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
            disabled={isLoading}
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
