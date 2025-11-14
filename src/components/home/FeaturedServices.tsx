import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

interface Service {
  id: string;
  title: string;
  description: string;
  price: number;
  platform: string;
  category: string | null;
  preview_images: string[] | null;
}

export const FeaturedServices = () => {
  const navigate = useNavigate();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeaturedServices = async () => {
      try {
        const { data, error } = await supabase
          .from("services")
          .select("id, title, description, price, platform, category, preview_images")
          .eq("status", "published")
          .limit(3);

        if (error) throw error;
        setServices(data || []);
      } catch (error) {
        console.error("Error fetching featured services:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedServices();
  }, []);

  const handleServiceClick = (serviceId: string) => {
    navigate(`/service/${serviceId}`);
  };

  if (loading) {
    return (
      <section className="py-16 px-4 bg-secondary">
        <div className="max-w-7xl mx-auto flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 px-4 bg-secondary">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Featured Services</h2>
          <p className="text-muted-foreground text-lg">
            Handpicked solutions from top-rated developers
          </p>
        </div>

        {services.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">No services available yet. Check back soon!</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map((service) => (
                <Card key={service.id} className="flex flex-col">
                  <CardHeader>
                    <div className="aspect-video bg-muted rounded-md mb-4 overflow-hidden">
                      <img
                        src={service.preview_images?.[0] || "/placeholder.svg"}
                        alt={service.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-xl">{service.title}</CardTitle>
                      <Badge variant="secondary">{service.category || service.platform}</Badge>
                    </div>
                    <CardDescription>{service.description}</CardDescription>
                  </CardHeader>
                  <CardFooter className="flex items-center justify-between mt-auto">
                    <span className="text-2xl font-bold text-primary">${service.price}</span>
                    <Button onClick={() => handleServiceClick(service.id)}>
                      View Details
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>

            <div className="text-center mt-8">
              <Button variant="outline" size="lg" onClick={() => navigate("/categories/all")}>
                View All Services
              </Button>
            </div>
          </>
        )}
      </div>
    </section>
  );
};
