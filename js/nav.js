document.addEventListener('DOMContentLoaded', function() {
    // DOM elements
    const navToggle = document.querySelector('.nav-toggle');
    const sidebar = document.querySelector('.sidebar');
    const navLinks = document.querySelectorAll('.nav-links li');
    const tabContents = document.querySelectorAll('.tab-content');
    
    // Mobile navigation toggle
    navToggle.addEventListener('click', function() {
        sidebar.classList.toggle('active');
        
        // Add animation with GSAP
        if (window.gsap) {
            if (sidebar.classList.contains('active')) {
                // Animate sidebar in
                gsap.fromTo(sidebar, 
                    { x: '-100%' },
                    { x: '0%', duration: 0.5, ease: 'power2.out' }
                );
                
                // Animate nav items with stagger
                gsap.fromTo(navLinks, 
                    { x: -20, opacity: 0 },
                    { 
                        x: 0, 
                        opacity: 1, 
                        duration: 0.3, 
                        stagger: 0.05,
                        delay: 0.2,
                        ease: 'power1.out'
                    }
                );
            } else {
                // Animate sidebar out
                gsap.to(sidebar, { 
                    x: '-100%', 
                    duration: 0.5, 
                    ease: 'power2.in' 
                });
            }
        }
    });
    
    // Tab switching functionality
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            const tabId = this.getAttribute('data-tab');
            
            // Update active class for navigation
            navLinks.forEach(item => item.classList.remove('active'));
            this.classList.add('active');
            
            // Show active tab content
            tabContents.forEach(tab => {
                if (tab.id === tabId) {
                    // Hide all tabs first
                    tabContents.forEach(t => t.classList.remove('active'));
                    
                    // Then show the active one with animation
                    if (window.gsap) {
                        // Set initial state
                        gsap.set(tab, { 
                            display: 'block',
                            opacity: 0,
                            y: 20
                        });
                        
                        // Animate in
                        gsap.to(tab, { 
                            opacity: 1, 
                            y: 0, 
                            duration: 0.5, 
                            ease: 'power2.out',
                            onStart: function() {
                                tab.classList.add('active');
                            }
                        });
                        
                        // Animate cards with stagger
                        const cards = tab.querySelectorAll('.card');
                        if (cards.length) {
                            gsap.fromTo(cards, 
                                { y: 30, opacity: 0 },
                                { 
                                    y: 0, 
                                    opacity: 1, 
                                    duration: 0.5, 
                                    stagger: 0.1,
                                    ease: 'back.out(1.2)'
                                }
                            );
                        }
                    } else {
                        // Fallback without GSAP
                        tab.classList.add('active');
                    }
                }
            });
            
            // On mobile, close sidebar after navigation
            if (window.innerWidth < 768) {
                sidebar.classList.remove('active');
                
                if (window.gsap) {
                    gsap.to(sidebar, { 
                        x: '-100%', 
                        duration: 0.3, 
                        ease: 'power2.in' 
                    });
                }
            }
            
            // Update URL hash for direct linking
            window.location.hash = tabId;
        });
    });
    
    // Check URL hash on load to activate correct tab
    if (window.location.hash) {
        const hash = window.location.hash.substring(1);
        const targetLink = document.querySelector(`.nav-links li[data-tab="${hash}"]`);
        
        if (targetLink) {
            targetLink.click();
        }
    }
    
    // Add hover animations to nav items
    if (window.gsap) {
        navLinks.forEach(link => {
            link.addEventListener('mouseenter', function() {
                if (!this.classList.contains('active')) {
                    gsap.to(this, { 
                        backgroundColor: 'rgba(255, 255, 255, 0.1)', 
                        scale: 1.05, 
                        x: 5,
                        duration: 0.3 
                    });
                }
            });
            
            link.addEventListener('mouseleave', function() {
                if (!this.classList.contains('active')) {
                    gsap.to(this, { 
                        backgroundColor: 'transparent', 
                        scale: 1, 
                        x: 0,
                        duration: 0.3 
                    });
                }
            });
        });
    }
    
    // Add scroll animation for main content
    if (window.gsap) {
        const content = document.querySelector('.content');
        
        // Create scroll trigger for elements to animate as they come into view
        if (content && typeof ScrollTrigger !== 'undefined') {
            // Cards animation on scroll
            gsap.utils.toArray('.card').forEach(card => {
                gsap.fromTo(card, 
                    { y: 50, opacity: 0 },
                    { 
                        y: 0, 
                        opacity: 1, 
                        duration: 0.8,
                        scrollTrigger: {
                            trigger: card,
                            start: 'top bottom-=100',
                            toggleActions: 'play none none none'
                        }
                    }
                );
            });
        }
    }
    
    // Add resize event listener to handle responsive behavior
    window.addEventListener('resize', function() {
        if (window.innerWidth >= 768) {
            // Reset sidebar styles on desktop
            sidebar.classList.remove('active');
            sidebar.style.transform = '';
        }
    });
}); 