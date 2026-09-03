import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, FileText } from 'lucide-react';
import { ResumeModal } from './ResumeModal';

export const Navbar = () => {
    const [scrolled, setScrolled] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [isResumeOpen, setIsResumeOpen] = useState(false);
    const [activeSection, setActiveSection] = useState('#home');

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);

        // Intersection Observer for active section tracking
        const sections = ['home', 'projects', 'activity', 'skills', 'contact'];
        const observerOptions = {
            root: null,
            rootMargin: '-20% 0px -70% 0px', // Trigger when section is in the top portion
            threshold: 0
        };

        const observerCallback = (entries: IntersectionObserverEntry[]) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    setActiveSection(`#${entry.target.id}`);
                } else if (window.scrollY < 100) {
                    setActiveSection('#home');
                }
            });
        };

        const observer = new IntersectionObserver(observerCallback, observerOptions);

        sections.forEach(id => {
            const el = document.getElementById(id);
            if (el) observer.observe(el);
        });

        return () => {
            window.removeEventListener('scroll', handleScroll);
            observer.disconnect();
        };
    }, []);

    const navLinks = [
        { name: 'About', href: '#home' },
        { name: 'Projects', href: '#projects' },
        { name: 'Activity', href: '#activity' },
        { name: 'Skills & Stack', href: '#skills' },
        { name: 'Contact', href: '#contact' },
    ];

    return (
        <>
            <nav className={`fixed top-0 left-0 w-full z-40 transition-all duration-300 ${scrolled ? 'py-4 bg-black/50 backdrop-blur-xl' : 'py-8 bg-transparent'}`}>
                <div className="container max-w-7xl mx-auto px-6 flex items-center justify-between">
                    <motion.a
                        href="#"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-2xl font-black tracking-tighter cursor-pointer"
                        onClick={() => setActiveSection('#home')}
                    >
                        MUBIN<span className="text-primary">.</span>
                    </motion.a>

                    {/* Desktop Nav */}
                    <div className="hidden md:flex items-center gap-10">
                        {navLinks.map((link) => (
                            <a
                                key={link.name}
                                href={link.href}
                                onClick={() => setActiveSection(link.href)}
                                className={`text-sm font-bold uppercase tracking-widest transition-all duration-300 ${activeSection === link.href ? 'text-primary scale-110' : 'text-slate-400 hover:text-white'
                                    }`}
                            >
                                {link.name}
                            </a>
                        ))}
                        <button
                            type="button"
                            onClick={() => setIsResumeOpen(true)}
                            className="flex items-center gap-2 px-6 py-2 rounded-full border border-primary/50 text-primary text-sm font-bold hover:bg-primary hover:text-black transition-all duration-300 cursor-pointer"
                        >
                            <FileText size={16} /> Resume
                        </button>
                    </div>

                    {/* Mobile Toggle */}
                    <button className="md:hidden text-white cursor-pointer" onClick={() => setIsOpen(!isOpen)}>
                        {isOpen ? <X size={28} /> : <Menu size={28} />}
                    </button>
                </div>

                {/* Mobile Menu */}
                <AnimatePresence>
                    {isOpen && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="md:hidden bg-black/95 backdrop-blur-2xl overflow-hidden"
                        >
                            <div className="flex flex-col p-6 gap-6">
                                {navLinks.map((link) => (
                                    <a
                                        key={link.name}
                                        href={link.href}
                                        onClick={() => {
                                            setIsOpen(false);
                                            setActiveSection(link.href);
                                        }}
                                        className={`text-lg font-bold uppercase tracking-widest transition-colors ${activeSection === link.href ? 'text-primary' : 'text-slate-400 hover:text-white'
                                            }`}
                                    >
                                        {link.name}
                                    </a>
                                ))}
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsOpen(false);
                                        setIsResumeOpen(true);
                                    }}
                                    className="flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-primary text-black font-black uppercase tracking-widest cursor-pointer"
                                >
                                    <FileText size={20} /> Resume
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </nav>

            {/* In-Browser PDF Resume Viewer Modal */}
            <ResumeModal isOpen={isResumeOpen} onClose={() => setIsResumeOpen(false)} />
        </>
    );
};
