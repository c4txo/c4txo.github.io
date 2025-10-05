# Cat's Portfolio Website

A modern, dynamic portfolio website built with Next.js featuring an intelligent slideshow factory system for showcasing photography and event galleries. Fully supports agentic development.

## Key Features

- **Dynamic Slideshow Factory**: Automatically generates photo galleries from asset directory structure
- **Static Site Generation**: Fast, SEO-friendly pages with Next.js
- **Automatic Asset Management**: Seamless copying of assets to public directory
- **File-Based Content**: No database required - content managed through file structure

## Tech Stack

- **Frontend**: Next.js 15.3.4, React 19, Tailwind CSS 4
- **Deployment**: GitHub Pages with static export
- **Asset Management**: Automated copying system
- **Routing**: Dynamic page generation based on portfolio categories

## Project Structure

```
portfolio/
├── src/
│   ├── components/          # React components
│   │   ├── SlideshowFactory.js  # Main slideshow system
│   │   ├── Slideshow.js         # Individual slideshow component
│   │   └── CategoryPage.js      # Reusable page template
│   ├── pages/               # Next.js pages and routing
│   └── utils/               # Utility functions
├── assets/                  # Source images (organized by category/event)
├── public/                  # Static assets (auto-generated)
└── agents_dev.md           # Comprehensive development guide
```

## How It Works

1. **Content Organization**: Photos are organized in `assets/[Category]/[Event Name_MM-DD-YYYY]/`
2. **Automatic Processing**: The system scans the asset directory and generates metadata
3. **Dynamic Pages**: Each category gets its own page with multiple event slideshows
4. **Sorting**: Events are sorted by date (newest first) with intelligent parsing

## For AI Agents & Developers

**Important**: This project includes a comprehensive development guide specifically designed for AI agents and developers.

👉 **Please refer to [`agents_dev.md`](./portfolio/agents_dev.md) for detailed development instructions, architecture explanations, troubleshooting guides, and best practices.**

The agents development guide contains:
- Complete system architecture documentation
- Step-by-step development workflows  
- Code examples and patterns
- Troubleshooting and debugging guides
- Best practices for extending the system
- Asset management workflows
- Deployment procedures

## Quick Start

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Add Content**: Place images in `assets/[Category]/[Event Name_MM-DD-YYYY]/`

3. **Start Development**:
   ```bash
   npm run dev
   ```

4. **Build for Production**:
   ```bash
   npm run build
   npm run export
   ```

## Portfolio Categories

The website dynamically supports any portfolio categories you create in the assets directory. Current categories may include:
- Maid Cafe events
- Photoshoots
- Conventions
- Cosplay galleries
- And more...

## Live Site

Visit the live portfolio at: [c4txo.github.io](https://c4txo.github.io)

## License

This project is for Cat's personal portfolio. Please respect the content and photography.

---

## TODOs

Slideshows need to be added to the following:

[x] Maid Cafe
[] Fashion
[] Brand Collaborations
[] Event Appearances
[] Fashion
