import React, { useState, createContext, useContext } from 'react';
import { HelpCircle } from 'lucide-react';

interface TooltipContextType {
  isVisible: boolean;
  setIsVisible: (visible: boolean) => void;
}

const TooltipContext = createContext<TooltipContextType | null>(null);

interface TooltipProps {
  children?: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

interface TooltipProviderProps {
  children: React.ReactNode;
}

interface TooltipTriggerProps {
  children: React.ReactNode;
  asChild?: boolean;
}

interface TooltipContentProps {
  children: React.ReactNode;
  side?: 'top' | 'bottom' | 'left' | 'right';
  className?: string;
}

export const TooltipProvider: React.FC<TooltipProviderProps> = ({ children }) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <TooltipContext.Provider value={{ isVisible, setIsVisible }}>
      {children}
    </TooltipContext.Provider>
  );
};

export const Tooltip: React.FC<TooltipProps> = ({ children }) => {
  return <div className="relative inline-block">{children}</div>;
};

export const TooltipTrigger: React.FC<TooltipTriggerProps> = ({ children, asChild = false }) => {
  const context = useContext(TooltipContext);
  
  const handleMouseEnter = () => context?.setIsVisible(true);
  const handleMouseLeave = () => context?.setIsVisible(false);

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, {
      onMouseEnter: handleMouseEnter,
      onMouseLeave: handleMouseLeave,
    } as React.HTMLAttributes<HTMLElement>);
  }

  return (
    <div
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="cursor-help"
    >
      {children || <HelpCircle className="w-4 h-4 text-gray-400 hover:text-gray-300" />}
    </div>
  );
};

export const TooltipContent: React.FC<TooltipContentProps> = ({ 
  children, 
  side = 'top', 
  className = '' 
}) => {
  const context = useContext(TooltipContext);
  
  if (!context?.isVisible) return null;

  const positionClasses = {
    top: 'bottom-full left-1/2 transform -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 transform -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 transform -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 transform -translate-y-1/2 ml-2'
  };

  return (
    <div className={`absolute z-50 ${positionClasses[side]}`}>
      <div className={`bg-gray-800 text-white text-sm rounded-lg px-3 py-2 shadow-lg border border-gray-600 max-w-xs ${className}`}>
        {children}
        <div 
          className={`absolute w-2 h-2 bg-gray-800 border-gray-600 transform rotate-45 ${
            side === 'top' ? 'top-full left-1/2 -translate-x-1/2 -mt-1 border-b border-r' :
            side === 'bottom' ? 'bottom-full left-1/2 -translate-x-1/2 -mb-1 border-t border-l' :
            side === 'left' ? 'left-full top-1/2 -translate-y-1/2 -ml-1 border-t border-r' :
            'right-full top-1/2 -translate-y-1/2 -mr-1 border-b border-l'
          }`}
        />
      </div>
    </div>
  );
}; 