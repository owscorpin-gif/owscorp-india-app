import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export const HeroSection = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <section className="relative bg-primary text-primary-foreground py-20 px-4 md:py-32">
      <div className="max-w-7xl mx-auto text-center space-y-8">
        <h1 className="text-4xl md:text-6xl font-bold leading-tight">
          Your AI-Powered Marketplace for Digital Solutions
        </h1>
        <p className="text-lg md:text-xl max-w-2xl mx-auto opacity-90">
          Connect with expert developers and find ready-made solutions for websites, 
          mobile apps, desktop applications, and AI services.
        </p>
        
        <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search for services, apps, or solutions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-12 bg-background text-foreground"
              />
            </div>
            <Button type="submit" size="lg" variant="secondary">
              Search
            </Button>
          </div>
        </form>

        <div className="flex flex-wrap gap-4 justify-center">
          <Button size="lg" className="bg-accent hover:bg-accent/90">
            Browse Services
          </Button>
          <Button size="lg" variant="outline" className="bg-transparent border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary">
            Talk to AI Assistant
          </Button>
        </div>
      </div>
    </section>
  );
};
