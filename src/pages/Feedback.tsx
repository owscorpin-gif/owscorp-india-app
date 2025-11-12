import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Star, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

const feedbackSchema = z.object({
  rating: z.number().min(1, "Please select a rating").max(5),
  review_text: z.string().trim().max(2000, "Review must be less than 2000 characters").optional(),
  is_anonymous: z.boolean().default(false),
});

type FeedbackFormValues = z.infer<typeof feedbackSchema>;

const Feedback = () => {
  const { serviceId } = useParams<{ serviceId: string }>();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [service, setService] = useState<any>(null);
  const [hasPurchased, setHasPurchased] = useState(false);
  const [existingReview, setExistingReview] = useState<any>(null);

  const form = useForm<FeedbackFormValues>({
    resolver: zodResolver(feedbackSchema),
    defaultValues: {
      rating: 0,
      review_text: "",
      is_anonymous: false,
    },
  });

  const rating = form.watch("rating");

  useEffect(() => {
    const checkPurchaseAndLoadData = async () => {
      if (!serviceId) return;

      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error("Please log in to submit feedback");
        navigate("/auth");
        return;
      }

      // Check if user purchased this service
      const { data: purchase } = await supabase
        .from("purchases")
        .select("*")
        .eq("service_id", serviceId)
        .eq("customer_id", user.id)
        .maybeSingle();

      if (!purchase) {
        toast.error("You can only review services you've purchased");
        navigate("/dashboard");
        return;
      }

      setHasPurchased(true);

      // Load service details
      const { data: serviceData } = await supabase
        .from("services")
        .select("*")
        .eq("id", serviceId)
        .single();

      setService(serviceData);

      // Check if user already submitted a review
      const { data: review } = await supabase
        .from("reviews")
        .select("*")
        .eq("service_id", serviceId)
        .eq("customer_id", user.id)
        .maybeSingle();

      if (review) {
        setExistingReview(review);
        form.setValue("rating", review.rating);
        form.setValue("review_text", review.review_text || "");
        form.setValue("is_anonymous", review.is_anonymous);
      }
    };

    checkPurchaseAndLoadData();
  }, [serviceId, navigate, form]);

  const onSubmit = async (data: FeedbackFormValues) => {
    if (!serviceId) return;
    
    setIsSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error("Please log in to submit feedback");
        navigate("/auth");
        return;
      }

      const reviewData = {
        service_id: serviceId,
        customer_id: user.id,
        rating: data.rating,
        review_text: data.review_text || null,
        is_anonymous: data.is_anonymous,
      };

      let reviewId: string | null = null;

      if (existingReview) {
        // Update existing review
        const { data: updatedData, error: updateError } = await supabase
          .from("reviews")
          .update(reviewData)
          .eq("id", existingReview.id)
          .select()
          .single();
        
        if (updateError) throw updateError;
        reviewId = existingReview.id;
      } else {
        // Create new review
        const { data: newData, error: insertError } = await supabase
          .from("reviews")
          .insert(reviewData)
          .select()
          .single();
        
        if (insertError) throw insertError;
        reviewId = newData?.id || null;
      }

      // Call edge function to handle notification routing
      if (reviewId) {
        try {
          const { error: notificationError } = await supabase.functions.invoke(
            'handle-review-notification',
            {
              body: { reviewId },
            }
          );

          if (notificationError) {
            console.error('Notification error:', notificationError);
          }
        } catch (notifError) {
          console.error('Failed to send notification:', notifError);
        }
      }

      setIsSuccess(true);
      toast.success(existingReview ? "Review updated successfully!" : "Thank you for your feedback!");

      // Redirect after a delay
      setTimeout(() => {
        navigate("/dashboard");
      }, 2000);
    } catch (error: any) {
      console.error("Error submitting feedback:", error);
      toast.error("Failed to submit feedback. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center">
          <CardHeader>
            <div className="flex justify-center mb-4">
              <CheckCircle className="h-16 w-16 text-green-500" />
            </div>
            <CardTitle>Feedback Submitted!</CardTitle>
            <CardDescription>
              {rating <= 2 
                ? "We're sorry to hear about your experience. Our team will review your feedback and reach out to you soon."
                : "Thank you for your positive feedback! Your review helps other customers make informed decisions."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate("/dashboard")} className="w-full">
              Return to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!hasPurchased || !service) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center">
          <CardHeader>
            <CardTitle>Loading...</CardTitle>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-foreground">
            {existingReview ? "Update Your Review" : "Share Your Feedback"}
          </h1>
          <p className="text-muted-foreground mt-2">Help others by sharing your experience</p>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Service Info */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-xl">{service.title}</CardTitle>
            <CardDescription>{service.platform}</CardDescription>
          </CardHeader>
        </Card>

        {/* Feedback Form */}
        <Card>
          <CardHeader>
            <CardTitle>Your Review</CardTitle>
            <CardDescription>
              Share your thoughts about this service
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Star Rating */}
                <FormField
                  control={form.control}
                  name="rating"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Rating *</FormLabel>
                      <FormControl>
                        <div className="flex gap-2">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => field.onChange(star)}
                              onMouseEnter={() => setHoveredRating(star)}
                              onMouseLeave={() => setHoveredRating(0)}
                              className="transition-transform hover:scale-110"
                            >
                              <Star
                                className={cn(
                                  "h-10 w-10 transition-colors",
                                  (hoveredRating >= star || rating >= star)
                                    ? "fill-yellow-400 text-yellow-400"
                                    : "text-muted-foreground"
                                )}
                              />
                            </button>
                          ))}
                        </div>
                      </FormControl>
                      <FormDescription>
                        {rating === 0 && "Click to rate this service"}
                        {rating === 1 && "Poor - Did not meet expectations"}
                        {rating === 2 && "Fair - Below average experience"}
                        {rating === 3 && "Good - Met expectations"}
                        {rating === 4 && "Very Good - Exceeded expectations"}
                        {rating === 5 && "Excellent - Outstanding service!"}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Written Review */}
                <FormField
                  control={form.control}
                  name="review_text"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Your Review (Optional)</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Tell us about your experience with this service..."
                          className="min-h-[120px]"
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>
                        {field.value?.length || 0} / 2000 characters
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Anonymous Option */}
                <FormField
                  control={form.control}
                  name="is_anonymous"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>
                          Submit as anonymous
                        </FormLabel>
                        <FormDescription>
                          Your name will not be displayed with this review
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />

                {/* Submit Button */}
                <div className="flex gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate("/dashboard")}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting || rating === 0}
                    className="flex-1"
                  >
                    {isSubmitting ? "Submitting..." : existingReview ? "Update Review" : "Submit Feedback"}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Information Card */}
        <Card className="mt-6 bg-muted/50">
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">
              <strong>Note:</strong> Your feedback is valuable to us. Reviews with ratings of 1-2 stars will be 
              reviewed by our support team, and we may reach out to address your concerns. Positive reviews 
              (4-5 stars) may be featured in our testimonials section to help other customers.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Feedback;
