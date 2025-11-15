import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet";
import { Navbar } from "@/components/home/Navbar";
import { Footer } from "@/components/home/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Search, Loader2, Filter, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

interface Service {
  id: string;
  title: string;
  description: string;
  price: number;
  platform: string;
  category: string | null;
  preview_images: string[] | null;
}

const SearchResults = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000]);
  const [selectedPlatform, setSelectedPlatform] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("newest");
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const query = searchParams.get("q");
    if (query) {
      setSearchQuery(query);
    }
  }, [searchParams]);

  useEffect(() => {
    const fetchServices = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("services")
          .select("id, title, description, price, platform, category, preview_images")
          .eq("status", "published");

        if (error) throw error;
        setServices(data || []);
      } catch (error) {
        console.error("Error fetching services:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  // Filter and sort services
  const filteredServices = services
    .filter(service => {
      const query = searchQuery.toLowerCase();
      const matchesQuery = !query || (
        service.title.toLowerCase().includes(query) ||
        service.description.toLowerCase().includes(query) ||
        service.platform.toLowerCase().includes(query) ||
        (service.category && service.category.toLowerCase().includes(query))
      );
      const matchesPlatform = selectedPlatform === "all" || service.platform === selectedPlatform;
      const matchesPrice = service.price >= priceRange[0] && service.price <= priceRange[1];
      
      return matchesQuery && matchesPlatform && matchesPrice;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "price-low":
          return a.price - b.price;
        case "price-high":
          return b.price - a.price;
        case "name":
          return a.title.localeCompare(b.title);
        case "newest":
        default:
          return 0;
      }
    });

  const platforms = ["all", ...Array.from(new Set(services.map(s => s.platform)))];

  const clearFilters = () => {
    setPriceRange([0, 10000]);
    setSelectedPlatform("all");
    setSortBy("newest");
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setSearchParams({ q: searchQuery });
    }
  };

  const handleServiceClick = (serviceId: string) => {
    navigate(`/service/${serviceId}`);
  };

  return (
    <>
      <Helmet>
        <title>Search Results - OWSCORP Digital Solutions Marketplace</title>
        <meta
          name="description"
          content={`Search results for "${searchQuery}" - Find the perfect digital solution for your needs.`}
        />
      </Helmet>

      <div className="min-h-screen bg-background">
        <Navbar />
        
        <main className="max-w-7xl mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-6">Search Results</h1>
            
            <form onSubmit={handleSearch} className="relative mb-6">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search for services, apps, or solutions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-12"
              />
            </form>

            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-6">
              <p className="text-muted-foreground">
                {filteredServices.length} result{filteredServices.length !== 1 ? "s" : ""} found
                {searchQuery && ` for "${searchQuery}"`}
              </p>
              
              <div className="flex gap-2 items-center w-full sm:w-auto">
                <Sheet open={showFilters} onOpenChange={setShowFilters}>
                  <SheetTrigger asChild>
                    <Button variant="outline" className="gap-2">
                      <Filter className="h-4 w-4" />
                      Filters
                    </Button>
                  </SheetTrigger>
                  <SheetContent>
                    <SheetHeader>
                      <SheetTitle>Filter Services</SheetTitle>
                      <SheetDescription>
                        Refine your search with advanced filters
                      </SheetDescription>
                    </SheetHeader>
                    
                    <div className="space-y-6 mt-6">
                      <div className="space-y-2">
                        <Label>Platform</Label>
                        <Select value={selectedPlatform} onValueChange={setSelectedPlatform}>
                          <SelectTrigger>
                            <SelectValue placeholder="All platforms" />
                          </SelectTrigger>
                          <SelectContent>
                            {platforms.map(platform => (
                              <SelectItem key={platform} value={platform}>
                                {platform === "all" ? "All Platforms" : platform}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Price Range: ${priceRange[0]} - ${priceRange[1]}</Label>
                        <Slider
                          value={priceRange}
                          onValueChange={(value) => setPriceRange(value as [number, number])}
                          max={10000}
                          step={100}
                          className="mt-2"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Sort By</Label>
                        <Select value={sortBy} onValueChange={setSortBy}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="newest">Newest First</SelectItem>
                            <SelectItem value="price-low">Price: Low to High</SelectItem>
                            <SelectItem value="price-high">Price: High to Low</SelectItem>
                            <SelectItem value="name">Name: A to Z</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <Button onClick={clearFilters} variant="outline" className="w-full gap-2">
                        <X className="h-4 w-4" />
                        Clear Filters
                      </Button>
                    </div>
                  </SheetContent>
                </Sheet>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center min-h-[400px]">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredServices.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground text-lg">
                  No results found. Try adjusting your search query.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredServices.map(service => (
                <Card
                  key={service.id}
                  className="cursor-pointer transition-all hover:shadow-lg"
                  onClick={() => handleServiceClick(service.id)}
                >
                  <div className="p-6">
                    <div className="flex gap-6">
                      <div className="w-48 h-32 bg-muted rounded-md overflow-hidden flex-shrink-0">
                        <img
                          src={service.preview_images?.[0] || "/placeholder.svg"}
                          alt={service.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-start justify-between gap-4 mb-2">
                          <CardTitle className="text-xl">{service.title}</CardTitle>
                          <Badge variant="secondary">{service.category || service.platform}</Badge>
                        </div>
                        
                        <CardDescription className="line-clamp-2 mb-4">
                          {service.description}
                        </CardDescription>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-2xl font-bold text-primary">${service.price}</span>
                          <Button size="sm">View Details</Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </main>
        
        <Footer />
      </div>
    </>
  );
};

export default SearchResults;
