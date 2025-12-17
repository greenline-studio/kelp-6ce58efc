import { motion } from "framer-motion";
import { Shield, Zap, Database, Star } from "lucide-react";

const features = [
  {
    icon: Database,
    title: "Real-time Data",
    description: "Live business hours, ratings, and availability",
  },
  {
    icon: Star,
    title: "Trusted Reviews",
    description: "Millions of authentic user reviews and photos",
  },
  {
    icon: Zap,
    title: "AI-Powered",
    description: "Intelligent reasoning over local business data",
  },
  {
    icon: Shield,
    title: "Verified Info",
    description: "Accurate addresses, contacts, and attributes",
  },
];

export const PoweredByYelpSection = () => {
  return (
    <section id="powered-by" className="py-24 relative">
      <div className="container mx-auto px-6 max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-3 mb-6">
            <span className="text-2xl sm:text-3xl font-bold">Powered by</span>
            <div className="px-4 py-2 rounded-lg bg-[#FF1A1A]/10 border border-[#FF1A1A]/20">
              <span className="text-2xl sm:text-3xl font-bold text-[#FF1A1A]">
                Yelp
              </span>
              <span className="text-lg sm:text-xl font-medium text-[#FF1A1A]/80 ml-1">
                AI API
              </span>
            </div>
          </div>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Kelp leverages Yelp's powerful AI API to access millions of local
            businesses, real-time information, and intelligent search capabilities.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="glass-card p-6 text-center"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <feature.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
