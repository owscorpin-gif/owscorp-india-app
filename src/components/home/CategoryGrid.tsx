import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Globe, Smartphone, Monitor, Bot, Cloud, Code } from "lucide-react";
import { useNavigate } from "react-router-dom";

const categories = [
  {
    id: "websites",
    title: "Websites",
    description: "Professional web applications and sites",
    icon: Globe,
    platform: "website",
  },
  {
    id: "android",
    title: "Android Apps",
    description: "Native Android applications",
    icon: Smartphone,
    platform: "android",
  },
  {
    id: "ios",
    title: "iOS Apps",
    description: "Native iOS applications",
    icon: Smartphone,
    platform: "ios",
  },
  {
    id: "desktop",
    title: "Desktop Apps",
    description: "Windows, Mac, and Linux applications",
    icon: Monitor,
    platform: "desktop",
  },
  {
    id: "ai-services",
    title: "AI Services",
    description: "Agentic AI and automation tools",
    icon: Bot,
    platform: "ai",
  },
  {
    id: "cloud",
    title: "Cloud Solutions",
    description: "SaaS and cloud-based services",
    icon: Cloud,
    platform: "cloud",
  },
];

export const CategoryGrid = () => {
  const navigate = useNavigate();

  const handleCategoryClick = (platform: string) => {
    navigate(`/categories/${platform}`);
  };

  return (
    <section className="py-16 px-4 bg-background">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Browse by Platform</h2>
          <p className="text-muted-foreground text-lg">
            Find the perfect solution for your needs across all platforms
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <Card
                key={category.id}
                className="cursor-pointer transition-all hover:shadow-lg hover:scale-105 border-border"
                onClick={() => handleCategoryClick(category.platform)}
              >
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-lg bg-primary/10">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="text-xl">{category.title}</CardTitle>
                  </div>
                  <CardDescription className="mt-2">
                    {category.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};
