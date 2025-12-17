import { useState } from "react";
import { motion } from "framer-motion";
import { MapPin, Loader2, Sparkles, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useNavigate } from "react-router-dom";

interface ScenarioFormProps {
  onSubmit: (scenario: {
    location: string;
    description: string;
    budget: string;
    timeWindow: string;
    vibes: string[];
  }) => void;
  isLoading: boolean;
}

const budgetOptions = [
  { label: "$0-25", value: "$" },
  { label: "$25-50", value: "$$" },
  { label: "$50-100", value: "$$$" },
  { label: "$100+", value: "$$$$" },
];
const timeOptions = ["afternoon", "evening", "late night"];
const vibeOptions = [
  "romantic",
  "chill",
  "bougie",
  "adventurous",
  "family-friendly",
  "lively",
];
const preferenceOptions = [
  "vegetarian-friendly",
  "outdoor seating",
  "wheelchair accessible",
  "quiet",
  "walkable",
];

export const ScenarioForm = ({ onSubmit, isLoading }: ScenarioFormProps) => {
  const navigate = useNavigate();
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [budget, setBudget] = useState("$$");
  const [timeWindow, setTimeWindow] = useState("evening");
  const [vibes, setVibes] = useState<string[]>([]);
  const [preferences, setPreferences] = useState<string[]>([]);
  const [isGettingLocation, setIsGettingLocation] = useState(false);

  const handleGetLocation = () => {
    setIsGettingLocation(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation(`${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)}`);
          setIsGettingLocation(false);
        },
        () => {
          setIsGettingLocation(false);
        }
      );
    }
  };

  const toggleVibe = (vibe: string) => {
    setVibes((prev) =>
      prev.includes(vibe) ? prev.filter((v) => v !== vibe) : [...prev, vibe]
    );
  };

  const togglePreference = (pref: string) => {
    setPreferences((prev) =>
      prev.includes(pref) ? prev.filter((p) => p !== pref) : [...prev, pref]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      location,
      description,
      budget,
      timeWindow,
      vibes: [...vibes, ...preferences],
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/")}
          className="shrink-0"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="text-center flex-1">
          <h1 className="text-2xl sm:text-3xl font-bold">
            What's the <span className="text-gradient">vibe</span>?
          </h1>
          <p className="text-muted-foreground">
            Tell us about your ideal night out and we'll craft the perfect flow.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Location */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Location</label>
          <div className="flex gap-2">
            <Input
              placeholder="Enter city or address..."
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="flex-1"
            />
            <Button
              type="button"
              variant="outline"
              onClick={handleGetLocation}
              disabled={isGettingLocation}
            >
              {isGettingLocation ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <MapPin className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Description */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Describe your plan</label>
          <Textarea
            placeholder="E.g. Chill Saturday night: rooftop drinks + live music, under $50 per person..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="min-h-[100px] resize-none"
          />
        </div>

        {/* Budget */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Budget (per person)</label>
          <div className="flex gap-2 flex-wrap">
            {budgetOptions.map((opt) => (
              <Button
                key={opt.value}
                type="button"
                variant={budget === opt.value ? "default" : "outline"}
                size="sm"
                onClick={() => setBudget(opt.value)}
                className="flex-1 min-w-[70px]"
              >
                {opt.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Time Window */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Time of day</label>
          <div className="flex gap-2 flex-wrap">
            {timeOptions.map((opt) => (
              <Button
                key={opt}
                type="button"
                variant={timeWindow === opt ? "default" : "outline"}
                size="sm"
                onClick={() => setTimeWindow(opt)}
                className="capitalize"
              >
                {opt}
              </Button>
            ))}
          </div>
        </div>

        {/* Vibes */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Vibe</label>
          <div className="flex gap-2 flex-wrap">
            {vibeOptions.map((vibe) => (
              <Button
                key={vibe}
                type="button"
                variant={vibes.includes(vibe) ? "default" : "outline"}
                size="sm"
                onClick={() => toggleVibe(vibe)}
                className="capitalize"
              >
                {vibe}
              </Button>
            ))}
          </div>
        </div>

        {/* Preferences */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Preferences</label>
          <div className="flex gap-2 flex-wrap">
            {preferenceOptions.map((pref) => (
              <Button
                key={pref}
                type="button"
                variant={preferences.includes(pref) ? "secondary" : "outline"}
                size="sm"
                onClick={() => togglePreference(pref)}
                className="capitalize text-xs"
              >
                {pref}
              </Button>
            ))}
          </div>
        </div>

        {/* Submit */}
        <Button
          type="submit"
          variant="glow"
          size="lg"
          className="w-full"
          disabled={isLoading || !location || !description}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Crafting your flow...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              Generate my flow
            </>
          )}
        </Button>
      </form>
    </motion.div>
  );
};
