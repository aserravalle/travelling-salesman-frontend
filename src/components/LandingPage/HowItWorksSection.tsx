
import React from "react";
import { Button } from "@/components/ui/button";
import { FileUp, BarChart3, MapPin } from "lucide-react";
import { Link } from "react-router-dom";

const HowItWorksSection = () => {
  const steps = [
    {
      icon: <FileUp className="h-12 w-12 text-white" />,
      title: "Upload Your Data",
      description: "Simply upload your worker and job data using our smart CSV import tool.",
      image: "public/placeholder.svg",
      color: "bg-blue-500",
    },
    {
      icon: <BarChart3 className="h-12 w-12 text-white" />,
      title: "Process & Optimize",
      description: "Our algorithms analyze the data and create the most efficient routes and schedules.",
      image: "public/placeholder.svg",
      color: "bg-indigo-500",
    },
    {
      icon: <MapPin className="h-12 w-12 text-white" />,
      title: "View & Export Results",
      description: "Review the optimized schedules on an interactive map and export them for your team.",
      image: "public/placeholder.svg",
      color: "bg-purple-500",
    },
  ];

  return (
    <section id="how-it-works" className="py-24 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            How <span className="gradient-text">Caminora</span> Works
          </h2>
          <p className="text-lg text-gray-700">
            Our simple three-step process takes the complexity out of route optimization,
            so you can focus on serving your customers.
          </p>
        </div>
        
        <div className="space-y-24">
          {steps.map((step, index) => (
            <div 
              key={index} 
              className={`flex flex-col ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'} gap-8 items-center`}
            >
              <div className="w-full md:w-1/2 animate-fade-in-up">
                <div className={`rounded-full ${step.color} w-20 h-20 flex items-center justify-center mb-6`}>
                  {step.icon}
                </div>
                <h3 className="text-2xl font-bold mb-4">
                  <span className="gradient-text">Step {index + 1}:</span> {step.title}
                </h3>
                <p className="text-lg text-gray-700 mb-6">
                  {step.description}
                </p>
                
                {index === 0 && (
                  <ul className="space-y-3 mb-8">
                    <li className="flex items-center">
                      <span className="bg-green-100 text-green-800 rounded-full w-6 h-6 flex items-center justify-center mr-3">✓</span>
                      <span>Works with CSV files from most scheduling systems</span>
                    </li>
                    <li className="flex items-center">
                      <span className="bg-green-100 text-green-800 rounded-full w-6 h-6 flex items-center justify-center mr-3">✓</span>
                      <span>Automatic worker and job data detection</span>
                    </li>
                    <li className="flex items-center">
                      <span className="bg-green-100 text-green-800 rounded-full w-6 h-6 flex items-center justify-center mr-3">✓</span>
                      <span>Support for various job types and worker skills</span>
                    </li>
                  </ul>
                )}
              </div>
              
              <div className="w-full md:w-1/2">
                <div className="relative rounded-2xl overflow-hidden shadow-xl animate-fade-in">
                  <img 
                    src={step.image} 
                    alt={`${step.title} illustration`} 
                    className="w-full"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="text-center mt-20">
          <Button className="gradient-blue text-white rounded-full px-8 py-6 text-lg">
            <Link to="/RouteOptimizer">
            Try Caminora For Free
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
