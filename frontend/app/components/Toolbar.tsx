'use client';

import { Highlight } from "../types";

interface ToolbarProps {
  highlights: Highlight[];
  onClearAll: () => void;
  onExport: () => void;
  hasFile: boolean;
}

export default function Toolbar({
  highlights,
  onClearAll,
  onExport,
  hasFile,
}: ToolbarProps) {

  return (
    <div className="flex gap-4 items-center p-4 bg-white rounded-lg shadow-sm flex-wrap hover:shadow-lg border border-gray-300/40 transition-all duration-200">

      {hasFile && (
        <>
          <div className="px-4 py-2 bg-gray-100 rounded-md text-gray-700 font-medium">
            Highlights: {highlights.length}
          </div>

          <button
            onClick={onClearAll}
            disabled={highlights.length === 0}
            className={`px-5 py-2.5 rounded-md font-medium transition-colors duration-200 ${
              highlights.length === 0
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-red-600 text-white hover:bg-red-700 cursor-pointer'
            }`}
          >
            Clear All
          </button>

          <button
            onClick={onExport}
            disabled={highlights.length === 0}
            className={`px-5 py-2.5 rounded-md font-medium transition-colors duration-200 ${
              highlights.length === 0
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-green-600 text-white hover:bg-green-700 cursor-pointer'
            }`}
          >
            Export Highlights
          </button>
        </>
      )}
    </div>
  );
}