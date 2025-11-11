import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { MessageCircle, Mail, HelpCircle, FileText, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
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
      answer: "Register selecting 'Developer' as user type, complete your profile, and start uploading your services through the Developer Dashboard.",
    },
    {
      question: "What platforms are supported?",
      answer: "We support services for Websites, Android, iOS, Mac, Windows, Linux, and AI/Automation tools.",
    },
    {
      question: "How do refunds work?",
      answer: "Refunds are handled on a case-by-case basis. Contact the developer or submit a support ticket within 30 days of purchase.",
    },
    {
      question: "How can I contact a developer?",
      answer: "Visit the service detail page and click 'Contact Developer' to start a conversation through our messaging system.",
    },
    {
      question: "Is my payment information secure?",
      answer: "Yes, all payments are processed through secure, industry-standard payment gateways. We never store your payment information.",
    },
    {
      question: "Can I preview services before purchasing?",
      answer: "Yes, all services include screenshots, demos, and detailed descriptions to help you make an informed decision.",
    },
  ];

  const knowledgeBaseArticles = [
    {
      title: "Getting Started with OWSCORP",
      description: "Learn how to create an account, browse services, and make your first purchase.",
      icon: FileText,
    },
    {
      title: "Developer Guide",
      description: "Complete guide for developers on uploading, managing, and selling services.",
      icon: FileText,
    },
    {
      title: "Payment & Billing",
      description: "Information about payment methods, invoices, and billing procedures.",
      icon: FileText,
    },
    {
      title: "Service Quality Standards",
      description: "Our standards for service quality, reviews, and customer satisfaction.",
      icon: FileText,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
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
          <h2 className="text-2xl font-bold text-foreground mb-6">Frequently Asked Questions</h2>
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-left">{faq.question}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">{faq.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </section>

        {/* Knowledge Base */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-foreground mb-6">Knowledge Base</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {knowledgeBaseArticles.map((article, index) => (
              <Card key={index} className="cursor-pointer hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start gap-4">
                    <article.icon className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                    <div>
                      <CardTitle className="text-lg">{article.title}</CardTitle>
                      <CardDescription className="mt-2">{article.description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        </section>

        {/* Contact Form and Ticket Submission */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Contact Form */}
          <Card>
            <CardHeader>
              <CardTitle>Contact Us</CardTitle>
              <CardDescription>Send us a message and we'll get back to you</CardDescription>
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
                          <Input type="email" placeholder="your.email@example.com" {...field} />
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
                          <Textarea placeholder="Tell us more about your question or issue" {...field} />
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

          {/* Ticket Submission */}
          <Card>
            <CardHeader>
              <CardTitle>Submit Support Ticket</CardTitle>
              <CardDescription>Create a ticket for technical support</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...ticketForm}>
                <form onSubmit={ticketForm.handleSubmit(onTicketSubmit)} className="space-y-4">
                  <FormField
                    control={ticketForm.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <FormControl>
                          <select
                            {...field}
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                          >
                            <option value="">Select a category</option>
                            <option value="technical">Technical Issue</option>
                            <option value="billing">Billing & Payment</option>
                            <option value="account">Account Management</option>
                            <option value="service">Service Quality</option>
                            <option value="other">Other</option>
                          </select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={ticketForm.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Title</FormLabel>
                        <FormControl>
                          <Input placeholder="Brief description of the issue" {...field} />
                        </FormControl>
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
                            placeholder="Provide detailed information about your issue" 
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
    </div>
  );
};

export default Support;
