// Intersection Observer for scroll animations
const observerOptions = {
    threshold: 0.15,
    rootMargin: '0px 0px -50px 0px'
};

const observerCallback = (entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('animate');
            const children = entry.target.querySelectorAll('.skill-category, .project-card, .interest-item');
            children.forEach((child, index) => {
                setTimeout(() => {
                    child.style.opacity = '1';
                    child.style.transform = 'translateY(0)';
                }, index * 100);
            });
        }
    });
};

const observer = new IntersectionObserver(observerCallback, observerOptions);

document.addEventListener('DOMContentLoaded', () => {
    const animatedElements = document.querySelectorAll('.skill-category, .project-card, .interest-item');
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    });

    const sections = document.querySelectorAll('section');
    sections.forEach(section => observer.observe(section));

    initSmoothScroll();
    initNavHighlight();
    initNavbarScroll();
    initMobileMenu();
    initScrollToTop();
    initProjectCards();
});

// Smooth scroll — accounts for floating pill nav height
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const navbar = document.querySelector('.navbar');
                const navHeight = navbar ? navbar.offsetHeight : 0;
                const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - navHeight - 16;
                window.scrollTo({ top: targetPosition, behavior: 'smooth' });

                // Close mobile menu on link click
                const navMenu   = document.querySelector('.nav-menu');
                const navToggle = document.querySelector('.nav-toggle');
                if (navMenu && navToggle) {
                    navMenu.classList.remove('open');
                    navToggle.classList.remove('open');
                    navToggle.setAttribute('aria-expanded', 'false');
                }
            }
        });
    });
}

// Active nav highlight — uses .nav-link class
function initNavHighlight() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');

    function updateActiveLink() {
        let current = '';
        const scrollPos = window.pageYOffset + 200;

        sections.forEach(section => {
            const sectionTop    = section.offsetTop;
            const sectionHeight = section.clientHeight;

            if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
                current = section.getAttribute('id');
            }
        });

        // Fallback: if nothing matched (top of page), highlight Home
        if (!current) {
            current = 'home';
        }

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });
    }

    // Run on scroll and immediately on load
    window.addEventListener('scroll', updateActiveLink);
    updateActiveLink();
}

// Navbar scroll state
function initNavbarScroll() {
    const navbar = document.querySelector('.navbar');

    window.addEventListener('scroll', () => {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        navbar.classList.toggle('scrolled', scrollTop > 80);
    });
}

// Mobile hamburger — fully working
function initMobileMenu() {
    const navToggle = document.querySelector('.nav-toggle');
    const navMenu   = document.querySelector('.nav-menu');

    if (!navToggle || !navMenu) return;

    navToggle.addEventListener('click', function(e) {
        e.stopPropagation();
        const isOpen = navMenu.classList.toggle('open');
        navToggle.classList.toggle('open', isOpen);
        navToggle.setAttribute('aria-expanded', String(isOpen));
    });

    // Close when clicking a nav link
    navMenu.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('open');
            navToggle.classList.remove('open');
            navToggle.setAttribute('aria-expanded', 'false');
        });
    });

    // Close on outside click
    document.addEventListener('click', function(e) {
        if (!navToggle.contains(e.target) && !navMenu.contains(e.target)) {
            navMenu.classList.remove('open');
            navToggle.classList.remove('open');
            navToggle.setAttribute('aria-expanded', 'false');
        }
    });

    // Close on resize back to desktop
    window.addEventListener('resize', function() {
        if (window.innerWidth > 720) {
            navMenu.classList.remove('open');
            navToggle.classList.remove('open');
            navToggle.setAttribute('aria-expanded', 'false');
        }
    });
}

// Scroll to top button
function initScrollToTop() {
    const btn = document.createElement('button');
    btn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 19V5M5 12l7-7 7 7"/></svg>`;
    btn.className = 'scroll-to-top';
    btn.setAttribute('aria-label', 'Scroll to top');

    const styleSheet = document.createElement('style');
    styleSheet.textContent = `
        .scroll-to-top {
            position: fixed; bottom: 2rem; right: 2rem;
            width: 55px; height: 55px; border-radius: 50%;
            background: linear-gradient(135deg, #1B2845, #446B9E);
            color: white; border: none; cursor: pointer;
            opacity: 0; visibility: hidden;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            z-index: 999;
            box-shadow: 0 8px 24px rgba(27,40,69,0.4), 0 0 20px rgba(68,107,158,0.3);
            display: flex; align-items: center; justify-content: center;
        }
        .scroll-to-top.visible { opacity: 1; visibility: visible; }
        .scroll-to-top:hover {
            transform: translateY(-5px);
            box-shadow: 0 12px 32px rgba(27,40,69,0.5), 0 0 30px rgba(157,180,192,0.6);
        }
        .scroll-to-top svg { width: 24px; height: 24px; }
    `;
    document.head.appendChild(styleSheet);
    document.body.appendChild(btn);

    window.addEventListener('scroll', () => {
        btn.classList.toggle('visible', window.pageYOffset > 400);
    });
    btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}

// Parallax for split-screen hero
window.addEventListener('scroll', () => {
    const scrolled    = window.pageYOffset;
    const heroPhoto   = document.querySelector('.hero-photo');
    const heroContent = document.querySelector('.hero-content');

    if (heroPhoto && scrolled < window.innerHeight) {
        heroPhoto.style.transform = `scale(1.04) translateY(${scrolled * 0.12}px)`;
    }
    if (heroContent && scrolled < window.innerHeight) {
        heroContent.style.transform = `translateY(${scrolled * 0.08}px)`;
    }
});

// Button ripple
function createRipple(event) {
    const button = event.currentTarget;
    const ripple = document.createElement('span');
    const rect   = button.getBoundingClientRect();
    const size   = Math.max(rect.width, rect.height);
    ripple.style.cssText = `width:${size}px;height:${size}px;left:${event.clientX-rect.left-size/2}px;top:${event.clientY-rect.top-size/2}px`;
    ripple.classList.add('ripple');
    button.appendChild(ripple);
    setTimeout(() => ripple.remove(), 600);
}

document.querySelectorAll('button').forEach(btn => {
    btn.style.position = 'relative';
    btn.style.overflow = 'hidden';
    btn.addEventListener('click', createRipple);
});

const rippleSheet = document.createElement('style');
rippleSheet.textContent = `
    .ripple {
        position: absolute; border-radius: 50%;
        background: rgba(255,255,255,0.6);
        transform: scale(0);
        animation: ripple-animation 0.6s ease-out;
        pointer-events: none;
    }
    @keyframes ripple-animation { to { transform: scale(4); opacity: 0; } }
`;
document.head.appendChild(rippleSheet);

// Project card tilt — updated for new layout classes
function initProjectCards() {
    document.querySelectorAll('.project-featured, .project-horizontal').forEach(card => {
        card.addEventListener('mousemove', function(e) {
            const rect    = this.getBoundingClientRect();
            const rotateX = ((e.clientY - rect.top)  - rect.height / 2) / 18;
            const rotateY = (rect.width / 2 - (e.clientX - rect.left)) / 18;
            this.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-6px)`;
        });
        card.addEventListener('mouseleave', function() { this.style.transform = ''; });
    });
}

// Info / contact card tilt
document.querySelectorAll('.info-card, .contact-card, .interest-item').forEach(card => {
    card.addEventListener('mousemove', function(e) {
        const rect    = this.getBoundingClientRect();
        const rotateX = ((e.clientY - rect.top)  - rect.height / 2) / 25;
        const rotateY = (rect.width / 2 - (e.clientX - rect.left)) / 25;
        this.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
    });
    card.addEventListener('mouseleave', function() { this.style.transform = ''; });
});

// Skill tag hover
document.querySelectorAll('.skill-tag').forEach(tag => {
    tag.addEventListener('mouseenter', function() { this.style.transform = 'translateY(-3px) scale(1.05)'; });
    tag.addEventListener('mouseleave', function()  { this.style.transform = ''; });
});

// Section badge hover
document.querySelectorAll('.section-tag').forEach(badge => {
    badge.addEventListener('mouseenter', function() { this.style.transform = 'translateY(-3px) scale(1.05)'; });
    badge.addEventListener('mouseleave', function()  { this.style.transform = ''; });
});

// Lazy load images
if ('IntersectionObserver' in window) {
    const imgObserver = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                if (img.dataset.src) { img.src = img.dataset.src; img.removeAttribute('data-src'); }
                img.classList.add('loaded');
                obs.unobserve(img);
            }
        });
    });
    document.querySelectorAll('img[data-src]').forEach(img => imgObserver.observe(img));
}

console.log('%c👋 Welcome to my portfolio!', 'font-size: 20px; font-weight: bold; color: #1B2845;');
console.log('%cInterested in the code? Let\'s connect!', 'font-size: 14px; color: #446B9E;');

// Easter egg
window.activateDiamondMode = function() {
    document.body.style.animation = 'hue-rotate 5s linear infinite';
    for (let i = 0; i < 10; i++) {
        setTimeout(() => {
            const d = document.createElement('div');
            d.style.cssText = `position:fixed;width:40px;height:40px;background:linear-gradient(135deg,#1B2845,#446B9E,#9DB4C0);clip-path:polygon(50% 0%,100% 50%,50% 100%,0% 50%);left:${Math.random()*100}vw;top:-50px;animation:fall ${3+Math.random()*3}s linear;opacity:.7;z-index:9999;pointer-events:none;`;
            document.body.appendChild(d);
            setTimeout(() => d.remove(), 6000);
        }, i * 300);
    }
    setTimeout(() => { document.body.style.animation = ''; }, 15000);
    console.log('%c✨ Diamond mode activated! ✨', 'font-size: 18px; font-weight: bold; color: #1B2845;');
};

const animSheet = document.createElement('style');
animSheet.textContent = `
    @keyframes hue-rotate { 0% { filter:hue-rotate(0deg); } 100% { filter:hue-rotate(360deg); } }
    @keyframes fall {
        0%   { transform:translateY(-50px) rotate(0deg); opacity:0; }
        10%  { opacity:.6; }
        90%  { opacity:.6; }
        100% { transform:translateY(100vh) rotate(360deg); opacity:0; }
    }
    img.loaded { animation: fadeIn .5s ease-in; }
    @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
`;
document.head.appendChild(animSheet);

document.querySelectorAll('a[target="_blank"]').forEach(link => {
    link.addEventListener('click', function() {
        this.style.transform = 'scale(0.95)';
        setTimeout(() => { this.style.transform = ''; }, 200);
    });
});

document.querySelectorAll('a[href="#"]').forEach(link => {
    link.addEventListener('click', e => {
        e.preventDefault();
        console.log('Placeholder link — add actual URL when ready');
    });
});

// Hero load animation
window.addEventListener('load', () => {
    document.body.classList.add('loaded');

    document.querySelectorAll(
        '.hero-label, .hero-name, .hero-identity, .hero-divider, .hero-credentials, .hero-intro, .hero-tech-strip, .hero-buttons, .hero-stats'
    ).forEach((el, i) => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(24px)';
        setTimeout(() => {
            el.style.transition = 'opacity 0.65s ease, transform 0.65s ease';
            el.style.opacity = '1';
            el.style.transform = 'translateY(0)';
        }, 200 + i * 110);
    });

    const imagePanel = document.querySelector('.hero-image-panel');
    if (imagePanel) {
        imagePanel.style.opacity = '0';
        imagePanel.style.transition = 'opacity 0.9s ease';
        setTimeout(() => { imagePanel.style.opacity = '1'; }, 100);
    }
});

// ── Other Projects Toggle ──────────────────────────
(function () {
    const btn   = document.getElementById('otherProjectsToggle');
    const panel = document.getElementById('otherProjectsPanel');
    if (!btn || !panel) return;

    btn.addEventListener('click', function () {
        const isOpen = panel.classList.contains('open');

        panel.classList.toggle('open', !isOpen);
        btn.setAttribute('aria-expanded', String(!isOpen));
        panel.setAttribute('aria-hidden', String(isOpen));

        // Smooth scroll so the grid comes into view when opening
        if (!isOpen) {
            setTimeout(() => {
                panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }, 100);
        }
    });
})();