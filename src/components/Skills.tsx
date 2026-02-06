import { motion } from 'framer-motion';

const technicalStack = [
    {
        title: "Programming Languages",
        skills: [
            { name: "JS", icon: "devicon-javascript-plain", color: "#F7DF1E" },
            { name: "Java", icon: "devicon-java-plain", color: "#007396" },
            { name: "C++", icon: "devicon-cplusplus-plain", color: "#00599C" },
            { name: "C#", icon: "devicon-csharp-plain", color: "#239120" },
            { name: "Dart", icon: "devicon-dart-plain", color: "#0175C2" },
            { name: "PHP", icon: "devicon-php-plain", color: "#777BB4" },
            { name: "C", icon: "devicon-c-plain", color: "#A8B9CC" },
            { name: "Shell", icon: "devicon-bash-plain", color: "#4EAA25" },
            { name: "TS", icon: "devicon-typescript-plain", color: "#3178C6" },
            { name: "Python", icon: "devicon-python-plain", color: "#3776AB" },
            { name: "HTML5", icon: "devicon-html5-plain", color: "#E34F26" },
            { name: "CSS3", icon: "devicon-css3-plain", color: "#1572B6" }
        ]
    },
    {
        title: "Frameworks",
        skills: [
            { name: "React", icon: "devicon-react-original", color: "#61DAFB" },
            { name: "Node.js", icon: "devicon-nodejs-plain", color: "#339933" },
            { name: "Express.js", icon: "devicon-express-original", color: "#000000" },
            { name: "Laravel", icon: "devicon-laravel-original", color: "#FF2D20" },
            { name: "Tailwind", icon: "devicon-tailwindcss-original", color: "#06B6D4" },
            { name: "Bootstrap", icon: "devicon-bootstrap-plain", color: "#7952B3" },
            { name: "Socket.io", icon: "devicon-socketio-original", color: "#010101" }
        ]
    },
    {
        title: "Tools",
        skills: [
            { name: "Git", icon: "devicon-git-plain", color: "#F05032" },
            { name: "GitHub", icon: "devicon-github-original", color: "#FFFFFF" },
            { name: "VS Code", icon: "devicon-vscode-plain", color: "#007ACC" },
            { name: "NPM", icon: "devicon-npm-original-wordmark", color: "#CB3837" },
            { name: "Vite", icon: "devicon-vite-original", color: "#646CFF" },
            { name: "XAMPP", icon: "devicon-apache-plain", color: "#FB503B" },
            { name: "CodeBlocks", icon: "fa-solid fa-cube", color: "#2E5D87" },
            { name: "Cloudflare", icon: "devicon-cloudflare-plain", color: "#F38020" },
            { name: "Postman", icon: "devicon-postman-plain", color: "#FF6C37" },
            { name: "Figma", icon: "devicon-figma-plain", color: "#F24E1E" },
            { name: "Vercel", icon: "devicon-vercel-original", color: "#FFFFFF" },
            { name: "Netlify", icon: "devicon-netlify-plain", color: "#00C7B7" },
            { name: "Docker", icon: "devicon-docker-plain", color: "#2496ED" }
        ]
    },
    {
        title: "Databases",
        skills: [
            { name: "MySQL", icon: "devicon-mysql-plain", color: "#4479A1" },
            { name: "Postgres", icon: "devicon-postgresql-plain", color: "#4169E1" },
            { name: "MongoDB", icon: "devicon-mongodb-plain", color: "#47A248" },
            { name: "Supabase", icon: "devicon-supabase-plain", color: "#3ECF8E" },
            { name: "Firebase", icon: "devicon-firebase-plain", color: "#FFCA28" },
            { name: "MariaDB", icon: "devicon-mariadb-plain", color: "#003545" }
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
                    className="flex items-end justify-between mb-3"
                >
                    <div>
                        <h2 className="text-2xl md:text-3xl font-black text-white tracking-tighter uppercase leading-none">
                            EXPERTISE <span className="text-gradient">& STACK</span>
                        </h2>
                        <p className="text-slate-500 text-[9px] md:text-[10px] font-bold tracking-[0.2em] mt-1 uppercase">Core Competencies & Digital Toolset</p>
                    </div>
                </motion.div>

                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    className="grid grid-cols-1 md:grid-cols-6 md:grid-rows-[auto_1fr_1fr] gap-2 lg:gap-3 flex-1 min-h-0"
                >
                    {/* 1. Programming Languages - Tall Block */}
                    <motion.div
                        variants={itemVariants}
                        transition={swipeTransition}
                        className="md:col-span-2 md:row-span-3 p-3 md:p-5 glass-card relative group overflow-hidden flex flex-col min-h-0"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-0"></div>
                        <div className="relative z-10 flex flex-col h-full">
                            <h3 className="text-[12px] font-black text-white/50 group-hover:text-white uppercase tracking-widest mb-4 flex items-center transition-colors underline decoration-primary/30 underline-offset-4">
                                {technicalStack[0].title}
                            </h3>
                            <div className="grid grid-cols-2 gap-y-3 gap-x-4 flex-1 items-start min-h-0 overflow-hidden">
                                {technicalStack[0].skills.map((skill, i) => (
                                    <div key={i} className="flex items-center gap-3 group/skill cursor-default">
                                        <div
                                            className="w-1.5 h-1.5 bg-white/10 group-hover/skill:scale-125 transition-all rounded-full"
                                            style={{
                                                '--hover-bg': skill.color,
                                                '--hover-shadow': `0 0 12px ${skill.color}`
                                            } as React.CSSProperties}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.backgroundColor = skill.color;
                                                e.currentTarget.style.boxShadow = `0 0 12px ${skill.color}`;
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.backgroundColor = '';
                                                e.currentTarget.style.boxShadow = '';
                                            }}
                                        ></div>
                                        <i
                                            className={`${skill.icon} text-base md:text-xl text-slate-500 transition-all`}
                                            style={{ transition: 'all 0.3s' }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.color = skill.color;
                                                e.currentTarget.style.filter = `drop-shadow(0 0 10px ${skill.color}) brightness(1.5)`;
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.color = '';
                                                e.currentTarget.style.filter = '';
                                            }}
                                        ></i>
                                        <span className="text-[10px] md:text-[11px] font-black text-slate-400 group-hover/skill:text-white uppercase transition-colors tracking-tighter truncate">{skill.name}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </motion.div>

                    {/* 2. Core Competencies */}
                    <motion.div
                        variants={itemVariants}
                        transition={swipeTransition}
                        className="md:col-span-3 md:row-span-1 p-3 md:p-4 glass-card group flex flex-col"
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
                        className="md:col-span-1 md:row-span-1 p-3 md:p-4 glass-card group flex flex-col"
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

                    {/* 4. Engines */}
                    <motion.div
                        variants={itemVariants}
                        transition={swipeTransition}
                        className="md:col-span-2 md:row-span-1 p-3 md:p-4 glass-card group flex flex-col min-h-0"
                    >
                        <h3 className="text-[12px] font-black text-white/50 group-hover:text-white uppercase mb-3 tracking-widest transition-colors underline decoration-secondary/30 underline-offset-4">Engines</h3>
                        <div className="grid grid-cols-2 gap-x-4 gap-y-2.5 flex-1 items-center min-h-0 overflow-hidden">
                            {technicalStack[1].skills.map((skill, i) => (
                                <div key={i} className="flex items-center gap-3 group/skill cursor-default">
                                    <div
                                        className="w-1.5 h-1.5 bg-white/10 group-hover/skill:scale-125 transition-all rounded-full"
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.backgroundColor = skill.color;
                                            e.currentTarget.style.boxShadow = `0 0 12px ${skill.color}`;
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.backgroundColor = '';
                                            e.currentTarget.style.boxShadow = '';
                                        }}
                                    ></div>
                                    <i
                                        className={`${skill.icon} text-base md:text-xl text-slate-500 transition-all`}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.color = skill.color;
                                            e.currentTarget.style.filter = `drop-shadow(0 0 10px ${skill.color}) brightness(1.5)`;
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.color = '';
                                            e.currentTarget.style.filter = '';
                                        }}
                                    ></i>
                                    <span className="text-[10px] md:text-[11px] font-black text-slate-400 group-hover/skill:text-white uppercase transition-colors tracking-tighter truncate">{skill.name}</span>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    {/* 5. Core Tools */}
                    <motion.div
                        variants={itemVariants}
                        transition={swipeTransition}
                        className="md:col-span-2 md:row-span-1 p-3 md:p-4 glass-card group flex flex-col min-h-0"
                    >
                        <h3 className="text-[11px] md:text-[12px] font-black text-slate-400 uppercase tracking-widest mb-3">Core Tools</h3>
                        <div className="grid grid-cols-2 gap-x-4 gap-y-2.5 flex-1 items-center min-h-0 overflow-hidden">
                            {technicalStack[2].skills.slice(0, 8).map((skill, i) => (
                                <div key={i} className="flex items-center gap-3 group/skill cursor-default">
                                    <i
                                        className={`${skill.icon} text-base md:text-xl text-slate-500 transition-all group-hover/skill:scale-110`}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.color = skill.color;
                                            e.currentTarget.style.filter = `drop-shadow(0 0 12px ${skill.color}) brightness(1.5)`;
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.color = '';
                                            e.currentTarget.style.filter = '';
                                        }}
                                    ></i>
                                    <span className="text-[10px] md:text-[11px] font-black group-hover/skill:text-white uppercase transition-colors tracking-widest truncate text-slate-400">{skill.name}</span>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    {/* 6. Utility */}
                    <motion.div
                        variants={itemVariants}
                        transition={swipeTransition}
                        className="md:col-span-2 md:row-span-1 p-3 md:p-4 glass-card group flex flex-col min-h-0"
                    >
                        <h3 className="text-[11px] md:text-[12px] font-black text-slate-400 uppercase tracking-widest mb-3">Utility</h3>
                        <div className="grid grid-cols-2 gap-x-4 gap-y-2.5 flex-1 items-center min-h-0 overflow-hidden">
                            {technicalStack[2].skills.slice(8).map((skill, i) => (
                                <div key={i} className="flex items-center gap-3 group/skill cursor-default">
                                    <i
                                        className={`${skill.icon} text-base md:text-xl text-slate-500 transition-all group-hover/skill:scale-110`}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.color = skill.color;
                                            e.currentTarget.style.filter = `drop-shadow(0 0 12px ${skill.color}) brightness(1.5)`;
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.color = '';
                                            e.currentTarget.style.filter = '';
                                        }}
                                    ></i>
                                    <span className="text-[10px] md:text-[11px] font-black group-hover/skill:text-white uppercase transition-colors tracking-widest truncate text-slate-400">{skill.name}</span>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    {/* 7. Data Labs */}
                    <motion.div
                        variants={itemVariants}
                        transition={swipeTransition}
                        className="md:col-span-2 md:row-span-1 p-3 md:p-4 glass-card group flex flex-col min-h-0"
                    >
                        <h3 className="text-[12px] font-black text-[#ff007a]/60 group-hover:text-[#ff007a] uppercase mb-3 tracking-widest transition-colors">Data Labs</h3>
                        <div className="grid grid-cols-2 gap-x-4 gap-y-2.5 flex-1 items-center min-h-0 overflow-hidden">
                            {technicalStack[3].skills.map((skill, i) => (
                                <div key={i} className="flex items-center gap-3 group/skill cursor-default">
                                    <div
                                        className="w-1.5 h-1.5 bg-white/10 group-hover/skill:scale-125 transition-all rounded-full"
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.backgroundColor = skill.color;
                                            e.currentTarget.style.boxShadow = `0 0 12px ${skill.color}`;
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.backgroundColor = '';
                                            e.currentTarget.style.boxShadow = '';
                                        }}
                                    ></div>
                                    <i
                                        className={`${skill.icon} text-sm md:text-base text-slate-500 transition-all`}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.color = skill.color;
                                            e.currentTarget.style.filter = `drop-shadow(0 0 10px ${skill.color}) brightness(1.5)`;
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.color = '';
                                            e.currentTarget.style.filter = '';
                                        }}
                                    ></i>
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
