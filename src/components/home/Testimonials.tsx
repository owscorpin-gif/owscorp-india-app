import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";

interface Review {
  id: string;
  rating: number;
  review_text: string | null;
  created_at: string;
  is_anonymous: boolean;
  profiles: {
    display_name: string | null;
    avatar_url: string | null;
  } | null;
  services: {
    title: string;
  } | null;
}

export const Testimonials = () => {
  const [testimonials, setTestimonials] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        // Fetch positive reviews (4-5 stars) that are not anonymous
        const { data, error } = await supabase
          .from('reviews')
          .select(`
            id,
            rating,
            review_text,
            created_at,
            is_anonymous,
            services (
              title
            )
          `)
          .gte('rating', 4)
          .eq('is_anonymous', false)
          .not('review_text', 'is', null)
          .order('created_at', { ascending: false })
          .limit(6);

        if (error) {
          console.error('Error fetching testimonials:', error);
        } else if (data) {
          // Fetch profile data separately for each review
          const reviewsWithProfiles = await Promise.all(
            data.map(async (review: any) => {
              const { data: profileData } = await supabase
                .from('profiles')
                .select('display_name, avatar_url')
                .eq('id', review.customer_id)
                .maybeSingle();
              
              return {
                ...review,
                profiles: profileData,
              };
            })
          );
          setTestimonials(reviewsWithProfiles);
        }
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTestimonials();
  }, []);

  if (loading) {
    return (
      <section className="py-16 px-4 bg-background">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">What Our Customers Say</h2>
            <p className="text-muted-foreground text-lg">
              Join thousands of satisfied customers who found their perfect solution
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse border-border">
                <CardContent className="pt-6">
                  <div className="h-20 bg-muted rounded mb-4" />
                  <div className="h-4 bg-muted rounded w-3/4" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (testimonials.length === 0) {
    return null;
  }

  return (
    <section className="py-16 px-4 bg-background">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">What Our Customers Say</h2>
          <p className="text-muted-foreground text-lg">
            Join thousands of satisfied customers who found their perfect solution
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((testimonial) => (
            <Card key={testimonial.id} className="border-border">
              <CardContent className="pt-6">
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-accent text-accent" />
                  ))}
                </div>
                <p className="text-foreground mb-6 italic">"{testimonial.review_text || "Great service!"}"</p>
                {testimonial.services && (
                  <p className="text-sm text-muted-foreground mb-4">
                    Service: {testimonial.services.title}
                  </p>
                )}
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage 
                      src={testimonial.profiles?.avatar_url || undefined} 
                      alt={testimonial.profiles?.display_name || 'Customer'} 
                    />
                    <AvatarFallback>
                      {(testimonial.profiles?.display_name || 'C')[0].toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold">
                      {testimonial.profiles?.display_name || 'Valued Customer'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(testimonial.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
