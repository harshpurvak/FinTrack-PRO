const appState = {
    transactions: [],
    currentCurrency: 'USD',
    darkMode: false,
    editingTransactionId: null,
};

// Chart instance ,stores the chart object
let cashFlowChart = null;

// Transaction categories for dropdown menus
const categories = {
    income: ['Salary', 'Freelance', 'Investment', 'Bonus', 'Gift', 'Other'],
    expense: ['Food', 'Transport', 'Entertainment', 'Utilities', 'Shopping', 'Healthcare', 'Education', 'Other']
};

// DOM ELEMENTS
const dashboard = document.getElementById('dashboard');
const settings = document.getElementById('settings');
const navItems = document.querySelectorAll('.nav-item');
const transactionModal = document.getElementById('transaction-modal');
const transactionForm = document.getElementById('transaction-form');
const darkModeToggle = document.getElementById('dark-mode-toggle');
const darkModeToggleRight = document.getElementById('dark-mode-toggle-right');
const resetDataBtn = document.getElementById('reset-data-btn');
const resetDataBtnRight = document.getElementById('reset-data-btn-right');
const addTransactionBtn = document.getElementById('add-transaction-btn');
const modalClose = document.querySelector('.modal-close');
const modalCancel = document.getElementById('modal-cancel');
const transactionType = document.getElementById('trans-type');
const transactionCategory = document.getElementById('trans-category');
const searchInput = document.getElementById('search-input');
const filterSelect = document.getElementById('filter-select');
const transactionDate = document.getElementById('trans-date');
const currencySelect = document.getElementById('currency-select');

// INITIALIZATION
function init() {
    console.log('FinTrack Pro initialized');
    
    loadData();
    setupEventListeners();
    updateDashboard();
}
//event listners
function setupEventListeners() {
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const page = e.currentTarget.dataset.page;
            navigateTo(page);
        });
    });

    darkModeToggle.addEventListener('click', handleDarkModeToggle);
    darkModeToggleRight.addEventListener('click', handleDarkModeToggle);

    resetDataBtn.addEventListener('click', resetAllData);
    resetDataBtnRight.addEventListener('click', resetAllData);

    addTransactionBtn.addEventListener('click', () => openTransactionModal());

    modalClose.addEventListener('click', closeTransactionModal);
    modalCancel.addEventListener('click', closeTransactionModal);
    transactionModal.addEventListener('click', (e) => {
        if (e.target === transactionModal) {
            closeTransactionModal();
        }
    });

    // Form Submit
    transactionForm.addEventListener('submit', handleTransactionSubmit);

    // Transaction Type Change
    transactionType.addEventListener('change', populateCategoryOptions);

    // Search and Filter
    searchInput.addEventListener('input', filterTransactions);
    filterSelect.addEventListener('change', filterTransactions);

    const submitButton = transactionForm.querySelector('button[type="submit"]');
    if (submitButton) {
        submitButton.addEventListener('click', (e) => {
            e.preventDefault();
            if (!transactionForm.checkValidity()) {
                transactionForm.reportValidity();
                return;
            }
            transactionForm.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
        });
    }

    if (currencySelect) {
        currencySelect.addEventListener('change', handleCurrencyChange);
    }
}
// Navigation
function navigateTo(page) {
    // Update active nav item
    navItems.forEach(item => item.classList.remove('active'));
    document.querySelector(`[data-page="${page}"]`).classList.add('active');

    if (page === 'dashboard') {
        dashboard.style.display = 'block';
        settings.style.display = 'none';
    } else if (page === 'settings') {
        dashboard.style.display = 'none';
        settings.style.display = 'block';
    }
}

// Dark Mode
function handleDarkModeToggle(event) {
    const button = event.currentTarget;
    const isEnabled = button.getAttribute('aria-pressed') === 'true';
    const nextValue = !isEnabled;

    appState.darkMode = nextValue;
    document.body.classList.toggle('dark-mode', nextValue);

    darkModeToggle.setAttribute('aria-pressed', String(nextValue));
    darkModeToggleRight.setAttribute('aria-pressed', String(nextValue));
    darkModeToggle.textContent = nextValue ? 'On' : 'Off';
    darkModeToggleRight.textContent = nextValue ? 'On' : 'Off';

    saveData();
}

function handleCurrencyChange(event) {
    appState.currentCurrency = event.target.value;
    saveData();
    updateDashboard();
}

// Transaction Modal
function openTransactionModal(transactionId = null) {
    appState.editingTransactionId = transactionId;
    
    const modalTitle = document.getElementById('modal-title');
    const dateInput = document.getElementById('trans-date');
    
    if (transactionId) {
     // Edit mode
        modalTitle.textContent = 'Edit Transaction';
        const transaction = appState.transactions.find(t => t.id === transactionId);
        
        if (transaction) {
            document.getElementById('trans-date').value = transaction.date;
            document.getElementById('trans-type').value = transaction.type;
            populateCategoryOptions();
            document.getElementById('trans-category').value = transaction.category;
            document.getElementById('trans-description').value = transaction.description;
            document.getElementById('trans-amount').value = transaction.amount;
        }
    } else {
// Add mode
        modalTitle.textContent = 'Add Transaction';
        transactionForm.reset();
        dateInput.value = getTodayString();
        setTimeout(() => {
            dateInput.value = getTodayString();
        }, 0);
        document.getElementById('trans-type').value = '';
        transactionCategory.innerHTML = '<option value="">Select Category</option>';
    }
    
    transactionModal.classList.add('show');
}

function closeTransactionModal() {
    transactionModal.classList.remove('show');
    appState.editingTransactionId = null;
    transactionForm.reset();
}


// Form Handling
function populateCategoryOptions() {
    const type = transactionType.value;
    
    if (!type) {
        transactionCategory.innerHTML = '<option value="">Select Category</option>';
        return;
    }

    const options = categories[type] || [];
    transactionCategory.innerHTML = '<option value="">Select Category</option>';
    
    options.forEach(cat => {
        const option = document.createElement('option');
        option.value = cat;
        option.textContent = cat;
        transactionCategory.appendChild(option);
    });
}


// Crud ops
function handleTransactionSubmit(e) {
    e.preventDefault();
    
    const date = document.getElementById('trans-date').value;
    const type = document.getElementById('trans-type').value;
    const category = document.getElementById('trans-category').value;
    const description = document.getElementById('trans-description').value;
    const amount = document.getElementById('trans-amount').value;
    
    // Validation
    if (!date || !type || !category || !description || !amount) {
        alert('Please fill all fields!');
        return;
    }

    const parsedAmount = parseFloat(amount);
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
        alert('Please enter a valid amount greater than 0.');
        return;
    }
    
    console.log('Adding transaction:', { date, type, category, description, amount: parsedAmount });
    
    const transaction = {
        id: appState.editingTransactionId || Date.now(),
        date: date,
        type: type,
        category: category,
        description: description,
        amount: parsedAmount
    };

    if (appState.editingTransactionId) {
        // Update existing
        const index = appState.transactions.findIndex(t => t.id === appState.editingTransactionId);
        if (index !== -1) {
            appState.transactions[index] = transaction;
            console.log('Transaction updated');
        }
    } else {
        // Add new
        appState.transactions.push(transaction);
        console.log('Transaction added', transaction);
    }

    saveData();
    updateDashboard();
    closeTransactionModal();
}
// delete
function deleteTransaction(transactionId) {
    if (confirm('Are you sure you want to delete this transaction?')) {
        appState.transactions = appState.transactions.filter(t => t.id !== transactionId);
        saveData();
        updateDashboard();
    }
}

function filterTransactions() {
    const searchTerm = searchInput.value.toLowerCase();
    const filterType = filterSelect.value;
    const rows = document.querySelectorAll('.transactions-table tbody tr');

    rows.forEach(row => {
        const description = row.cells[1]?.textContent.toLowerCase() || '';
        const type = row.dataset.type || '';
        
        const matchesSearch = description.includes(searchTerm);
        const matchesFilter = !filterType || type === filterType;

        row.style.display = matchesSearch && matchesFilter ? '' : 'none';
    });
}
// Refresh all UI
// This function runs after every transaction change
// It calculates totals and updates all the cards, table, and chart
function updateDashboard() {
    const totalIncome = appState.transactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);

    const totalExpense = appState.transactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);

    const currentBalance = totalIncome - totalExpense;

    document.getElementById('current-balance').textContent = formatCurrency(currentBalance);
    document.getElementById('total-income').textContent = formatCurrency(totalIncome);
    document.getElementById('total-expense').textContent = formatCurrency(totalExpense);
    document.getElementById('total-transactions').textContent = appState.transactions.length;

    updateTransactionsTable();

    updateCashFlowChart(totalIncome, totalExpense);
}

function updateTransactionsTable() {
    const tbody = document.getElementById('transactions-body');
    const emptyState = document.getElementById('empty-state');

    if (appState.transactions.length === 0) {
        tbody.innerHTML = '';
        emptyState.style.display = 'block';
        return;
    }

    emptyState.style.display = 'none';
    
    const sorted = [...appState.transactions].sort((a, b) => new Date(b.date) - new Date(a.date));

    tbody.innerHTML = sorted.map(transaction => `
        <tr data-type="${transaction.type}">
            <td>${formatDate(transaction.date)}</td>
            <td>${transaction.description}</td>
            <td><span class="trans-category">${transaction.category}</span></td>
            <td class="trans-amount ${transaction.type}">${transaction.type === 'income' ? '+' : '-'}${formatCurrency(transaction.amount)}</td>
            <td class="trans-actions">
                <button class="btn-small btn-edit" onclick="openTransactionModal(${transaction.id})">Edit</button>
                <button class="btn-small btn-delete" onclick="deleteTransaction(${transaction.id})">Delete</button>
            </td>
        </tr>
    `).join('');
}
// Chart.js library to create a bar chart
// Updates whenever transactions change
function updateCashFlowChart(income, expense) {
    const chartCanvas = document.getElementById('cashFlowChart');
    
    if (!chartCanvas) {
        return;
    }
    const existingFallback = document.getElementById('chart-fallback');
    if (existingFallback) {
        existingFallback.remove();
    }

    if (cashFlowChart) {
        cashFlowChart.destroy();
        cashFlowChart = null;
    }

    if (typeof window.Chart === 'undefined') {
        const fallback = document.createElement('div');
        fallback.id = 'chart-fallback';
        fallback.className = 'chart-fallback';
        fallback.textContent = 'Chart will appear here when Chart.js is available.';
        chartCanvas.parentElement.appendChild(fallback);
        chartCanvas.style.display = 'none';
        return;
    }
    
    chartCanvas.style.display = 'block';
    
    cashFlowChart = new window.Chart(chartCanvas, {
        type: 'bar',
        data: {
            labels: ['Income', 'Expenses'],
            datasets: [
                {
                    label: 'Amount',
                    data: [income, expense],
                    backgroundColor: [
                        '#22c55e', 
                        '#f87171'  
                    ],
                    borderColor: [
                        '#16a34a',
                        '#dc2626'
                    ],
                    borderWidth: 2,
                    borderRadius: 4
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: false
                },
                title: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: Math.max(income, expense) * 1.2,
                    ticks: {
                        callback: function(value) {
                            return formatCurrency(value);
                        },
                        font: {
                            size: 11
                        }
                    },
                    grid: {
                        color: '#d0d0d0',
                        drawBorder: true
                    }
                },
                x: {
                    ticks: {
                        font: {
                            size: 12
                        }
                    },
                    grid: {
                        display: false
                    }
                }
            }
        }
    });
}
// localStorage
function saveData() {
    localStorage.setItem('fintrackData', JSON.stringify({
        transactions: appState.transactions,
        currentCurrency: appState.currentCurrency,
        darkMode: appState.darkMode
    }));
}
function loadData() {
    const saved = localStorage.getItem('fintrackData');
    if (saved) {
        const data = JSON.parse(saved);
        appState.transactions = data.transactions || [];
        appState.currentCurrency = data.currentCurrency || 'USD';
        appState.darkMode = Boolean(data.darkMode);
    }
    if (currencySelect) {
        currencySelect.value = appState.currentCurrency;
    }
    document.body.classList.toggle('dark-mode', appState.darkMode);
    if (darkModeToggle) {
        darkModeToggle.checked = appState.darkMode;
    }
    if (darkModeToggleRight) {
        darkModeToggleRight.checked = appState.darkMode;
    }
}

function resetAllData() {
    if (confirm('Are you sure you want to reset all data? This cannot be undone.')) {
        appState.transactions = [];
        saveData();
        updateDashboard();
    }
}
// UTILITY FUNCTIONS
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: appState.currentCurrency
    }).format(amount);
}

function formatDate(dateString) {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
}

// Set today date as default in the date input field
function getTodayString() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function setDefaultDate() {
    if (transactionDate) {
        transactionDate.value = getTodayString();
    }
}

document.addEventListener('DOMContentLoaded', init);
