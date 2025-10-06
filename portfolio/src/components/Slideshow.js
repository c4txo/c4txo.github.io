// src/components/Slideshow.js
import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { formatEventDate, getEventDisplayName, extractPhotoCredit } from '../utils/eventUtils';

function SlideshowContent({ event, className = '', autoScrollInterval = 5000, disableAutoScroll = true, showPhotoCredits = true }) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAutoScrolling, setIsAutoScrolling] = useState(!disableAutoScroll);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [showCredit, setShowCredit] = useState(false);
  const intervalRef = useRef(null);

  const { name, images } = event;
  const currentImage = images[currentImageIndex];

  const nextImage = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
      setIsTransitioning(false);
    }, 300);
  };

  const prevImage = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
      setIsTransitioning(false);
    }, 300);
  };

  const goToImage = (index) => {
    if (isTransitioning || index === currentImageIndex) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentImageIndex(index);
      setIsTransitioning(false);
    }, 300);
  };

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  // Autoscroll functionality
  useEffect(() => {
    if (isAutoScrolling && images.length > 1 && !isModalOpen && !isTransitioning) {
      intervalRef.current = setInterval(() => {
        setIsTransitioning(true);
        setTimeout(() => {
          setCurrentImageIndex((prev) => (prev + 1) % images.length);
          setIsTransitioning(false);
        }, 300);
      }, autoScrollInterval);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isAutoScrolling, images.length, isModalOpen, autoScrollInterval, isTransitioning]);

  // Hide credit panel when image changes
  useEffect(() => {
    setShowCredit(false);
  }, [currentImageIndex]);

  // Pause autoscroll on manual navigation
  const handleManualNavigation = (navigationFn) => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    navigationFn();
    // Resume autoscroll after a brief pause if it was enabled
    if (isAutoScrolling) {
      setTimeout(() => {
        if (isAutoScrolling && !isModalOpen) {
          intervalRef.current = setInterval(() => {
            setIsTransitioning(true);
            setTimeout(() => {
              setCurrentImageIndex((prev) => (prev + 1) % images.length);
              setIsTransitioning(false);
            }, 300);
          }, autoScrollInterval);
        }
      }, 2000); // 2 second pause before resuming
    }
  };

  const toggleAutoScroll = () => {
    setIsAutoScrolling(!isAutoScrolling);
  };

  return (
    <>
      <div className={`bg-white rounded-lg shadow-lg overflow-hidden ${className}`}>
        {/* Event Title */}
        <div className="bg-pink-500 text-white px-4 py-2">
          <h3 className="font-bold text-lg">{getEventDisplayName(name)}</h3>
          {formatEventDate(name) && (
            <p className="text-pink-100 text-sm mb-1">{formatEventDate(name)}</p>
          )}
          <p className="text-pink-100 text-sm">{images.length} photos</p>
        </div>

        {/* Main Image Display */}
        <div className="relative min-h-[300px] max-h-[500px] bg-gray-100 flex items-center justify-center">
          <Image
            src={currentImage.path}
            alt={`${name} - ${currentImage.name}`}
            fill
            className={`object-contain cursor-pointer hover:opacity-90 transition-opacity duration-300 ${
              isTransitioning ? 'opacity-0' : 'opacity-100'
            }`}
            onClick={openModal}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />

          {/* Photo Credit Info Button */}
          {showPhotoCredits && extractPhotoCredit(currentImage.filename) && (
            <button
              onClick={() => setShowCredit(!showCredit)}
              className="absolute top-3 right-3 bg-black/60 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm hover:bg-black/80 transition-colors z-10"
              aria-label="Photo credit information"
            >
              ⓘ
            </button>
          )}

          {/* Expandable Credit Panel */}
          {showPhotoCredits && showCredit && extractPhotoCredit(currentImage.filename) && (
            <div className="absolute top-12 right-3 bg-black/90 text-white px-3 py-2 rounded-lg text-sm max-w-64 z-20 shadow-lg">
              <div>{extractPhotoCredit(currentImage.filename)}</div>
            </div>
          )}
          
          {/* Navigation Arrows */}
          {images.length > 1 && (
            <>
              <button
                onClick={() => handleManualNavigation(prevImage)}
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
                aria-label="Previous image"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={() => handleManualNavigation(nextImage)}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
                aria-label="Next image"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </>
          )}

          {/* Autoscroll Control */}
          {images.length > 1 && (
            <button
              onClick={toggleAutoScroll}
              className="absolute bottom-2 left-2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
              aria-label={isAutoScrolling ? 'Pause slideshow' : 'Play slideshow'}
            >
              {isAutoScrolling ? (
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              )}
            </button>
          )}

          {/* Image Counter */}
          <div className="absolute bottom-2 right-2 bg-black/50 text-white px-2 py-1 rounded text-sm">
            {currentImageIndex + 1} / {images.length}
          </div>
        </div>

        {/* Thumbnail Strip */}
        {images.length > 1 && (
          <div className="p-3 bg-gray-50">
            <div className="flex gap-2 overflow-x-auto pb-2">
              {images.map((image, index) => (
                <button
                  key={image.filename}
                  onClick={() => handleManualNavigation(() => goToImage(index))}
                  className={`flex-shrink-0 relative w-16 h-16 rounded overflow-hidden border-2 transition-colors ${
                    index === currentImageIndex 
                      ? 'border-pink-500' 
                      : 'border-gray-200 hover:border-pink-300'
                  }`}
                >
                  <Image
                    src={image.path}
                    alt={`${name} thumbnail ${index + 1}`}
                    fill
                    className="object-contain"
                    sizes="64px"
                  />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Full Screen Modal */}
      {isModalOpen && (
        <div 
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={closeModal}
        >
          <div className="relative max-w-7xl max-h-full">
            {/* Close Button */}
            <button
              onClick={closeModal}
              className="absolute -top-12 right-0 text-white text-2xl hover:text-pink-300 z-10"
              aria-label="Close modal"
            >
              ✕
            </button>

            {/* Full Size Image */}
            <div className="relative max-h-[90vh] max-w-[90vw]">
              <Image
                src={currentImage.path}
                alt={`${name} - ${currentImage.name}`}
                width={1200}
                height={800}
                className="max-h-[90vh] max-w-[90vw] object-contain"
                onClick={(e) => e.stopPropagation()}
              />
            </div>

            {/* Modal Navigation */}
            {images.length > 1 && (
              <>
                <button
                  onClick={(e) => { e.stopPropagation(); handleManualNavigation(prevImage); }}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 text-white p-3 rounded-full hover:bg-black/70 transition-colors"
                  aria-label="Previous image"
                >
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); handleManualNavigation(nextImage); }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 text-white p-3 rounded-full hover:bg-black/70 transition-colors"
                  aria-label="Next image"
                >
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </>
            )}

            {/* Modal Image Counter */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white px-4 py-2 rounded text-lg">
              {currentImageIndex + 1} / {images.length}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default function Slideshow({ event, className = '', autoScrollInterval = 5000, disableAutoScroll = true, showPhotoCredits = true }) {
  // Early return before any hooks to satisfy ESLint rules-of-hooks
  if (!event || !event.images || event.images.length === 0) {
    return null;
  }

  return (
    <SlideshowContent 
      event={event} 
      className={className} 
      autoScrollInterval={autoScrollInterval}
      disableAutoScroll={disableAutoScroll}
      showPhotoCredits={showPhotoCredits}
    />
  );
}