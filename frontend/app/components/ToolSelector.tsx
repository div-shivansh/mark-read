'use client';

import { HighlightTool } from "../types";

interface ToolSelectorProps {
  selectedTool: HighlightTool;
  onToolChange: (tool: HighlightTool) => void;
  lineHeight: number;
  onLineHeightChange: (height: number) => void;
}

export default function ToolSelector({ 
  selectedTool, 
  onToolChange,
  lineHeight,
  onLineHeightChange 
}: ToolSelectorProps) {
  return (
    <div className="flex gap-4 items-center py-4 px-2 bg-white rounded-lg shadow-sm flex-wrap hover:shadow-lg border border-gray-300/40 transition-all duration-200">
      <span className="font-semibold text-gray-700">Tool Selector:</span>
      
      <div className="flex gap-3">
        <button
          onClick={() => onToolChange('line')}
          className={`px-5 py-2 rounded-md font-medium transition-all duration-200 flex items-center gap-2 ${
            selectedTool === 'line'
              ? 'bg-blue-600 text-white shadow-md'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12h18" />
          </svg>
          Line Marker
        </button>
        
        <button
          onClick={() => onToolChange('box')}
          className={`px-4 py-2 rounded-md font-medium transition-all duration-200 flex items-center gap-2 ${
            selectedTool === 'box'
              ? 'bg-blue-600 text-white shadow-md'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <rect x="3" y="3" width="18" height="18" strokeWidth={2} />
          </svg>
          Box
        </button>
      </div>

      {selectedTool === 'line' && (
        <div className="flex flex-col gap-3">
          <span className="font-semibold text-gray-700">Line Height:</span>
          <div className="flex gap-2 items-center w-full">
          <input
            type="range"
            min="8"
            max="40"
            value={lineHeight}
            onChange={(e) => onLineHeightChange(Number(e.target.value))}
            className="w-50 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
          <span className="text-sm font-semibold text-gray-700 w-12">{lineHeight}px</span>
            </div>
        </div>
      )}
    </div>
  );
}