
import React, { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, Quote, Star } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";

const testimonials = [
  {
    content: "We saw a 60% reduction in planning time and a 35% increase in job completions after switching to Caminora's route optimization.",
    author: "Maria Rodriguez",
    position: "Operations Manager",
    company: "CleanTech Services",
    avatar: "https://randomuser.me/api/portraits/women/1.jpg",
  },
  {
    content: "Having automatic route planning makes managing our maintenance crews so much easier. It does all the complex work for us!",
    author: "James Wilson",
    position: "Field Service Director",
    company: "FixIt Maintenance Co.",
    avatar: "https://randomuser.me/api/portraits/men/2.jpg",
  },
  {
    content: "Caminora helped us double our delivery capacity without adding more drivers. The ROI was almost immediate.",
    author: "Sarah Chen",
    position: "CEO",
    company: "Swift Deliveries",
    avatar: "https://randomuser.me/api/portraits/women/3.jpg",
  },
  {
    content: "Our customer satisfaction is up 40% because our service times are now so reliable thanks to Caminora's optimization.",
    author: "Michael Okafor",
    position: "Customer Success Manager",
    company: "PrecisionTech Repair",
    avatar: "https://randomuser.me/api/portraits/men/4.jpg",
  },
  {
    content: "The interface is so intuitive that our entire team adopted it without any resistance. The results were immediate and impressive.",
    author: "Lisa Montgomery",
    position: "Team Lead",
    company: "Urban Courier Express",
    avatar: "https://randomuser.me/api/portraits/women/5.jpg",
  }
];

const TestimonialsSection = () => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const scrollContainer = scrollRef.current;
    if (!scrollContainer) return;

    // Clone testimonials for seamless scrolling
    const duplicate = () => {
      const items = scrollContainer.querySelectorAll('.testimonial-card');
      const clonedItems = Array.from(items).map(item => item.cloneNode(true) as HTMLElement);
      clonedItems.forEach(item => {
        scrollContainer.appendChild(item);
      });
    };

    duplicate();

    // Set up the animation
    const setupAnimation = () => {
      if (!scrollContainer) return;
      
      const scrollWidth = scrollContainer.scrollWidth;
      const containerWidth = scrollContainer.offsetWidth;
      
      // Only animate if content is wider than container
      if (scrollWidth <= containerWidth) return;
      
      scrollContainer.style.animation = 'none';
      scrollContainer.offsetHeight; // Trigger reflow
      
      // Calculate animation duration based on content length
      const velocity = 6; // bigger number = faster scrolling
      const duration = Math.max(20, scrollWidth / 50) / velocity;
      scrollContainer.style.animation = `scroll ${duration}s linear infinite`;

      // Add hover pause
      scrollContainer.addEventListener('mouseenter', () => {
        scrollContainer.style.animationPlayState = 'paused';
      });
      scrollContainer.addEventListener('mouseleave', () => {
        scrollContainer.style.animationPlayState = 'running';
      });
    };

    setupAnimation();

    // Update on resize
    const resizeObserver = new ResizeObserver(() => {
      setupAnimation();
    });
    resizeObserver.observe(scrollContainer);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  return (
    <section id="testimonials" className="py-24 bg-blue-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-4xl font-bold mb-4">
            What Our <span className="gradient-text text-blue-500">Customers</span> <span className="text-cyan-400">Say</span>
          </h2>
          <p className="text-lg text-gray-700">
            Join hundreds of businesses that are transforming their operations with Caminora.
          </p>
        </div>
        
        <div className="relative max-w-7xl mx-auto overflow-hidden">
          {/* Gradient masks for smooth fade effect */}
          <div className="absolute left-0 top-0 h-full w-12 bg-gradient-to-r from-blue-50 to-transparent z-10"></div>
          <div className="absolute right-0 top-0 h-full w-12 bg-gradient-to-l from-blue-50 to-transparent z-10"></div>
          
          {/* Scrolling container */}
          <div 
            ref={scrollRef}
            className="flex gap-6 py-8 testimonial-scroll"
            style={{
              whiteSpace: 'nowrap',
              willChange: 'transform'
            }}
          >
            {testimonials.map((testimonial, index) => (
              <div 
                key={`testimonial-${index}`}
                className="testimonial-card inline-block min-w-[350px] lg:min-w-[450px] align-top"
              >
                <Card className="h-full border-none shadow-lg hover:shadow-xl transition-shadow duration-300 bg-white flex flex-col">
                  <CardContent className="p-6 flex flex-col h-full">
                    <div className="flex mb-4">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                    <div className="mb-6">
                      <p className="text-lg text-gray-800 break-words whitespace-normal">{testimonial.content}</p>
                    </div>
                    
                    <div className="mt-auto flex items-center">
                      <Avatar className="h-12 w-12 border-2 border-blue-100">
                        <AvatarImage src={testimonial.avatar} alt={testimonial.author} />
                        <AvatarFallback>{testimonial.author[0]}</AvatarFallback>
                      </Avatar>
                      <div className="ml-4">
                        <h4 className="font-bold text-gray-900">{testimonial.author}</h4>
                        <p className="text-sm text-gray-600">
                          {testimonial.position}, {testimonial.company}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>
        
        <div className="mt-16 text-center">
          <Button className="rounded-full bg-gray-900 hover:bg-gray-800 text-white">
            Book a Demo <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        </div>
      </div>
      
      {/* Add animation keyframes */}
      <style>{`
        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(calc(-50%));
          }
        }
      `}</style>
    </section>
  );
};

export default TestimonialsSection;