import { motion, AnimatePresence } from "framer-motion";
import { Star, MapPin, Clock, DollarSign } from "lucide-react";
import { useState, useEffect } from "react";

const flowStops = [
  {
    name: "The Velvet Room",
    category: "Cocktail Bar",
    rating: 4.7,
    price: "$$",
    why: "Intimate rooftop vibes, perfect to start",
    time: "7:00 PM",
    tags: ["Rooftop", "Craft Cocktails"],
  },
  {
    name: "Ember & Oak",
    category: "New American",
    rating: 4.8,
    price: "$$",
    why: "Romantic dinner, candlelit ambiance",
    time: "8:30 PM",
    tags: ["Date Night", "Farm-to-Table"],
  },
  {
    name: "Blue Note Jazz",
    category: "Jazz Club",
    rating: 4.6,
    price: "$$",
    why: "Live music to end the night right",
    time: "10:30 PM",
    tags: ["Live Music", "Intimate"],
  },
];

const altStop = {
  name: "The Garden Terrace",
  category: "Wine Bar",
  rating: 4.9,
  price: "$$",
  why: "Swapped for more outdoor seating",
  time: "7:00 PM",
  tags: ["Outdoor", "Wine Selection"],
};

export const HeroFlowPreview = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [showSwap, setShowSwap] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % flowStops.length);
    }, 2500);

    const swapInterval = setInterval(() => {
      setShowSwap(true);
      setTimeout(() => setShowSwap(false), 2000);
    }, 8000);

    return () => {
      clearInterval(interval);
      clearInterval(swapInterval);
    };
  }, []);

  return (
    <div className="relative mt-24 sm:mt-20">
      {/* Chat bubble */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.5 }}
        className="absolute -top-20 sm:-top-16 left-0 glass-card px-4 py-3 max-w-[300px] sm:max-w-[320px]"
      >
        <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
          "Cozy date night in Dallas, budget-friendly"
        </p>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
            <span className="text-primary text-xs font-bold">K</span>
          </div>
          <p className="text-sm text-foreground leading-relaxed">Here's your 3-stop flow ✨</p>
        </div>
      </motion.div>

      {/* Flow cards */}
      <div className="relative space-y-3 pt-10 sm:pt-8">
        {/* Vertical timeline line */}
        <div className="absolute left-6 top-12 bottom-4 w-px bg-gradient-to-b from-primary/50 via-primary/30 to-transparent" />

        <AnimatePresence mode="wait">
          {flowStops.map((stop, index) => {
            const isSwapping = showSwap && index === 0;
            const displayStop = isSwapping ? altStop : stop;

            return (
              <motion.div
                key={isSwapping ? "alt" : stop.name}
                initial={{ opacity: 0, x: 20 }}
                animate={{
                  opacity: 1,
                  x: 0,
                  scale: activeIndex === index ? 1.02 : 1,
                }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ delay: index * 0.15, duration: 0.4 }}
                className={`relative glass-card p-4 ml-10 transition-all duration-300 ${
                  activeIndex === index ? "glow-primary" : ""
                }`}
              >
                {/* Stop number */}
                <div className="absolute -left-10 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                  <span className="text-xs font-bold text-primary-foreground">
                    {index + 1}
                  </span>
                </div>

                {isSwapping && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="absolute -top-2 -right-2 bg-accent text-accent-foreground text-xs px-2 py-1 rounded-full"
                  >
                    Swapped!
                  </motion.div>
                )}

                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="font-semibold text-foreground">
                      {displayStop.name}
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      {displayStop.category}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 text-xs">
                    <Star className="w-3 h-3 text-primary fill-primary" />
                    <span className="text-foreground">{displayStop.rating}</span>
                    <span className="text-muted-foreground ml-1">
                      {displayStop.price}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-muted-foreground mb-2 italic">
                  "{displayStop.why}"
                </p>

                <div className="flex items-center justify-between">
                  <div className="flex gap-1.5">
                    {displayStop.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-[10px] px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    {displayStop.time}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
};
