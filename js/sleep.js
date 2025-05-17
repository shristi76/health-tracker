// Sleep Tracker JavaScript

document.addEventListener('DOMContentLoaded', function() {
    initSleepTracker();
    initSleepStatistics();
});

// Initialize sleep tracker functionality
function initSleepTracker() {
    const sleepForm = document.querySelector('.sleep-form');
    const starRating = document.querySelector('.rating');
    const stars = document.querySelectorAll('.star');
    const sleepDateInput = document.getElementById('sleep-date');
    
    // Set default date to today
    if (sleepDateInput) {
        sleepDateInput.valueAsDate = new Date();
    }
    
    // Initialize selected rating
    let selectedRating = 0;
    
    // Add click events to stars
    if (stars.length) {
        stars.forEach(star => {
            star.addEventListener('click', function() {
                const rating = parseInt(this.getAttribute('data-rating'));
                selectedRating = rating;
                updateStars(rating);
            });
            
            // Add hover effects
            star.addEventListener('mouseenter', function() {
                const rating = parseInt(this.getAttribute('data-rating'));
                highlightStars(rating);
            });
            
            star.addEventListener('mouseleave', function() {
                highlightStars(selectedRating);
            });
        });
    }
    
    // Handle form submission
    if (sleepForm) {
        sleepForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form values
            const sleepDate = document.getElementById('sleep-date').value;
            const sleepTime = document.getElementById('sleep-time').value;
            const wakeTime = document.getElementById('wake-time').value;
            const sleepNotes = document.getElementById('sleep-notes').value;
            
            // Validate input
            if (!sleepTime || !wakeTime) {
                showNotification('Please enter both sleep and wake times.', 'error');
                return;
            }
            
            if (selectedRating === 0) {
                showNotification('Please rate your sleep quality.', 'error');
                return;
            }
            
            // Calculate sleep duration
            const duration = calculateSleepDuration(sleepTime, wakeTime);
            
            // Create sleep record
            const sleepRecord = {
                date: sleepDate,
                sleepTime: sleepTime,
                wakeTime: wakeTime,
                quality: selectedRating,
                duration: duration,
                notes: sleepNotes,
                timestamp: new Date().toISOString()
            };
            
            // Save sleep record
            saveSleepRecord(sleepRecord);
            
            // Reset form
            sleepForm.reset();
            sleepDateInput.valueAsDate = new Date();
            selectedRating = 0;
            updateStars(0);
            
            // Show success notification
            showNotification('Sleep record saved successfully!', 'success');
            
            // Update statistics
            updateSleepStatistics();
        });
    }
    
    // Update star display based on rating
    function updateStars(rating) {
        if (stars.length) {
            stars.forEach(star => {
                const starRating = parseInt(star.getAttribute('data-rating'));
                if (starRating <= rating) {
                    star.classList.add('active');
                } else {
                    star.classList.remove('active');
                }
            });
        }
    }
    
    // Highlight stars on hover
    function highlightStars(rating) {
        if (stars.length) {
            stars.forEach(star => {
                const starRating = parseInt(star.getAttribute('data-rating'));
                if (starRating <= rating) {
                    star.classList.add('hover');
                } else {
                    star.classList.remove('hover');
                }
            });
        }
    }
    
    // Calculate sleep duration in hours
    function calculateSleepDuration(sleepTime, wakeTime) {
        const sleepDate = new Date(`2000-01-01T${sleepTime}:00`);
        let wakeDate = new Date(`2000-01-01T${wakeTime}:00`);
        
        // If wake time is earlier than sleep time, add one day
        if (wakeDate < sleepDate) {
            wakeDate = new Date(`2000-01-02T${wakeTime}:00`);
        }
        
        // Calculate difference in hours
        const diffInMs = wakeDate - sleepDate;
        const diffInHours = diffInMs / (1000 * 60 * 60);
        
        return parseFloat(diffInHours.toFixed(1));
    }
}

// Initialize sleep statistics visualization
function initSleepStatistics() {
    // Get the elements
    const sleepGraph = document.querySelector('.sleep-graph');
    const avgDurationElement = document.querySelector('.avg-duration');
    const qualityStarsElement = document.querySelector('.quality-stars');
    const optimalTimeElement = document.querySelector('.optimal-time');
    
    // Update statistics on load
    updateSleepStatistics();
    
    // Create sleep graph if Chart.js is available
    if (sleepGraph && typeof Chart !== 'undefined') {
        createSleepGraph(sleepGraph);
    }
}

// Update all sleep statistics
function updateSleepStatistics() {
    console.log('Updating sleep statistics...');
    
    // Get sleep data
    const sleepData = getSleepData();
    if (!sleepData || !sleepData.records || sleepData.records.length === 0) {
        console.log('No sleep data found or records are empty');
        return;
    }
    
    console.log(`Found ${sleepData.records.length} sleep records`);
    
    try {
        // Calculate average duration
        const avgDurationElement = document.querySelector('.avg-duration');
        const avgDuration = calculateAverageDuration(sleepData.records);
        if (avgDurationElement) {
            avgDurationElement.textContent = avgDuration.toFixed(1);
            console.log(`Updated average duration: ${avgDuration.toFixed(1)}`);
        } else {
            console.log('Average duration element not found');
        }
        
        // Calculate average quality
        const qualityStarsElement = document.querySelector('.quality-stars');
        const avgQuality = calculateAverageQuality(sleepData.records);
        if (qualityStarsElement) {
            qualityStarsElement.innerHTML = generateStarRating(avgQuality);
            console.log(`Updated average quality: ${avgQuality.toFixed(1)}`);
        } else {
            console.log('Quality stars element not found');
        }
        
        // Calculate optimal bedtime
        const optimalTimeElement = document.querySelector('.optimal-time');
        const optimalTime = calculateOptimalBedtime(sleepData.records);
        if (optimalTimeElement) {
            optimalTimeElement.textContent = formatTime(optimalTime);
            console.log(`Updated optimal bedtime: ${formatTime(optimalTime)}`);
        } else {
            console.log('Optimal time element not found');
        }
        
        // Update the graph
        const sleepGraph = document.querySelector('.sleep-graph');
        if (sleepGraph) {
            if (typeof Chart !== 'undefined') {
                if (window.sleepChart) {
                    updateSleepGraph(sleepGraph, sleepData.records);
                } else {
                    createSleepGraph(sleepGraph);
                }
                console.log('Sleep graph updated');
            } else {
                console.log('Chart.js library not loaded');
            }
        } else {
            console.log('Sleep graph element not found');
        }
        
        // Force update of dashboard display if on dashboard
        updateDashboardSleepDisplay(sleepData.records);
        
    } catch (error) {
        console.error('Error updating sleep statistics:', error);
    }
}

// Calculate average sleep duration
function calculateAverageDuration(records) {
    if (!records || records.length === 0) return 0;
    
    const total = records.reduce((sum, record) => sum + record.duration, 0);
    return total / records.length;
}

// Calculate average sleep quality
function calculateAverageQuality(records) {
    if (!records || records.length === 0) return 0;
    
    const total = records.reduce((sum, record) => sum + record.quality, 0);
    return total / records.length;
}

// Generate HTML for star rating display
function generateStarRating(rating) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating - fullStars >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    
    let starsHTML = '';
    
    // Add full stars
    for (let i = 0; i < fullStars; i++) {
        starsHTML += '★';
    }
    
    // Add half star if needed
    if (hasHalfStar) {
        starsHTML += '★'; // Use a full star but with a half-filled style (would need CSS)
    }
    
    // Add empty stars
    for (let i = 0; i < emptyStars; i++) {
        starsHTML += '☆';
    }
    
    return starsHTML;
}

// Calculate optimal bedtime based on quality ratings
function calculateOptimalBedtime(records) {
    if (!records || records.length === 0) return '22:30'; // Default to 10:30 PM
    
    // Filter to only include high quality sleep (4-5 stars)
    const goodSleepRecords = records.filter(record => record.quality >= 4);
    
    if (goodSleepRecords.length === 0) return '22:30'; // Default if no good records
    
    // Get average bedtime of high quality sleeps
    const bedtimes = goodSleepRecords.map(record => {
        const [hours, minutes] = record.sleepTime.split(':').map(Number);
        return hours * 60 + minutes; // Convert to minutes since midnight
    });
    
    const avgBedtimeMinutes = bedtimes.reduce((sum, mins) => sum + mins, 0) / bedtimes.length;
    
    // Convert back to hours:minutes format
    const hours = Math.floor(avgBedtimeMinutes / 60);
    const minutes = Math.round(avgBedtimeMinutes % 60);
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
}

// Format time to 12-hour format with AM/PM
function formatTime(time24h) {
    const [hours, minutes] = time24h.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const hours12 = hours % 12 || 12; // Convert to 12-hour format
    
    return `${hours12}:${minutes.toString().padStart(2, '0')} ${period}`;
}

// Create sleep graph
function createSleepGraph(sleepGraph) {
    const sleepData = getSleepData();
    if (!sleepData || !sleepData.records || sleepData.records.length === 0) {
        console.log('No sleep data to create graph');
        return;
    }
    
    // Check if sleepGraph element exists and create canvas if needed
    if (!sleepGraph) {
        console.error('Sleep graph element not found');
        return;
    }
    
    // Clear any existing content
    sleepGraph.innerHTML = '';
    
    // Create canvas element if it doesn't exist
    let canvas = sleepGraph.querySelector('canvas');
    if (!canvas) {
        canvas = document.createElement('canvas');
        sleepGraph.appendChild(canvas);
        console.log('Created new canvas element for sleep graph');
    }
    
    // Sort records by date
    const sortedRecords = [...sleepData.records].sort((a, b) => new Date(a.date) - new Date(b.date));
    
    // Take the last 7 records or less
    const recentRecords = sortedRecords.slice(-7);
    
    // Prepare data for chart
    const labels = recentRecords.map(record => {
        const date = new Date(record.date);
        return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }).replace(',', '');
    });
    
    const durations = recentRecords.map(record => record.duration);
    const qualities = recentRecords.map(record => record.quality);
    
    // Create chart
    try {
        const sleepChart = new Chart(canvas, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Sleep Duration (hours)',
                        data: durations,
                        backgroundColor: 'rgba(99, 102, 241, 0.7)',
                        borderColor: 'rgba(99, 102, 241, 1)',
                        borderWidth: 1,
                        yAxisID: 'y'
                    },
                    {
                        label: 'Sleep Quality (1-5)',
                        data: qualities,
                        backgroundColor: 'rgba(236, 72, 153, 0.7)',
                        borderColor: 'rgba(236, 72, 153, 1)',
                        borderWidth: 1,
                        type: 'line',
                        fill: false,
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
                        title: {
                            display: true,
                            text: 'Hours'
                        },
                        position: 'left',
                        max: 12
                    },
                    y1: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Quality'
                        },
                        position: 'right',
                        max: 5,
                        grid: {
                            drawOnChartArea: false
                        }
                    }
                }
            }
        });
        
        // Store the chart instance for later updates
        window.sleepChart = sleepChart;
        console.log('Sleep chart created successfully');
    } catch (error) {
        console.error('Error creating sleep chart:', error);
    }
}

// Update sleep graph with new data
function updateSleepGraph(sleepGraph, records) {
    if (!window.sleepChart) {
        console.log('Sleep chart not initialized, creating new chart');
        createSleepGraph(sleepGraph);
        return;
    }
    
    try {
        // Sort records by date
        const sortedRecords = [...records].sort((a, b) => new Date(a.date) - new Date(b.date));
        
        // Take the last 7 records or less
        const recentRecords = sortedRecords.slice(-7);
        
        // Prepare data for chart
        const labels = recentRecords.map(record => {
            const date = new Date(record.date);
            return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }).replace(',', '');
        });
        
        const durations = recentRecords.map(record => record.duration);
        const qualities = recentRecords.map(record => record.quality);
        
        console.log('Updating chart with data:', { labels, durations, qualities });
        
        // Update chart data
        window.sleepChart.data.labels = labels;
        window.sleepChart.data.datasets[0].data = durations;
        window.sleepChart.data.datasets[1].data = qualities;
        
        // Update the chart
        window.sleepChart.update();
        console.log('Sleep chart updated successfully');
    } catch (error) {
        console.error('Error updating sleep chart:', error);
        // If update fails, try recreating the chart
        createSleepGraph(sleepGraph);
    }
}

// Add this new function to update dashboard
function updateDashboardSleepDisplay(records) {
    // Update the dashboard sleep display if it exists
    const lastSleepElement = document.querySelector('.last-sleep');
    if (lastSleepElement && records.length > 0) {
        // Sort by date, most recent first
        const sortedRecords = [...records].sort((a, b) => 
            new Date(b.date + 'T' + b.wakeTime) - new Date(a.date + 'T' + a.wakeTime)
        );
        
        // Get the most recent record
        const latestRecord = sortedRecords[0];
        if (latestRecord) {
            lastSleepElement.textContent = latestRecord.duration;
            console.log(`Updated dashboard with latest sleep duration: ${latestRecord.duration}`);
        }
    }
}

// Save sleep record to localStorage
function saveSleepRecord(record) {
    try {
        // Get existing data or initialize new data
        let sleepData = getSleepData() || {
            records: [],
            lastUpdated: new Date().toISOString()
        };
        
        // Add the new record
        sleepData.records.push(record);
        sleepData.lastUpdated = new Date().toISOString();
        
        // Save to localStorage
        localStorage.setItem('sleepData', JSON.stringify(sleepData));
        console.log('Sleep record saved successfully:', record);
        
        // Also save to the app's general data store if available
        if (window.appHelpers && typeof window.appHelpers.saveData === 'function') {
            window.appHelpers.saveData('sleep', {
                lastDuration: record.duration,
                lastQuality: record.quality
            });
        }
        
        // Force update statistics after saving
        setTimeout(() => {
            updateSleepStatistics();
        }, 100);
        
        return true;
    } catch (error) {
        console.error('Error saving sleep data:', error);
        
        // Show error notification
        showNotification('Failed to save sleep data. Please try again.', 'error');
        
        return false;
    }
}

// Get sleep data from localStorage
function getSleepData() {
    try {
        const data = localStorage.getItem('sleepData');
        return data ? JSON.parse(data) : null;
    } catch (error) {
        console.error('Error retrieving sleep data:', error);
        return null;
    }
}

// Show notification (same implementation as in other js files for consistency)
function showNotification(message, type = 'default') {
    // Check if there's already a notification function in the global scope
    if (window.showNotification && typeof window.showNotification === 'function') {
        // Use the existing function
        window.showNotification(message, type);
        return;
    }
    
    // Create a simple notification
    // Check if notification container exists
    let notificationContainer = document.querySelector('.notification-container');
    
    if (!notificationContainer) {
        // Create notification container
        notificationContainer = document.createElement('div');
        notificationContainer.className = 'notification-container';
        document.body.appendChild(notificationContainer);
    }
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    // Add to container
    notificationContainer.appendChild(notification);
    
    // Remove after delay
    setTimeout(() => {
        notification.style.animation = 'notification-slide-out 0.3s forwards';
        
        // Remove from DOM after animation completes
        setTimeout(() => {
            notification.remove();
            
            // Remove container if empty
            if (notificationContainer.children.length === 0) {
                notificationContainer.remove();
            }
        }, 300);
    }, 3000);
} 