import React, { useState, useEffect } from 'react';
import { HexColorPicker } from 'react-colorful';
import './MapColorPicker.scss';

interface MapColorPickerProps {
  color: string;
  onChange: (color: string) => void;
  mode: 'settlement' | 'state';
  defaultColor?: string;
}

export const MapColorPicker: React.FC<MapColorPickerProps> = ({ color, onChange, mode, defaultColor }) => {
  const [internalColor, setInternalColor] = useState(color || defaultColor || '#ff0000');
  const [hexInput, setHexInput] = useState(internalColor.replace('#', ''));

  useEffect(() => {
    if (color && color !== internalColor) {
      setInternalColor(color);
      setHexInput(color.replace('#', ''));
    }
// eslint-disable-next-line react-hooks/exhaustive-deps
  }, [color]);

  const handleColorChange = (newColor: string) => {
    setInternalColor(newColor);
    setHexInput(newColor.replace('#', ''));
    onChange(newColor);
  };

  const handleHexInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newHex = e.target.value;
    setHexInput(newHex);
    if (/^[0-9A-F]{6}$/i.test(newHex)) {
      const hex = `#${newHex}`;
      setInternalColor(hex);
      onChange(hex);
    }
  };

  // Прозрачность для превью. У поселений 5% заливки, у государств 2% заливки.
  // Рамки всегда 100% (alpha = 1).
  const fillOpacity = mode === 'settlement' ? 0.05 : 0.02;

  // Конвертация HEX в rgba для стилей превью
  const getRgba = (hex: string, alpha: number) => {
    const r = parseInt(hex.slice(1, 3), 16) || 255;
    const g = parseInt(hex.slice(3, 5), 16) || 0;
    const b = parseInt(hex.slice(5, 7), 16) || 0;
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  return (
    <div className="map-color-picker">
      <div className="picker-section">
        <HexColorPicker color={internalColor} onChange={handleColorChange} />
        <div className="hex-input">
          <span>#</span>
          <input 
            type="text" 
            value={hexInput} 
            onChange={handleHexInputChange}
            maxLength={6}
          />
        </div>
      </div>
      <div className="preview-section">
        <label>Превью на карте (непрозрачность: {mode === 'settlement' ? '5%' : '2%'})</label>
        <div className="preview-box">
          <div 
            className="map-polygon"
            style={{
              backgroundColor: getRgba(internalColor, fillOpacity),
              border: `2px solid ${getRgba(internalColor, 1)}`
            }}
          />
          <div className="preview-label">
            Пример отображения границ {mode === 'settlement' ? 'поселения' : 'государства'}
          </div>
        </div>
      </div>
    </div>
  );
};
