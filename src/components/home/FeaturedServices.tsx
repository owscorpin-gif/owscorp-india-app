import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star } from "lucide-react";
import { useNavigate } from "react-router-dom";

// Mock data - will be replaced with real Supabase data later
const featuredServices = [
  {
    id: "1",
    title: "E-Commerce Starter Kit",
    description: "Full-featured online store with payment integration",
    price: "$299",
    rating: 4.8,
    reviews: 124,
    category: "Website",
    image: "/placeholder.svg",
  },
  {
    id: "2",
    title: "AI Chatbot Assistant",
    description: "Intelligent chatbot with natural language processing",
    price: "$199",
    rating: 4.9,
    reviews: 89,
    category: "AI Service",
    image: "/placeholder.svg",
  },
  {
    id: "3",
    title: "Task Management App",
    description: "Cross-platform productivity application",
    price: "$149",
    rating: 4.7,
    reviews: 156,
    category: "Mobile App",
    image: "/placeholder.svg",
  },
];

export const FeaturedServices = () => {
  const navigate = useNavigate();

  const handleServiceClick = (serviceId: string) => {
    navigate(`/service/${serviceId}`);
  };

  return (
    <section className="py-16 px-4 bg-secondary">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Featured Services</h2>
          <p className="text-muted-foreground text-lg">
            Handpicked solutions from top-rated developers
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredServices.map((service) => (
            <Card key={service.id} className="flex flex-col">
              <CardHeader>
                <div className="aspect-video bg-muted rounded-md mb-4 overflow-hidden">
                  <img
                    src={service.image}
                    alt={service.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-xl">{service.title}</CardTitle>
                  <Badge variant="secondary">{service.category}</Badge>
                </div>
                <CardDescription>{service.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex-1">
                <div className="flex items-center gap-2 text-sm">
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-accent text-accent" />
                    <span className="font-medium">{service.rating}</span>
                  </div>
                  <span className="text-muted-foreground">({service.reviews} reviews)</span>
                </div>
              </CardContent>
              <CardFooter className="flex items-center justify-between">
                <span className="text-2xl font-bold text-primary">{service.price}</span>
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
      </div>
    </section>
  );
};
