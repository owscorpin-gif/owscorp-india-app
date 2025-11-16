import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { BottomNavigation } from "@/components/navigation/BottomNavigation";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Profile from "./pages/Profile";
import ServiceCategories from "./pages/ServiceCategories";
import ServiceDetail from "./pages/ServiceDetail";
import SearchResults from "./pages/SearchResults";
import DeveloperDashboard from "./pages/developer/Dashboard";
import DeveloperComplaints from "./pages/developer/Complaints";
import DeveloperUpload from "./pages/developer/Upload";
import DeveloperServiceManagement from "./pages/developer/ServiceManagement";
import Checkout from "./pages/Checkout";
import CustomerDashboard from "./pages/CustomerDashboard";
import Messages from "./pages/Messages";
import Chat from "./pages/Chat";
import Support from "./pages/Support";
import Feedback from "./pages/Feedback";
import PaymentHistory from "./pages/PaymentHistory";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/categories/:platform" element={<ServiceCategories />} />
          <Route path="/service/:id" element={<ServiceDetail />} />
          <Route path="/search" element={<SearchResults />} />
          <Route path="/checkout/:serviceId" element={<Checkout />} />
          <Route path="/dashboard" element={<CustomerDashboard />} />
          <Route path="/messages" element={<Messages />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/support" element={<Support />} />
          <Route path="/feedback/:serviceId" element={<Feedback />} />
          <Route path="/payment-history" element={<PaymentHistory />} />
          <Route path="/developer/dashboard" element={<DeveloperDashboard />} />
          <Route path="/developer/complaints" element={<DeveloperComplaints />} />
          <Route path="/developer/upload" element={<DeveloperUpload />} />
          <Route path="/developer/services/:id" element={<DeveloperServiceManagement />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        <BottomNavigation />
        <Toaster />
        <Sonner />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
