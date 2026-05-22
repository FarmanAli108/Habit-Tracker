let habits = [];
let habitCompletions = {};
let currentWeekOffset = 0;

const gridContainer = document.getElementById('gridContainer');
const weekRange = document.getElementById('weekRange');
const totalHabitsEl = document.getElementById('totalHabits');
const bestStreakEl = document.getElementById('bestStreak');
const completionRateEl = document.getElementById('completionRate');
const addHabitBtn = document.getElementById('addHabitBtn');
const prevWeekBtn = document.getElementById('prevWeekBtn');
const nextWeekBtn = document.getElementById('nextWeekBtn');
const thisWeekBtn = document.getElementById('thisWeekBtn');
const habitModal = document.getElementById('habitModal');
const modalTitle = document.getElementById('modalTitle');
const habitNameInput = document.getElementById('habitNameInput');
const saveHabitBtn = document.getElementById('saveHabitBtn');
const cancelModalBtn = document.getElementById('cancelModalBtn');
const closeModalBtn = document.getElementById('closeModalBtn');
const toast = document.getElementById('toast');
const currentDateSpan = document.getElementById('currentDate');
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const sidebar = document.getElementById('sidebar');

let editingHabitId = null;

// Set today's date
if (currentDateSpan) {
    const today = new Date();
    currentDateSpan.textContent = today.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// Mobile menu
if (mobileMenuBtn) {
    mobileMenuBtn.addEventListener('click', () => {
        sidebar.classList.toggle('open');
    });
    
    document.addEventListener('click', (e) => {
        if (sidebar && sidebar.classList.contains('open') && 
            !sidebar.contains(e.target) && 
            e.target !== mobileMenuBtn) {
            sidebar.classList.remove('open');
        }
    });
}

function init() {
    loadData();
    render();
    setupEventListeners();
}

function loadData() {
    const storedHabits = localStorage.getItem('habits');
    const storedCompletions = localStorage.getItem('habitCompletions');
    
    habits = storedHabits ? JSON.parse(storedHabits) : [];
    habitCompletions = storedCompletions ? JSON.parse(storedCompletions) : {};
}

function saveData() {
    localStorage.setItem('habits', JSON.stringify(habits));
    localStorage.setItem('habitCompletions', JSON.stringify(habitCompletions));
}

function getWeekDates(offset = 0) {
    const now = new Date();
    const currentDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + (offset * 7));
    const dayOfWeek = currentDate.getDay();
    const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const monday = new Date(currentDate);
    monday.setDate(currentDate.getDate() + diffToMonday);
    
    const weekDates = [];
    for (let i = 0; i < 7; i++) {
        const date = new Date(monday);
        date.setDate(monday.getDate() + i);
        weekDates.push(date);
    }
    return weekDates;
}

function isToday(date) {
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
}

function formatDateKey(date) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function getStreakForHabit(habitId, targetDate = null) {
    const checkDate = targetDate ? new Date(targetDate) : new Date();
    checkDate.setHours(0, 0, 0, 0);
    
    let streak = 0;
    const tempDate = new Date(checkDate);
    
    for (let i = 0; i < 365; i++) {
        const dateKey = formatDateKey(tempDate);
        const completions = habitCompletions[habitId] || {};
        
        if (completions[dateKey]) {
            streak++;
            tempDate.setDate(tempDate.getDate() - 1);
        } else {
            break;
        }
    }
    return streak;
}

function getBestStreak(habitId) {
    let bestStreak = 0;
    let currentStreak = 0;
    const completions = habitCompletions[habitId] || {};
    const dates = Object.keys(completions).sort();
    
    for (let i = 0; i < dates.length; i++) {
        if (i > 0) {
            const prev = new Date(dates[i-1]);
            const curr = new Date(dates[i]);
            const diffDays = (curr - prev) / (1000 * 60 * 60 * 24);
            
            if (diffDays === 1) {
                currentStreak++;
            } else {
                currentStreak = 1;
            }
        } else {
            currentStreak = 1;
        }
        bestStreak = Math.max(bestStreak, currentStreak);
    }
    return bestStreak;
}

function getOverallBestStreak() {
    let best = 0;
    habits.forEach(habit => {
        best = Math.max(best, getBestStreak(habit.id));
    });
    return best;
}

function toggleHabit(habitId, date) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);
    
    if (targetDate < today) {
        showToast("Past days can't be changed", 'error');
        return;
    }
    
    if (targetDate > today) {
        showToast("Can't check future days", 'error');
        return;
    }
    
    const dateKey = formatDateKey(targetDate);
    
    if (!habitCompletions[habitId]) {
        habitCompletions[habitId] = {};
    }
    
    if (habitCompletions[habitId][dateKey]) {
        delete habitCompletions[habitId][dateKey];
        showToast('Unchecked', 'info');
    } else {
        habitCompletions[habitId][dateKey] = true;
        const streak = getStreakForHabit(habitId);
        showToast(streak > 1 ? `🔥 ${streak} day streak!` : 'Great job! ✓', 'success');
    }
    
    saveData();
    render();
}

function addHabit(name) {
    if (!name.trim()) {
        showToast('Please enter a habit name', 'error');
        return false;
    }
    
    habits.push({
        id: Date.now().toString(),
        name: name.trim(),
        createdAt: Date.now()
    });
    
    saveData();
    showToast(`Added: ${name}`, 'success');
    return true;
}

function updateHabit(id, newName) {
    if (!newName.trim()) {
        showToast('Please enter a habit name', 'error');
        return false;
    }
    
    const habit = habits.find(h => h.id === id);
    if (habit) {
        habit.name = newName.trim();
        saveData();
        showToast(`Updated: ${newName}`, 'success');
        return true;
    }
    return false;
}

function deleteHabit(id) {
    if (confirm('Delete this habit? Progress will be lost.')) {
        habits = habits.filter(h => h.id !== id);
        delete habitCompletions[id];
        saveData();
        render();
        showToast('Habit deleted', 'info');
    }
}

function updateStats() {
    totalHabitsEl.textContent = habits.length;
    bestStreakEl.textContent = getOverallBestStreak();
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayKey = formatDateKey(today);
    let completedToday = 0;
    
    habits.forEach(habit => {
        if (habitCompletions[habit.id] && habitCompletions[habit.id][todayKey]) {
            completedToday++;
        }
    });
    
    const rate = habits.length > 0 ? Math.round((completedToday / habits.length) * 100) : 0;
    completionRateEl.textContent = `${rate}%`;
}

function render() {
    if (habits.length === 0) {
        gridContainer.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">📋</div>
                <h3>Your first habit starts here</h3>
                <p>Add a habit you want to track daily.</p>
                <button class="btn-primary" id="emptyStateAddBtn">+ Add Your First Habit</button>
            </div>
        `;
        const emptyBtn = document.getElementById('emptyStateAddBtn');
        if (emptyBtn) emptyBtn.addEventListener('click', () => openModal('add'));
        updateStats();
        return;
    }
    
    const weekDates = getWeekDates(currentWeekOffset);
    const weekStart = weekDates[0];
    const weekEnd = weekDates[6];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    weekRange.textContent = `${weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
    nextWeekBtn.disabled = currentWeekOffset >= 0;
nextWeekBtn.style.opacity = currentWeekOffset >= 0 ? '0.35' : '1';
    let html = '<div class="habit-grid">';
    
    // Header
    html += '<div class="grid-header" style="grid-template-columns: 200px repeat(7, 1fr);">';
    html += '<div class="day-header">Habits</div>';
    
    const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    weekDates.forEach(date => {
        const isTodayCol = isToday(date);
        html += `<div class="day-header ${isTodayCol ? 'today-column' : ''}">
                    <div class="day-name">${dayNames[date.getDay() === 0 ? 6 : date.getDay() - 1]}</div>
                    <div class="day-date">${date.getDate()}</div>
                </div>`;
    });
    html += '</div>';
    
    // Rows
    habits.forEach(habit => {
        const currentStreak = getStreakForHabit(habit.id);
        html += `<div class="habit-row" style="grid-template-columns: 200px repeat(7, 1fr);">`;
        
        html += `<div class="habit-name-cell">
                    <span class="habit-name">${escapeHtml(habit.name)}</span>
                    <div class="habit-actions">
                        <button class="edit-habit" data-id="${habit.id}">✏️</button>
                        <button class="delete-habit" data-id="${habit.id}">🗑️</button>
                    </div>
                    ${currentStreak > 0 ? `<span class="streak-badge">🔥 ${currentStreak}</span>` : ''}
                </div>`;
        
        weekDates.forEach(date => {
            const dateKey = formatDateKey(date);
            const isChecked = habitCompletions[habit.id] && habitCompletions[habit.id][dateKey];
            const isTodayCol = isToday(date);
            const isPastDate = date < today;
            const isFutureDate = date > today;
            
            if (isPastDate) {
                // Show missed if not checked
                const isMissed = !isChecked && date < today;
                html += `<div class="day-cell ${isTodayCol ? 'today-column' : ''}">
                            <div class="checkbox ${isChecked ? 'checked' : (isMissed ? 'missed' : 'locked')}">
                                ${isChecked ? '' : (isMissed ? '' : '🔒')}
                            </div>
                        </div>`;
            } else if (isFutureDate) {
                html += `<div class="day-cell ${isTodayCol ? 'today-column' : ''}">
                            <div class="checkbox future">⏳</div>
                        </div>`;
            } else {
                html += `<div class="day-cell ${isTodayCol ? 'today-column' : ''}">
                            <div class="checkbox ${isChecked ? 'checked' : ''}" 
                                 data-habit-id="${habit.id}" 
                                 data-date="${date.toISOString()}"></div>
                        </div>`;
            }
        });
        
        html += '</div>';
    });
    
    html += '</div>';
    gridContainer.innerHTML = html;
    
    // Attach events
    document.querySelectorAll('.checkbox:not(.locked):not(.future):not(.missed)').forEach(cell => {
        if (cell.dataset && cell.dataset.habitId) {
            cell.addEventListener('click', (e) => {
                e.stopPropagation();
                toggleHabit(cell.dataset.habitId, cell.dataset.date);
            });
        }
    });
    
    document.querySelectorAll('.edit-habit').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const habit = habits.find(h => h.id === btn.dataset.id);
            if (habit) openModal('edit', habit);
        });
    });
    
    document.querySelectorAll('.delete-habit').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            deleteHabit(btn.dataset.id);
        });
    });
    
    updateStats();
}

function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

function openModal(mode, habit = null) {
    if (mode === 'add') {
        modalTitle.textContent = 'New Habit';
        habitNameInput.value = '';
        editingHabitId = null;
    } else if (mode === 'edit' && habit) {
        modalTitle.textContent = 'Edit Habit';
        habitNameInput.value = habit.name;
        editingHabitId = habit.id;
    }
    habitModal.classList.add('active');
    habitNameInput.focus();
}

function closeModal() {
    habitModal.classList.remove('active');
    habitNameInput.value = '';
    editingHabitId = null;
}

function saveHabitFromModal() {
    const name = habitNameInput.value;
    
    if (editingHabitId) {
        if (updateHabit(editingHabitId, name)) {
            closeModal();
            render();
        }
    } else {
        if (addHabit(name)) {
            closeModal();
            render();
        }
    }
}

function showToast(message) {
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2000);
}

function previousWeek() { currentWeekOffset--; render(); }
function nextWeek() {
    if (currentWeekOffset >= 0) return;
    currentWeekOffset++;
    render();
}
function thisWeek() { currentWeekOffset = 0; render(); showToast('Back to this week'); }

function setupEventListeners() {
    addHabitBtn.addEventListener('click', () => openModal('add'));
    prevWeekBtn.addEventListener('click', previousWeek);
    nextWeekBtn.addEventListener('click', nextWeek);
    thisWeekBtn.addEventListener('click', thisWeek);
    saveHabitBtn.addEventListener('click', saveHabitFromModal);
    cancelModalBtn.addEventListener('click', closeModal);
    closeModalBtn.addEventListener('click', closeModal);
    habitModal.addEventListener('click', (e) => { if (e.target === habitModal) closeModal(); });
    habitNameInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') saveHabitFromModal(); });
}

init();