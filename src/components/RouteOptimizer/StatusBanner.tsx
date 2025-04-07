
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle2, XCircle, AlertCircle } from 'lucide-react';

interface StatusBannerProps {
  message: string;
  variant?: 'success' | 'error' | 'warning';
}

const StatusBanner = ({ message, variant = 'success' }: StatusBannerProps) => {
  // Determine the border and background color based on the variant
  const getBorderColor = () => {
    switch (variant) {
      case 'success':
        return 'border-l-green-500';
      case 'error':
        return 'border-l-red-500';
      case 'warning':
        return 'border-l-amber-500';
      default:
        return 'border-l-green-500';
    }
  };

  const getBackgroundColor = () => {
    switch (variant) {
      case 'success':
        return 'bg-green-50 dark:bg-green-950/10';
      case 'error':
        return 'bg-red-50 dark:bg-red-950/10';
      case 'warning':
        return 'bg-amber-50 dark:bg-amber-950/10';
      default:
        return 'bg-green-50 dark:bg-green-950/10';
    }
  };

  const getIcon = () => {
    switch (variant) {
      case 'success':
        return <CheckCircle2 className="h-6 w-6 text-green-500" />;
      case 'error':
        return <XCircle className="h-6 w-6 text-red-500" />;
      case 'warning':
        return <AlertCircle className="h-6 w-6 text-amber-500" />;
      default:
        return <CheckCircle2 className="h-6 w-6 text-green-500" />;
    }
  };

  return (
    <Card className={`shadow-md mb-4 border-l-4 ${getBorderColor()} ${getBackgroundColor()}`}>
      <CardContent className="p-4 flex items-center gap-3">
        {getIcon()}
        <p className="font-medium text-lg">{message}</p>
      </CardContent>
    </Card>
  );
};

export default StatusBanner;
