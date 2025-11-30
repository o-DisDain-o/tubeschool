/**
 * Extract video ID from various YouTube URL formats
 * @param {string} url - YouTube URL
 * @returns {string|null} Video ID or null if invalid
 */
export const extractVideoId = (url) => {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/,
    /youtube\.com\/embed\/([^&\n?#]+)/,
    /youtube\.com\/v\/([^&\n?#]+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) {
      return match[1];
    }
  }

  return null;
};

/**
 * Validate YouTube URL
 * @param {string} url - URL to validate
 * @returns {boolean} True if valid YouTube URL
 */
export const isValidYouTubeUrl = (url) => {
  return extractVideoId(url) !== null;
};

/**
 * Format seconds to MM:SS or HH:MM:SS
 * @param {number} seconds - Time in seconds
 * @returns {string} Formatted time string
 */
export const formatTime = (seconds) => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);

  if (h > 0) {
    return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }
  return `${m}:${String(s).padStart(2, '0')}`;
};

/**
 * Format timestamp for display (e.g., "at 2:30")
 * @param {number} seconds - Time in seconds
 * @returns {string} Formatted timestamp
 */
export const formatTimestamp = (seconds) => {
  return `at ${formatTime(seconds)}`;
};

/**
 * Debounce function calls
 * @param {function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {function} Debounced function
 */
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * Truncate text to specified length
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} Truncated text
 */
export const truncate = (text, maxLength = 100) => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
};

/**
 * Copy text to clipboard
 * @param {string} text - Text to copy
 * @returns {Promise<boolean>} Success status
 */
export const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.error('Failed to copy:', err);
    return false;
  }
};

/**
 * Generate a random ID
 * @param {number} length - Length of ID
 * @returns {string} Random ID
 */
export const generateId = (length = 8) => {
  return Math.random()
    .toString(36)
    .substring(2, 2 + length);
};

/**
 * Format score percentage with color class
 * @param {number} score - Score percentage (0-100)
 * @returns {object} Color class and message
 */
export const getScoreDetails = (score) => {
  if (score >= 80) {
    return {
      colorClass: 'text-green-400',
      bgClass: 'bg-green-500/10',
      borderClass: 'border-green-500/20',
      message: 'Excellent work!',
      emoji: '🎉',
    };
  }
  if (score >= 60) {
    return {
      colorClass: 'text-yellow-400',
      bgClass: 'bg-yellow-500/10',
      borderClass: 'border-yellow-500/20',
      message: 'Good job!',
      emoji: '👍',
    };
  }
  return {
    colorClass: 'text-red-400',
    bgClass: 'bg-red-500/10',
    borderClass: 'border-red-500/20',
    message: 'Keep practicing!',
    emoji: '💪',
  };
};

/**
 * Format date/time for display
 * @param {Date|string} date - Date to format
 * @returns {string} Formatted date string
 */
export const formatDate = (date) => {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Check if running in development mode
 * @returns {boolean} True if in development
 */
export const isDevelopment = () => {
  return process.env.NODE_ENV === 'development';
};

/**
 * Sleep/delay function
 * @param {number} ms - Milliseconds to sleep
 * @returns {Promise} Promise that resolves after delay
 */
export const sleep = (ms) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

/**
 * Scroll to element smoothly
 * @param {string} elementId - Element ID to scroll to
 */
export const scrollToElement = (elementId) => {
  const element = document.getElementById(elementId);
  if (element) {
    element.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
};

/**
 * Get API base URL based on environment
 * @returns {string} API base URL
 */
export const getApiBaseUrl = () => {
  return process.env.REACT_APP_API_URL || 'http://localhost:8000/api/v1';
};

export default {
  extractVideoId,
  isValidYouTubeUrl,
  formatTime,
  formatTimestamp,
  debounce,
  truncate,
  copyToClipboard,
  generateId,
  getScoreDetails,
  formatDate,
  isDevelopment,
  sleep,
  scrollToElement,
  getApiBaseUrl,
};