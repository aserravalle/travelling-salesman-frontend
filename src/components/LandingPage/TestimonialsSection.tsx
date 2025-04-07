
import React, { useEffect, useState } from "react";
import { Star, ChevronRight, ChevronLeft } from "lucide-react";

const testimonials = [
  {
    content: "Caminora has revolutionized how we manage our cleaning teams. We're saving over 20 hours per week in planning time, and our workers are completing 30% more jobs.",
    author: "Maria Rodriguez",
    position: "Operations Manager",
    company: "CleanTech Services",
    avatar: "https://randomuser.me/api/portraits/women/1.jpg",
    rating: 5
  },
  {
    content: "Before Caminora, route planning for our maintenance crews was a headache. Now it takes minutes instead of hours, and the optimized routes have cut our fuel costs by 25%.",
    author: "James Wilson",
    position: "Field Service Director",
    company: "FixIt Maintenance Co.",
    avatar: "https://randomuser.me/api/portraits/men/2.jpg",
    rating: 5
  },
  {
    content: "As a growing delivery business, we needed a solution that could scale with us. Caminora's optimization algorithms have helped us double our delivery capacity without adding more drivers.",
    author: "Sarah Chen",
    position: "CEO",
    company: "Swift Deliveries",
    avatar: "https://randomuser.me/api/portraits/women/3.jpg",
    rating: 5
  },
  {
    content: "The time savings alone paid for Caminora in the first month. Now we're six months in and our customer satisfaction is up by 40% because our service times are so reliable.",
    author: "Michael Okafor",
    position: "Customer Success Manager",
    company: "PrecisionTech Repair",
    avatar: "https://randomuser.me/api/portraits/men/4.jpg",
    rating: 5
  },
  {
    content: "Our team was skeptical about changing our routing process, but Caminora was so easy to adopt. The interface is intuitive and the results were immediate and impressive.",
    author: "Lisa Montgomery",
    position: "Team Lead",
    company: "Urban Courier Express",
    avatar: "https://randomuser.me/api/portraits/women/5.jpg",
    rating: 5
  }
];

const TestimonialsSection = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isAutoSliding, setIsAutoSliding] = useState(true);

  useEffect(() => {
    let interval: number;
    
    if (isAutoSliding) {
      interval = window.setInterval(() => {
        setActiveIndex((prev) => (prev + 1) % testimonials.length);
      }, 5000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isAutoSliding]);

  const handlePrevious = () => {
    setIsAutoSliding(false);
    setActiveIndex((prev) => 
      prev === 0 ? testimonials.length - 1 : prev - 1
    );
  };

  const handleNext = () => {
    setIsAutoSliding(false);
    setActiveIndex((prev) => (prev + 1) % testimonials.length);
  };

  return (
    <section id="testimonials" className="py-24 bg-gradient-to-r from-blue-50 to-indigo-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            What Our <span className="gradient-text">Customers Say</span>
          </h2>
          <p className="text-lg text-gray-700">
            Join hundreds of businesses that are transforming their operations with Caminora.
          </p>
        </div>
        
        <div className="relative max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
            <div className="flex flex-col items-center animate-fade-in">
              <div className="flex mb-4">
                {[...Array(testimonials[activeIndex].rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                ))}
              </div>
              
              <p className="text-xl md:text-2xl text-center text-gray-700 mb-8 italic">
                "{testimonials[activeIndex].content}"
              </p>
              
              <div className="flex items-center">
                <img 
                  src={testimonials[activeIndex].avatar} 
                  alt={testimonials[activeIndex].author} 
                  className="w-14 h-14 rounded-full mr-4 object-cover"
                />
                <div>
                  <h4 className="font-bold text-lg">{testimonials[activeIndex].author}</h4>
                  <p className="text-gray-600">
                    {testimonials[activeIndex].position}, {testimonials[activeIndex].company}
                  </p>
                </div>
              </div>
            </div>
            
            {/* Navigation arrows */}
            <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 flex justify-between px-4">
              <button 
                onClick={handlePrevious}
                className="bg-white rounded-full p-2 shadow-lg hover:bg-gray-100 transition-colors"
                aria-label="Previous testimonial"
              >
                <ChevronLeft className="w-6 h-6 text-gray-600" />
              </button>
              
              <button 
                onClick={handleNext}
                className="bg-white rounded-full p-2 shadow-lg hover:bg-gray-100 transition-colors"
                aria-label="Next testimonial"
              >
                <ChevronRight className="w-6 h-6 text-gray-600" />
              </button>
            </div>
          </div>
          
          {/* Testimonial navigation dots */}
          <div className="flex justify-center mt-8 space-x-2">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  setIsAutoSliding(false);
                  setActiveIndex(index);
                }}
                className={`w-3 h-3 rounded-full transition-colors ${
                  index === activeIndex ? "bg-blue-500" : "bg-gray-300"
                }`}
                aria-label={`Go to testimonial ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
