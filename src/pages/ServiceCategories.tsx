import { useState, useEffect } from "react";
import { Helmet } from "react-helmet";
import { useParams, useNavigate } from "react-router-dom";
import { Navbar } from "@/components/home/Navbar";
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
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

const platformNames: { [key: string]: string } = {
  website: "Websites",
  android: "Android Apps",
  ios: "iOS Apps",
  desktop: "Desktop Apps",
  ai: "AI Services",
  cloud: "Cloud Solutions",
  all: "All Services",
};

const ServiceCategories = () => {
  const { platform } = useParams<{ platform: string }>();
  const navigate = useNavigate();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  const platformName = platformNames[platform || "all"] || "Services";

  useEffect(() => {
    const fetchServices = async () => {
      setLoading(true);
      try {
        let query = supabase
          .from("services")
          .select("id, title, description, price, platform, category, preview_images")
          .eq("status", "published");

        if (platform && platform !== "all") {
          query = query.eq("platform", platform);
        }

        const { data, error } = await query;

        if (error) throw error;
        setServices(data || []);
      } catch (error) {
        console.error("Error fetching services:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, [platform]);

  const handleServiceClick = (serviceId: string) => {
    navigate(`/service/${serviceId}`);
  };

  return (
    <>
      <Helmet>
        <title>{platformName} - OWSCORP Digital Solutions Marketplace</title>
        <meta
          name="description"
          content={`Browse ${platformName.toLowerCase()} from expert developers. Find the perfect solution for your needs.`}
        />
      </Helmet>

      <div className="min-h-screen bg-background">
        <Navbar />

        <main className="max-w-7xl mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">{platformName}</h1>
            <p className="text-muted-foreground">
              {services.length} service{services.length !== 1 ? "s" : ""} available
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center items-center min-h-[400px]">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : services.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg">No services found in this category.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map((service) => (
                <Card
                  key={service.id}
                  className="cursor-pointer transition-all hover:shadow-lg"
                  onClick={() => handleServiceClick(service.id)}
                >
                  <CardHeader>
                    <div className="aspect-video bg-muted rounded-md mb-4 overflow-hidden">
                      <img
                        src={service.preview_images?.[0] || "/placeholder.svg"}
                        alt={service.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-lg">{service.title}</CardTitle>
                      <Badge variant="secondary">{service.category || service.platform}</Badge>
                    </div>
                    <CardDescription className="line-clamp-2">
                      {service.description}
                    </CardDescription>
                  </CardHeader>
                  <CardFooter className="flex items-center justify-between">
                    <span className="text-xl font-bold text-primary">${service.price}</span>
                    <Button size="sm">View Details</Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </main>
      </div>
    </>
  );
};

export default ServiceCategories;
