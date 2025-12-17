import { Navbar } from "@/components/landing/Navbar";
import { HeroSection } from "@/components/landing/HeroSection";
import { HowItWorksSection } from "@/components/landing/HowItWorksSection";
import { WhyDifferentSection } from "@/components/landing/WhyDifferentSection";
import { PoweredByYelpSection } from "@/components/landing/PoweredByYelpSection";
import { Footer } from "@/components/landing/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <HeroSection />
      <HowItWorksSection />
      <WhyDifferentSection />
      <PoweredByYelpSection />
      <Footer />
    </div>
  );
};

export default Index;
