// Global Notification System for WellnessHub

// Create notification container when the DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    createNotificationContainer();
    setupReminders();
});

// Create the notification container
function createNotificationContainer() {
    // Check if container already exists
    if (document.querySelector('.notification-container')) return;
    
    // Create container
    const container = document.createElement('div');
    container.className = 'notification-container';
    document.body.appendChild(container);
    
    // Add styles
    const style = document.createElement('style');
    style.textContent = `
        .notification-container {
            position: fixed;
            top: 20px;
            right: 20px;
            display: flex;
            flex-direction: column;
            gap: 10px;
            z-index: 9999;
            pointer-events: none;
            max-width: 100%;
            width: 350px;
        }
        
        .notification {
            padding: 15px 20px;
            border-radius: 8px;
            margin-bottom: 10px;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
            transform: translateX(120%);
            opacity: 0;
            position: relative;
            color: white;
            pointer-events: auto;
            display: flex;
            align-items: center;
            overflow: hidden;
        }
        
        .notification::before {
            content: '';
            position: absolute;
            bottom: 0;
            left: 0;
            height: 3px;
            width: 100%;
            background-color: rgba(255, 255, 255, 0.3);
        }
        
        .notification::after {
            content: '';
            position: absolute;
            bottom: 0;
            left: 0;
            height: 3px;
            width: 100%;
            background-color: rgba(255, 255, 255, 0.7);
            transform: scaleX(0);
            transform-origin: left;
            transition: transform linear;
        }
        
        .notification.countdown::after {
            transform: scaleX(1);
            transition-duration: 5s;
        }
        
        .notification-icon {
            margin-right: 15px;
            font-size: 1.4em;
        }
        
        .notification-content {
            flex: 1;
        }
        
        .notification-close {
            background: none;
            border: none;
            color: white;
            opacity: 0.7;
            cursor: pointer;
            font-size: 1em;
            transition: opacity 0.2s;
            margin-left: 10px;
        }
        
        .notification-close:hover {
            opacity: 1;
        }
        
        .notification.success {
            background-color: #2ecc71;
            background-image: linear-gradient(45deg, #2ecc71, #27ae60);
        }
        
        .notification.error {
            background-color: #e74c3c;
            background-image: linear-gradient(45deg, #e74c3c, #c0392b);
        }
        
        .notification.info {
            background-color: #3498db;
            background-image: linear-gradient(45deg, #3498db, #2980b9);
        }
        
        .notification.warning {
            background-color: #f39c12;
            background-image: linear-gradient(45deg, #f39c12, #e67e22);
        }
        
        @media (max-width: 480px) {
            .notification-container {
                width: 100%;
                padding: 0 10px;
                right: 0;
            }
        }
        
        /* Reminder notification styles */
        .notification.reminder {
            background-color: #9b59b6;
            background-image: linear-gradient(45deg, #9b59b6, #8e44ad);
        }
    `;
    document.head.appendChild(style);
}

// Show a notification
function showNotification(message, type = 'info', duration = 5000) {
    // Ensure container exists
    createNotificationContainer();
    
    // Define icons for each notification type
    const icons = {
        success: '✅',
        error: '❌',
        info: 'ℹ️',
        warning: '⚠️',
        reminder: '🔔'
    };
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    
    // Add icon
    const iconSpan = document.createElement('span');
    iconSpan.className = 'notification-icon';
    iconSpan.textContent = icons[type] || icons.info;
    
    // Add content
    const content = document.createElement('div');
    content.className = 'notification-content';
    content.textContent = message;
    
    // Add close button
    const closeButton = document.createElement('button');
    closeButton.className = 'notification-close';
    closeButton.innerHTML = '&times;';
    closeButton.addEventListener('click', () => {
        dismissNotification(notification);
    });
    
    // Assemble notification
    notification.appendChild(iconSpan);
    notification.appendChild(content);
    notification.appendChild(closeButton);
    
    // Add to container
    const container = document.querySelector('.notification-container');
    container.appendChild(notification);
    
    // Play sound based on type
    playNotificationSound(type);
    
    // Animate in with GSAP
    gsap.fromTo(notification, 
        { x: 120, opacity: 0 }, 
        { 
            x: 0, 
            opacity: 1, 
            duration: 0.5, 
            ease: 'power3.out',
            onComplete: () => {
                // Add countdown animation
                notification.classList.add('countdown');
            }
        }
    );
    
    // Auto dismiss after duration
    if (duration > 0) {
        setTimeout(() => {
            dismissNotification(notification);
        }, duration);
    }
    
    return notification;
}

// Dismiss a notification
function dismissNotification(notification) {
    // Remove countdown class
    notification.classList.remove('countdown');
    
    // Animate out with GSAP
    gsap.to(notification, {
        x: 120, 
        opacity: 0, 
        duration: 0.5, 
        ease: 'power3.in',
        onComplete: () => {
            notification.remove();
        }
    });
}

// Play notification sound
function playNotificationSound(type) {
    // Sound URLs for different notification types
    const sounds = {
        success: 'https://assets.mixkit.co/sfx/preview/mixkit-software-interface-start-2574.mp3',
        error: 'https://assets.mixkit.co/sfx/preview/mixkit-alert-quick-chime-766.mp3',
        info: 'https://assets.mixkit.co/sfx/preview/mixkit-software-interface-remove-2576.mp3',
        warning: 'https://assets.mixkit.co/sfx/preview/mixkit-vintage-telephone-ringtone-1356.mp3',
        reminder: 'https://assets.mixkit.co/sfx/preview/mixkit-positive-notification-951.mp3'
    };
    
    try {
        const audio = new Audio(sounds[type] || sounds.info);
        audio.volume = 0.3; // Lower volume
        audio.play();
    } catch (error) {
        console.log('Sound could not be played', error);
    }
}

// Setup wellness reminders
function setupReminders() {
    // Check if user has enabled reminders
    const remindersEnabled = localStorage.getItem('remindersEnabled');
    
    if (remindersEnabled !== 'true') {
        // Don't setup reminders if they're not enabled
        return;
    }
    
    // Schedule reminders
    scheduleReminder('water', 'Time to drink water! 💧 Stay hydrated for optimal health.', 60); // Every 60 minutes
    scheduleReminder('stretch', 'Time for a quick stretch! 🧘 Your body will thank you.', 120); // Every 2 hours
    scheduleReminder('breathe', 'Take a moment to breathe deeply. 🌬️ Reduce stress with a quick breathing exercise.', 180); // Every 3 hours
}

// Schedule a repeating reminder
function scheduleReminder(type, message, minutes) {
    // Initial delay - random time within the first interval
    const initialDelay = Math.floor(Math.random() * minutes * 60 * 1000);
    
    // Set initial timeout
    setTimeout(() => {
        // Show the reminder
        showNotification(message, 'reminder', 10000);
        
        // Then set interval for future reminders
        setInterval(() => {
            showNotification(message, 'reminder', 10000);
        }, minutes * 60 * 1000);
    }, initialDelay);
}

// Enable or disable reminders
function toggleReminders(enabled) {
    localStorage.setItem('remindersEnabled', enabled);
    
    if (enabled) {
        setupReminders();
        showNotification('Wellness reminders have been enabled!', 'success');
    } else {
        showNotification('Wellness reminders have been disabled.', 'info');
    }
}

// Export functions for other scripts to use
window.showNotification = showNotification;
window.dismissNotification = dismissNotification;
window.toggleReminders = toggleReminders;

// Test notifications on load (can be removed in production)
document.addEventListener('DOMContentLoaded', function() {
    // Uncomment to test notifications
    /*
    setTimeout(() => {
        window.showNotification('Welcome to Wellness Tracker!', 'info');
    }, 1000);
    
    setTimeout(() => {
        window.showNotification('Your data has been saved successfully!', 'success');
    }, 2000);
    
    setTimeout(() => {
        window.showNotification('Please check your input values.', 'warning');
    }, 3000);
    
    setTimeout(() => {
        window.showNotification('Failed to connect to server.', 'error');
    }, 4000);
    */
}); 