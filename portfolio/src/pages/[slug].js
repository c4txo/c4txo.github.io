// src/pages/[slug].js
import CategoryPage from '../components/CategoryPage';
import NavBar from '../components/NavBar';
import { getAllPageSlugs, getPageAssets, slugToPageName } from '../utils/assetScanner';

export default function DynamicPage({ pageAssets, pageName, slug }) {
  if (!pageAssets) {
    return (
      <div className="min-h-screen bg-gray-50">
        <NavBar />
        <div className="h-14 sm:h-16" />
        
        <main className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-3xl font-bold text-gray-600 mb-4">Page Not Found</h1>
          <p className="text-gray-500 mb-8">
            No assets found for "{slug}". Make sure you have photos in the assets directory.
          </p>
          
          <a 
            href="/"
            className="inline-block bg-pink-500 text-white px-6 py-2 rounded hover:bg-pink-600 transition-colors"
          >
            ← Back to Portfolio
          </a>
        </main>
      </div>
    );
  }

  return (
    <CategoryPage 
      pageAssets={pageAssets}
      layout="grid"
      maxColumns={3}
      className="max-w-7xl mx-auto"
    />
  );
}

export async function getStaticPaths() {
  const slugs = getAllPageSlugs();
  
  return {
    paths: slugs.map(slug => ({ params: { slug } })),
    fallback: false
  };
}

export async function getStaticProps({ params }) {
  const pageName = slugToPageName(params.slug);
  const pageAssets = pageName ? getPageAssets(pageName) : null;
  
  return {
    props: {
      pageAssets,
      pageName,
      slug: params.slug
    }
  };
}