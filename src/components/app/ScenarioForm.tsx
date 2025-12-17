import { useState } from "react";
import { motion } from "framer-motion";
import { MapPin, Loader2, Sparkles, ArrowLeft, Users, Minus, Plus } from "lucide-react";
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
    crewSize: number;
  }) => void;
  isLoading: boolean;
}

const budgetOptions = [
  { label: "Econ", sublabel: "<$30", value: "$" },
  { label: "Standard", sublabel: "$30-60", value: "$$" },
  { label: "Premium", sublabel: "$60-100", value: "$$$" },
  { label: "Splurge", sublabel: "$100+", value: "$$$$" },
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
  const [crewSize, setCrewSize] = useState(2);
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
      crewSize,
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
          <label className="text-sm font-medium">Target Budget <span className="text-muted-foreground">(per person)</span></label>
          <div className="grid grid-cols-2 gap-3">
            {budgetOptions.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setBudget(opt.value)}
                className={`p-4 rounded-xl border-2 transition-all ${
                  budget === opt.value
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border/50 bg-card/50 hover:border-border"
                }`}
              >
                <div className="font-semibold text-lg">{opt.label}</div>
                <div className="text-sm text-muted-foreground">{opt.sublabel}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Crew Size */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Crew Size</label>
          <div className="flex items-center gap-4 p-4 rounded-xl border border-border/50 bg-card/50">
            <Users className="w-5 h-5 text-muted-foreground" />
            <div className="flex items-center gap-4 flex-1">
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => setCrewSize(Math.max(1, crewSize - 1))}
                className="h-8 w-8"
              >
                <Minus className="w-4 h-4" />
              </Button>
              <span className="text-xl font-semibold w-8 text-center">{crewSize}</span>
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => setCrewSize(Math.min(20, crewSize + 1))}
                className="h-8 w-8"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
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
