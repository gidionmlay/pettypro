/**
 * Formats a number as Tanzanian Shillings (TZS).
 * @param {number|string} amount - The amount to format.
 * @returns {string} - Formatted currency string (e.g., "TZS 1,500.00").
 */
export const formatCurrency = (amount) => {
    const num = Number(amount);
    if (isNaN(num)) return "TZS 0.00";

    return new Intl.NumberFormat("sw-TZ", {
        style: "currency",
        currency: "TZS",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(num);
};

/**
 * Formats a date string to a readable format.
 * @param {string} dateString - The date string to format.
 * @returns {string} - Formatted date (e.g., "18 Jan 2026").
 */
export const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    }).format(date);
};
