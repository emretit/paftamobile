
import { useState } from "react";
import HeroSection from "@/components/landing/HeroSection";
import FeaturesSection from "@/components/landing/FeaturesSection";
import ScreenshotSection from "@/components/landing/ScreenshotSection";
import PricingSection from "@/components/landing/PricingSection";
import TestimonialsSection from "@/components/landing/TestimonialsSection";
import FaqSection from "@/components/landing/FaqSection";
import CtaSection from "@/components/landing/CtaSection";
import FooterSection from "@/components/landing/FooterSection";
import LoginButton from "@/components/navbar/LoginButton";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <header className="fixed top-0 left-0 right-0 bg-background/80 backdrop-blur-md shadow-sm z-10 border-b border-border">
        <div className="container mx-auto p-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <img 
              src="/lovable-uploads/041398c6-f1b0-407a-8a75-436cefa9fb60.png" 
              alt="PAFTA Logo" 
              className="h-8 w-auto"
            />
          </div>
          <LoginButton />
        </div>
      </header>
      
      <main className="pt-16">
        <HeroSection />
        <FeaturesSection />
        <ScreenshotSection />
        <PricingSection />
        <TestimonialsSection />
        <FaqSection />
        <CtaSection />
        <FooterSection />
      </main>
    </div>
  );
};

export default Index;
