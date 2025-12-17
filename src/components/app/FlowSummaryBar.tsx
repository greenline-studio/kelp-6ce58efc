import { motion } from "framer-motion";
import { Clock, DollarSign, MapPin, Share2, Save, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import type { Flow } from "@/pages/App";

interface FlowSummaryBarProps {
  flow: Flow;
  onStartOver: () => void;
}

export const FlowSummaryBar = ({ flow, onStartOver }: FlowSummaryBarProps) => {
  const { toast } = useToast();

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/flow/${flow.id}`;
    
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast({
        title: "Link copied!",
        description: "Share this link with your friends.",
      });
    } catch {
      toast({
        title: "Sharing",
        description: shareUrl,
      });
    }
  };

  const handleSave = () => {
    // Save to localStorage for now
    const savedFlows = JSON.parse(localStorage.getItem("kelp_flows") || "[]");
    savedFlows.push({ ...flow, savedAt: new Date().toISOString() });
    localStorage.setItem("kelp_flows", JSON.stringify(savedFlows));
    
    toast({
      title: "Flow saved!",
      description: "You can access it from your profile.",
    });
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-4"
    >
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Stats */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="w-4 h-4 text-primary" />
            <span className="text-muted-foreground">{flow.stops.length} stops</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Clock className="w-4 h-4 text-primary" />
            <span className="text-muted-foreground">
              {formatDuration(flow.totalDuration)}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <DollarSign className="w-4 h-4 text-primary" />
            <span className="text-muted-foreground">{flow.budgetRange}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={onStartOver}>
            <RotateCcw className="w-4 h-4 mr-1" />
            Start over
          </Button>
          <Button variant="outline" size="sm" onClick={handleSave}>
            <Save className="w-4 h-4 mr-1" />
            Save
          </Button>
          <Button variant="glow" size="sm" onClick={handleShare}>
            <Share2 className="w-4 h-4 mr-1" />
            Share
          </Button>
        </div>
      </div>
    </motion.div>
  );
};
