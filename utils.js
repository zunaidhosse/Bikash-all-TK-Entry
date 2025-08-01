export const formatCurrency = (amount) => `${amount.toFixed(2)} TK`;

export const getLocalDateKey = () => {
    const today = new Date();
    // Adjust for timezone to get the local date string, not UTC
    const offset = today.getTimezoneOffset();
    const adjustedToday = new Date(today.getTime() - (offset * 60 * 1000));
    return adjustedToday.toISOString().split('T')[0];
};