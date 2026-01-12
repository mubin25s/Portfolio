document.addEventListener('DOMContentLoaded', () => {
    // Particle Trail Cursor
    const cursorMain = document.createElement('div');
    const cursorGlow = document.createElement('div');
    cursorMain.classList.add('cursor-main');
    cursorGlow.classList.add('cursor-glow');
    document.body.appendChild(cursorMain);
    document.body.appendChild(cursorGlow);

    let mouseX = 0, mouseY = 0;
    let glowX = 0, glowY = 0;
    let lastParticleTime = 0;
    const particleInterval = 30; // milliseconds between particles

    // Track mouse position
    window.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        
        // Main cursor follows immediately
        cursorMain.style.left = mouseX + 'px';
        cursorMain.style.top = mouseY + 'px';

        // Create particle trail
        const currentTime = Date.now();
        if (currentTime - lastParticleTime > particleInterval) {
            createParticle(mouseX, mouseY);
            lastParticleTime = currentTime;
        }
    });

    // Create particle function
    function createParticle(x, y) {
        const particle = document.createElement('div');
        particle.classList.add('cursor-particle');
        particle.style.left = x + 'px';
        particle.style.top = y + 'px';
        
        // Random size variation
        const size = Math.random() * 8 + 8; // 8-16px
        particle.style.width = size + 'px';
        particle.style.height = size + 'px';
        
        document.body.appendChild(particle);
        
        // Remove particle after animation
        setTimeout(() => {
            particle.remove();
        }, 800);
    }

    // Smooth glow animation
    function animateGlow() {
        // Lerp for smooth trailing glow
        glowX += (mouseX - glowX) * 0.1;
        glowY += (mouseY - glowY) * 0.1;
        
        cursorGlow.style.left = glowX + 'px';
        cursorGlow.style.top = glowY + 'px';
        
        requestAnimationFrame(animateGlow);
    }
    animateGlow();

    // Add hover effect for interactive elements
    const interactiveElements = document.querySelectorAll('a, button, input, textarea, .btn, .project-card, .social-links a, .interests-list li');
    
    interactiveElements.forEach(el => {
        el.addEventListener('mouseenter', () => {
            document.body.classList.add('cursor-hover');
        });
        
        el.addEventListener('mouseleave', () => {
            document.body.classList.remove('cursor-hover');
        });
    });

    // Hide cursor when leaving window
    document.addEventListener('mouseleave', () => {
        cursorMain.style.opacity = '0';
        cursorGlow.style.opacity = '0';
    });

    document.addEventListener('mouseenter', () => {
        cursorMain.style.opacity = '1';
        cursorGlow.style.opacity = '1';
    });

    // Initialize Supabase
    const SUPABASE_URL = 'https://yrqfglueiungguldisym.supabase.co';
    const SUPABASE_ANON_KEY = 'sb_publishable_Q7r3Pd9GMh3_-kF8XyILZg_A8ZtJTul';
    const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    // 1. Matrix Rain Background Effect
    const canvas = document.getElementById('bg-canvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let width, height;
        let columns = [];
        let columnCount;
        const fontSize = 14;
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*(){}[]<>/\\|';
        let mouse = { x: null, y: null };

        // Resize
        const resize = () => {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
            columnCount = Math.floor(width / fontSize);
            initColumns();
        };

        // Column Class
        class Column {
            constructor(x) {
                this.x = x;
                this.y = Math.random() * -height;
                this.speed = Math.random() * 3 + 2;
                this.chars = [];
                this.length = Math.floor(Math.random() * 20) + 10;
                
                // Generate random characters for this column
                for (let i = 0; i < this.length; i++) {
                    this.chars.push(chars[Math.floor(Math.random() * chars.length)]);
                }
            }

            update() {
                this.y += this.speed;
                
                // Mouse interaction - slow down near mouse
                if (mouse.x !== null && mouse.y !== null) {
                    const dx = this.x * fontSize - mouse.x;
                    const dy = this.y - mouse.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    
                    if (distance < 150) {
                        this.speed = 0.5;
                    } else {
                        this.speed = Math.random() * 3 + 2;
                    }
                }

                // Reset when off screen
                if (this.y > height + this.length * fontSize) {
                    this.y = Math.random() * -200;
                    this.speed = Math.random() * 3 + 2;
                    
                    // Regenerate characters
                    this.chars = [];
                    this.length = Math.floor(Math.random() * 20) + 10;
                    for (let i = 0; i < this.length; i++) {
                        this.chars.push(chars[Math.floor(Math.random() * chars.length)]);
                    }
                }

                // Occasionally change a character
                if (Math.random() < 0.05) {
                    const idx = Math.floor(Math.random() * this.chars.length);
                    this.chars[idx] = chars[Math.floor(Math.random() * chars.length)];
                }
            }

            draw() {
                ctx.font = `${fontSize}px monospace`;
                
                for (let i = 0; i < this.chars.length; i++) {
                    const charY = this.y + i * fontSize;
                    
                    if (charY > 0 && charY < height) {
                        // Calculate opacity based on position in trail
                        const opacity = (this.chars.length - i) / this.chars.length;
                        
                        // Color gradient - cyan to purple
                        const colorMix = i / this.chars.length;
                        let color;
                        
                        if (colorMix < 0.3) {
                            // Bright head - white/cyan
                            color = `rgba(${Math.floor(255 * (1 - colorMix * 3))}, ${Math.floor(242 + 13 * colorMix * 3)}, 255, ${opacity})`;
                        } else if (colorMix < 0.7) {
                            // Middle - cyan
                            color = `rgba(0, 242, 255, ${opacity * 0.8})`;
                        } else {
                            // Tail - purple fade
                            const purpleMix = (colorMix - 0.7) / 0.3;
                            color = `rgba(${Math.floor(112 * purpleMix)}, ${Math.floor(242 * (1 - purpleMix))}, 255, ${opacity * 0.6})`;
                        }
                        
                        // Add glow to head
                        if (i === 0) {
                            ctx.shadowBlur = 10;
                            ctx.shadowColor = 'rgba(0, 242, 255, 0.8)';
                        } else {
                            ctx.shadowBlur = 0;
                        }
                        
                        ctx.fillStyle = color;
                        ctx.fillText(this.chars[i], this.x * fontSize, charY);
                    }
                }
                
                ctx.shadowBlur = 0;
            }
        }

        const initColumns = () => {
            columns = [];
            for (let i = 0; i < columnCount; i++) {
                columns.push(new Column(i));
            }
        };

        const animate = () => {
            // Fade effect instead of clear
            ctx.fillStyle = 'rgba(3, 3, 3, 0.1)';
            ctx.fillRect(0, 0, width, height);

            // Update and draw columns
            columns.forEach(column => {
                column.update();
                column.draw();
            });

            requestAnimationFrame(animate);
        };

        // Mouse tracking
        window.addEventListener('mousemove', (e) => {
            mouse.x = e.clientX;
            mouse.y = e.clientY;
        });

        window.addEventListener('mouseleave', () => {
            mouse.x = null;
            mouse.y = null;
        });

        window.addEventListener('resize', resize);
        resize();
        animate();
    }

    // 2. Magnetic Buttons (New Feature)
    const buttons = document.querySelectorAll('.btn-primary, .btn-secondary, .social-links a');
    buttons.forEach(btn => {
        btn.addEventListener('mousemove', (e) => {
            const rect = btn.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            
            // Magnetic pull strength
            btn.style.transform = `translate(${x * 0.3}px, ${y * 0.3}px)`;
        });

        btn.addEventListener('mouseleave', () => {
            btn.style.transform = 'translate(0, 0)';
        });
    });

    // 4. Enhanced 3D Tilt with Glare
    const cards = document.querySelectorAll('.project-card, .interests-container, .contact-form');
    cards.forEach(card => {
        // Create glare element if not exists
        if (!card.querySelector('.glare')) {
            const glare = document.createElement('div');
            glare.classList.add('glare');
            card.appendChild(glare);
        }

        const glare = card.querySelector('.glare');

        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            // Calculate mouse position relative to card center
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            // X and Y rotation
            const rotateX = ((y - centerY) / centerY) * -10; // Max tilt (deg)
            const rotateY = ((x - centerX) / centerX) * 10;

            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
            
            // Glare position
            if (glare) {
                glare.style.display = 'block';
                glare.style.left = `${x}px`;
                glare.style.top = `${y}px`;
                glare.style.opacity = '1';
            }
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0)';
            if (glare) glare.style.opacity = '0';
        });
    });

    // 5. Scroll Animations (Intersection Observer)
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                // Staggered delay based on child index if possible, else standard
                setTimeout(() => {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0) scale(1)';
                }, 100); 
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.project-card, .interests-list li, .section-title, .form-group').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(50px) scale(0.95)';
        el.style.transition = 'all 0.6s cubic-bezier(0.23, 1, 0.32, 1)';
        observer.observe(el);
    });

    // 6. Typewriter Effect
    const roleElement = document.querySelector('.role');
    if (roleElement) {
        const roles = [
            "Creative Developer",
            "UI/UX Designer",
            "Full Stack Engineer",
            "Tech Enthusiast"
        ];
        let roleIndex = 0;
        let charIndex = 0;
        let isDeleting = false;
        let typeSpeed = 80;

        const type = () => {
            const currentRole = roles[roleIndex];
            
            if (isDeleting) {
                roleElement.textContent = currentRole.substring(0, charIndex - 1);
                charIndex--;
                typeSpeed = 40;
            } else {
                roleElement.textContent = currentRole.substring(0, charIndex + 1);
                charIndex++;
                typeSpeed = 80;
            }

            if (!isDeleting && charIndex === currentRole.length) {
                isDeleting = true;
                typeSpeed = 2000;
            } else if (isDeleting && charIndex === 0) {
                isDeleting = false;
                roleIndex = (roleIndex + 1) % roles.length;
                typeSpeed = 300;
            }

            setTimeout(type, typeSpeed);
        };
        setTimeout(type, 1000);
    }

    // 7. Supabase Handlers (Preserved Logic) - Contact form code follows...
    // Contact Form Handler
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = contactForm.querySelector('button');
            const originalText = btn.textContent;
            
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const message = document.getElementById('message').value;

            btn.textContent = 'Sending...';
            btn.style.opacity = '0.7';
            btn.disabled = true;

            try {
                if (SUPABASE_URL === 'YOUR_SUPABASE_URL') throw new Error('Configure Supabase keys!');

                const { error } = await supabase
                    .from('contacts')
                    .insert([{ name, email, message }]);

                if (error) throw error;

                btn.textContent = 'Message Sent!';
                btn.style.background = 'var(--accent-color)';
                btn.style.color = '#000';
                contactForm.reset();
            } catch (error) {
                console.error("Error sending message: ", error);
                if (error.message.includes('Configure Supabase')) alert('Check script.js for Supabase keys');
                btn.textContent = 'Error! Try Again.';
                btn.style.background = '#ff4444';
            }

            setTimeout(() => {
                btn.textContent = originalText;
                btn.disabled = false;
                btn.style.background = 'transparent';
                btn.style.color = 'var(--accent-color)';
                btn.style.opacity = '1';
            }, 3000);
        });
    }

    // Rating Form Handler
    const ratingForm = document.getElementById('rating-form');
    if (ratingForm) {
        ratingForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = ratingForm.querySelector('button');
            const originalText = btn.textContent;
            
            const name = document.getElementById('rating-name').value;
            const email = document.getElementById('rating-email').value;
            const rating = parseInt(document.getElementById('rating').value);
            const review = document.getElementById('review').value;

            if (rating === 0) {
                alert('Please select a star rating!');
                return;
            }

            btn.textContent = 'Submitting...';
            btn.style.opacity = '0.7';
            btn.disabled = true;

            try {
                if (SUPABASE_URL === 'YOUR_SUPABASE_URL') throw new Error('Configure Supabase keys!');

                const { error } = await supabase
                    .from('ratings')
                    .insert([{ name, email, rating, review }]);

                if (error) throw error;

                btn.textContent = 'Thank You!';
                btn.style.background = 'var(--accent-color)';
                btn.style.color = '#000';
                ratingForm.reset();
                
                // Reset stars
                const starRating = document.getElementById('star-rating');
                if (starRating) {
                    const stars = starRating.querySelectorAll('i');
                    stars.forEach(star => {
                        star.classList.remove('fa-solid', 'hover-active');
                        star.classList.add('fa-regular');
                    });
                    document.getElementById('rating').value = 0;
                }
            } catch (error) {
                console.error("Error submitting review: ", error);
                if (error.message.includes('Configure Supabase')) alert('Check script.js keys');
                btn.textContent = 'Error! Try Again.';
                btn.style.background = '#ff4444';
            }

            setTimeout(() => {
                btn.textContent = originalText;
                btn.disabled = false;
                btn.style.background = 'transparent';
                btn.style.color = 'var(--accent-color)';
                btn.style.opacity = '1';
            }, 3000);
        });
    }

    // Rating Logic
    const avgContainer = document.getElementById('avg-rating-container');
     if(avgContainer) {
         
         const starRating = document.getElementById('star-rating');
         const ratingInput = document.getElementById('rating');
 
         if (starRating) {
             const stars = starRating.querySelectorAll('i');
             let selectedRating = 0;
 
             stars.forEach((star, index) => {
                 star.addEventListener('click', () => {
                     if (selectedRating === index + 1) {
                         selectedRating = 0;
                     } else {
                         selectedRating = index + 1;
                     }
                     ratingInput.value = selectedRating;
                     updateStars(selectedRating);
                 });
 
                 star.addEventListener('mouseenter', () => {
                     updateStars(index + 1, true);
                 });
             });
 
             starRating.addEventListener('mouseleave', () => {
                 updateStars(selectedRating);
             });
 
             function updateStars(rating, isHover = false) {
                 stars.forEach((star, index) => {
                     if (index < rating) {
                         star.classList.remove('fa-regular');
                         star.classList.add('fa-solid');
                         if (isHover) star.classList.add('hover-active');
                     } else {
                         star.classList.remove('fa-solid', 'hover-active');
                         star.classList.add('fa-regular');
                     }
                 });
             }
         }
         
         // Average Rating Fetch
         (async () => {
            const starsFill = document.getElementById('stars-fill');
            try {
                if (SUPABASE_URL === 'YOUR_SUPABASE_URL') {
                    avgContainer.style.opacity = '0';
                    return;
                }
                const { data, error } = await supabase.from('ratings').select('rating');
                if (data && data.length > 0) {
                    const total = data.reduce((sum, item) => sum + item.rating, 0);
                    const average = total / data.length;
                    const percentage = (average / 5) * 100;
                    if (starsFill) starsFill.style.width = `${percentage}%`;
                    avgContainer.querySelector('.star-rating-display').title = `${average.toFixed(1)} / 5 (${data.length} reviews)`;
                    avgContainer.style.opacity = '1';
                } else {
                    avgContainer.style.opacity = '1';
                }
            } catch (e) { console.error(e); }
         })();
     }

});
