// Settings and Preferences JavaScript

document.addEventListener('DOMContentLoaded', function() {
    initSettings();
});

// Initialize settings functionality
function initSettings() {
    // Elements
    const settingsModal = document.getElementById('settings-modal');
    const profileMenuSettings = document.querySelector('.profile-settings');
    const closeSettings = document.querySelector('.close-settings');
    const saveSettingsBtn = document.querySelector('.save-settings-btn');
    
    // Settings form elements
    const nameInput = document.getElementById('settings-name');
    const emailInput = document.getElementById('settings-email');
    const weightInput = document.getElementById('settings-weight');
    const heightInput = document.getElementById('settings-height');
    const calorieGoalInput = document.getElementById('settings-calorie-goal');
    const remindersToggle = document.getElementById('settings-reminders');
    const soundsToggle = document.getElementById('settings-sounds');
    const themeOptions = document.querySelectorAll('.theme-option');
    
    // Load and apply saved settings
    loadSettings();
    applyTheme(localStorage.getItem('theme') || 'default');
    
    // Open settings modal
    if (profileMenuSettings) {
        profileMenuSettings.addEventListener('click', function() {
            openSettingsModal();
        });
    }
    
    // Close settings modal
    closeSettings.addEventListener('click', function() {
        closeSettingsModal();
    });
    
    // Close modal when clicking outside
    window.addEventListener('click', function(e) {
        if (e.target === settingsModal) {
            closeSettingsModal();
        }
    });
    
    // Theme selection
    themeOptions.forEach(option => {
        option.addEventListener('click', function() {
            // Remove active class from all options
            themeOptions.forEach(opt => opt.classList.remove('active'));
            
            // Add active class to selected option
            this.classList.add('active');
            
            // Get theme name
            const theme = this.getAttribute('data-theme');
            
            // Apply theme
            applyTheme(theme);
        });
    });
    
    // Enable/disable reminders
    remindersToggle.addEventListener('change', function() {
        if (typeof toggleReminders === 'function') {
            toggleReminders(this.checked);
        }
    });
    
    // Enable/disable sounds
    soundsToggle.addEventListener('change', function() {
        localStorage.setItem('soundsEnabled', this.checked);
    });
    
    // Save settings
    saveSettingsBtn.addEventListener('click', function() {
        saveSettings();
        
        // Show save animation
        this.classList.add('saving');
        this.textContent = 'Saved!';
        
        setTimeout(() => {
            this.classList.remove('saving');
            this.textContent = 'Save Changes';
            closeSettingsModal();
        }, 1500);
        
        // Show notification
        showNotification('Settings saved successfully!', 'success');
    });
    
    // Open settings modal
    function openSettingsModal() {
        // Fill form with current values
        loadSettings();
        
        // Show modal
        settingsModal.style.display = 'flex';
        
        // Animation
        gsap.fromTo(settingsModal, 
            { opacity: 0 }, 
            { opacity: 1, duration: 0.3 }
        );
        
        const content = settingsModal.querySelector('.settings-content');
        gsap.fromTo(content, 
            { scale: 0.9, opacity: 0 }, 
            { scale: 1, opacity: 1, duration: 0.3, delay: 0.1 }
        );
    }
    
    // Close settings modal
    function closeSettingsModal() {
        const content = settingsModal.querySelector('.settings-content');
        
        // Animation
        gsap.to(content, {
            scale: 0.9,
            opacity: 0,
            duration: 0.3,
            onComplete: () => {
                gsap.to(settingsModal, {
                    opacity: 0,
                    duration: 0.2,
                    onComplete: () => {
                        settingsModal.style.display = 'none';
                    }
                });
            }
        });
    }
    
    // Load settings from localStorage
    function loadSettings() {
        try {
            // Load user data
            const userData = JSON.parse(localStorage.getItem('wellnessHubUser')) || {};
            nameInput.value = userData.name || '';
            emailInput.value = userData.email || '';
            
            // Load health data
            weightInput.value = localStorage.getItem('userWeight') || '';
            heightInput.value = localStorage.getItem('userHeight') || '';
            calorieGoalInput.value = localStorage.getItem('calorieGoal') || '2000';
            
            // Load preference toggles
            remindersToggle.checked = localStorage.getItem('remindersEnabled') === 'true';
            soundsToggle.checked = localStorage.getItem('soundsEnabled') !== 'false'; // Default to true
            
            // Set active theme
            const currentTheme = localStorage.getItem('theme') || 'default';
            themeOptions.forEach(option => {
                if (option.getAttribute('data-theme') === currentTheme) {
                    option.classList.add('active');
                } else {
                    option.classList.remove('active');
                }
            });
        } catch (error) {
            console.error('Error loading settings:', error);
        }
    }
    
    // Save settings to localStorage
    function saveSettings() {
        try {
            // Save user data
            const userData = JSON.parse(localStorage.getItem('wellnessHubUser')) || {};
            userData.name = nameInput.value;
            localStorage.setItem('wellnessHubUser', JSON.stringify(userData));
            
            // Save health data
            localStorage.setItem('userWeight', weightInput.value);
            localStorage.setItem('userHeight', heightInput.value);
            localStorage.setItem('calorieGoal', calorieGoalInput.value || '2000');
            
            // Save preference toggles
            localStorage.setItem('remindersEnabled', remindersToggle.checked);
            localStorage.setItem('soundsEnabled', soundsToggle.checked);
            
            // Save theme
            const activeTheme = document.querySelector('.theme-option.active');
            if (activeTheme) {
                const theme = activeTheme.getAttribute('data-theme');
                localStorage.setItem('theme', theme);
            }
            
            // Update profile display name if available
            const profileInfo = document.querySelector('.profile-info h3');
            if (profileInfo && nameInput.value) {
                profileInfo.textContent = nameInput.value;
            }
        } catch (error) {
            console.error('Error saving settings:', error);
            showNotification('Error saving settings', 'error');
        }
    }
    
    // Apply theme
    function applyTheme(theme) {
        // Remove any existing theme classes
        document.body.classList.remove('theme-default', 'theme-dark', 'theme-calm', 'theme-energetic');
        
        // Add selected theme class
        document.body.classList.add(`theme-${theme}`);
        
        // Update custom properties based on theme
        const root = document.documentElement;
        
        switch (theme) {
            case 'dark':
                root.style.setProperty('--bg-color', '#222');
                root.style.setProperty('--text-color', '#fff');
                root.style.setProperty('--primary-color', '#9b59b6');
                root.style.setProperty('--accent-color', '#e67e22');
                root.style.setProperty('--card-bg', '#333');
                root.style.setProperty('--sidebar-bg', '#1a1a1a');
                break;
            case 'calm':
                root.style.setProperty('--bg-color', '#f0f5f9');
                root.style.setProperty('--text-color', '#3a4750');
                root.style.setProperty('--primary-color', '#3498db');
                root.style.setProperty('--accent-color', '#2ecc71');
                root.style.setProperty('--card-bg', '#fff');
                root.style.setProperty('--sidebar-bg', '#e8f4f8');
                break;
            case 'energetic':
                root.style.setProperty('--bg-color', '#fff');
                root.style.setProperty('--text-color', '#333');
                root.style.setProperty('--primary-color', '#e74c3c');
                root.style.setProperty('--accent-color', '#f39c12');
                root.style.setProperty('--card-bg', '#fff');
                root.style.setProperty('--sidebar-bg', '#f9f9f9');
                break;
            default: // Default theme
                root.style.setProperty('--bg-color', '#f8f9fa');
                root.style.setProperty('--text-color', '#333');
                root.style.setProperty('--primary-color', '#6c5ce7');
                root.style.setProperty('--accent-color', '#00b894');
                root.style.setProperty('--card-bg', '#fff');
                root.style.setProperty('--sidebar-bg', '#f1f2f6');
                break;
        }
    }
}

// Add settings styles
document.addEventListener('DOMContentLoaded', function() {
    const style = document.createElement('style');
    style.textContent = `
        .settings-modal {
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.5);
            z-index: 1000;
            justify-content: center;
            align-items: center;
        }
        
        .settings-content {
            background-color: var(--card-bg, #fff);
            border-radius: 10px;
            width: 90%;
            max-width: 500px;
            max-height: 90vh;
            overflow-y: auto;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
        }
        
        .settings-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 15px 20px;
            border-bottom: 1px solid #eee;
        }
        
        .settings-header h2 {
            margin: 0;
            font-size: 1.5rem;
            color: var(--text-color, #333);
        }
        
        .close-settings {
            border: none;
            background: none;
            font-size: 1.5rem;
            cursor: pointer;
            color: #999;
            transition: color 0.3s;
        }
        
        .close-settings:hover {
            color: var(--primary-color, #6c5ce7);
        }
        
        .settings-body {
            padding: 20px;
        }
        
        .settings-section {
            margin-bottom: 25px;
        }
        
        .settings-section h3 {
            margin-top: 0;
            margin-bottom: 15px;
            font-size: 1.2rem;
            color: var(--text-color, #333);
        }
        
        .form-group {
            margin-bottom: 15px;
        }
        
        .form-group label {
            display: block;
            margin-bottom: 5px;
            font-size: 0.9rem;
            color: var(--text-color, #333);
            opacity: 0.8;
        }
        
        .form-group input {
            width: 100%;
            padding: 10px;
            border: 1px solid #ddd;
            border-radius: 5px;
            font-size: 1rem;
            background-color: var(--bg-color, #f8f9fa);
            color: var(--text-color, #333);
        }
        
        .toggle-group {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 15px;
        }
        
        .toggle {
            position: relative;
            display: inline-block;
            width: 50px;
            height: 24px;
        }
        
        .toggle input {
            opacity: 0;
            width: 0;
            height: 0;
        }
        
        .toggle-slider {
            position: absolute;
            cursor: pointer;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-color: #ccc;
            transition: 0.4s;
            border-radius: 24px;
        }
        
        .toggle-slider:before {
            position: absolute;
            content: "";
            height: 16px;
            width: 16px;
            left: 4px;
            bottom: 4px;
            background-color: white;
            transition: 0.4s;
            border-radius: 50%;
        }
        
        input:checked + .toggle-slider {
            background-color: var(--primary-color, #6c5ce7);
        }
        
        input:checked + .toggle-slider:before {
            transform: translateX(26px);
        }
        
        .theme-options {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
            gap: 15px;
        }
        
        .theme-option {
            display: flex;
            flex-direction: column;
            align-items: center;
            cursor: pointer;
            transition: transform 0.3s;
        }
        
        .theme-option:hover {
            transform: translateY(-5px);
        }
        
        .theme-option.active .theme-preview {
            border: 3px solid var(--primary-color, #6c5ce7);
            box-shadow: 0 0 10px rgba(108, 92, 231, 0.5);
        }
        
        .theme-preview {
            width: 50px;
            height: 50px;
            border-radius: 50%;
            margin-bottom: 8px;
            border: 3px solid transparent;
        }
        
        .default-theme {
            background: linear-gradient(135deg, #6c5ce7, #00b894);
        }
        
        .dark-theme {
            background: linear-gradient(135deg, #9b59b6, #2c3e50);
        }
        
        .calm-theme {
            background: linear-gradient(135deg, #3498db, #2ecc71);
        }
        
        .energetic-theme {
            background: linear-gradient(135deg, #e74c3c, #f39c12);
        }
        
        .theme-option span {
            font-size: 0.8rem;
            color: var(--text-color, #333);
        }
        
        .settings-footer {
            padding: 15px 20px;
            text-align: right;
            border-top: 1px solid #eee;
        }
        
        .save-settings-btn {
            background-color: var(--primary-color, #6c5ce7);
            color: white;
            border: none;
            border-radius: 5px;
            padding: 10px 20px;
            cursor: pointer;
            font-size: 1rem;
            transition: background-color 0.3s, transform 0.2s;
        }
        
        .save-settings-btn:hover {
            background-color: var(--accent-color, #00b894);
        }
        
        .save-settings-btn:active {
            transform: scale(0.98);
        }
        
        .save-settings-btn.saving {
            background-color: var(--accent-color, #00b894);
        }
        
        /* Theme CSS Variables */
        body.theme-default {
            --bg-color: #f8f9fa;
            --text-color: #333;
            --primary-color: #6c5ce7;
            --accent-color: #00b894;
            --card-bg: #fff;
            --sidebar-bg: #f1f2f6;
        }
        
        body.theme-dark {
            --bg-color: #222;
            --text-color: #fff;
            --primary-color: #9b59b6;
            --accent-color: #e67e22;
            --card-bg: #333;
            --sidebar-bg: #1a1a1a;
        }
        
        body.theme-calm {
            --bg-color: #f0f5f9;
            --text-color: #3a4750;
            --primary-color: #3498db;
            --accent-color: #2ecc71;
            --card-bg: #fff;
            --sidebar-bg: #e8f4f8;
        }
        
        body.theme-energetic {
            --bg-color: #fff;
            --text-color: #333;
            --primary-color: #e74c3c;
            --accent-color: #f39c12;
            --card-bg: #fff;
            --sidebar-bg: #f9f9f9;
        }
    `;
    document.head.appendChild(style);
}); 