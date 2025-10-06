# Slideshow Factory System - Agent Development Guide

## System Overview

The Slideshow Factory is an automated photo gallery system for Cat's portfolio website that dynamically generates slideshows based on directory structure**What Gets Validated**

**Directory Structure Requirements:**
- ✅ Three-level hierarchy: `assets/[Page]/[Event]/[Images]`
- ✅ Event naming: `"Event Name_MM-DD-YYYY"` format
- ✅ Date validity: Real dates only (no Feb 30th, etc.)
- ✅ Image formats: JPG, JPEG, PNG, GIF, WebP only
- ✅ Photographer credits: `"image (credit info).ext"` format
- ✅ Filename safety: No illegal characters `" : < > | * ? \r \n`
- ✅ Security: No path traversal attempts
- ✅ File integrity: Valid image files, no corrupted datanates manual page creation by automatically scanning the `assets/` directory and creating responsive photo galleries.

**Integration with CI/CD**
**Automatic Validation:**
- Validation runs automatically before every build (`npm run prebuild`)
- GitHub Actions validates on push/PR
- Deployment fails if asset conventions are violated
- Ensures slideshow factory conventions are maintained

**Pre-commit Validation Workflow:**
1. Add new images to proper event directories
2. Run `npm run validate:assets` to check structure
3. Fix any violations before committing
4. Validation ensures slideshow factory works correctlyanual page creation by automatically scanning the `assets/` directory and creating responsive photo galleries.

## Architecture

### Core Components

1. **`assetScanner.js`** - Server-side utility that scans directory structure and generates metadata
2. **`eventUtils.js`** - Client-safe utility functions for event name parsing and date formatting
3. **`SlideshowFactory.js`** - Main component that renders multiple slideshows per page
4. **`Slideshow.js`** - Individual slideshow component with fade transitions, autoscroll, and modal
5. **`CategoryPage.js`** - Generic reusable page component for all category pages
6. **`[slug].js`** - Dynamic page router that handles any category URL
7. **`NavBar.js`** - Updated navigation that links to generated pages

### Directory Structure Convention

```
assets/
├── [Page Name]/              # Top-level = Page (e.g., "Maid Cafe" → /maidcafe)
│   ├── [Event Name_MM-DD-YYYY]/  # Sub-level = Slideshow (e.g., "Headshots_08-16-2025")
│   │   ├── image1.jpg        # Images in event folder
│   │   ├── image2.jpg
│   │   └── image3.jpg
│   └── [Another Event_MM-DD-YYYY]/
│       └── more_images.jpg
└── [Another Page]/
    └── [Events]/
```

**Event Naming Format**: `"Event Name_MM-DD-YYYY"`
- Event names can contain spaces (e.g., "Anime Impulse_01-17-2025")
- Underscore `_` is the delimiter between event name and date
- Date format must be exactly MM-DD-YYYY

## How It Works

### 1. Asset Discovery Process

The `assetScanner.js` utility:
- Scans the `assets/` directory recursively
- Converts page names to URL slugs (`"Maid Cafe"` → `"maidcafe"`)
- Groups images by event folders
- **Parses dates** from event names (`"Event_08-16-2025"` → Aug 16, 2025)
- **Sorts events** by date in descending order (newest first)
- Generates metadata for each page and event
- Supports JPG, JPEG, PNG, GIF, WebP formats

### 2. Utility Functions Architecture

**Client/Server Separation**: The system uses two utility files to handle Next.js client/server constraints:

#### `eventUtils.js` (Client-Safe Utilities)
- **Purpose**: Event name parsing and date formatting functions
- **Usage**: Imported by React components (SlideshowFactory, Slideshow)
- **Location**: `src/utils/eventUtils.js`
- **Functions**:
  - `extractDateFromEventName(eventName)` - Returns Date object from event name
  - `formatEventDate(eventName)` - Returns "MM/DD/YYYY" string for display
  - `getEventDisplayName(eventName)` - Returns event name without date suffix
- **Key Feature**: No Node.js dependencies, safe for client-side use

#### `assetScanner.js` (Server-Side Utilities)
- **Purpose**: File system operations and asset scanning
- **Usage**: Server-side operations (getStaticProps, build time)
- **Location**: `src/utils/assetScanner.js`
- **Dependencies**: Node.js `fs` and `path` modules
- **Functions**: Asset scanning, directory operations, page generation
- **Important**: Imports `extractDateFromEventName` from `eventUtils.js` for consistency

**Why This Architecture?**
- Next.js components can't import Node.js modules on the client-side
- Separating utilities allows code reuse while maintaining build compatibility
- Single source of truth for date parsing logic across client and server

### 2. Page Generation

- **Static Generation**: Uses Next.js `getStaticPaths` and `getStaticProps`
- **Dynamic Routing**: `[slug].js` handles any category URL
- **Automatic Navigation**: NavBar updates based on available pages

### 3. Image Serving

- **Automatic Copying**: `next.config.mjs` automatically copies `assets/` to `public/assets/` on server start
- **Development & Production**: Works in both environments without manual intervention
- **Static Export**: Compatible with GitHub Pages static hosting
- **Clean Copy**: Removes old assets before copying new ones to prevent stale files
- **Optimized**: Uses Next.js Image component with fade transitions and object-contain scaling

## Agent Development Guidelines

### Adding New Categories/Pages

**Agent Task**: "Add a new category for Fashion photos"

**Steps**:
1. Create directory: `assets/Fashion/`
2. Add event subdirectories: `assets/Fashion/Spring_Collection_2024/`
3. Add images to event folders
4. Pages automatically generate at `/fashion`
5. No code changes required - system auto-detects

**Code**: No manual coding needed, but agents can verify by checking:
```javascript
// Test the scanner
import { scanAssets } from '../utils/assetScanner';
const assets = scanAssets();
console.log(assets); // Should show new Fashion page
```

### Adding Events to Existing Pages

**Agent Task**: "Add new photoshoot to Maid Cafe category"

**Steps**:
1. Create folder: `assets/Maid Cafe/New Event_10-05-2025/`
2. Add photos to the folder
3. Restart development server (assets auto-copy on startup)
4. Slideshow automatically appears on `/maidcafe` page
5. Events are automatically sorted by date (newest first)

### Customizing Slideshow Layouts

**Agent Task**: "Change the layout of a specific page"

**Available Options**:
```jsx
<SlideshowFactory 
  pageAssets={pageAssets}
  layout="grid"            // Options: "grid", "stack", "masonry"
  maxColumns={3}           // 1-4 columns for grid layout
  showTitle={true}         // Show/hide page title
  disableAutoScroll={true} // Disable auto-scroll for ALL slideshows (default: true)
  showPhotoCredits={true}  // Show photographer credits for ALL slideshows (default: true)
  className="custom"       // Additional CSS classes
/>
```

**Implementation**:
Modify the page file (e.g., `pages/maidcafe.js`) or the dynamic page template (`pages/[slug].js`).

### Slideshow Features

**Agent Task**: "Customize slideshow behavior"

**Available Features**:
```jsx
<Slideshow 
  event={event} 
  autoScrollInterval={8000}     // Auto-advance interval (default: 8 seconds)
  disableAutoScroll={true}      // Disable auto-scrolling (default: true)
  showPhotoCredits={true}       // Show photographer credits (default: true)
  className="custom-class"      // Additional styling
/>
```

**Auto-Scroll Control**:
- `disableAutoScroll={true}` (default): Slideshow starts with auto-scroll **OFF**
- `disableAutoScroll={false}`: Slideshow starts with auto-scroll **ON**
- Users can still manually toggle auto-scroll using the play/pause button
- Parameter only affects the initial state, not the user's ability to control it

**Photographer Credit Control**:
- `showPhotoCredits={true}` (default): Display info button for images with credits
- `showPhotoCredits={false}`: Hide all photographer credit functionality
- Credits are parsed from filename format: `"image (credit info).ext"`
- Info button (ⓘ) appears only when credit exists in filename
- Expandable panel shows credit on click, auto-hides on image change

**Built-in Features**:
- **Fade Transitions**: Smooth 300ms fade between images
- **Autoscroll**: Automatic advancement with play/pause control (disabled by default)
- **Auto-Scroll Control**: Configurable via `disableAutoScroll` parameter
- **Photographer Credits**: Expandable info panel for photo attribution (filename-based)
- **Full Screen Modal**: Click any image for full-screen viewing
- **Navigation**: Arrow keys, thumbnails, and navigation buttons
- **Date Display**: Automatically parses and shows event dates
- **Complete Image Display**: Uses object-contain to show full images without cropping

### Troubleshooting Common Issues

#### Images Not Appearing
1. Check file extensions (must be: jpg, jpeg, png, gif, webp)
2. Verify directory structure matches convention (`Event Name_MM-DD-YYYY`)
3. Restart development server to trigger automatic asset copying
4. Check if assets were copied to `public/assets/`
5. Verify event name follows format: `"Event Name_MM-DD-YYYY"`

#### Page Not Generating
1. Check folder names in `assets/` directory
2. Verify `getStaticPaths` includes the slug
3. Check console for scanner errors
4. Ensure at least one valid image exists in subdirectories

#### URL Issues
1. Page names convert to lowercase, remove spaces/special chars
2. "Brand Collaborations" → "brandcollaborations"
3. Update NavBar links if needed

### Asset Structure Validation & Testing

**CRITICAL: Always validate asset structure before deploying!** The slideshow factory depends on strict directory and naming conventions. Use the comprehensive test suite to catch issues early.

#### Running Validation Tests

**Primary Command:**
```bash
# Asset validation - validates all conventions
npm run validate:assets
```

#### What Gets Validated

**Directory Structure Requirements:**
- ✅ Three-level hierarchy: `assets/[Page]/[Event]/[Images]`
- ✅ Event naming: `"Event Name_MM-DD-YYYY"` format
- ✅ Date validity: Real dates only (no Feb 30th, etc.)
- ✅ Image formats: JPG, JPEG, PNG, GIF, WebP only
- ✅ Photographer credits: `"image (credit info).ext"` format
- ✅ Security: No path traversal attempts
- ✅ File integrity: Valid image files, no corrupted data

**Test Results Interpretation:**
```bash
# ✅ VALID - All conventions followed
Status: ✅ VALID
Pages: 5, Events: 12, Images: 87

# ❌ INVALID - Violations found  
Status: ❌ INVALID
❌ Errors (3):
  - Event "Bad Event-2025-01-01" does not follow naming convention
  - Invalid date "02-30-2025" (not a real date)
  - Invalid image format "document.pdf"

# ⚠️  Warnings - Non-critical issues
⚠️  Warnings (2):  
  - Page "Brand Collaborations" has no event directories
  - Event contains non-image files: readme.txt
```

#### Integration with CI/CD

**Automatic Validation:**
- Tests run automatically before every build (`npm run prebuild`)
- GitHub Actions validates on push/PR
- Deployment fails if asset conventions are violated
- Coverage reports track validation thoroughness

**Pre-commit Validation Workflow:**
1. Add new images to proper event directories
2. Run `npm run validate:assets` to check structure
3. Fix any violations before committing
4. Tests ensure slideshow factory works correctly

#### Common Validation Failures & Fixes

**Event Naming Violations:**
```bash
# ❌ Wrong format
assets/Portfolio/PhotoShoot-01-15-2025/    # Missing space before date
assets/Portfolio/Photo Shoot 01-15-2025/   # Missing underscore
assets/Portfolio/Photo Shoot_2025-01-15/   # Wrong date format

# ✅ Correct format  
assets/Portfolio/Photo Shoot_01-15-2025/   # Event Name_MM-DD-YYYY
```

**Date Format Issues:**
```bash
# ❌ Invalid dates
Summer Event_13-01-2025    # Month 13 doesn't exist
Winter Shoot_02-30-2025    # Feb 30th doesn't exist  
New Year_01-32-2025        # Day 32 doesn't exist

# ✅ Valid dates
Summer Event_12-01-2025    # December 1st
Winter Shoot_02-28-2025    # February 28th
New Year_01-31-2025        # January 31st
```

**Image Format Problems:**
```bash
# ❌ Unsupported formats
photo.bmp, image.tiff, file.pdf, video.mp4

# ✅ Supported formats
photo.jpg, image.png, graphic.gif, modern.webp
```

**Filename Character Issues:**
```bash
# ❌ Illegal characters (break CI/CD artifact uploads)
"photo: bad.jpg"          # Colon :
"image<test>.png"         # Less than < Greater than >
"file|name.gif"           # Vertical bar |
"photo*.jpeg"             # Asterisk *
"image?.webp"             # Question mark ?
"photo"quote.jpg"         # Double quote "
"file\rwith\nbreaks.png"  # Carriage return \r, Line feed \n

# ✅ Safe characters for CI/CD
"photo- good.jpg"         # Use dash instead of colon
"image_test.png"          # Use underscore instead of brackets
"file_name.gif"           # Use underscore instead of pipe
"photo_star.jpeg"         # Use word instead of asterisk
"image_question.webp"     # Use word instead of question mark
"photo_quote.jpg"         # Use word instead of quote
"file_clean.png"          # Remove line breaks
```

**Photographer Credit Format:**
```bash
# ❌ Wrong format  
"photo-by-john.jpg"        # No parentheses
"photo (no space).jpg"     # No space before parentheses  
"photo ().jpg"             # Empty credit

# ✅ Correct format
"sunset (photo- @john).jpg"      # Proper credit format
"portrait (credit- Jane).png"    # Alternative credit style
"landscape (by- Studio).gif"     # Flexible credit text
```

#### Build and Deployment Issues

**ESLint Errors During Build:**

1. **React Hooks Rules Violations:**
   - Error: `React Hook "useState" is called conditionally`
   - Solution: Ensure early returns happen before any hooks
   - Pattern: Use wrapper components or move validation before hook declarations

2. **Next.js Link Requirements:**
   - Error: `Do not use an <a> element to navigate to /. Use <Link /> from next/link`
   - Solution: Always use `import Link from 'next/link'` and `<Link href="/">` for internal navigation
   - Replace: `<a href="/">` → `<Link href="/">`

3. **Image Optimization Warnings:**
   - Error: `Using <img> could result in slower LCP and higher bandwidth`
   - Solution: Use `import Image from 'next/image'` and `<Image>` component
   - Replace: `<img src="...">` → `<Image src="..." fill />` or with width/height

4. **Unescaped Characters:**
   - Error: `can be escaped with &quot;, &ldquo;, &#34;, &rdquo;`
   - Solution: Escape quotes in JSX content
   - Replace: `"text"` → `&quot;text&quot;`

**Conflicting Routes:**
- Error: `Conflicting paths returned from getStaticPaths`
- Cause: Having both specific page files (e.g., `maidcafe.js`) and dynamic routing (`[slug].js`)
- Solution: Remove specific page files, use only dynamic routing for portfolio pages

**Build Process:**
```bash
# Development
npm run dev          # Start development server with hot reload

# Production Build
npm run build        # Creates optimized static files in /out directory
                     # Automatically handles asset copying and static export

# Common Build Issues:
# 1. Clear .next cache if strange errors occur
rm -rf .next

# 2. Ensure assets directory exists and has proper structure
# 3. Check that next.config.mjs has proper static export configuration
# 4. Verify all components follow Next.js best practices
```

**Deployment Workflow:**
- GitHub Actions automatically builds on push to main branch
- Uses `npm run build` which includes static export
- Deploys `/out` directory to GitHub Pages
- Asset copying happens automatically during build

**Best Practices to Prevent Build Issues:**

1. **Always test builds locally before pushing:**
   ```bash
   npm run build  # Must complete without errors
   ```

2. **Component Development Guidelines:**
   - Use Next.js `<Link>` for internal navigation, never `<a href>`
   - Use Next.js `<Image>` instead of `<img>` for better performance
   - Put early returns before any React hooks
   - Escape special characters in JSX content

3. **Utility Function Guidelines:**
   - Import from `eventUtils.js` in client components
   - Import from `assetScanner.js` only in server-side code
   - Never import Node.js modules in client components

4. **Route Management:**
   - Use only dynamic routing `[slug].js` for portfolio pages
   - Remove specific page files to avoid conflicts
   - Ensure `getStaticPaths` returns unique paths

### Code Patterns for Agents

#### Checking Available Assets
```javascript
import { scanAssets, getPageAssets } from '../utils/assetScanner';

// Get all available pages
const allAssets = scanAssets();
console.log('Available pages:', Object.keys(allAssets));

// Get specific page data
const maidCafeData = getPageAssets('Maid Cafe');
console.log('Maid Cafe events:', Object.keys(maidCafeData.events));
```

#### Using Utility Functions

**In Client Components (React components):**
```javascript
import { formatEventDate, getEventDisplayName, extractDateFromEventName } from '../utils/eventUtils';

// Format event date for display
const displayDate = formatEventDate('Summer Concert_08-15-2025'); // Returns "08/15/2025"

// Get clean event name
const eventName = getEventDisplayName('Summer Concert_08-15-2025'); // Returns "Summer Concert"

// Get Date object for sorting/comparison
const dateObj = extractDateFromEventName('Summer Concert_08-15-2025'); // Returns Date(2025, 7, 15)
```

**In Server-Side Code (getStaticProps, API routes):**
```javascript
import { scanAssets, getPageAssets } from '../utils/assetScanner';
import { extractDateFromEventName } from '../utils/eventUtils';

// Server-side asset scanning
const pageData = getPageAssets('Maid Cafe');

// Can also use eventUtils functions on server-side
const eventDate = extractDateFromEventName('Concert_12-25-2025');
```

**Important Notes:**
- Always use `eventUtils.js` functions in React components
- `assetScanner.js` is for server-side operations only
- Both files share the same date parsing logic for consistency

#### Photographer Credit Functions

**In Client Components (React components):**
```javascript
import { extractPhotoCredit, getCleanImageName } from '../utils/eventUtils';

// Extract credit from filename
const credit = extractPhotoCredit('photo (photo- @srdlj).jpg'); // Returns "photo- @srdlj"
const noCredit = extractPhotoCredit('photo.jpg'); // Returns null

// Get clean filename
const cleanName = getCleanImageName('photo (photo- @srdlj).jpg'); // Returns "photo"
```

**Filename Format Convention:**
- Format: `"image_name (credit_info).extension"`
- Example: `"lvlup_1 (photo- @srdlj).jpeg"`
- Credit text: Everything inside parentheses
- Works with any file extension: jpg, jpeg, png, gif, webp

#### Auto-Scroll Control Patterns

**Enable auto-scroll for all slideshows on a page:**
```javascript
<SlideshowFactory 
  pageAssets={pageAssets}
  disableAutoScroll={false}  // All slideshows auto-advance
/>
```

**Mixed control - factory disabled, individual enabled:**
```javascript
<SlideshowFactory pageAssets={pageAssets} disableAutoScroll={true} />

{/* Later, individual slideshow with auto-scroll enabled */}
<Slideshow 
  event={specificEvent} 
  disableAutoScroll={false}  // This one auto-advances
/>
```

**Different intervals per slideshow:**
```javascript
{/* Fast slideshow - 3 seconds */}
<Slideshow 
  event={eventA} 
  disableAutoScroll={false}
  autoScrollInterval={3000}
/>

{/* Slow slideshow - 10 seconds */}
<Slideshow 
  event={eventB} 
  disableAutoScroll={false}
  autoScrollInterval={10000}
/>
```

#### Creating Custom Page Layouts
```javascript
// Using the generic CategoryPage component (recommended)
import CategoryPage from '../components/CategoryPage';

export default function CustomPage({ pageAssets }) {
  return (
    <CategoryPage 
      pageAssets={pageAssets}
      layout="stack"      // Stack layout for single column
      maxColumns={1}
      className="max-w-4xl mx-auto"
    />
  );
}

// Or custom layout with SlideshowFactory directly
export default function CustomPage({ pageAssets }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar />
      <div className="h-14 sm:h-16" />
      
      <main className="container mx-auto px-4 py-8">
        <SlideshowFactory 
          pageAssets={pageAssets}
          layout="stack"
          maxColumns={1}
          showTitle={true}
          disableAutoScroll={false}  // Enable auto-scroll for all slideshows
          className="max-w-4xl mx-auto"
        />
      </main>
      
      {/* Back to Portfolio Link */}
      <div className="text-center py-8">
        <a href="/" className="bg-pink-500 text-white px-6 py-2 rounded hover:bg-pink-600">
          ← Back to Portfolio
        </a>
      </div>
    </div>
  );
}
```

#### Alternative: Event Grid View
```javascript
import { EventGrid } from '../components/SlideshowFactory';

// Show events as clickable grid instead of immediate slideshows
<EventGrid 
  pageAssets={pageAssets}
  onEventSelect={(event) => {
    // Handle event selection
    console.log('Selected event:', event.name);
  }}
/>
```

### Best Practices for Agents

1. **Event Naming**: Use format `"Event Name_MM-DD-YYYY"` (spaces allowed in event names)
2. **Date Accuracy**: Ensure dates are correct as they're used for sorting (newest first)
3. **Asset Management**: Only add images to `assets/` directory (not `public/assets/`)
4. **Server Restart**: Restart dev server after adding new folders for auto-copy
5. **Image Quality**: Maintain consistent quality within events (images display with object-contain)
6. **Performance**: Keep individual events to ~20-50 images max for optimal loading
7. **Testing**: Always test slideshow functionality including autoscroll and fade transitions
8. **Auto-Scroll Settings**: Consider user experience - disable for detailed viewing, enable for ambient display
9. **Photographer Credits**: Use consistent filename format for attribution
   - Format: `"image_name (credit_info).extension"`
   - Example: `"photo_1 (photo- @username).jpg"`
   - **IMPORTANT**: Avoid illegal characters `" : < > | * ? \r \n` (break CI/CD uploads)
   - Use safe alternatives: dash `-`, underscore `_`, or words instead
   - Credit appears as expandable info panel
   - Only shows when credit exists in filename
10. **File Extensions**: Use supported formats: JPG, JPEG, PNG, GIF, WebP

### System Limitations

- **Static Export Only**: No server-side processing in production
- **File-Based**: No database, all content managed through file system
- **Server Restart**: New assets require dev server restart for automatic copying
- **Date Format**: Event dates must follow exact MM-DD-YYYY format for parsing
- **File Size**: Large images may affect loading times (no automatic compression)
- **Browser Compatibility**: Fade transitions require modern browsers with CSS transition support

### Future Enhancement Ideas for Agents

1. **Auto-Thumbnails**: Generate thumbnail versions during build
2. **Lazy Loading**: Implement progressive image loading
3. **Search**: Add search functionality across all events
4. **Filters**: Add date/category filtering
5. **Admin Panel**: Create upload interface for non-technical users
6. **Metadata**: Extract EXIF data for automatic dating/organization

## Quick Reference

### File Locations

**Core Components:**
- **Server Utilities**: `src/utils/assetScanner.js` (Node.js modules)
- **Client Utilities**: `src/utils/eventUtils.js` (client-safe functions)
  - `extractPhotoCredit(filename)`: Parse photographer credit from filename
  - `getCleanImageName(filename)`: Get display name without credit info
- Main Component: `src/components/SlideshowFactory.js`  
- Slideshow Component: `src/components/Slideshow.js`
- Category Page: `src/components/CategoryPage.js`
- Dynamic Pages: `src/pages/[slug].js`

**Testing & Validation:**
- **Asset Validator**: `src/utils/validateAssetsRunner.js` (structure validation utility)
- **CI/CD Workflow**: `/.github/workflows/test-assets.yml` (automated validation)

**Directory Structure:**
- Assets Directory: `assets/[Page]/[Event Name_MM-DD-YYYY]/images...`
- Auto-copied to: `public/assets/[Page]/[Event]/images...`

### URL Pattern
- `assets/Maid Cafe/` → `http://localhost:3000/maidcafe`
- `assets/Brand Collaborations/` → `http://localhost:3000/brandcollaborations`
- `assets/Event Appearances/` → `http://localhost:3000/eventappearances`

### Supported Formats
- **Images**: JPG, JPEG, PNG, GIF, WebP
- **Structure**: 2-level hierarchy (Page → Event → Images)
- **Event Names**: `"Event Name_MM-DD-YYYY"` (spaces allowed, underscore delimiter)
- **Auto-Detection**: Automatic scanning, sorting, and page generation
- **Auto-Copy**: Automatic asset copying from `assets/` to `public/assets/`
- **Features**: Fade transitions, autoscroll, date parsing, full-screen modal, photographer credits
- **Photo Credits**: `"filename (credit_info).extension"` format in image names (use dash instead of colon)
- **Testing**: Integration tests validate all conventions automatically

### NPM Scripts

**Development:**
- `npm run dev` - Start development server with hot reload
- `npm run build` - Build optimized static files for production
- `npm run start` - Start production server (after build)
- `npm run lint` - Check code style and quality

**Testing & Validation:**
- `npm run validate:assets` - Asset structure validation (essential before deploy)
- `npm run prebuild` - Auto-runs validation before build (CI/CD integration)

## 🧪 Testing is Essential

**ALWAYS validate asset structure before deploying!** The slideshow factory's automated scanning depends on strict conventions. The integration test suite catches structural issues that would break slideshow generation.

**Key Testing Principle:** Every asset directory change should be validated with `npm run validate:assets` to ensure:
- Event naming follows `"Event Name_MM-DD-YYYY"` convention  
- Dates are valid and properly formatted
- Only supported image formats are present
- Directory hierarchy is maintained
- Photographer credits are correctly formatted

**CI/CD Integration:** Tests automatically run before builds, preventing broken galleries from being deployed to production.
