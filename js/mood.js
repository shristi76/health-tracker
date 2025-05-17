// Mood Tracker JavaScript

document.addEventListener('DOMContentLoaded', function() {
    initMoodTracker();
});

// Initialize mood tracker functionality
function initMoodTracker() {
    const emojiButtons = document.querySelectorAll('.emoji-btn');
    const saveButton = document.querySelector('.save-mood');
    const moodNotes = document.querySelector('.mood-notes textarea');
    const calendarContainer = document.querySelector('.calendar-grid');
    
    // Current date
    const currentDate = new Date();
    let currentMonth = currentDate.getMonth();
    let currentYear = currentDate.getFullYear();
    
    // Generate calendar
    generateCalendar(currentMonth, currentYear);
    
    // Setup emoji button selection
    if (emojiButtons.length) {
        emojiButtons.forEach(button => {
            button.addEventListener('click', function() {
                // Remove active class from all buttons
                emojiButtons.forEach(btn => btn.classList.remove('active'));
                
                // Add active class to clicked button
                this.classList.add('active');
                
                // Add animation with GSAP if available
                if (window.gsap) {
                    gsap.fromTo(this, 
                        { scale: 0.5 },
                        { 
                            scale: 1.2, 
                            duration: 0.3,
                            ease: 'elastic.out(1, 0.3)',
                            onComplete: () => {
                                gsap.to(this, { scale: 1, duration: 0.2 });
                            }
                        }
                    );
                }
            });
        });
    }
    
    // Setup save button
    if (saveButton) {
        saveButton.addEventListener('click', function() {
            const selectedMood = document.querySelector('.emoji-btn.active');
            
            if (!selectedMood) {
                if (typeof window.showNotification === 'function') {
                    window.showNotification('Please select a mood first', 'error');
                } else {
                    alert('Please select a mood first');
                }
                return;
            }
            
            // Get selected mood and notes
            const moodValue = selectedMood.getAttribute('data-mood');
            const moodEmoji = selectedMood.textContent;
            const notes = moodNotes ? moodNotes.value : '';
            
            // Save mood data
            saveMoodData(moodValue, moodEmoji, notes);
            
            // Show success notification
            if (typeof window.showNotification === 'function') {
                window.showNotification('Mood saved successfully!', 'success');
            } else {
                alert('Mood saved successfully!');
            }
            
            // Update calendar
            updateCalendar();
            
            // Update mood chart
            updateMoodChart();
            
            // Reset form
            emojiButtons.forEach(btn => btn.classList.remove('active'));
            if (moodNotes) moodNotes.value = '';
            
            // Add animation with GSAP if available
            if (window.gsap) {
                const todayCell = document.querySelector(`.calendar-day[data-date="${formatDate(new Date())}"]`);
                if (todayCell) {
                    gsap.fromTo(todayCell, 
                        { scale: 0.8, backgroundColor: 'rgba(99, 102, 241, 0.2)' },
                        { 
                            scale: 1, 
                            backgroundColor: 'rgba(99, 102, 241, 0)',
                            duration: 0.5,
                            ease: 'elastic.out(1, 0.3)'
                        }
                    );
                }
            }
        });
    }
    
    // Setup month navigation
    const prevMonthBtn = document.querySelector('.prev-month');
    const nextMonthBtn = document.querySelector('.next-month');
    
    if (prevMonthBtn) {
        prevMonthBtn.addEventListener('click', function() {
            currentMonth--;
            if (currentMonth < 0) {
                currentMonth = 11;
                currentYear--;
            }
            generateCalendar(currentMonth, currentYear);
            
            // Add animation with GSAP if available
            if (window.gsap) {
                animateCalendarTransition('right');
            }
        });
    }
    
    if (nextMonthBtn) {
        nextMonthBtn.addEventListener('click', function() {
            currentMonth++;
            if (currentMonth > 11) {
                currentMonth = 0;
                currentYear++;
            }
            generateCalendar(currentMonth, currentYear);
            
            // Add animation with GSAP if available
            if (window.gsap) {
                animateCalendarTransition('left');
            }
        });
    }
    
    // Initialize mood chart
    initMoodChart();
}

// Generate calendar
function generateCalendar(month, year) {
    const calendarGrid = document.querySelector('.calendar-grid');
    const currentMonthElement = document.querySelector('.current-month');
    
    if (!calendarGrid || !currentMonthElement) return;
    
    // Clear existing calendar
    calendarGrid.innerHTML = '';
    
    // Update month/year display
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    currentMonthElement.textContent = `${monthNames[month]} ${year}`;
    
    // Add day headers
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    dayNames.forEach(day => {
        const dayHeader = document.createElement('div');
        dayHeader.className = 'calendar-day-header';
        dayHeader.textContent = day;
        calendarGrid.appendChild(dayHeader);
    });
    
    // Get first day of the month and total days
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
        const emptyDay = document.createElement('div');
        emptyDay.className = 'calendar-day empty';
        calendarGrid.appendChild(emptyDay);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
        const dayCell = document.createElement('div');
        dayCell.className = 'calendar-day';
        dayCell.textContent = day;
        
        // Format date string for data attribute
        const dateStr = formatDate(new Date(year, month, day));
        dayCell.setAttribute('data-date', dateStr);
        
        // Check if this day has mood data
        const moodData = getMoodData();
        if (moodData && moodData[dateStr]) {
            dayCell.classList.add('has-mood');
            dayCell.setAttribute('data-mood', moodData[dateStr].value);
            
            // Add emoji indicator
            const emojiIndicator = document.createElement('span');
            emojiIndicator.className = 'day-emoji';
            emojiIndicator.textContent = moodData[dateStr].emoji;
            dayCell.appendChild(emojiIndicator);
        }
        
        // Check if this is today
        const today = new Date();
        if (day === today.getDate() && month === today.getMonth() && year === today.getFullYear()) {
            dayCell.classList.add('today');
        }
        
        // Add click event to show mood details
        dayCell.addEventListener('click', function() {
            const date = this.getAttribute('data-date');
            showMoodDetails(date);
        });
        
        calendarGrid.appendChild(dayCell);
    }
    
    // Add empty cells for days after the last day of the month
    const totalCells = dayNames.length * Math.ceil((firstDay + daysInMonth) / dayNames.length);
    const emptyCellsAtEnd = totalCells - (firstDay + daysInMonth);
    
    for (let i = 0; i < emptyCellsAtEnd; i++) {
        const emptyDay = document.createElement('div');
        emptyDay.className = 'calendar-day empty';
        calendarGrid.appendChild(emptyDay);
    }
}

// Format date as YYYY-MM-DD
function formatDate(date) {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// Save mood data to localStorage
function saveMoodData(value, emoji, notes) {
    const today = formatDate(new Date());
    
    // Get existing mood data
    let moodData = getMoodData() || {};
    
    // Add today's mood
    moodData[today] = {
        value: value,
        emoji: emoji,
        notes: notes,
        timestamp: new Date().getTime()
    };
    
    // Save to localStorage
    localStorage.setItem('moodData', JSON.stringify(moodData));
}

// Get mood data from localStorage
function getMoodData() {
    const data = localStorage.getItem('moodData');
    return data ? JSON.parse(data) : null;
}

// Update calendar with mood data
function updateCalendar() {
    const moodData = getMoodData();
    if (!moodData) return;
    
    const calendarDays = document.querySelectorAll('.calendar-day[data-date]');
    
    calendarDays.forEach(day => {
        const date = day.getAttribute('data-date');
        
        if (moodData[date]) {
            day.classList.add('has-mood');
            day.setAttribute('data-mood', moodData[date].value);
            
            // Add or update emoji indicator
            let emojiIndicator = day.querySelector('.day-emoji');
            if (!emojiIndicator) {
                emojiIndicator = document.createElement('span');
                emojiIndicator.className = 'day-emoji';
                day.appendChild(emojiIndicator);
            }
            emojiIndicator.textContent = moodData[date].emoji;
        }
    });
}

// Show mood details for a specific date
function showMoodDetails(date) {
    const moodData = getMoodData();
    if (!moodData || !moodData[date]) return;
    
    const data = moodData[date];
    const formattedDate = new Date(date).toLocaleDateString();
    
    // Create modal or use notification system
    if (typeof window.showNotification === 'function') {
        const message = `
            <div class="mood-details">
                <h4>${formattedDate}</h4>
                <div class="mood-emoji">${data.emoji}</div>
                ${data.notes ? `<p class="mood-notes-display">${data.notes}</p>` : ''}
            </div>
        `;
        
        window.showNotification(message, 'info', 5000);
    } else {
        alert(`Mood on ${formattedDate}: ${data.emoji}\n${data.notes || 'No notes'}`);
    }
}

// Initialize mood chart
function initMoodChart() {
    const chartContainer = document.querySelector('.mood-chart');
    if (!chartContainer) return;
    
    // Get mood data for chart
    const moodData = getMoodData();
    if (!moodData) return;
    
    // Prepare data for chart
    const dates = [];
    const values = [];
    
    // Get last 14 days
    const today = new Date();
    for (let i = 13; i >= 0; i--) {
        const date = new Date();
        date.setDate(today.getDate() - i);
        const dateStr = formatDate(date);
        
        dates.push(date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }));
        
        if (moodData[dateStr]) {
            values.push(parseInt(moodData[dateStr].value));
        } else {
            values.push(null); // No data for this day
        }
    }
    
    // Create chart with Chart.js
    if (window.Chart) {
        // Destroy existing chart if any
        if (window.moodChart) {
            window.moodChart.destroy();
        }
        
        const ctx = document.createElement('canvas');
        chartContainer.innerHTML = '';
        chartContainer.appendChild(ctx);
        
        window.moodChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: dates,
                datasets: [{
                    label: 'Mood',
                    data: values,
                    backgroundColor: 'rgba(139, 92, 246, 0.2)',
                    borderColor: 'rgba(139, 92, 246, 1)',
                    borderWidth: 2,
                    tension: 0.4,
                    fill: true,
                    pointBackgroundColor: 'rgba(139, 92, 246, 1)',
                    pointRadius: 4,
                    pointHoverRadius: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        min: 0,
                        max: 5,
                        ticks: {
                            stepSize: 1,
                            callback: function(value) {
                                const labels = ['', '😢', '😔', '😐', '😊', '😁'];
                                return labels[value] || value;
                            }
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const labels = ['', '😢 Very Sad', '😔 Sad', '😐 Neutral', '😊 Happy', '😁 Very Happy'];
                                const value = context.parsed.y;
                                return labels[value] || '';
                            }
                        }
                    }
                }
            }
        });
        
        // Animate chart with GSAP if available
        if (window.gsap) {
            gsap.from(ctx, {
                y: 30,
                opacity: 0,
                duration: 0.8,
                ease: 'power2.out'
            });
        }
    }
}

// Update mood chart with new data
function updateMoodChart() {
    // Simply reinitialize the chart
    initMoodChart();
}

// Animate calendar transition
function animateCalendarTransition(direction) {
    const calendarGrid = document.querySelector('.calendar-grid');
    const currentMonthElement = document.querySelector('.current-month');
    
    if (!calendarGrid || !currentMonthElement || !window.gsap) return;
    
    // Set initial state
    gsap.set(calendarGrid, { opacity: 0, x: direction === 'left' ? 50 : -50 });
    gsap.set(currentMonthElement, { opacity: 0, y: -20 });
    
    // Animate in
    gsap.to(calendarGrid, { opacity: 1, x: 0, duration: 0.5, ease: 'power2.out' });
    gsap.to(currentMonthElement, { opacity: 1, y: 0, duration: 0.5, ease: 'back.out(1.7)' });
}

// Add CSS styles for mood calendar
document.addEventListener('DOMContentLoaded', function() {
    const style = document.createElement('style');
    style.textContent = `
        .calendar-day {
            position: relative;
            height: 40px;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        .calendar-day.has-mood {
            font-weight: 500;
        }
        
        .calendar-day.today {
            border: 2px solid var(--mood-color);
        }
        
        .day-emoji {
            position: absolute;
            bottom: 2px;
            right: 2px;
            font-size: 10px;
        }
        
        .calendar-day[data-mood="5"] {
            background-color: rgba(16, 185, 129, 0.1);
        }
        
        .calendar-day[data-mood="4"] {
            background-color: rgba(59, 130, 246, 0.1);
        }
        
        .calendar-day[data-mood="3"] {
            background-color: rgba(245, 158, 11, 0.1);
        }
        
        .calendar-day[data-mood="2"] {
            background-color: rgba(249, 115, 22, 0.1);
        }
        
        .calendar-day[data-mood="1"] {
            background-color: rgba(239, 68, 68, 0.1);
        }
        
        .mood-details {
            text-align: center;
            padding: 0.5rem;
        }
        
        .mood-emoji {
            font-size: 2rem;
            margin: 0.5rem 0;
        }
        
        .mood-notes-display {
            font-style: italic;
            color: var(--text-light);
            margin-top: 0.5rem;
        }
    `;
    document.head.appendChild(style);
});
