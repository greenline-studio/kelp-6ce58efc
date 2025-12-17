import { motion } from "framer-motion";
import { Star, Clock, ExternalLink, ArrowUp, ArrowDown, RefreshCw, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { FlowStop } from "@/pages/App";

interface FlowTimelineProps {
  stops: FlowStop[];
  onUpdateStop: (stopId: string, action: "swap" | "remove" | "moveUp" | "moveDown") => void;
}

export const FlowTimeline = ({ stops, onUpdateStop }: FlowTimelineProps) => {
  return (
    <div className="relative space-y-4">
      {/* Timeline line */}
      <div className="absolute left-6 top-8 bottom-8 w-px bg-gradient-to-b from-primary via-primary/50 to-transparent" />

      {stops.map((stop, index) => (
        <motion.div
          key={stop.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1 }}
          className="relative"
        >
          {/* Stop number circle */}
          <div className="absolute left-0 top-6 w-12 h-12 rounded-full bg-primary flex items-center justify-center z-10">
            <span className="text-lg font-bold text-primary-foreground">
              {index + 1}
            </span>
          </div>

          {/* Card */}
          <div className="ml-16 glass-card p-5 group hover:glow-primary transition-all duration-300">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-lg font-semibold">{stop.name}</h3>
                  {stop.yelpUrl && (
                    <a
                      href={stop.yelpUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-primary transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">{stop.category}</p>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-primary fill-primary" />
                  <span className="font-medium">{stop.rating}</span>
                </div>
                <span className="text-muted-foreground">{stop.price}</span>
              </div>
            </div>

            <p className="text-sm text-muted-foreground mb-3 italic">
              "{stop.reason}"
            </p>

            <div className="flex items-center justify-between">
              <div className="flex gap-2 flex-wrap">
                {stop.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs px-2.5 py-1 rounded-full bg-secondary text-secondary-foreground"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="w-4 h-4" />
                <span>{stop.time}</span>
                <span className="text-xs">({stop.duration} min)</span>
              </div>
            </div>

            {/* Action buttons - visible on hover */}
            <div className="mt-4 pt-4 border-t border-border/50 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onUpdateStop(stop.id, "moveUp")}
                  disabled={index === 0}
                >
                  <ArrowUp className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onUpdateStop(stop.id, "moveDown")}
                  disabled={index === stops.length - 1}
                >
                  <ArrowDown className="w-4 h-4" />
                </Button>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onUpdateStop(stop.id, "swap")}
                >
                  <RefreshCw className="w-4 h-4 mr-1" />
                  Swap
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-destructive hover:text-destructive"
                  onClick={() => onUpdateStop(stop.id, "remove")}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};
