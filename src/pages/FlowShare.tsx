import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Star, Clock, ExternalLink, ArrowLeft, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

// Mock data - in production would fetch from API
const mockFlow = {
  id: "flow-123",
  stops: [
    {
      id: "1",
      name: "The Velvet Room",
      category: "Cocktail Bar",
      rating: 4.7,
      price: "$$",
      reason: "Perfect rooftop vibes to start your evening",
      time: "7:00 PM",
      duration: 60,
      tags: ["Rooftop", "Craft Cocktails"],
    },
    {
      id: "2",
      name: "Ember & Oak",
      category: "New American",
      rating: 4.8,
      price: "$$",
      reason: "Romantic candlelit dinner",
      time: "8:30 PM",
      duration: 90,
      tags: ["Romantic", "Farm-to-Table"],
    },
    {
      id: "3",
      name: "Blue Note Jazz",
      category: "Jazz Club",
      rating: 4.6,
      price: "$$",
      reason: "End the night with live jazz",
      time: "10:30 PM",
      duration: 90,
      tags: ["Live Music", "Intimate"],
    },
  ],
};

const FlowShare = () => {
  const { id } = useParams();
  const { toast } = useToast();

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link copied!",
        description: "Share this flow with your friends.",
      });
    } catch {
      toast({
        title: "Copy this link",
        description: window.location.href,
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 glass border-b border-border/50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between max-w-3xl">
          <Link to="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Back to Kelp</span>
          </Link>

          <Button variant="outline" size="sm" onClick={handleCopyLink}>
            <Copy className="w-4 h-4 mr-2" />
            Copy link
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          {/* Title */}
          <div className="text-center space-y-2">
            <h1 className="text-2xl sm:text-3xl font-bold">
              A <span className="text-gradient">perfect evening</span> awaits
            </h1>
            <p className="text-muted-foreground">
              3 curated stops · ~4 hours · $$ budget
            </p>
          </div>

          {/* Timeline */}
          <div className="relative space-y-4">
            <div className="absolute left-6 top-8 bottom-8 w-px bg-gradient-to-b from-primary via-primary/50 to-transparent" />

            {mockFlow.stops.map((stop, index) => (
              <motion.div
                key={stop.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.15 }}
                className="relative"
              >
                <div className="absolute left-0 top-6 w-12 h-12 rounded-full bg-primary flex items-center justify-center z-10">
                  <span className="text-lg font-bold text-primary-foreground">
                    {index + 1}
                  </span>
                </div>

                <div className="ml-16 glass-card p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-lg font-semibold">{stop.name}</h3>
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
                    <div className="flex gap-2">
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
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* CTA */}
          <div className="text-center pt-8">
            <p className="text-muted-foreground mb-4">Want to create your own flow?</p>
            <Link to="/app">
              <Button variant="glow" size="lg">
                Plan my flow
              </Button>
            </Link>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default FlowShare;
