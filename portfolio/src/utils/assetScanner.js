// src/utils/assetScanner.js
import fs from 'fs';
import path from 'path';

const ASSETS_DIR = path.join(process.cwd(), 'assets');
const SUPPORTED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];

/**
 * Extract date from event name for sorting
 * Returns Date object or null if no valid date found
 */
function extractDateFromEventName(eventName) {
  const match = eventName.match(/_([0-9]{2})-([0-9]{2})-([0-9]{4})$/);
  if (match) {
    const [, month, day, year] = match;
    return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
  }
  return null;
}

/**
 * Scans the assets directory and returns organized data for slideshows
 * Structure: assets/[Page Name]/[Event Name]/[images]
 */
export function scanAssets() {
  try {
    if (!fs.existsSync(ASSETS_DIR)) {
      console.warn('Assets directory not found:', ASSETS_DIR);
      return {};
    }

    const pages = {};
    const pageDirectories = fs.readdirSync(ASSETS_DIR, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);

    pageDirectories.forEach(pageName => {
      const pagePath = path.join(ASSETS_DIR, pageName);
      const events = {};

      // Scan for event directories within each page
      const eventDirectories = fs.readdirSync(pagePath, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory())
        .map(dirent => dirent.name);

      eventDirectories.forEach(eventName => {
        const eventPath = path.join(pagePath, eventName);
        
        // Get all image files in the event directory
        const images = fs.readdirSync(eventPath, { withFileTypes: true })
          .filter(dirent => {
            if (!dirent.isFile()) return false;
            const ext = path.extname(dirent.name).toLowerCase();
            return SUPPORTED_EXTENSIONS.includes(ext);
          })
          .map(dirent => ({
            filename: dirent.name,
            path: `/assets/${pageName}/${eventName}/${dirent.name}`,
            name: path.parse(dirent.name).name
          }))
          .sort((a, b) => a.filename.localeCompare(b.filename));

        if (images.length > 0) {
          events[eventName] = {
            name: eventName,
            images,
            count: images.length,
            coverImage: images[0] // First image as cover
          };
        }
      });

      if (Object.keys(events).length > 0) {
        // Sort events by date in descending order (newest first)
        const sortedEventEntries = Object.entries(events).sort((a, b) => {
          const dateA = extractDateFromEventName(a[0]);
          const dateB = extractDateFromEventName(b[0]);
          
          // If both have dates, sort by date (newest first)
          if (dateA && dateB) {
            return dateB.getTime() - dateA.getTime();
          }
          
          // If only one has a date, prioritize it
          if (dateA && !dateB) return -1;
          if (!dateA && dateB) return 1;
          
          // If neither has a date, sort alphabetically
          return a[0].localeCompare(b[0]);
        });
        
        // Convert back to object with sorted order
        const sortedEvents = {};
        sortedEventEntries.forEach(([eventName, eventData]) => {
          sortedEvents[eventName] = eventData;
        });
        
        pages[pageName] = {
          name: pageName,
          slug: pageNameToSlug(pageName),
          events: sortedEvents,
          eventCount: Object.keys(sortedEvents).length
        };
      }
    });

    return pages;
  } catch (error) {
    console.error('Error scanning assets:', error);
    return {};
  }
}

/**
 * Get assets for a specific page
 */
export function getPageAssets(pageName) {
  const allAssets = scanAssets();
  return allAssets[pageName] || null;
}

/**
 * Convert page name to URL slug
 * "Maid Cafe" -> "maidcafe"
 */
export function pageNameToSlug(pageName) {
  return pageName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '')
    .trim();
}

/**
 * Convert slug back to page name for lookup
 */
export function slugToPageName(slug) {
  const allAssets = scanAssets();
  const entry = Object.entries(allAssets).find(([pageName, data]) => 
    data.slug === slug
  );
  return entry ? entry[0] : null;
}

/**
 * Get all available page slugs for routing
 */
export function getAllPageSlugs() {
  const allAssets = scanAssets();
  return Object.values(allAssets).map(page => page.slug);
}

// For static generation in Next.js
export function getStaticPaths() {
  const slugs = getAllPageSlugs();
  return {
    paths: slugs.map(slug => ({ params: { slug } })),
    fallback: false
  };
}

export function getStaticProps({ params }) {
  const pageName = slugToPageName(params.slug);
  const pageAssets = getPageAssets(pageName);
  
  return {
    props: {
      pageAssets,
      pageName
    }
  };
}