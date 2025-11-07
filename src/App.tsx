import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Profile from "./pages/Profile";
import ServiceCategories from "./pages/ServiceCategories";
import ServiceDetail from "./pages/ServiceDetail";
import SearchResults from "./pages/SearchResults";
import DeveloperDashboard from "./pages/developer/Dashboard";
import ServiceUpload from "./pages/developer/ServiceUpload";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/categories/:platform" element={<ServiceCategories />} />
          <Route path="/service/:id" element={<ServiceDetail />} />
          <Route path="/search" element={<SearchResults />} />
          <Route path="/developer/dashboard" element={<DeveloperDashboard />} />
          <Route path="/developer/upload" element={<ServiceUpload />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
