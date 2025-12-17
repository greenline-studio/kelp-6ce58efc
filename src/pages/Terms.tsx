import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const Terms = () => {
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
        <h1 className="text-3xl font-bold mb-8">Terms of Service</h1>
        
        <div className="prose prose-invert prose-sm max-w-none space-y-6">
          <p className="text-muted-foreground">Last updated: December 2024</p>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold">Acceptance of Terms</h2>
            <p className="text-muted-foreground">
              By using Kelp, you agree to these terms of service. Kelp is a hackathon demonstration project 
              and is provided "as is" without warranties of any kind.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold">Description of Service</h2>
            <p className="text-muted-foreground">
              Kelp uses the Yelp AI API to help users discover and plan visits to local businesses. 
              We provide recommendations based on your preferences but do not guarantee the accuracy, 
              availability, or quality of the businesses suggested.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold">User Conduct</h2>
            <p className="text-muted-foreground">
              You agree to use Kelp for lawful purposes only and not to misuse the service or attempt 
              to access systems or data you are not authorized to access.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold">Disclaimer</h2>
            <p className="text-muted-foreground">
              Kelp is a hackathon project built for demonstration purposes. Business information is 
              provided by Yelp and may not be current. Always verify business details before visiting.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold">Limitation of Liability</h2>
            <p className="text-muted-foreground">
              Kelp and its creators shall not be liable for any damages arising from your use of 
              the service or reliance on information provided.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
};

export default Terms;
