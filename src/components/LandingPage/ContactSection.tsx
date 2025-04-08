import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Mail, MapPin, Phone } from "lucide-react";
import { contactUs } from "@/services/api";

const ContactSection = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phoneNumber: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await contactUs(formData);
      toast({
        title: "Message sent!",
        description: response.message || "We'll get back to you as soon as possible.",
      });
      setFormData({
        name: "",
        email: "",
        phoneNumber: "",
        message: "",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send your message. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contact" className="py-24 bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Ready to <span className="gradient-text">Get Started?</span>
          </h2>
          <p className="text-lg text-gray-700">
            Contact us to learn how Caminora can transform your business operations.
          </p>
        </div>
        
        <div className="flex flex-col lg:flex-row gap-12 items-stretch max-w-6xl mx-auto">
        {/* Contact form */}
        <div className="w-full lg:w-2/3 bg-white rounded-2xl shadow-lg p-8">
          <h3 className="text-2xl font-bold mb-6">Send us a message</h3>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Name or Company
                </label>
                <Input
                  id="name"
                  name="name"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full"
                />
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="john@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full"
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number
              </label>
              <Input
                id="phoneNumber"
                name="phoneNumber"
                placeholder="+39 123 123 1234"
                value={formData.phoneNumber}
                onChange={handleChange}
                className="w-full"
              />
            </div>
            
            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                Message
              </label>
              <Textarea
                id="message"
                name="message"
                placeholder="How can we help you?"
                value={formData.message}
                onChange={handleChange}
                required
                className="w-full h-32"
              />
            </div>
            
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="gradient-blue text-white w-full py-6"
            >
              {isSubmitting ? "Sending..." : "Send Message"}
            </Button>
          </form>
          </div>
          
          {/* Contact info */}
          <div className="w-full lg:w-1/3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg p-8 text-white flex flex-col">
            <h3 className="text-2xl font-bold mb-8">Contact Information</h3>
            
            <div className="space-y-6 flex-grow">
              <div className="flex items-start">
                <MapPin className="h-6 w-6 text-blue-200 mr-4 mt-1" />
                <div>
                  <h4 className="font-medium">Address</h4>
                  <p className="text-blue-100">
                    Piombino, Italy
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <Phone className="h-6 w-6 text-blue-200 mr-4 mt-1" />
                  <a href="https://wa.me/393516943124" target="_blank" rel="noopener noreferrer">
                  <div>
                    <h4 className="font-medium">Phone</h4>
                    <p className="text-blue-100">+39 351 694 3124</p>
                  </div>
                </a>
              </div>
            
              <div className="flex items-start">
                <Mail className="h-6 w-6 text-blue-200 mr-4 mt-1" />
                  <a href="mailto:ariel.serravalle@gmail.com" target="_blank" rel="noopener noreferrer">
                  <div>
                    <h4 className="font-medium">Email</h4>
                    <p className="text-blue-100">ariel.serravalle@gmail.com</p>
                  </div>
                </a>
              </div>
            </div>
            
            </div>
          </div>
        </div>
    </section>
  );
};

export default ContactSection;