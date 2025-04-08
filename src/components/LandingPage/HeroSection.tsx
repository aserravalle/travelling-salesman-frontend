
import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, Check, MapPin } from "lucide-react";
import { Link } from "react-router-dom";

const HeroSection = () => {
  return (
    <section className="relative pt-20 overflow-hidden hero-pattern">
      <div className="container px-4 sm:px-6 lg:px-8 mx-auto">
        <div className="flex flex-col lg:flex-row items-center py-20">
          {/* Hero text content */}
          <div className="w-full lg:w-1/2 text-center lg:text-left mb-12 lg:mb-0">
            <div className="animate-fade-in-down">
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold leading-tight mb-6">
                End Workplace Scheduling Chaos <br />
                <span className="gradient-text">Forever</span>
              </h1>
              <p className="text-lg text-gray-700 mb-8 max-w-md mx-auto lg:mx-0">
              Caminora automatically optimizes routes for cleaning, maintenance, and delivery workers—saving time, reducing costs, and increasing productivity.
              </p>
              
              <div className="flex flex-col sm:flex-row justify-center lg:justify-start gap-4">
                <Button 
                  className="gradient-blue text-white rounded-full px-6 py-6 text-lg"
                  asChild
                >
                  <Link to="/RouteOptimizer">
                    Try App
                    <ArrowRight size={20} className="ml-2" />
                  </Link>
                </Button>
                <Button 
                  variant="outline" 
                  className="rounded-full px-6 py-6 text-lg border-gray-300"
                  asChild
                >
                  <Link to="https://youtu.be/m0soYdAOp7A" target="_blank" rel="noopener noreferrer">
                    See Demo
                  </Link>
                </Button>
              </div>
            </div>
          </div>
          
          {/* Hero image/animation */}
          <div className="w-full lg:w-1/2 relative animate-fade-in">
            <div className="relative bg-white rounded-2xl shadow-xl overflow-hidden max-w-xl mx-auto">
              <div className="p-3 bg-gray-50 border-b">
                <div className="flex items-center space-x-1.5">
                  <div className="w-3 h-3 rounded-full bg-gray-300"></div>
                  <div className="w-3 h-3 rounded-full bg-gray-300"></div>
                  <div className="w-3 h-3 rounded-full bg-gray-300"></div>
                </div>
              </div>
              
              <div className="relative">
                <img 
                  src="route-optimizer-assigned.png" 
                  alt="Caminora Route Optimization" 
                  className="w-full"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent"></div>
                
                {/* Animated location markers */}
                <div className="absolute top-1/4 left-1/4">
                  <div className="w-4 h-4 bg-blue-500 rounded-full animate-pulse-soft"></div>
                  <div className="w-8 h-8 bg-blue-500 rounded-full -mt-6 -ml-2 opacity-20 animate-pulse-soft"></div>
                </div>
                
                <div className="absolute bottom-1/3 right-1/3">
                  <div className="w-4 h-4 bg-blue-500 rounded-full animate-pulse-soft"></div>
                  <div className="w-8 h-8 bg-blue-500 rounded-full -mt-6 -ml-2 opacity-20 animate-pulse-soft"></div>
                </div>
              </div>
            </div>
            
            {/* Floating UI elements */}
            <div className="absolute -top-4 -right-4 md:top-10 md:right-10 glass-card p-4 rounded-lg animate-float shadow-lg hidden sm:block">
              <div className="flex items-center">
                <div className="bg-green-500 w-10 h-10 rounded-full flex items-center justify-center text-white mr-3">
                  <Check size={18} />
                </div>
                <div>
                  <p className="text-sm font-medium">Routes Optimized</p>
                  <p className="text-xs text-gray-500">7 jobs assigned</p>
                </div>
              </div>
            </div>
            
            <div className="absolute -bottom-4 -left-4 md:bottom-10 md:left-10 glass-card p-4 rounded-lg animate-float shadow-lg hidden sm:block">
              <div className="flex items-center">
                <div className="bg-blue-500 w-10 h-10 rounded-full flex items-center justify-center text-white mr-3">
                  <MapPin size={18} />
                </div>
                <div>
                  <p className="text-sm font-medium">Time Saved</p>
                  <p className="text-xs text-gray-500">26% more efficient</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Wave divider */}
      <div className="absolute bottom-0 left-0 w-full">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" className="w-full">
          <path fill="#f9fafb" fillOpacity="1" d="M0,288L48,272C96,256,192,224,288,213.3C384,203,480,213,576,213.3C672,213,768,203,864,202.7C960,203,1056,213,1152,208C1248,203,1344,181,1392,170.7L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
        </svg>
      </div>
    </section>
  );
};

export default HeroSection;
