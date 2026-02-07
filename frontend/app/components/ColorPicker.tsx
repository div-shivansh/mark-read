'use client';

import { HighlightColor } from '../types';

interface ColorPickerProps {
  selectedColor: HighlightColor;
  onColorChange: (color: HighlightColor) => void;
}

const colors: { color: HighlightColor; name: string }[] = [
  { color: '#FFFF00', name: 'Yellow' },
  { color: '#00FF00', name: 'Green' },
  { color: '#FF00FF', name: 'Magenta' },
  { color: '#00FFFF', name: 'Cyan' },
  { color: '#FFA500', name: 'Orange' },
];

export default function ColorPicker({ selectedColor, onColorChange }: ColorPickerProps) {
  return (
    <div className="flex flex-col gap-3 items-center p-4 bg-white rounded-lg shadow-sm hover:shadow-lg border border-gray-300/40 transition-all duration-200">
      <span className="font-semibold text-gray-700">Highlight Color:</span>
      <div className="flex gap-3">
        {colors.map(({ color, name }) => (
          <button
            key={color}
            onClick={() => onColorChange(color)}
            className={`w-10 h-10 rounded-md transition-all duration-200 ${
              selectedColor === color
                ? 'ring-2 ring-black shadow-lg scale-115'
                : 'ring-2 ring-gray-300 hover:scale-105'
            }`}
            style={{ backgroundColor: color }}
            title={name}
            aria-label={name}
          />
        ))}
      </div>
    </div>
  );
}