// src/pages/maidcafe.js
import CategoryPage from '../components/CategoryPage';
import { getPageAssets } from '../utils/assetScanner';

export default function MaidCafe({ pageAssets }) {
  return (
    <CategoryPage 
      pageAssets={pageAssets}
      layout="grid"
      maxColumns={2}
      className="max-w-6xl mx-auto"
    />
  );
}

export async function getStaticProps() {
  // Get assets for "Maid Cafe" page
  const pageAssets = getPageAssets('Maid Cafe');
  
  return {
    props: {
      pageAssets: pageAssets || null
    }
  };
}