import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ZoomIn, ZoomOut, RotateCcw, Download, Maximize2, Minimize2, Loader2, FileText, Maximize } from 'lucide-react';

interface ResumeModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const ResumeModal: React.FC<ResumeModalProps> = ({ isOpen, onClose }) => {
    const [numPages, setNumPages] = useState<number>(0);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [scale, setScale] = useState<number>(1.0);
    const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
    const [isMobile, setIsMobile] = useState<boolean>(false);
    
    const containerRef = useRef<HTMLDivElement>(null);
    const modalRef = useRef<HTMLDivElement>(null);
    const pdfDocRef = useRef<any>(null);
    const pagesContainerRef = useRef<HTMLDivElement>(null);
    const initialPageWidthRef = useRef<number>(612); // Standard PDF pt width
    
    // Touch gesture tracking
    const touchStartDistanceRef = useRef<number | null>(null);
    const touchStartScaleRef = useRef<number>(1.0);
    const lastTapRef = useRef<number>(0);

    // Detect screen size
    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 640);
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Calculate fit-to-width scale
    const calculateFitWidthScale = useCallback(() => {
        if (!containerRef.current) return isMobile ? 0.6 : 1.1;
        const containerWidth = containerRef.current.clientWidth;
        const availableWidth = isMobile ? Math.max(containerWidth - 24, 280) : Math.max(containerWidth - 64, 400);
        const pageWidth = initialPageWidthRef.current || 612;
        const targetScale = Math.min(Math.max(availableWidth / pageWidth, 0.45), isMobile ? 1.5 : 2.0);
        return Number(targetScale.toFixed(2));
    }, [isMobile]);

    // Handle Zoom to Fit Width
    const handleFitWidth = useCallback(() => {
        const fitScale = calculateFitWidthScale();
        setScale(fitScale);
    }, [calculateFitWidthScale]);

    // Close on Escape key
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                if (isFullscreen) {
                    setIsFullscreen(false);
                } else {
                    onClose();
                }
            }
        };

        if (isOpen) {
            document.body.style.overflow = 'hidden';
            window.addEventListener('keydown', handleKeyDown);
        } else {
            document.body.style.overflow = 'unset';
        }

        return () => {
            document.body.style.overflow = 'unset';
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [isOpen, isFullscreen, onClose]);

    // Load PDF.js library dynamically
    useEffect(() => {
        if (!isOpen) return;

        let isMounted = true;
        setLoading(true);
        setError(null);

        const initPdf = async () => {
            try {
                let pdfjsLib = (window as any).pdfjsLib;
                if (!pdfjsLib) {
                    await new Promise<void>((resolve, reject) => {
                        const existingScript = document.querySelector('script[src*="pdf.min.js"]');
                        if (existingScript) {
                            existingScript.addEventListener('load', () => resolve());
                            existingScript.addEventListener('error', () => reject(new Error('Failed to load PDF engine')));
                            return;
                        }

                        const script = document.createElement('script');
                        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
                        script.async = true;
                        script.onload = () => resolve();
                        script.onerror = () => reject(new Error('Failed to load PDF viewer engine'));
                        document.head.appendChild(script);
                    });
                    pdfjsLib = (window as any).pdfjsLib;
                }

                if (pdfjsLib) {
                    pdfjsLib.GlobalWorkerOptions.workerSrc =
                        'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

                    const loadingTask = pdfjsLib.getDocument('/mubin.pdf');
                    const pdf = await loadingTask.promise;

                    if (!isMounted) return;

                    pdfDocRef.current = pdf;
                    setNumPages(pdf.numPages);

                    // Get base dimensions from first page
                    const firstPage = await pdf.getPage(1);
                    const unscaledViewport = firstPage.getViewport({ scale: 1.0 });
                    initialPageWidthRef.current = unscaledViewport.width;

                    // Automatically compute initial fit-to-width scale for phone / desktop
                    const initialScale = calculateFitWidthScale();
                    setScale(initialScale);
                    setLoading(false);
                }
            } catch (err: any) {
                console.error('Error loading PDF:', err);
                if (isMounted) {
                    setError('Unable to load PDF preview in browser.');
                    setLoading(false);
                }
            }
        };

        initPdf();

        return () => {
            isMounted = false;
        };
    }, [isOpen, calculateFitWidthScale]);

    // High-DPI Razor Sharp PDF Page Rendering
    useEffect(() => {
        if (!pdfDocRef.current || !pagesContainerRef.current || loading) return;

        let isMounted = true;
        const pdf = pdfDocRef.current;
        const container = pagesContainerRef.current;
        container.innerHTML = '';

        const renderPages = async () => {
            for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
                try {
                    const page = await pdf.getPage(pageNum);
                    if (!isMounted) return;

                    // Use Retina DPI multiplier (capped at 3 for performance)
                    const dpr = Math.min(window.devicePixelRatio || 1, 3);
                    
                    // Display dimensions (logical CSS pixels)
                    const displayViewport = page.getViewport({ scale: scale });
                    const cssWidth = Math.floor(displayViewport.width);
                    const cssHeight = Math.floor(displayViewport.height);

                    // High-resolution render viewport
                    const renderViewport = page.getViewport({ scale: scale * dpr });

                    const pageWrapper = document.createElement('div');
                    pageWrapper.className = 'relative mb-4 sm:mb-6 rounded-md sm:rounded-lg shadow-[0_10px_35px_rgba(0,0,0,0.6)] bg-white overflow-hidden select-none transition-transform duration-150';
                    pageWrapper.style.width = `${cssWidth}px`;
                    pageWrapper.style.height = `${cssHeight}px`;

                    const canvas = document.createElement('canvas');
                    const context = canvas.getContext('2d', { alpha: false });

                    // Canvas buffer pixel resolution
                    canvas.width = Math.floor(renderViewport.width);
                    canvas.height = Math.floor(renderViewport.height);
                    
                    // Canvas visual CSS dimensions
                    canvas.style.width = `${cssWidth}px`;
                    canvas.style.height = `${cssHeight}px`;
                    canvas.style.display = 'block';

                    if (context) {
                        const renderContext = {
                            canvasContext: context,
                            viewport: renderViewport,
                        };
                        await page.render(renderContext).promise;
                    }

                    pageWrapper.appendChild(canvas);

                    // Clickable link annotation layer
                    const annotations = await page.getAnnotations();
                    if (!isMounted) return;

                    if (annotations && annotations.length > 0) {
                        const linkLayer = document.createElement('div');
                        linkLayer.className = 'absolute inset-0 pointer-events-none z-10';

                        for (const annot of annotations) {
                            if (annot.subtype === 'Link' && annot.url) {
                                const rect = annot.rect; // [x1, y1, x2, y2]
                                const [x1, y1, x2, y2] = displayViewport.convertToViewportRectangle(rect);
                                const left = Math.min(x1, x2);
                                const top = Math.min(y1, y2);
                                const width = Math.abs(x2 - x1);
                                const height = Math.abs(y2 - y1);

                                const link = document.createElement('a');
                                link.href = annot.url;
                                link.target = '_blank';
                                link.rel = 'noopener noreferrer';
                                link.title = annot.url;
                                link.style.position = 'absolute';
                                link.style.left = `${left}px`;
                                link.style.top = `${top}px`;
                                link.style.width = `${width}px`;
                                link.style.height = `${height}px`;
                                link.style.cursor = 'pointer';
                                link.style.pointerEvents = 'auto';
                                link.className = 'hover:bg-primary/20 active:bg-primary/30 transition-all rounded-[2px] border border-transparent hover:border-primary/40';

                                linkLayer.appendChild(link);
                            }
                        }

                        pageWrapper.appendChild(linkLayer);
                    }

                    container.appendChild(pageWrapper);
                } catch (renderErr) {
                    console.error(`Error rendering page ${pageNum}:`, renderErr);
                }
            }
        };

        renderPages();

        return () => {
            isMounted = false;
        };
    }, [numPages, scale, loading]);

    // Touch gesture handlers for mobile pinch & double tap
    const handleTouchStart = (e: React.TouchEvent) => {
        if (e.touches.length === 2) {
            const touch1 = e.touches[0];
            const touch2 = e.touches[1];
            const dist = Math.hypot(touch1.clientX - touch2.clientX, touch1.clientY - touch2.clientY);
            touchStartDistanceRef.current = dist;
            touchStartScaleRef.current = scale;
        } else if (e.touches.length === 1) {
            const now = Date.now();
            if (now - lastTapRef.current < 300) {
                // Double tap detected: toggle between fit width and 1.5x zoom
                const fitScale = calculateFitWidthScale();
                if (Math.abs(scale - fitScale) < 0.1) {
                    setScale(Number((fitScale * 1.5).toFixed(2)));
                } else {
                    setScale(fitScale);
                }
            }
            lastTapRef.current = now;
        }
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        if (e.touches.length === 2 && touchStartDistanceRef.current !== null) {
            const touch1 = e.touches[0];
            const touch2 = e.touches[1];
            const dist = Math.hypot(touch1.clientX - touch2.clientX, touch1.clientY - touch2.clientY);
            const factor = dist / touchStartDistanceRef.current;
            const newScale = Math.min(Math.max(touchStartScaleRef.current * factor, 0.45), 2.8);
            setScale(Number(newScale.toFixed(2)));
        }
    };

    const handleTouchEnd = () => {
        touchStartDistanceRef.current = null;
    };

    const handleZoomIn = () => setScale(prev => Math.min(Number((prev + 0.15).toFixed(2)), 2.8));
    const handleZoomOut = () => setScale(prev => Math.max(Number((prev - 0.15).toFixed(2)), 0.45));
    const handleResetZoom = () => setScale(1.0);

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 md:p-6 overflow-hidden">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/85 backdrop-blur-md"
                    />

                    {/* Modal Window: Full-screen on mobile, rounded container on desktop */}
                    <motion.div
                        ref={modalRef}
                        initial={{ opacity: 0, scale: isMobile ? 1 : 0.96, y: isMobile ? 20 : 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: isMobile ? 1 : 0.96, y: isMobile ? 20 : 10 }}
                        transition={{ type: "spring", duration: 0.35, bounce: 0.05 }}
                        className={`relative z-10 w-full ${isFullscreen || isMobile
                            ? 'h-[100dvh] max-w-none rounded-none border-0'
                            : 'max-w-5xl h-[92vh] rounded-2xl border border-white/10'
                            } bg-[#0c1015] shadow-[0_0_60px_rgba(0,0,0,0.9)] flex flex-col overflow-hidden`}
                    >
                        {/* Header Bar */}
                        <div className="flex items-center justify-between px-3.5 sm:px-6 py-2.5 sm:py-3 bg-[#121820] border-b border-white/10 select-none shrink-0">
                            <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-primary/15 border border-primary/40 flex items-center justify-center text-primary shrink-0">
                                    <FileText size={16} className="sm:w-[18px] sm:h-[18px]" />
                                </div>
                                <div className="truncate">
                                    <div className="flex items-center gap-2">
                                        <h3 className="text-sm sm:text-base font-bold text-white leading-tight">Resume</h3>
                                        <span className="hidden xs:inline-block text-[10px] px-1.5 py-0.5 rounded bg-white/10 text-slate-300 font-mono">
                                            PDF
                                        </span>
                                    </div>
                                    <p className="text-[10px] sm:text-xs text-slate-400 truncate">K. M. Fathum Mubin Sachcha</p>
                                </div>
                            </div>

                            {/* Toolbar Controls */}
                            <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
                                <button
                                    onClick={handleZoomOut}
                                    title="Zoom Out"
                                    className="p-1.5 sm:p-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 active:bg-white/15 transition-all"
                                >
                                    <ZoomOut size={17} className="sm:w-[18px] sm:h-[18px]" />
                                </button>

                                <button
                                    onClick={handleFitWidth}
                                    title="Fit to Width"
                                    className="px-1.5 py-1 sm:px-2 sm:py-1 rounded-lg text-[11px] sm:text-xs font-mono font-medium text-slate-300 hover:text-white hover:bg-white/10 active:bg-white/15 transition-all flex items-center gap-1"
                                >
                                    <span>{Math.round(scale * 100)}%</span>
                                    <Maximize size={12} className="opacity-70 hidden xs:inline" />
                                </button>

                                <button
                                    onClick={handleZoomIn}
                                    title="Zoom In"
                                    className="p-1.5 sm:p-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 active:bg-white/15 transition-all"
                                >
                                    <ZoomIn size={17} className="sm:w-[18px] sm:h-[18px]" />
                                </button>

                                <button
                                    onClick={handleResetZoom}
                                    title="Reset Zoom (100%)"
                                    className="p-1.5 sm:p-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-all hidden md:flex"
                                >
                                    <RotateCcw size={15} />
                                </button>

                                <div className="h-4 w-[1px] bg-white/10 mx-0.5 sm:mx-1 hidden sm:block" />

                                <button
                                    onClick={() => setIsFullscreen(!isFullscreen)}
                                    title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
                                    className="p-1.5 sm:p-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-all hidden sm:flex"
                                >
                                    {isFullscreen ? <Minimize2 size={17} /> : <Maximize2 size={17} />}
                                </button>

                                {/* Direct Download Link */}
                                <a
                                    href="/mubin.pdf"
                                    download="Mubin_Resume.pdf"
                                    title="Download PDF Resume"
                                    className="p-1.5 sm:px-3 sm:py-1.5 rounded-lg bg-primary/20 text-primary border border-primary/30 hover:bg-primary hover:text-white active:scale-95 transition-all flex items-center gap-1.5 text-xs font-semibold"
                                >
                                    <Download size={16} />
                                    <span className="hidden sm:inline">Download</span>
                                </a>

                                {/* Close Button */}
                                <button
                                    onClick={onClose}
                                    title="Close (Esc)"
                                    className="p-1.5 sm:p-2 ml-0.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/15 active:bg-red-500/25 transition-all"
                                >
                                    <X size={19} className="sm:w-5 sm:h-5" />
                                </button>
                            </div>
                        </div>

                        {/* PDF Viewport Container */}
                        <div
                            ref={containerRef}
                            onTouchStart={handleTouchStart}
                            onTouchMove={handleTouchMove}
                            onTouchEnd={handleTouchEnd}
                            className="flex-1 overflow-y-auto overflow-x-auto p-2 sm:p-6 md:p-8 flex flex-col items-center custom-scrollbar bg-[#070a0d] touch-pan-y"
                            style={{ WebkitOverflowScrolling: 'touch' }}
                        >
                            {loading && (
                                <div className="my-auto flex flex-col items-center justify-center gap-3 py-24 text-slate-400">
                                    <Loader2 className="w-9 h-9 animate-spin text-primary" />
                                    <p className="text-xs sm:text-sm font-medium animate-pulse text-slate-300">Rendering high-res resume...</p>
                                </div>
                            )}

                            {error && (
                                <div className="my-auto text-center py-20 px-4 max-w-md">
                                    <p className="text-red-400 font-medium text-sm mb-4">{error}</p>
                                    <a
                                        href="/mubin.pdf"
                                        download="Mubin_Resume.pdf"
                                        className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary text-white font-bold text-sm shadow-lg hover:opacity-90 transition-all"
                                    >
                                        <Download size={16} /> Download Resume File
                                    </a>
                                </div>
                            )}

                            {/* Rendered Canvas Pages */}
                            <div ref={pagesContainerRef} className="flex flex-col items-center w-fit mx-auto" />
                        </div>

                        {/* Bottom Bar: Mobile Quick Actions & Info */}
                        {numPages > 0 && !loading && (
                            <div className="px-3 sm:px-6 py-2 bg-[#121820] border-t border-white/10 flex items-center justify-between text-[11px] text-slate-400 select-none shrink-0">
                                <div className="flex items-center gap-2">
                                    <span className="px-2 py-0.5 rounded bg-white/5 text-slate-300 font-medium">
                                        {numPages} {numPages === 1 ? 'Page' : 'Pages'}
                                    </span>
                                    <span className="hidden sm:inline text-slate-500">•</span>
                                    <span className="hidden sm:inline text-slate-400">Pinch or double-tap to zoom</span>
                                </div>

                                <div className="flex items-center gap-2 sm:hidden">
                                    <button
                                        onClick={handleFitWidth}
                                        className="text-[10px] text-primary hover:underline font-medium"
                                    >
                                        Fit Width
                                    </button>
                                </div>

                                <div className="hidden sm:flex items-center gap-3 text-slate-400">
                                    <span>Scroll to read • Use controls to zoom</span>
                                </div>
                            </div>
                        )}
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
