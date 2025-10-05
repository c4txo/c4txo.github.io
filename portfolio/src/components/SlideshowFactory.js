// src/components/SlideshowFactory.js
import Image from 'next/image';
import Slideshow from './Slideshow';
import { formatEventDate, getEventDisplayName } from '../utils/eventUtils';

/**
 * SlideshowFactory - Dynamically creates slideshows based on page assets
 * @param {Object} pageAssets - Assets data for the page from assetScanner
 * @param {string} layout - Layout style: 'grid', 'stack', or 'masonry'
 * @param {string} className - Additional CSS classes
 */
export default function SlideshowFactory({ 
  pageAssets, 
  layout = 'grid', 
  className = '',
  showTitle = true,
  maxColumns = 3
}) {
  if (!pageAssets || !pageAssets.events || Object.keys(pageAssets.events).length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500 text-lg mb-2">No events found</div>
        <div className="text-gray-400 text-sm">
          Add photos to the assets/{pageAssets?.name || 'page'} directory to see slideshows here.
        </div>
      </div>
    );
  }

  const events = Object.values(pageAssets.events);

  const getLayoutClasses = () => {
    switch (layout) {
      case 'stack':
        return 'flex flex-col gap-8';
      case 'masonry':
        return 'columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6';
      case 'grid':
      default:
        const colClasses = {
          1: 'grid-cols-1',
          2: 'grid-cols-1 md:grid-cols-2',
          3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
          4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
        };
        return `grid ${colClasses[Math.min(maxColumns, 4)]} gap-6`;
    }
  };

  return (
    <div className={`w-full ${className}`}>
      {/* Page Title */}
      {showTitle && (
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-pink-600 mb-2">{pageAssets.name}</h1>
          <p className="text-gray-600">
            {events.length} event{events.length !== 1 ? 's' : ''} • {' '}
            {events.reduce((total, event) => total + event.count, 0)} photos total
          </p>
        </div>
      )}

      {/* Events Grid/Layout */}
      <div className={getLayoutClasses()}>
        {events.map((event) => (
          <div 
            key={event.name} 
            className={layout === 'masonry' ? 'break-inside-avoid' : ''}
          >
            <Slideshow 
              event={event} 
              className={layout === 'stack' ? 'max-w-2xl mx-auto' : ''}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * EventGrid - Alternative component for displaying events as a grid of covers
 */
export function EventGrid({ 
  pageAssets, 
  onEventSelect,
  className = '',
  showTitle = true 
}) {
  if (!pageAssets || !pageAssets.events || Object.keys(pageAssets.events).length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500 text-lg mb-2">No events found</div>
        <div className="text-gray-400 text-sm">
          Add photos to see events here.
        </div>
      </div>
    );
  }

  const events = Object.values(pageAssets.events);

  return (
    <div className={`w-full ${className}`}>
      {showTitle && (
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-pink-600 mb-2">{pageAssets.name}</h1>
          <p className="text-gray-600">Choose an event to view photos</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.map((event) => (
          <div 
            key={event.name}
            onClick={() => onEventSelect && onEventSelect(event)}
            className="bg-white rounded-lg shadow-lg overflow-hidden cursor-pointer hover:shadow-xl transition-shadow"
          >
            <div className="relative aspect-[4/3] bg-gray-100 flex items-center justify-center">
              <Image
                src={event.coverImage.path}
                alt={`${event.name} cover`}
                fill
                className="object-contain"
              />
              <div className="absolute inset-0 bg-black/20 hover:bg-black/10 transition-colors" />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                <h3 className="text-white font-bold text-lg">{getEventDisplayName(event.name)}</h3>
                {formatEventDate(event.name) && (
                  <p className="text-white/90 text-sm mb-1">{formatEventDate(event.name)}</p>
                )}
                <p className="text-white/80 text-sm">{event.count} photos</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}