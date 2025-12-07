# 3D Interactive Globe with Animated Travel Routes

A React Three Fiber component that renders an interactive 3D globe with animated travel routes connecting locations around the world. Features smooth line animations, pulsing destination dots, and responsive design.

![Globe Preview](preview.png)

## Features

- 🌍 **Interactive 3D Globe** - Rotate, zoom, and explore
- ✈️ **Animated Travel Routes** - Curved lines that animate from origin to destination
- 📍 **Pulsing Dots** - Visual markers at each location
- 🔄 **Auto-rotation** - Globe continuously rotates
- 📱 **Responsive** - Adapts to different screen sizes
- 🎨 **Customizable** - Easy to modify colors, routes, and styling

## Demo

Run the project locally:

```bash
yarn install
yarn start
```

## Installation in Your React Project

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
├── utilities/
│   ├── globe.js         # Helper functions & constants
│   ├── travels.js       # Travel route definitions
│   └── countries.js     # Country coordinates
└── GlobeAnimation.jsx   # Canvas wrapper component

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
import GlobeAnimation from './GlobeAnimation';
import './HeroSection.css';

function HeroSection() {
  return (
    <section className="hero-container">
      <div className="text-container">
        <h1 className="hero-text">
          <span>LOCAL FOCUS</span>
          <span>GLOBAL PRESENCE</span>
        </h1>
      </div>
      <div className="globe-container">
        <GlobeAnimation />
      </div>
    </section>
  );
}
```

## Configuration

### Customizing Travel Routes

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

### Customizing Colors

#### Globe (Earth.jsx)
```jsx
<meshBasicMaterial
  color="rgb(28,49,58)"    // Globe fill color
  opacity="0.85"
  transparent={true}
/>
```

#### Continents (Land.jsx)
```jsx
<pointsMaterial 
  size={1} 
  color="rgb(154,174,182)"  // Land dot color
/>
```

#### Travel Lines (Curve.jsx)
```jsx
<meshBasicMaterial
  color="grey"              // Line color
  transparent
/>
```

#### Destination Dots (Curve.jsx)
```jsx
<meshBasicMaterial
  color={index === 0 ? "white" : "lightgrey"}  // Origin vs destination
  transparent
/>
```

#### Background (HeroSection.css)
```css
.hero-container {
  background-color: rgb(11, 20, 24);
}
```

### Customizing Globe Settings

#### Globe Radius (utilities/globe.js)
```javascript
const RADIUS = 80;  // Adjust globe size
```

#### Camera Zoom (GlobeAnimation.jsx)
```javascript
const getZoom = (width) => {
  if (width < 576) return 3;    // Mobile
  if (width < 768) return 3;    // Tablet
  if (width < 992) return 3.5;  // Small desktop
  if (width < 1400) return 4;   // Desktop
  return 4.5;                   // Large desktop
};
```

#### Animation Timing (Curve.jsx)
```javascript
const duration = 3500;  // Line drawing duration (ms)
// In 'pausing' phase:
state.animationStartTime = now + 2000;  // Pause before fade (ms)
// In 'fading' phase:
const duration = 2500;  // Fade out duration (ms)
```

## File Structure Explained

| File | Purpose |
|------|---------|
| `GlobeAnimation.jsx` | Canvas wrapper with responsive zoom handling |
| `components/Globe.jsx` | Main container rendering Earth, Land, and Curves |
| `components/Earth.jsx` | The sphere representing the globe |
| `components/Land.jsx` | Renders continent outlines as dots using map.png |
| `components/Curve.jsx` | Animated travel routes with bezier curves |
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