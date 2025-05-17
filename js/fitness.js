// Fitness Tracker JavaScript

document.addEventListener('DOMContentLoaded', function() {
    initFitnessTracker();
});

// Initialize fitness tracker functionality
function initFitnessTracker() {
    const routineButtons = document.querySelectorAll('.routine-btn');
    const startRoutineButton = document.querySelector('.start-routine');
    const exerciseItems = document.querySelectorAll('.exercise-item');
    const timerButtons = document.querySelectorAll('.timer-btn');
    const exerciseCheckboxes = document.querySelectorAll('.exercise-done');
    
    // Initialize active routine
    let activeRoutine = 'cardio';
    let workoutInProgress = false;
    
    // Setup routine selection
    if (routineButtons.length) {
        routineButtons.forEach(button => {
            button.addEventListener('click', function() {
                // Remove active class from all buttons
                routineButtons.forEach(btn => btn.classList.remove('active'));
                
                // Add active class to clicked button
                this.classList.add('active');
                
                // Update active routine
                activeRoutine = this.getAttribute('data-routine');
                
                // Update routine header
                const routineHeader = document.querySelector('.routine-header h3');
                if (routineHeader) {
                    routineHeader.textContent = `${activeRoutine.charAt(0).toUpperCase() + activeRoutine.slice(1)} Routine`;
                }
                
                // Update exercise list based on selected routine
                updateExerciseList(activeRoutine);
            });
        });
    }
    
    // Setup start workout button
    if (startRoutineButton) {
        startRoutineButton.addEventListener('click', function() {
            if (!workoutInProgress) {
                // Start workout
                workoutInProgress = true;
                this.textContent = 'End Workout';
                this.style.backgroundColor = '#dc2626';
                
                // Reset checkboxes
                exerciseCheckboxes.forEach(checkbox => {
                    checkbox.checked = false;
                });
                
                // Show notification
                showNotification('Workout started! Let\'s go!', 'success');
                
                // Add animation to first exercise
                if (exerciseItems.length > 0) {
                    exerciseItems[0].classList.add('active-exercise');
                    
                    // Scroll to first exercise if needed
                    exerciseItems[0].scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            } else {
                // End workout
                workoutInProgress = false;
                this.textContent = 'Start Workout';
                this.style.backgroundColor = '';
                
                // Count completed exercises
                const completedExercises = document.querySelectorAll('.exercise-done:checked').length;
                
                // Show notification
                showNotification(`Workout completed! You finished ${completedExercises} exercises.`, 'success');
                
                // Remove active exercise highlight
                exerciseItems.forEach(item => {
                    item.classList.remove('active-exercise');
                });
                
                // Update progress chart
                updateProgressChart(completedExercises);
            }
        });
    }
    
    // Setup exercise timers
    if (timerButtons.length) {
        timerButtons.forEach((button, index) => {
            let timerInterval;
            let seconds = parseInt(button.nextElementSibling.textContent.split(':')[1]) || 30;
            let minutes = parseInt(button.nextElementSibling.textContent.split(':')[0]) || 0;
            let totalSeconds = minutes * 60 + seconds;
            let isRunning = false;
            
            button.addEventListener('click', function() {
                const timeDisplay = this.nextElementSibling;
                const exerciseItem = this.closest('.exercise-item');
                
                if (!isRunning) {
                    // Start timer
                    isRunning = true;
                    this.innerHTML = '<i class="fas fa-pause"></i>';
                    
                    // Add active class to exercise item
                    exerciseItems.forEach(item => item.classList.remove('active-exercise'));
                    exerciseItem.classList.add('active-exercise');
                    
                    timerInterval = setInterval(() => {
                        totalSeconds--;
                        
                        if (totalSeconds <= 0) {
                            // Timer completed
                            clearInterval(timerInterval);
                            isRunning = false;
                            this.innerHTML = '<i class="fas fa-check"></i>';
                            
                            // Mark exercise as completed
                            const checkbox = exerciseItem.querySelector('.exercise-done');
                            if (checkbox) checkbox.checked = true;
                            
                            // Play sound if available
                            const audio = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-software-interface-start-2574.mp3');
                            audio.volume = 0.5;
                            audio.play().catch(e => console.log('Audio play failed:', e));
                            
                            // Show notification
                            showNotification('Exercise completed!', 'success');
                            
                            // Activate next exercise if available
                            if (index < exerciseItems.length - 1) {
                                exerciseItems[index + 1].classList.add('active-exercise');
                                exerciseItems[index + 1].scrollIntoView({ behavior: 'smooth', block: 'center' });
                            }
                            
                            return;
                        }
                        
                        // Update time display
                        const mins = Math.floor(totalSeconds / 60);
                        const secs = totalSeconds % 60;
                        timeDisplay.textContent = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
                    }, 1000);
                } else {
                    // Pause timer
                    isRunning = false;
                    clearInterval(timerInterval);
                    this.innerHTML = '<i class="fas fa-play"></i>';
                }
            });
        });
    }
    
    // Setup exercise checkboxes
    if (exerciseCheckboxes.length) {
        exerciseCheckboxes.forEach(checkbox => {
            checkbox.addEventListener('change', function() {
                const exerciseItem = this.closest('.exercise-item');
                
                if (this.checked) {
                    // Mark as completed
                    exerciseItem.classList.add('completed-exercise');
                    
                    // Update progress
                    updateProgress();
                } else {
                    // Mark as not completed
                    exerciseItem.classList.remove('completed-exercise');
                    
                    // Update progress
                    updateProgress();
                }
            });
        });
    }
    
    // Initialize progress chart
    initProgressChart();
}

// Update exercise list based on selected routine
function updateExerciseList(routineType) {
    const exerciseList = document.querySelector('.exercise-list');
    if (!exerciseList) return;
    
    // Define exercises for each routine type
    const routines = {
        cardio: [
            { name: 'Jumping Jacks', duration: '30', sets: '3 sets x 30 seconds' },
            { name: 'High Knees', duration: '45', sets: '3 sets x 45 seconds' },
            { name: 'Burpees', duration: '60', sets: '3 sets x 10 reps' },
            { name: 'Mountain Climbers', duration: '30', sets: '3 sets x 30 seconds' },
            { name: 'Jump Rope', duration: '180', sets: '3 minutes' }
        ],
        strength: [
            { name: 'Push-ups', duration: '45', sets: '3 sets x 15 reps' },
            { name: 'Squats', duration: '60', sets: '3 sets x 20 reps' },
            { name: 'Planks', duration: '30', sets: '3 sets x 30 seconds' },
            { name: 'Lunges', duration: '45', sets: '3 sets x 10 each leg' },
            { name: 'Dumbbell Rows', duration: '60', sets: '3 sets x 12 reps' }
        ],
        yoga: [
            { name: 'Downward Dog', duration: '60', sets: '60 seconds' },
            { name: 'Warrior Pose', duration: '45', sets: '45 seconds each side' },
            { name: 'Tree Pose', duration: '30', sets: '30 seconds each side' },
            { name: 'Child\'s Pose', duration: '60', sets: '60 seconds' },
            { name: 'Cobra Pose', duration: '45', sets: '3 sets x 15 seconds' }
        ],
        custom: [
            { name: 'Custom Exercise 1', duration: '30', sets: 'As needed' },
            { name: 'Custom Exercise 2', duration: '45', sets: 'As needed' },
            { name: 'Custom Exercise 3', duration: '60', sets: 'As needed' }
        ]
    };
    
    // Get exercises for the selected routine
    const exercises = routines[routineType] || routines.cardio;
    
    // Clear existing exercises
    exerciseList.innerHTML = '';
    
    // Add new exercises
    exercises.forEach(exercise => {
        const mins = Math.floor(parseInt(exercise.duration) / 60);
        const secs = parseInt(exercise.duration) % 60;
        const timeDisplay = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        
        const exerciseItem = document.createElement('div');
        exerciseItem.className = 'exercise-item';
        exerciseItem.innerHTML = `
            <div class="exercise-check">
                <input type="checkbox" class="exercise-done">
            </div>
            <div class="exercise-details">
                <h4>${exercise.name}</h4>
                <p>${exercise.sets}</p>
            </div>
            <div class="exercise-timer">
                <button class="timer-btn"><i class="fas fa-play"></i></button>
                <span class="time-display">${timeDisplay}</span>
            </div>
        `;
        
        exerciseList.appendChild(exerciseItem);
    });
    
    // Reinitialize event listeners for new elements
    const timerButtons = document.querySelectorAll('.timer-btn');
    const exerciseCheckboxes = document.querySelectorAll('.exercise-done');
    
    timerButtons.forEach((button, index) => {
        let timerInterval;
        let timeString = button.nextElementSibling.textContent;
        let minutes = parseInt(timeString.split(':')[0]);
        let seconds = parseInt(timeString.split(':')[1]);
        let totalSeconds = minutes * 60 + seconds;
        let isRunning = false;
        
        button.addEventListener('click', function() {
            const timeDisplay = this.nextElementSibling;
            const exerciseItem = this.closest('.exercise-item');
            
            if (!isRunning) {
                // Start timer
                isRunning = true;
                this.innerHTML = '<i class="fas fa-pause"></i>';
                
                timerInterval = setInterval(() => {
                    totalSeconds--;
                    
                    if (totalSeconds <= 0) {
                        // Timer completed
                        clearInterval(timerInterval);
                        isRunning = false;
                        this.innerHTML = '<i class="fas fa-check"></i>';
                        
                        // Mark exercise as completed
                        const checkbox = exerciseItem.querySelector('.exercise-done');
                        if (checkbox) checkbox.checked = true;
                        
                        return;
                    }
                    
                    // Update time display
                    const mins = Math.floor(totalSeconds / 60);
                    const secs = totalSeconds % 60;
                    timeDisplay.textContent = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
                }, 1000);
            } else {
                // Pause timer
                isRunning = false;
                clearInterval(timerInterval);
                this.innerHTML = '<i class="fas fa-play"></i>';
            }
        });
    });
    
    exerciseCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            const exerciseItem = this.closest('.exercise-item');
            
            if (this.checked) {
                // Mark as completed
                exerciseItem.classList.add('completed-exercise');
                
                // Update progress
                updateProgress();
            } else {
                // Mark as not completed
                exerciseItem.classList.remove('completed-exercise');
                
                // Update progress
                updateProgress();
            }
        });
    });
    
    // Add GSAP animation if available
    if (window.gsap) {
        gsap.fromTo('.exercise-item', 
            { opacity: 0, y: 20 },
            { 
                opacity: 1, 
                y: 0, 
                duration: 0.4,
                stagger: 0.1,
                ease: 'power2.out'
            }
        );
    }
}

// Update progress based on completed exercises
function updateProgress() {
    const totalExercises = document.querySelectorAll('.exercise-done').length;
    const completedExercises = document.querySelectorAll('.exercise-done:checked').length;
    
    // Update dashboard if available
    const activityDone = document.querySelector('.activity-done');
    if (activityDone) {
        activityDone.textContent = completedExercises;
    }
    
    // Update progress bar if available
    const activityProgress = document.querySelector('.activity-progress');
    if (activityProgress) {
        const percentage = totalExercises > 0 ? (completedExercises / totalExercises) * 100 : 0;
        activityProgress.style.setProperty('--progress', `${percentage}%`);
    }
}

// Initialize progress chart
function initProgressChart() {
    const progressChart = document.querySelector('.progress-chart');
    if (!progressChart || typeof Chart === 'undefined') return;
    
    // Generate random data for the chart
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const completedExercises = days.map(() => Math.floor(Math.random() * 5) + 1);
    const workoutDurations = days.map(() => Math.floor(Math.random() * 30) + 15);
    
    // Create chart
    window.fitnessChart = new Chart(progressChart, {
        type: 'bar',
        data: {
            labels: days,
            datasets: [
                {
                    label: 'Exercises Completed',
                    data: completedExercises,
                    backgroundColor: 'rgba(239, 68, 68, 0.7)',
                    borderColor: 'rgba(239, 68, 68, 1)',
                    borderWidth: 1,
                    yAxisID: 'y'
                },
                {
                    label: 'Workout Duration (min)',
                    data: workoutDurations,
                    backgroundColor: 'rgba(99, 102, 241, 0.7)',
                    borderColor: 'rgba(99, 102, 241, 1)',
                    borderWidth: 1,
                    type: 'line',
                    yAxisID: 'y1'
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    position: 'left',
                    title: {
                        display: true,
                        text: 'Exercises'
                    },
                    max: 10
                },
                y1: {
                    beginAtZero: true,
                    position: 'right',
                    title: {
                        display: true,
                        text: 'Minutes'
                    },
                    grid: {
                        drawOnChartArea: false
                    },
                    max: 60
                }
            }
        }
    });
}

// Update progress chart with new data
function updateProgressChart(completedExercises) {
    if (!window.fitnessChart) return;
    
    // Get current data
    const data = window.fitnessChart.data;
    
    // Shift data points left
    data.datasets[0].data.shift();
    data.datasets[1].data.shift();
    
    // Add new data points
    data.datasets[0].data.push(completedExercises);
    data.datasets[1].data.push(Math.floor(Math.random() * 10) + completedExercises * 5); // Estimate duration based on exercises
    
    // Update chart
    window.fitnessChart.update();
}

// Add CSS styles for active and completed exercises
document.addEventListener('DOMContentLoaded', function() {
    const style = document.createElement('style');
    style.textContent = `
        .active-exercise {
            background-color: rgba(99, 102, 241, 0.1);
            border-left: 4px solid var(--fitness-color);
            transform: translateX(5px);
            transition: all 0.3s ease;
        }
        
        .completed-exercise {
            opacity: 0.7;
            background-color: rgba(16, 185, 129, 0.05);
        }
        
        .completed-exercise h4 {
            text-decoration: line-through;
            color: var(--text-light);
        }
        
        .exercise-item {
            transition: all 0.3s ease;
        }
        
        .exercise-item:hover {
            transform: translateX(5px);
            background-color: rgba(249, 250, 251, 0.5);
        }
    `;
    document.head.appendChild(style);
}); 