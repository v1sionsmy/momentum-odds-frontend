import React from 'react';
import { Wifi, WifiOff, Loader2, AlertTriangle } from 'lucide-react';

type ConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'error';

interface WebSocketStatusProps {
  status: ConnectionStatus;
  usingFallback?: boolean;
  onReconnect?: () => void;
  className?: string;
}

export const WebSocketStatus: React.FC<WebSocketStatusProps> = ({
  status,
  usingFallback = false,
  onReconnect,
  className = ""
}) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'connected':
        return {
          icon: <Wifi className="h-4 w-4" />,
          color: 'text-green-500',
          bgColor: 'bg-green-500/10',
          text: 'Live',
          description: 'Real-time updates active'
        };
      
      case 'connecting':
        return {
          icon: <Loader2 className="h-4 w-4 animate-spin" />,
          color: 'text-blue-500',
          bgColor: 'bg-blue-500/10',
          text: 'Connecting',
          description: 'Establishing connection...'
        };
      
      case 'disconnected':
        return {
          icon: <WifiOff className="h-4 w-4" />,
          color: 'text-gray-500',
          bgColor: 'bg-gray-500/10',
          text: usingFallback ? 'Offline' : 'Disconnected',
          description: usingFallback ? 'Using cached data' : 'No connection'
        };
      
      case 'error':
        return {
          icon: <AlertTriangle className="h-4 w-4" />,
          color: 'text-red-500',
          bgColor: 'bg-red-500/10',
          text: 'Error',
          description: 'Connection failed'
        };
      
      default:
        return {
          icon: <WifiOff className="h-4 w-4" />,
          color: 'text-gray-500',
          bgColor: 'bg-gray-500/10',
          text: 'Unknown',
          description: 'Unknown status'
        };
    }
  };

  const config = getStatusConfig();

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full transition-all duration-200 ${config.bgColor} ${className}`}>
      <div className={`${config.color}`}>
        {config.icon}
      </div>
      
      <div className="flex flex-col">
        <span className={`text-xs font-medium ${config.color}`}>
          {config.text}
        </span>
        {usingFallback && status !== 'connected' && (
          <span className="text-xs text-yellow-600">
            Using fallback
          </span>
        )}
      </div>
      
      {(status === 'error' || status === 'disconnected') && onReconnect && (
        <button
          onClick={onReconnect}
          className="text-xs px-2 py-0.5 rounded bg-white/20 hover:bg-white/30 transition-colors"
          title="Reconnect"
        >
          Retry
        </button>
      )}
    </div>
  );
};

// Compact version for smaller spaces
export const WebSocketStatusCompact: React.FC<WebSocketStatusProps> = ({
  status,
  usingFallback = false,
  onReconnect,
  className = ""
}) => {
  const config = React.useMemo(() => {
    switch (status) {
      case 'connected':
        return {
          icon: <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />,
          tooltip: 'Real-time updates active'
        };
      
      case 'connecting':
        return {
          icon: <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" />,
          tooltip: 'Connecting...'
        };
      
      case 'disconnected':
        return {
          icon: <div className="w-2 h-2 bg-gray-500 rounded-full" />,
          tooltip: usingFallback ? 'Using cached data' : 'Disconnected'
        };
      
      case 'error':
        return {
          icon: <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />,
          tooltip: 'Connection error'
        };
      
      default:
        return {
          icon: <div className="w-2 h-2 bg-gray-500 rounded-full" />,
          tooltip: 'Unknown status'
        };
    }
  }, [status, usingFallback]);

  const handleClick = () => {
    if ((status === 'error' || status === 'disconnected') && onReconnect) {
      onReconnect();
    }
  };

  return (
    <div 
      className={`inline-flex items-center cursor-pointer ${className}`}
      title={config.tooltip}
      onClick={handleClick}
    >
      {config.icon}
      {usingFallback && status !== 'connected' && (
        <div className="w-2 h-2 bg-yellow-500 rounded-full ml-1" title="Using fallback data" />
      )}
    </div>
  );
}; 