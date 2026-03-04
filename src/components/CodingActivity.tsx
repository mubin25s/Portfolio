import { useState, useEffect, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { GitHubCalendar } from 'react-github-calendar';
import { Github, ExternalLink, GitBranch, GitPullRequest, Flame, Trophy, RefreshCw } from 'lucide-react';
import axios from 'axios';

// Animated counter hook
function useCountUp(target: number | null, duration = 1800) {
    const [count, setCount] = useState(0);
    const rafRef = useRef<number | null>(null);

    useEffect(() => {
        if (target === null) return;
        const start = performance.now();
        const animate = (now: number) => {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            // Ease-out cubic
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(Math.round(eased * target));
            if (progress < 1) {
                rafRef.current = requestAnimationFrame(animate);
            }
        };
        rafRef.current = requestAnimationFrame(animate);
        return () => {
            if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
        };
    }, [target, duration]);

    return count;
}

// Skeleton loader for a stat pill
const StatSkeleton = () => (
    <div className="flex flex-col items-center bg-white/5 border border-white/10 px-4 py-2 rounded-xl animate-pulse w-[90px]">
        <div className="h-6 w-12 bg-white/10 rounded mb-1" />
        <div className="h-2 w-16 bg-white/10 rounded" />
    </div>
);

const REFRESH_INTERVAL = 300; // seconds (5 minutes)

export const CodingActivity = () => {
    // Theme matching the deep burgundy colors from index.css
    const explicitTheme = {
        light: ['#e5e5e5', '#fca5a5', '#ef4444', '#b91c1c', '#80011f'],
        dark: ['#2a2a2a', '#5c0016', '#80011f', '#b3002b', '#e60037'],
    };

    const [currentStreak, setCurrentStreak] = useState<number | null>(null);
    const [maxStreak, setMaxStreak] = useState<number | null>(null);
    const [totalContributions, setTotalContributions] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);
    const [lastUpdated, setLastUpdated] = useState<string>('');
    const [countdown, setCountdown] = useState(REFRESH_INTERVAL);
    const [refreshKey, setRefreshKey] = useState(0); // forces calendar re-render on manual refresh

    const statsRef = useRef<HTMLDivElement>(null);
    const isInView = useInView(statsRef, { once: true, margin: '-60px' });
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

    // Only start counting once visible
    const displayCurrentStreak = isInView ? currentStreak : null;
    const displayMaxStreak = isInView ? maxStreak : null;
    const displayTotal = isInView ? totalContributions : null;

    const animatedCurrent = useCountUp(displayCurrentStreak, 1400);
    const animatedMax = useCountUp(displayMaxStreak, 1800);
    const animatedTotal = useCountUp(displayTotal, 2200);

    const startCountdown = () => {
        setCountdown(REFRESH_INTERVAL);
        if (countdownRef.current) clearInterval(countdownRef.current);
        countdownRef.current = setInterval(() => {
            setCountdown(prev => {
                if (prev <= 1) {
                    clearInterval(countdownRef.current!);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    };

    const fetchStreaks = async (manual = false) => {
        if (manual) setLoading(true);
        try {
            const response = await axios.get('https://streak-stats.demolab.com/?user=mubin25s&type=json');
            const data = response.data;
            setCurrentStreak(data.currentStreak?.length ?? 0);
            setMaxStreak(data.longestStreak?.length ?? 0);
            setTotalContributions(data.totalContributions ?? 0);
            const now = new Date();
            setLastUpdated(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
            if (manual) setRefreshKey(k => k + 1);
            startCountdown();
        } catch (error) {
            console.error("Error fetching GitHub streak data:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStreaks();

        // Auto-refresh every 5 minutes
        intervalRef.current = setInterval(() => {
            fetchStreaks();
        }, REFRESH_INTERVAL * 1000);

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
            if (countdownRef.current) clearInterval(countdownRef.current);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Format countdown as mm:ss
    const formatCountdown = (s: number) => {
        const m = Math.floor(s / 60);
        const sec = s % 60;
        return `${m}:${sec.toString().padStart(2, '0')}`;
    };

    return (
        <section id="activity" className="snap-section px-6 relative flex-col justify-center min-h-screen py-20">
            {/* Background Decorations */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden -z-10">
                <div className="absolute top-[20%] left-[10%] w-72 h-72 bg-primary/5 rounded-full blur-[120px]"></div>
                <div className="absolute bottom-[20%] right-[10%] w-96 h-96 bg-secondary/5 rounded-full blur-[150px]"></div>
            </div>

            <div className="container max-w-5xl mx-auto flex flex-col items-center relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-16 w-full relative"
                >
                    <h2 className="text-4xl md:text-6xl font-black leading-tight text-white mb-4">
                        Coding <span className="text-gradient">Activity</span>
                    </h2>
                </motion.div>

                <div className="relative w-full">
                    {/* Floating Icons */}
                    <motion.div
                        animate={{ y: [0, -15, 0], rotate: [0, -10, 0] }}
                        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute -top-10 -left-6 lg:-left-20 w-16 h-16 glass-card rounded-2xl flex items-center justify-center z-20 border-white/10 hidden md:flex backdrop-blur-xl shadow-xl shadow-black/50"
                    >
                        <GitBranch size={28} className="text-primary" />
                    </motion.div>

                    <motion.div
                        animate={{ y: [0, 20, 0], rotate: [0, 15, 0] }}
                        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                        className="absolute -bottom-10 -right-6 lg:-right-20 w-20 h-20 glass-card rounded-2xl flex items-center justify-center z-20 border-white/10 hidden md:flex backdrop-blur-xl shadow-xl shadow-black/50"
                    >
                        <GitPullRequest size={32} className="text-secondary" />
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        viewport={{ once: true }}
                        className="glass-card p-1 relative overflow-hidden flex flex-col justify-center items-center w-full max-w-5xl group border-primary/20 hover:border-primary/40 transition-all duration-500 hover:shadow-[0_0_40px_rgba(128,1,31,0.15)] bg-black/40 backdrop-blur-2xl"
                    >
                        {/* Shimmer Effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-[100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-in-out pointer-events-none"></div>

                        {/* Card Header */}
                        <div className="w-full flex flex-wrap justify-between items-center p-6 border-b border-white/5 mb-6 gap-4">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary group-hover:scale-110 group-hover:bg-primary/30 transition-all duration-500">
                                    <Github size={24} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-white tracking-tight">mubin25s</h3>
                                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                                        <p className="text-xs text-slate-400 font-medium">GitHub Contributions &amp; Streaks</p>

                                        {/* LIVE badge */}
                                        <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-black uppercase tracking-widest border border-emerald-400/30 bg-emerald-400/5 px-1.5 py-0.5 rounded-md">
                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse inline-block"></span>
                                            LIVE
                                        </span>

                                        {lastUpdated && (
                                            <span className="text-[10px] text-slate-500 font-medium">
                                                Updated {lastUpdated}
                                            </span>
                                        )}

                                        {/* Countdown to next refresh */}
                                        {!loading && (
                                            <span className="flex items-center gap-1 text-[10px] text-slate-500 font-mono">
                                                <RefreshCw size={9} className="opacity-60" />
                                                {formatCountdown(countdown)}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Streak Stats */}
                            <div ref={statsRef} className="flex items-center gap-3 flex-wrap">
                                {loading ? (
                                    <>
                                        <StatSkeleton />
                                        <StatSkeleton />
                                        <StatSkeleton />
                                    </>
                                ) : (
                                    <>
                                        {currentStreak !== null && (
                                            <motion.div
                                                key={`cs-${currentStreak}`}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ duration: 0.4 }}
                                                className="flex flex-col items-center bg-orange-400/5 border border-orange-400/25 px-4 py-2 rounded-xl hover:bg-orange-400/10 transition-colors"
                                            >
                                                <span className="flex items-center gap-1.5 text-orange-400 font-black text-xl tabular-nums">
                                                    <Flame size={18} className="shrink-0" />{animatedCurrent}
                                                </span>
                                                <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold mt-0.5">Current Streak</span>
                                            </motion.div>
                                        )}
                                        {maxStreak !== null && (
                                            <motion.div
                                                key={`ms-${maxStreak}`}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ duration: 0.4, delay: 0.1 }}
                                                className="flex flex-col items-center bg-yellow-400/5 border border-yellow-400/25 px-4 py-2 rounded-xl hover:bg-yellow-400/10 transition-colors"
                                            >
                                                <span className="flex items-center gap-1.5 text-yellow-400 font-black text-xl tabular-nums">
                                                    <Trophy size={18} className="shrink-0" />{animatedMax}
                                                </span>
                                                <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold mt-0.5">Highest Streak</span>
                                            </motion.div>
                                        )}
                                        {totalContributions !== null && (
                                            <motion.div
                                                key={`tc-${totalContributions}`}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ duration: 0.4, delay: 0.2 }}
                                                className="flex flex-col items-center bg-primary/5 border border-primary/25 px-4 py-2 rounded-xl hover:bg-primary/10 transition-colors"
                                            >
                                                <span className="flex items-center gap-1.5 text-primary font-black text-xl tabular-nums">
                                                    {animatedTotal.toLocaleString()}
                                                </span>
                                                <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold mt-0.5">Total Contributions</span>
                                            </motion.div>
                                        )}
                                    </>
                                )}

                                {/* Refresh Button */}
                                <button
                                    onClick={() => {
                                        if (intervalRef.current) clearInterval(intervalRef.current);
                                        fetchStreaks(true);
                                        intervalRef.current = setInterval(() => fetchStreaks(), REFRESH_INTERVAL * 1000);
                                    }}
                                    disabled={loading}
                                    title="Refresh now"
                                    className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-400 hover:text-white transition-colors hover:bg-white/5 px-3 py-2.5 rounded-xl border border-white/10 hover:border-white/20 disabled:opacity-40 disabled:cursor-not-allowed"
                                >
                                    <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                                </button>

                                <a
                                    href="https://github.com/mubin25s"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400 hover:text-white transition-colors hover:bg-white/5 px-4 py-2.5 rounded-xl border border-white/10 hover:border-white/20"
                                >
                                    <span className="hidden sm:inline">View Profile</span> <ExternalLink size={14} />
                                </a>
                            </div>
                        </div>

                        {/* Calendar Body */}
                        <div className="overflow-x-auto text-slate-300 w-full flex justify-center pb-8 px-4 md:px-8 custom-scrollbar">
                            <div className="min-w-fit">
                                <GitHubCalendar
                                    key={refreshKey}
                                    username="mubin25s"
                                    colorScheme="dark"
                                    theme={explicitTheme}
                                    blockSize={14}
                                    blockMargin={5}
                                    fontSize={14}
                                    blockRadius={3}
                                />
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>

            <style>{`
                .custom-scrollbar::-webkit-scrollbar {
                    display: block;
                    height: 8px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: rgba(255, 255, 255, 0.02);
                    border-radius: 4px;
                    margin: 0 20px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(128, 1, 31, 0.3);
                    border-radius: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(128, 1, 31, 0.6);
                }
            `}</style>
        </section>
    );
};
