
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, User, LogOut } from "lucide-react";
import { Link } from "react-router-dom";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const Profile = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const handleSignOut = async () => {
    try {
      setIsLoading(true);
      await signOut();
      navigate("/");
    } catch (error) {
      console.error("Error signing out:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-md mx-auto">
            <Alert>
              <AlertTitle>You are not logged in</AlertTitle>
              <AlertDescription>
                Please log in to view your profile.
                <div className="mt-4">
                  <Button 
                    onClick={() => navigate("/login")}
                    className="gradient-blue text-white w-full"
                  >
                    Go to Login
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center mb-6">
          <Link to="/RouteOptimizer" className="flex items-center text-gray-600 hover:text-gray-900">
            <ArrowLeft className="mr-2 h-4 w-4" />
            <span>Back to Home</span>
          </Link>
        </div>
        
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Your Profile</h1>
          
          <Card className="p-6 mb-6">
            <div className="flex items-center space-x-4 mb-6">
              <div className="bg-gray-200 p-4 rounded-full">
                <User className="h-10 w-10 text-gray-500" />
              </div>
              <div>
                <h2 className="text-xl font-semibold">{user.email}</h2>
                <p className="text-gray-500">User ID: {user.id.substring(0, 8)}...</p>
              </div>
            </div>
            
            <div className="border-t pt-4">
              <h3 className="font-medium mb-2">Account Information</h3>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p>{user.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Account Created</p>
                  <p>{new Date(user.created_at).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          </Card>
          
          <div className="flex justify-center">
            <Button
              variant="outline"
              className="flex items-center text-red-500 hover:bg-red-50 hover:text-red-600"
              onClick={handleSignOut}
              disabled={isLoading}
            >
              <LogOut className="mr-2 h-4 w-4" />
              {isLoading ? "Signing Out..." : "Sign Out"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
