import React from 'react';

interface AudioVisualizerProps {
  isActive: boolean;
  className?: string;
  barCount?: number;
}

export function AudioVisualizer({ 
  isActive, 
  className = '',
  barCount = 5 
}: AudioVisualizerProps) {
  return (
    <div className={`flex items-center justify-center h-8 ${className}`}>
      {isActive ? (
        <div className="audio-visualizer">
          {Array.from({ length: barCount }).map((_, index) => (
            <div
              key={index}
              className="audio-bar mx-0.5"
              style={{
                width: '4px',
                height: '15px',
                margin: '0 2px',
                backgroundColor: 'currentColor',
                borderRadius: '2px',
                animation: 'audio-wave 0.5s infinite ease-in-out alternate',
                animationDelay: `${index * 0.1}s`,
              }}
            />
          ))}
        </div>
      ) : (
        <div className="text-sm">Not speaking</div>
      )}
    </div>
  );
}
