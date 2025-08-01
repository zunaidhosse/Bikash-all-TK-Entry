import {
    state,
    initializeState,
    addTransaction,
    deleteTransaction,
    addRecipient,
    saveCurrentTransactions,
    loadTransactionsFromHistory,
    deleteHistoryEntry,
    clearAllData,
    clearCurrentTransactions
} from './state.js';

import {
    ui,
    renderAll,
    renderRecipients,
    renderTransactions,
    renderHistory,
    toggleMenu,
    hideMenu,
    showRecipientModal,
    hideRecipientModal,
    showHistoryModal,
    hideHistoryModal
} from './ui.js';

import { generateInvoice } from './invoice.js';
import { initializeFirebase } from './firebase.js';


// --- PWA Installation Logic ---
let deferredPrompt;

window.addEventListener('beforeinstallprompt', (e) => {
    // Prevent Chrome 67 and earlier from automatically showing the prompt
    e.preventDefault();
    // Stash the event so it can be triggered later.
    deferredPrompt = e;
    // Update UI to notify the user they can add to home screen
    ui.installButton.classList.remove('hidden');
});

function handleInstallClick() {
    if (deferredPrompt) {
        // Show the prompt
        deferredPrompt.prompt();
        // Wait for the user to respond to the prompt
        deferredPrompt.userChoice.then((choiceResult) => {
            if (choiceResult.outcome === 'accepted') {
                console.log('User accepted the A2HS prompt');
                ui.installButton.classList.add('hidden'); // Hide button after install
            } else {
                console.log('User dismissed the A2HS prompt');
            }
            deferredPrompt = null;
        });
    }
}


// --- Main Application Logic ---

function handleAddTransaction(e) {
    e.preventDefault();
    const name = ui.recipientNameInput.value;
    const amount = ui.amountInput.value;

    if (name && amount) {
        addTransaction(name, amount);
        renderTransactions();
        ui.paymentForm.reset();
        ui.recipientNameInput.focus();
    } else {
        alert('Please select a name and enter an amount.');
    }
}

function handleTransactionListClick(e) {
    // Handle transaction deletion
    const deleteBtn = e.target.closest('.delete-tx-btn');
    if (deleteBtn) {
        const timestamp = deleteBtn.dataset.timestamp;
        if (confirm('Are you sure you want to delete this transaction?')) {
            deleteTransaction(timestamp);
            renderTransactions();
        }
        return;
    }

    // Handle invoice download
    const downloadBtn = e.target.closest('.download-invoice-btn');
    if (downloadBtn) {
        const groupDiv = downloadBtn.closest('.grouped-item');
        const name = groupDiv.dataset.name;
        
        const rateInput = groupDiv.querySelector('.sar-rate-input');
        const oldBalanceInput = groupDiv.querySelector('.old-balance-input');
        const sarJomaInput = groupDiv.querySelector('.sar-joma-input');
        
        const rate = rateInput.value ? parseFloat(rateInput.value) : null;
        const oldBalance = oldBalanceInput.value ? parseFloat(oldBalanceInput.value) : 0;
        const sarJoma = sarJomaInput.value ? parseFloat(sarJomaInput.value) : 0;
        
        const transactionsForRecipient = state.transactions.filter(tx => tx.name === name);
        const total = transactionsForRecipient.reduce((sum, tx) => sum + tx.amount, 0);
        const data = {
            entries: transactionsForRecipient,
            total
        };
        
        generateInvoice(name, data, rate, sarJoma, oldBalance);
    }
}

function formatSarRateInput(e) {
    // Only apply special formatting to the SAR Rate input.
    // Old Balance and Joma should behave like normal number inputs.
    const input = e.target;
    if (!input.classList.contains('sar-rate-input') || input.classList.contains('old-balance-input') || input.classList.contains('sar-joma-input')) {
        return;
    }

    let value = input.value;

    // Remove all non-digit characters
    const digits = value.replace(/\D/g, '');

    if (digits === '') {
        input.value = '';
        return;
    }
    
    let formattedValue;
    if (digits.length > 2) {
        formattedValue = digits.slice(0, 2) + '.' + digits.slice(2);
    } else {
        formattedValue = digits;
    }
    
    if (input.value !== formattedValue) {
        input.value = formattedValue;
    }
}

function handleAddRecipient(e) {
    e.preventDefault();
    const newName = ui.newRecipientNameInput.value.trim();
    if (addRecipient(newName)) {
        renderRecipients();
        ui.addRecipientForm.reset();
        hideRecipientModal();
    } else {
        if (state.recipients.includes(newName)) {
            alert('This name already exists.');
        } else {
            alert('Please enter a valid name.');
        }
    }
}

async function handleSave() {
    const savedDate = await saveCurrentTransactions();
    if (savedDate) {
        alert(`Transactions for ${savedDate} have been saved successfully.`);
        clearCurrentTransactions();
        renderTransactions(); // Re-render to show cleared state
    }
}

function handleClearAll() {
    hideMenu();
    if (confirm('Are you sure you want to clear ALL data? This will delete all transactions and custom recipients. This action cannot be undone.')) {
        clearAllData();
        renderAll();
    }
}

async function handleHistoryListClick(e) {
    const target = e.target;
    const itemDiv = target.closest('.history-item');
    if (!itemDiv) return;

    const dateKey = itemDiv.dataset.date;

    if (target.classList.contains('load-history-btn')) {
        if (confirm(`This will replace your current unsaved transactions. Are you sure you want to load the data for ${dateKey}?`)) {
            if (loadTransactionsFromHistory(dateKey)) {
                renderTransactions();
                hideHistoryModal();
            }
        }
    }

    if (target.classList.contains('delete-history-btn')) {
        if (confirm(`Are you sure you want to permanently delete the history for ${dateKey}? This will remove it from all devices.`)) {
            await deleteHistoryEntry(dateKey);
            renderHistory(); // Re-render the list in the modal
        }
    }
}

// --- Event Listeners Setup ---
async function initialize() {
    // Initialize Firebase first
    initializeFirebase();

    // Load state from storage (now includes async Firebase fetch)
    await initializeState();

    // Initial render
    renderAll();
    
    // Form submissions
    ui.paymentForm.addEventListener('submit', handleAddTransaction);
    ui.addRecipientForm.addEventListener('submit', handleAddRecipient);

    // Main UI clicks
    ui.transactionsList.addEventListener('click', handleTransactionListClick);
    ui.transactionsList.addEventListener('input', formatSarRateInput);
    ui.saveButton.addEventListener('click', handleSave);
    ui.installButton.addEventListener('click', handleInstallClick);
    ui.menuButton.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleMenu();
    });
    document.addEventListener('click', hideMenu);


    // Menu dropdown actions
    ui.addRecipientBtn.addEventListener('click', () => {
        hideMenu();
        showRecipientModal();
        ui.newRecipientNameInput.focus();
    });
    ui.historyBtn.addEventListener('click', () => {
        hideMenu();
        renderHistory();
        showHistoryModal();
    });
    ui.clearAllBtn.addEventListener('click', handleClearAll);

    // Modal close actions
    ui.closeRecipientModalBtn.addEventListener('click', hideRecipientModal);
    ui.addRecipientModal.addEventListener('click', (e) => {
        if (e.target === ui.addRecipientModal) hideRecipientModal();
    });
    ui.closeHistoryModalBtn.addEventListener('click', hideHistoryModal);
    ui.historyModal.addEventListener('click', (e) => {
        if (e.target === ui.historyModal) hideHistoryModal();
    });
    
    // History list actions
    ui.historyList.addEventListener('click', handleHistoryListClick);
}

// --- App Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    // PWA Service Worker Registration
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/service-worker.js')
            .then((registration) => {
                console.log('Service Worker registered with scope:', registration.scope);
            })
            .catch((error) => {
                console.error('Service Worker registration failed:', error);
            });
    }
    initialize();
});