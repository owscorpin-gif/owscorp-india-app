import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { Download, Settings, Package, History } from "lucide-react";

interface PurchasedService {
  id: string;
  purchased_at: string;
  service: {
    id: string;
    title: string;
    description: string;
    preview_images: string[];
    app_file_url: string | null;
    platform: string;
    price: number;
  };
}

const CustomerDashboard = () => {
  const navigate = useNavigate();
  const [purchases, setPurchases] = useState<PurchasedService[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }
      fetchPurchases();
    };

    checkAuth();
  }, [navigate]);

  const fetchPurchases = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("purchases")
        .select(`
          id,
          purchased_at,
          service:services (
            id,
            title,
            description,
            preview_images,
            app_file_url,
            platform,
            price
          )
        `)
        .eq("customer_id", user.id)
        .order("purchased_at", { ascending: false });

      if (error) throw error;
      setPurchases(data as any);
    } catch (error) {
      console.error("Error fetching purchases:", error);
      toast.error("Failed to load your purchases");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (appFileUrl: string | null, serviceTitle: string) => {
    if (!appFileUrl) {
      toast.error("No download file available for this service");
      return;
    }

    try {
      // Get signed URL for private download
      const { data, error } = await supabase.storage
        .from("service-files")
        .createSignedUrl(appFileUrl, 60); // 60 seconds validity

      if (error) throw error;

      // Open download link
      window.open(data.signedUrl, "_blank");
      toast.success(`Downloading ${serviceTitle}...`);
    } catch (error) {
      console.error("Download error:", error);
      toast.error("Failed to download file. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold">My Dashboard</h1>
            <p className="text-muted-foreground mt-2">Manage your purchased services and account</p>
          </div>
          <Button variant="outline" onClick={() => navigate("/profile")}>
            <Settings className="mr-2 h-4 w-4" />
            Account Settings
          </Button>
        </div>

        <Tabs defaultValue="services" className="space-y-6">
          <TabsList>
            <TabsTrigger value="services">
              <Package className="mr-2 h-4 w-4" />
              My Services
            </TabsTrigger>
            <TabsTrigger value="history">
              <History className="mr-2 h-4 w-4" />
              Order History
            </TabsTrigger>
          </TabsList>

          <TabsContent value="services" className="space-y-4">
            {purchases.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-16">
                  <Package className="h-16 w-16 text-muted-foreground mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No Services Yet</h3>
                  <p className="text-muted-foreground mb-6">Start exploring our marketplace to find the perfect solutions for your needs.</p>
                  <Button onClick={() => navigate("/")}>Browse Services</Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6 md:grid-cols-2">
                {purchases.map((purchase) => (
                  <Card key={purchase.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle>{purchase.service.title}</CardTitle>
                          <CardDescription className="mt-2">
                            {purchase.service.platform} • Purchased {new Date(purchase.purchased_at).toLocaleDateString()}
                          </CardDescription>
                        </div>
                        {purchase.service.preview_images?.[0] && (
                          <img 
                            src={purchase.service.preview_images[0]} 
                            alt={purchase.service.title}
                            className="w-16 h-16 rounded object-cover ml-4"
                          />
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {purchase.service.description}
                      </p>
                      <div className="flex gap-2">
                        <Button 
                          onClick={() => handleDownload(purchase.service.app_file_url, purchase.service.title)}
                          className="flex-1"
                        >
                          <Download className="mr-2 h-4 w-4" />
                          Download
                        </Button>
                        <Button 
                          variant="outline"
                          onClick={() => navigate(`/service/${purchase.service.id}`)}
                        >
                          View Details
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle>Purchase History</CardTitle>
                <CardDescription>Complete record of all your transactions</CardDescription>
              </CardHeader>
              <CardContent>
                {purchases.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No purchase history available
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Service</TableHead>
                        <TableHead>Platform</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {purchases.map((purchase) => (
                        <TableRow key={purchase.id}>
                          <TableCell>
                            {new Date(purchase.purchased_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="font-medium">
                            {purchase.service.title}
                          </TableCell>
                          <TableCell>{purchase.service.platform}</TableCell>
                          <TableCell className="text-right">
                            ${purchase.service.price.toFixed(2)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default CustomerDashboard;
