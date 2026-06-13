import { motion } from 'framer-motion';
import { MapPin, Phone, Mail } from 'lucide-react';

export const Contact = () => {
    return (
        <section id="contact" className="snap-section px-6 relative">
            <div className="container max-w-7xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
                    {/* Left Side: Contact Info */}
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="max-w-xl px-2 md:px-0"
                    >
                        <h2 className="text-3xl md:text-5xl font-black mb-4 leading-tight">
                            Let&apos;s Build <br />
                            <span className="text-gradient brightness-125 drop-shadow-sm">Something Iconic</span>
                        </h2>
                        <p className="text-slate-400 text-sm mb-8 max-w-sm">
                            I&apos;m currently open for new projects and collaborations. If you have any idea, feel free to reach out!
                        </p>

                        <div className="space-y-4 shadow-sm">
                            <div className="flex items-center gap-4 group">
                                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                                    <Mail size={18} />
                                </div>
                                <div>
                                    <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Email</p>
                                    <a href="mailto:fathummubin26@gmail.com" className="text-sm md:text-base font-semibold hover:text-primary transition-colors">fathummubin26@gmail.com</a>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 group mt-2">
                                <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary group-hover:scale-110 transition-transform">
                                    <Phone size={18} />
                                </div>
                                <div>
                                    <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">WhatsApp</p>
                                    <a href="https://wa.me/8801302910017" className="text-sm md:text-base font-semibold hover:text-secondary transition-colors">+880 1302 910017</a>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 group mt-2">
                                <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent group-hover:scale-110 transition-transform">
                                    <MapPin size={18} />
                                </div>
                                <div>
                                    <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Location</p>
                                    <p className="text-sm md:text-base font-semibold">Dhaka, Bangladesh</p>
                                </div>
                            </div>
                        </div>

                        {/* Social Links Sub-section */}
                        <div className="mt-8 pt-4">
                            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-5">Find Me On</p>
                            <div className="flex flex-wrap gap-5">
                                {[
                                    { icon: "fa-brands fa-github",       href: "https://github.com/mubin25s",                          color: "#ffffff" },
                                    { icon: "fa-brands fa-gitlab",        href: "https://gitlab.com/mubin25s",                          color: "#FC6D26" },
                                    { icon: "fa-brands fa-linkedin-in",   href: "https://linkedin.com/in/fathum-mubin-090937280",        color: "#0077b5" },
                                    { icon: "fa-solid fa-envelope",       href: "mailto:fathummubin26@gmail.com",                       color: "#c0394f" },
                                    { icon: "fa-brands fa-x-twitter",     href: "https://x.com/FathumMubin26",                          color: "#ffffff" },
                                    { icon: "fa-brands fa-discord",       href: "https://discord.com/users/mubin.26",                   color: "#5865f2" },
                                    { icon: "fa-brands fa-reddit-alien",  href: "https://www.reddit.com/u/mubin25s/s/HFGmFrHUkV",       color: "#ff4500" },
                                    { icon: "fa-brands fa-whatsapp",      href: "https://wa.me/8801302910017",                          color: "#25d366" },
                                    { icon: "fa-brands fa-instagram",     href: "https://www.instagram.com/fathum.mubin.26",             color: "#e4405f" },
                                    { icon: "fa-brands fa-facebook-f",    href: "https://www.facebook.com/share/14RTXWtMn8Y/",          color: "#1877f2" },
                                ].map((s, i) => (
                                    <motion.a
                                        key={i}
                                        href={s.href}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        initial={{ opacity: 0, y: 10 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: i * 0.06 }}
                                        whileHover={{ y: -6, scale: 1.2, color: s.color, transition: { type: 'spring', stiffness: 600, damping: 20, mass: 0.5 } }}
                                        whileTap={{ scale: 0.9 }}
                                        className="w-8 h-8 flex items-center justify-center text-slate-400"
                                    >
                                        <i
                                            className={`${s.icon} text-xl`}
                                            style={{ filter: 'drop-shadow(0 0 2px rgba(255,255,255,0.1))', transition: 'filter 80ms ease' }}
                                            onMouseEnter={(e) => e.currentTarget.style.filter = `drop-shadow(0 0 12px ${s.color}) brightness(1.5)`}
                                            onMouseLeave={(e) => e.currentTarget.style.filter = `drop-shadow(0 0 2px rgba(255,255,255,0.1))`}
                                        />
                                    </motion.a>
                                ))}
                            </div>
                        </div>
                    </motion.div>


                    {/* Right Side: Unique Themed Visual */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8 }}
                        viewport={{ once: true }}
                        className="hidden lg:flex justify-center items-center relative h-full w-full min-h-[400px]"
                    >
                        {/* Core glowing background */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-primary/20 rounded-full blur-[100px]"></div>

                        {/* Animated abstract network */}
                        <div className="relative w-full max-w-sm aspect-square">
                            {/* Central interactive-looking orb */}
                            <motion.div
                                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-28 h-28 rounded-full glass-card flex items-center justify-center z-20 border-primary/30 border shadow-[0_0_40px_rgba(128,1,31,0.3)]"
                                animate={{
                                    boxShadow: ["0 0 20px rgba(128,1,31,0.3)", "0 0 50px rgba(128,1,31,0.6)", "0 0 20px rgba(128,1,31,0.3)"]
                                }}
                                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                            >
                                <div className="text-primary animate-pulse flex items-center justify-center">
                                    <MapPin size={40} className="drop-shadow-[0_0_10px_rgba(128,1,31,0.8)]" />
                                </div>
                            </motion.div>

                            {/* Orbiting Elements */}
                            <motion.div
                                className="absolute top-[10%] left-[20%] w-14 h-14 rounded-2xl glass-card flex items-center justify-center z-10 border-white/10"
                                animate={{ y: [0, -15, 0], x: [0, 10, 0], rotate: [0, 10, 0] }}
                                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                            >
                                <Mail size={24} className="text-white/70" />
                            </motion.div>

                            <motion.div
                                className="absolute bottom-[20%] right-[10%] w-16 h-16 rounded-full glass-card flex items-center justify-center z-10 border-white/10"
                                animate={{ y: [0, 20, 0], x: [0, -15, 0], scale: [1, 1.05, 1] }}
                                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                            >
                                <Phone size={28} className="text-primary" />
                            </motion.div>

                            <motion.div
                                className="absolute top-[25%] right-[10%] w-12 h-12 rounded-xl glass-card flex items-center justify-center z-10 border-white/10 bg-primary/5"
                                animate={{ y: [0, 15, 0], x: [0, 15, 0], rotate: [0, -15, 0] }}
                                transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 2 }}
                            >
                                <i className="fa-brands fa-discord text-xl text-white/70"></i>
                            </motion.div>

                            <motion.div
                                className="absolute top-[45%] left-[-5%] w-12 h-12 rounded-xl glass-card flex items-center justify-center z-10 border-white/10 bg-white/5"
                                animate={{ y: [0, -20, 0], x: [0, 10, 0], rotate: [0, 25, 0] }}
                                transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                            >
                                <i className="fa-brands fa-gitlab text-xl text-white/70"></i>
                            </motion.div>

                            <motion.div
                                className="absolute bottom-[10%] left-[25%] w-12 h-12 rounded-full glass-card flex items-center justify-center z-10 border-white/10 bg-white/5"
                                animate={{ y: [0, -10, 0], x: [0, -15, 0] }}
                                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
                            >
                                <i className="fa-brands fa-github text-xl text-white/70"></i>
                            </motion.div>

                            {/* Decorative Lines and Rings */}
                            <svg className="absolute inset-0 w-full h-full -z-10" viewBox="0 0 200 200">
                                <motion.circle
                                    cx="100" cy="100" r="50"
                                    stroke="rgba(255,255,255,0.05)" strokeWidth="1" fill="none"
                                    initial={{ pathLength: 0 }}
                                    whileInView={{ pathLength: 1 }}
                                    transition={{ duration: 2, ease: "easeOut" }}
                                />
                                <motion.circle
                                    cx="100" cy="100" r="75"
                                    stroke="rgba(128,1,31,0.2)" strokeWidth="1" fill="none" strokeDasharray="4 6"
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                                    className="origin-center"
                                />
                                <motion.circle
                                    cx="100" cy="100" r="100"
                                    stroke="rgba(255,255,255,0.03)" strokeWidth="0.5" fill="none" strokeDasharray="2 8"
                                    animate={{ rotate: -360 }}
                                    transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
                                    className="origin-center"
                                />
                            </svg>
                        </div>
                    </motion.div>
                </div>
            </div>

            <footer className="absolute bottom-4 left-0 w-full text-center text-slate-500 text-[10px]">
                <div className="container px-6">
                    <p>&copy; {new Date().getFullYear()} K. M. Fathum Mubin Sachcha. All rights reserved.</p>
                </div>
            </footer>
        </section>
    );
};
