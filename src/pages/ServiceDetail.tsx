import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet";
import { Navbar } from "@/components/home/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Star, ShoppingCart, MessageCircle, ArrowLeft } from "lucide-react";

// Mock data - will be replaced with Supabase data
const mockService = {
  id: "1",
  title: "E-Commerce Website Template",
  description: "A fully responsive e-commerce website template with shopping cart, payment integration, and admin dashboard. Built with React and Node.js.",
  longDescription: `This comprehensive e-commerce solution includes everything you need to launch your online store. Features include:

• Modern, responsive design that works on all devices
• Secure payment integration with Stripe and PayPal
• Product management system with categories and filters
• Shopping cart with persistent state
• User authentication and profile management
• Admin dashboard for managing products and orders
• Email notifications for orders and updates
• SEO-optimized pages for better search rankings
• Fast loading times and optimized performance`,
  price: 299,
  rating: 4.8,
  reviews: 127,
  category: "Website",
  platform: "website",
  images: [
    "/placeholder.svg",
    "/placeholder.svg",
    "/placeholder.svg",
    "/placeholder.svg"
  ],
  developer: {
    id: "dev1",
    name: "Sarah Johnson",
    avatar: "/placeholder.svg",
    rating: 4.9,
    totalSales: 342,
    bio: "Full-stack developer with 8+ years of experience in building scalable web applications."
  },
  features: [
    "Responsive Design",
    "Payment Integration",
    "Admin Dashboard",
    "User Authentication",
    "Product Management",
    "Order Tracking",
    "Email Notifications",
    "SEO Optimized"
  ],
  packages: [
    {
      name: "Basic",
      price: 299,
      features: ["Source Code", "Documentation", "30-day Support"]
    },
    {
      name: "Standard",
      price: 499,
      features: ["Everything in Basic", "Installation Support", "90-day Support", "Free Updates"]
    },
    {
      name: "Premium",
      price: 799,
      features: ["Everything in Standard", "Customization", "Lifetime Support", "Priority Updates"]
    }
  ],
  customerReviews: [
    {
      id: "1",
      userName: "Michael Chen",
      userAvatar: "/placeholder.svg",
      rating: 5,
      date: "2024-01-15",
      comment: "Excellent template! Easy to customize and well-documented. The developer was very helpful with my questions."
    },
    {
      id: "2",
      userName: "Emily Rodriguez",
      userAvatar: "/placeholder.svg",
      rating: 5,
      date: "2024-01-10",
      comment: "Great value for money. Saved me weeks of development time. Highly recommend!"
    },
    {
      id: "3",
      userName: "David Kim",
      userAvatar: "/placeholder.svg",
      rating: 4,
      date: "2024-01-05",
      comment: "Good quality code and design. Minor issues with setup but support was quick to help."
    }
  ]
};

const relatedServices = [
  {
    id: "2",
    title: "Mobile E-Commerce App",
    description: "iOS and Android app for your online store",
    price: 399,
    rating: 4.7,
    reviews: 89,
    image: "/placeholder.svg"
  },
  {
    id: "3",
    title: "Payment Gateway Integration",
    description: "Secure payment processing for your website",
    price: 149,
    rating: 4.9,
    reviews: 234,
    image: "/placeholder.svg"
  },
  {
    id: "4",
    title: "Inventory Management System",
    description: "Track and manage your product inventory",
    price: 199,
    rating: 4.6,
    reviews: 156,
    image: "/placeholder.svg"
  }
];

const ServiceDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedPackage, setSelectedPackage] = useState(0);

  const handlePurchase = () => {
    navigate(`/checkout/${id}`);
  };

  const handleContactDeveloper = () => {
    navigate("/chat");
  };

  return (
    <>
      <Helmet>
        <title>{mockService.title} - OWSCORP</title>
        <meta name="description" content={mockService.description} />
      </Helmet>

      <div className="min-h-screen bg-background">
        <Navbar />

        <main className="container mx-auto px-4 py-8">
          {/* Back Button */}
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="mb-6"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Column - Images and Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Image Gallery */}
              <Card>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {/* Main Image */}
                    <div className="aspect-video bg-muted rounded-lg overflow-hidden">
                      <img
                        src={mockService.images[selectedImage]}
                        alt={`${mockService.title} preview ${selectedImage + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Thumbnail Images */}
                    <div className="grid grid-cols-4 gap-2">
                      {mockService.images.map((image, index) => (
                        <button
                          key={index}
                          onClick={() => setSelectedImage(index)}
                          className={`aspect-video bg-muted rounded overflow-hidden border-2 transition-colors ${
                            selectedImage === index
                              ? "border-primary"
                              : "border-transparent hover:border-muted-foreground/20"
                          }`}
                        >
                          <img
                            src={image}
                            alt={`Thumbnail ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Description */}
              <Card>
                <CardHeader>
                  <CardTitle>About This Service</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground whitespace-pre-line">
                    {mockService.longDescription}
                  </p>
                </CardContent>
              </Card>

              {/* Features */}
              <Card>
                <CardHeader>
                  <CardTitle>Key Features</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {mockService.features.map((feature, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-accent" />
                        <span className="text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Customer Reviews */}
              <Card>
                <CardHeader>
                  <CardTitle>Customer Reviews</CardTitle>
                  <CardDescription>
                    {mockService.reviews} reviews • {mockService.rating} average rating
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {mockService.customerReviews.map((review) => (
                    <div key={review.id} className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage src={review.userAvatar} />
                            <AvatarFallback>{review.userName[0]}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{review.userName}</p>
                            <div className="flex items-center gap-2">
                              <div className="flex">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`h-4 w-4 ${
                                      i < review.rating
                                        ? "fill-accent text-accent"
                                        : "text-muted"
                                    }`}
                                  />
                                ))}
                              </div>
                              <span className="text-sm text-muted-foreground">
                                {new Date(review.date).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <p className="text-muted-foreground">{review.comment}</p>
                      <Separator />
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Purchase Section */}
            <div className="space-y-6">
              {/* Service Info */}
              <Card>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-2xl">{mockService.title}</CardTitle>
                      <Badge variant="secondary">{mockService.category}</Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < Math.floor(mockService.rating)
                              ? "fill-accent text-accent"
                              : "text-muted"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {mockService.rating} ({mockService.reviews} reviews)
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground">{mockService.description}</p>
                </CardContent>
              </Card>

              {/* Pricing Packages */}
              <Card>
                <CardHeader>
                  <CardTitle>Choose a Package</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {mockService.packages.map((pkg, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedPackage(index)}
                      className={`w-full p-4 border-2 rounded-lg text-left transition-colors ${
                        selectedPackage === index
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold">{pkg.name}</h4>
                        <span className="text-xl font-bold">${pkg.price}</span>
                      </div>
                      <ul className="space-y-1">
                        {pkg.features.map((feature, fIndex) => (
                          <li key={fIndex} className="text-sm text-muted-foreground flex items-center gap-2">
                            <div className="h-1.5 w-1.5 rounded-full bg-accent" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </button>
                  ))}
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <div className="space-y-3">
                <Button onClick={handlePurchase} className="w-full" size="lg">
                  <ShoppingCart className="mr-2 h-5 w-5" />
                  Purchase Now - ${mockService.packages[selectedPackage].price}
                </Button>
                <Button
                  onClick={handleContactDeveloper}
                  variant="outline"
                  className="w-full"
                  size="lg"
                >
                  <MessageCircle className="mr-2 h-5 w-5" />
                  Contact Developer
                </Button>
              </div>

              {/* Developer Info */}
              <Card>
                <CardHeader>
                  <CardTitle>About the Developer</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-start gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={mockService.developer.avatar} />
                      <AvatarFallback>{mockService.developer.name[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h4 className="font-semibold">{mockService.developer.name}</h4>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                        <Star className="h-4 w-4 fill-accent text-accent" />
                        <span>{mockService.developer.rating} rating</span>
                        <span>•</span>
                        <span>{mockService.developer.totalSales} sales</span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-2">
                        {mockService.developer.bio}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Related Services */}
          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-6">Related Services</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedServices.map((service) => (
                <Card
                  key={service.id}
                  className="cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => navigate(`/service/${service.id}`)}
                >
                  <div className="aspect-video bg-muted">
                    <img
                      src={service.image}
                      alt={service.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <CardHeader>
                    <CardTitle className="text-lg">{service.title}</CardTitle>
                    <CardDescription>{service.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-accent text-accent" />
                        <span className="text-sm font-medium">{service.rating}</span>
                        <span className="text-sm text-muted-foreground">
                          ({service.reviews})
                        </span>
                      </div>
                      <span className="text-lg font-bold">${service.price}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </main>
      </div>
    </>
  );
};

export default ServiceDetail;
