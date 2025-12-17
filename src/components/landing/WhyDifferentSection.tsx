import { motion } from "framer-motion";
import { X, Check, Star, Clock, Lightbulb } from "lucide-react";

export const WhyDifferentSection = () => {
  return (
    <section id="why-kelp" className="py-24 relative">
      <div className="absolute inset-0 hero-gradient opacity-50" />
      
      <div className="container mx-auto px-6 max-w-7xl relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Why <span className="text-gradient">Kelp</span> is different
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Stop scrolling through endless lists. Get a curated experience.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Generic Search */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="glass-card p-6 border-destructive/20"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center">
                <X className="w-5 h-5 text-destructive" />
              </div>
              <h3 className="text-lg font-semibold">Generic Search</h3>
            </div>

            <div className="space-y-4">
              {[
                "20+ random results to scroll through",
                "No context about your actual plans",
                "Manual research for each place",
                "Hope the timing works out",
                "No personalized recommendations",
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <X className="w-4 h-4 text-destructive/60 mt-0.5 shrink-0" />
                  <span className="text-sm text-muted-foreground">{item}</span>
                </div>
              ))}
            </div>

            <div className="mt-6 p-4 bg-secondary/50 rounded-lg">
              <div className="space-y-2">
                {["Restaurant A", "Restaurant B", "Restaurant C", "...17 more"].map(
                  (name, i) => (
                    <div
                      key={i}
                      className="h-8 bg-muted/50 rounded flex items-center px-3"
                    >
                      <span className="text-xs text-muted-foreground">{name}</span>
                    </div>
                  )
                )}
              </div>
            </div>
          </motion.div>

          {/* Kelp */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="glass-card p-6 border-primary/20 glow-primary"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Check className="w-5 h-5 text-primary" />
              </div>
              <h3 className="text-lg font-semibold">Kelp Flow</h3>
            </div>

            <div className="space-y-4">
              {[
                "3-5 curated stops, perfectly sequenced",
                "AI understands your exact scenario",
                "Reasons why each place fits your vibe",
                "Smart timing built into the flow",
                "Refine with natural conversation",
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <Check className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                  <span className="text-sm text-foreground">{item}</span>
                </div>
              ))}
            </div>

            <div className="mt-6 p-4 bg-primary/5 rounded-lg border border-primary/20">
              <div className="space-y-3">
                {[
                  { name: "The Velvet Room", tag: "Start here", icon: Star },
                  { name: "Ember & Oak", tag: "Dinner", icon: Lightbulb },
                  { name: "Blue Note Jazz", tag: "End night", icon: Clock },
                ].map((stop, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-2 bg-card/50 rounded"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                        <span className="text-xs text-primary font-bold">{i + 1}</span>
                      </div>
                      <span className="text-sm font-medium">{stop.name}</span>
                    </div>
                    <span className="text-xs text-primary">{stop.tag}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
