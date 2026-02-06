import { useState } from 'react';
import { motion, useMotionValue, useTransform, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowLeft, RotateCcw } from 'lucide-react';

interface CardData {
    id: number;
    title: string;
    content: string;
}

const INITIAL_CARDS: CardData[] = [
    { id: 1, title: 'Introduction', content: 'Hello! I am Mubin. Swipe the cards to explore my journey.' },
    { id: 2, title: 'Education', content: 'Currently pursuing a B.Sc. in Software Engineering at Daffodil International University.' },
    { id: 3, title: 'Hobby', content: 'Enjoys exploring computers, editing digital content, and learning new software tools.' },
    { id: 4, title: 'Interests', content: 'Interested in software development, IT systems, and technology-driven problem solving.' },
    { id: 5, title: 'Animal Lover', content: 'Loves animals, enjoys caring for pets.' },
    { id: 6, title: 'Programming Skills', content: 'Actively practices coding in languages like C, Java, and SQL through academic and personal projects.' },
    { id: 7, title: 'Database Enthusiast', content: 'Enjoys designing and implementing database systems, writing complex SQL queries, and managing data structures.' },
    { id: 8, title: 'Problem Solver', content: 'Likes solving data structure and algorithm challenges and building efficient solutions.' },
    { id: 9, title: 'Time Management', content: 'Maintains discipline in balancing academic work, self-learning, and personal projects.' },
    { id: 10, title: 'Continuous Learner', content: 'Always learning new technologies, frameworks, and tools to improve professional skills.' },
    { id: 11, title: 'UI/UX Designer', content: 'Passionately designing user-friendly interfaces and engaging experiences with a focus on aesthetics and functionality.' },
    { id: 12, title: 'Career Goal', content: 'Aspires to become a successful software professional with strong technical and practical expertise.' }
];

const Card = ({ data, index, isTop, onSwipe, total }: { data: CardData; index: number; isTop: boolean; onSwipe: (id: number) => void; total: number }) => {
    const x = useMotionValue(0);
    const rotate = useTransform(x, [-200, 200], [-18, 18]);
    const opacity = useTransform(x, [-200, -150, 0, 150, 200], [0, 1, 1, 1, 0]);

    const [exitX, setExitX] = useState(0);

    const handleDragEnd = (_: any, info: any) => {
        if (!isTop) return;
        const threshold = 100;
        if (info.offset.x > threshold) {
            setExitX(1000);
        } else if (info.offset.x < -threshold) {
            setExitX(-1000);
        }
    };

    // Handle trackpad two-finger swipe
    const handleWheel = (e: React.WheelEvent) => {
        if (!isTop) return;

        // Detect horizontal scroll (two-finger swipe on trackpad)
        if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
            e.preventDefault();
            const threshold = 30;

            if (Math.abs(e.deltaX) > threshold) {
                // Animate the card position first
                const direction = e.deltaX > 0 ? -1 : 1;
                x.set(direction * 150);

                // Then trigger exit after a brief delay
                setTimeout(() => {
                    setExitX(direction * 1000);
                }, 100);
            }
        }
    };

    // Get card display value (A, 2-10, J, Q, K)
    const getCardValue = (id: number) => {
        if (id === 1) return 'A';
        if (id === 11) return 'J';
        if (id === 12) return 'Q';
        if (id === 13) return 'K';
        return String(id);
    };

    const cardValue = getCardValue(data.id);

    return (
        <motion.div
            style={{
                zIndex: index,
                x: isTop ? x : 0,
                rotate: isTop ? rotate : 0,
                opacity: isTop ? opacity : 1 - (total - 1 - index) * 0.3,
                scale: 1 - (total - 1 - index) * 0.05,
                y: (total - 1 - index) * 15,
                aspectRatio: '2.5/3.5'
            }}
            initial={{ scale: 0.9, opacity: 0, y: 50 }}
            animate={{
                scale: 1 - (total - 1 - index) * 0.05,
                opacity: isTop ? 1 : 1 - (total - 1 - index) * 0.3,
                y: (total - 1 - index) * 15,
                x: exitX
            }}
            transition={{ type: "spring", stiffness: 500, damping: 30, mass: 0.25 }}
            drag={isTop ? "x" : false}
            dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
            onDragEnd={handleDragEnd}
            onAnimationComplete={() => {
                if (exitX !== 0) onSwipe(data.id);
            }}
            onWheel={handleWheel}
            className="absolute top-0 left-0 w-full cursor-grab active:cursor-grabbing origin-bottom group"
        >
            {/* Playing card design */}
            <div className="relative w-full h-full bg-white rounded-2xl shadow-2xl overflow-hidden border-4 border-gray-200">
                {/* Ornate border */}
                <div className="absolute inset-0 border-4 border-red-600/30 rounded-2xl">
                    <div className="absolute inset-2 border border-red-500/20 rounded-xl" />
                </div>

                {/* Corner decorations - Top Left */}
                <div className="absolute top-4 left-4 flex flex-col items-center">
                    <div className="text-red-600 font-black text-3xl leading-none">{cardValue}</div>
                    <div className="w-7 h-7 mt-1">
                        <svg viewBox="0 0 24 24" fill="currentColor" className="text-black">
                            <path d="M12 2C12 2 6 8 6 12C6 15 8 16 10 16C10 16 9 18 9 20C9 21 10 22 12 22C14 22 15 21 15 20C15 18 14 16 14 16C16 16 18 15 18 12C18 8 12 2 12 2Z" />
                        </svg>
                    </div>
                </div>

                {/* Corner decorations - Bottom Right */}
                <div className="absolute bottom-4 right-4 flex flex-col items-center rotate-180">
                    <div className="text-red-600 font-black text-3xl leading-none">{cardValue}</div>
                    <div className="w-7 h-7 mt-1">
                        <svg viewBox="0 0 24 24" fill="currentColor" className="text-black">
                            <path d="M12 2C12 2 6 8 6 12C6 15 8 16 10 16C10 16 9 18 9 20C9 21 10 22 12 22C14 22 15 21 15 20C15 18 14 16 14 16C16 16 18 15 18 12C18 8 12 2 12 2Z" />
                        </svg>
                    </div>
                </div>

                {/* Center content area */}
                <div className="absolute inset-0 flex flex-col items-center justify-center p-12">
                    {/* Decorative top flourish */}
                    <div className="mb-6 flex items-center gap-2">
                        <div className="w-12 h-px bg-gradient-to-r from-transparent via-red-500/50 to-transparent" />
                        <div className="w-2 h-2 rounded-full bg-red-600/70 rotate-45 transform" />
                        <div className="w-12 h-px bg-gradient-to-l from-transparent via-red-500/50 to-transparent" />
                    </div>

                    {/* Title */}
                    <h2 className="text-2xl md:text-3xl font-black text-center mb-6 leading-tight text-gray-900">
                        {data.title.split(' ').map((word, i) => (
                            <span key={i} className={i === 0 ? 'text-red-600' : 'text-black'}>
                                {i > 0 && ' '}
                                {word}
                            </span>
                        ))}
                    </h2>

                    {/* Divider */}
                    <div className="w-16 h-1 bg-red-500/30 rounded-full mb-6" />

                    {/* Content */}
                    <p className="text-center text-gray-800 text-sm md:text-base leading-relaxed max-w-xs">
                        {data.content}
                    </p>

                    {/* Decorative bottom flourish */}
                    <div className="mt-6 flex items-center gap-2">
                        <div className="w-12 h-px bg-gradient-to-r from-transparent via-red-500/50 to-transparent" />
                        <div className="w-2 h-2 rounded-full bg-red-600/70 rotate-45 transform" />
                        <div className="w-12 h-px bg-gradient-to-l from-transparent via-red-500/50 to-transparent" />
                    </div>
                </div>

                {/* Subtle pattern overlay */}
                <div className="absolute inset-0 opacity-5 pointer-events-none" style={{
                    backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(128, 1, 31, 0.1) 10px, rgba(128, 1, 31, 0.1) 20px)`
                }} />

                {/* Card shine effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-transparent to-transparent opacity-50 pointer-events-none" />
            </div>
        </motion.div>
    );
};

export const About = () => {
    const [cards, setCards] = useState([...INITIAL_CARDS].reverse());

    const handleSwipe = (id: number) => {
        setCards(prev => prev.filter(c => c.id !== id));
    };

    const resetCards = () => {
        setCards([...INITIAL_CARDS].reverse());
    };

    return (
        <section className="min-h-screen relative overflow-hidden flex flex-col">
            {/* Animated gradient background */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#0a0a0a] via-[#161616] to-[#0a0a0a]" />

            {/* Animated mesh gradient overlay */}
            <div className="absolute inset-0 opacity-30">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[120px] animate-pulse delay-1000" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[150px]" />
            </div>

            {/* Grid pattern overlay */}
            <div className="absolute inset-0 opacity-[0.03]" style={{
                backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
                backgroundSize: '50px 50px'
            }} />

            {/* Floating particles */}
            <div className="absolute inset-0">
                {[...Array(20)].map((_, i) => (
                    <div
                        key={i}
                        className="absolute w-1 h-1 bg-primary/20 rounded-full"
                        style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                            animation: `float ${5 + Math.random() * 10}s ease-in-out infinite`,
                            animationDelay: `${Math.random() * 5}s`
                        }}
                    />
                ))}
            </div>

            <div className="container max-w-4xl mx-auto relative z-10 flex-1 flex flex-col p-8">
                <Link to="/" className="inline-flex items-center gap-2 text-primary hover:text-white transition-colors mb-8 group w-fit">
                    <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                    <span className="font-semibold">Back to Home</span>
                </Link>

                <div className="flex-1 flex flex-col items-center justify-center min-h-[600px]">
                    <motion.h1
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-4xl md:text-5xl font-black mb-12 text-center"
                    >
                        More <span className="text-primary">About Me</span>
                    </motion.h1>

                    <div className="relative w-full max-w-xs mx-auto" style={{ height: '420px' }}>
                        <AnimatePresence>
                            {cards.map((card, index) => (
                                <Card
                                    key={card.id}
                                    data={card}
                                    index={index}
                                    total={cards.length}
                                    isTop={index === cards.length - 1}
                                    onSwipe={handleSwipe}
                                />
                            ))}
                        </AnimatePresence>

                        {cards.length === 0 && (
                            <motion.div
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className="absolute inset-0 rounded-3xl overflow-hidden"
                            >
                                <div className="relative w-full h-full bg-gradient-to-br from-[#0a0a0a] to-[#1a0a0f] rounded-3xl border border-primary/20 backdrop-blur-xl shadow-2xl">
                                    {/* Decorative background elements */}
                                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-[100px] animate-pulse" />
                                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-primary/5 rounded-full blur-[80px] animate-pulse delay-500" />

                                    {/* Confetti particles */}
                                    {[...Array(15)].map((_, i) => (
                                        <motion.div
                                            key={i}
                                            initial={{ y: -20, opacity: 0 }}
                                            animate={{
                                                y: [0, 100, 200],
                                                opacity: [0, 1, 0],
                                                rotate: [0, 360]
                                            }}
                                            transition={{
                                                duration: 3,
                                                delay: i * 0.1,
                                                repeat: Infinity,
                                                repeatDelay: 2
                                            }}
                                            className="absolute w-2 h-2 rounded-full"
                                            style={{
                                                left: `${10 + (i * 5)}%`,
                                                backgroundColor: i % 2 === 0 ? '#80011f' : '#ffffff',
                                                opacity: 0.6
                                            }}
                                        />
                                    ))}

                                    {/* Content */}
                                    <div className="relative h-full flex flex-col items-center justify-center p-8 z-10">
                                        {/* Success icon */}
                                        <motion.div
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                                            className="mb-6"
                                        >
                                            <div className="w-20 h-20 rounded-full bg-primary/20 border-2 border-primary/40 flex items-center justify-center">
                                                <svg className="w-10 h-10 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                </svg>
                                            </div>
                                        </motion.div>

                                        <motion.p
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.3 }}
                                            className="text-2xl md:text-3xl font-black mb-2 text-center bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent"
                                        >
                                            You finally made it to the end!
                                        </motion.p>

                                        <motion.p
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ delay: 0.4 }}
                                            className="text-primary text-lg font-semibold mb-8"
                                        >
                                            Thank you!
                                        </motion.p>

                                        <motion.button
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.5 }}
                                            onClick={resetCards}
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            className="px-8 py-4 rounded-full bg-gradient-to-r from-primary to-primary/80 text-white font-bold flex items-center gap-3 hover:shadow-2xl hover:shadow-primary/40 transition-all duration-300 border border-primary/20"
                                        >
                                            <RotateCcw size={20} className="animate-spin-slow" />
                                            <span>Start Over</span>
                                        </motion.button>

                                        {/* Decorative corner elements */}
                                        <div className="absolute top-4 left-4 w-12 h-12 border-l-2 border-t-2 border-primary/30 rounded-tl-2xl" />
                                        <div className="absolute bottom-4 right-4 w-12 h-12 border-r-2 border-b-2 border-primary/30 rounded-br-2xl" />
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
};
