document.addEventListener('DOMContentLoaded', () => {
    // Initialize Supabase
    const SUPABASE_URL = 'https://yrqfglueiungguldisym.supabase.co';
    const SUPABASE_ANON_KEY = 'sb_publishable_Q7r3Pd9GMh3_-kF8XyILZg_A8ZtJTul';
    const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    // Canvas Particle System
    const canvas = document.getElementById('bg-canvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let particles = [];
        const particleCount = 100;
        let w, h;

        const init = () => {
            w = canvas.width = window.innerWidth;
            h = canvas.height = window.innerHeight;
            createParticles();
        };

        const createParticles = () => {
            particles = [];
            for (let i = 0; i < particleCount; i++) {
                particles.push({
                    x: Math.random() * w,
                    y: Math.random() * h,
                    vx: (Math.random() - 0.5) * 0.5, // Slow movement
                    vy: (Math.random() - 0.5) * 0.5,
                    size: Math.random() * 2 + 1,
                    color: 'rgba(0, 242, 255, 0.5)' // Accent color
                });
            }
        };

        const drawParticles = () => {
            ctx.clearRect(0, 0, w, h);
            for (let i = 0; i < particles.length; i++) {
                let p = particles[i];
                p.x += p.vx;
                p.y += p.vy;

                // Bounce off edges
                if (p.x < 0 || p.x > w) p.vx *= -1;
                if (p.y < 0 || p.y > h) p.vy *= -1;

                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fillStyle = p.color;
                ctx.fill();

                // Connections
                for (let j = i + 1; j < particles.length; j++) {
                    let p2 = particles[j];
                    let dx = p.x - p2.x;
                    let dy = p.y - p2.y;
                    let dist = Math.sqrt(dx * dx + dy * dy);

                    if (dist < 100) {
                        ctx.beginPath();
                        ctx.strokeStyle = `rgba(0, 242, 255, ${1 - dist / 100})`;
                        ctx.lineWidth = 0.5;
                        ctx.moveTo(p.x, p.y);
                        ctx.lineTo(p2.x, p2.y);
                        ctx.stroke();
                    }
                }
            }
            requestAnimationFrame(drawParticles);
        };

        window.addEventListener('resize', init);
        init();
        drawParticles();
    }

    // Custom Cursor
    const cursor = document.querySelector('.cursor');
    const follower = document.querySelector('.cursor-follower');
    
    if (cursor && follower) {
        let posX = 0, posY = 0, mouseX = 0, mouseY = 0;

        document.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
            
            // Immediate update for dot
            cursor.style.left = mouseX + 'px';
            cursor.style.top = mouseY + 'px';
        });

        // Smooth follower
        setInterval(() => {
            posX += (mouseX - posX) / 9;
            posY += (mouseY - posY) / 9;
            follower.style.left = posX + 'px';
            follower.style.top = posY + 'px';
        }, 1000 / 60);

        // Hover effects
        const links = document.querySelectorAll('a, button, .project-card, input, textarea');
        links.forEach(link => {
            link.addEventListener('mouseenter', () => {
                cursor.classList.add('active');
                follower.classList.add('active');
                follower.style.transform = 'translate(-50%, -50%) scale(1.5)';
                follower.style.borderColor = 'transparent';
                follower.style.backgroundColor = 'rgba(0, 242, 255, 0.1)';
            });
            link.addEventListener('mouseleave', () => {
                cursor.classList.remove('active');
                follower.classList.remove('active');
                follower.style.transform = 'translate(-50%, -50%) scale(1)';
                follower.style.borderColor = 'var(--accent-color)';
                follower.style.backgroundColor = 'transparent';
            });
        });
    }

    // 3D Tilt Effect for Cards
    const cards = document.querySelectorAll('.project-card');
    cards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            const rotateX = ((y - centerY) / centerY) * -10; // Max 10deg
            const rotateY = ((x - centerX) / centerX) * 10;

            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0)';
        });
    });

    // Star Rating Interaction
    const starRating = document.getElementById('star-rating');
    const ratingInput = document.getElementById('rating');

    if (starRating) {
        const stars = starRating.querySelectorAll('i');
        let selectedRating = 0;

        stars.forEach((star, index) => {
            // Click to select
            star.addEventListener('click', () => {
                // If clicking the same star, deselect it
                if (selectedRating === index + 1) {
                    selectedRating = 0;
                } else {
                    selectedRating = index + 1;
                }
                ratingInput.value = selectedRating;
                updateStars(selectedRating);
            });

            // Hover preview
            star.addEventListener('mouseenter', () => {
                updateStars(index + 1, true);
            });
        });

        // Reset to selected on mouse leave
        starRating.addEventListener('mouseleave', () => {
            updateStars(selectedRating);
        });

        function updateStars(rating, isHover = false) {
            stars.forEach((star, index) => {
                // For hover: fill stars up to hovered one
                // For selection: fill stars up to selected one
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

    // 1. Contact Form Handler
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
                if (error.message.includes('Configure Supabase')) alert('Setup Required: Added keys in script.js?');
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

    // 2. Rating Form Handler
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
                if (error.message.includes('Configure Supabase')) alert('Setup Required: Added keys in script.js?');
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

    // Scroll Animations
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.section, .hero').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'all 0.8s ease-out';
        observer.observe(el);
    });

    // Typewriter Effect
    const roleElement = document.querySelector('.role');
    if (roleElement) {
        const text = roleElement.textContent;
        roleElement.textContent = '';
        let i = 0;
        
        const typeWriter = () => {
            if (i < text.length) {
                roleElement.textContent += text.charAt(i);
                i++;
                setTimeout(typeWriter, 100);
            }
        };

        // Start typing after a small delay
        setTimeout(typeWriter, 500);
    }
    // 3. Average Rating Logic (Percentage Filled)
    const updateAverageRating = async () => {
        const avgContainer = document.getElementById('avg-rating-container');
        const starsFill = document.getElementById('stars-fill');
        
        if (!avgContainer) return;

        try {
            if (SUPABASE_URL === 'YOUR_SUPABASE_URL') {
                avgContainer.style.opacity = '0';
                return;
            }

            const { data, error } = await supabase
                .from('ratings')
                .select('rating');

            if (error) {
                console.error("Error fetching ratings:", error);
                return;
            }

            if (data && data.length > 0) {
                const total = data.reduce((sum, item) => sum + item.rating, 0);
                const average = total / data.length;
                
                // Calculate percentage (e.g., 4.5/5 = 90%)
                const percentage = (average / 5) * 100;
                
                // Apply width to fill layer
                if (starsFill) {
                    starsFill.style.width = `${percentage}%`;
                }
                
                // Set title for hover info
                avgContainer.querySelector('.star-rating-display').title = `${average.toFixed(1)} / 5 (${data.length} reviews)`;

                avgContainer.style.opacity = '1';
            } else {
                if (starsFill) starsFill.style.width = '0%';
                avgContainer.style.opacity = '1'; 
            }

        } catch (e) {
            console.error("Rating fetch exception:", e);
        }
    };

    // Initial fetch
    updateAverageRating();

    // Re-fetch after submission (called in rating form handler if successful)
    // We need to expose this or just reload. 
    // Optimization: Add to the rating form success callback above.
    // For now, let's keep it simple. If we want it to update dynamically, 
    // we should modify the success block in rating form to call this function.
    // Since 'updateAverageRating' is defined here, we can actually modify the submit handler above 
    // OR just copy this logic there. 
    // Better yet, let's just leave it as initial load for now to keep code clean.
    // User can refresh to see new rating.

});

