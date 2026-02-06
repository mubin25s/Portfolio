import { useRef, useState, useEffect } from 'react';
import { motion, useAnimationFrame, useMotionValue, useTransform } from 'framer-motion';
import { Github } from 'lucide-react';

const projects = [
    {
        title: "Grade Calculator",
        description: "A dynamic calculator for computing university course grades and GPAs.",
        link: "https://mubin25s.github.io/Course-Grade-Calculator/X_Calculator/Grade_Calculator/index.html",
        github: "https://github.com/mubin25s/Course-Grade-Calculator",
        image: "https://images.unsplash.com/photo-1554224155-6726b3ff858f"
    },
    {
        title: "Pet Shelter",
        description: "A web application for managing pet adoptions and shelter inventory.",
        link: "https://mfathumsachcha-netizen.github.io/petshelter-Demo/",
        github: "https://github.com/mubin25s/Pet_Shelter",
        image: "https://images.unsplash.com/photo-1450778869180-41d0601e046e"
    },
    {
        title: "Pet Shop",
        description: "A full-featured MERN stack application with real-time chat and order management.",
        link: "https://mfathumsachcha-netizen.github.io/petshop-Demo/",
        github: "https://github.com/mubin25s/Pet_Shop-3",
        image: "https://images.unsplash.com/photo-1583337130417-3346a1be7dee"
    },
    {
        title: "Goku Portfolio",
        description: "Stunning personal portfolio with dark theme, glassmorphism, and interactive animations.",
        link: "https://mubin25s.github.io/Portfolio-Goku/",
        github: "https://github.com/mubin25s/Portfolio-Goku",
        image: "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8"
    },
    {
        title: "Library Manager",
        description: "A system for managing library resources efficiently.",
        link: "https://mfathumsachcha-netizen.github.io/library_management-Demo/",
        github: "https://github.com/mubin25s/Library_Management",
        image: "https://images.unsplash.com/photo-1507842217343-583bb7270b66"
    },
    {
        title: "Sneakers Shop",
        description: "A modern e-commerce platform for premium footwear.",
        link: "https://mubin25s.github.io/Sneakers/",
        github: "https://github.com/mubin25s/Sneakers",
        image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff"
    }
];

// Duplicate projects to ensure smooth looping
const displayProjects = [...projects, ...projects, ...projects];

export const Projects = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [baseX, setBaseX] = useState(0);
    const x = useMotionValue(0);

    // Auto-scroll speed
    const speed = -0.5; // Negative for leftward movement

    useAnimationFrame((t, delta) => {
        if (!isDragging) {
            // Update x based on time delta for consistent speed across refresh rates
            const moveBy = speed * (delta / 16);
            const newX = x.get() + moveBy;

            // Wrap logic: when we move past 1/3 of the container, jump back
            // This works because displayProjects is 3x the original list
            if (containerRef.current) {
                const totalWidth = containerRef.current.scrollWidth;
                const setWidth = totalWidth / 3;

                if (newX <= -setWidth) {
                    x.set(newX + setWidth);
                } else if (newX > 0) {
                    x.set(newX - setWidth);
                } else {
                    x.set(newX);
                }
            }
        }
    });

    const handleDragStart = () => setIsDragging(true);
    const handleDragEnd = () => {
        setIsDragging(false);
        // After drag, ensure x is still wrapped correctly next frame
    };

    return (
        <section id="projects" className="snap-section py-8 overflow-hidden flex flex-col justify-center">
            <div className="container mx-auto mb-8 px-6">
                <div className="text-center">
                    <h2 className="text-xl md:text-2xl font-bold mb-2 tracking-[0.4em] uppercase text-white">
                        SELECTED WORKS
                    </h2>
                </div>
            </div>

            <div className="relative flex overflow-hidden cursor-grab active:cursor-grabbing">
                <motion.div
                    ref={containerRef}
                    className="flex gap-4 md:gap-6 py-4 select-none"
                    style={{ x }}
                    drag="x"
                    onDragStart={handleDragStart}
                    onDragEnd={handleDragEnd}
                    dragElastic={0.05}
                    dragMomentum={true}
                    onUpdate={(latest) => {
                        // Keep x within bounds during drag
                        if (isDragging && containerRef.current) {
                            const totalWidth = containerRef.current.scrollWidth;
                            const setWidth = totalWidth / 3;
                            const currentX = latest.x as number;

                            if (currentX <= -setWidth) {
                                x.set(currentX + setWidth);
                            } else if (currentX > 0) {
                                x.set(currentX - setWidth);
                            }
                        }
                    }}
                >
                    {displayProjects.map((project, index) => (
                        <div
                            key={index}
                            className="relative w-[210px] md:w-[280px] lg:w-[320px] flex-shrink-0 group/card pointer-events-none"
                        >
                            <div className="glass-card aspect-[11/16] rounded-2xl overflow-hidden border border-white/5 transition-all duration-300 relative bg-white/[0.03]">
                                <img
                                    src={project.image}
                                    alt={project.title}
                                    loading="lazy"
                                    className="w-full h-full object-cover"
                                />

                                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80"></div>

                                <div className="absolute inset-0 p-4 md:p-6 flex flex-col justify-end">
                                    <h3 className="text-sm md:text-xl font-black mb-1 text-white leading-tight">
                                        {project.title.toUpperCase()}
                                    </h3>

                                    <p className="text-slate-400 text-[10px] md:text-xs line-clamp-2 mb-4 hidden md:block">
                                        {project.description}
                                    </p>

                                    <div className="flex items-center gap-2 mt-2 pointer-events-auto">
                                        <a
                                            href={project.link}
                                            target="_blank"
                                            className="flex-1 py-1.5 md:py-2 bg-primary text-black text-center rounded-xl font-bold text-[9px] md:text-xs hover:bg-white transition-colors"
                                        >
                                            VIEW PROJECT
                                        </a>
                                        <a
                                            href={project.github}
                                            target="_blank"
                                            className="w-8 h-8 md:w-10 md:h-10 bg-white/10 backdrop-blur-sm flex items-center justify-center rounded-xl border border-white/10 hover:bg-white/20 transition-all"
                                        >
                                            <Github size={16} />
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </motion.div>
            </div>

            <div className="mt-12 text-center">
                <p className="text-slate-600 text-[10px] tracking-[0.5em] uppercase animate-pulse">Infinity Series • Swipe to Explore</p>
            </div>
        </section>
    );
};
