// Mobile Navigation Toggle
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');

hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navMenu.classList.toggle('active');
});

// Close mobile menu when clicking on a link
document.querySelectorAll('.nav-link').forEach(n => n.addEventListener('click', () => {
    hamburger.classList.remove('active');
    navMenu.classList.remove('active');
}));

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Navbar background on scroll
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 50) {
        navbar.style.background = 'rgba(255, 255, 255, 0.98)';
        navbar.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
    } else {
        navbar.style.background = 'rgba(255, 255, 255, 0.95)';
        navbar.style.boxShadow = 'none';
    }
});

// Contact form handling
// No JavaScript needed - form submits directly to Formspree

// Intersection Observer for animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Initialize all DOM-dependent functionality
function initializeApp() {
    // Initialize cycling text
    initCyclingText();

    // Initialize scroll animations
    const animateElements = document.querySelectorAll('.project-card, .skill-category, .about-content');
    animateElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    initializeApp();
}

// Cycling text animation (disabled for now)
function initCyclingText() {
    // Animation disabled - static text is set in HTML
    console.log('Cycling text animation disabled');
}

// Geometric background removed



// Active navigation link highlighting
window.addEventListener('scroll', () => {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');

    let current = '';
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        if (scrollY >= (sectionTop - 200)) {
            current = section.getAttribute('id');
        }
    });

    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${current}`) {
            link.classList.add('active');
        }
    });
});
// Click Counter functionality
class ClickCounter {
    constructor() {
        this.counterElement = document.getElementById('clickCounter');
        this.catGif = document.getElementById('catGif');
        this.isPlaying = false;
        this.isInitialized = false;

        // GIF files
        this.stillGif = 'oia-still.gif';
        this.animatedGif = 'oia-insta-spin.gif';

        // Audio setup - alternating sound files
        this.sound1 = new Audio('oiia-short-1.mov');
        this.sound2 = new Audio('oiia-short-2.mov');
        this.sound1.preload = 'auto';
        this.sound2.preload = 'auto';
        this.sound1.volume = 0.7;
        this.sound2.volume = 0.7;
        this.currentSoundIndex = 0;

        // Different animation durations for each sound
        this.duration1 = 1000;
        this.duration2 = 700;

        this.init();
    }

    init() {
        // Wait for Firebase to be available
        const checkFirebase = () => {
            if (window.firebaseDB) {
                this.setupCounter();
                this.setupClickHandler();
                this.isInitialized = true;
            } else {
                setTimeout(checkFirebase, 100);
            }
        };
        checkFirebase();

        // Start with still GIF
        this.showStill();
    }

    setupCounter() {
        const counterDoc = window.firebaseDoc(window.firebaseDB, 'counters', 'clicks');

        // Listen for counter changes
        window.firebaseOnSnapshot(counterDoc, (doc) => {
            const data = doc.data();
            const count = data?.count || 0;
            this.counterElement.textContent = count.toLocaleString();
        });
    }

    setupClickHandler() {
        this.catGif.addEventListener('click', () => {
            this.playOnce();
        });
    }

    playOnce() {
        if (this.isPlaying) return;

        this.isPlaying = true;

        // Increment the global counter
        this.incrementCounter();

        // Play sound effect
        this.playSound();

        // Switch to animated GIF
        this.catGif.src = this.animatedGif + '?t=' + new Date().getTime();

        // Use different duration based on current sound
        const animationDuration = this.currentSoundIndex === 0 ? this.duration1 : this.duration2;

        setTimeout(() => {
            this.showStill();
        }, animationDuration);
    }

    playSound() {
        // Alternate between the two sounds
        const currentSound = this.currentSoundIndex === 0 ? this.sound1 : this.sound2;

        // Reset audio to beginning and play
        currentSound.currentTime = 0;
        currentSound.play().catch(error => {
            console.log('Audio play failed:', error);
        });

        // Switch to the other sound for next click
        this.currentSoundIndex = this.currentSoundIndex === 0 ? 1 : 0;
    }

    showStill() {
        this.isPlaying = false;
        this.catGif.src = this.stillGif;
    }

    incrementCounter() {
        if (!window.firebaseDB) return;

        const counterDoc = window.firebaseDoc(window.firebaseDB, 'counters', 'clicks');

        // Atomically increment the counter
        window.firebaseRunTransaction(window.firebaseDB, async (transaction) => {
            const doc = await transaction.get(counterDoc);
            const currentCount = doc.exists() ? doc.data().count || 0 : 0;
            transaction.set(counterDoc, { count: currentCount + 1 });
        });
    }
}

// Initialize click counter when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new ClickCounter();
});