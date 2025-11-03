import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Session } from "@supabase/supabase-js";

const Index = () => {
  const [session, setSession] = useState<Session | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-secondary/10">
      <div className="text-center space-y-6 p-8">
        <h1 className="text-4xl font-bold mb-4">Welcome to OWSCORP</h1>
        <p className="text-lg text-muted-foreground">
          Online Web Solution & Corporation
        </p>
        <p className="text-muted-foreground">
          AI-powered marketplace for digital solutions
        </p>
        <div className="flex gap-4 justify-center mt-8">
          {session ? (
            <>
              <Button onClick={() => navigate("/profile")}>
                View Profile
              </Button>
              <Button variant="outline" onClick={() => supabase.auth.signOut()}>
                Sign Out
              </Button>
            </>
          ) : (
            <Button onClick={() => navigate("/auth")}>
              Get Started
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;
