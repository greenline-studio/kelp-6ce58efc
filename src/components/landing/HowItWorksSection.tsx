import { motion } from "framer-motion";
import { MessageSquare, Cpu, MapPin } from "lucide-react";

const steps = [
  {
    icon: MessageSquare,
    title: "Describe your plan",
    description:
      "Tell us your vibe, budget, time window, and who you're with. Natural language, no forms.",
  },
  {
    icon: Cpu,
    title: "Kelp chats with Yelp AI",
    description:
      "Our AI reasons over real-time Yelp data to find the perfect sequence of stops.",
  },
  {
    icon: MapPin,
    title: "Get a smart, bookable flow",
    description:
      "Receive 2-5 curated stops with timing, reasons, and one-tap booking where available.",
  },
];

export const HowItWorksSection = () => {
  return (
    <section id="how-it-works" className="py-24 relative">
      <div className="container mx-auto px-6 max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            How <span className="text-gradient">Kelp</span> works
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            From idea to itinerary in three simple steps
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.15 }}
              className="relative"
            >
              {/* Connector line */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-12 left-1/2 w-full h-px bg-gradient-to-r from-primary/50 to-transparent" />
              )}

              <div className="glass-card p-8 text-center relative z-10 h-full">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-6">
                  <step.icon className="w-7 h-7 text-primary" />
                </div>
                <div className="absolute -top-3 -left-3 w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                  <span className="text-sm font-bold text-primary-foreground">
                    {index + 1}
                  </span>
                </div>
                <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {step.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
