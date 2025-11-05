import { Helmet } from "react-helmet";
import { Navbar } from "@/components/home/Navbar";
import { HeroSection } from "@/components/home/HeroSection";
import { CategoryGrid } from "@/components/home/CategoryGrid";
import { FeaturedServices } from "@/components/home/FeaturedServices";
import { Testimonials } from "@/components/home/Testimonials";

const Index = () => {
  return (
    <>
      <Helmet>
        <title>OWSCORP - AI-Powered Digital Solutions Marketplace</title>
        <meta
          name="description"
          content="Connect with expert developers and find ready-made solutions for websites, mobile apps, desktop applications, and AI services. Your trusted marketplace for digital solutions."
        />
      </Helmet>
      
      <div className="min-h-screen bg-background">
        <Navbar />
        <main>
          <HeroSection />
          <CategoryGrid />
          <FeaturedServices />
          <Testimonials />
        </main>
      </div>
    </>
  );
};

export default Index;
