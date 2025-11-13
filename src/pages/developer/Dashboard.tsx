import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Upload, Edit, Trash2, DollarSign, Package, Star, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function DeveloperDashboard() {
  const [services, setServices] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalServices: 0,
    totalRevenue: 0,
    avgRating: 0,
    totalComplaints: 0,
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: services, error: servicesError } = await supabase
        .from("services")
        .select("*")
        .eq("developer_id", user.id);

      if (servicesError) throw servicesError;
      setServices(services || []);

      const serviceIds = services?.map(s => s.id) || [];
      
      const purchases = await supabase
        .from("purchases")
        .select("service_id")
        .in("service_id", serviceIds);

      const totalRevenue = purchases.data?.reduce((sum: number, p: any) => {
        const service = services?.find((s: any) => s.id === p.service_id);
        return sum + (service?.price || 0);
      }, 0) || 0;

      const reviews = await supabase
        .from("reviews")
        .select("rating, service_id, is_complaint")
        .in("service_id", serviceIds);

      const avgRating = reviews.data && reviews.data.length > 0
        ? reviews.data.reduce((sum: number, r: any) => sum + r.rating, 0) / reviews.data.length
        : 0;

      const totalComplaints = reviews.data?.filter((r: any) => r.is_complaint === true).length || 0;

      setStats({
        totalServices: services?.length || 0,
        totalRevenue,
        avgRating: Number(avgRating.toFixed(1)),
        totalComplaints,
      });
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteService = async (id: string) => {
    try {
      const { error } = await supabase
        .from("services")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Service deleted successfully",
      });
      
      fetchDashboardData();
    } catch (error) {
      console.error("Error deleting service:", error);
      toast({
        title: "Error",
        description: "Failed to delete service",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return <div className="container mx-auto p-6">Loading...</div>;
  }

  return (
    <div className="container mx-auto p-6 mb-20 md:mb-0">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Developer Dashboard</h1>
        <Button onClick={() => navigate("/developer/upload")}>
          <Upload className="mr-2 h-4 w-4" />
          Upload Service
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Services</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalServices}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.totalRevenue.toFixed(2)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgRating}</div>
            <p className="text-xs text-muted-foreground">Out of 5 stars</p>
          </CardContent>
        </Card>

        <Card 
          className="cursor-pointer hover:border-primary transition-colors"
          onClick={() => navigate("/developer/complaints")}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Complaints</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalComplaints}</div>
            <p className="text-xs text-muted-foreground">Click to view details</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Services</CardTitle>
          <CardDescription>Manage your listed services</CardDescription>
        </CardHeader>
        <CardContent>
          {services.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No services yet. Upload your first service to get started!
            </p>
          ) : (
            <div className="space-y-4">
              {services.map((service) => (
                <div key={service.id} className="flex items-center justify-between border-b pb-4 last:border-0">
                  <div>
                    <h3 className="font-semibold">{service.title}</h3>
                    <p className="text-sm text-muted-foreground">{service.platform}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold">${service.price}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/developer/services/${service.id}`)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => deleteService(service.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
