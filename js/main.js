// // Main JavaScript file for WellnessHub

// document.addEventListener('DOMContentLoaded', function() {
//     // Check if user is logged in - this must run first
//     if (!checkLoginStatus()) {
//         // If not logged in, checkLoginStatus will redirect and we should stop execution
//         return;
//     }
    
//     // Initialize the application - these will only run if the user is logged in
//     initNavigation();
//     initDashboard();
    
//     // Load saved data from localStorage
//     loadSavedData();
    
//     // Setup user profile functionality
//     setupUserProfile();
    
//     // Setup global notification system
//     setupGlobalNotifications();
// });

// // Check if user is logged in, redirect to login page if not
// function checkLoginStatus() {
//     if (!localStorage.getItem('wellnessHubUser')) {
//         // No user data found, redirect to login page
//         window.location.href = 'login.html';
//         return false;
//     }
    
//     try {
//         const userData = JSON.parse(localStorage.getItem('wellnessHubUser'));
//         if (!userData || !userData.isLoggedIn) {
//             // User is not logged in, redirect to login page
//             window.location.href = 'login.html';
//             return false;
//         }
//         // User is logged in
//         return true;
//     } catch (error) {
//         console.error('Error checking login status:', error);
//         // If there's an error, redirect to login page
//         window.location.href = 'login.html';
//         return false;
//     }
// }

// // Setup user profile functionality
// function setupUserProfile() {
//     const userProfile = document.querySelector('.user-profile');
//     const profileInfo = document.querySelector('.profile-info');
    
//     // Update user info if available
//     try {
//         const userData = JSON.parse(localStorage.getItem('wellnessHubUser'));
//         if (userData && userData.email) {
//             // If we have a name, use it, otherwise use the email
//             const displayName = userData.name || userData.email.split('@')[0];
//             profileInfo.querySelector('h3').textContent = displayName;
//         }
//     } catch (error) {
//         console.error('Error loading user profile:', error);
//     }
    
//     // Add logout functionality
//     profileInfo.querySelector('p').addEventListener('click', function() {
//         // Show a small dropdown menu
//         const menu = document.createElement('div');
//         menu.className = 'profile-dropdown';
//         menu.innerHTML = `
//             <ul>
//                 <li class="profile-settings">Settings</li>
//                 <li class="profile-logout">Logout</li>
//             </ul>
//         `;
        
//         // Position the menu
//         menu.style.position = 'absolute';
//         menu.style.top = '50px';
//         menu.style.right = '20px';
//         menu.style.backgroundColor = 'white';
//         menu.style.boxShadow = 'var(--shadow-md)';
//         menu.style.borderRadius = 'var(--radius-md)';
//         menu.style.padding = '0.5rem';
//         menu.style.zIndex = '100';
        
//         // Style the list
//         const style = document.createElement('style');
//         style.textContent = `
//             .profile-dropdown ul {
//                 list-style: none;
//                 padding: 0;
//                 margin: 0;
//             }
//             .profile-dropdown li {
//                 padding: 0.5rem 1rem;
//                 cursor: pointer;
//                 white-space: nowrap;
//                 border-radius: var(--radius-sm);
//             }
//             .profile-dropdown li:hover {
//                 background-color: var(--bg-color);
//             }
//             .profile-logout:hover {
//                 color: #dc2626;
//             }
//         `;
//         document.head.appendChild(style);
        
//         // Add to the body
//         document.body.appendChild(menu);
        
//         // Animate the menu with GSAP
//         gsap.fromTo(menu, 
//             { opacity: 0, y: -10 }, 
//             { opacity: 1, y: 0, duration: 0.2 }
//         );
        
//         // Add event listeners
//         menu.querySelector('.profile-logout').addEventListener('click', function() {
//             // Log the user out
//             localStorage.removeItem('wellnessHubUser');
            
//             // Show logout animation
//             const overlay = document.createElement('div');
//             overlay.style.position = 'fixed';
//             overlay.style.top = '0';
//             overlay.style.left = '0';
//             overlay.style.width = '100%';
//             overlay.style.height = '100%';
//             overlay.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
//             overlay.style.display = 'flex';
//             overlay.style.justifyContent = 'center';
//             overlay.style.alignItems = 'center';
//             overlay.style.zIndex = '1000';
            
//             const message = document.createElement('div');
//             message.textContent = 'Logging out...';
//             message.style.fontWeight = '500';
//             message.style.fontSize = '1.2rem';
            
//             overlay.appendChild(message);
//             document.body.appendChild(overlay);
            
//             // Redirect after a short delay
//             setTimeout(() => {
//                 window.location.href = 'login.html';
//             }, 1000);
//         });
        
//         menu.querySelector('.profile-settings').addEventListener('click', function() {
//             alert('Settings functionality would go here in a real app');
//             menu.remove();
//         });
        
//         // Close the menu when clicking outside
//         document.addEventListener('click', function closeMenu(e) {
//             if (!menu.contains(e.target) && !profileInfo.contains(e.target)) {
//                 gsap.to(menu, {
//                     opacity: 0,
//                     y: -10,
//                     duration: 0.2,
//                     onComplete: () => menu.remove()
//                 });
//                 document.removeEventListener('click', closeMenu);
//             }
//         });
//     });
// }

// Handle navigation between tabs
function initNavigation() {
    const navLinks = document.querySelectorAll('.nav-links li');
    const tabContents = document.querySelectorAll('.tab-content');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            // Remove active class from all links and tab contents
            navLinks.forEach(item => item.classList.remove('active'));
            tabContents.forEach(tab => tab.classList.remove('active'));
            
            // Add active class to current link
            this.classList.add('active');
            
            // Show the corresponding tab content
            const tabId = this.getAttribute('data-tab');
            document.getElementById(tabId).classList.add('active');
            
            // Animation for the active tab
            gsap.fromTo(`#${tabId}`, 
                { opacity: 0, y: 20 },
                { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }
            );
        });
    });
}

// Initialize dashboard with sample data and animations
function initDashboard() {
    // Mock data for the dashboard
    const mockData = {
        moodToday: '😊',
        waterCups: 3,
        waterGoal: 8,
        sleepHours: 7.5,
        activitiesDone: 2,
        activitiesGoal: 5
    };
    
    // Update dashboard elements with data
    document.querySelector('.today-mood .emoji').textContent = mockData.moodToday;
    document.querySelector('.water-count').textContent = mockData.waterCups;
    document.querySelector('.water-goal').textContent = mockData.waterGoal;
    document.querySelector('.last-sleep').textContent = mockData.sleepHours;
    document.querySelector('.activity-done').textContent = mockData.activitiesDone;
    document.querySelector('.activity-goal').textContent = mockData.activitiesGoal;
    
    // Set water progress
    const waterProgress = document.querySelector('.water-progress');
    if (waterProgress) {
        waterProgress.style.setProperty('--water-fill', `${(mockData.waterCups / mockData.waterGoal) * 100}%`);
    }
    
    // Set activity progress
    const activityProgress = document.querySelector('.activity-progress');
    if (activityProgress && activityProgress.querySelector('::after')) {
        activityProgress.querySelector('::after').style.width = `${(mockData.activitiesDone / mockData.activitiesGoal) * 100}%`;
    }
    
    // Initialize charts
    initDashboardCharts();
    
    // Add animations
    animateDashboard();
}

// Create sample charts for the dashboard
function initDashboardCharts() {
    const statChartCtx = document.querySelector('.stat-chart').getContext('2d');
    
    // Sample data for the weekly overview chart
    const weeklyData = {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        datasets: [
            {
                label: 'Mood',
                data: [3, 4, 3, 5, 4, 3, 4],
                borderColor: getComputedStyle(document.documentElement).getPropertyValue('--mood-color'),
                tension: 0.4,
                pointRadius: 4,
                pointBackgroundColor: '#fff',
                pointBorderWidth: 2,
                yAxisID: 'y'
            },
            {
                label: 'Sleep (hrs)',
                data: [7, 6.5, 8, 7.5, 6, 9, 7.5],
                borderColor: getComputedStyle(document.documentElement).getPropertyValue('--sleep-color'),
                tension: 0.4,
                pointRadius: 4,
                pointBackgroundColor: '#fff',
                pointBorderWidth: 2,
                yAxisID: 'y1'
            },
            {
                label: 'Water (cups)',
                data: [6, 5, 7, 3, 6, 8, 4],
                borderColor: getComputedStyle(document.documentElement).getPropertyValue('--water-color'),
                tension: 0.4,
                pointRadius: 4,
                pointBackgroundColor: '#fff',
                pointBorderWidth: 2,
                yAxisID: 'y1'
            }
        ]
    };
    
    new Chart(statChartCtx, {
        type: 'line',
        data: weeklyData,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    min: 1,
                    max: 5,
                    position: 'left',
                    title: {
                        display: true,
                        text: 'Mood Level'
                    }
                },
                y1: {
                    min: 0,
                    max: 10,
                    position: 'right',
                    grid: {
                        drawOnChartArea: false
                    },
                    title: {
                        display: true,
                        text: 'Sleep & Water'
                    }
                },
                x: {
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    }
                }
            },
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        boxWidth: 12,
                        usePointStyle: true,
                        pointStyle: 'circle'
                    }
                },
                tooltip: {
                    mode: 'index',
                    intersect: false
                }
            }
        }
    });
    
    // Create mini-charts for the dashboard cards
    initMiniCharts();
}

// Initialize mini charts for the dashboard cards
function initMiniCharts() {
    // Mini calendar for mood
    const miniCalendar = document.querySelector('.mini-calendar');
    const calendar = document.createElement('div');
    calendar.className = 'mini-calendar-grid';
    
    // Create a small 7-day grid for the mood mini-calendar
    const moodColors = ['#fef2f2', '#fee2e2', '#fecaca', '#fca5a5', '#f87171', '#ef4444', '#dc2626'];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
        const day = new Date(today);
        day.setDate(today.getDate() - i);
        
        const dayEl = document.createElement('div');
        dayEl.className = 'mini-day';
        
        // Random mood level for demonstration
        const randomMood = Math.floor(Math.random() * 5) + 1;
        dayEl.style.backgroundColor = moodColors[randomMood - 1];
        
        dayEl.setAttribute('title', `${day.toLocaleDateString('en-US', { weekday: 'short' })}: Level ${randomMood}`);
        miniCalendar.appendChild(dayEl);
    }
    
    // Mini graph for sleep
    const sleepMiniGraph = document.querySelector('.sleep-mini-graph');
    const sleepCanvas = document.createElement('canvas');
    sleepMiniGraph.appendChild(sleepCanvas);
    
    const sleepMiniCtx = sleepCanvas.getContext('2d');
    
    new Chart(sleepMiniCtx, {
        type: 'bar',
        data: {
            labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            datasets: [{
                data: [7, 6.5, 8, 7.5, 6, 9, 7.5],
                backgroundColor: getComputedStyle(document.documentElement).getPropertyValue('--sleep-color'),
                borderRadius: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `${context.raw} hrs`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    display: false,
                    min: 0,
                    max: 10
                },
                x: {
                    display: false
                }
            }
        }
    });
}

// Load saved data from localStorage
function loadSavedData() {
    // This function will load and apply any saved user data
    // For demonstration, we'll just check if there's any saved data
    
    if (localStorage.getItem('wellnessHubData')) {
        try {
            const data = JSON.parse(localStorage.getItem('wellnessHubData'));
            console.log('Loaded saved data:', data);
            
            // Apply saved data to the UI elements
            // This would be expanded in a real application
            if (data.mood) {
                document.querySelector('.today-mood .emoji').textContent = data.mood.today;
            }
            
            if (data.water) {
                document.querySelector('.water-count').textContent = data.water.current;
                document.querySelector('.water-goal').textContent = data.water.goal;
            }
            
            if (data.sleep) {
                document.querySelector('.last-sleep').textContent = data.sleep.lastNight;
            }
        } catch (error) {
            console.error('Error loading saved data:', error);
        }
    }
}

// Save data to localStorage
function saveData(key, data) {
    let savedData = {};
    
    if (localStorage.getItem('wellnessHubData')) {
        try {
            savedData = JSON.parse(localStorage.getItem('wellnessHubData'));
        } catch (error) {
            console.error('Error parsing saved data:', error);
        }
    }
    
    savedData[key] = data;
    localStorage.setItem('wellnessHubData', JSON.stringify(savedData));
}

// Helper function to format dates
function formatDate(date) {
    return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
}

// Export functions to be used by other modules
window.appHelpers = {
    saveData,
    formatDate
};

// Animate dashboard elements
function animateDashboard() {
    if (window.gsap) {
        // Animate cards with staggered effect
        gsap.fromTo('.overview-cards .card', 
            { y: 30, opacity: 0 },
            { 
                y: 0, 
                opacity: 1, 
                duration: 0.6, 
                stagger: 0.1,
                ease: 'power2.out'
            }
        );
        
        // Animate chart container
        gsap.fromTo('.recent-stats', 
            { y: 30, opacity: 0 },
            { 
                y: 0, 
                opacity: 1, 
                duration: 0.6,
                delay: 0.3,
                ease: 'power2.out'
            }
        );
        
        // Add subtle pulse animation to emoji
        gsap.to('.today-mood .emoji', {
            scale: 1.1,
            duration: 1,
            repeat: -1,
            yoyo: true,
            ease: 'sine.inOut'
        });
        
        // Animate water progress
        const waterProgress = document.querySelector('.water-progress');
        if (waterProgress) {
            gsap.from(waterProgress, {
                '--water-fill': '0%',
                duration: 1.5,
                delay: 0.5,
                ease: 'power2.out'
            });
        }
        
        // Animate activity progress
        const activityProgress = document.querySelector('.activity-progress::after');
        if (activityProgress) {
            gsap.from(activityProgress, {
                width: '0%',
                duration: 1.5,
                delay: 0.5,
                ease: 'power2.out'
            });
        }
    }
}

// Setup global notification system
function setupGlobalNotifications() {
    // Create a global notification function
    window.showNotification = function(message, type = 'default') {
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
                setTimeout(() => notification.remove(), 3000);
            }, 3000);
        }
    };
} 