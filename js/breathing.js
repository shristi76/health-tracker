// Breathing Exercise JavaScript

document.addEventListener('DOMContentLoaded', function() {
    initBreathingExercise();
});

// Initialize the breathing exercise
function initBreathingExercise() {
    const startButton = document.querySelector('.start-breathing');
    const circleOutline = document.querySelector('.circle-outline');
    const circleFill = document.querySelector('.circle-fill');
    const breathingText = document.querySelector('.breathing-text');
    const timerMinutes = document.querySelector('.minutes');
    const timerSeconds = document.querySelector('.seconds');
    const exerciseTypes = document.querySelectorAll('.exercise-type');
    
    let isBreathing = false;
    let breathingInterval;
    let timerInterval;
    let remainingTime;
    let currentExerciseType = '4-4-4-4'; // Default to box breathing
    
    // Breathing patterns (in seconds)
    const breathingPatterns = {
        '4-4-4-4': { // Box breathing
            inhale: 4,
            holdAfterInhale: 4,
            exhale: 4,
            holdAfterExhale: 4
        },
        '4-7-8': { // 4-7-8 technique
            inhale: 4,
            holdAfterInhale: 7,
            exhale: 8,
            holdAfterExhale: 0
        },
        'deep': { // Deep breathing
            inhale: 5,
            holdAfterInhale: 2,
            exhale: 5,
            holdAfterExhale: 0
        }
    };
    
    // Exercise type selection
    exerciseTypes.forEach(typeBtn => {
        typeBtn.addEventListener('click', function() {
            // Stop current exercise if running
            if (isBreathing) {
                stopBreathing();
            }
            
            // Update active exercise
            exerciseTypes.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            // Set current exercise type
            currentExerciseType = this.getAttribute('data-type');
            
            // Animate the button
            gsap.fromTo(this, 
                { backgroundColor: 'var(--breathing-color)' }, 
                { backgroundColor: 'var(--breathing-color)', duration: 0.3 }
            );
        });
    });
    
    // Start/stop button click event
    startButton.addEventListener('click', function() {
        if (!isBreathing) {
            startBreathing();
        } else {
            stopBreathing();
        }
    });
    
    // Start the breathing exercise
    function startBreathing() {
        isBreathing = true;
        startButton.textContent = 'Stop Exercise';
        startButton.classList.add('active');
        
        // Set the timer
        const minutes = parseInt(timerMinutes.textContent);
        const seconds = parseInt(timerSeconds.textContent);
        remainingTime = minutes * 60 + seconds;
        
        // Start the timer
        startTimer();
        
        // Start the breathing animation
        breathingCycle();
        
        // Set up interval for continuous breathing cycles
        const pattern = breathingPatterns[currentExerciseType];
        const cycleTime = pattern.inhale + pattern.holdAfterInhale + pattern.exhale + pattern.holdAfterExhale;
        breathingInterval = setInterval(breathingCycle, cycleTime * 1000);
    }
    
    // Stop the breathing exercise
    function stopBreathing() {
        isBreathing = false;
        startButton.textContent = 'Start Exercise';
        startButton.classList.remove('active');
        
        // Clear intervals
        clearInterval(breathingInterval);
        clearInterval(timerInterval);
        
        // Reset animation states
        resetBreathingAnimation();
    }
    
    // Reset the breathing animations
    function resetBreathingAnimation() {
        breathingText.textContent = 'Breathe In';
        
        // Reset GSAP animations
        gsap.killTweensOf(circleOutline);
        gsap.killTweensOf(circleFill);
        
        gsap.to(circleOutline, {
            scale: 1,
            duration: 0.5
        });
        
        gsap.to(circleFill, {
            scale: 1,
            duration: 0.5
        });
    }
    
    // Execute one breathing cycle
    function breathingCycle() {
        const pattern = breathingPatterns[currentExerciseType];
        
        // Inhale phase
        breathingText.textContent = 'Breathe In';
        gsap.to([circleOutline, circleFill], {
            scale: 1.3,
            duration: pattern.inhale,
            ease: 'power1.inOut',
            onComplete: () => {
                // Hold after inhale phase
                if (pattern.holdAfterInhale > 0) {
                    breathingText.textContent = 'Hold';
                    gsap.to([circleOutline, circleFill], {
                        scale: 1.3, // Keep the same scale
                        duration: pattern.holdAfterInhale,
                        ease: 'power1.inOut',
                        onComplete: () => {
                            // Exhale phase
                            breathingText.textContent = 'Breathe Out';
                            gsap.to([circleOutline, circleFill], {
                                scale: 1,
                                duration: pattern.exhale,
                                ease: 'power1.inOut',
                                onComplete: () => {
                                    // Hold after exhale phase
                                    if (pattern.holdAfterExhale > 0) {
                                        breathingText.textContent = 'Hold';
                                        gsap.to([circleOutline, circleFill], {
                                            scale: 1, // Keep the same scale
                                            duration: pattern.holdAfterExhale,
                                            ease: 'power1.inOut'
                                        });
                                    }
                                }
                            });
                        }
                    });
                } else {
                    // Skip hold after inhale and go straight to exhale
                    breathingText.textContent = 'Breathe Out';
                    gsap.to([circleOutline, circleFill], {
                        scale: 1,
                        duration: pattern.exhale,
                        ease: 'power1.inOut'
                    });
                }
            }
        });
    }
    
    // Start the countdown timer
    function startTimer() {
        timerInterval = setInterval(() => {
            if (remainingTime <= 0) {
                // Time's up
                stopBreathing();
                return;
            }
            
            remainingTime--;
            
            // Update timer display
            const minutes = Math.floor(remainingTime / 60);
            const seconds = remainingTime % 60;
            
            timerMinutes.textContent = minutes.toString().padStart(1, '0');
            timerSeconds.textContent = seconds.toString().padStart(2, '0');
            
        }, 1000);
    }
    
    // Add subtle animation to breathing circle when not in exercise
    function addIdleAnimation() {
        gsap.to(circleFill, {
            scale: 1.05,
            duration: 2,
            repeat: -1,
            yoyo: true,
            ease: 'sine.inOut'
        });
    }
    
    // Initialize with idle animation
    addIdleAnimation();
}

// Update CSS for breathing animations
document.addEventListener('DOMContentLoaded', function() {
    const style = document.createElement('style');
    style.textContent = `
        .circle-outline, .circle-fill {
            transition: none; /* Disable CSS transitions to let GSAP handle animations */
        }
        
        .breathing-text {
            transition: opacity 0.3s ease;
        }
        
        @keyframes pulse {
            0% { opacity: 0.7; }
            50% { opacity: 1; }
            100% { opacity: 0.7; }
        }
        
        .breathing-text {
            animation: pulse 2s infinite;
        }
        
        .start-breathing.active {
            background-color: #dc2626;
        }
        
        .start-breathing.active:hover {
            background-color: #b91c1c;
        }
        
        .timer {
            transition: color 0.3s ease;
        }
    `;
    document.head.appendChild(style);
}); 