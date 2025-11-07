import { useState } from "react";
import { Helmet } from "react-helmet";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Upload, TrendingUp, DollarSign, Eye, MessageSquare, Settings } from "lucide-react";

// Mock data for developer services
const mockServices = [
  {
    id: "1",
    title: "E-Commerce Dashboard",
    platform: "Website",
    price: 299,
    sales: 45,
    revenue: 13455,
    status: "active",
    rating: 4.8,
  },
  {
    id: "2",
    title: "Fitness Tracker Pro",
    platform: "iOS",
    price: 49,
    sales: 120,
    revenue: 5880,
    status: "active",
    rating: 4.6,
  },
  {
    id: "3",
    title: "Task Manager AI",
    platform: "Android",
    price: 39,
    sales: 85,
    revenue: 3315,
    status: "active",
    rating: 4.9,
  },
];

// Mock data for customer inquiries
const mockInquiries = [
  {
    id: "1",
    customer: "John Doe",
    service: "E-Commerce Dashboard",
    message: "Does this include mobile responsiveness?",
    date: "2024-11-05",
    status: "pending",
  },
  {
    id: "2",
    customer: "Sarah Smith",
    service: "Fitness Tracker Pro",
    message: "Can I get a custom integration?",
    date: "2024-11-04",
    status: "responded",
  },
];

const DeveloperDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");

  const totalRevenue = mockServices.reduce((sum, service) => sum + service.revenue, 0);
  const totalSales = mockServices.reduce((sum, service) => sum + service.sales, 0);
  const activeServices = mockServices.filter(s => s.status === "active").length;

  return (
    <>
      <Helmet>
        <title>Developer Dashboard - OWSCORP</title>
        <meta name="description" content="Manage your services, track sales, and grow your revenue on OWSCORP marketplace" />
      </Helmet>

      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="border-b bg-card">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <h1 className="text-2xl font-bold text-foreground">Developer Dashboard</h1>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => navigate("/profile")}>
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </Button>
              <Button onClick={() => navigate("/developer/upload")}>
                <Upload className="mr-2 h-4 w-4" />
                Upload Service
              </Button>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8">
          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-3 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${totalRevenue.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-accent">+12.5%</span> from last month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalSales}</div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-accent">+8.2%</span> from last month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Services</CardTitle>
                <Eye className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{activeServices}</div>
                <p className="text-xs text-muted-foreground">
                  {mockServices.length} total services
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="services">My Services</TabsTrigger>
              <TabsTrigger value="inquiries">
                Customer Inquiries
                {mockInquiries.filter(i => i.status === "pending").length > 0 && (
                  <Badge variant="destructive" className="ml-2">
                    {mockInquiries.filter(i => i.status === "pending").length}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>Your latest sales and service performance</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Service</TableHead>
                        <TableHead>Platform</TableHead>
                        <TableHead>Sales</TableHead>
                        <TableHead>Rating</TableHead>
                        <TableHead className="text-right">Revenue</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {mockServices.map((service) => (
                        <TableRow key={service.id}>
                          <TableCell className="font-medium">{service.title}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{service.platform}</Badge>
                          </TableCell>
                          <TableCell>{service.sales}</TableCell>
                          <TableCell>⭐ {service.rating}</TableCell>
                          <TableCell className="text-right font-medium">
                            ${service.revenue.toLocaleString()}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="services" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Service Listings</CardTitle>
                  <CardDescription>Manage your published services</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Service</TableHead>
                        <TableHead>Platform</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {mockServices.map((service) => (
                        <TableRow key={service.id}>
                          <TableCell className="font-medium">{service.title}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{service.platform}</Badge>
                          </TableCell>
                          <TableCell>${service.price}</TableCell>
                          <TableCell>
                            <Badge variant={service.status === "active" ? "default" : "secondary"}>
                              {service.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => navigate(`/developer/services/${service.id}`)}
                            >
                              Manage
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="inquiries" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Customer Inquiries</CardTitle>
                  <CardDescription>Respond to customer questions</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Customer</TableHead>
                        <TableHead>Service</TableHead>
                        <TableHead>Message</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {mockInquiries.map((inquiry) => (
                        <TableRow key={inquiry.id}>
                          <TableCell className="font-medium">{inquiry.customer}</TableCell>
                          <TableCell>{inquiry.service}</TableCell>
                          <TableCell className="max-w-xs truncate">{inquiry.message}</TableCell>
                          <TableCell>{inquiry.date}</TableCell>
                          <TableCell>
                            <Badge variant={inquiry.status === "pending" ? "destructive" : "default"}>
                              {inquiry.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="sm">
                              <MessageSquare className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </>
  );
};

export default DeveloperDashboard;
