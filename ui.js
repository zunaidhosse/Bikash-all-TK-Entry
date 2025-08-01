import { state } from './state.js';
import { formatCurrency } from './utils.js';

// --- DOM Element Selection ---
export const ui = {
    // Forms
    paymentForm: document.getElementById('payment-form'),
    addRecipientForm: document.getElementById('add-recipient-form'),

    // Inputs
    recipientNameInput: document.getElementById('recipient-name'),
    amountInput: document.getElementById('amount'),
    newRecipientNameInput: document.getElementById('new-recipient-name'),

    // Lists & Containers
    transactionsList: document.getElementById('transactions-list'),
    historyList: document.getElementById('history-list'),

    // Headings & Totals
    transactionsHeading: document.getElementById('transactions-heading'),
    totalAmountSpan: document.getElementById('total-amount'),

    // Buttons
    installButton: document.getElementById('install-button'),
    saveButton: document.getElementById('save-button'),
    menuButton: document.getElementById('menu-button'),
    addRecipientBtn: document.getElementById('add-recipient-btn'),
    historyBtn: document.getElementById('history-btn'),
    clearAllBtn: document.getElementById('clear-all-btn'),
    closeRecipientModalBtn: document.querySelector('#add-recipient-modal .close-button'),
    closeHistoryModalBtn: document.querySelector('#history-modal .close-button'),

    // Modals & Menus
    menuDropdown: document.getElementById('menu-dropdown'),
    addRecipientModal: document.getElementById('add-recipient-modal'),
    historyModal: document.getElementById('history-modal'),
};

// --- Rendering Functions ---

export function renderRecipients() {
    ui.recipientNameInput.innerHTML = '<option value="" disabled selected>Select a name</option>';
    state.recipients.forEach(name => {
        const option = document.createElement('option');
        option.value = name;
        option.textContent = name;
        ui.recipientNameInput.appendChild(option);
    });
}

export function renderTransactions() {
    ui.transactionsList.innerHTML = '';
    
    const headingText = document.createElement('span');
    headingText.textContent = 'Current Transactions';
    ui.transactionsHeading.innerHTML = '';
    ui.transactionsHeading.appendChild(headingText);

    if (state.currentLoadedDate) {
        const newDateBadge = document.createElement('span');
        newDateBadge.id = 'transactions-section-date';
        newDateBadge.textContent = `Viewing: ${state.currentLoadedDate}`;
        ui.transactionsHeading.appendChild(newDateBadge);
    }

    if (state.transactions.length === 0) {
        ui.transactionsList.innerHTML = '<div class="empty-list">No transactions have been added yet.</div>';
    } else {
        const grouped = state.transactions.reduce((acc, tx) => {
            if (!acc[tx.name]) acc[tx.name] = { total: 0, entries: [] };
            acc[tx.name].total += tx.amount;
            acc[tx.name].entries.push(tx);
            return acc;
        }, {});

        let serial = 1;
        for (const name in grouped) {
            const data = grouped[name];
            const groupDiv = document.createElement('div');
            groupDiv.className = 'grouped-item';
            groupDiv.dataset.name = name;

            groupDiv.innerHTML = `
                <div class="grouped-summary">
                    <h3><span class="serial-number">${serial++}</span> ${name}</h3>
                    <span class="grouped-total">${formatCurrency(data.total)}</span>
                </div>
                <div class="grouped-details">
                    <ul>
                        ${data.entries.map(entry => `
                            <li>
                                <div>
                                    <span>${formatCurrency(entry.amount)}</span>
                                    <span class="timestamp"> @ ${new Date(entry.timestamp).toLocaleString()}</span>
                                </div>
                                <button class="delete-tx-btn" data-timestamp="${entry.timestamp}" title="Delete Transaction">&#10005;</button>
                            </li>
                        `).join('')}
                    </ul>
                    <div class="details-actions">
                        <input type="number" placeholder="SAR Rate" class="sar-rate-input" step="0.01">
                        <input type="number" placeholder="Old Balance" class="old-balance-input sar-rate-input" step="0.01">
                        <input type="number" placeholder="Joma" class="sar-joma-input sar-rate-input" step="0.01">
                        <button class="btn btn-success download-invoice-btn">Download Invoice</button>
                    </div>
                </div>
            `;

            ui.transactionsList.appendChild(groupDiv);
            
            const summaryDiv = groupDiv.querySelector('.grouped-summary');
            const detailsDiv = groupDiv.querySelector('.grouped-details');
            summaryDiv.addEventListener('click', () => {
                summaryDiv.classList.toggle('expanded');
                detailsDiv.classList.toggle('expanded');
            });
        }
    }

    const total = state.transactions.reduce((sum, tx) => sum + tx.amount, 0);
    ui.totalAmountSpan.textContent = formatCurrency(total);
}

export function renderHistory() {
    ui.historyList.innerHTML = '';
    if (state.history.length === 0) {
        ui.historyList.innerHTML = '<p style="text-align: center; color: var(--secondary-color);">No saved history.</p>';
        return;
    }
    
    const sortedHistory = [...state.history].sort((a, b) => new Date(b.date) - new Date(a.date));

    sortedHistory.forEach(item => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'history-item';
        itemDiv.dataset.date = item.date;
        itemDiv.innerHTML = `
            <div class="history-info">
                ${item.date} - <strong>${formatCurrency(item.total)}</strong>
            </div>
            <div class="history-actions">
                <button class="btn btn-secondary load-history-btn">Load</button>
                <button class="btn btn-danger delete-history-btn">Delete</button>
            </div>
        `;
        ui.historyList.appendChild(itemDiv);
    });
}

export function renderAll() {
    renderRecipients();
    renderTransactions();
}

// --- UI Interaction Functions ---

export function toggleMenu() {
    ui.menuDropdown.classList.toggle('hidden');
}

export function hideMenu() {
    if (!ui.menuDropdown.classList.contains('hidden')) {
        ui.menuDropdown.classList.add('hidden');
    }
}

export function showRecipientModal() { ui.addRecipientModal.classList.remove('hidden'); }
export function hideRecipientModal() { ui.addRecipientModal.classList.add('hidden'); }
export function showHistoryModal() { ui.historyModal.classList.remove('hidden'); }
export function hideHistoryModal() { ui.historyModal.classList.add('hidden'); }