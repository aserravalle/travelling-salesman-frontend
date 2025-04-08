
import React from "react";

const features = [
  {
    metric: "+1.5",
    unit: "hours",
    title: "Each Day",
    description: "average time saved by our customers daily",
  },
  {
    metric: "25",
    unit: "%",
    title: "More Jobs",
    description: "Complete more jobs using our more efficient routes",
  },
  {
    metric: "50",
    unit: "%",
    title: "Less Travel",
    description: "less travel time saves on wages and fuel costs",
  },
  {
    metric: "3",
    unit: "min",
    title: "Quick Setup",
    description: "to get started. No training required, simply upload your data as-is",
  },
  // {
  //   metric: "95",
  //   unit: "%",
  //   title: "Planning Reduction",
  //   description: "less time spent planning routes with our automated system",
  // },
  // {
  //   metric: "30",
  //   unit: "%",
  //   title: "Cost Savings",
  //   description: "reduction in operational costs reported by our customers",
  // },
  // {
  //   metric: "15",
  //   unit: "hrs",
  //   title: "Weekly Savings",
  //   description: "average time saved per worker each week using our platform",
  // },
  // {
  //   metric: "99",
  //   unit: "%",
  //   title: "Accuracy",
  //   description: "route optimization accuracy even for complex schedules",
  // },
];

const FeaturesSection = () => {
  return (
    <section id="features" className="py-24 bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16 animate-fade-in">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Powerful Benefits with <span className="gradient-text">Measurable Results</span>
          </h2>
          <p className="text-lg text-gray-700">
            Our customers experience significant improvements in efficiency and productivity.
            Here's what you can expect when using Caminora.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300 transform hover:-translate-y-1"
            >
              <div className="mb-6 text-center">
                <div className="flex items-center justify-center">
                  <span className="text-4xl font-bold text-blue-600">{feature.metric}</span>
                  <span className="text-2xl font-medium text-blue-500 ml-1">{feature.unit}</span>
                </div>
                <h3 className="text-xl font-semibold mt-2">{feature.title}</h3>
              </div>
              <p className="text-gray-600 text-center">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
