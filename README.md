# 3D Interactive Globe with Animated Travel Routes

A React Three Fiber component that renders an interactive 3D globe with animated travel routes connecting locations around the world. Features smooth line animations, pulsing destination dots, responsive design, and a **live configuration panel**.

![Globe Preview](preview.png)

## Features

- 🌍 **Interactive 3D Globe** - Rotate, zoom, and explore
- ✈️ **Animated Travel Routes** - Curved lines that animate from origin to destination
- 📍 **Pulsing Dots** - Visual markers at each location
- 🔄 **Auto-rotation** - Globe continuously rotates
- 📱 **Responsive** - Adapts to different screen sizes
- 🎨 **Live Config Panel** - Real-time color and animation customization
- 📦 **Export to ZIP** - Download configured component for your project

## Demo

Run the project locally:

```bash
yarn install
yarn start
```

## Using the Configuration Panel

When you run the demo, a **Leva control panel** appears in the top-right corner. Use it to customize:

### Available Controls

| Section | Controls |
|---------|----------|
| **Heading** | Edit the two heading lines displayed on screen |
| **Background** | Background color |
| **Globe** | Globe color and opacity |
| **Continents** | Land dot color and size |
| **Travel Lines** | Line color |
| **Dots** | Origin/destination colors and sizes |
| **Animation** | Draw duration, pause time, fade duration |
| **Rotation** | Auto-rotate toggle and speed |
| **Export Project** | Download ZIP with your configuration |

### Exporting Your Configuration

1. Customize all settings using the control panel
2. Edit the heading text to match your needs
3. Expand the **"Export Project"** folder
4. Click **"Download ZIP"**

The ZIP file contains:
- All component files with your color/animation settings baked in
- Your custom heading text
- A README with installation instructions
- Placeholder for the map.png image

## Manual Installation in Your React Project

If you prefer to copy files manually instead of using the export feature:

### 1. Install Required Dependencies

```bash
# Using yarn
yarn add three @react-three/fiber @react-three/drei d3

# Using npm
npm install three @react-three/fiber @react-three/drei d3
```

### 2. Copy Required Files

Copy the following files/folders to your project:

```
src/
├── components/
│   ├── Globe.jsx        # Main globe container
│   ├── Earth.jsx        # Globe sphere
│   ├── Land.jsx         # Continent dots
│   └── Curve.jsx        # Animated travel routes
├── config/
│   └── globeConfig.js   # Configuration values
├── utilities/
│   ├── globe.js         # Helper functions & constants
│   ├── travels.js       # Travel route definitions
│   └── countries.js     # Country coordinates
├── GlobeAnimation.jsx   # Canvas wrapper component
├── HeroSection.jsx      # Hero section with heading
└── HeroSection.css      # Styling

public/
└── images/
    └── map.png          # World map for continent rendering
```

### 3. Basic Usage

```jsx
import GlobeAnimation from './GlobeAnimation';

function App() {
  return (
    <div style={{ width: '100%', height: '100vh' }}>
      <GlobeAnimation />
    </div>
  );
}
```

### 4. With Hero Section Layout

```jsx
import HeroSection from './HeroSection';

function App() {
  return <HeroSection />;
}
```

## Configuration File

The exported `globeConfig.js` contains all customizable settings:

```javascript
export const globeConfig = {
  // Background
  backgroundColor: '#0b1418',
  
  // Globe
  globeColor: '#1c313a',
  globeOpacity: 0.85,
  
  // Continents
  landColor: '#9aaeb6',
  landPointSize: 1,
  
  // Travel lines
  lineColor: '#808080',
  
  // Dots
  originDotColor: '#ffffff',
  destinationDotColor: '#d3d3d3',
  dotSize: 1,
  
  // Animation timing (ms)
  lineDrawDuration: 3500,
  pauseDuration: 2000,
  fadeDuration: 2500,
  
  // Globe behavior
  autoRotate: true,
  autoRotateSpeed: 1,
};
```

## Customizing Travel Routes

Edit `src/utilities/travels.js` to define your own routes:

```javascript
// Simple point-to-point route
{
  name: "New York to London",
  start: { lat: 40.7128, lng: -74.006 },
  end: { lat: 51.5074, lng: -0.1278 },
}

// Multi-stop route
{
  name: "World Tour",
  stops: [
    { lat: 40.7128, lng: -74.006 },   // New York
    { lat: 51.5074, lng: -0.1278 },   // London
    { lat: 35.6762, lng: 139.6503 },  // Tokyo
  ],
}
```

## File Structure Explained

| File | Purpose |
|------|---------|
| `GlobeAnimation.jsx` | Canvas wrapper with responsive zoom handling |
| `HeroSection.jsx` | Hero section with heading and globe |
| `HeroSection.css` | Responsive styling |
| `components/Globe.jsx` | Main container rendering Earth, Land, and Curves |
| `components/Earth.jsx` | The sphere representing the globe |
| `components/Land.jsx` | Renders continent outlines as dots using map.png |
| `components/Curve.jsx` | Animated travel routes with bezier curves |
| `config/globeConfig.js` | Default configuration values |
| `config/GlobeConfigProvider.jsx` | React context for live config (demo only) |
| `config/ExportPanel.jsx` | Export functionality (demo only) |
| `utilities/globe.js` | Coordinate conversion, map loading utilities |
| `utilities/travels.js` | Travel route definitions |
| `utilities/countries.js` | Country coordinate lookup |
| `public/images/map.png` | World map image for land detection |

## Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| `three` | ^0.181.2 | 3D rendering engine |
| `@react-three/fiber` | ^9.4.2 | React renderer for Three.js |
| `@react-three/drei` | ^10.7.7 | Useful helpers (OrbitControls) |
| `d3` | ^7.9.0 | Geographic interpolation for curves |
| `leva` | ^0.10.1 | GUI controls panel (demo only) |
| `jszip` | ^3.10.1 | ZIP file generation (demo only) |
| `file-saver` | ^2.0.5 | File download (demo only) |

**Note:** `leva`, `jszip`, and `file-saver` are only needed for the demo's configuration panel and export feature. The exported component doesn't require these.

## Browser Support

Works in all modern browsers that support WebGL:
- Chrome 56+
- Firefox 51+
- Safari 15+
- Edge 79+

## Performance Tips

1. **Reduce travel routes** - Fewer animated lines = better performance
2. **Lower segment count** - In `Curve.jsx`, reduce `TUBE_SEGMENTS` (default: 44)
3. **Reduce land dots** - In `Land.jsx`, increase the division in the `rows` calculation
4. **Disable auto-rotate** - Remove `autoRotate` from `OrbitControls`

## Troubleshooting

### Globe not rendering
- Ensure `map.png` exists in `public/images/`
- Check browser console for WebGL errors

### Lines flickering
- This version uses ref-based animation state to prevent React re-renders
- Ensure you're using the latest `Curve.jsx` implementation

### Globe distorted on resize
- The `GlobeAnimation.jsx` component remounts the Canvas on resize
- This is intentional to handle orthographic camera updates

## License

MIT

## Credits

Built with [React Three Fiber](https://docs.pmnd.rs/react-three-fiber) and [Three.js](https://threejs.org/)