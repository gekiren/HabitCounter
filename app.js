// State
let items = [];
let logs = [];

// DOM Elements
const gridContainer = document.getElementById('grid-container');
const addBtn = document.getElementById('add-btn');
const addModal = document.getElementById('add-modal');
const confirmAddBtn = document.getElementById('confirm-add');
const cancelAddBtn = document.getElementById('cancel-add');
const newItemInput = document.getElementById('new-item-name');
const colorBtns = document.querySelectorAll('.color-btn');

const statsBtn = document.getElementById('stats-btn');
const statsModal = document.getElementById('stats-modal');
const closeStatsBtn = document.getElementById('close-stats');
const statsList = document.getElementById('stats-list');
const currentDateEl = document.getElementById('current-date');

// Selected Color State
let selectedColor = 'linear-gradient(135deg, #FF6B6B, #EE5253)'; // default

// Initialization
document.addEventListener('DOMContentLoaded', () => {
    loadData();
    render();
    setupEventListeners();
});

function loadData() {
    const savedItems = localStorage.getItem('habit-items');
    const savedLogs = localStorage.getItem('habit-logs');

    if (savedItems) items = JSON.parse(savedItems);
    if (savedLogs) logs = JSON.parse(savedLogs);
}

function saveData() {
    localStorage.setItem('habit-items', JSON.stringify(items));
    localStorage.setItem('habit-logs', JSON.stringify(logs));
}

function setupEventListeners() {
    // Modals
    addBtn.addEventListener('click', () => {
        newItemInput.value = '';
        addModal.classList.remove('hidden');
        newItemInput.focus();
    });

    cancelAddBtn.addEventListener('click', () => {
        addModal.classList.add('hidden');
    });

    // Color Picker
    colorBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            colorBtns.forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
            selectedColor = btn.style.getPropertyValue('--bg');
        });
    });
    // Set first color as default selected
    if (colorBtns.length > 0) colorBtns[0].click();

    // Add Item Confirm
    confirmAddBtn.addEventListener('click', addItem);

    // Stats
    statsBtn.addEventListener('click', showStats);
    closeStatsBtn.addEventListener('click', () => {
        statsModal.classList.add('hidden');
    });

    // Close modals on outside click
    window.addEventListener('click', (e) => {
        if (e.target === addModal) addModal.classList.add('hidden');
        if (e.target === statsModal) statsModal.classList.add('hidden');
    });
}

function addItem() {
    const name = newItemInput.value.trim();
    if (!name) return;

    const newItem = {
        id: Date.now().toString(),
        name: name,
        color: selectedColor,
        createdAt: Date.now()
    };

    items.push(newItem);
    saveData();
    render();
    addModal.classList.add('hidden');
}

function track(id, event) {
    logs.push({
        itemId: id,
        timestamp: Date.now()
    });
    saveData();

    // Trigger Ripple
    if (event) {
        createRipple(event);
    }

    render(); // Update counts
}

function createRipple(event) {
    const card = event.currentTarget;
    const ripple = document.createElement('span');
    const rect = card.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;

    ripple.style.width = ripple.style.height = `${size}px`;
    ripple.style.left = `${x}px`;
    ripple.style.top = `${y}px`;
    ripple.classList.add('ripple');

    card.appendChild(ripple);

    setTimeout(() => {
        ripple.remove();
    }, 600);
}

function getTodayCount(itemId) {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

    return logs.filter(log =>
        log.itemId === itemId && log.timestamp >= startOfDay
    ).length;
}

function render() {
    // Clear grid but keep add button
    // Actually, easier to clear all and rebuild
    gridContainer.innerHTML = '';

    items.forEach(item => {
        const card = document.createElement('div');
        card.className = 'habit-card';
        card.style.background = item.color;

        const count = getTodayCount(item.id);

        card.innerHTML = `
            <div class="habit-name">${item.name}</div>
            <div class="habit-count">${count}</div>
        `;

        card.addEventListener('click', (e) => track(item.id, e));

        gridContainer.appendChild(card);
    });

    // Append Add Button at the end
    gridContainer.appendChild(addBtn);
}

function showStats() {
    const now = new Date();
    currentDateEl.textContent = `${now.getFullYear()}年${now.getMonth() + 1}月${now.getDate()}日`;

    statsList.innerHTML = '';

    if (items.length === 0) {
        statsList.innerHTML = '<li class="stats-item" style="justify-content:center; opacity:0.5;">項目がありません</li>';
        statsModal.classList.remove('hidden');
        return;
    }

    items.forEach(item => {
        const count = getTodayCount(item.id);
        const li = document.createElement('li');
        li.className = 'stats-item';
        li.innerHTML = `
            <span>${item.name}</span>
            <span class="stats-count">${count}回</span>
        `;
        statsList.appendChild(li);
    });

    statsModal.classList.remove('hidden');
}
