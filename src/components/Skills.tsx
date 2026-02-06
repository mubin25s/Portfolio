import { motion } from 'framer-motion';

const technicalStack = [
    {
        title: "Programming Languages",
        skills: [
            { name: "JS", icon: "devicon-javascript-plain" },
            { name: "Python", icon: "devicon-python-plain" },
            { name: "Java", icon: "devicon-java-plain" },
            { name: "PHP", icon: "devicon-php-plain" },
            { name: "C", icon: "devicon-c-plain" },
            { name: "C++", icon: "devicon-cplusplus-plain" },
            { name: "C#", icon: "devicon-csharp-plain" },
            { name: "Dart", icon: "devicon-dart-plain" },
            { name: "TS", icon: "devicon-typescript-plain" }
        ]
    },
    {
        title: "Frameworks",
        skills: [
            { name: "React", icon: "devicon-react-original" },
            { name: "Node", icon: "devicon-nodejs-plain" },
            { name: "Express", icon: "devicon-express-original" },
            { name: "Laravel", icon: "devicon-laravel-original" },
            { name: "Tailwind", icon: "devicon-tailwindcss-original" }
        ]
    },
    {
        title: "Tools",
        skills: [
            { name: "Git", icon: "devicon-git-plain" },
            { name: "Docker", icon: "devicon-docker-plain" },
            { name: "VS Code", icon: "devicon-vscode-plain" }
        ]
    },
    {
        title: "Databases",
        skills: [
            { name: "MySQL", icon: "devicon-mysql-plain" },
            { name: "MongoDB", icon: "devicon-mongodb-plain" },
            { name: "Supabase", icon: "devicon-supabase-plain" },
            { name: "Postgres", icon: "devicon-postgresql-plain" },
            { name: "Firebase", icon: "devicon-firebase-plain" }
        ]
    }
];

const coreSkills = [
    "Problem Solving", "Web Dev", "UI/UX", "Backend", "Git", "Structuring"
];

const supportingSkills = [
    "Linux", "Open Source", "Tech-Curious", "Editing", "Photography"
];

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 }
};

export const Skills = () => {
    return (
        <>
            {/* Core & Supporting Skills Page */}
            <section id="skills" className="snap-section px-6 py-10">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 blur-[120px] rounded-full pointer-events-none"></div>

                <div className="container max-w-6xl mx-auto relative z-10 flex flex-col justify-center h-full">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-12"
                    >
                        <h2 className="text-3xl md:text-5xl font-black text-white px-2">
                            My <span className="text-gradient">Abilities</span>
                        </h2>
                    </motion.div>

                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        className="grid grid-cols-1 md:grid-cols-2 gap-8"
                    >
                        <motion.div variants={itemVariants} className="flex flex-col items-center">
                            <h2 className="text-xl md:text-2xl font-bold mb-4 text-[#00f2fe] tracking-tight">Core Skills</h2>
                            <div className="w-full p-6 rounded-2xl bg-white/[0.02] border border-white/5 backdrop-blur-md">
                                <div className="flex flex-wrap justify-center gap-3">
                                    {coreSkills.map((skill, i) => (
                                        <span key={i} className="px-4 py-2 rounded-full bg-white/[0.03] border border-white/5 text-slate-400 text-sm font-medium hover:text-white hover:border-primary/30 transition-all">
                                            {skill}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </motion.div>

                        <motion.div variants={itemVariants} className="flex flex-col items-center">
                            <h2 className="text-xl md:text-2xl font-bold mb-4 text-[#00f2fe] tracking-tight">Supporting Skills</h2>
                            <div className="w-full p-6 rounded-2xl bg-white/[0.02] border border-white/5 backdrop-blur-md">
                                <div className="flex flex-wrap justify-center gap-3">
                                    {supportingSkills.map((skill, i) => (
                                        <span key={i} className="px-4 py-2 rounded-full bg-white/[0.03] border border-white/5 text-slate-400 text-sm font-medium hover:text-white hover:border-primary/30 transition-all">
                                            {skill}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                </div>
            </section>

            {/* Tech Stack Page */}
            <section id="stack" className="snap-section px-6 py-10">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-secondary/5 blur-[120px] rounded-full pointer-events-none"></div>

                <div className="container max-w-6xl mx-auto relative z-10 flex flex-col justify-center h-full">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-12"
                    >
                        <h2 className="text-3xl md:text-5xl font-black text-white">
                            Tech <span className="text-gradient">Stack</span>
                        </h2>
                    </motion.div>

                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
                    >
                        {technicalStack.map((cat, index) => (
                            <motion.div
                                key={index}
                                variants={itemVariants}
                                className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-primary/30 transition-all duration-300 backdrop-blur-md group"
                            >
                                <h3 className="text-lg font-bold mb-5 text-[#00f2fe] tracking-tight group-hover:text-white transition-colors">
                                    {cat.title}
                                </h3>
                                <div className="flex flex-wrap gap-2.5">
                                    {cat.skills.map((skill, i) => (
                                        <div
                                            key={i}
                                            className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-white/5 border border-white/5 text-slate-300 text-xs hover:text-white hover:bg-white/10 hover:border-primary/20 transition-all duration-300"
                                        >
                                            <i className={`${skill.icon} text-lg`}></i>
                                            <span>{skill.name}</span>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>
        </>
    );
};
