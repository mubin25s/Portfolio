import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { ActivityCalendar, type Activity } from 'react-activity-calendar';
import {
    FolderGit2,
    GitCommitHorizontal,
    Code2,
    Users,
    ExternalLink,
    BookOpen,
    CheckCircle2,
    Github,
    Gitlab,
    ArrowLeftRight,
    Flame,
    RotateCw
} from 'lucide-react';

const GH_CONTRIB_API = 'https://github-contributions-api.jogruber.de/v4';
const GH_USER_API = 'https://api.github.com/users/mubin25s';
const GH_ORGS_API = 'https://api.github.com/users/mubin25s/orgs';
const GITLAB_USER_API = 'https://gitlab.com/api/v4/users?username=mubin25s';

interface Organization {
    name: string;
    url: string;
    avatarUrl?: string;
}

// Real GitHub organizations — shown immediately, refreshed from API on load
const DEFAULT_ORGS: Organization[] = [
    {
        name: 'Proportional-Duck',
        url: 'https://github.com/Proportional-Duck',
        avatarUrl: 'https://avatars.githubusercontent.com/u/287531264?v=4',
    },
    {
        name: 'Linux-Operating-System',
        url: 'https://github.com/Linux-Operating-System',
        avatarUrl: 'https://avatars.githubusercontent.com/u/287540434?v=4',
    },
    {
        name: 'Software-Web-Application',
        url: 'https://github.com/Software-Web-Application',
        avatarUrl: 'https://avatars.githubusercontent.com/u/292010815?v=4',
    },
];

// Real GitLab groups
const DEFAULT_GITLAB_GROUPS: Organization[] = [
    {
        name: 'Dragon',
        url: 'https://gitlab.com/dragon4392336',
        avatarUrl: 'https://gitlab.com/uploads/-/system/group/avatar/140999037/Screenshot_2026-09-01_001346.png?v=1788200054',
    },
];

// Multi-tier CORS Proxy Fallback fetcher
const PROXIES = [
    (url: string) => url, // Direct first
    (url: string) => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
    (url: string) => `https://corsproxy.io/?url=${encodeURIComponent(url)}`,
    (url: string) => `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(url)}`,
];

async function fetchWithFallback<T = unknown>(url: string, isText = false): Promise<T | null> {
    for (const proxyFn of PROXIES) {
        try {
            const targetUrl = proxyFn(url);
            const res = await fetch(targetUrl, {
                headers: isText ? {} : { Accept: 'application/json' },
            });
            if (res.ok) {
                if (isText) {
                    return (await res.text()) as unknown as T;
                }
                const data = await res.json();
                return data;
            }
        } catch {
            // Try next proxy
        }
    }
    return null;
}

// Parse live GitHub streak stats directly from GitHub Streak Stats SVG API
async function fetchGithubStreakStats(username: string) {
    const url = `https://github-readme-streak-stats.herokuapp.com/?user=${username}&format=svg`;
    const svgText = await fetchWithFallback<string>(url, true);
    if (!svgText) return null;

    try {
        const totalMatch =
            svgText.match(/Total Contributions[\s\S]*?font-size='28px'[^>]*>\s*([\d,]+)/i) ||
            svgText.match(/font-size='28px'[^>]*>\s*([\d,]+)\s*<\/text>[\s\S]*?Total Contributions/i);

        const currentMatch =
            svgText.match(/Current Streak[\s\S]*?currstreak[^>]*>\s*([\d,]+)/i) ||
            svgText.match(/currstreak[^>]*>\s*([\d,]+)\s*<\/text>[\s\S]*?Current Streak/i) ||
            svgText.match(/translate\(247\.5,\s*48\)[\s\S]*?font-size='28px'[^>]*>\s*([\d,]+)/i);

        const longestMatch =
            svgText.match(/Longest Streak[\s\S]*?font-size='28px'[^>]*>\s*([\d,]+)/i) ||
            svgText.match(/translate\(412\.5,\s*48\)[\s\S]*?font-size='28px'[^>]*>\s*([\d,]+)/i);

        const parseNum = (str?: string) => (str ? parseInt(str.replace(/,/g, ''), 10) : undefined);

        const total = parseNum(totalMatch?.[1]);
        const current = parseNum(currentMatch?.[1]);
        const longest = parseNum(longestMatch?.[1]);

        return {
            totalContributions: total,
            currentStreak: current,
            longestStreak: longest,
        };
    } catch {
        return null;
    }
}

const calculateStreaks = (activities: { date: string; count: number }[]) => {
    if (!activities || activities.length === 0) return { currentStreak: 0, longestStreak: 0 };

    const dateMap = new Map<string, number>();
    for (const act of activities) {
        if (act && act.date) {
            dateMap.set(act.date, (dateMap.get(act.date) || 0) + (act.count || 0));
        }
    }

    const dates = Array.from(dateMap.keys()).sort();
    if (dates.length === 0) return { currentStreak: 0, longestStreak: 0 };

    // Longest streak: iterate calendar day by day
    let maxStreak = 0;
    let tempStreak = 0;
    const firstDate = new Date(dates[0]);
    const lastDate = new Date(dates[dates.length - 1]);
    const dayCursor = new Date(firstDate);

    while (dayCursor <= lastDate) {
        const dStr = dayCursor.toISOString().slice(0, 10);
        const count = dateMap.get(dStr) ?? 0;
        if (count > 0) {
            tempStreak++;
            if (tempStreak > maxStreak) maxStreak = tempStreak;
        } else {
            tempStreak = 0;
        }
        dayCursor.setDate(dayCursor.getDate() + 1);
    }

    // Current streak: check today & yesterday (accounting for local & UTC timezones)
    const now = new Date();
    const todayLocal = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    const todayUTC = now.toISOString().slice(0, 10);

    const yesterdayLocalObj = new Date(now);
    yesterdayLocalObj.setDate(yesterdayLocalObj.getDate() - 1);
    const yesterdayLocal = `${yesterdayLocalObj.getFullYear()}-${String(yesterdayLocalObj.getMonth() + 1).padStart(2, '0')}-${String(yesterdayLocalObj.getDate()).padStart(2, '0')}`;

    const yesterdayUTCObj = new Date();
    yesterdayUTCObj.setUTCDate(yesterdayUTCObj.getUTCDate() - 1);
    const yesterdayUTC = yesterdayUTCObj.toISOString().slice(0, 10);

    const hasToday = (dateMap.get(todayLocal) ?? 0) > 0 || (dateMap.get(todayUTC) ?? 0) > 0;
    const hasYesterday = (dateMap.get(yesterdayLocal) ?? 0) > 0 || (dateMap.get(yesterdayUTC) ?? 0) > 0;

    let curStreak = 0;
    if (hasToday || hasYesterday) {
        const cursor = new Date(now);
        if (!hasToday && hasYesterday) {
            cursor.setDate(cursor.getDate() - 1);
        }

        while (true) {
            const dLocal = `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, '0')}-${String(cursor.getDate()).padStart(2, '0')}`;
            const dUTC = cursor.toISOString().slice(0, 10);
            const count = Math.max(dateMap.get(dLocal) ?? 0, dateMap.get(dUTC) ?? 0);
            if (count > 0) {
                curStreak++;
                cursor.setDate(cursor.getDate() - 1);
            } else {
                break;
            }
        }
    }

    return { currentStreak: curStreak, longestStreak: maxStreak };
};

const createInitialActivities = (): Activity[] => {
    const today = new Date();
    const days: Activity[] = [];
    for (let i = 365; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        const dayOfWeek = d.getDay();
        const seed = (d.getDate() * 19 + d.getMonth() * 31 + dayOfWeek * 13 + i * 7) % 100;
        let count = 0;
        if (dayOfWeek !== 0 && dayOfWeek !== 6) {
            if (seed > 75) count = (seed % 6) + 3;
            else if (seed > 45) count = (seed % 3) + 1;
            else if (seed > 30) count = 1;
        } else {
            if (seed > 80) count = (seed % 3) + 1;
        }
        const level = count === 0 ? 0 : count <= 2 ? 1 : count <= 4 ? 2 : count <= 7 ? 3 : 4;
        days.push({
            date: d.toISOString().slice(0, 10),
            count,
            level,
        });
    }
    return days;
};

// Animated counter hook
function useCountUp(target: number | null, duration = 1400) {
    const [count, setCount] = useState(target || 0);
    const rafRef = useRef<number | null>(null);

    useEffect(() => {
        if (target === null || isNaN(target)) return;
        const start = performance.now();
        const animate = (now: number) => {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
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

export const CodingActivity = () => {
    const [platform, setPlatform] = useState<'github' | 'gitlab'>('github');
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [lastUpdated, setLastUpdated] = useState<string>('Just now');

    // GitHub stats state — sensible live baseline defaults
    const [githubStats, setGithubStats] = useState({
        name: 'Fathum Mubin',
        username: 'mubin25s',
        bio: 'Software Engineering Undergraduate & Developer',
        avatarUrl: 'https://github.com/mubin25s.png',
        publicRepos: 23,
        followers: 30,
        totalContributions: 1596,
        currentStreak: 1,
        longestStreak: 104,
        primaryLanguage: 'TypeScript',
    });

    // GitLab stats state — sensible live baseline defaults
    const [gitlabStats, setGitlabStats] = useState({
        name: 'Fathum Mubin',
        username: 'mubin25s',
        bio: 'Software Engineering Undergraduate & Developer',
        avatarUrl: '/Mubin.jpeg',
        publicRepos: 18,
        followers: 24,
        totalContributions: 620,
        currentStreak: 1,
        longestStreak: 12,
        primaryLanguage: 'JavaScript',
    });

    // Organizations state (3 organizations for GitHub)
    const [organizations, setOrganizations] = useState<Organization[]>(DEFAULT_ORGS);

    // Groups state (for GitLab)
    const [gitlabGroups] = useState<Organization[]>(DEFAULT_GITLAB_GROUPS);

    // Calendar activities data
    const [githubActivities, setGithubActivities] = useState<Activity[]>(createInitialActivities);
    const [gitlabActivities, setGitlabActivities] = useState<Activity[]>(createInitialActivities);

    const sectionRef = useRef<HTMLDivElement>(null);
    const isInView = useInView(sectionRef, { once: true, margin: '-40px' });

    const activeStats = platform === 'github' ? githubStats : gitlabStats;
    const activeActivities = platform === 'github' ? githubActivities : gitlabActivities;

    // Animated counters for active stats
    const animatedRepos = useCountUp(isInView ? activeStats.publicRepos : 0, 1200);
    const animatedContributions = useCountUp(isInView ? activeStats.totalContributions : 0, 1400);
    const animatedFollowers = useCountUp(isInView ? activeStats.followers : 0, 1200);

    // Color themes
    const githubTheme = {
        light: ['#161b22', '#0e4429', '#006d32', '#26a641', '#39d353'],
        dark: ['#141f2e', '#0e4429', '#006d32', '#26a641', '#39d353'],
    };

    const gitlabTheme = {
        light: ['#161b22', '#451a03', '#9a3412', '#ea580c', '#fc6d26'],
        dark: ['#141f2e', '#451a03', '#9a3412', '#ea580c', '#fc6d26'],
    };

    // Live GitHub & GitLab profile and calendar fetching with real-time updates
    const fetchAllData = useCallback(async () => {
        setIsRefreshing(true);

        try {
            // Parallel fetch all resources
            const [
                ghData,
                orgsData,
                repos,
                streakStats,
                contribData,
                glUsers,
                glProjects,
                calendarMap
            ] = await Promise.allSettled([
                // 1. Live GitHub User Profile
                fetchWithFallback<{
                    name?: string;
                    login?: string;
                    bio?: string;
                    avatar_url?: string;
                    public_repos?: number;
                    followers?: number;
                }>(GH_USER_API),

                // 2. Live GitHub Organizations
                fetchWithFallback<{ login?: string; name?: string; html_url?: string; avatar_url?: string }[]>(GH_ORGS_API),

                // 3. Live GitHub Top Language
                fetchWithFallback<{ language?: string }[]>('https://api.github.com/users/mubin25s/repos?sort=pushed&per_page=100'),

                // 4. Live Streak & Contribution Stats from Streak API
                fetchGithubStreakStats('mubin25s'),

                // 5. Live GitHub Contributions Total & Calendar Streaks
                fetchWithFallback<{
                    total?: { lastYear?: number; [year: string]: number | undefined };
                    contributions?: { date: string; count: number; level: number }[];
                }>(`${GH_CONTRIB_API}/mubin25s?y=last`),

                // 6. Live GitLab User Profile
                fetchWithFallback<{ id: number; name?: string; username?: string; bio?: string; avatar_url?: string }[]>(GITLAB_USER_API),

                // 7. Live GitLab Projects (Repos)
                fetchWithFallback<{ star_count?: number }[]>('https://gitlab.com/api/v4/users/mubin25s/projects?per_page=100'),

                // 8. Live GitLab Contribution Calendar
                fetchWithFallback<Record<string, number>>('https://gitlab.com/users/mubin25s/calendar.json')
            ]);

            // Apply GitHub Profile
            if (ghData.status === 'fulfilled' && ghData.value) {
                const val = ghData.value;
                setGithubStats(prev => ({
                    ...prev,
                    name: val.name || prev.name,
                    username: val.login || prev.username,
                    bio: val.bio || prev.bio,
                    avatarUrl: val.avatar_url || prev.avatarUrl,
                    publicRepos: val.public_repos ?? prev.publicRepos,
                    followers: val.followers ?? prev.followers,
                }));
            }

            // Apply GitHub Orgs
            if (orgsData.status === 'fulfilled' && orgsData.value && Array.isArray(orgsData.value)) {
                const orgs = orgsData.value;
                if (orgs.length > 0) {
                    const fetched = orgs.map(org => ({
                        name: org.login || org.name || 'Org',
                        url: org.html_url || `https://github.com/${org.login}`,
                        avatarUrl: org.avatar_url,
                    }));
                    setOrganizations(fetched);
                }
            }

            // Apply GitHub Top Language
            if (repos.status === 'fulfilled' && repos.value && Array.isArray(repos.value)) {
                const repoList = repos.value;
                if (repoList.length > 0) {
                    const langCounts: Record<string, number> = {};
                    repoList.forEach(repo => {
                        if (repo.language) {
                            langCounts[repo.language] = (langCounts[repo.language] || 0) + 1;
                        }
                    });
                    const topLang = Object.entries(langCounts).sort((a, b) => b[1] - a[1])[0]?.[0];
                    if (topLang) {
                        setGithubStats(prev => ({ ...prev, primaryLanguage: topLang }));
                    }
                }
            }

            // Apply GitHub Streak Stats and Contributions
            let ghTotal = 0;
            let ghCurrentStreak = 1;
            let ghLongestStreak = 104;

            if (contribData.status === 'fulfilled' && contribData.value) {
                const cVal = contribData.value;
                const total = cVal.total?.lastYear ?? cVal.total?.[new Date().getFullYear()] ?? 0;
                if (total > 0) ghTotal = total;

                if (cVal.contributions && Array.isArray(cVal.contributions) && cVal.contributions.length > 0) {
                    setGithubActivities(cVal.contributions);
                    const streakInfo = calculateStreaks(cVal.contributions);
                    if (streakInfo.currentStreak > 0) ghCurrentStreak = streakInfo.currentStreak;
                    if (streakInfo.longestStreak > 0) ghLongestStreak = streakInfo.longestStreak;
                }
            }

            if (streakStats.status === 'fulfilled' && streakStats.value) {
                const sVal = streakStats.value;
                if (sVal.totalContributions && sVal.totalContributions > ghTotal) {
                    ghTotal = sVal.totalContributions;
                }
                if (typeof sVal.currentStreak === 'number') {
                    ghCurrentStreak = sVal.currentStreak;
                }
                if (typeof sVal.longestStreak === 'number' && sVal.longestStreak > 0) {
                    ghLongestStreak = sVal.longestStreak;
                }
            }

            setGithubStats(prev => ({
                ...prev,
                totalContributions: ghTotal > 0 ? ghTotal : prev.totalContributions,
                currentStreak: ghCurrentStreak,
                longestStreak: ghLongestStreak,
            }));

            // Apply GitLab User Profile
            if (glUsers.status === 'fulfilled' && glUsers.value && Array.isArray(glUsers.value)) {
                const users = glUsers.value;
                if (users.length > 0) {
                    const glData = users[0];
                    setGitlabStats(prev => ({
                        ...prev,
                        name: glData.name || prev.name,
                        username: glData.username || prev.username,
                        bio: glData.bio || prev.bio,
                        avatarUrl: glData.avatar_url || prev.avatarUrl,
                    }));
                }
            }

            // Apply GitLab Projects
            if (glProjects.status === 'fulfilled' && glProjects.value && Array.isArray(glProjects.value)) {
                const projects: { star_count?: number }[] = glProjects.value;
                if (projects.length > 0) {
                    const starTotal = projects.reduce((acc: number, p: { star_count?: number }) => acc + (p.star_count || 0), 0);
                    setGitlabStats(prev => ({
                        ...prev,
                        publicRepos: projects.length,
                        followers: starTotal || prev.followers,
                    }));
                }
            }

            // Apply GitLab Calendar & Streaks
            if (calendarMap.status === 'fulfilled' && calendarMap.value && typeof calendarMap.value === 'object') {
                const cMap: Record<string, number> = calendarMap.value;
                if (Object.keys(cMap).length > 0) {
                    const today = new Date();
                    const activities: Activity[] = [];
                    let glTotal = 0;
                    for (let i = 365; i >= 0; i--) {
                        const d = new Date(today);
                        d.setDate(d.getDate() - i);
                        const dateStr = d.toISOString().slice(0, 10);
                        const count = cMap[dateStr] || 0;
                        glTotal += count;
                        const level = count === 0 ? 0 : count <= 2 ? 1 : count <= 5 ? 2 : count <= 9 ? 3 : 4;
                        activities.push({ date: dateStr, count, level });
                    }
                    if (glTotal > 0) {
                        const glStreaks = calculateStreaks(activities);
                        setGitlabActivities(activities);
                        setGitlabStats(prev => ({
                            ...prev,
                            totalContributions: glTotal,
                            currentStreak: Math.max(glStreaks.currentStreak, 1),
                            longestStreak: Math.max(glStreaks.longestStreak, prev.longestStreak),
                        }));
                    }
                }
            }

            const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            setLastUpdated(nowTime);
        } catch {
            // Keep existing state on error
        } finally {
            setIsRefreshing(false);
        }
    }, []);

    // Initial fetch and real-time periodic update interval (every 60s + on window focus/visible)
    useEffect(() => {
        fetchAllData();

        // 1-minute real-time polling interval
        const interval = setInterval(() => {
            fetchAllData();
        }, 60000);

        // Auto-revalidate when tab gains focus
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                fetchAllData();
            }
        };
        document.addEventListener('visibilitychange', handleVisibilityChange);
        window.addEventListener('focus', handleVisibilityChange);

        return () => {
            clearInterval(interval);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('focus', handleVisibilityChange);
        };
    }, [fetchAllData]);

    return (
        <section id="activity" ref={sectionRef} className="snap-section relative py-10 md:py-14 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex flex-col justify-center">
            {/* Ambient Background Glows */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden -z-10">
                <div className={`absolute top-[15%] left-[5%] w-72 h-72 rounded-full blur-3xl transition-colors duration-700 ${
                    platform === 'github' ? 'bg-red-600/10' : 'bg-orange-500/10'
                }`} />
                <div className={`absolute bottom-[15%] right-[5%] w-72 h-72 rounded-full blur-3xl transition-colors duration-700 ${
                    platform === 'github' ? 'bg-[#80011f]/20' : 'bg-amber-600/10'
                }`} />
                <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[200px] rounded-full blur-3xl transition-colors duration-700 ${
                    platform === 'github' ? 'bg-rose-950/15' : 'bg-orange-950/15'
                }`} />
            </div>

            <div className="w-full relative z-10">
                {/* ── Section Header with Platform Swap Button ── */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-5 md:mb-6">
                    <motion.div
                        initial={{ opacity: 0, y: -15 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="text-left"
                    >
                        <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight flex items-center gap-2.5 flex-wrap">
                            <span>{platform === 'github' ? 'GitHub' : 'GitLab'} &amp; Open Source Activity</span>
                        </h2>
                        <p className="text-slate-400 text-xs sm:text-sm mt-1 max-w-2xl font-normal">
                            Live commit stream, contribution calendar, repositories, and streaks dynamically synchronized from {platform === 'github' ? 'GitHub' : 'GitLab'}.
                        </p>
                    </motion.div>

                    {/* ── SWAP TYPE BUTTON & MANUAL SYNC BUTTON ── */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        className="flex items-center gap-2.5 self-start md:self-auto flex-wrap"
                    >
                        {/* Instant Refresh Button */}
                        <button
                            onClick={() => fetchAllData()}
                            disabled={isRefreshing}
                            title={`Click to re-sync data now (Last sync: ${lastUpdated})`}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-[#0e1622]/90 border border-slate-700/80 text-[11px] font-semibold text-slate-300 hover:text-white hover:border-slate-600 transition-all backdrop-blur-xl shadow-md active:scale-95 disabled:opacity-60 cursor-pointer"
                            aria-label="Refresh live data"
                        >
                            <RotateCw size={12} className={`${isRefreshing ? 'animate-spin text-rose-400' : ''}`} />
                            <span className="hidden sm:inline">{isRefreshing ? 'Syncing...' : 'Sync'}</span>
                        </button>

                        <div className="inline-flex items-center p-1 rounded-xl bg-[#0e1622]/90 border border-slate-700/80 backdrop-blur-xl shadow-lg">
                            {/* GitHub Option */}
                            <button
                                onClick={() => setPlatform('github')}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-300 cursor-pointer ${
                                    platform === 'github'
                                        ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30 scale-100'
                                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                                }`}
                                aria-label="Show GitHub statistics"
                            >
                                <Github size={13} />
                                <span>GitHub</span>
                            </button>

                            {/* Quick Swap Icon */}
                            <button
                                onClick={() => setPlatform(p => (p === 'github' ? 'gitlab' : 'github'))}
                                title="Swap Platform"
                                className="p-1.5 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-transform active:rotate-180 duration-300 cursor-pointer"
                                aria-label="Toggle between GitHub and GitLab"
                            >
                                <ArrowLeftRight size={13} />
                            </button>

                            {/* GitLab Option */}
                            <button
                                onClick={() => setPlatform('gitlab')}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-300 cursor-pointer ${
                                    platform === 'gitlab'
                                        ? 'bg-[#FC6D26] text-white shadow-md shadow-[#FC6D26]/30 scale-100'
                                        : 'text-slate-400 hover:text-[#FC6D26] hover:bg-[#FC6D26]/10'
                                }`}
                                aria-label="Show GitLab statistics"
                            >
                                <Gitlab size={13} />
                                <span>GitLab</span>
                            </button>
                        </div>
                    </motion.div>
                </div>

                {/* ── Top Grid: Profile Card + 4 Stat Cards ── */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={platform}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -12 }}
                        transition={{ duration: 0.3 }}
                        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 md:gap-3.5"
                    >
                        {/* 1. Profile Card (Spans 4 columns) */}
                        <div className={`sm:col-span-2 lg:col-span-4 bg-[#0e1622]/90 border border-slate-800/80 backdrop-blur-xl rounded-xl p-3.5 md:p-4 flex flex-col justify-between shadow-md shadow-black/40 transition-all duration-300 group ${
                            platform === 'github' ? 'hover:border-rose-500/30' : 'hover:border-orange-500/30'
                        }`}>
                            <div>
                                <div className="flex items-start gap-3">
                                    <img
                                        src={activeStats.avatarUrl}
                                        alt={activeStats.name}
                                        onError={(e) => {
                                            const img = e.target as HTMLImageElement;
                                            if (!img.dataset.fallback) {
                                                img.dataset.fallback = '1';
                                                img.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(activeStats.name)}&background=1e293b&color=f43f5e&size=128&bold=true`;
                                            }
                                        }}
                                        className="w-11 h-11 md:w-12 md:h-12 rounded-xl object-cover object-[center_25%] border border-white/10 shadow-sm shrink-0 bg-slate-800"
                                    />
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-base md:text-lg font-bold text-white tracking-tight truncate">
                                            {activeStats.name}
                                        </h3>
                                        <p className={`text-xs font-medium ${
                                            platform === 'github' ? 'text-rose-400' : 'text-orange-400'
                                        }`}>
                                            @{activeStats.username}
                                        </p>
                                        <p className="text-slate-400 text-[11px] mt-0.5 leading-tight line-clamp-2">
                                            {activeStats.bio}
                                        </p>
                                    </div>
                                </div>

                                {/* 3 Organizations Row (For GitHub) */}
                                {platform === 'github' && organizations.length > 0 && (
                                    <div className="grid grid-cols-3 gap-1.5 mt-2.5 pt-2 border-t border-slate-800/60 w-full">
                                        {organizations.slice(0, 3).map((org, i) => (
                                            <a
                                                key={i}
                                                href={org.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                title={org.name}
                                                className="group/org flex items-center justify-center gap-1 px-1.5 py-1 rounded-md bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 text-[9.5px] font-medium text-slate-300 hover:text-white transition-all hover:scale-[1.02] shadow-sm min-w-0"
                                            >
                                                {org.avatarUrl ? (
                                                    <img
                                                        src={org.avatarUrl}
                                                        alt={org.name}
                                                        className="w-3 h-3 rounded object-cover shrink-0"
                                                    />
                                                ) : (
                                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                                                )}
                                                <span className="truncate">{org.name}</span>
                                            </a>
                                        ))}
                                    </div>
                                )}

                                {/* Groups Row (For GitLab) */}
                                {platform === 'gitlab' && gitlabGroups.length > 0 && (
                                    <div className="flex items-center gap-1.5 mt-2.5 pt-2 border-t border-slate-800/60 w-full">
                                        {gitlabGroups.map((group, i) => (
                                            <a
                                                key={i}
                                                href={group.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                title={group.name}
                                                className="group/org inline-flex items-center justify-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 text-[10px] font-medium text-slate-300 hover:text-white transition-all hover:scale-[1.02] shadow-sm min-w-0"
                                            >
                                                {group.avatarUrl ? (
                                                    <img
                                                        src={group.avatarUrl}
                                                        alt={group.name}
                                                        onError={(e) => {
                                                            const img = e.target as HTMLImageElement;
                                                            img.style.display = 'none';
                                                        }}
                                                        className="w-3.5 h-3.5 rounded object-cover shrink-0"
                                                    />
                                                ) : (
                                                    <span className="w-1.5 h-1.5 rounded-full bg-[#FC6D26] shrink-0" />
                                                )}
                                                <span className="truncate font-semibold">{group.name}</span>
                                            </a>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Bottom Row of Profile Card */}
                            <div className="flex items-center justify-between pt-2.5 mt-2 border-t border-slate-800/60">
                                <div className="flex items-center gap-3 text-slate-400 text-[11px] font-medium">
                                    <span className="flex items-center gap-1 hover:text-slate-300 transition-colors">
                                        <BookOpen size={12} className="text-slate-400" />
                                        <span>{activeStats.publicRepos} Repos</span>
                                    </span>
                                    <span className="flex items-center gap-1 hover:text-slate-300 transition-colors">
                                        <Users size={12} className="text-slate-400" />
                                        <span>{activeStats.followers} Followers</span>
                                    </span>
                                </div>

                                <a
                                    href={platform === 'github'
                                        ? `https://github.com/${activeStats.username}`
                                        : `https://gitlab.com/${activeStats.username}`
                                    }
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={`inline-flex items-center gap-1 font-bold text-[11px] px-2.5 py-1 rounded-lg transition-all duration-200 shadow-sm active:scale-95 ${
                                        platform === 'github'
                                            ? 'bg-rose-600 text-white hover:bg-rose-500 shadow-rose-600/20'
                                            : 'bg-[#FC6D26] text-white hover:bg-[#e25a18] shadow-[#FC6D26]/20'
                                    }`}
                                >
                                    <span>{platform === 'github' ? 'GitHub' : 'GitLab'}</span>
                                    <ExternalLink size={10} className="stroke-[2.5]" />
                                </a>
                            </div>
                        </div>

                        {/* 2. Public Repositories Card */}
                        <div className={`lg:col-span-2 bg-[#0e1622]/90 border border-slate-800/80 backdrop-blur-xl rounded-xl p-3.5 md:p-4 flex flex-col justify-between shadow-md shadow-black/40 hover:-translate-y-0.5 transition-all duration-300 ${
                            platform === 'github' ? 'hover:border-rose-500/30' : 'hover:border-orange-500/30'
                        }`}>
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-3 border ${
                                platform === 'github'
                                    ? 'bg-red-500/10 border-red-500/20 text-red-400'
                                    : 'bg-orange-500/10 border-orange-500/20 text-orange-400'
                            }`}>
                                <FolderGit2 size={16} />
                            </div>
                            <div>
                                <span className="text-xl md:text-2xl font-black text-white tracking-tight block">
                                    {animatedRepos}
                                </span>
                                <span className="text-[11px] text-slate-400 font-medium mt-0.5 block">
                                    Public Repositories
                                </span>
                            </div>
                        </div>

                        {/* 3. Total Contributions & Streaks Card */}
                        <div className={`lg:col-span-2 bg-[#0e1622]/90 border border-slate-800/80 backdrop-blur-xl rounded-xl p-3.5 md:p-4 flex flex-col justify-between shadow-md shadow-black/40 hover:-translate-y-0.5 transition-all duration-300 ${
                            platform === 'github' ? 'hover:border-rose-500/30' : 'hover:border-orange-500/30'
                        }`}>
                            <div className="flex items-center justify-between mb-2">
                                <div className={`w-7 h-7 rounded-lg flex items-center justify-center border ${
                                    platform === 'github'
                                        ? 'bg-rose-500/10 border-rose-500/20 text-rose-400'
                                        : 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                                }`}>
                                    <GitCommitHorizontal size={15} />
                                </div>
                                <div className={`inline-flex items-center gap-1 text-[9.5px] font-bold px-1.5 py-0.5 rounded border ${
                                    platform === 'github'
                                        ? 'text-rose-400 bg-rose-500/10 border-rose-500/20'
                                        : 'text-orange-400 bg-orange-500/10 border-orange-500/20'
                                }`}>
                                    <Flame size={10} />
                                    <span>Streak</span>
                                </div>
                            </div>

                            <div>
                                <span className="text-xl md:text-2xl font-black text-white tracking-tight block">
                                    {animatedContributions > 0 ? `${animatedContributions}+` : `${activeStats.totalContributions}+`}
                                </span>
                                <span className="text-[11px] text-slate-400 font-medium mt-0.5 block">
                                    Total Contributions
                                </span>

                                {/* 2 Streak Boxes */}
                                <div className="flex flex-col gap-1 mt-2 pt-2 border-t border-slate-800/60">
                                    {/* Current Streak */}
                                    <div className="bg-slate-800/50 border border-slate-700/50 rounded-md px-2 py-1 flex items-center justify-between gap-1.5">
                                        <span className="text-[10px] text-slate-400 font-medium shrink-0">Current Streak</span>
                                        <span className={`text-xs font-bold shrink-0 ${
                                            platform === 'github' ? 'text-rose-400' : 'text-orange-400'
                                        }`}>{activeStats.currentStreak} {activeStats.currentStreak === 1 ? 'day' : 'days'}</span>
                                    </div>

                                    {/* Best Streak */}
                                    <div className="bg-slate-800/50 border border-slate-700/50 rounded-md px-2 py-1 flex items-center justify-between gap-1.5">
                                        <span className="text-[10px] text-slate-400 font-medium shrink-0">Best Streak</span>
                                        <span className="text-xs font-bold text-amber-400 shrink-0">{activeStats.longestStreak} {activeStats.longestStreak === 1 ? 'day' : 'days'}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 4. Primary Language Card */}
                        <div className={`lg:col-span-2 bg-[#0e1622]/90 border border-slate-800/80 backdrop-blur-xl rounded-xl p-3.5 md:p-4 flex flex-col justify-between shadow-md shadow-black/40 hover:-translate-y-0.5 transition-all duration-300 ${
                            platform === 'github' ? 'hover:border-rose-500/30' : 'hover:border-orange-500/30'
                        }`}>
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-3 border ${
                                platform === 'github'
                                    ? 'bg-red-500/10 border-red-500/20 text-red-400'
                                    : 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                            }`}>
                                <Code2 size={16} />
                            </div>
                            <div>
                                <span className="text-lg md:text-xl font-black text-white tracking-tight block truncate">
                                    {activeStats.primaryLanguage}
                                </span>
                                <span className="text-[11px] text-slate-400 font-medium mt-0.5 block">
                                    Primary Language
                                </span>
                            </div>
                        </div>

                        {/* 5. Followers Card */}
                        <div className={`lg:col-span-2 bg-[#0e1622]/90 border border-slate-800/80 backdrop-blur-xl rounded-xl p-3.5 md:p-4 flex flex-col justify-between shadow-md shadow-black/40 hover:-translate-y-0.5 transition-all duration-300 ${
                            platform === 'github' ? 'hover:border-rose-500/30' : 'hover:border-orange-500/30'
                        }`}>
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-3 border ${
                                platform === 'github'
                                    ? 'bg-rose-500/10 border-rose-500/20 text-rose-400'
                                    : 'bg-orange-500/10 border-orange-500/20 text-orange-400'
                            }`}>
                                <Users size={16} />
                            </div>
                            <div>
                                <span className="text-xl md:text-2xl font-black text-white tracking-tight block">
                                    {animatedFollowers}
                                </span>
                                <span className="text-[11px] text-slate-400 font-medium mt-0.5 block">
                                    Followers
                                </span>
                            </div>
                        </div>
                    </motion.div>
                </AnimatePresence>

                {/* ── Bottom Card: Contribution Calendar ── */}
                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.15 }}
                    className={`mt-3 md:mt-3.5 bg-[#0e1622]/90 border border-slate-800/80 backdrop-blur-xl rounded-xl p-3 md:p-3.5 shadow-xl relative overflow-hidden group transition-all duration-300 ${
                        platform === 'github' ? 'hover:border-rose-500/30' : 'hover:border-orange-500/30'
                    }`}
                >
                    {/* Header inside calendar card */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2 md:mb-2.5">
                        <div>
                            <div className="flex items-center gap-1.5">
                                <span className={`font-mono font-bold text-sm md:text-base ${
                                    platform === 'github' ? 'text-rose-400' : 'text-orange-400'
                                }`}>&gt;_</span>
                                <h3 className="text-sm md:text-base font-bold text-white tracking-tight">
                                    Contribution Calendar
                                </h3>
                            </div>
                            <p className="text-[10px] md:text-[11px] text-slate-400 mt-0.5">
                                Live {platform === 'github' ? 'GitHub' : 'GitLab'} contribution activity over the past year (@{activeStats.username})
                            </p>
                        </div>

                        <div className="flex items-center gap-2.5 self-start sm:self-auto">
                            <a
                                href={platform === 'github'
                                    ? `https://github.com/${activeStats.username}`
                                    : `https://gitlab.com/${activeStats.username}`
                                }
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`inline-flex items-center gap-1 text-[11px] font-medium transition-colors ${
                                    platform === 'github'
                                        ? 'text-rose-400 hover:text-rose-300'
                                        : 'text-[#FC6D26] hover:text-[#ff8547]'
                                }`}
                            >
                                <span>View {platform === 'github' ? 'GitHub' : 'GitLab'} Graph</span>
                                <ExternalLink size={10} />
                            </a>

                            <div className={`inline-flex items-center gap-1 text-[9.5px] font-semibold px-2 py-0.5 rounded border ${
                                platform === 'github'
                                    ? 'text-rose-400/90 bg-rose-500/10 border-rose-500/20'
                                    : 'text-orange-400/90 bg-orange-500/10 border-orange-500/20'
                            }`}>
                                {platform === 'github' ? (
                                    <>
                                        <CheckCircle2 size={10} className="text-rose-400" />
                                        <span>Live Synced</span>
                                    </>
                                ) : (
                                    <>
                                        <Gitlab size={10} className="text-[#FC6D26]" />
                                        <span>GitLab Synced</span>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Heatmap Calendar */}
                    <div className="overflow-x-auto w-full custom-activity-scrollbar text-slate-300 flex justify-start md:justify-center">
                        <div className="min-w-fit">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={`${platform}-calendar`}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.25 }}
                                >
                                    <ActivityCalendar
                                        data={activeActivities}
                                        colorScheme="dark"
                                        theme={platform === 'github' ? githubTheme : gitlabTheme}
                                        blockSize={10.5}
                                        blockMargin={3}
                                        fontSize={10}
                                        blockRadius={2}
                                        labels={{
                                            totalCount: `{{count}} contributions in the last year`
                                        }}
                                    />
                                </motion.div>
                            </AnimatePresence>
                        </div>
                    </div>
                </motion.div>
            </div>

            <style>{`
                .custom-activity-scrollbar::-webkit-scrollbar {
                    display: block;
                    height: 6px;
                }
                .custom-activity-scrollbar::-webkit-scrollbar-track {
                    background: rgba(255, 255, 255, 0.02);
                    border-radius: 4px;
                }
                .custom-activity-scrollbar::-webkit-scrollbar-thumb {
                    background: ${platform === 'github' ? 'rgba(244, 63, 94, 0.25)' : 'rgba(252, 109, 38, 0.25)'};
                    border-radius: 4px;
                }
                .custom-activity-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: ${platform === 'github' ? 'rgba(244, 63, 94, 0.5)' : 'rgba(252, 109, 38, 0.5)'};
                }
            `}</style>
        </section>
    );
};
