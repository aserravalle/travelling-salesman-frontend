
import React from "react";
import { 
  Clock, 
  Map, 
  TrendingUp, 
  Activity, 
  Users, 
  FileSpreadsheet,
  BarChart3,
  Zap
} from "lucide-react";

const features = [
  {
    icon: <Clock className="h-8 w-8 text-blue-500" />,
    title: "Save Time",
    description: "Reduce planning time by up to 95% with automated route planning and optimization.",
  },
  {
    icon: <Map className="h-8 w-8 text-blue-500" />,
    title: "Optimize Routes",
    description: "Our advanced algorithms find the most efficient routes, reducing travel time and costs.",
  },
  {
    icon: <TrendingUp className="h-8 w-8 text-blue-500" />,
    title: "Increase Productivity",
    description: "Complete more jobs in less time with optimized scheduling and intelligent assignments.",
  },
  {
    icon: <Activity className="h-8 w-8 text-blue-500" />,
    title: "Real-time Tracking",
    description: "Monitor progress and make adjustments on the fly with real-time worker location updates.",
  },
  {
    icon: <Users className="h-8 w-8 text-blue-500" />,
    title: "Team Management",
    description: "Easily manage worker schedules, skills, and availability in one central platform.",
  },
  {
    icon: <FileSpreadsheet className="h-8 w-8 text-blue-500" />,
    title: "Simple Data Import",
    description: "Upload your worker and job data with our smart importing tool that handles CSV files.",
  },
  {
    icon: <BarChart3 className="h-8 w-8 text-blue-500" />,
    title: "Performance Analytics",
    description: "Gain insights into team performance and identify opportunities for improvement.",
  },
  {
    icon: <Zap className="h-8 w-8 text-blue-500" />,
    title: "Fast Processing",
    description: "Get optimized routes in seconds, not hours, no matter how complex your schedule.",
  },
];

const FeaturesSection = () => {
  return (
    <section id="features" className="py-24 bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16 animate-fade-in">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Powerful Features to <span className="gradient-text">Streamline Your Operations</span>
          </h2>
          <p className="text-lg text-gray-700">
            Caminora combines cutting-edge route optimization with easy-to-use tools
            that help your business operate more efficiently.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300 transform hover:-translate-y-1"
            >
              <div className="rounded-full w-16 h-16 flex items-center justify-center bg-blue-50 mb-6">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
