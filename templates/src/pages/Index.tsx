import { useState } from "react";
import ModernPortfolio from "@/components/templates/ModernPortfolio";
import MinimalPortfolio from "@/components/templates/MinimalPortfolio";
import DarkPortfolio from "@/components/templates/DarkPortfolio";
import { samplePortfolioData } from "@/data/samplePortfolio";
import { Sparkles, Minus, Moon } from "lucide-react";

type Theme = "modern" | "minimal" | "dark";

const themes: { id: Theme; label: string; icon: React.ReactNode; desc: string }[] = [
  { id: "modern", label: "Modern", icon: <Sparkles className="w-4 h-4" />, desc: "Vibrant gradients & rounded cards" },
  { id: "minimal", label: "Minimal", icon: <Minus className="w-4 h-4" />, desc: "Clean whitespace & editorial feel" },
  { id: "dark", label: "Dark", icon: <Moon className="w-4 h-4" />, desc: "Developer portfolio aesthetic" },
];

const Index = () => {
  const [activeTheme, setActiveTheme] = useState<Theme>("modern");

  return (
    <div className="relative">
      {/* Theme Switcher Bar */}
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-1 p-1 rounded-full bg-white/80 backdrop-blur-xl shadow-lg border border-black/5">
        {themes.map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTheme(t.id)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all ${
              activeTheme === t.id
                ? "bg-black text-white shadow-sm"
                : "text-gray-500 hover:text-gray-900 hover:bg-gray-100"
            }`}
            title={t.desc}
          >
            {t.icon}
            <span className="hidden sm:inline">{t.label}</span>
          </button>
        ))}
      </div>

      {/* Template */}
      {activeTheme === "modern" && <ModernPortfolio portfolioData={samplePortfolioData} />}
      {activeTheme === "minimal" && <MinimalPortfolio portfolioData={samplePortfolioData} />}
      {activeTheme === "dark" && <DarkPortfolio portfolioData={samplePortfolioData} />}
    </div>
  );
};

export default Index;
