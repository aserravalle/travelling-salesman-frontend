
import React from "react";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

const PricingSection = () => {
  const plans = [
    {
      name: "Starter",
      price: "49",
      description: "Perfect for small businesses just starting out.",
      features: [
        "Up to 10 workers",
        "Up to 100 jobs per month",
        "Basic route optimization",
        "CSV imports & exports",
        "Email support",
      ],
      cta: "Start Free Trial",
      featured: false,
    },
    {
      name: "Professional",
      price: "99",
      description: "Ideal for growing businesses with multiple teams.",
      features: [
        "Up to 50 workers",
        "Unlimited jobs",
        "Advanced route optimization",
        "Real-time tracking",
        "Worker mobile app",
        "Analytics dashboard",
        "Priority support",
      ],
      cta: "Start Free Trial",
      featured: true,
    },
    {
      name: "Enterprise",
      price: "249",
      description: "For large organizations with complex scheduling needs.",
      features: [
        "Unlimited workers",
        "Unlimited jobs",
        "Custom constraints",
        "API access",
        "Advanced analytics",
        "Custom integrations",
        "Dedicated account manager",
        "24/7 priority support",
      ],
      cta: "Contact Sales",
      featured: false,
    },
  ];

  return (
    <section id="pricing" className="py-24 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Simple, <span className="gradient-text">Transparent Pricing</span>
          </h2>
          <p className="text-lg text-gray-700">
            Choose the plan that fits your business needs. All plans come with a 14-day free trial, no credit card required.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <div 
              key={index} 
              className={`
                rounded-2xl p-8 
                ${plan.featured 
                  ? "bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg transform md:-translate-y-4" 
                  : "bg-white border border-gray-200 text-gray-900"}
                transition-all hover:shadow-xl
              `}
            >
              <h3 className={`text-2xl font-bold mb-2 ${plan.featured ? "text-white" : ""}`}>
                {plan.name}
              </h3>
              
              <div className="flex items-baseline mb-6">
                <span className={`text-4xl font-bold ${plan.featured ? "text-white" : ""}`}>
                  ${plan.price}
                </span>
                <span className={`ml-1 ${plan.featured ? "text-blue-100" : "text-gray-500"}`}>
                  /month
                </span>
              </div>
              
              <p className={`mb-6 ${plan.featured ? "text-blue-100" : "text-gray-600"}`}>
                {plan.description}
              </p>
              
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-center">
                    <Check 
                      className={`h-5 w-5 mr-3 ${
                        plan.featured ? "text-blue-200" : "text-green-500"
                      }`} 
                    />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              
              <Button 
                className={`w-full py-6 rounded-xl ${
                  plan.featured
                    ? "bg-white text-blue-600 hover:bg-blue-50"
                    : "gradient-blue text-white"
                }`}
              >
                {plan.cta}
              </Button>
              
              {plan.featured && (
                <p className="text-center mt-4 text-sm text-blue-100">
                  Most popular choice
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
