import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export const Navbar = () => {
  return (
    <motion.nav
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed top-0 left-0 right-0 z-50 glass border-b border-border/50"
    >
      <div className="container mx-auto px-6 py-4 flex items-center justify-between max-w-7xl">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
            <span className="text-primary font-bold text-lg">K</span>
          </div>
          <span className="text-xl font-bold text-foreground">Kelp</span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          <a href="#how-it-works" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            How it works
          </a>
          <a href="#why-kelp" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Why Kelp
          </a>
          <a href="#powered-by" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Powered by Yelp AI
          </a>
        </div>

        <Link to="/app">
          <Button variant="glow" size="sm">
            Plan my flow
          </Button>
        </Link>
      </div>
    </motion.nav>
  );
};
