import React from 'react';

interface ColorPickerProps {
  selectedColor: string;
  onColorChange: (color: string) => void;
  animationEnabled: boolean;
}

const PREDEFINED_COLORS = [
  '#007bff', // Blue
  '#28a745', // Green
  '#dc3545', // Red
  '#ffc107', // Yellow
  '#6f42c1', // Purple
  '#fd7e14', // Orange
  '#20c997', // Teal
  '#e83e8c', // Pink
];

/**
 * Color picker component for dynamic theme switching
 */
const ColorPicker: React.FC<ColorPickerProps> = ({
  selectedColor,
  onColorChange,
  animationEnabled,
}) => {
  return (
    <div className="color-picker">
      <div className="color-palette">
        {PREDEFINED_COLORS.map((color) => (
          <button
            key={color}
            className={`color-swatch ${
              selectedColor === color ? 'selected' : ''
            } ${animationEnabled ? 'animated' : ''}`}
            style={{ backgroundColor: color }}
            onClick={() => onColorChange(color)}
            title={`Select ${color}`}
            aria-label={`Select color ${color}`}
          >
            {selectedColor === color && (
              <span className="checkmark">✓</span>
            )}
          </button>
        ))}
      </div>
      
      <div className="custom-color-input">
        <label htmlFor="custom-color">
          Custom Color:
          <input
            id="custom-color"
            type="color"
            value={selectedColor}
            onChange={(e) => onColorChange(e.target.value)}
            className={`color-input ${animationEnabled ? 'animated' : ''}`}
          />
        </label>
      </div>
      
      <p className="color-picker-description">
        Current theme: <strong style={{ color: selectedColor }}>{selectedColor}</strong>
      </p>
    </div>
  );
};

export default ColorPicker; 