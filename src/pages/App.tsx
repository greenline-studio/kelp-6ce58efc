import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { ScenarioForm } from "@/components/app/ScenarioForm";
import { FlowTimeline } from "@/components/app/FlowTimeline";
import { ChatPanel } from "@/components/app/ChatPanel";
import { FlowSummaryBar } from "@/components/app/FlowSummaryBar";
import { Menu, X, MessageCircle, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface FlowStop {
  id: string;
  name: string;
  category: string;
  rating: number;
  price: string;
  reason: string;
  time: string;
  duration: number;
  tags: string[];
  yelpUrl?: string;
  imageUrl?: string;
}

export interface Flow {
  id: string;
  stops: FlowStop[];
  totalDuration: number;
  budgetRange: string;
}

const AppPage = () => {
  const [flow, setFlow] = useState<Flow | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [mobileTab, setMobileTab] = useState<"plan" | "chat">("plan");
  const [showChat, setShowChat] = useState(true);
  const { toast } = useToast();

  const handleGenerateFlow = async (scenario: {
    location: string;
    description: string;
    budget: string;
    timeWindow: string;
    vibes: string[];
    crewSize?: number;
  }) => {
    setIsGenerating(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('generate-flow', {
        body: {
          location: scenario.location,
          description: scenario.description,
          budget: scenario.budget,
          timeWindow: scenario.timeWindow,
          vibes: scenario.vibes,
          crewSize: scenario.crewSize || 2,
        },
      });

      if (error) {
        console.error('Error generating flow:', error);
        toast({
          title: "Error",
          description: "Failed to generate your flow. Please try again.",
          variant: "destructive",
        });
        setIsGenerating(false);
        return;
      }

      if (data && data.stops) {
        const generatedFlow: Flow = {
          id: "flow-" + Date.now(),
          stops: data.stops,
          totalDuration: data.totalDuration || 240,
          budgetRange: data.budgetRange || "$40-80 per person",
        };
        setFlow(generatedFlow);
        toast({
          title: "Flow Generated!",
          description: `Found ${data.stops.length} great spots for your outing.`,
        });
      } else {
        toast({
          title: "No Results",
          description: "No matching places found. Try a different location or preferences.",
          variant: "destructive",
        });
      }
    } catch (err) {
      console.error('Error:', err);
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleUpdateStop = (stopId: string, action: "swap" | "remove" | "moveUp" | "moveDown") => {
    if (!flow) return;
    
    const stopIndex = flow.stops.findIndex(s => s.id === stopId);
    if (stopIndex === -1) return;

    let newStops = [...flow.stops];

    switch (action) {
      case "remove":
        newStops = newStops.filter(s => s.id !== stopId);
        break;
      case "moveUp":
        if (stopIndex > 0) {
          [newStops[stopIndex - 1], newStops[stopIndex]] = [newStops[stopIndex], newStops[stopIndex - 1]];
        }
        break;
      case "moveDown":
        if (stopIndex < newStops.length - 1) {
          [newStops[stopIndex], newStops[stopIndex + 1]] = [newStops[stopIndex + 1], newStops[stopIndex]];
        }
        break;
      case "swap":
        // Mock swap - in real implementation would call API
        newStops[stopIndex] = {
          ...newStops[stopIndex],
          name: "The Garden Terrace",
          category: "Wine Bar",
          rating: 4.9,
          reason: "Swapped for more outdoor seating options",
          tags: ["Outdoor", "Wine Selection", "Garden"],
        };
        break;
    }

    setFlow({ ...flow, stops: newStops });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-border/50">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
              <span className="text-primary font-bold text-lg">K</span>
            </div>
            <span className="text-lg font-bold">Kelp</span>
          </Link>

          {/* Mobile tab toggle */}
          <div className="flex md:hidden items-center gap-2">
            <Button
              variant={mobileTab === "plan" ? "default" : "ghost"}
              size="sm"
              onClick={() => setMobileTab("plan")}
            >
              <MapPin className="w-4 h-4" />
            </Button>
            <Button
              variant={mobileTab === "chat" ? "default" : "ghost"}
              size="sm"
              onClick={() => setMobileTab("chat")}
            >
              <MessageCircle className="w-4 h-4" />
            </Button>
          </div>

          {/* Desktop chat toggle */}
          <Button
            variant="ghost"
            size="sm"
            className="hidden md:flex"
            onClick={() => setShowChat(!showChat)}
          >
            {showChat ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            <span className="ml-2">{showChat ? "Hide Chat" : "Show Chat"}</span>
          </Button>
        </div>
      </header>

      {/* Main content */}
      <main className="pt-16 min-h-screen">
        <div className="flex flex-col md:flex-row h-[calc(100vh-4rem)]">
          {/* Left panel - Flow */}
          <motion.div
            className={`flex-1 overflow-y-auto p-4 md:p-6 ${
              mobileTab !== "plan" ? "hidden md:block" : ""
            }`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="max-w-2xl mx-auto">
              {!flow ? (
                <ScenarioForm onSubmit={handleGenerateFlow} isLoading={isGenerating} />
              ) : (
                <div className="space-y-6">
                  <FlowSummaryBar
                    flow={flow}
                    onStartOver={() => setFlow(null)}
                  />
                  <FlowTimeline
                    stops={flow.stops}
                    onUpdateStop={handleUpdateStop}
                  />
                </div>
              )}
            </div>
          </motion.div>

          {/* Right panel - Chat */}
          <AnimatePresence>
            {(showChat || mobileTab === "chat") && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className={`w-full md:w-96 lg:w-[420px] border-l border-border/50 bg-card/30 ${
                  mobileTab !== "chat" ? "hidden md:block" : ""
                }`}
              >
                <ChatPanel flow={flow} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
};

export default AppPage;
