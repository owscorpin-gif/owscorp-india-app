import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { User, Menu, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User as SupabaseUser } from "@supabase/supabase-js";
import { useUserRole } from "@/hooks/useUserRole";

export const Navbar = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const { isDeveloper } = useUserRole();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setSearchQuery("");
    }
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <nav className="sticky top-0 z-50 bg-background border-b border-border">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <button
            onClick={() => navigate("/")}
            className="text-2xl font-bold text-primary hover:opacity-80 transition-opacity"
          >
            OWSCORP
          </button>
          <div className="hidden md:flex items-center gap-6">
            {/* Search Bar */}
            <form onSubmit={handleSearch} className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 w-64"
              />
            </form>

            <button
              onClick={() => navigate("/categories/all")}
              className="text-foreground hover:text-primary transition-colors"
            >
              Browse
            </button>
            <button
              onClick={() => navigate("/chat")}
              className="text-foreground hover:text-primary transition-colors"
            >
              AI Assistant
            </button>
            <button
              onClick={() => navigate("/support")}
              className="text-foreground hover:text-primary transition-colors"
            >
              Support
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              {isDeveloper && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate("/developer/dashboard")}
                >
                  Developer
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate("/profile")}
                className="gap-2"
              >
                <User className="h-4 w-4" />
                Profile
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/auth")}
              >
                Sign In
              </Button>
              <Button
                size="sm"
                onClick={() => navigate("/auth")}
              >
                Get Started
              </Button>
            </>
          )}
          <Button variant="ghost" size="sm" className="md:hidden">
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </nav>
  );
};
