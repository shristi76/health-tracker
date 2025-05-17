// Meal and Running Tracker JavaScript

document.addEventListener('DOMContentLoaded', function() {
    initMealTracker();
    initRunningTracker(); // Initialize running tracker
});

// Initialize the meal tracker
function initMealTracker() {
    // Form elements
    const mealForm = document.querySelector('.meal-form');
    const mealTypeSelect = document.getElementById('meal-type');
    const mealNameInput = document.getElementById('meal-name');
    const mealCaloriesInput = document.getElementById('meal-calories');
    const mealTimeInput = document.getElementById('meal-time');
    
    // Summary elements
    const calorieText = document.querySelector('.calorie-text');
    const calorieFill = document.querySelector('.calorie-fill');
    const mealTypeCalories = document.querySelectorAll('.meal-type-calories .meal-calories');
    const totalCalories = document.querySelector('.total .meal-calories');
    const mealList = document.querySelector('.meal-list');
    
    // Load saved meals from localStorage
    let todayMeals = loadTodayMeals();
    let calorieGoal = parseInt(localStorage.getItem('calorieGoal')) || 2000;
    
    // Update UI with saved data
    updateMealDisplay();
    
    // Set current time as default if empty
    if (!mealTimeInput.value) {
        const now = new Date();
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        mealTimeInput.value = `${hours}:${minutes}`;
    }
    
    // Form submission
    mealForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Get form values
        const mealType = mealTypeSelect.value;
        const mealName = mealNameInput.value;
        const mealCalories = parseInt(mealCaloriesInput.value);
        const mealTime = mealTimeInput.value;
        
        // Validate input
        if (!mealName || !mealCalories || isNaN(mealCalories)) {
            showNotification('Please fill in all fields correctly', 'error');
            return;
        }
        
        // Create new meal object
        const meal = {
            id: Date.now(),
            type: mealType,
            name: mealName,
            calories: mealCalories,
            time: mealTime,
            date: new Date().toISOString().split('T')[0] // YYYY-MM-DD format
        };
        
        // Add to meals array
        todayMeals.push(meal);
        
        // Save to localStorage
        saveTodayMeals(todayMeals);
        
        // Update UI
        updateMealDisplay();
        
        // Reset form
        mealForm.reset();
        
        // Set current time as default again
        const now = new Date();
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        mealTimeInput.value = `${hours}:${minutes}`;
        
        // Show success notification
        showNotification(`Added ${mealName} (${mealCalories} calories)`, 'success');
        
        // Calculate net calories
        updateNetCalories();
    });
    
    // Update meal display
    function updateMealDisplay() {
        // Clear meal list
        mealList.innerHTML = '';
        
        // Check if there are meals
        if (todayMeals.length === 0) {
            mealList.innerHTML = '<div class="empty-state">No meals logged today</div>';
        } else {
            // Calculate calories by meal type
            const caloriesByType = {
                breakfast: 0,
                lunch: 0,
                dinner: 0,
                snack: 0
            };
            
            // Add each meal to the list
            todayMeals.forEach(meal => {
                // Update calories by type
                caloriesByType[meal.type] += meal.calories;
                
                // Create meal item
                const mealItem = document.createElement('div');
                mealItem.className = 'meal-item';
                mealItem.innerHTML = `
                    <div class="meal-info">
                        <div class="meal-header">
                            <h4>${meal.name}</h4>
                            <span class="meal-time">${meal.time}</span>
                        </div>
                        <div class="meal-details">
                            <span class="meal-type-pill">${formatMealType(meal.type)}</span>
                            <span class="meal-calories">${meal.calories} cal</span>
                        </div>
                    </div>
                    <button class="delete-meal" data-id="${meal.id}"><i class="fas fa-trash"></i></button>
                `;
                
                // Add to list
                mealList.appendChild(mealItem);
                
                // Add delete functionality
                mealItem.querySelector('.delete-meal').addEventListener('click', function() {
                    const mealId = parseInt(this.getAttribute('data-id'));
                    deleteMeal(mealId);
                });
                
                // Animation
                gsap.fromTo(mealItem, 
                    { opacity: 0, y: 20 }, 
                    { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }
                );
            });
            
            // Update meal type calories
            mealTypeCalories[0].textContent = caloriesByType.breakfast;
            mealTypeCalories[1].textContent = caloriesByType.lunch;
            mealTypeCalories[2].textContent = caloriesByType.dinner;
            mealTypeCalories[3].textContent = caloriesByType.snack;
            
            // Calculate total calories
            const totalCal = Object.values(caloriesByType).reduce((sum, cal) => sum + cal, 0);
            totalCalories.textContent = totalCal;
            
            // Update calorie circle
            updateCalorieCircle(totalCal);
        }
        
        // Update net calories
        updateNetCalories();
    }
    
    // Update calorie circle display
    function updateCalorieCircle(totalCal) {
        // Update circle text
        calorieText.textContent = totalCal;
        
        // Calculate percentage of goal
        const percentage = Math.min((totalCal / calorieGoal) * 100, 100);
        
        // Update circle fill
        const circleLength = 100;
        const dashLength = (circleLength * percentage) / 100;
        calorieFill.style.strokeDasharray = `${dashLength} ${circleLength}`;
        
        // Change color based on percentage
        let color = '#2ecc71'; // Green
        if (percentage > 85) {
            color = '#e74c3c'; // Red
        } else if (percentage > 60) {
            color = '#f39c12'; // Orange
        }
        calorieFill.style.stroke = color;
    }
    
    // Delete a meal
    function deleteMeal(id) {
        // Find the meal element
        const mealElement = document.querySelector(`.delete-meal[data-id="${id}"]`).closest('.meal-item');
        
        // Animate removal
        gsap.to(mealElement, {
            opacity: 0,
            y: -20,
            height: 0,
            marginBottom: 0,
            padding: 0,
            duration: 0.3,
            onComplete: () => {
                // Remove from array
                todayMeals = todayMeals.filter(meal => meal.id !== id);
                
                // Save to localStorage
                saveTodayMeals(todayMeals);
                
                // Update display
                updateMealDisplay();
                
                // Show notification
                showNotification('Meal deleted', 'info');
            }
        });
    }
    
    // Format meal type for display
    function formatMealType(type) {
        return type.charAt(0).toUpperCase() + type.slice(1);
    }
    
    // Load today's meals from localStorage
    function loadTodayMeals() {
        // Get all meals
        const allMeals = JSON.parse(localStorage.getItem('meals')) || [];
        
        // Filter to only today's meals
        const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
        return allMeals.filter(meal => meal.date === today);
    }
    
    // Save today's meals to localStorage
    function saveTodayMeals(todayMeals) {
        // Get all meals
        const allMeals = JSON.parse(localStorage.getItem('meals')) || [];
        
        // Filter out today's meals (to avoid duplicates)
        const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
        const otherDaysMeals = allMeals.filter(meal => meal.date !== today);
        
        // Add today's meals back
        const updatedMeals = [...otherDaysMeals, ...todayMeals];
        
        // Save back to localStorage
        localStorage.setItem('meals', JSON.stringify(updatedMeals));
    }
}

// Initialize the running tracker
function initRunningTracker() {
    // Form elements
    const runningForm = document.querySelector('.running-form');
    const runningDateInput = document.getElementById('running-date');
    const runningDistanceInput = document.getElementById('running-distance');
    const runningTimeInput = document.getElementById('running-time');
    const runningIntensitySelect = document.getElementById('running-intensity');
    
    // Summary elements
    const burnText = document.querySelector('.burn-text');
    const burnFill = document.querySelector('.burn-fill');
    const distanceValue = document.querySelector('.distance-value');
    const timeValue = document.querySelector('.time-value');
    const paceValue = document.querySelector('.pace-value');
    const netValue = document.querySelector('.net-value');
    const runningList = document.querySelector('.running-list');
    
    // Load saved running activities from localStorage
    let todayActivities = loadTodayRunningActivities();
    
    // Update UI with saved data
    updateRunningDisplay();
    
    // Set today's date as default if empty
    if (!runningDateInput.value) {
        const today = new Date().toISOString().split('T')[0];
        runningDateInput.value = today;
    }
    
    // Form submission
    runningForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Get form values
        const date = runningDateInput.value;
        const distance = parseFloat(runningDistanceInput.value);
        const time = parseInt(runningTimeInput.value);
        const intensity = runningIntensitySelect.value;
        
        // Validate input
        if (!date || !distance || isNaN(distance) || !time || isNaN(time)) {
            showNotification('Please fill in all fields correctly', 'error');
            return;
        }
        
        // Calculate pace
        const paceMinutes = Math.floor(time / distance);
        const paceSeconds = Math.floor(((time / distance) % 1) * 60);
        const paceFormatted = `${paceMinutes}:${paceSeconds.toString().padStart(2, '0')}`;
        
        // Calculate calories burned 
        // Formula: calories = MET * weight(kg) * time(hours)
        // MET values: light jog (7), medium run (10), intense run (12), sprint (15)
        const metValues = {
            low: 7,
            medium: 10,
            high: 12,
            sprint: 15
        };
        const userWeight = parseInt(localStorage.getItem('userWeight')) || 70; // Default 70kg
        const timeHours = time / 60;
        const caloriesBurned = Math.round(metValues[intensity] * userWeight * timeHours);
        
        // Create new running activity object
        const activity = {
            id: Date.now(),
            date: date,
            distance: distance,
            time: time,
            intensity: intensity,
            pace: paceFormatted,
            calories: caloriesBurned
        };
        
        // Add to activities array
        todayActivities.push(activity);
        
        // Save to localStorage
        saveTodayRunningActivities(todayActivities);
        
        // Update UI
        updateRunningDisplay();
        
        // Reset form
        runningForm.reset();
        
        // Set today's date as default again
        const today = new Date().toISOString().split('T')[0];
        runningDateInput.value = today;
        
        // Show success notification
        showNotification(`Added ${distance} km run (${caloriesBurned} calories burned)`, 'success');
        
        // Calculate net calories
        updateNetCalories();
    });
    
    // Update running display
    function updateRunningDisplay() {
        // Clear running list
        runningList.innerHTML = '';
        
        // Check if there are activities
        if (todayActivities.length === 0) {
            runningList.innerHTML = '<div class="empty-state">No running activities logged</div>';
            
            // Reset summary values
            distanceValue.textContent = '0';
            timeValue.textContent = '0';
            paceValue.textContent = '0:00';
            burnText.textContent = '0';
            burnFill.style.strokeDasharray = '0 100';
        } else {
            // Calculate totals
            let totalDistance = 0;
            let totalTime = 0;
            let totalCalories = 0;
            
            // Add each activity to the list
            todayActivities.forEach(activity => {
                // Update totals
                totalDistance += activity.distance;
                totalTime += activity.time;
                totalCalories += activity.calories;
                
                // Create activity item
                const activityItem = document.createElement('div');
                activityItem.className = 'running-item';
                activityItem.innerHTML = `
                    <div class="running-info">
                        <div class="running-header">
                            <h4>${activity.distance} km Run</h4>
                            <span class="running-date">${formatDate(activity.date)}</span>
                        </div>
                        <div class="running-details">
                            <span class="running-time">${activity.time} min</span>
                            <span class="running-pace">${activity.pace} min/km</span>
                            <span class="running-intensity">${formatIntensity(activity.intensity)}</span>
                            <span class="running-calories">${activity.calories} cal</span>
                        </div>
                    </div>
                    <button class="delete-running" data-id="${activity.id}"><i class="fas fa-trash"></i></button>
                `;
                
                // Add to list
                runningList.appendChild(activityItem);
                
                // Add delete functionality
                activityItem.querySelector('.delete-running').addEventListener('click', function() {
                    const activityId = parseInt(this.getAttribute('data-id'));
                    deleteRunningActivity(activityId);
                });
                
                // Animation
                gsap.fromTo(activityItem, 
                    { opacity: 0, y: 20 }, 
                    { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }
                );
            });
            
            // Update summary values
            distanceValue.textContent = totalDistance.toFixed(1);
            timeValue.textContent = totalTime;
            
            // Calculate average pace
            const avgPaceMinutes = Math.floor(totalTime / totalDistance);
            const avgPaceSeconds = Math.floor(((totalTime / totalDistance) % 1) * 60);
            paceValue.textContent = `${avgPaceMinutes}:${avgPaceSeconds.toString().padStart(2, '0')}`;
            
            // Update calorie burn circle
            burnText.textContent = totalCalories;
            
            // Animate the calorie circle
            const maxCalorieBurn = 1000; // This could be dynamic based on user goals
            const percentage = Math.min((totalCalories / maxCalorieBurn) * 100, 100);
            
            // Update circle fill
            const circleLength = 100;
            const dashLength = (circleLength * percentage) / 100;
            
            // Animate with GSAP
            gsap.to(burnFill, {
                strokeDasharray: `${dashLength} ${circleLength}`,
                duration: 1,
                ease: 'power2.out'
            });
        }
        
        // Update net calories
        updateNetCalories();
    }
    
    // Delete a running activity
    function deleteRunningActivity(id) {
        // Find the activity element
        const activityElement = document.querySelector(`.delete-running[data-id="${id}"]`).closest('.running-item');
        
        // Animate removal
        gsap.to(activityElement, {
            opacity: 0,
            y: -20,
            height: 0,
            marginBottom: 0,
            padding: 0,
            duration: 0.3,
            onComplete: () => {
                // Remove from array
                todayActivities = todayActivities.filter(activity => activity.id !== id);
                
                // Save to localStorage
                saveTodayRunningActivities(todayActivities);
                
                // Update display
                updateRunningDisplay();
                
                // Show notification
                showNotification('Running activity deleted', 'info');
            }
        });
    }
    
    // Format intensity for display
    function formatIntensity(intensity) {
        const formats = {
            low: 'Light Jog',
            medium: 'Moderate Run',
            high: 'Intense Run',
            sprint: 'Sprint Session'
        };
        return formats[intensity] || intensity;
    }
    
    // Format date for display
    function formatDate(dateStr) {
        const options = { month: 'short', day: 'numeric' };
        return new Date(dateStr).toLocaleDateString('en-US', options);
    }
    
    // Load today's running activities from localStorage
    function loadTodayRunningActivities() {
        // Get all activities
        const allActivities = JSON.parse(localStorage.getItem('runningActivities')) || [];
        
        // Filter to only today's activities
        const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
        return allActivities.filter(activity => activity.date === today);
    }
    
    // Save today's running activities to localStorage
    function saveTodayRunningActivities(activities) {
        // Get all activities
        const allActivities = JSON.parse(localStorage.getItem('runningActivities')) || [];
        
        // Filter out today's activities (to avoid duplicates)
        const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
        const otherDaysActivities = allActivities.filter(activity => activity.date !== today);
        
        // Add today's activities back
        const updatedActivities = [...otherDaysActivities, ...activities];
        
        // Save back to localStorage
        localStorage.setItem('runningActivities', JSON.stringify(updatedActivities));
    }
}

// Update net calories (meals consumed minus running calories burned)
function updateNetCalories() {
    const totalCaloriesElement = document.querySelector('.total .meal-calories');
    const burnTextElement = document.querySelector('.burn-text');
    const netValueElement = document.querySelector('.net-value');
    
    if (totalCaloriesElement && burnTextElement && netValueElement) {
        const caloriesConsumed = parseInt(totalCaloriesElement.textContent) || 0;
        const caloriesBurned = parseInt(burnTextElement.textContent) || 0;
        const netCalories = caloriesConsumed - caloriesBurned;
        
        netValueElement.textContent = netCalories;
        
        // Color code based on net value
        if (netCalories > 0) {
            netValueElement.style.color = '#e74c3c'; // Red if surplus
        } else {
            netValueElement.style.color = '#2ecc71'; // Green if deficit
        }
    }
}

// Add styles for running display
document.addEventListener('DOMContentLoaded', function() {
    const style = document.createElement('style');
    style.textContent = `
        .running-item, .meal-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 12px 15px;
            margin-bottom: 12px;
            border-radius: 8px;
            background-color: #fff;
            box-shadow: 0 2px 5px rgba(0,0,0,0.05);
            transition: all 0.3s ease;
        }
        
        .running-item:hover, .meal-item:hover {
            box-shadow: 0 5px 15px rgba(0,0,0,0.1);
        }
        
        .running-info, .meal-info {
            flex: 1;
        }
        
        .running-header, .meal-header {
            display: flex;
            justify-content: space-between;
            margin-bottom: 5px;
        }
        
        .running-header h4, .meal-header h4 {
            margin: 0;
            font-size: 16px;
            font-weight: 500;
        }
        
        .running-date, .meal-time {
            font-size: 14px;
            color: #666;
        }
        
        .running-details, .meal-details {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
        }
        
        .running-time, .running-pace, .running-intensity, .running-calories,
        .meal-type-pill, .meal-calories {
            font-size: 13px;
            padding: 3px 8px;
            border-radius: 15px;
            background-color: #f3f4f6;
        }
        
        .running-calories, .meal-calories {
            background-color: #e74c3c;
            color: #fff;
        }
        
        .delete-running, .delete-meal {
            background: none;
            border: none;
            color: #aaa;
            cursor: pointer;
            font-size: 16px;
            transition: color 0.2s;
        }
        
        .delete-running:hover, .delete-meal:hover {
            color: #e74c3c;
        }
        
        .empty-state {
            text-align: center;
            color: #999;
            padding: 20px;
        }
    `;
    document.head.appendChild(style);
}); 