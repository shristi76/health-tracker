// Weight Tracker JavaScript

document.addEventListener('DOMContentLoaded', function() {
    initWeightTracker();
    initWeightGraph();
});

// Initialize weight tracker functionality
function initWeightTracker() {
    const weightForm = document.querySelector('.weight-form');
    const weightDateInput = document.getElementById('weight-date');
    const weightValueInput = document.getElementById('weight-value');
    const weightUnitSelect = document.getElementById('weight-unit');
    const weightNotesInput = document.getElementById('weight-notes');
    
    // Set default date to today
    if (weightDateInput) {
        weightDateInput.valueAsDate = new Date();
    }
    
    // Load saved weight data
    const weightData = getWeightData();
    
    // Update UI with saved data if available
    if (weightData) {
        updateWeightUI(weightData);
    }
    
    // Setup form submission
    if (weightForm) {
        weightForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form values
            const date = weightDateInput ? weightDateInput.value : new Date().toISOString().slice(0, 10);
            const value = parseFloat(weightValueInput ? weightValueInput.value : 0);
            const unit = weightUnitSelect ? weightUnitSelect.value : 'kg';
            const notes = weightNotesInput ? weightNotesInput.value : '';
            
            // Validate input
            if (isNaN(value) || value <= 0) {
                showNotification('Please enter a valid weight value.', 'error');
                return;
            }
            
            // Create weight record
            const weightRecord = {
                date: date,
                weight: value,
                unit: unit,
                notes: notes,
                timestamp: new Date().toISOString()
            };
            
            // Add weight record
            addWeightRecord(weightRecord);
            
            // Reset form
            weightForm.reset();
            weightDateInput.valueAsDate = new Date();
            
            // Show success notification
            showNotification('Weight record saved successfully!', 'success');
        });
    }
}

// Add a weight record to stored data
function addWeightRecord(record) {
    // Get current weight data
    let weightData = getWeightData() || {
        records: [],
        goal: 65.0,  // Default goal
        startingWeight: null,
        lastUpdated: new Date().toISOString()
    };
    
    // If this is the first record, set it as starting weight
    if (!weightData.startingWeight && weightData.records.length === 0) {
        weightData.startingWeight = record.weight;
    }
    
    // Add the new record
    weightData.records.push(record);
    
    // Sort records by date
    weightData.records.sort((a, b) => new Date(a.date) - new Date(b.date));
    
    // Update last updated time
    weightData.lastUpdated = new Date().toISOString();
    
    // Save to localStorage
    saveWeightData(weightData);
    
    // Update UI
    updateWeightUI(weightData);
    
    // Update weight graph
    updateWeightGraph();
}

// Update weight UI with data
function updateWeightUI(data) {
    if (!data || !data.records || data.records.length === 0) return;
    
    const startingWeightElem = document.querySelector('.starting-weight');
    const currentWeightElem = document.querySelector('.current-weight');
    const weightChangeElem = document.querySelector('.weight-change');
    const weightGoalElem = document.querySelector('.weight-goal');
    
    // Get starting and current weight
    const startingWeight = data.startingWeight || data.records[0].weight;
    const currentWeight = data.records[data.records.length - 1].weight;
    const weightChange = (currentWeight - startingWeight).toFixed(1);
    const weightUnit = data.records[data.records.length - 1].unit || 'kg';
    
    // Update UI elements
    if (startingWeightElem) startingWeightElem.textContent = startingWeight.toFixed(1);
    if (currentWeightElem) currentWeightElem.textContent = currentWeight.toFixed(1);
    if (weightChangeElem) {
        weightChangeElem.textContent = weightChange > 0 ? `+${weightChange}` : weightChange;
        weightChangeElem.style.color = weightChange < 0 ? '#10b981' : (weightChange > 0 ? '#ef4444' : 'inherit');
    }
    if (weightGoalElem) weightGoalElem.textContent = data.goal.toFixed(1);
    
    // Update unit displays
    document.querySelectorAll('.weight-stats .stat p').forEach(stat => {
        if (!stat.querySelector('span + span.unit')) {
            stat.innerHTML = stat.innerHTML + ` <span class="unit">${weightUnit}</span>`;
        } else {
            stat.querySelector('span.unit').textContent = weightUnit;
        }
    });
}

// Initialize weight graph
function initWeightGraph() {
    const graphContainer = document.querySelector('.weight-graph');
    if (!graphContainer) return;
    
    // Create canvas element
    const canvas = document.createElement('canvas');
    canvas.id = 'weightChart';
    graphContainer.appendChild(canvas);
    
    // Update the graph
    updateWeightGraph();
}

// Update weight graph with data
function updateWeightGraph() {
    const ctx = document.getElementById('weightChart');
    if (!ctx) return;
    
    // Get weight data
    const weightData = getWeightData();
    if (!weightData || !weightData.records || weightData.records.length === 0) return;
    
    // Prepare data for chart
    const chartData = {
        labels: [],
        datasets: [{
            label: 'Weight',
            data: [],
            backgroundColor: 'rgba(14, 165, 233, 0.2)',
            borderColor: 'rgba(14, 165, 233, 1)',
            borderWidth: 2,
            tension: 0.4,
            fill: true
        }]
    };
    
    // Add data points (limit to last 10 records for readability)
    const recentRecords = weightData.records.slice(-10);
    recentRecords.forEach(record => {
        const date = new Date(record.date);
        chartData.labels.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
        chartData.datasets[0].data.push(record.weight);
    });
    
    // Get max and min for y-axis range with some padding
    const weights = recentRecords.map(r => r.weight);
    const min = Math.min(...weights) - 2;
    const max = Math.max(...weights) + 2;
    
    // Create or update chart
    if (window.weightChart) {
        window.weightChart.data = chartData;
        window.weightChart.options.scales.y.min = min;
        window.weightChart.options.scales.y.max = max;
        window.weightChart.update();
    } else {
        window.weightChart = new Chart(ctx, {
            type: 'line',
            data: chartData,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: false,
                        min: min,
                        max: max,
                        title: {
                            display: true,
                            text: 'Weight'
                        }
                    }
                },
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const unit = weightData.records[0].unit || 'kg';
                                return `Weight: ${context.raw} ${unit}`;
                            }
                        }
                    }
                }
            }
        });
    }
}

// Save weight data to localStorage
function saveWeightData(data) {
    try {
        localStorage.setItem('weightData', JSON.stringify(data));
        
        // Also save to the app's general data store if available
        if (window.appHelpers && typeof window.appHelpers.saveData === 'function') {
            window.appHelpers.saveData('weight', data);
        }
        
        return true;
    } catch (error) {
        console.error('Error saving weight data:', error);
        return false;
    }
}

// Get weight data from localStorage
function getWeightData() {
    try {
        const data = localStorage.getItem('weightData');
        return data ? JSON.parse(data) : null;
    } catch (error) {
        console.error('Error retrieving weight data:', error);
        return null;
    }
}

// Show notification
function showNotification(message, type = 'default') {
    if (typeof window.showNotification === 'function') {
        window.showNotification(message, type);
        return;
    }
    
    // Fallback notification implementation
    let notificationContainer = document.querySelector('.notification-container');
    
    if (!notificationContainer) {
        notificationContainer = document.createElement('div');
        notificationContainer.className = 'notification-container';
        document.body.appendChild(notificationContainer);
    }
    
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    notificationContainer.appendChild(notification);
    
    // Animate with GSAP if available
    if (window.gsap) {
        gsap.fromTo(notification,
            { opacity: 0, y: -20 },
            {
                opacity: 1,
                y: 0,
                duration: 0.3,
                onComplete: () => {
                    setTimeout(() => {
                        gsap.to(notification, {
                            opacity: 0,
                            y: -20,
                            duration: 0.3,
                            onComplete: () => {
                                notification.remove();
                            }
                        });
                    }, 3000);
                }
            }
        );
    } else {
        // Fallback without GSAP
        notification.style.transition = 'opacity 0.3s, transform 0.3s';
        setTimeout(() => {
            notification.style.opacity = '1';
            notification.style.transform = 'translateY(0)';
        }, 10);
        
        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transform = 'translateY(-20px)';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
} 