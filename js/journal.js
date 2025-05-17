// Mental Health Journal JavaScript

document.addEventListener('DOMContentLoaded', function() {
    initJournal();
});

// Initialize journal functionality
function initJournal() {
    // Elements
    const entryList = document.querySelector('.entry-list');
    const newEntryBtn = document.querySelector('.new-entry-btn');
    const journalEditor = document.querySelector('.journal-editor');
    const entryDateInput = document.querySelector('.entry-date-input');
    const entryTitleInput = document.querySelector('.entry-title');
    const journalContent = document.querySelector('.journal-content');
    const tagInput = document.querySelector('.tag-input');
    const selectedTags = document.querySelector('.selected-tags');
    const moodButtons = document.querySelectorAll('.mini-emoji-btn');
    const saveEntryBtn = document.querySelector('.save-entry');
    const editorTools = document.querySelectorAll('.tool-btn');
    const entrySearch = document.querySelector('.entry-search');
    const tagFilters = document.querySelectorAll('.tag');
    const journalChart = document.querySelector('.journal-chart');
    
    // State variables
    let entries = loadEntries();
    let currentEntryId = null;
    let selectedMood = null;
    let currentTags = [];
    let activeTagFilters = [];
    
    // Initialize UI
    updateEntryList();
    initChart();
    setDefaultDate();
    
    // New entry button
    newEntryBtn.addEventListener('click', function() {
        resetEditor();
        revealEditor();
    });
    
    // Editor tools
    editorTools.forEach(tool => {
        tool.addEventListener('click', function() {
            const toolType = this.getAttribute('data-tool');
            applyFormatting(toolType);
        });
    });
    
    // Mood selection
    moodButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const mood = this.getAttribute('data-mood');
            selectedMood = mood;
            
            // Remove active class from all buttons
            moodButtons.forEach(b => b.classList.remove('active'));
            
            // Add active class to selected button
            this.classList.add('active');
            
            // Animation
            gsap.fromTo(this, 
                { scale: 0.8 }, 
                { scale: 1.2, duration: 0.3, repeat: 1, yoyo: true }
            );
        });
    });
    
    // Tag input
    tagInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && this.value.trim()) {
            e.preventDefault();
            addTag(this.value.trim().toLowerCase());
            this.value = '';
        }
    });
    
    // Search functionality
    entrySearch.addEventListener('input', function() {
        const searchTerm = this.value.trim().toLowerCase();
        filterEntries();
    });
    
    // Tag filters
    tagFilters.forEach(tag => {
        tag.addEventListener('click', function() {
            const tagName = this.getAttribute('data-tag');
            
            // Toggle active state
            this.classList.toggle('active');
            
            // Update active filters
            if (this.classList.contains('active')) {
                if (!activeTagFilters.includes(tagName)) {
                    activeTagFilters.push(tagName);
                }
            } else {
                activeTagFilters = activeTagFilters.filter(tag => tag !== tagName);
            }
            
            // Filter entries
            filterEntries();
        });
    });
    
    // Save entry
    saveEntryBtn.addEventListener('click', function() {
        saveEntry();
    });
    
    // Apply text formatting
    function applyFormatting(type) {
        const textarea = journalContent;
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const selectedText = textarea.value.substring(start, end);
        let replacement = '';
        
        // Apply formatting based on type
        switch (type) {
            case 'bold':
                replacement = `**${selectedText}**`;
                break;
            case 'italic':
                replacement = `*${selectedText}*`;
                break;
            case 'underline':
                replacement = `_${selectedText}_`;
                break;
            case 'list':
                // Split selected text into lines and add bullets
                replacement = selectedText
                    .split('\n')
                    .map(line => line.trim() ? `• ${line}` : line)
                    .join('\n');
                break;
        }
        
        // Replace selected text with formatted text
        if (replacement) {
            textarea.value = 
                textarea.value.substring(0, start) + 
                replacement + 
                textarea.value.substring(end);
                
            // Reset selection to after the inserted text
            textarea.selectionStart = start + replacement.length;
            textarea.selectionEnd = start + replacement.length;
            
            // Animate the button
            const button = document.querySelector(`.tool-btn[data-tool="${type}"]`);
            gsap.fromTo(button, 
                { backgroundColor: 'var(--primary-color)' }, 
                { 
                    backgroundColor: 'var(--accent-color)', 
                    duration: 0.3,
                    yoyo: true,
                    repeat: 1
                }
            );
        }
        
        // Return focus to textarea
        textarea.focus();
    }
    
    // Add a tag
    function addTag(tagName) {
        // Check if tag already exists
        if (currentTags.includes(tagName)) {
            return;
        }
        
        // Add to current tags
        currentTags.push(tagName);
        
        // Create tag element
        const tagEl = document.createElement('span');
        tagEl.className = 'selected-tag';
        tagEl.innerHTML = `${tagName} <span class="remove-tag">×</span>`;
        
        // Add remove functionality
        tagEl.querySelector('.remove-tag').addEventListener('click', function() {
            removeTag(tagName);
            tagEl.remove();
        });
        
        // Add to selected tags
        selectedTags.appendChild(tagEl);
        
        // Animation
        gsap.fromTo(tagEl, 
            { scale: 0.8, opacity: 0 }, 
            { scale: 1, opacity: 1, duration: 0.3 }
        );
    }
    
    // Remove a tag
    function removeTag(tagName) {
        currentTags = currentTags.filter(tag => tag !== tagName);
    }
    
    // Save entry
    function saveEntry() {
        // Get values
        const date = entryDateInput.value;
        const title = entryTitleInput.value.trim();
        const content = journalContent.value.trim();
        
        // Validate
        if (!date || !title || !content) {
            showNotification('Please fill in all fields', 'error');
            return;
        }
        
        if (!selectedMood) {
            showNotification('Please select your mood', 'warning');
            return;
        }
        
        // Create entry object
        const entry = {
            id: currentEntryId || Date.now(),
            date: date,
            title: title,
            content: content,
            mood: selectedMood,
            tags: [...currentTags],
            createdAt: currentEntryId ? entries.find(e => e.id === currentEntryId).createdAt : new Date().toISOString()
        };
        
        // Save to entries array
        if (currentEntryId) {
            // Update existing entry
            entries = entries.map(e => e.id === currentEntryId ? entry : e);
        } else {
            // Add new entry
            entries.unshift(entry);
        }
        
        // Save to localStorage
        saveEntries(entries);
        
        // Update UI
        updateEntryList();
        updateChart();
        
        // Reset editor and hide
        resetEditor();
        hideEditor();
        
        // Show success notification
        showNotification('Journal entry saved successfully', 'success');
    }
    
    // Update the entry list
    function updateEntryList() {
        // Clear list
        entryList.innerHTML = '';
        
        // Get filtered entries
        const filteredEntries = getFilteredEntries();
        
        if (filteredEntries.length === 0) {
            entryList.innerHTML = '<div class="empty-state">No journal entries found</div>';
            return;
        }
        
        // Add each entry to list
        filteredEntries.forEach((entry, index) => {
            const entryItem = document.createElement('div');
            entryItem.className = 'entry-item';
            entryItem.setAttribute('data-id', entry.id);
            
            // Format the date
            const entryDate = new Date(entry.date);
            const formattedDate = entryDate.toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric'
            });
            
            // Create preview (first 60 chars)
            const preview = entry.content.replace(/\*\*|_|\*/g, '').substring(0, 60) + (entry.content.length > 60 ? '...' : '');
            
            // Create HTML
            entryItem.innerHTML = `
                <div class="entry-date">${formattedDate}</div>
                <div class="entry-title-preview">${entry.title}</div>
                <div class="entry-preview">${preview}</div>
                <div class="entry-tags">
                    ${entry.tags.map(tag => `<span class="tag-pill">${tag}</span>`).join('')}
                </div>
                <div class="entry-mood">${getMoodEmoji(entry.mood)}</div>
            `;
            
            // Add click event to open entry
            entryItem.addEventListener('click', function() {
                openEntry(entry.id);
            });
            
            // Add to list with animation delay based on index
            entryList.appendChild(entryItem);
            
            // Animation
            gsap.fromTo(entryItem, 
                { opacity: 0, y: 20 }, 
                { 
                    opacity: 1, 
                    y: 0, 
                    duration: 0.3, 
                    delay: index * 0.05,
                    ease: 'power2.out' 
                }
            );
        });
    }
    
    // Filter entries based on search and tags
    function filterEntries() {
        updateEntryList();
    }
    
    // Get filtered entries
    function getFilteredEntries() {
        const searchTerm = entrySearch.value.trim().toLowerCase();
        
        return entries.filter(entry => {
            // Filter by search term
            const matchesSearch = 
                !searchTerm || 
                entry.title.toLowerCase().includes(searchTerm) || 
                entry.content.toLowerCase().includes(searchTerm);
            
            // Filter by tags
            const matchesTags = 
                activeTagFilters.length === 0 || 
                activeTagFilters.some(tag => entry.tags.includes(tag));
            
            return matchesSearch && matchesTags;
        });
    }
    
    // Open an entry for editing
    function openEntry(id) {
        const entry = entries.find(e => e.id === id);
        if (!entry) return;
        
        // Set current entry ID
        currentEntryId = id;
        
        // Fill editor fields
        entryDateInput.value = entry.date;
        entryTitleInput.value = entry.title;
        journalContent.value = entry.content;
        
        // Set mood
        selectedMood = entry.mood;
        moodButtons.forEach(btn => {
            if (btn.getAttribute('data-mood') === entry.mood) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
        
        // Clear and add tags
        selectedTags.innerHTML = '';
        currentTags = [];
        entry.tags.forEach(tag => addTag(tag));
        
        // Show editor
        revealEditor();
    }
    
    // Reset editor
    function resetEditor() {
        currentEntryId = null;
        entryDateInput.value = formatDate(new Date());
        entryTitleInput.value = '';
        journalContent.value = '';
        selectedMood = null;
        moodButtons.forEach(btn => btn.classList.remove('active'));
        selectedTags.innerHTML = '';
        currentTags = [];
    }
    
    // Show editor with animation
    function revealEditor() {
        // Check if already visible
        if (journalEditor.classList.contains('active')) return;
        
        // Add active class
        journalEditor.classList.add('active');
        
        // Animate
        gsap.fromTo(journalEditor, 
            { opacity: 0, x: 100 }, 
            { opacity: 1, x: 0, duration: 0.5, ease: 'power2.out' }
        );
        
        // Focus on title
        setTimeout(() => {
            entryTitleInput.focus();
        }, 300);
    }
    
    // Hide editor with animation
    function hideEditor() {
        gsap.to(journalEditor, {
            opacity: 0,
            x: 100,
            duration: 0.5,
            ease: 'power2.in',
            onComplete: () => {
                journalEditor.classList.remove('active');
            }
        });
    }
    
    // Set default date
    function setDefaultDate() {
        if (!entryDateInput.value) {
            entryDateInput.value = formatDate(new Date());
        }
    }
    
    // Format date to YYYY-MM-DD
    function formatDate(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }
    
    // Get mood emoji
    function getMoodEmoji(mood) {
        const emojis = {
            '5': '😁',
            '4': '😊',
            '3': '😐',
            '2': '😔',
            '1': '😢'
        };
        return emojis[mood] || '😐';
    }
    
    // Initialize the mood chart
    function initChart() {
        if (!journalChart) return;
        
        const ctx = journalChart.getContext('2d');
        
        // Get the last 10 entries
        const recentEntries = [...entries].slice(0, 10).reverse();
        
        // Extract dates and moods
        const dates = recentEntries.map(entry => {
            const date = new Date(entry.date);
            return `${date.getMonth() + 1}/${date.getDate()}`;
        });
        
        const moods = recentEntries.map(entry => parseInt(entry.mood));
        
        // Create chart
        window.journalMoodChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: dates,
                datasets: [{
                    label: 'Mood',
                    data: moods,
                    backgroundColor: 'rgba(155, 89, 182, 0.2)',
                    borderColor: 'rgba(155, 89, 182, 1)',
                    borderWidth: 3,
                    pointBackgroundColor: 'rgba(155, 89, 182, 1)',
                    pointRadius: 5,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: false,
                        min: 1,
                        max: 5,
                        ticks: {
                            stepSize: 1,
                            callback: function(value) {
                                return getMoodEmoji(value.toString());
                            }
                        },
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
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const mood = context.raw;
                                const moodLabels = {
                                    5: 'Very Happy',
                                    4: 'Happy',
                                    3: 'Neutral',
                                    2: 'Sad',
                                    1: 'Very Sad'
                                };
                                return `Mood: ${moodLabels[mood]} ${getMoodEmoji(mood.toString())}`;
                            }
                        }
                    }
                }
            }
        });
    }
    
    // Update chart with new data
    function updateChart() {
        if (!window.journalMoodChart) return;
        
        // Get the last 10 entries
        const recentEntries = [...entries].slice(0, 10).reverse();
        
        // Extract dates and moods
        const dates = recentEntries.map(entry => {
            const date = new Date(entry.date);
            return `${date.getMonth() + 1}/${date.getDate()}`;
        });
        
        const moods = recentEntries.map(entry => parseInt(entry.mood));
        
        // Update chart data
        window.journalMoodChart.data.labels = dates;
        window.journalMoodChart.data.datasets[0].data = moods;
        window.journalMoodChart.update();
    }
    
    // Load entries from localStorage
    function loadEntries() {
        return JSON.parse(localStorage.getItem('journalEntries')) || [];
    }
    
    // Save entries to localStorage
    function saveEntries(entries) {
        localStorage.setItem('journalEntries', JSON.stringify(entries));
    }
}

// Add journal styles
document.addEventListener('DOMContentLoaded', function() {
    const style = document.createElement('style');
    style.textContent = `
        .journal-editor {
            transform: translateX(100px);
            opacity: 0;
            display: none;
            transition: all 0.5s ease;
        }
        
        .journal-editor.active {
            display: block;
        }
        
        .tag {
            padding: 5px 10px;
            border-radius: 15px;
            margin: 3px;
            cursor: pointer;
            background-color: #eee;
            display: inline-block;
            transition: all 0.3s ease;
        }
        
        .tag.active {
            background-color: var(--primary-color);
            color: white;
        }
        
        .entry-item {
            cursor: pointer;
            transition: all 0.3s ease;
        }
        
        .entry-item:hover {
            transform: translateY(-3px);
            box-shadow: 0 5px 15px rgba(0,0,0,0.1);
        }
        
        .selected-tag {
            display: inline-block;
            padding: 3px 8px;
            margin: 3px;
            border-radius: 15px;
            background-color: var(--primary-color);
            color: white;
        }
        
        .remove-tag {
            margin-left: 5px;
            cursor: pointer;
        }
        
        .mini-emoji-btn {
            transition: all 0.3s ease;
        }
        
        .mini-emoji-btn.active {
            transform: scale(1.2);
            box-shadow: 0 0 10px rgba(0,0,0,0.2);
        }
    `;
    document.head.appendChild(style);
}); 