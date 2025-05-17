// Stretching JavaScript

document.addEventListener('DOMContentLoaded', function() {
    initStretchingSequence();
});

// Initialize stretching sequence functionality
function initStretchingSequence() {
    const stretchItems = document.querySelectorAll('.stretch-item');
    const startSequenceButton = document.querySelector('.start-sequence');
    const stretchContainer = document.querySelector('.stretch-container');
    const stretchActive = document.querySelector('.stretch-active');
    
    // Setup drag and drop for stretch items
    setupDragAndDrop();
    
    // Setup start sequence button
    if (startSequenceButton) {
        startSequenceButton.addEventListener('click', function() {
            // Hide stretch container and show active stretch
            if (stretchContainer && stretchActive) {
                stretchContainer.classList.add('hidden');
                stretchActive.classList.remove('hidden');
                
                // Start the first stretch
                startStretch(0);
            }
        });
    }
    
    // Setup stretch controls
    setupStretchControls();
}

// Setup drag and drop functionality for stretch items
function setupDragAndDrop() {
    const stretchItems = document.querySelectorAll('.stretch-item');
    const stretchSequence = document.querySelector('.stretch-sequence');
    
    if (!stretchItems.length || !stretchSequence) return;
    
    let draggedItem = null;
    
    stretchItems.forEach(item => {
        // Make item draggable
        item.setAttribute('draggable', true);
        
        // Add drag start event
        item.addEventListener('dragstart', function(e) {
            draggedItem = this;
            setTimeout(() => {
                this.style.opacity = '0.4';
            }, 0);
        });
        
        // Add drag end event
        item.addEventListener('dragend', function() {
            draggedItem = null;
            this.style.opacity = '1';
            
            // Update stretch numbers
            updateStretchNumbers();
        });
        
        // Add drag over event
        item.addEventListener('dragover', function(e) {
            e.preventDefault();
            this.classList.add('drag-over');
        });
        
        // Add drag leave event
        item.addEventListener('dragleave', function() {
            this.classList.remove('drag-over');
        });
        
        // Add drop event
        item.addEventListener('drop', function(e) {
            e.preventDefault();
            this.classList.remove('drag-over');
            
            if (draggedItem !== this) {
                // Get positions
                const allItems = [...stretchSequence.querySelectorAll('.stretch-item')];
                const draggedIndex = allItems.indexOf(draggedItem);
                const droppedIndex = allItems.indexOf(this);
                
                // Reorder elements
                if (draggedIndex < droppedIndex) {
                    stretchSequence.insertBefore(draggedItem, this.nextSibling);
                } else {
                    stretchSequence.insertBefore(draggedItem, this);
                }
                
                // Add animation with GSAP if available
                if (window.gsap) {
                    gsap.fromTo(draggedItem, 
                        { scale: 0.95, backgroundColor: 'rgba(99, 102, 241, 0.1)' },
                        { 
                            scale: 1, 
                            backgroundColor: 'transparent',
                            duration: 0.3,
                            ease: 'power2.out'
                        }
                    );
                }
            }
        });
    });
    
    // Add drag events to the sequence container
    stretchSequence.addEventListener('dragover', function(e) {
        e.preventDefault();
    });
    
    stretchSequence.addEventListener('drop', function(e) {
        e.preventDefault();
    });
}

// Update stretch numbers after reordering
function updateStretchNumbers() {
    const stretchItems = document.querySelectorAll('.stretch-item');
    
    stretchItems.forEach((item, index) => {
        const numberElement = item.querySelector('.stretch-number');
        if (numberElement) {
            numberElement.textContent = index + 1;
        }
    });
}

// Setup stretch controls
function setupStretchControls() {
    const prevButton = document.querySelector('.prev-stretch');
    const nextButton = document.querySelector('.next-stretch');
    const pauseButton = document.querySelector('.pause-stretch');
    
    if (!prevButton || !nextButton || !pauseButton) return;
    
    // Current stretch index
    let currentStretchIndex = 0;
    let isPaused = false;
    let timerInterval = null;
    
    // Previous stretch button
    prevButton.addEventListener('click', function() {
        if (currentStretchIndex > 0) {
            clearInterval(timerInterval);
            startStretch(currentStretchIndex - 1);
        }
    });
    
    // Next stretch button
    nextButton.addEventListener('click', function() {
        const stretchItems = document.querySelectorAll('.stretch-item');
        if (currentStretchIndex < stretchItems.length - 1) {
            clearInterval(timerInterval);
            startStretch(currentStretchIndex + 1);
        } else {
            // End sequence
            endStretchSequence();
        }
    });
    
    // Pause/resume button
    pauseButton.addEventListener('click', function() {
        if (isPaused) {
            // Resume
            isPaused = false;
            this.innerHTML = '<i class="fas fa-pause"></i>';
            
            // Resume timer animation
            const timerProgress = document.querySelector('.timer-progress');
            if (timerProgress) {
                timerProgress.style.animationPlayState = 'running';
            }
        } else {
            // Pause
            isPaused = true;
            this.innerHTML = '<i class="fas fa-play"></i>';
            
            // Pause timer animation
            const timerProgress = document.querySelector('.timer-progress');
            if (timerProgress) {
                timerProgress.style.animationPlayState = 'paused';
            }
        }
    });
}

// Start a specific stretch
function startStretch(index) {
    const stretchItems = document.querySelectorAll('.stretch-item');
    if (index < 0 || index >= stretchItems.length) return;
    
    // Update current index
    currentStretchIndex = index;
    
    // Update UI elements
    const stretchName = document.querySelector('.stretch-name');
    const timerText = document.querySelector('.timer-text');
    const timerProgress = document.querySelector('.timer-progress');
    const prevButton = document.querySelector('.prev-stretch');
    const nextButton = document.querySelector('.next-stretch');
    
    // Get stretch details
    const currentStretch = stretchItems[index];
    const stretchTitle = currentStretch.querySelector('.stretch-details h4').textContent;
    const stretchDescription = currentStretch.querySelector('.stretch-details p').textContent;
    
    // Extract duration from description (e.g., "30 seconds each side")
    let duration = 30; // Default duration
    const durationMatch = stretchDescription.match(/(\d+)\s*seconds/);
    if (durationMatch && durationMatch[1]) {
        duration = parseInt(durationMatch[1]);
    }
    
    // Update UI
    if (stretchName) stretchName.textContent = stretchTitle;
    if (timerText) timerText.textContent = duration;
    
    // Update navigation buttons
    if (prevButton) prevButton.disabled = (index === 0);
    if (nextButton) {
        nextButton.innerHTML = (index === stretchItems.length - 1) ? 
            '<i class="fas fa-check"></i>' : 
            '<i class="fas fa-step-forward"></i>';
    }
    
    // Reset pause button
    const pauseButton = document.querySelector('.pause-stretch');
    if (pauseButton) pauseButton.innerHTML = '<i class="fas fa-pause"></i>';
    
    // Reset timer animation
    if (timerProgress) {
        // Remove old animation
        timerProgress.style.animation = 'none';
        
        // Force reflow
        void timerProgress.offsetWidth;
        
        // Add new animation
        timerProgress.style.animation = `countdown ${duration}s linear forwards`;
        timerProgress.style.animationPlayState = 'running';
        
        // Set stroke dasharray and dashoffset for SVG circle
        const radius = timerProgress.getAttribute('r');
        const circumference = 2 * Math.PI * radius;
        timerProgress.style.strokeDasharray = circumference;
        timerProgress.style.strokeDashoffset = '0';
    }
    
    // Start countdown
    let timeLeft = duration;
    clearInterval(window.timerInterval);
    
    window.timerInterval = setInterval(() => {
        // Check if paused
        if (document.querySelector('.pause-stretch i').classList.contains('fa-play')) {
            return; // Skip countdown if paused
        }
        
        timeLeft--;
        
        // Update timer text
        if (timerText) timerText.textContent = timeLeft;
        
        // Check if timer is complete
        if (timeLeft <= 0) {
            clearInterval(window.timerInterval);
            
            // Move to next stretch or end sequence
            if (index < stretchItems.length - 1) {
                setTimeout(() => {
                    startStretch(index + 1);
                }, 1000);
            } else {
                // End sequence
                setTimeout(() => {
                    endStretchSequence();
                }, 1000);
            }
        }
    }, 1000);
    
    // Add animation with GSAP if available
    if (window.gsap) {
        gsap.fromTo('.stretch-name', 
            { opacity: 0, y: -20 },
            { opacity: 1, y: 0, duration: 0.5 }
        );
    }
}

// End the stretching sequence
function endStretchSequence() {
    const stretchContainer = document.querySelector('.stretch-container');
    const stretchActive = document.querySelector('.stretch-active');
    
    // Clear timer
    clearInterval(window.timerInterval);
    
    // Show sequence container and hide active stretch
    if (stretchContainer && stretchActive) {
        // Animate with GSAP if available
        if (window.gsap) {
            gsap.to(stretchActive, {
                opacity: 0,
                y: 20,
                duration: 0.5,
                onComplete: () => {
                    stretchActive.classList.add('hidden');
                    stretchContainer.classList.remove('hidden');
                    
                    gsap.fromTo(stretchContainer, 
                        { opacity: 0, y: -20 },
                        { opacity: 1, y: 0, duration: 0.5 }
                    );
                }
            });
        } else {
            // Fallback without GSAP
            stretchActive.classList.add('hidden');
            stretchContainer.classList.remove('hidden');
        }
    }
    
    // Show completion notification
    if (typeof window.showNotification === 'function') {
        window.showNotification('Stretching sequence completed!', 'success');
    }
}

// Add CSS styles for timer animation
document.addEventListener('DOMContentLoaded', function() {
    const style = document.createElement('style');
    style.textContent = `
        @keyframes countdown {
            from {
                stroke-dashoffset: 0;
            }
            to {
                stroke-dashoffset: 283; /* Will be set dynamically based on circle radius */
            }
        }
        
        .timer-bg {
            fill: none;
            stroke: #e5e7eb;
            stroke-width: 4;
        }
        
        .timer-progress {
            fill: none;
            stroke: var(--stretch-color);
            stroke-width: 4;
            transform-origin: center;
            transform: rotate(-90deg);
            transition: stroke-dashoffset 0.1s linear;
        }
        
        .stretch-timer-circle {
            position: relative;
            width: 200px;
            height: 200px;
            margin: 2rem auto;
        }
        
        .timer-text {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            font-size: 3rem;
            font-weight: 600;
            color: var(--stretch-color);
        }
        
        .stretch-controls {
            display: flex;
            justify-content: center;
            gap: 1.5rem;
            margin-top: 2rem;
        }
        
        .stretch-controls button {
            background-color: var(--stretch-color);
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
        
        .stretch-controls button:hover {
            transform: scale(1.1);
            background-color: #7c3aed;
        }
        
        .stretch-controls button:disabled {
            opacity: 0.5;
            cursor: not-allowed;
            transform: scale(1);
        }
        
        .drag-over {
            border: 2px dashed var(--stretch-color);
            background-color: rgba(139, 92, 246, 0.05);
        }
    `;
    document.head.appendChild(style);
}); 