import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ZoomIn, ZoomOut, RotateCcw, Download, Maximize2, Minimize2, Loader2, FileText } from 'lucide-react';

interface ResumeModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const ResumeModal: React.FC<ResumeModalProps> = ({ isOpen, onClose }) => {
    const [numPages, setNumPages] = useState<number>(0);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [scale, setScale] = useState<number>(1.2);
    const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const modalRef = useRef<HTMLDivElement>(null);
    const pdfDocRef = useRef<any>(null);
    const pagesContainerRef = useRef<HTMLDivElement>(null);

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
                // Check if pdfjs is already loaded
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
                    setLoading(false);
                }
            } catch (err: any) {
                console.error('Error loading PDF:', err);
                if (isMounted) {
                    setError('Unable to load PDF preview.');
                    setLoading(false);
                }
            }
        };

        initPdf();

        return () => {
            isMounted = false;
        };
    }, [isOpen]);

    // Render pages when pdf or scale changes
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

                    const dpr = window.devicePixelRatio || 1;
                    const viewport = page.getViewport({ scale: scale });

                    const pageWidth = Math.floor(viewport.width);
                    const pageHeight = Math.floor(viewport.height);

                    const pageWrapper = document.createElement('div');
                    pageWrapper.className = 'relative mb-6 rounded-lg shadow-2xl bg-white overflow-hidden';
                    pageWrapper.style.width = `${pageWidth}px`;
                    pageWrapper.style.height = `${pageHeight}px`;

                    const canvas = document.createElement('canvas');
                    const context = canvas.getContext('2d');

                    // High-DPI canvas rendering
                    canvas.width = Math.floor(viewport.width * dpr);
                    canvas.height = Math.floor(viewport.height * dpr);
                    canvas.style.width = `${pageWidth}px`;
                    canvas.style.height = `${pageHeight}px`;
                    canvas.style.display = 'block';

                    if (context) {
                        context.scale(dpr, dpr);
                        const renderContext = {
                            canvasContext: context,
                            viewport: viewport,
                        };
                        await page.render(renderContext).promise;
                    }

                    pageWrapper.appendChild(canvas);

                    // Overlay for clickable links and annotations
                    const annotations = await page.getAnnotations();
                    if (!isMounted) return;

                    if (annotations && annotations.length > 0) {
                        const linkLayer = document.createElement('div');
                        linkLayer.className = 'absolute inset-0 pointer-events-none z-10';

                        for (const annot of annotations) {
                            if (annot.subtype === 'Link' && annot.url) {
                                const rect = annot.rect; // [x1, y1, x2, y2]
                                const [x1, y1, x2, y2] = viewport.convertToViewportRectangle(rect);
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
                                link.className = 'hover:bg-blue-500/20 transition-all rounded-[2px] border border-transparent hover:border-blue-400/40';

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

    const handleZoomIn = () => setScale(prev => Math.min(prev + 0.2, 2.5));
    const handleZoomOut = () => setScale(prev => Math.max(prev - 0.2, 0.6));
    const handleResetZoom = () => setScale(1.2);

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/80 backdrop-blur-md"
                    />

                    {/* Modal Window */}
                    <motion.div
                        ref={modalRef}
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ type: "spring", duration: 0.4, bounce: 0.1 }}
                        className={`relative z-10 w-full ${isFullscreen ? 'h-full max-w-none rounded-none' : 'max-w-5xl h-[90vh] rounded-2xl'
                            } bg-[#0e1217] border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.8)] flex flex-col overflow-hidden`}
                    >
                        {/* Header Bar */}
                        <div className="flex items-center justify-between px-4 sm:px-6 py-3 bg-[#131922] border-b border-white/10 select-none">
                            <div className="flex items-center gap-2 sm:gap-3">
                                <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-center text-primary">
                                    <FileText size={18} />
                                </div>
                                <div>
                                    <h3 className="text-sm sm:text-base font-bold text-white leading-tight">Resume</h3>
                                    <p className="text-[11px] sm:text-xs text-slate-400">K. M. Fathum Mubin Sachcha</p>
                                </div>
                            </div>

                            {/* Toolbar Controls */}
                            <div className="flex items-center gap-1 sm:gap-2">
                                <button
                                    onClick={handleZoomOut}
                                    title="Zoom Out"
                                    className="p-1.5 sm:p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-all"
                                >
                                    <ZoomOut size={18} />
                                </button>
                                <span className="text-xs font-mono text-slate-400 px-1 hidden sm:inline">
                                    {Math.round(scale * 100 / 1.2)}%
                                </span>
                                <button
                                    onClick={handleZoomIn}
                                    title="Zoom In"
                                    className="p-1.5 sm:p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-all"
                                >
                                    <ZoomIn size={18} />
                                </button>
                                <button
                                    onClick={handleResetZoom}
                                    title="Reset Zoom"
                                    className="p-1.5 sm:p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-all hidden sm:flex"
                                >
                                    <RotateCcw size={16} />
                                </button>

                                <div className="h-4 w-[1px] bg-white/10 mx-1 hidden sm:block" />

                                <button
                                    onClick={() => setIsFullscreen(!isFullscreen)}
                                    title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
                                    className="p-1.5 sm:p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-all hidden sm:flex"
                                >
                                    {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
                                </button>

                                <a
                                    href="/mubin.pdf"
                                    download="Mubin_Resume.pdf"
                                    title="Download PDF"
                                    className="p-1.5 sm:p-2 rounded-lg text-slate-400 hover:text-primary hover:bg-primary/10 transition-all flex items-center gap-1.5 text-xs font-medium"
                                >
                                    <Download size={18} />
                                    <span className="hidden md:inline">Download</span>
                                </a>

                                <button
                                    onClick={onClose}
                                    title="Close (Esc)"
                                    className="p-1.5 sm:p-2 ml-1 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all"
                                >
                                    <X size={20} />
                                </button>
                            </div>
                        </div>

                        {/* PDF Viewport */}
                        <div
                            ref={containerRef}
                            className="flex-1 overflow-y-auto overflow-x-auto p-4 sm:p-8 flex flex-col items-center custom-scrollbar bg-[#080b0e]"
                        >
                            {loading && (
                                <div className="my-auto flex flex-col items-center justify-center gap-3 py-20 text-slate-400">
                                    <Loader2 className="w-10 h-10 animate-spin text-primary" />
                                    <p className="text-sm font-medium animate-pulse">Loading resume...</p>
                                </div>
                            )}

                            {error && (
                                <div className="my-auto text-center py-20 max-w-md">
                                    <p className="text-red-400 font-medium mb-4">{error}</p>
                                    <a
                                        href="/mubin.pdf"
                                        download="Mubin_Resume.pdf"
                                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary text-black font-bold text-sm hover:opacity-90 transition-all"
                                    >
                                        <Download size={16} /> Download Resume File
                                    </a>
                                </div>
                            )}

                            <div ref={pagesContainerRef} className="flex flex-col items-center" />
                        </div>

                        {/* Footer Info */}
                        {numPages > 0 && !loading && (
                            <div className="px-4 py-2 bg-[#131922] border-t border-white/5 flex items-center justify-between text-[11px] text-slate-400">
                                <span>{numPages} {numPages === 1 ? 'page' : 'pages'}</span>
                                <span>Scroll to view • Use controls to zoom</span>
                            </div>
                        )}
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
