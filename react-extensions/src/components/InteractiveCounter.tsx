import React from 'react';

interface InteractiveCounterProps {
  count: number;
  onIncrement: () => void;
  onReset: () => void;
  themeColor: string;
  animationEnabled: boolean;
}

/**
 * Interactive counter component demonstrating React state management and animations
 */
const InteractiveCounter: React.FC<InteractiveCounterProps> = ({
  count,
  onIncrement,
  onReset,
  themeColor,
  animationEnabled,
}) => {
  return (
    <div className="interactive-counter">
      <div 
        className={`counter-display ${animationEnabled ? 'animated' : ''}`}
        style={{ borderColor: themeColor }}
      >
        <span className="counter-number" style={{ color: themeColor }}>
          {count}
        </span>
      </div>
      
      <div className="counter-controls">
        <button
          onClick={onIncrement}
          className={`counter-btn increment ${animationEnabled ? 'animated' : ''}`}
          style={{ backgroundColor: themeColor }}
        >
          + Increment
        </button>
        
        <button
          onClick={onReset}
          className={`counter-btn reset ${animationEnabled ? 'animated' : ''}`}
          style={{ borderColor: themeColor, color: themeColor }}
        >
          Reset
        </button>
      </div>
      
      <p className="counter-description">
        Click to test React state management and event handling!
      </p>
    </div>
  );
};

export default InteractiveCounter; 