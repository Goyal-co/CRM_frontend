/**
 * Utility functions for lead management
 */

/**
 * Counts the number of manual leads
 * @param {Array} leads - Array of lead objects
 * @returns {number} Number of leads (0 if leads is not an array)
 */
export const getManualLeadsCount = (leads) => {
  return Array.isArray(leads) ? leads.length : 0;
};

/**
 * Parses a date string from various formats to a Date object
 * @param {string} dateString - Date string to parse
 * @returns {Date|undefined} Parsed date or undefined if invalid
 */
const parseDate = (dateString) => {
  if (!dateString) return undefined;
  
  // Try parsing as YYYY-MM-DD (ISO format)
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    const [year, month, day] = dateString.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    if (!isNaN(date.getTime())) return date;
  }
  
  // Try parsing as DD/MM/YYYY (common spreadsheet format)
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateString)) {
    const [day, month, year] = dateString.split('/').map(Number);
    const date = new Date(year, month - 1, day);
    if (!isNaN(date.getTime())) return date;
  }
  
  // Try parsing as a JavaScript date string
  const date = new Date(dateString);
  if (!isNaN(date.getTime())) return date;
  
  return undefined;
};

/**
 * Formats a date string for input fields (YYYY-MM-DD)
 * @param {string} dateString - Date string to format
 * @returns {string} Formatted date string or empty string if invalid
 */
export const formatDateForInput = (dateString) => {
  try {
    const date = parseDate(dateString);
    if (!date) return '';
    
    // Format as YYYY-MM-DD
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
  } catch (error) {
    console.error('Error formatting date:', error);
    return '';
  }
};

/**
 * Formats a date for backend (YYYY-MM-DD)
 * @param {string} dateString - Date string to format
 * @returns {string} Formatted date string or empty string if invalid
 */
export const formatDateForBackend = (dateString) => {
  try {
    const date = parseDate(dateString);
    if (!date) return '';
    
    // Format as YYYY-MM-DD
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
  } catch (error) {
    console.error('Error formatting date for backend:', error);
    return '';
  }
};
