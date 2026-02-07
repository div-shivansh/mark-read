'use client';

import { useEffect, useRef, useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { Highlight, HighlightColor, HighlightTool } from '../types';
import { toast } from 'react-toastify';

// Ensure worker is set up
if (typeof window !== 'undefined') {
    // Use a local worker or reliable CDN
    pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';
}

interface PDFViewerProps {
    file: File | null;
    selectedColor: HighlightColor;
    selectedTool: HighlightTool;
    lineHeight: number;
    highlights: Highlight[];
    onAddHighlight: (highlight: Highlight) => void;
    onRemoveHighlight: (id: string) => void;
    scale?: number; // Added scale prop
}

export default function PDFViewer({
    file,
    selectedColor,
    selectedTool,
    lineHeight,
    highlights,
    onAddHighlight,
    onRemoveHighlight,
    scale = 1.5, // Default scale match
}: PDFViewerProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [numPages, setNumPages] = useState<number>(0);
    const [pdfDocument, setPdfDocument] = useState<any>(null);
    const [isSelecting, setIsSelecting] = useState(false);
    const [selectionStart, setSelectionStart] = useState<{ x: number; y: number; pageNumber: number } | null>(null);
    const [currentSelection, setCurrentSelection] = useState<{ x: number; y: number; width: number; height: number } | null>(null);
    const [pagesRendered, setPagesRendered] = useState(false)

    // 1. Load PDF
    useEffect(() => {
        if (!file) return;
        const loadPdf = async () => {
            try{
                const buffer = await file.arrayBuffer();
                const pdf = await pdfjsLib.getDocument(buffer).promise;
                setPdfDocument(pdf);
                setNumPages(pdf.numPages);
            } catch (error) {
                console.error("Error loading PDF:", error)
            }
        };
        loadPdf();
    }, [file]);

    // 2. Render Pages
    useEffect(() => {
        if (!pdfDocument || !containerRef.current) return;

        const renderPages = async () => {
            const container = containerRef.current;
            if (!container) return;
            container.innerHTML = ''; // Clear previous

            for (let pageNum = 1; pageNum <= numPages; pageNum++) {
                const page = await pdfDocument.getPage(pageNum);
                const viewport = page.getViewport({ scale }); // Use the prop scale

                // Wrapper
                const pageWrapper = document.createElement('div');
                pageWrapper.className = 'page-wrapper relative mb-5 shadow-lg bg-white mx-auto';
                pageWrapper.style.width = `${viewport.width}px`; // Force exact width
                pageWrapper.style.height = `${viewport.height}px`;
                pageWrapper.dataset.pageNumber = pageNum.toString();

                // Canvas
                const canvas = document.createElement('canvas');
                const context = canvas.getContext('2d');
                canvas.height = viewport.height;
                canvas.width = viewport.width;
                canvas.className = 'block';

                await page.render({ canvasContext: context!, viewport }).promise;

                // Highlight Layer
                const highlightLayer = document.createElement('div');
                highlightLayer.className = 'highlight-layer absolute top-0 left-0 w-full h-full';

                pageWrapper.appendChild(canvas);
                pageWrapper.appendChild(highlightLayer);
                container.appendChild(pageWrapper);
            }
        };
        renderPages();
    }, [pdfDocument, numPages, scale]);

    // 3. Render Highlights (Updates when highlights change)
    useEffect(() => {
        if (!containerRef.current) return;

        const pageWrappers = containerRef.current.querySelectorAll('.page-wrapper');
        pageWrappers.forEach((wrapper) => {
            const pageNumber = parseInt(wrapper.getAttribute('data-page-number') || '0');
            const highlightLayer = wrapper.querySelector('.highlight-layer');
            if (!highlightLayer) return;

            highlightLayer.innerHTML = ''; // Clear layer

            const pageHighlights = highlights.filter((h) => h.pageNumber === pageNumber);
            pageHighlights.forEach((highlight) => {
                const div = document.createElement('div');
                div.className = 'absolute cursor-pointer hover:opacity-80 transition-opacity mix-blend-multiply';

                // Apply Coordinates
                div.style.left = `${highlight.rect.x}px`;
                div.style.top = `${highlight.rect.y}px`;
                div.style.width = `${highlight.rect.width}px`;
                div.style.height = `${highlight.rect.height}px`;
                div.style.backgroundColor = highlight.color;

                if (highlight.type === 'line') {
                    div.style.borderRadius = '4px';
                    div.style.opacity = '0.5';
                } else {
                    div.style.opacity = '0.3';
                }

                // Click to delete
                div.title = 'Click to delete';
                div.onclick = (e) => {
                    e.stopPropagation();
                    toast.success("Deleted the highlight successfully")
                    onRemoveHighlight(highlight.id);
                };

                highlightLayer.appendChild(div);
            });
        });
    }, [highlights, onRemoveHighlight]);

    // --- MOUSE HANDLERS (Same as your upload, kept brief) ---
    const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
        // ... (Copy logic from your uploaded file for handleMouseDown)
        // Ensure you use e.nativeEvent.offsetX if possible, or keep your clientRect logic
        if (!containerRef.current) return;
        const target = e.target as HTMLElement;
        if (target.tagName === 'CANVAS' || target.classList.contains('highlight-layer')) {
            const pageWrapper = target.closest('.page-wrapper');
            if (!pageWrapper) return;

            const rect = pageWrapper.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const pageNumber = parseInt(pageWrapper.getAttribute('data-page-number') || '0');

            setIsSelecting(true);
            setSelectionStart({ x, y, pageNumber });
        }
    };

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!isSelecting || !selectionStart || !containerRef.current) return;

        // Logic to calculate width/height based on mouse movement
        // ... (Use your existing logic)
        const pageWrappers = containerRef.current.querySelectorAll('.page-wrapper');
        pageWrappers.forEach((wrapper) => {
            const pageNum = parseInt(wrapper.getAttribute('data-page-number') || '0');
            if (pageNum === selectionStart.pageNumber) {
                const rect = wrapper.getBoundingClientRect();
                const currentX = e.clientX - rect.left;
                const currentY = e.clientY - rect.top;

                const width = Math.abs(currentX - selectionStart.x);
                const height = selectedTool === 'line' ? lineHeight : Math.abs(currentY - selectionStart.y);
                const x = Math.min(selectionStart.x, currentX);
                const y = selectedTool === 'line' ? selectionStart.y - (lineHeight / 2) : Math.min(selectionStart.y, currentY);

                setCurrentSelection({ x, y, width, height });
            }
        });
    };

    const handleMouseUp = () => {
        if (isSelecting && selectionStart && currentSelection && currentSelection.width > 2) {
            const highlight: Highlight = {
                id: crypto.randomUUID(),
                pageNumber: selectionStart.pageNumber,
                color: selectedColor,
                rect: currentSelection,
                type: selectedTool,
            };
            onAddHighlight(highlight);
        }
        setIsSelecting(false);
        setSelectionStart(null);
        setCurrentSelection(null);
    };

    return (
        <div
            ref={containerRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            className="bg-gray-100 p-8 rounded-lg overflow-y-auto h-full shadow-inner"
            style={{ cursor: isSelecting ? 'text' : 'text' }}
        />
    );
}