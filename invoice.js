import html2canvas from 'html2canvas';
import { formatCurrency } from './utils.js';

export function generateInvoice(name, data, rate = null, sarJoma = 0, oldBalance = 0) {
    const invoiceTemplate = document.getElementById('invoice-template');

    document.getElementById('invoice-name').textContent = name;
    document.getElementById('invoice-date').textContent = new Date().toLocaleDateString();

    const tableBody = document.getElementById('invoice-table-body');
    tableBody.innerHTML = '';
    data.entries.forEach((entry, index) => {
        const row = tableBody.insertRow();
        row.innerHTML = `<td>${index + 1}</td><td>${entry.amount.toFixed(2)}</td>`;
    });

    const simpleTotalContainer = document.getElementById('invoice-simple-total-container');
    const detailedTotalContainer = document.getElementById('invoice-detailed-total-container');
    const oldBalanceSection = document.getElementById('invoice-old-balance-section');
    const jomaSection = document.getElementById('invoice-joma-section');
    
    const totalTk = data.total;

    if (rate && rate > 0) {
        simpleTotalContainer.style.display = 'none';
        detailedTotalContainer.style.display = 'block';

        const subtotalSar = totalTk / rate;
        const dueSar = subtotalSar + oldBalance - sarJoma;

        document.getElementById('invoice-detail-rate').textContent = rate.toFixed(2);
        document.getElementById('invoice-detail-total-tk').textContent = totalTk.toFixed(2);
        document.getElementById('invoice-subtotal-sar').textContent = subtotalSar.toFixed(2);

        oldBalanceSection.style.display = oldBalance !== 0 ? 'block' : 'none';
        if (oldBalance !== 0) {
            document.getElementById('invoice-detail-old-balance').textContent = `+${oldBalance.toFixed(2)}`;
        }
        
        jomaSection.style.display = sarJoma !== 0 ? 'block' : 'none';
        if (sarJoma !== 0) {
            document.getElementById('invoice-detail-joma').textContent = `-${sarJoma.toFixed(2)}`;
        }

        const dueLabelEl = document.getElementById('invoice-due-label');
        const dueAmountEl = document.getElementById('invoice-detail-balance-sar');

        if (dueSar < 0) {
            // If due is negative, it's a credit/Joma. Show a positive value.
            dueLabelEl.innerHTML = `${name} Joma:`;
            dueAmountEl.textContent = Math.abs(dueSar).toFixed(2);
        } else {
            dueLabelEl.textContent = 'Due SAR:';
            dueAmountEl.textContent = dueSar.toFixed(2);
        }

    } else {
        simpleTotalContainer.style.display = 'block';
        detailedTotalContainer.style.display = 'none';
        document.getElementById('invoice-total').textContent = formatCurrency(totalTk);
    }
    
    html2canvas(invoiceTemplate, {
         scale: 2,
         useCORS: true,
         logging: false,
         backgroundColor: null
    }).then(canvas => {
        const link = document.createElement('a');
        link.download = `${name}-receipt.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
    });
}

