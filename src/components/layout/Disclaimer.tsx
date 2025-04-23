import React, { useState } from 'react';
import { Info, X } from 'lucide-react';
import { cn } from '@/utils/cn';

interface DisclaimerProps {
  className?: string;
}

const Disclaimer: React.FC<DisclaimerProps> = ({ className }) => {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div className={cn(
      "bg-gradient-to-r from-blush/20 to-ivory border-b border-blush/30",
      "text-deepbrown text-sm py-3 px-4 relative z-50",
      className
    )}>
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Info className="h-5 w-5 text-hotpink flex-shrink-0" />
          <p className="font-medium">
            <span className="italic">Please note:</span> The cake images displayed throughout this website are for inspirational purposes only. 
            Your custom cake will be crafted based on your specific requirements and may differ from the samples shown.
          </p>
        </div>
        <button 
          onClick={() => setIsVisible(false)}
          className="text-warmgray-500 hover:text-deepbrown transition-colors ml-3 flex-shrink-0"
          aria-label="Close disclaimer"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
};

export default Disclaimer; 