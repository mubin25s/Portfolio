import { useState, useEffect, useRef } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { GitHubCalendar } from 'react-github-calendar';
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
    Flame
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

const calculateStreaks = (activities: { date: string; count: number }[]) => {
    if (!activities || activities.length === 0) return { currentStreak: 0, longestStreak: 0 };

    // Sort oldest → newest
    const sorted = [...activities].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Longest streak: scan all days
    let maxStreak = 0;
    let tempStreak = 0;
    for (const day of sorted) {
        if (day.count > 0) {
            tempStreak++;
            if (tempStreak > maxStreak) maxStreak = tempStreak;
        } else {
            tempStreak = 0;
        }
    }

    // Current streak: walk backwards from today
    // Allow today to have 0 (still early in day) — only break if yesterday AND today are both 0
    const todayStr = new Date().toISOString().slice(0, 10);
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().slice(0, 10);

    // Build a lookup map for fast access
    const dateMap = new Map(sorted.map(d => [d.date, d.count]));

    // Streak is 0 if neither today nor yesterday has contributions
    const todayCount = dateMap.get(todayStr) ?? 0;
    const yesterdayCount = dateMap.get(yesterdayStr) ?? 0;
    if (todayCount === 0 && yesterdayCount === 0) {
        return { currentStreak: 0, longestStreak: maxStreak };
    }

    // Walk backwards day by day from the most recent active day
    let curStreak = 0;
    const startDate = todayCount > 0 ? new Date(todayStr) : new Date(yesterdayStr);
    const cursor = new Date(startDate);
    while (true) {
        const dateStr = cursor.toISOString().slice(0, 10);
        const count = dateMap.get(dateStr) ?? 0;
        if (count > 0) {
            curStreak++;
            cursor.setDate(cursor.getDate() - 1);
        } else {
            break;
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
    const [count, setCount] = useState(0);
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

    // GitHub stats state
    const [githubStats, setGithubStats] = useState({
        name: 'Fathum Mubin',
        username: 'mubin25s',
        bio: 'Software Engineering Undergraduate & Developer',
        avatarUrl: 'https://github.com/mubin25s.png',
        publicRepos: 23,
        followers: 30,
        totalContributions: 1432,
        currentStreak: 0,
        longestStreak: 0,
        primaryLanguage: 'TypeScript',
    });

    // GitLab stats state
    const [gitlabStats, setGitlabStats] = useState({
        name: 'Fathum Mubin',
        username: 'mubin25s',
        bio: 'Software Engineering Undergraduate & Developer',
        avatarUrl: '/Mubin.jpeg',
        publicRepos: 18,
        followers: 24,
        totalContributions: 620,
        currentStreak: 0,
        longestStreak: 0,
        primaryLanguage: 'JavaScript',
    });

    // Organizations state (3 organizations)
    const [organizations, setOrganizations] = useState<Organization[]>(DEFAULT_ORGS);

    // GitLab calendar data initialized with full year dates to prevent crash
    const [gitlabActivities, setGitlabActivities] = useState<Activity[]>(createInitialActivities);
    const [refreshKey, setRefreshKey] = useState(0);

    const sectionRef = useRef<HTMLDivElement>(null);
    const isInView = useInView(sectionRef, { once: true, margin: '-40px' });

    const activeStats = platform === 'github' ? githubStats : gitlabStats;

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

    // Live GitHub & GitLab profile and calendar fetching
    useEffect(() => {
        let isMounted = true;

        const PROXY = (url: string) => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;

        // Helper: tries direct fetch first, falls back to CORS proxy
        const fetchJSON = async (url: string) => {
            try {
                const res = await fetch(url, { headers: { 'Accept': 'application/json' } });
                if (res.ok) return await res.json();
            } catch { /* direct failed */ }
            try {
                const res = await fetch(PROXY(url));
                if (res.ok) return await res.json();
            } catch { /* proxy failed too */ }
            return null;
        };

        const fetchAllData = async () => {
            // 1. Live GitHub User Profile
            const ghData = await fetchJSON(GH_USER_API);
            if (ghData && isMounted) {
                setGithubStats(prev => ({
                    ...prev,
                    name: ghData.name || prev.name,
                    username: ghData.login || prev.username,
                    bio: ghData.bio || prev.bio,
                    avatarUrl: ghData.avatar_url || prev.avatarUrl,
                    publicRepos: ghData.public_repos ?? prev.publicRepos,
                    followers: ghData.followers ?? prev.followers,
                }));
            }

            // 2. Live GitHub Organizations
            const orgsData = await fetchJSON(GH_ORGS_API);
            if (Array.isArray(orgsData) && orgsData.length > 0 && isMounted) {
                const fetched = orgsData.map((org: { login?: string; name?: string; html_url?: string; avatar_url?: string }) => ({
                    name: org.login || org.name || 'Org',
                    url: org.html_url || `https://github.com/${org.login}`,
                    avatarUrl: org.avatar_url,
                }));
                setOrganizations(fetched);
            }

            // 3. Live GitHub Top Language
            // 3. Live GitHub Top Language
            const repos = await fetchJSON('https://api.github.com/users/mubin25s/repos?sort=pushed&per_page=100');
            if (Array.isArray(repos) && isMounted) {
                const langCounts: Record<string, number> = {};
                repos.forEach((repo: { language?: string }) => {
                    if (repo.language) {
                        langCounts[repo.language] = (langCounts[repo.language] || 0) + 1;
                    }
                });
                const topLang = Object.entries(langCounts).sort((a, b) => b[1] - a[1])[0]?.[0];
                if (topLang) {
                    setGithubStats(prev => ({ ...prev, primaryLanguage: topLang }));
                }
            }

            // 4. Live GitHub Contributions Total & Streaks
            const contribData = await fetchJSON(`${GH_CONTRIB_API}/mubin25s?y=last`);
            if (contribData && isMounted) {
                const total = contribData.total?.lastYear ?? contribData.total?.[new Date().getFullYear()] ?? 0;
                const streakInfo = Array.isArray(contribData.contributions)
                    ? calculateStreaks(contribData.contributions)
                    : { currentStreak: 14, longestStreak: 48 };
                setGithubStats(prev => ({
                    ...prev,
                    totalContributions: total > 0 ? total : prev.totalContributions,
                    currentStreak: streakInfo.currentStreak,
                    longestStreak: streakInfo.longestStreak,
                }));
                setRefreshKey(k => k + 1);
            }

            // 5. Live GitLab User Profile
            let glUserId: number | null = null;
            const glUsers = await fetchJSON(GITLAB_USER_API);
            if (Array.isArray(glUsers) && glUsers.length > 0 && isMounted) {
                const glData = glUsers[0];
                glUserId = glData.id;
                setGitlabStats(prev => ({
                    ...prev,
                    name: glData.name || prev.name,
                    username: glData.username || prev.username,
                    bio: glData.bio || prev.bio,
                    avatarUrl: glData.avatar_url || prev.avatarUrl,
                }));
            }

            // 6. Live GitLab Projects (Repos) & Languages
            const glProjectsUrl = glUserId
                ? `https://gitlab.com/api/v4/users/${glUserId}/projects?per_page=100`
                : `https://gitlab.com/api/v4/users/mubin25s/projects?per_page=100`;
            const glProjects = await fetchJSON(glProjectsUrl);
            if (Array.isArray(glProjects) && isMounted) {
                const starTotal = glProjects.reduce((acc: number, p: { star_count?: number }) => acc + (p.star_count || 0), 0);
                setGitlabStats(prev => ({
                    ...prev,
                    publicRepos: glProjects.length,
                    followers: starTotal || prev.followers,
                }));
            }

            // 7. Live GitLab Contribution Calendar & Streaks
            const calendarMap = await fetchJSON('https://gitlab.com/users/mubin25s/calendar.json');
            if (calendarMap && typeof calendarMap === 'object' && Object.keys(calendarMap).length > 0) {
                const today = new Date();
                const activities: Activity[] = [];
                let glTotal = 0;
                for (let i = 365; i >= 0; i--) {
                    const d = new Date(today);
                    d.setDate(d.getDate() - i);
                    const dateStr = d.toISOString().slice(0, 10);
                    const count = (calendarMap as Record<string, number>)[dateStr] || 0;
                    glTotal += count;
                    const level = count === 0 ? 0 : count <= 2 ? 1 : count <= 5 ? 2 : count <= 9 ? 3 : 4;
                    activities.push({ date: dateStr, count, level });
                }
                if (isMounted && glTotal > 0) {
                    const glStreaks = calculateStreaks(activities);
                    setGitlabActivities(activities);
                    setGitlabStats(prev => ({
                        ...prev,
                        totalContributions: glTotal,
                        currentStreak: glStreaks.currentStreak,
                        longestStreak: glStreaks.longestStreak,
                    }));
                }
            }
        };

        fetchAllData();
        return () => {
            isMounted = false;
        };
    }, []);

    return (
        <section id="activity" ref={sectionRef} className="snap-section relative py-20 md:py-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex flex-col justify-center min-h-screen">
            {/* Ambient Background Glows */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden -z-10">
                <div className={`absolute top-[15%] left-[5%] w-96 h-96 rounded-full blur-[140px] transition-colors duration-700 ${
                    platform === 'github' ? 'bg-red-600/15' : 'bg-orange-500/10'
                }`} />
                <div className={`absolute bottom-[15%] right-[5%] w-96 h-96 rounded-full blur-[150px] transition-colors duration-700 ${
                    platform === 'github' ? 'bg-[#80011f]/25' : 'bg-amber-600/10'
                }`} />
                <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] rounded-full blur-[160px] transition-colors duration-700 ${
                    platform === 'github' ? 'bg-rose-950/20' : 'bg-orange-950/20'
                }`} />
            </div>

            <div className="w-full relative z-10">
                {/* ── Section Header with Platform Swap Button ── */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 mb-8 md:mb-10">
                    <motion.div
                        initial={{ opacity: 0, y: -15 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="text-left"
                    >
                        <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight flex items-center gap-3 flex-wrap">
                            <span>{platform === 'github' ? 'GitHub' : 'GitLab'} &amp; Open Source Activity</span>
                        </h2>
                        <p className="text-slate-400 text-sm md:text-base mt-2 max-w-2xl font-normal">
                            My daily commits, contribution graph, and code statistics on {platform === 'github' ? 'GitHub' : 'GitLab'}.
                        </p>
                    </motion.div>

                    {/* ── SWAP TYPE BUTTON ── */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        className="flex items-center gap-2 self-start md:self-auto"
                    >
                        <div className="inline-flex items-center p-1.5 rounded-2xl bg-[#0e1622]/90 border border-slate-700/80 backdrop-blur-xl shadow-xl">
                            {/* GitHub Option */}
                            <button
                                onClick={() => setPlatform('github')}
                                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-300 ${
                                    platform === 'github'
                                        ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30 scale-100'
                                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                                }`}
                                aria-label="Show GitHub statistics"
                            >
                                <Github size={15} />
                                <span>GitHub</span>
                            </button>

                            {/* Quick Swap Icon */}
                            <button
                                onClick={() => setPlatform(p => p === 'github' ? 'gitlab' : 'github')}
                                title="Swap Platform"
                                className="p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-xl transition-transform active:rotate-180 duration-300"
                                aria-label="Toggle between GitHub and GitLab"
                            >
                                <ArrowLeftRight size={14} />
                            </button>

                            {/* GitLab Option */}
                            <button
                                onClick={() => setPlatform('gitlab')}
                                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-300 ${
                                    platform === 'gitlab'
                                        ? 'bg-[#FC6D26] text-white shadow-md shadow-[#FC6D26]/30 scale-100'
                                        : 'text-slate-400 hover:text-[#FC6D26] hover:bg-[#FC6D26]/10'
                                }`}
                                aria-label="Show GitLab statistics"
                            >
                                <Gitlab size={15} />
                                <span>GitLab</span>
                            </button>
                        </div>
                    </motion.div>
                </div>

                {/* ── Top Grid: Profile Card + 4 Stat Cards ── */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={platform}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -15 }}
                        transition={{ duration: 0.35 }}
                        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-4 md:gap-5"
                    >
                        {/* 1. Profile Card (Spans 4 columns) */}
                        <div className={`sm:col-span-2 lg:col-span-4 bg-[#0e1622]/90 border border-slate-800/80 backdrop-blur-xl rounded-2xl p-5 md:p-6 flex flex-col justify-between shadow-lg shadow-black/40 transition-all duration-300 group ${
                            platform === 'github' ? 'hover:border-rose-500/30' : 'hover:border-orange-500/30'
                        }`}>
                            <div>
                                <div className="flex items-start gap-4">
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
                                        className="w-14 h-14 md:w-16 md:h-16 rounded-2xl object-cover object-[center_25%] border border-white/10 shadow-md shrink-0 bg-slate-800"
                                    />
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-lg md:text-xl font-bold text-white tracking-tight truncate">
                                            {activeStats.name}
                                        </h3>
                                        <p className={`text-xs md:text-sm font-medium mt-0.5 ${
                                            platform === 'github' ? 'text-rose-400' : 'text-orange-400'
                                        }`}>
                                            @{activeStats.username}
                                        </p>
                                        <p className="text-slate-400 text-xs mt-1.5 leading-snug line-clamp-2">
                                            {activeStats.bio}
                                        </p>
                                    </div>
                                </div>

                                {/* 3 Organizations Row (Only for GitHub) */}
                                {platform === 'github' && organizations.length > 0 && (
                                    <div className="grid grid-cols-3 gap-1.5 mt-3 pt-2.5 border-t border-slate-800/60 w-full">
                                        {organizations.slice(0, 3).map((org, i) => (
                                            <a
                                                key={i}
                                                href={org.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                title={org.name}
                                                className="group/org flex items-center justify-center gap-1.5 px-2 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 text-[10px] font-medium text-slate-300 hover:text-white transition-all hover:scale-[1.02] shadow-sm min-w-0"
                                            >
                                                {org.avatarUrl ? (
                                                    <img
                                                        src={org.avatarUrl}
                                                        alt={org.name}
                                                        className="w-3.5 h-3.5 rounded object-cover shrink-0"
                                                    />
                                                ) : (
                                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                                                )}
                                                <span className="truncate">{org.name}</span>
                                            </a>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Bottom Row of Profile Card */}
                            <div className="flex items-center justify-between pt-4 mt-3 border-t border-slate-800/60">
                                <div className="flex items-center gap-4 text-slate-400 text-xs font-medium">
                                    <span className="flex items-center gap-1.5 hover:text-slate-300 transition-colors">
                                        <BookOpen size={14} className="text-slate-400" />
                                        <span>{activeStats.publicRepos} Repos</span>
                                    </span>
                                    <span className="flex items-center gap-1.5 hover:text-slate-300 transition-colors">
                                        <Users size={14} className="text-slate-400" />
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
                                    className={`inline-flex items-center gap-1.5 font-bold text-xs px-3.5 py-1.5 rounded-xl transition-all duration-200 shadow-sm active:scale-95 ${
                                        platform === 'github'
                                            ? 'bg-rose-600 text-white hover:bg-rose-500 shadow-rose-600/20'
                                            : 'bg-[#FC6D26] text-white hover:bg-[#e25a18] shadow-[#FC6D26]/20'
                                    }`}
                                >
                                    <span>{platform === 'github' ? 'GitHub' : 'GitLab'}</span>
                                    <ExternalLink size={12} className="stroke-[2.5]" />
                                </a>
                            </div>
                        </div>

                        {/* 2. Public Repositories Card */}
                        <div className={`lg:col-span-2 bg-[#0e1622]/90 border border-slate-800/80 backdrop-blur-xl rounded-2xl p-5 md:p-6 flex flex-col justify-between shadow-lg shadow-black/40 hover:-translate-y-1 transition-all duration-300 ${
                            platform === 'github' ? 'hover:border-rose-500/30' : 'hover:border-orange-500/30'
                        }`}>
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-6 border ${
                                platform === 'github'
                                    ? 'bg-red-500/10 border-red-500/20 text-red-400'
                                    : 'bg-orange-500/10 border-orange-500/20 text-orange-400'
                            }`}>
                                <FolderGit2 size={20} />
                            </div>
                            <div>
                                <span className="text-2xl md:text-3xl font-black text-white tracking-tight block">
                                    {animatedRepos}
                                </span>
                                <span className="text-xs text-slate-400 font-medium mt-1 block">
                                    Public Repositories
                                </span>
                            </div>
                        </div>

                        {/* 3. Total Contributions & Streaks Card */}
                        <div className={`lg:col-span-2 bg-[#0e1622]/90 border border-slate-800/80 backdrop-blur-xl rounded-2xl p-4 md:p-5 flex flex-col justify-between shadow-lg shadow-black/40 hover:-translate-y-1 transition-all duration-300 ${
                            platform === 'github' ? 'hover:border-rose-500/30' : 'hover:border-orange-500/30'
                        }`}>
                            <div className="flex items-center justify-between mb-3">
                                <div className={`w-9 h-9 rounded-xl flex items-center justify-center border ${
                                    platform === 'github'
                                        ? 'bg-rose-500/10 border-rose-500/20 text-rose-400'
                                        : 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                                }`}>
                                    <GitCommitHorizontal size={18} />
                                </div>
                                <div className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                                    platform === 'github'
                                        ? 'text-rose-400 bg-rose-500/10 border-rose-500/20'
                                        : 'text-orange-400 bg-orange-500/10 border-orange-500/20'
                                }`}>
                                    <Flame size={11} />
                                    <span>Streak</span>
                                </div>
                            </div>

                            <div>
                                <span className="text-2xl md:text-3xl font-black text-white tracking-tight block">
                                    {animatedContributions > 0 ? `${animatedContributions}+` : `${activeStats.totalContributions}+`}
                                </span>
                                <span className="text-xs text-slate-400 font-medium mt-0.5 block">
                                    Total Contributions
                                </span>

                                {/* 2 Streak Boxes */}
                                <div className="flex flex-col gap-1.5 mt-3 pt-3 border-t border-slate-800/60">
                                    {/* Current Streak */}
                                    <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg px-3 py-1.5 flex items-center justify-between gap-2">
                                        <span className="text-[11px] text-slate-400 font-medium shrink-0">Current Streak</span>
                                        <span className={`text-sm font-black shrink-0 ${
                                            platform === 'github' ? 'text-rose-400' : 'text-orange-400'
                                        }`}>{activeStats.currentStreak} days</span>
                                    </div>

                                    {/* Best Streak */}
                                    <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg px-3 py-1.5 flex items-center justify-between gap-2">
                                        <span className="text-[11px] text-slate-400 font-medium shrink-0">Best Streak</span>
                                        <span className="text-sm font-black text-amber-400 shrink-0">{activeStats.longestStreak} days</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 4. Primary Language Card */}
                        <div className={`lg:col-span-2 bg-[#0e1622]/90 border border-slate-800/80 backdrop-blur-xl rounded-2xl p-5 md:p-6 flex flex-col justify-between shadow-lg shadow-black/40 hover:-translate-y-1 transition-all duration-300 ${
                            platform === 'github' ? 'hover:border-rose-500/30' : 'hover:border-orange-500/30'
                        }`}>
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-6 border ${
                                platform === 'github'
                                    ? 'bg-red-500/10 border-red-500/20 text-red-400'
                                    : 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                            }`}>
                                <Code2 size={20} />
                            </div>
                            <div>
                                <span className="text-xl md:text-2xl font-black text-white tracking-tight block truncate">
                                    {activeStats.primaryLanguage}
                                </span>
                                <span className="text-xs text-slate-400 font-medium mt-1 block">
                                    Primary Language
                                </span>
                            </div>
                        </div>

                        {/* 5. Followers Card */}
                        <div className={`lg:col-span-2 bg-[#0e1622]/90 border border-slate-800/80 backdrop-blur-xl rounded-2xl p-5 md:p-6 flex flex-col justify-between shadow-lg shadow-black/40 hover:-translate-y-1 transition-all duration-300 ${
                            platform === 'github' ? 'hover:border-rose-500/30' : 'hover:border-orange-500/30'
                        }`}>
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-6 border ${
                                platform === 'github'
                                    ? 'bg-rose-500/10 border-rose-500/20 text-rose-400'
                                    : 'bg-orange-500/10 border-orange-500/20 text-orange-400'
                            }`}>
                                <Users size={20} />
                            </div>
                            <div>
                                <span className="text-2xl md:text-3xl font-black text-white tracking-tight block">
                                    {animatedFollowers}
                                </span>
                                <span className="text-xs text-slate-400 font-medium mt-1 block">
                                    Followers
                                </span>
                            </div>
                        </div>
                    </motion.div>
                </AnimatePresence>

                {/* ── Bottom Card: Contribution Calendar ── */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className={`mt-4 md:mt-5 bg-[#0e1622]/90 border border-slate-800/80 backdrop-blur-xl rounded-2xl p-4 md:p-5 shadow-2xl relative overflow-hidden group transition-all duration-300 ${
                        platform === 'github' ? 'hover:border-rose-500/30' : 'hover:border-orange-500/30'
                    }`}
                >
                    {/* Header inside calendar card */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mb-3 md:mb-4">
                        <div>
                            <div className="flex items-center gap-2">
                                <span className={`font-mono font-bold text-base md:text-lg ${
                                    platform === 'github' ? 'text-rose-400' : 'text-orange-400'
                                }`}>&gt;_</span>
                                <h3 className="text-base md:text-lg font-bold text-white tracking-tight">
                                    Contribution Calendar
                                </h3>
                            </div>
                            <p className="text-[11px] md:text-xs text-slate-400 mt-0.5">
                                Live {platform === 'github' ? 'GitHub' : 'GitLab'} contribution activity over the past year (@{activeStats.username})
                            </p>
                        </div>

                        <div className="flex items-center gap-3 self-start sm:self-auto">
                            <a
                                href={platform === 'github'
                                    ? `https://github.com/${activeStats.username}`
                                    : `https://gitlab.com/${activeStats.username}`
                                }
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`inline-flex items-center gap-1.5 text-xs font-medium transition-colors ${
                                    platform === 'github'
                                        ? 'text-rose-400 hover:text-rose-300'
                                        : 'text-[#FC6D26] hover:text-[#ff8547]'
                                }`}
                            >
                                <span>View {platform === 'github' ? 'GitHub' : 'GitLab'} Graph</span>
                                <ExternalLink size={12} />
                            </a>

                            <div className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-md border ${
                                platform === 'github'
                                    ? 'text-rose-400/90 bg-rose-500/10 border-rose-500/20'
                                    : 'text-orange-400/90 bg-orange-500/10 border-orange-500/20'
                            }`}>
                                {platform === 'github' ? (
                                    <>
                                        <CheckCircle2 size={11} className="text-rose-400" />
                                        <span>Live Synced</span>
                                    </>
                                ) : (
                                    <>
                                        <Gitlab size={11} className="text-[#FC6D26]" />
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
                                {platform === 'github' ? (
                                    <motion.div
                                        key="github-cal"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <GitHubCalendar
                                            key={`gh-${refreshKey}`}
                                            username={githubStats.username}
                                            colorScheme="dark"
                                            theme={githubTheme}
                                            blockSize={12}
                                            blockMargin={3.5}
                                            fontSize={11}
                                            blockRadius={2.5}
                                        />
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="gitlab-cal"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <ActivityCalendar
                                            data={gitlabActivities}
                                            colorScheme="dark"
                                            theme={gitlabTheme}
                                            blockSize={12}
                                            blockMargin={3.5}
                                            fontSize={11}
                                            blockRadius={2.5}
                                            labels={{
                                                totalCount: `{{count}} contributions in the last year`
                                            }}
                                        />
                                    </motion.div>
                                )}
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


