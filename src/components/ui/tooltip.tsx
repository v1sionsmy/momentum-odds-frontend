import React, { useState } from 'react';
import { HelpCircle } from 'lucide-react';

interface TooltipProps {
  content: string;
  children?: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

export const Tooltip: React.FC<TooltipProps> = ({ 
  content, 
  children, 
  position = 'top' 
}) => {
  const [isVisible, setIsVisible] = useState(false);

  const positionClasses = {
    top: 'bottom-full left-1/2 transform -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 transform -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 transform -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 transform -translate-y-1/2 ml-2'
  };

  return (
    <div className="relative inline-block">
      <div
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        className="cursor-help"
      >
        {children || <HelpCircle className="w-4 h-4 text-gray-400 hover:text-gray-300" />}
      </div>
      
      {isVisible && (
        <div className={`absolute z-50 ${positionClasses[position]}`}>
          <div className="bg-gray-800 text-white text-sm rounded-lg px-3 py-2 shadow-lg border border-gray-600 max-w-xs">
            {content}
            <div 
              className={`absolute w-2 h-2 bg-gray-800 border-gray-600 transform rotate-45 ${
                position === 'top' ? 'top-full left-1/2 -translate-x-1/2 -mt-1 border-b border-r' :
                position === 'bottom' ? 'bottom-full left-1/2 -translate-x-1/2 -mb-1 border-t border-l' :
                position === 'left' ? 'left-full top-1/2 -translate-y-1/2 -ml-1 border-t border-r' :
                'right-full top-1/2 -translate-y-1/2 -mr-1 border-b border-l'
              }`}
            />
          </div>
        </div>
      )}
    </div>
  );
}; 