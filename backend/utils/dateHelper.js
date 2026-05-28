/**
 * dateHelper.js
 * Utility functions for handling dates in Vietnam timezone (UTC+7).
 *
 * Root cause of the bug:
 *   - mysql2 defaults to UTC for DATETIME columns.
 *   - Vietnam is UTC+7, so storing/reading without timezone config
 *     causes a 7-hour offset in displayed times.
 *
 * Fix applied in db.js:
 *   - pool option: timezone: '+07:00'
 *   - pool option: dateStrings: ['DATE', 'DATETIME']
 *
 * These helpers are provided as a safety net for any manual date
 * construction needed in services (e.g. new Date() calls).
 */

const VN_OFFSET_MS = 7 * 60 * 60 * 1000; // UTC+7 in milliseconds

/**
 * Get current time in Vietnam timezone as a MySQL-compatible string.
 * Format: "YYYY-MM-DD HH:MM:SS"
 * @returns {string}
 */
export const nowVN = () => {
    const now = new Date(Date.now() + VN_OFFSET_MS);
    return now.toISOString().slice(0, 19).replace('T', ' ');
};

/**
 * Convert any date input to a MySQL-compatible datetime string in UTC+7.
 * Accepts ISO string, JS Date, or timestamp number.
 * @param {string|Date|number} input
 * @returns {string} "YYYY-MM-DD HH:MM:SS"
 */
export const toVNDateString = (input) => {
    if (!input) return null;
    const d = new Date(input);
    if (isNaN(d.getTime())) return null;
    const vn = new Date(d.getTime() + VN_OFFSET_MS);
    return vn.toISOString().slice(0, 19).replace('T', ' ');
};

/**
 * Convert a date to "YYYY-MM-DD" string in Vietnam timezone.
 * Used for DATE columns (e.g. shiftDate, dateOfBirth).
 * @param {string|Date|number} input
 * @returns {string} "YYYY-MM-DD"
 */
export const toVNDateOnly = (input) => {
    if (!input) return null;
    const d = new Date(input);
    if (isNaN(d.getTime())) return null;
    const vn = new Date(d.getTime() + VN_OFFSET_MS);
    return vn.toISOString().slice(0, 10);
};

/**
 * Parse a MySQL DATETIME string (assumed to be UTC+7 due to pool config)
 * back to a JS Date for arithmetic (e.g. duration calculation).
 * @param {string} mysqlStr - "YYYY-MM-DD HH:MM:SS"
 * @returns {Date}
 */
export const fromVNDateString = (mysqlStr) => {
    if (!mysqlStr) return null;
    // Treat the string as local UTC+7 time, convert to UTC for JS Date
    return new Date(mysqlStr.replace(' ', 'T') + '+07:00');
};
