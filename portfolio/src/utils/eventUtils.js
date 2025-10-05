// src/utils/eventUtils.js
// Client-safe utility functions for event name parsing and formatting
// These functions don't use Node.js modules and can be used in both client and server components

/**
 * Extract date from event name for sorting
 * Returns Date object or null if no valid date found
 */
export function extractDateFromEventName(eventName) {
  const match = eventName.match(/_(\d{2})-(\d{2})-(\d{4})$/);
  if (match) {
    const [, month, day, year] = match;
    return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
  }
  return null;
}

/**
 * Format date from event name for display
 * Returns formatted date as "MM/DD/YYYY" or null if invalid
 */
export function formatEventDate(eventName) {
  const match = eventName.match(/_(\d{2})-(\d{2})-(\d{4})$/);
  if (match) {
    const [, month, day, year] = match;
    return `${month}/${day}/${year}`;
  }
  return null;
}

/**
 * Get display name without date suffix
 * Removes everything from the last underscore + date pattern
 */
export function getEventDisplayName(eventName) {
  return eventName.replace(/_\d{2}-\d{2}-\d{4}$/, '');
}