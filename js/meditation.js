// Meditation JavaScript

document.addEventListener('DOMContentLoaded', function() {
    initMeditationApp();
});

// Initialize meditation app functionality
function initMeditationApp() {
    const meditationCards = document.querySelectorAll('.meditation-card');
    const startMeditationBtn = document.querySelector('.start-meditation');
    const customTimeInput = document.getElementById('custom-time');
    const meditationContainer = document.querySelector('.meditation-container');
    const meditationActive = document.querySelector('.meditation-active');
    
    // Setup ambient sounds
    setupAmbientSounds();
    
    // Setup meditation cards selection
    if (meditationCards.length) {
        meditationCards.forEach(card => {
            card.addEventListener('click', function() {
                // Remove active class from all cards
                meditationCards.forEach(c => c.classList.remove('active'));
                
                // Add active class to selected card
                this.classList.add('active');
                
                // Enable start button
                if (startMeditationBtn) {
                    startMeditationBtn.disabled = false;
                }
                
                // Add animation with GSAP if available
                if (window.gsap) {
                    gsap.fromTo(this, 
                        { scale: 0.95 },
                        { scale: 1, duration: 0.3, ease: 'back.out(1.7)' }
                    );
                }
            });
        });
    }
    
    // Setup start meditation button
    if (startMeditationBtn) {
        startMeditationBtn.addEventListener('click', function() {
            const activeCard = document.querySelector('.meditation-card.active');
            
            if (!activeCard) {
                if (typeof window.showNotification === 'function') {
                    window.showNotification('Please select a meditation first', 'error');
                }
                return;
            }
            
            // Get meditation details
            const meditationType = activeCard.getAttribute('data-type');
            const meditationTitle = activeCard.querySelector('h4').textContent;
            const meditationDuration = customTimeInput && customTimeInput.value ? 
                parseInt(customTimeInput.value) : 
                parseInt(activeCard.getAttribute('data-duration') || 300);
            
            // Hide meditation container and show active meditation
            if (meditationContainer && meditationActive) {
                meditationContainer.classList.add('hidden');
                meditationActive.classList.remove('hidden');
                
                // Start meditation
                startMeditation(meditationType, meditationTitle, meditationDuration);
            }
        });
    }
    
    // Setup meditation controls
    setupMeditationControls();
}

// Setup ambient sounds
function setupAmbientSounds() {
    const soundButtons = document.querySelectorAll('.sound-btn');
    let activeSound = null;
    
    if (!soundButtons.length) return;
    
    // Create audio elements
    const sounds = {
        'rain': new Audio('sounds/rain.mp3'),
        'forest': new Audio('sounds/forest.mp3'),
        'waves': new Audio('sounds/waves.mp3'),
        'fire': new Audio('sounds/fire.mp3'),
        'silence': null
    };
    
    // Setup loop for all sounds
    for (const key in sounds) {
        if (sounds[key]) {
            sounds[key].loop = true;
        }
    }
    
    // Add click event to sound buttons
    soundButtons.forEach(button => {
        button.addEventListener('click', function() {
            const soundType = this.getAttribute('data-sound');
            
            // Stop current sound if any
            if (activeSound && sounds[activeSound]) {
                sounds[activeSound].pause();
                sounds[activeSound].currentTime = 0;
            }
            
            // Remove active class from all buttons
            soundButtons.forEach(btn => btn.classList.remove('active'));
            
            // If clicking the same button, just turn off (toggle)
            if (activeSound === soundType) {
                activeSound = null;
                return;
            }
            
            // Set new active sound
            activeSound = soundType;
            
            // Add active class to clicked button
            this.classList.add('active');
            
            // Play the new sound if not silence
            if (sounds[soundType]) {
                sounds[soundType].volume = 0.3; // Set volume to 30%
                sounds[soundType].play();
            }
            
            // Add animation with GSAP if available
            if (window.gsap) {
                gsap.fromTo(this, 
                    { scale: 0.9 },
                    { scale: 1, duration: 0.2, ease: 'power1.out' }
                );
            }
        });
    });
    
    // Return the sounds object for use in other functions
    window.meditationSounds = sounds;
    return sounds;
}

// Setup meditation controls
function setupMeditationControls() {
    const pauseButton = document.querySelector('.pause-meditation');
    const stopButton = document.querySelector('.stop-meditation');
    
    if (!pauseButton || !stopButton) return;
    
    let isPaused = false;
    
    // Pause/resume button
    pauseButton.addEventListener('click', function() {
        if (isPaused) {
            // Resume
            isPaused = false;
            this.innerHTML = '<i class="fas fa-pause"></i>';
            
            // Resume timer animation
            const timerProgress = document.querySelector('.meditation-progress');
            if (timerProgress) {
                timerProgress.style.animationPlayState = 'running';
            }
            
            // Resume ambient sound if any
            const activeSound = document.querySelector('.sound-btn.active');
            if (activeSound && window.meditationSounds) {
                const soundType = activeSound.getAttribute('data-sound');
                if (window.meditationSounds[soundType]) {
                    window.meditationSounds[soundType].play();
                }
            }
        } else {
            // Pause
            isPaused = true;
            this.innerHTML = '<i class="fas fa-play"></i>';
            
            // Pause timer animation
            const timerProgress = document.querySelector('.meditation-progress');
            if (timerProgress) {
                timerProgress.style.animationPlayState = 'paused';
            }
            
            // Pause ambient sound if any
            const activeSound = document.querySelector('.sound-btn.active');
            if (activeSound && window.meditationSounds) {
                const soundType = activeSound.getAttribute('data-sound');
                if (window.meditationSounds[soundType]) {
                    window.meditationSounds[soundType].pause();
                }
            }
        }
    });
    
    // Stop button
    stopButton.addEventListener('click', function() {
        endMeditation();
    });
}

// Start meditation session
function startMeditation(type, title, duration) {
    // Update UI elements
    const meditationTitle = document.querySelector('.meditation-title');
    const timerText = document.querySelector('.meditation-timer');
    const timerProgress = document.querySelector('.meditation-progress');
    
    if (meditationTitle) meditationTitle.textContent = title;
    
    // Format duration for display (MM:SS)
    const minutes = Math.floor(duration / 60);
    const seconds = duration % 60;
    const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    
    if (timerText) timerText.textContent = formattedTime;
    
    // Reset timer animation
    if (timerProgress) {
        // Remove old animation
        timerProgress.style.animation = 'none';
        
        // Force reflow
        void timerProgress.offsetWidth;
        
        // Add new animation
        timerProgress.style.animation = `meditation-progress ${duration}s linear forwards`;
        timerProgress.style.animationPlayState = 'running';
    }
    
    // Start countdown
    let timeLeft = duration;
    clearInterval(window.meditationInterval);
    
    window.meditationInterval = setInterval(() => {
        // Check if paused
        if (document.querySelector('.pause-meditation i').classList.contains('fa-play')) {
            return; // Skip countdown if paused
        }
        
        timeLeft--;
        
        // Format time for display
        const min = Math.floor(timeLeft / 60);
        const sec = timeLeft % 60;
        const display = `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
        
        // Update timer text
        if (timerText) timerText.textContent = display;
        
        // Check if timer is complete
        if (timeLeft <= 0) {
            clearInterval(window.meditationInterval);
            
            // End meditation
            setTimeout(() => {
                endMeditation();
            }, 1000);
        }
    }, 1000);
    
    // Setup breathing guide based on meditation type
    setupBreathingGuide(type);
    
    // Add animation with GSAP if available
    if (window.gsap) {
        gsap.fromTo('.meditation-active', 
            { opacity: 0 },
            { opacity: 1, duration: 1 }
        );
    }
}

// Setup breathing guide animation
function setupBreathingGuide(type) {
    const breathCircle = document.querySelector('.breath-circle');
    const breathText = document.querySelector('.breath-text');
    
    if (!breathCircle || !breathText) return;
    
    // Different breathing patterns
    const patterns = {
        'calm': { inhale: 4, hold: 2, exhale: 6, text: ['Breathe In', 'Hold', 'Breathe Out'] },
        'focus': { inhale: 4, hold: 4, exhale: 4, text: ['Inhale', 'Hold', 'Exhale'] },
        'sleep': { inhale: 4, hold: 7, exhale: 8, text: ['Breathe In', 'Hold', 'Release'] },
        'stress': { inhale: 5, hold: 0, exhale: 5, text: ['In', '', 'Out'] }
    };
    
    // Default to calm if type not found
    const pattern = patterns[type] || patterns.calm;
    
    // Total cycle duration in seconds
    const cycleDuration = pattern.inhale + pattern.hold + pattern.exhale;
    
    // Start breathing animation
    let phase = 0; // 0 = inhale, 1 = hold, 2 = exhale
    
    // Initial text
    breathText.textContent = pattern.text[0];
    
    // Setup animation
    if (window.gsap) {
        // Initial state
        gsap.set(breathCircle, { scale: 0.5, opacity: 0.7 });
        
        // Animation timeline
        const timeline = gsap.timeline({
            repeat: -1,
            onUpdate: function() {
                const progress = timeline.progress();
                const inhaleEnd = pattern.inhale / cycleDuration;
                const holdEnd = (pattern.inhale + pattern.hold) / cycleDuration;
                
                // Update phase and text
                if (progress < inhaleEnd) {
                    if (phase !== 0) {
                        phase = 0;
                        breathText.textContent = pattern.text[0];
                    }
                } else if (progress < holdEnd) {
                    if (phase !== 1) {
                        phase = 1;
                        breathText.textContent = pattern.text[1];
                    }
                } else {
                    if (phase !== 2) {
                        phase = 2;
                        breathText.textContent = pattern.text[2];
                    }
                }
            }
        });
        
        // Inhale animation
        timeline.to(breathCircle, {
            scale: 1,
            opacity: 1,
            duration: pattern.inhale,
            ease: "power1.inOut"
        });
        
        // Hold animation
        if (pattern.hold > 0) {
            timeline.to(breathCircle, {
                scale: 1,
                opacity: 1,
                duration: pattern.hold,
                ease: "none"
            });
        }
        
        // Exhale animation
        timeline.to(breathCircle, {
            scale: 0.5,
            opacity: 0.7,
            duration: pattern.exhale,
            ease: "power1.inOut"
        });
        
        // Store timeline for later control
        window.breathingTimeline = timeline;
    } else {
        // Fallback for no GSAP
        breathCircle.style.animation = `breathing ${cycleDuration}s infinite`;
    }
}

// End meditation session
function endMeditation() {
    const meditationContainer = document.querySelector('.meditation-container');
    const meditationActive = document.querySelector('.meditation-active');
    
    // Clear timer
    clearInterval(window.meditationInterval);
    
    // Stop breathing animation
    if (window.breathingTimeline) {
        window.breathingTimeline.kill();
    }
    
    // Stop all sounds
    if (window.meditationSounds) {
        for (const key in window.meditationSounds) {
            if (window.meditationSounds[key]) {
                window.meditationSounds[key].pause();
                window.meditationSounds[key].currentTime = 0;
            }
        }
    }
    
    // Reset sound buttons
    const soundButtons = document.querySelectorAll('.sound-btn');
    soundButtons.forEach(btn => btn.classList.remove('active'));
    
    // Show meditation container and hide active meditation
    if (meditationContainer && meditationActive) {
        // Animate with GSAP if available
        if (window.gsap) {
            gsap.to(meditationActive, {
                opacity: 0,
                y: 20,
                duration: 0.5,
                onComplete: () => {
                    meditationActive.classList.add('hidden');
                    meditationContainer.classList.remove('hidden');
                    
                    gsap.fromTo(meditationContainer, 
                        { opacity: 0, y: -20 },
                        { opacity: 1, y: 0, duration: 0.5 }
                    );
                }
            });
        } else {
            // Fallback without GSAP
            meditationActive.classList.add('hidden');
            meditationContainer.classList.remove('hidden');
        }
    }
    
    // Show completion notification
    if (typeof window.showNotification === 'function') {
        window.showNotification('Meditation session completed!', 'success');
    }
}

// Add CSS styles for meditation animations
document.addEventListener('DOMContentLoaded', function() {
    const style = document.createElement('style');
    style.textContent = `
        @keyframes meditation-progress {
            from {
                width: 0%;
            }
            to {
                width: 100%;
            }
        }
        
        @keyframes breathing {
            0%, 100% {
                transform: scale(0.5);
                opacity: 0.7;
            }
            50% {
                transform: scale(1);
                opacity: 1;
            }
        }
        
        .meditation-progress-container {
            width: 100%;
            height: 8px;
            background-color: rgba(255, 255, 255, 0.2);
            border-radius: 4px;
            margin: 1.5rem 0;
            overflow: hidden;
        }
        
        .meditation-progress {
            height: 100%;
            background-color: var(--meditation-color, #8b5cf6);
            width: 0%;
        }
        
        .breath-container {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            margin: 2rem 0;
        }
        
        .breath-circle {
            width: 200px;
            height: 200px;
            border-radius: 50%;
            background: radial-gradient(circle, var(--meditation-color, #8b5cf6) 0%, rgba(139, 92, 246, 0.3) 70%, transparent 100%);
            margin-bottom: 1.5rem;
        }
        
        .breath-text {
            font-size: 1.5rem;
            color: var(--text-lighter);
            font-weight: 500;
            letter-spacing: 1px;
        }
        
        .meditation-controls {
            display: flex;
            justify-content: center;
            gap: 1.5rem;
            margin-top: 2rem;
        }
        
        .meditation-controls button {
            background-color: var(--meditation-color, #8b5cf6);
            color: white;
            border: none;
            width: 3rem;
            height: 3rem;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: all 0.2s ease;
        }
        
        .meditation-controls button:hover {
            transform: scale(1.1);
            filter: brightness(1.1);
        }
        
        .sound-controls {
            display: flex;
            flex-wrap: wrap;
            justify-content: center;
            gap: 1rem;
            margin-top: 2rem;
        }
        
        .sound-btn {
            background-color: rgba(255, 255, 255, 0.1);
            border: 1px solid rgba(255, 255, 255, 0.2);
            color: var(--text-lighter);
            border-radius: var(--radius-md);
            padding: 0.5rem 1rem;
            cursor: pointer;
            transition: all 0.2s ease;
        }
        
        .sound-btn:hover {
            background-color: rgba(255, 255, 255, 0.15);
        }
        
        .sound-btn.active {
            background-color: var(--meditation-color, #8b5cf6);
            border-color: var(--meditation-color, #8b5cf6);
            color: white;
        }
    `;
    document.head.appendChild(style);
}); 