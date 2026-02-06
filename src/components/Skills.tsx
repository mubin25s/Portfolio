import { motion } from 'framer-motion';

const technicalStack = [
    {
        title: "Programming Languages",
        skills: [
            { name: "JS", icon: "devicon-javascript-plain" },
            { name: "Java", icon: "devicon-java-plain" },
            { name: "C++", icon: "devicon-cplusplus-plain" },
            { name: "C#", icon: "devicon-csharp-plain" },
            { name: "Dart", icon: "devicon-dart-plain" },
            { name: "PHP", icon: "devicon-php-plain" },
            { name: "C", icon: "devicon-c-plain" },
            { name: "Shell", icon: "devicon-bash-plain" },
            { name: "TS", icon: "devicon-typescript-plain" },
            { name: "Python", icon: "devicon-python-plain" },
            { name: "HTML5", icon: "devicon-html5-plain" },
            { name: "CSS3", icon: "devicon-css3-plain" }
        ]
    },
    {
        title: "Frameworks",
        skills: [
            { name: "React", icon: "devicon-react-original" },
            { name: "Node.js", icon: "devicon-nodejs-plain" },
            { name: "Express.js", icon: "devicon-express-original" },
            { name: "Laravel", icon: "devicon-laravel-original" },
            { name: "Tailwind", icon: "devicon-tailwindcss-original" },
            { name: "Bootstrap", icon: "devicon-bootstrap-plain" },
            { name: "Socket.io", icon: "devicon-socketio-original" }
        ]
    },
    {
        title: "Tools",
        skills: [
            { name: "Git", icon: "devicon-git-plain" },
            { name: "GitHub", icon: "devicon-github-original" },
            { name: "VS Code", icon: "devicon-vscode-plain" },
            { name: "NPM", icon: "devicon-npm-original-wordmark" },
            { name: "Vite", icon: "devicon-vite-original" },
            { name: "XAMPP", icon: "devicon-apache-plain" },
            { name: "CodeBlocks", icon: "fa-solid fa-cube" },
            { name: "Cloudflare", icon: "devicon-cloudflare-plain" },
            { name: "Postman", icon: "devicon-postman-plain" },
            { name: "Figma", icon: "devicon-figma-plain" },
            { name: "Vercel", icon: "devicon-vercel-original" },
            { name: "Netlify", icon: "devicon-netlify-plain" },
            { name: "Docker", icon: "devicon-docker-plain" }
        ]
    },
    {
        title: "Databases",
        skills: [
            { name: "MySQL", icon: "devicon-mysql-plain" },
            { name: "Postgres", icon: "devicon-postgresql-plain" },
            { name: "MongoDB", icon: "devicon-mongodb-plain" },
            { name: "Supabase", icon: "devicon-supabase-plain" },
            { name: "Firebase", icon: "devicon-firebase-plain" },
            { name: "MariaDB", icon: "devicon-mariadb-plain" }
        ]
    }
];

const coreSkills = [
    "Full Stack Dev", "Software Architecture", "System Optimization", "Problem Solving", "Web Dev", "UI/UX Engineering"
];

const supportingSkills = [
    "Fast Learner", "Linux", "Open Source", "Tech-Curious", "Editing", "Photography"
];

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.3,
            delayChildren: 0.4
        }
    }
};

const itemVariants = {
    hidden: {
        opacity: 0,
        y: 60,
        x: -40,
        scale: 0.9
    },
    visible: {
        opacity: 1,
        y: 0,
        x: 0,
        scale: 1
    }
};

const swipeTransition = {
    duration: 0.8,
    ease: "easeOut"
} as const;

export const Skills = () => {
    return (
        <section id="skills" className="snap-section px-4 py-8 relative overflow-hidden flex flex-col justify-center bg-transparent">
            <div className="container max-w-7xl mx-auto relative z-10 flex flex-col h-full max-h-[88vh] min-h-0 pt-2 lg:pt-4">
                {/* Unified Header - Ultrpact Shift */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="flex items-end justify-between mb-3 border-b border-white/5 pb-2"
                >
                    <div>
                        <h2 className="text-2xl md:text-3xl font-black text-white tracking-tighter uppercase leading-none">
                            EXPERTISE <span className="text-gradient">& STACK</span>
                        </h2>
                        <p className="text-slate-500 text-[9px] md:text-[10px] font-bold tracking-[0.2em] mt-1 uppercase">Core Competencies & Digital Toolset</p>
                    </div>
                    <div className="hidden md:block text-right">
                        <span className="text-[10px] text-white/20 font-mono">SYS_VERSION_4.0.2</span>
                    </div>
                </motion.div>

                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    className="grid grid-cols-1 md:grid-cols-6 md:grid-rows-[auto_1fr_1fr] gap-2 lg:gap-3 flex-1 min-h-0"
                >
                    {/* 1. Programming Languages - Tall Block (Span all rows) */}
                    <motion.div
                        variants={itemVariants}
                        transition={swipeTransition}
                        className="md:col-span-2 md:row-span-3 p-3 md:p-5 rounded-2xl bg-black/40 border border-white/5 backdrop-blur-xl relative group overflow-hidden flex flex-col min-h-0"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                        <h3 className="text-[11px] font-black text-white uppercase tracking-widest mb-4 flex items-center gap-2">
                            <div className="w-2 h-2 bg-primary rounded-full shadow-[0_0_8px_#00f2fe]"></div>
                            {technicalStack[0].title}
                        </h3>
                        <div className="grid grid-cols-2 gap-y-3 gap-x-3 flex-1 items-start min-h-0 overflow-hidden">
                            {technicalStack[0].skills.map((skill, i) => (
                                <div key={i} className="flex items-center gap-3 text-slate-400 group/skill">
                                    <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/[0.03] border border-white/5 transition-all duration-300 group-hover/skill:bg-primary/10 group-hover/skill:border-primary/20 shrink-0">
                                        <i className={`${skill.icon} text-lg md:text-xl transition-all duration-300 group-hover/skill:scale-110 group-hover/skill:text-primary group-hover/skill:drop-shadow-[0_0_8px_rgba(0,242,254,0.4)]`}></i>
                                    </div>
                                    <span className="text-[10px] font-bold uppercase tracking-wider group-hover/skill:text-white transition-colors truncate">{skill.name}</span>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    {/* 2. Core Competencies */}
                    <motion.div
                        variants={itemVariants}
                        transition={swipeTransition}
                        className="md:col-span-3 md:row-span-1 p-3 md:p-4 rounded-2xl bg-black/40 border border-white/5 backdrop-blur-xl group flex flex-col"
                    >
                        <h3 className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-3">Core Competencies</h3>
                        <div className="flex flex-wrap gap-2 mt-auto">
                            {coreSkills.map((skill, i) => (
                                <span key={i} className="px-2.5 py-1.5 rounded-lg bg-white/[0.03] border border-white/5 text-[9px] font-bold uppercase text-slate-400 hover:text-white hover:border-primary/30 transition-all cursor-default tracking-widest">
                                    {skill}
                                </span>
                            ))}
                        </div>
                    </motion.div>

                    {/* 3. Aptitudes */}
                    <motion.div
                        variants={itemVariants}
                        transition={swipeTransition}
                        className="md:col-span-1 md:row-span-1 p-3 md:p-4 rounded-2xl bg-black/40 border border-white/5 backdrop-blur-xl group flex flex-col"
                    >
                        <h3 className="text-[10px] font-black text-secondary uppercase tracking-[0.2em] mb-3">Aptitudes</h3>
                        <div className="flex flex-wrap gap-x-2 gap-y-1 text-[9px] text-slate-500 font-bold uppercase mt-auto">
                            {supportingSkills.map((s, i) => (
                                <span key={i} className="hover:text-white transition-colors cursor-default whitespace-nowrap">
                                    {s}{i < supportingSkills.length - 1 ? " • " : ""}
                                </span>
                            ))}
                        </div>
                    </motion.div>

                    {/* 4. Engines (Top Left Square) */}
                    <motion.div
                        variants={itemVariants}
                        transition={swipeTransition}
                        className="md:col-span-2 md:row-span-1 p-3 md:p-4 rounded-2xl bg-black/40 border border-white/5 group flex flex-col min-h-0"
                    >
                        <h3 className="text-[12px] font-black text-white/50 uppercase mb-3 tracking-widest underline decoration-secondary/30 underline-offset-4">Engines</h3>
                        <div className="grid grid-cols-2 gap-x-4 gap-y-2.5 flex-1 items-center min-h-0 overflow-hidden">
                            {technicalStack[1].skills.map((skill, i) => (
                                <div key={i} className="flex items-center gap-3 group/skill cursor-default">
                                    <div className="w-1.5 h-1.5 bg-white/10 group-hover/skill:bg-secondary transition-colors rounded-full"></div>
                                    <i className={`${skill.icon} text-base md:text-xl text-slate-500 group-hover/skill:text-secondary transition-all`}></i>
                                    <span className="text-[10px] md:text-[11px] font-black text-slate-400 group-hover/skill:text-white uppercase transition-colors tracking-tighter truncate">{skill.name}</span>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    {/* 5. Core Tools (Top Right Square) */}
                    <motion.div
                        variants={itemVariants}
                        transition={swipeTransition}
                        className="md:col-span-2 md:row-span-1 p-3 md:p-4 rounded-2xl bg-black/40 border border-white/5 backdrop-blur-xl group flex flex-col min-h-0"
                    >
                        <h3 className="text-[11px] md:text-[12px] font-black text-slate-400 uppercase tracking-widest mb-3">Core Tools</h3>
                        <div className="grid grid-cols-2 gap-x-4 gap-y-2.5 flex-1 items-center min-h-0 overflow-hidden">
                            {technicalStack[2].skills.slice(0, 8).map((skill, i) => (
                                <div key={i} className="flex items-center gap-3 group/skill cursor-default">
                                    <i className={`${skill.icon} text-base md:text-xl transition-all group-hover/skill:scale-110 group-hover/skill:text-white text-slate-500`}></i>
                                    <span className="text-[10px] md:text-[11px] font-black group-hover/skill:text-white uppercase transition-colors tracking-widest truncate text-slate-400">{skill.name}</span>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    {/* 6. Utility (Bottom Left Square) */}
                    <motion.div
                        variants={itemVariants}
                        transition={swipeTransition}
                        className="md:col-span-2 md:row-span-1 p-3 md:p-4 rounded-2xl bg-black/40 border border-white/5 backdrop-blur-xl group flex flex-col min-h-0"
                    >
                        <h3 className="text-[11px] md:text-[12px] font-black text-slate-400 uppercase tracking-widest mb-3">Utility</h3>
                        <div className="grid grid-cols-2 gap-x-4 gap-y-2.5 flex-1 items-center min-h-0 overflow-hidden">
                            {technicalStack[2].skills.slice(8).map((skill, i) => (
                                <div key={i} className="flex items-center gap-3 group/skill cursor-default">
                                    <i className={`${skill.icon} text-base md:text-xl transition-all group-hover/skill:scale-110 group-hover/skill:text-white text-slate-500`}></i>
                                    <span className="text-[10px] md:text-[11px] font-black group-hover/skill:text-white uppercase transition-colors tracking-widest truncate text-slate-400">{skill.name}</span>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    {/* 7. Data Labs (Bottom Right Square) */}
                    <motion.div
                        variants={itemVariants}
                        transition={swipeTransition}
                        className="md:col-span-2 md:row-span-1 p-3 md:p-4 rounded-2xl bg-black/40 border border-white/5 group flex flex-col min-h-0"
                    >
                        <h3 className="text-[12px] font-black text-[#ff007a]/60 uppercase mb-3 tracking-widest">Data Labs</h3>
                        <div className="grid grid-cols-2 gap-x-4 gap-y-2.5 flex-1 items-center min-h-0 overflow-hidden">
                            {technicalStack[3].skills.map((skill, i) => (
                                <div key={i} className="flex items-center gap-3 group/skill cursor-default">
                                    <div className="w-1.5 h-1.5 bg-white/10 group-hover/skill:bg-[#ff007a] transition-colors rounded-full"></div>
                                    <i className={`${skill.icon} text-sm md:text-base text-slate-500 group-hover/skill:text-white transition-colors`}></i>
                                    <span className="text-[10px] md:text-[11px] font-black text-slate-400 group-hover/skill:text-white uppercase transition-colors tracking-widest truncate">{skill.name}</span>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </motion.div>
            </div>
        </section>
    );
};
