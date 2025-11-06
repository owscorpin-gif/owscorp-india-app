import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet";
import { Navbar } from "@/components/home/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Star, Search, SlidersHorizontal } from "lucide-react";

// Mock data - will be replaced with Supabase data
const mockServices = [
  {
    id: "1",
    title: "E-Commerce Website Template",
    description: "A fully responsive e-commerce website template with shopping cart and payment integration",
    price: 299,
    rating: 4.8,
    reviews: 127,
    category: "Website",
    platform: "website",
    image: "/placeholder.svg"
  },
  {
    id: "2",
    title: "Mobile E-Commerce App",
    description: "iOS and Android app for your online store with native features",
    price: 399,
    rating: 4.7,
    reviews: 89,
    category: "Mobile App",
    platform: "android",
    image: "/placeholder.svg"
  },
  {
    id: "3",
    title: "AI Chatbot Integration",
    description: "Intelligent chatbot for customer service and lead generation",
    price: 249,
    rating: 4.9,
    reviews: 234,
    category: "AI Service",
    platform: "website",
    image: "/placeholder.svg"
  },
  {
    id: "4",
    title: "Social Media Management App",
    description: "Schedule and manage posts across multiple social platforms",
    price: 179,
    rating: 4.6,
    reviews: 156,
    category: "Desktop App",
    platform: "windows",
    image: "/placeholder.svg"
  },
  {
    id: "5",
    title: "Inventory Management System",
    description: "Track and manage your product inventory with real-time updates",
    price: 199,
    rating: 4.7,
    reviews: 98,
    category: "Website",
    platform: "website",
    image: "/placeholder.svg"
  },
  {
    id: "6",
    title: "Fitness Tracker iOS App",
    description: "Native iOS app for tracking workouts and nutrition",
    price: 149,
    rating: 4.8,
    reviews: 203,
    category: "Mobile App",
    platform: "ios",
    image: "/placeholder.svg"
  }
];

const platformOptions = [
  { value: "all", label: "All Platforms" },
  { value: "website", label: "Websites" },
  { value: "android", label: "Android Apps" },
  { value: "ios", label: "iOS Apps" },
  { value: "windows", label: "Windows Apps" },
  { value: "mac", label: "Mac Apps" },
  { value: "linux", label: "Linux Apps" }
];

const categoryOptions = [
  { value: "all", label: "All Categories" },
  { value: "Website", label: "Websites" },
  { value: "Mobile App", label: "Mobile Apps" },
  { value: "Desktop App", label: "Desktop Apps" },
  { value: "AI Service", label: "AI Services" }
];

const SearchResults = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  const [sortBy, setSortBy] = useState("newest");
  const [selectedPlatform, setSelectedPlatform] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [minRating, setMinRating] = useState(0);
  const [showFilters, setShowFilters] = useState(true);

  useEffect(() => {
    const query = searchParams.get("q");
    if (query) {
      setSearchQuery(query);
    }
  }, [searchParams]);

  // Filter and sort services
  const filteredServices = mockServices.filter(service => {
    const matchesSearch = searchQuery === "" || 
      service.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      service.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesPlatform = selectedPlatform === "all" || service.platform === selectedPlatform;
    const matchesCategory = selectedCategory === "all" || service.category === selectedCategory;
    const matchesPrice = service.price >= priceRange[0] && service.price <= priceRange[1];
    const matchesRating = service.rating >= minRating;

    return matchesSearch && matchesPlatform && matchesCategory && matchesPrice && matchesRating;
  }).sort((a, b) => {
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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setSearchParams({ q: searchQuery });
    }
  };

  const handleServiceClick = (serviceId: string) => {
    navigate(`/service/${serviceId}`);
  };

  const searchSuggestions = ["E-Commerce", "AI Chatbot", "Mobile App", "Website Template", "Automation Tool"];

  return (
    <>
      <Helmet>
        <title>{searchQuery ? `Search Results for "${searchQuery}"` : "Search Services"} - OWSCORP</title>
        <meta
          name="description"
          content={`Find the perfect digital solution. Search through our marketplace of websites, mobile apps, desktop applications, and AI services.`}
        />
      </Helmet>

      <div className="min-h-screen bg-background">
        <Navbar />

        <main className="container mx-auto px-4 py-8">
          {/* Search Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-4">
              {searchQuery ? `Search Results for "${searchQuery}"` : "Search Services"}
            </h1>
            
            {/* Search Bar */}
            <form onSubmit={handleSearch} className="flex gap-2 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search for services, apps, or solutions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button type="submit">Search</Button>
            </form>

            {/* Search Suggestions */}
            {!searchQuery && (
              <div className="flex flex-wrap gap-2">
                <span className="text-sm text-muted-foreground">Popular searches:</span>
                {searchSuggestions.map((suggestion) => (
                  <Button
                    key={suggestion}
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSearchQuery(suggestion);
                      setSearchParams({ q: suggestion });
                    }}
                  >
                    {suggestion}
                  </Button>
                ))}
              </div>
            )}
          </div>

          <div className="grid lg:grid-cols-4 gap-6">
            {/* Filters Sidebar */}
            <aside className={`lg:col-span-1 space-y-6 ${showFilters ? 'block' : 'hidden lg:block'}`}>
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Filters</CardTitle>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSortBy("newest");
                        setSelectedPlatform("all");
                        setSelectedCategory("all");
                        setPriceRange([0, 1000]);
                        setMinRating(0);
                      }}
                    >
                      Reset
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Sort By */}
                  <div className="space-y-2">
                    <Label>Sort By</Label>
                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="newest">Newest First</SelectItem>
                        <SelectItem value="rating">Highest Rated</SelectItem>
                        <SelectItem value="price-low">Price: Low to High</SelectItem>
                        <SelectItem value="price-high">Price: High to Low</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Platform Filter */}
                  <div className="space-y-2">
                    <Label>Platform</Label>
                    <Select value={selectedPlatform} onValueChange={setSelectedPlatform}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {platformOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Category Filter */}
                  <div className="space-y-2">
                    <Label>Category</Label>
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {categoryOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Price Range */}
                  <div className="space-y-3">
                    <Label>Price Range: ${priceRange[0]} - ${priceRange[1]}</Label>
                    <Slider
                      min={0}
                      max={1000}
                      step={50}
                      value={priceRange}
                      onValueChange={setPriceRange}
                      className="w-full"
                    />
                  </div>

                  {/* Minimum Rating */}
                  <div className="space-y-3">
                    <Label>Minimum Rating: {minRating} stars</Label>
                    <Slider
                      min={0}
                      max={5}
                      step={0.5}
                      value={[minRating]}
                      onValueChange={(value) => setMinRating(value[0])}
                      className="w-full"
                    />
                  </div>
                </CardContent>
              </Card>
            </aside>

            {/* Results Grid */}
            <div className="lg:col-span-3">
              {/* Results Header */}
              <div className="flex items-center justify-between mb-6">
                <p className="text-muted-foreground">
                  {filteredServices.length} {filteredServices.length === 1 ? 'result' : 'results'} found
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowFilters(!showFilters)}
                  className="lg:hidden"
                >
                  <SlidersHorizontal className="h-4 w-4 mr-2" />
                  Filters
                </Button>
              </div>

              {/* Services Grid */}
              {filteredServices.length > 0 ? (
                <div className="grid sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                  {filteredServices.map((service) => (
                    <Card
                      key={service.id}
                      className="cursor-pointer hover:shadow-lg transition-shadow"
                      onClick={() => handleServiceClick(service.id)}
                    >
                      <div className="aspect-video bg-muted">
                        <img
                          src={service.image}
                          alt={service.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <CardHeader>
                        <div className="flex items-start justify-between gap-2">
                          <CardTitle className="text-lg line-clamp-1">{service.title}</CardTitle>
                          <Badge variant="secondary" className="shrink-0">
                            {service.category}
                          </Badge>
                        </div>
                        <CardDescription className="line-clamp-2">
                          {service.description}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 fill-accent text-accent" />
                            <span className="font-medium">{service.rating}</span>
                            <span className="text-sm text-muted-foreground">
                              ({service.reviews})
                            </span>
                          </div>
                          <span className="text-xl font-bold">${service.price}</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                // No Results State
                <Card className="p-12 text-center">
                  <div className="max-w-md mx-auto space-y-4">
                    <Search className="h-16 w-16 mx-auto text-muted-foreground" />
                    <h3 className="text-xl font-semibold">No results found</h3>
                    <p className="text-muted-foreground">
                      We couldn't find any services matching your search criteria. Try adjusting your filters or search terms.
                    </p>
                    <div className="pt-4">
                      <h4 className="font-medium mb-3">You might be interested in:</h4>
                      <div className="grid gap-3">
                        {mockServices.slice(0, 3).map((service) => (
                          <button
                            key={service.id}
                            onClick={() => handleServiceClick(service.id)}
                            className="text-left p-3 border rounded-lg hover:bg-muted transition-colors"
                          >
                            <p className="font-medium">{service.title}</p>
                            <p className="text-sm text-muted-foreground">${service.price}</p>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </Card>
              )}
            </div>
          </div>
        </main>
      </div>
    </>
  );
};

export default SearchResults;
