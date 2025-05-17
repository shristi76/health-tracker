// Health Data JavaScript

document.addEventListener('DOMContentLoaded', function() {
    initHealthDashboard();
});

// Initialize health dashboard functionality
function initHealthDashboard() {
    const connectButton = document.querySelector('.connect-device');
    const deviceSelect = document.getElementById('device-type');
    const statusIndicator = document.querySelector('.status-indicator');
    const statusText = document.querySelector('.status-text');
    
    // Setup device connection
    if (connectButton && deviceSelect) {
        connectButton.addEventListener('click', function() {
            const selectedDevice = deviceSelect.value;
            
            if (!selectedDevice) {
                showNotification('Please select a device first.', 'error');
                return;
            }
            
            // Simulate connecting to device
            statusIndicator.classList.remove('disconnected');
            statusIndicator.classList.add('connecting');
            statusText.textContent = 'Connecting...';
            
            // Simulate connection process
            setTimeout(() => {
                // Simulate successful connection
                statusIndicator.classList.remove('connecting');
                statusIndicator.classList.add('connected');
                statusText.textContent = `Connected to ${deviceSelect.options[deviceSelect.selectedIndex].text}`;
                
                showNotification(`Successfully connected to ${deviceSelect.options[deviceSelect.selectedIndex].text}!`, 'success');
                
                // Generate random health data
                generateHealthData();
            }, 2000);
        });
    }
    
    // Initialize charts
    initHealthCharts();
}

// Generate random health data for demo purposes
function generateHealthData() {
    // Heart rate data
    const heartRateValue = document.querySelector('.metric-card:nth-child(1) .metric-value');
    if (heartRateValue) {
        const randomHeartRate = Math.floor(Math.random() * 20) + 60; // 60-80 bpm
        heartRateValue.innerHTML = `${randomHeartRate} <span class="unit">bpm</span>`;
    }
    
    // Steps data
    const stepsValue = document.querySelector('.metric-card:nth-child(2) .metric-value');
    const stepsProgress = document.querySelector('.steps-progress .progress-bar');
    if (stepsValue && stepsProgress) {
        const randomSteps = Math.floor(Math.random() * 5000) + 5000; // 5000-10000 steps
        stepsValue.innerHTML = `${randomSteps.toLocaleString()} <span class="unit">steps</span>`;
        
        // Update progress bar
        const percentage = (randomSteps / 10000) * 100;
        stepsProgress.style.width = `${percentage}%`;
    }
    
    // Calories data
    const caloriesValue = document.querySelector('.metric-card:nth-child(3) .metric-value');
    if (caloriesValue) {
        const randomCalories = Math.floor(Math.random() * 500) + 1200; // 1200-1700 calories
        caloriesValue.innerHTML = `${randomCalories.toLocaleString()} <span class="unit">cal</span>`;
    }
    
    // Sleep data
    const sleepValue = document.querySelector('.metric-card:nth-child(4) .metric-value');
    if (sleepValue) {
        const randomSleep = (Math.random() * 2 + 6).toFixed(1); // 6-8 hours
        sleepValue.innerHTML = `${randomSleep} <span class="unit">hrs</span>`;
    }
    
    // Animate the changes with GSAP if available
    if (window.gsap) {
        gsap.from('.metric-value', {
            opacity: 0,
            y: -10,
            duration: 0.5,
            stagger: 0.1,
            ease: 'power2.out'
        });
        
        gsap.from('.steps-progress .progress-bar', {
            width: '0%',
            duration: 1,
            ease: 'power2.out'
        });
    }
}

// Initialize health-related charts
function initHealthCharts() {
    // Heart rate chart
    const heartChartElem = document.querySelector('.heart-chart');
    if (heartChartElem && typeof Chart !== 'undefined') {
        // Generate random heart rate data for the last 24 hours
        const hours = Array.from({length: 12}, (_, i) => `${i*2}h`);
        const heartRates = Array.from({length: 12}, () => Math.floor(Math.random() * 20) + 60);
        
        new Chart(heartChartElem, {
            type: 'line',
            data: {
                labels: hours,
                datasets: [{
                    label: 'Heart Rate',
                    data: heartRates,
                    borderColor: '#ef4444',
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        min: 50,
                        max: 100,
                        title: {
                            display: true,
                            text: 'BPM'
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
    
    // Correlation chart
    const correlationChartElem = document.querySelector('.correlation-chart');
    if (correlationChartElem && typeof Chart !== 'undefined') {
        // Generate random correlation data
        const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        const sleepHours = days.map(() => (Math.random() * 3 + 5).toFixed(1));
        const activityLevels = days.map((_, i) => {
            // Activity level somewhat correlates with sleep
            const base = parseFloat(sleepHours[i]);
            return Math.floor((base - 5) * 20 + Math.random() * 10);
        });
        
        new Chart(correlationChartElem, {
            type: 'bar',
            data: {
                labels: days,
                datasets: [
                    {
                        label: 'Sleep (hrs)',
                        data: sleepHours,
                        backgroundColor: 'rgba(99, 102, 241, 0.7)',
                        borderColor: 'rgba(99, 102, 241, 1)',
                        yAxisID: 'y'
                    },
                    {
                        label: 'Activity Level',
                        data: activityLevels,
                        backgroundColor: 'rgba(239, 68, 68, 0.7)',
                        borderColor: 'rgba(239, 68, 68, 1)',
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
                        min: 0,
                        max: 10,
                        position: 'left',
                        title: {
                            display: true,
                            text: 'Sleep (hrs)'
                        }
                    },
                    y1: {
                        min: 0,
                        max: 100,
                        position: 'right',
                        grid: {
                            drawOnChartArea: false
                        },
                        title: {
                            display: true,
                            text: 'Activity Level'
                        }
                    }
                }
            }
        });
    }
    
    // HRV chart
    const hrvChartElem = document.querySelector('.hrv-chart');
    if (hrvChartElem && typeof Chart !== 'undefined') {
        // Generate random HRV data
        const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        const hrvValues = days.map(() => Math.floor(Math.random() * 20) + 40);
        
        new Chart(hrvChartElem, {
            type: 'line',
            data: {
                labels: days,
                datasets: [{
                    label: 'HRV (ms)',
                    data: hrvValues,
                    borderColor: '#8b5cf6',
                    backgroundColor: 'rgba(139, 92, 246, 0.1)',
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        min: 30,
                        max: 70,
                        title: {
                            display: true,
                            text: 'HRV (ms)'
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
}

// Add CSS styles for status indicators
document.addEventListener('DOMContentLoaded', function() {
    const style = document.createElement('style');
    style.textContent = `
        .status-indicator {
            width: 12px;
            height: 12px;
            border-radius: 50%;
            margin-right: 8px;
        }
        
        .status-indicator.disconnected {
            background-color: #9ca3af;
        }
        
        .status-indicator.connecting {
            background-color: #f59e0b;
            animation: pulse 1s infinite;
        }
        
        .status-indicator.connected {
            background-color: #10b981;
        }
        
        @keyframes pulse {
            0% { opacity: 1; }
            50% { opacity: 0.5; }
            100% { opacity: 1; }
        }
        
        .sync-status {
            display: flex;
            align-items: center;
            margin-top: 1rem;
        }
    `;
    document.head.appendChild(style);
}); 