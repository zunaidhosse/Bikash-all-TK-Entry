import { getLocalDateKey } from './utils.js';
import {
    saveHistoryEntryToFirebase,
    loadHistoryFromFirebase,
    deleteHistoryEntryFromFirebase
} from './firebase.js';

// --- State Definition ---
const defaultRecipients = ["Jolpai Ali", "Mahamod", "Hotel", "Tamim", "Mamon", "Ismail", "Aziz"];

let transactions, recipients, history, currentLoadedDate;

async function loadStateFromStorage() {
    // Transactions and recipients are kept local to the device
    transactions = JSON.parse(localStorage.getItem('tk_payments')) || [];
    recipients = JSON.parse(localStorage.getItem('tk_recipients')) || [...defaultRecipients];
    currentLoadedDate = null; // Reset on load

    // History is loaded from Firebase, with a local backup
    try {
        history = await loadHistoryFromFirebase();
        // Save a local backup in case Firebase is down next time
        localStorage.setItem('tk_history_backup', JSON.stringify(history));
    } catch (error) {
        console.error("Could not load history from Firebase, trying local backup.", error);
        history = JSON.parse(localStorage.getItem('tk_history_backup')) || [];
    }
}

// --- State Persistence ---
const saveTransactionsToStorage = () => localStorage.setItem('tk_payments', JSON.stringify(transactions));
const saveRecipientsToStorage = () => localStorage.setItem('tk_recipients', JSON.stringify(recipients));

// --- State Export ---
// We export a 'state' object to provide read-only access to the state variables.
// This prevents modules from accidentally modifying state directly.
export const state = {
    get transactions() { return transactions },
    get recipients() { return recipients },
    get history() { return history },
    get currentLoadedDate() { return currentLoadedDate }
};

/**
 * Initializes the application state by loading data from storage.
 * This is now an async function to handle loading from Firebase.
 */
export async function initializeState() {
    await loadStateFromStorage();
}

// --- State Modification Functions ---

export function addTransaction(name, amount) {
    transactions.push({
        name,
        amount: parseFloat(amount),
        timestamp: new Date().toISOString()
    });
    saveTransactionsToStorage();
}

export function deleteTransaction(timestamp) {
    transactions = transactions.filter(tx => tx.timestamp !== timestamp);
    saveTransactionsToStorage();
}

export function clearCurrentTransactions() {
    transactions = [];
    currentLoadedDate = null;
    saveTransactionsToStorage();
}

export function addRecipient(name) {
    if (name && !recipients.includes(name)) {
        recipients.push(name);
        saveRecipientsToStorage();
        return true;
    }
    return false;
}

export async function saveCurrentTransactions() {
     if (transactions.length === 0) {
        alert("Cannot save an empty transaction list.");
        return null;
    }

    const dateKey = currentLoadedDate || getLocalDateKey();
    const total = transactions.reduce((sum, tx) => sum + tx.amount, 0);

    const newEntry = {
        date: dateKey,
        transactions: [...transactions],
        total: total,
        savedAt: new Date().toISOString()
    };

    const existingIndex = history.findIndex(item => item.date === dateKey);

    if (existingIndex > -1) {
        history[existingIndex] = newEntry;
    } else {
        history.push(newEntry);
    }
    
    // Save the new/updated entry to Firebase
    await saveHistoryEntryToFirebase(newEntry);
    
    // Also update the local backup
    localStorage.setItem('tk_history_backup', JSON.stringify(history));

    currentLoadedDate = dateKey;
    return dateKey;
}

export function loadTransactionsFromHistory(dateKey) {
    const historyEntry = history.find(item => item.date === dateKey);
    if (historyEntry) {
        transactions = [...historyEntry.transactions];
        currentLoadedDate = dateKey;
        saveTransactionsToStorage();
        return true;
    }
    return false;
}

export async function deleteHistoryEntry(dateKey) {
    // Remove from Firebase
    await deleteHistoryEntryFromFirebase(dateKey);

    // Remove from local state
    history = history.filter(item => item.date !== dateKey);
    
    // Update local backup
    localStorage.setItem('tk_history_backup', JSON.stringify(history));
}

export function clearAllData() {
    localStorage.removeItem('tk_payments');
    localStorage.removeItem('tk_recipients');
    localStorage.removeItem('tk_history_backup'); // Clear backup as well

    // This is a destructive local action. We might not want to clear Firebase here
    // as it could affect other users/devices. Let's keep remote data.
    // The user can delete history entries one by one if they want to clear remote.
    
    // Reset state variables to their initial empty/default state
    transactions = [];
    recipients = [...defaultRecipients];
    history = []; // History will be refetched on next load
    currentLoadedDate = null;
    saveTransactionsToStorage();
    saveRecipientsToStorage();
}

// --- Initial Load ---
// The initial load is now handled by initializeState and called from script.js