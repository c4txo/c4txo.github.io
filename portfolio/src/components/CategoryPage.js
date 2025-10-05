// src/components/CategoryPage.js
import Link from 'next/link';
import NavBar from './NavBar';
import SlideshowFactory from './SlideshowFactory';

export default function CategoryPage({ 
  pageAssets, 
  layout = 'grid', 
  maxColumns = 3, 
  className = 'max-w-7xl mx-auto' 
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar />
      <div className="h-14 sm:h-16" />
      
      <main className="container mx-auto px-4 py-8">
        <SlideshowFactory 
          pageAssets={pageAssets}
          layout={layout}
          maxColumns={maxColumns}
          showTitle={true}
          className={className}
        />
      </main>

      {/* Back to Portfolio Link */}
      <div className="text-center py-8">
        <Link 
          href="/"
          className="inline-block bg-pink-500 text-white px-6 py-2 rounded hover:bg-pink-600 transition-colors"
        >
          ← Back to Portfolio
        </Link>
      </div>
    </div>
  );
}