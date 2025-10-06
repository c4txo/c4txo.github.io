// src/utils/validateAssetsRunner.js
const fs = require('fs');
const path = require('path');

// Convert the validation utility to work with CommonJS
const ASSETS_DIR = path.join(process.cwd(), 'assets');
const SUPPORTED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
const DATE_PATTERN = /^(.+)_(\d{2}-\d{2}-\d{4})$/;
const VALID_DATE_FORMAT = /^\d{2}-\d{2}-\d{4}$/;

/**
 * Validates the entire assets directory structure
 * @param {string} [customAssetsDir] - Optional custom assets directory path for testing
 * @returns {ValidationResult}
 */
function validateAssetsDirectory(customAssetsDir) {
  const result = {
    isValid: true,
    errors: [],
    warnings: [],
    stats: {
      totalPages: 0,
      totalEvents: 0,
      totalImages: 0,
      pagesWithIssues: [],
      eventsWithIssues: []
    }
  };

  const assetsDir = customAssetsDir || ASSETS_DIR;
  
  // Check if assets directory exists
  if (!fs.existsSync(assetsDir)) {
    result.errors.push(`Assets directory not found: ${assetsDir}`);
    result.isValid = false;
    return result;
  }

  try {
    const pageDirectories = fs.readdirSync(assetsDir, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);

    result.stats.totalPages = pageDirectories.length;

    if (pageDirectories.length === 0) {
      result.warnings.push('No page directories found in assets directory');
    }

    pageDirectories.forEach(pageName => {
      validatePageDirectory(pageName, result, assetsDir);
    });

  } catch (error) {
    result.errors.push(`Error reading assets directory: ${error.message}`);
    result.isValid = false;
  }

  // Set overall validity
  if (result.errors.length > 0) {
    result.isValid = false;
  }

  return result;
}

/**
 * Validates a single page directory
 */
function validatePageDirectory(pageName, result, assetsDir) {
  const pagePath = path.join(assetsDir, pageName);
  
  // Validate page name (no special restrictions, but check for common issues)
  if (pageName.includes('..') || pageName.includes('/') || pageName.includes('\\')) {
    result.errors.push(`Invalid page name "${pageName}": contains path traversal characters`);
    result.stats.pagesWithIssues.push(pageName);
    return;
  }

  try {
    const eventDirectories = fs.readdirSync(pagePath, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);

    result.stats.totalEvents += eventDirectories.length;

    if (eventDirectories.length === 0) {
      result.warnings.push(`Page "${pageName}" has no event directories`);
      result.stats.pagesWithIssues.push(pageName);
    }

    eventDirectories.forEach(eventName => {
      validateEventDirectory(pageName, eventName, result, assetsDir);
    });

  } catch (error) {
    result.errors.push(`Error reading page directory "${pageName}": ${error.message}`);
    result.stats.pagesWithIssues.push(pageName);
  }
}

/**
 * Validates a single event directory
 */
function validateEventDirectory(pageName, eventName, result, assetsDir) {
  const eventPath = path.join(assetsDir, pageName, eventName);
  
  // Validate event naming convention
  const dateMatch = eventName.match(DATE_PATTERN);
  if (!dateMatch) {
    result.errors.push(`Event "${eventName}" in page "${pageName}" does not follow naming convention "Event Name_MM-DD-YYYY"`);
    result.stats.eventsWithIssues.push(`${pageName}/${eventName}`);
  } else {
    const [, eventTitle, dateString] = dateMatch;
    
    // Validate date format
    if (!VALID_DATE_FORMAT.test(dateString)) {
      result.errors.push(`Event "${eventName}" has invalid date format. Expected MM-DD-YYYY, got "${dateString}"`);
      result.stats.eventsWithIssues.push(`${pageName}/${eventName}`);
    } else {
      // Validate date is actually valid
      const [month, day, year] = dateString.split('-').map(Number);
      const date = new Date(year, month - 1, day);
      
      if (date.getFullYear() !== year || 
          date.getMonth() !== month - 1 || 
          date.getDate() !== day) {
        result.errors.push(`Event "${eventName}" has invalid date "${dateString}" (not a real date)`);
        result.stats.eventsWithIssues.push(`${pageName}/${eventName}`);
      }
    }
    
    // Validate event title is not empty
    if (!eventTitle.trim()) {
      result.errors.push(`Event "${eventName}" has empty event title`);
      result.stats.eventsWithIssues.push(`${pageName}/${eventName}`);
    }
  }

  try {
    const files = fs.readdirSync(eventPath, { withFileTypes: true })
      .filter(dirent => dirent.isFile())
      .map(dirent => dirent.name);

    // Check for images
    const imageFiles = files.filter(filename => {
      const ext = path.extname(filename).toLowerCase();
      return SUPPORTED_EXTENSIONS.includes(ext);
    });

    result.stats.totalImages += imageFiles.length;

    if (imageFiles.length === 0) {
      result.warnings.push(`Event "${eventName}" in page "${pageName}" has no valid image files`);
      result.stats.eventsWithIssues.push(`${pageName}/${eventName}`);
    }

    // Validate image files
    imageFiles.forEach(filename => {
      validateImageFile(pageName, eventName, filename, result);
    });

    // Check for non-image files
    const nonImageFiles = files.filter(filename => {
      const ext = path.extname(filename).toLowerCase();
      return !SUPPORTED_EXTENSIONS.includes(ext);
    });

    if (nonImageFiles.length > 0) {
      result.warnings.push(`Event "${eventName}" in page "${pageName}" contains non-image files: ${nonImageFiles.join(', ')}`);
    }

  } catch (error) {
    result.errors.push(`Error reading event directory "${eventName}" in page "${pageName}": ${error.message}`);
    result.stats.eventsWithIssues.push(`${pageName}/${eventName}`);
  }
}

/**
 * Validates a single image file
 */
function validateImageFile(pageName, eventName, filename, result) {
  const ext = path.extname(filename).toLowerCase();
  
  // Validate file extension
  if (!SUPPORTED_EXTENSIONS.includes(ext)) {
    result.errors.push(`Invalid image format "${filename}" in event "${eventName}". Supported: ${SUPPORTED_EXTENSIONS.join(', ')}`);
    return;
  }

  // Validate filename doesn't contain problematic characters
  if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
    result.errors.push(`Invalid filename "${filename}" in event "${eventName}": contains path traversal characters`);
    return;
  }

  // Check for colon characters that break GitHub Actions artifact uploads
  if (filename.includes(':')) {
    result.errors.push(`Invalid filename "${filename}" in event "${eventName}": contains colon (:) which breaks CI/CD artifact uploads. Rename to use dash (-) instead of colon (:)`);
    return;
  }

  // Check for photographer credit format validation
  const creditMatch = filename.match(/^(.+?)\s*\(([^)]*)\)(\.[^.]+)$/);
  if (creditMatch) {
    const [, imageName, creditInfo, extension] = creditMatch;
    
    if (!imageName.trim()) {
      result.warnings.push(`Image "${filename}" in event "${eventName}" has empty image name before credit`);
    }
    
    if (!creditInfo.trim()) {
      result.warnings.push(`Image "${filename}" in event "${eventName}" has empty credit information`);
    }
  }
}

/**
 * Get validation summary for reporting
 */
function getValidationSummary(validationResult) {
  const { isValid, errors, warnings, stats } = validationResult;
  
  let summary = `\n=== Assets Directory Validation Summary ===\n`;
  summary += `Status: ${isValid ? '✅ VALID' : '❌ INVALID'}\n`;
  summary += `Pages: ${stats.totalPages}, Events: ${stats.totalEvents}, Images: ${stats.totalImages}\n`;
  
  if (errors.length > 0) {
    summary += `\n❌ Errors (${errors.length}):\n`;
    errors.forEach(error => summary += `  - ${error}\n`);
  }
  
  if (warnings.length > 0) {
    summary += `\n⚠️  Warnings (${warnings.length}):\n`;
    warnings.forEach(warning => summary += `  - ${warning}\n`);
  }

  if (stats.pagesWithIssues.length > 0) {
    summary += `\n📁 Pages with issues: ${stats.pagesWithIssues.join(', ')}\n`;
  }

  if (stats.eventsWithIssues.length > 0) {
    summary += `\n📅 Events with issues: ${stats.eventsWithIssues.join(', ')}\n`;
  }
  
  return summary;
}

// Run validation if this file is executed directly
if (require.main === module) {
  const result = validateAssetsDirectory();
  console.log(getValidationSummary(result));
  process.exit(result.isValid ? 0 : 1);
}

module.exports = {
  validateAssetsDirectory,
  getValidationSummary
};