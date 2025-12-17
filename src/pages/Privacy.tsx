import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const Privacy = () => {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 glass border-b border-border/50">
        <div className="container mx-auto px-4 py-4 max-w-3xl">
          <Link to="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Back to Kelp</span>
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 max-w-3xl">
        <h1 className="text-3xl font-bold mb-8">Privacy Policy</h1>
        
        <div className="prose prose-invert prose-sm max-w-none space-y-6">
          <p className="text-muted-foreground">Last updated: December 2024</p>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold">Overview</h2>
            <p className="text-muted-foreground">
              Kelp is a hackathon project that helps users discover local businesses using the Yelp AI API. 
              We take your privacy seriously and collect minimal data necessary to provide our service.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold">Information We Collect</h2>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li>Location data (when you grant permission) to find nearby businesses</li>
              <li>Your search queries and preferences to personalize recommendations</li>
              <li>A locally-stored user ID for saving your flows (stored in your browser only)</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold">How We Use Your Data</h2>
            <p className="text-muted-foreground">
              Your data is used solely to provide personalized business recommendations through the Yelp AI API. 
              We do not sell, share, or monetize your personal information.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold">Third-Party Services</h2>
            <p className="text-muted-foreground">
              We use the Yelp AI API to power our recommendations. Please refer to Yelp's privacy policy 
              for information on how they handle data.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold">Contact</h2>
            <p className="text-muted-foreground">
              For questions about this privacy policy, please reach out through our GitHub repository.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
};

export default Privacy;
