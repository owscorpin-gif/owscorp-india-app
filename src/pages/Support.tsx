import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Helmet } from "react-helmet";
import { MessageCircle, Mail, HelpCircle, FileText, Send } from "lucide-react";
import { Navbar } from "@/components/home/Navbar";
import { Footer } from "@/components/home/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const contactSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100, "Name must be less than 100 characters"),
  email: z.string().trim().email("Invalid email address").max(255, "Email must be less than 255 characters"),
  subject: z.string().trim().min(1, "Subject is required").max(200, "Subject must be less than 200 characters"),
  message: z.string().trim().min(1, "Message is required").max(1000, "Message must be less than 1000 characters"),
});

const ticketSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(200, "Title must be less than 200 characters"),
  description: z.string().trim().min(1, "Description is required").max(2000, "Description must be less than 2000 characters"),
  category: z.string().min(1, "Category is required"),
});

type ContactFormValues = z.infer<typeof contactSchema>;
type TicketFormValues = z.infer<typeof ticketSchema>;

const Support = () => {
  const navigate = useNavigate();
  const [isSubmittingContact, setIsSubmittingContact] = useState(false);
  const [isSubmittingTicket, setIsSubmittingTicket] = useState(false);

  const contactForm = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: "",
      email: "",
      subject: "",
      message: "",
    },
  });

  const ticketForm = useForm<TicketFormValues>({
    resolver: zodResolver(ticketSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "",
    },
  });

  const onContactSubmit = async (data: ContactFormValues) => {
    setIsSubmittingContact(true);
    try {
      // In production, this would send an email or save to database
      console.log("Contact form submitted:", data);
      toast.success("Message sent successfully! We'll get back to you soon.");
      contactForm.reset();
    } catch (error) {
      toast.error("Failed to send message. Please try again.");
    } finally {
      setIsSubmittingContact(false);
    }
  };

  const onTicketSubmit = async (data: TicketFormValues) => {
    setIsSubmittingTicket(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error("Please log in to submit a ticket");
        navigate("/auth");
        return;
      }

      // In production, this would save to a tickets table
      console.log("Ticket submitted:", { ...data, user_id: user.id });
      toast.success("Support ticket created successfully!");
      ticketForm.reset();
    } catch (error) {
      toast.error("Failed to create ticket. Please try again.");
    } finally {
      setIsSubmittingTicket(false);
    }
  };

  const faqs = [
    {
      question: "How do I purchase a service?",
      answer: "Browse our marketplace, select a service, click 'Purchase', and complete the checkout process. You'll receive immediate access to download links and instructions.",
    },
    {
      question: "What payment methods do you accept?",
      answer: "We accept all major credit cards, PayPal, and other secure payment methods through our payment gateway.",
    },
    {
      question: "How do I become a developer on OWSCORP?",
      answer: "Sign up with a developer account, complete your profile, and start uploading your services. Each service goes through a review process before publication.",
    },
    {
      question: "Can I get a refund?",
      answer: "Refunds are handled on a case-by-case basis. Please contact our support team with your order details and reason for the refund request.",
    },
    {
      question: "How do I report a problem with a service?",
      answer: "You can submit feedback through the service page after purchase. Complaints are automatically routed to our support team for immediate attention.",
    },
  ];

  const knowledgeBaseArticles = [
    {
      title: "Getting Started Guide",
      description: "Learn how to use OWSCORP marketplace",
      icon: HelpCircle,
    },
    {
      title: "Developer Documentation",
      description: "Resources for service developers",
      icon: FileText,
    },
    {
      title: "Payment & Billing",
      description: "Information about payments and invoices",
      icon: FileText,
    },
  ];

  return (
    <>
      <Helmet>
        <title>Support Center - OWSCORP</title>
        <meta name="description" content="Get help and support for OWSCORP services. Browse FAQs, contact us, or submit a support ticket." />
      </Helmet>
      
      <div className="min-h-screen bg-background">
        <Navbar />
        
        {/* Header */}
        <header className="border-b bg-card">
          <div className="container mx-auto px-4 py-6">
            <h1 className="text-3xl font-bold text-foreground">Support Center</h1>
            <p className="text-muted-foreground mt-2">How can we help you today?</p>
          </div>
        </header>

        <div className="container mx-auto px-4 py-8">
          {/* Quick Actions */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate("/chat")}>
              <CardHeader>
                <MessageCircle className="h-8 w-8 text-primary mb-2" />
                <CardTitle>Live Chat</CardTitle>
                <CardDescription>Get instant help from our AI assistant</CardDescription>
              </CardHeader>
            </Card>

            <Card className="cursor-pointer hover:shadow-lg transition-shadow">
              <CardHeader>
                <Mail className="h-8 w-8 text-primary mb-2" />
                <CardTitle>Contact Form</CardTitle>
                <CardDescription>Send us a message and we'll respond soon</CardDescription>
              </CardHeader>
            </Card>

            <Card className="cursor-pointer hover:shadow-lg transition-shadow">
              <CardHeader>
                <HelpCircle className="h-8 w-8 text-primary mb-2" />
                <CardTitle>FAQ</CardTitle>
                <CardDescription>Find answers to common questions</CardDescription>
              </CardHeader>
            </Card>
          </div>

          {/* FAQ Section */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger className="text-left">{faq.question}</AccordionTrigger>
                  <AccordionContent>{faq.answer}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </section>

          {/* Knowledge Base */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Knowledge Base</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {knowledgeBaseArticles.map((article, index) => (
                <Card key={index} className="cursor-pointer hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <article.icon className="h-8 w-8 text-primary mb-2" />
                    <CardTitle className="text-lg">{article.title}</CardTitle>
                    <CardDescription>{article.description}</CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </section>

          {/* Contact & Ticket Forms */}
          <div className="grid md:grid-cols-2 gap-8">
            {/* Contact Form */}
            <Card>
              <CardHeader>
                <CardTitle>Contact Us</CardTitle>
                <CardDescription>Send us a message and we'll respond within 24 hours</CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...contactForm}>
                  <form onSubmit={contactForm.handleSubmit(onContactSubmit)} className="space-y-4">
                    <FormField
                      control={contactForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Your name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={contactForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="your@email.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={contactForm.control}
                      name="subject"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Subject</FormLabel>
                          <FormControl>
                            <Input placeholder="How can we help?" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={contactForm.control}
                      name="message"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Message</FormLabel>
                          <FormControl>
                            <Textarea placeholder="Tell us more..." className="min-h-[120px]" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button type="submit" disabled={isSubmittingContact} className="w-full">
                      <Send className="mr-2 h-4 w-4" />
                      {isSubmittingContact ? "Sending..." : "Send Message"}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>

            {/* Support Ticket Form */}
            <Card>
              <CardHeader>
                <CardTitle>Submit a Support Ticket</CardTitle>
                <CardDescription>Create a ticket for technical issues or account problems</CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...ticketForm}>
                  <form onSubmit={ticketForm.handleSubmit(onTicketSubmit)} className="space-y-4">
                    <FormField
                      control={ticketForm.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Issue Title</FormLabel>
                          <FormControl>
                            <Input placeholder="Brief description of the issue" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={ticketForm.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Category</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a category" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="technical">Technical Issue</SelectItem>
                              <SelectItem value="billing">Billing Question</SelectItem>
                              <SelectItem value="account">Account Problem</SelectItem>
                              <SelectItem value="service">Service Quality</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={ticketForm.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Provide detailed information about your issue..."
                              className="min-h-[120px]"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button type="submit" disabled={isSubmittingTicket} className="w-full">
                      <Send className="mr-2 h-4 w-4" />
                      {isSubmittingTicket ? "Creating..." : "Create Ticket"}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>
        </div>
        
        <Footer />
      </div>
    </>
  );
};

export default Support;
