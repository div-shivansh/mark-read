'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useFileContext } from '../context/FileContext'; // Get AI data from here
import PDFViewer from '../components/PDFViewer'; // Import your new viewer
import ColorPicker from '../components/ColorPicker';
import ToolSelector from '../components/ToolSelector';
import Toolbar from '../components/Toolbar';
import { Highlight, HighlightColor, HighlightTool } from '../types';
import { ArrowLeft } from 'lucide-react';
import * as pdfjsLib from 'pdfjs-dist';
import { PDFDocument, rgb } from 'pdf-lib';
import { toast } from 'react-toastify';
import Image from 'next/image';

// CONSTANT: This must match the scale in PDFViewer
const VIEWER_SCALE = 1.5; 

export default function EditorPage() {
  const router = useRouter();
  const { file, highlights: aiData } = useFileContext(); // Get Global Context
  const toastShowRef = useRef(false)
  
  // Editor State
  const [selectedColor, setSelectedColor] = useState<HighlightColor>('#FFFF00');
  const [selectedTool, setSelectedTool] = useState<HighlightTool>('line');
  const [lineHeight, setLineHeight] = useState<number>(20);
  const [highlights, setHighlights] = useState<Highlight[]>([]);

  useEffect(() => {
    if (aiData && aiData.length === 0 && !toastShowRef.current) {
      toast.error("Error getting highlights. Please use plane PDF files for now")
      toastShowRef.current = true
    }
  }, [aiData])
  
  // 1. Initialize & Convert AI Data
  useEffect(() => {
    if (!file) {
      router.push('/'); // Protect route
      toast.error("File not provided")
      return;
    }

    
    if (aiData && aiData.length > 0 && highlights.length === 0) {
      
      const converted: Highlight[] = aiData.map((aiItem) => {
        // AI returns raw PDF coordinates (Points). 
        // We must scale them to match the Viewer (Pixels).
        const rawRect = aiItem.position.rects[0]; 
        
        return {
          id: aiItem.id,
          pageNumber: aiItem.position.pageNumber,
          color: '#FFFF00', // Default AI Color (Yellow)
          type: 'box',      // AI highlights are usually boxes
          rect: {
            x: rawRect.x1 * VIEWER_SCALE, 
            y: rawRect.y1 * VIEWER_SCALE,
            width: (rawRect.x2 - rawRect.x1) * VIEWER_SCALE,
            height: (rawRect.y2 - rawRect.y1) * VIEWER_SCALE,
          }
        };
      });
      
      setHighlights(converted);
    } 
  }, [file, aiData, router, highlights.length]);

  // 2. Handlers
  const handleAddHighlight = (h: Highlight) => setHighlights([...highlights, h]);
  const handleRemoveHighlight = (id: string) => setHighlights(highlights.filter(h => h.id !== id));
  
  const handleClearAll = () => {
    if (confirm('Clear all highlights?')) setHighlights([]);
  };

  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16) / 255,
      g: parseInt(result[2], 16) / 255,
      b: parseInt(result[3], 16) / 255,
    } : { r: 1, g: 1, b: 0 };
  };

 const handleExport = async () => {
    if (!file) {
      toast.error("File not found")
      return;
    }
      

    try {
      // Load the original PDF
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      
      // Load with pdfjs to get dimensions
      if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
         pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';
      }
      const pdfjs = await pdfjsLib.getDocument(arrayBuffer).promise;
      
      // Process each page
      for (let pageNum = 1; pageNum <= pdfDoc.getPageCount(); pageNum++) {
        const page = pdfDoc.getPage(pageNum - 1);
        const { width, height } = page.getSize();
        
        // Get the viewport for scaling
        const pdfjsPage = await pdfjs.getPage(pageNum);
        const viewport = pdfjsPage.getViewport({ scale: 1.5 });
        
        // Get highlights for this page
        const pageHighlights = highlights.filter(h => h.pageNumber === pageNum);
        
        // Calculate scale factors
        const scaleX = width / viewport.width;
        const scaleY = height / viewport.height;
        
        // Draw highlights
        pageHighlights.forEach(highlight => {
          const color = hexToRgb(highlight.color);
          
          // Convert coordinates (PDF coordinates start from bottom-left)
          const x = highlight.rect.x * scaleX;
          const y = height - (highlight.rect.y * scaleY) - (highlight.rect.height * scaleY);
          const w = highlight.rect.width * scaleX;
          const h = highlight.rect.height * scaleY;
          
          if (highlight.type === 'line') {
            // Draw rounded rectangle for line
            page.drawRectangle({
              x: x,
              y: y,
              width: w,
              height: h,
              color: rgb(color.r, color.g, color.b),
              opacity: 0.3,
            });
          } else {
            // Draw regular rectangle for box
            page.drawRectangle({
              x: x,
              y: y,
              width: w,
              height: h,
              color: rgb(color.r, color.g, color.b),
              opacity: 0.3,
            });
          }
        });
      }

      // Save the PDF
      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes as any], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = file.name.replace('.pdf', '_highlighted.pdf');
      link.click();
      URL.revokeObjectURL(url);
      
      toast.success('PDF exported successfully!');
    } catch (error) {
      console.error('Error exporting PDF:', error);
      toast.error('Failed to export PDF. Please try again.');
    }
  };

  if (!file) return <div className="p-10">Loading Editor...</div>;

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col h-screen">
      
      {/* Top Header */}
      <header className="bg-white border-b border-gray-200 px-6 flex items-center justify-between shadow-sm z-20">
        <div className="flex items-center gap-4">
          <button onClick={() => router.push('/')} className="p-2 hover:bg-gray-100 rounded-full">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div className='w-46'>
          <Image src="/markread.png" alt="logo" width={1000} height={1000} loading="eager" />
          </div>
        </div>
        
        {/* Toolbar Integration */}
        <div className="flex gap-2">
            <Toolbar 
                highlights={highlights}
                onClearAll={handleClearAll}
                onExport={handleExport}
                hasFile={true}
            />
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        
        {/* Sidebar Controls */}
        <aside className="w-80 bg-white border-r border-gray-200 p-4 flex flex-col gap-6 overflow-y-auto z-10 shadow-[2px_0_5px_rgba(0,0,0,0.05)]">
            
            {/* 1. Tools */}
            <div className="space-y-2">
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Tools</h3>
                <ToolSelector
                    selectedTool={selectedTool}
                    onToolChange={setSelectedTool}
                    lineHeight={lineHeight}
                    onLineHeightChange={setLineHeight}
                />
            </div>

            {/* 2. Colors */}
            <div className="space-y-2">
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Colors</h3>
                <ColorPicker
                    selectedColor={selectedColor}
                    onColorChange={setSelectedColor}
                />
            </div>

            {/* 3. Highlight List (Optional: Debugging/Navigation) */}
            <div className="space-y-2 flex-1">
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider flex justify-between">
                    <span>Highlights</span>
                    <span className="bg-gray-100 text-gray-600 px-2 rounded-full text-xs py-0.5">{highlights.length}</span>
                </h3>
                <div className="space-y-2 text-xs text-gray-400 overflow-y-auto h-82">
                    {highlights.map((h, i) => (
                        <div key={i} className="p-2 bg-gray-50 rounded border border-gray-100 flex gap-2 items-center">
                            <div className="w-3 h-3 rounded-full" style={{background: h.color}}></div>
                            <span>Page {h.pageNumber}</span>
                            <span className="capitalize text-gray-300">({h.type})</span>
                        </div>
                    ))}
                </div>
            </div>
        </aside>

        {/* Main PDF Area */}
        <section className="flex-1 bg-gray-100 relative p-4 overflow-hidden">
            <PDFViewer
                file={file}
                selectedColor={selectedColor}
                selectedTool={selectedTool}
                lineHeight={lineHeight}
                highlights={highlights}
                onAddHighlight={handleAddHighlight}
                onRemoveHighlight={handleRemoveHighlight}
                scale={VIEWER_SCALE} 
            />
        </section>
      </div>
    </main>
  );
}