
import Navbar from "@/components/LandingPage/Navbar";
import HeroSection from "@/components/LandingPage/HeroSection";
import FeaturesSection from "@/components/LandingPage/FeaturesSection";
import HowItWorksSection from "@/components/LandingPage/HowItWorksSection";
import TestimonialsSection from "@/components/LandingPage/TestimonialsSection";
import PricingSection from "@/components/LandingPage/PricingSection";
import ContactSection from "@/components/LandingPage/ContactSection";
import Footer from "@/components/LandingPage/Footer";

const Index = () => {
  return (
    <div className="min-h-screen w-full">
      <Navbar />
      <main>
        <HeroSection />
        <FeaturesSection />
        <HowItWorksSection />
        <TestimonialsSection />
        {/* <PricingSection /> */}
        <ContactSection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
