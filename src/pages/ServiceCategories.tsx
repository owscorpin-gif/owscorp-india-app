import { Helmet } from "react-helmet";
import { useParams, useNavigate } from "react-router-dom";
import { Navbar } from "@/components/home/Navbar";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Star, Filter } from "lucide-react";
import { useState } from "react";

// Mock data - will be replaced with Supabase data later
const mockServices = [
  {
    id: "1",
    title: "E-Commerce Starter Kit",
    description: "Full-featured online store with payment integration",
    price: 299,
    rating: 4.8,
    reviews: 124,
    platform: "website",
    category: "Website",
    image: "/placeholder.svg",
  },
  {
    id: "2",
    title: "Portfolio Website Template",
    description: "Beautiful responsive portfolio for creatives",
    price: 99,
    rating: 4.6,
    reviews: 89,
    platform: "website",
    category: "Website",
    image: "/placeholder.svg",
  },
  {
    id: "3",
    title: "Fitness Tracking App",
    description: "Track workouts and nutrition with ease",
    price: 199,
    rating: 4.9,
    reviews: 156,
    platform: "android",
    category: "Mobile App",
    image: "/placeholder.svg",
  },
  {
    id: "4",
    title: "AI Chatbot Assistant",
    description: "Intelligent chatbot with natural language processing",
    price: 199,
    rating: 4.9,
    reviews: 89,
    platform: "ai",
    category: "AI Service",
    image: "/placeholder.svg",
  },
  {
    id: "5",
    title: "Task Management App",
    description: "Cross-platform productivity application",
    price: 149,
    rating: 4.7,
    reviews: 156,
    platform: "ios",
    category: "Mobile App",
    image: "/placeholder.svg",
  },
];

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
  const [sortBy, setSortBy] = useState("newest");
  const [priceRange, setPriceRange] = useState([0, 500]);
  const [minRating, setMinRating] = useState(0);

  const platformName = platformNames[platform || "all"] || "Services";

  // Filter services by platform
  let filteredServices = platform && platform !== "all" 
    ? mockServices.filter(s => s.platform === platform)
    : mockServices;

  // Apply filters
  filteredServices = filteredServices.filter(
    s => s.price >= priceRange[0] && s.price <= priceRange[1] && s.rating >= minRating
  );

  // Apply sorting
  const sortedServices = [...filteredServices].sort((a, b) => {
    switch (sortBy) {
      case "price-low":
        return a.price - b.price;
      case "price-high":
        return b.price - a.price;
      case "rating":
        return b.rating - a.rating;
      case "newest":
      default:
        return 0;
    }
  });

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
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">{platformName}</h1>
            <p className="text-muted-foreground">
              {sortedServices.length} service{sortedServices.length !== 1 ? "s" : ""} available
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Filters Sidebar */}
            <aside className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Filter className="h-5 w-5" />
                    Filters
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Sort By */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">Sort By</label>
                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="newest">Newest</SelectItem>
                        <SelectItem value="rating">Highest Rated</SelectItem>
                        <SelectItem value="price-low">Price: Low to High</SelectItem>
                        <SelectItem value="price-high">Price: High to Low</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Price Range */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Price Range: ${priceRange[0]} - ${priceRange[1]}
                    </label>
                    <Slider
                      min={0}
                      max={500}
                      step={10}
                      value={priceRange}
                      onValueChange={setPriceRange}
                      className="mt-2"
                    />
                  </div>

                  {/* Minimum Rating */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Minimum Rating: {minRating} stars
                    </label>
                    <Slider
                      min={0}
                      max={5}
                      step={0.5}
                      value={[minRating]}
                      onValueChange={(val) => setMinRating(val[0])}
                      className="mt-2"
                    />
                  </div>

                  {/* Reset Filters */}
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      setSortBy("newest");
                      setPriceRange([0, 500]);
                      setMinRating(0);
                    }}
                  >
                    Reset Filters
                  </Button>
                </CardContent>
              </Card>
            </aside>

            {/* Services Grid */}
            <div className="lg:col-span-3">
              {sortedServices.length === 0 ? (
                <Card className="p-12 text-center">
                  <p className="text-muted-foreground">
                    No services found matching your criteria. Try adjusting your filters.
                  </p>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {sortedServices.map((service) => (
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
                          <span className="text-muted-foreground">
                            ({service.reviews} reviews)
                          </span>
                        </div>
                      </CardContent>
                      <CardFooter className="flex items-center justify-between">
                        <span className="text-2xl font-bold text-primary">
                          ${service.price}
                        </span>
                        <Button onClick={() => handleServiceClick(service.id)}>
                          View Details
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              )}

              {/* Load More */}
              {sortedServices.length > 0 && (
                <div className="text-center mt-8">
                  <Button variant="outline" size="lg">
                    Load More Services
                  </Button>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </>
  );
};

export default ServiceCategories;
