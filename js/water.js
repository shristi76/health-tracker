// Water Intake Tracker JavaScript

document.addEventListener('DOMContentLoaded', function() {
    initWaterTracker();
});

// Initialize water tracker functionality
function initWaterTracker() {
    // Elements
    const decreaseBtn = document.querySelector('.decrease-goal');
    const increaseBtn = document.querySelector('.increase-goal');
    const currentGoalSpan = document.querySelector('.current-goal');
    const cupButtons = document.querySelectorAll('.cup-btn');
    const waterLevel = document.querySelector('.water-level');
    const currentIntakeSpan = document.querySelector('.current-intake');
    const waterTargetSpan = document.querySelector('.water-target');
    const waterChart = document.querySelector('.water-chart');
    const dashboardWaterCount = document.querySelector('.water-count');
    const dashboardWaterGoal = document.querySelector('.water-goal');
    const dashboardWaterProgress = document.querySelector('.water-progress');
    
    // State variables
    let currentGoal = parseInt(localStorage.getItem('waterGoal')) || 8;
    let currentIntake = parseInt(localStorage.getItem('waterIntake')) || 0;
    let weeklyData = JSON.parse(localStorage.getItem('weeklyWaterData')) || generateDefaultWeekData();
    
    // Initialize display
    updateWaterDisplay();
    
    // Event listeners for goal adjusters
    decreaseBtn.addEventListener('click', () => {
        if (currentGoal > 1) {
            currentGoal--;
            updateWaterDisplay();
            saveWaterData();
            
            // Animation for button click
            gsap.fromTo(decreaseBtn, 
                { scale: 0.8 }, 
                { scale: 1, duration: 0.3, ease: 'back.out' }
            );
        }
    });
    
    increaseBtn.addEventListener('click', () => {
        currentGoal++;
        updateWaterDisplay();
        saveWaterData();
        
        // Animation for button click
        gsap.fromTo(increaseBtn, 
            { scale: 0.8 }, 
            { scale: 1, duration: 0.3, ease: 'back.out' }
        );
    });
    
    // Event listeners for cup buttons
    cupButtons.forEach((btn, index) => {
        btn.addEventListener('click', () => {
            // Toggle cups based on index
            const cupValue = index + 1;
            
            if (currentIntake >= cupValue) {
                // User is removing cups up to this point
                currentIntake = cupValue - 1;
            } else {
                // User is adding this cup
                currentIntake = cupValue;
            }
            
            updateWaterDisplay();
            saveWaterData();
            
            // Update daily data
            const today = new Date().toLocaleDateString('en-US', { weekday: 'short' }).toLowerCase();
            weeklyData[today] = currentIntake;
            
            // Save weekly data
            localStorage.setItem('weeklyWaterData', JSON.stringify(weeklyData));
            
            // Update chart
            updateWaterChart();
            
            // Show notification if goal reached
            if (currentIntake === currentGoal) {
                showWaterGoalReachedNotification();
            }
        });
    });
    
    // Initialize water chart
    initWaterChart();
    
    // Update display based on current state
    function updateWaterDisplay() {
        // Update text displays
        currentGoalSpan.textContent = currentGoal;
        currentIntakeSpan.textContent = currentIntake;
        waterTargetSpan.textContent = currentGoal;
        
        // Update dashboard water display if available
        if (dashboardWaterCount) dashboardWaterCount.textContent = currentIntake;
        if (dashboardWaterGoal) dashboardWaterGoal.textContent = currentGoal;
        
        // Calculate percentage
        const percentage = (currentIntake / currentGoal) * 100;
        
        // Update water level visual with animation
        gsap.to(waterLevel, {
            height: `${percentage}%`,
            duration: 1,
            ease: 'power2.out'
        });
        
        // Update dashboard water progress if available
        if (dashboardWaterProgress) {
            dashboardWaterProgress.style.setProperty('--water-fill', `${percentage}%`);
        }
        
        // Update cup buttons
        cupButtons.forEach((btn, index) => {
            if (index < currentIntake) {
                btn.classList.add('filled');
                // Animate the fill
                gsap.fromTo(btn, 
                    { backgroundColor: 'rgba(52, 152, 219, 0.3)' },
                    { backgroundColor: 'rgba(52, 152, 219, 0.8)', duration: 0.5 }
                );
            } else {
                btn.classList.remove('filled');
                // Animate the unfill
                gsap.fromTo(btn, 
                    { backgroundColor: 'rgba(52, 152, 219, 0.8)' },
                    { backgroundColor: 'rgba(52, 152, 219, 0.3)', duration: 0.5 }
                );
            }
        });
    }
    
    // Save water tracking data to localStorage
    function saveWaterData() {
        localStorage.setItem('waterGoal', currentGoal);
        localStorage.setItem('waterIntake', currentIntake);
    }
    
    // Initialize water chart
    function initWaterChart() {
        if (!waterChart) return;
        
        const ctx = waterChart.getContext('2d');
        
        // Get weekly data
        const labels = Object.keys(weeklyData).map(day => day.charAt(0).toUpperCase() + day.slice(1, 3));
        const data = Object.values(weeklyData);
        
        // Create chart
        window.waterTrackChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Cups',
                    data: data,
                    backgroundColor: 'rgba(52, 152, 219, 0.7)',
                    borderColor: 'rgba(52, 152, 219, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        max: Math.max(currentGoal + 2, ...data),
                        grid: {
                            display: false
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    }
                }
            }
        });
    }
    
    // Update water chart with new data
    function updateWaterChart() {
        if (!window.waterTrackChart) return;
        
        window.waterTrackChart.data.datasets[0].data = Object.values(weeklyData);
        window.waterTrackChart.options.scales.y.max = Math.max(currentGoal + 2, ...Object.values(weeklyData));
        window.waterTrackChart.update();
    }
    
    // Generate default weekly data
    function generateDefaultWeekData() {
        const days = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
        const data = {};
        
        days.forEach(day => {
            // Generate random values for past days (between 0 and goal)
            data[day] = Math.floor(Math.random() * (currentGoal + 1));
        });
        
        // Today's value should be the current intake
        const today = new Date().toLocaleDateString('en-US', { weekday: 'short' }).toLowerCase();
        data[today] = currentIntake;
        
        return data;
    }
    
    // Show notification when water goal is reached
    function showWaterGoalReachedNotification() {
        // Check if the notification function exists in the global scope
        if (typeof showNotification === 'function') {
            showNotification('🎉 Congratulations! You have reached your water intake goal for today!', 'success');
        } else {
            // Create a simple notification if the global one isn't available
            const notification = document.createElement('div');
            notification.classList.add('water-notification');
            notification.innerHTML = '<div class="notification-content">🎉 Congratulations! You have reached your water intake goal for today!</div>';
            
            document.body.appendChild(notification);
            
            // Animation
            gsap.fromTo(notification, 
                { y: -50, opacity: 0 },
                { y: 20, opacity: 1, duration: 0.5, ease: 'power2.out' }
            );
            
            // Auto dismiss after 3 seconds
            setTimeout(() => {
                gsap.to(notification, {
                    y: -50, 
                    opacity: 0, 
                    duration: 0.5, 
                    ease: 'power2.in',
                    onComplete: () => notification.remove()
                });
            }, 3000);
        }
        
        // Play a success sound
        playSuccessSound();
    }
    
    // Play a success sound
    function playSuccessSound() {
        try {
            const audio = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-achievement-bell-600.mp3');
            audio.volume = 0.5;
            audio.play();
        } catch (error) {
            console.log('Sound could not be played', error);
        }
    }
}

// Add this style to the document for notifications
document.addEventListener('DOMContentLoaded', function() {
    const style = document.createElement('style');
    style.textContent = `
        .water-notification {
            position: fixed;
            top: 20px;
            right: 20px;
            background-color: #34b3f1;
            color: white;
            padding: 15px 20px;
            border-radius: 5px;
            box-shadow: 0 4px 10px rgba(0,0,0,0.1);
            z-index: 1000;
            max-width: 300px;
        }
        
        .cup-btn {
            position: relative;
            overflow: hidden;
        }
        
        .cup-btn.filled {
            position: relative;
            overflow: hidden;
            background-color: rgba(52, 152, 219, 0.8) !important;
            box-shadow: 0 0 10px rgba(52, 152, 219, 0.5);
        }
        
        .cup-btn.filled::before {
            content: '';
            position: absolute;
            top: -10px;
            left: -10px;
            right: -10px;
            bottom: -10px;
            background: linear-gradient(90deg, rgba(255,255,255,0), rgba(255,255,255,0.3), rgba(255,255,255,0));
            transform: translateX(-100%);
            animation: shine 2s infinite;
        }
        
        @keyframes shine {
            to {
                transform: translateX(100%);
            }
        }
        
        .water-visual {
            border-radius: 50%;
            position: relative;
            overflow: hidden;
            transition: all 0.5s;
        }
        
        .water-level {
            background: linear-gradient(0deg, #34b3f1 0%, #3498db 100%);
            position: absolute;
            bottom: 0;
            left: 0;
            width: 100%;
            transition: height 0.5s ease;
            border-radius: 0 0 50% 50%;
        }
    `;
    document.head.appendChild(style);
});
