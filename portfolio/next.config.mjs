import fs from 'fs';
import path from 'path';

// Copy assets to public directory for static export
function copyAssetsToPublic() {
  const assetsDir = path.join(process.cwd(), 'assets');
  const publicAssetsDir = path.join(process.cwd(), 'public', 'assets');
  
  if (fs.existsSync(assetsDir)) {
    // Remove existing public/assets to ensure clean copy
    if (fs.existsSync(publicAssetsDir)) {
      fs.rmSync(publicAssetsDir, { recursive: true, force: true });
    }
    
    // Create fresh directory
    fs.mkdirSync(publicAssetsDir, { recursive: true });
    
    // Copy directory recursively
    function copyDir(src, dest) {
      if (!fs.existsSync(dest)) {
        fs.mkdirSync(dest, { recursive: true });
      }
      
      const entries = fs.readdirSync(src, { withFileTypes: true });
      
      for (const entry of entries) {
        const srcPath = path.join(src, entry.name);
        const destPath = path.join(dest, entry.name);
        
        if (entry.isDirectory()) {
          copyDir(srcPath, destPath);
        } else {
          fs.copyFileSync(srcPath, destPath);
        }
      }
    }
    
    copyDir(assetsDir, publicAssetsDir);
    console.log('✅ Assets copied to public directory');
  } else {
    console.log('⚠️  Assets directory not found');
  }
}

// Always run the copy function when config loads
copyAssetsToPublic();

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
