
import Navbar from "@/components/LandingPage/Navbar";
import HeroSection from "@/components/LandingPage/HeroSection";
import FeaturesSection from "@/components/LandingPage/FeaturesSection";
import HowItWorksSection from "@/components/LandingPage/HowItWorksSection";
import TestimonialsSection from "@/components/LandingPage/TestimonialsSection";
import ContactSection from "@/components/LandingPage/ContactSection";
import Footer from "@/components/LandingPage/Footer";

const LandingPage = () => {
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

export default LandingPage;
