import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Complaint {
  id: string;
  rating: number;
  review_text: string | null;
  created_at: string;
  service: {
    title: string;
    id: string;
  };
  customer: {
    display_name: string;
  } | null;
}

export default function DeveloperComplaints() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // First get all reviews that are complaints
      const { data: allReviews, error: reviewsError } = await supabase
        .from("reviews")
        .select(`
          id,
          rating,
          review_text,
          created_at,
          service_id,
          customer_id
        `)
        .eq("is_complaint", true)
        .order("created_at", { ascending: false });

      if (reviewsError) throw reviewsError;

      if (!allReviews || allReviews.length === 0) {
        setComplaints([]);
        return;
      }

      // Get services for this developer
      const { data: services, error: servicesError } = await supabase
        .from("services")
        .select("id, title, developer_id")
        .eq("developer_id", user.id);

      if (servicesError) throw servicesError;

      const serviceIds = services?.map(s => s.id) || [];
      
      // Filter reviews to only those for this developer's services
      const developerReviews = allReviews.filter(r => serviceIds.includes(r.service_id));

      // Get customer profiles
      const customerIds = developerReviews.map(r => r.customer_id).filter(Boolean);
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, display_name")
        .in("id", customerIds);

      // Combine the data
      const complaintsData = developerReviews.map(review => {
        const service = services?.find(s => s.id === review.service_id);
        const customer = profiles?.find(p => p.id === review.customer_id);
        return {
          ...review,
          service: { title: service?.title || "Unknown Service", id: service?.id || "" },
          customer: customer ? { display_name: customer.display_name } : null
        };
      });

      setComplaints(complaintsData);
    } catch (error) {
      console.error("Error fetching complaints:", error);
      toast({
        title: "Error",
        description: "Failed to load complaints",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/4"></div>
          <div className="h-32 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 mb-20 md:mb-0">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Customer Complaints</h1>
        <p className="text-muted-foreground">
          Review and address customer feedback for your services
        </p>
      </div>

      {complaints.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center text-muted-foreground">
            No complaints found. Great job maintaining quality!
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {complaints.map((complaint) => (
            <Card key={complaint.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">
                      {complaint.service?.title || "Unknown Service"}
                    </CardTitle>
                    <CardDescription>
                      {complaint.customer?.display_name || "Anonymous"} •{" "}
                      {new Date(complaint.created_at).toLocaleDateString()}
                    </CardDescription>
                  </div>
                  <Badge variant="destructive" className="flex items-center gap-1">
                    <Star className="h-3 w-3 fill-current" />
                    {complaint.rating}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm">
                  {complaint.review_text || "No review text provided"}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
