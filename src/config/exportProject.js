import JSZip from 'jszip';
import { saveAs } from 'file-saver';

// Source file contents - these will be bundled
import { defaultConfig } from './globeConfig';

// File templates
const templates = {
  'src/config/globeConfig.js': (config) => `// Globe Configuration
// Generated from 3D Globe Demo - ${new Date().toISOString().split('T')[0]}

export const globeConfig = ${JSON.stringify(config, null, 2)};
`,

  'src/components/Earth.jsx': () => `import React from "react";
import { RADIUS, ROTATION } from "../utilities/globe";
import { globeConfig } from "../config/globeConfig";

const Earth = () => {
  const { globeColor, globeOpacity } = globeConfig;

  return (
    <mesh rotation={ROTATION} name="earth">
      <sphereGeometry args={[RADIUS, 64, 64]} />
      <meshBasicMaterial
        color={globeColor}
        opacity={globeOpacity}
        transparent={true}
        dithering={true}
      />
    </mesh>
  );
};

export default Earth;
`,

  'src/components/Land.jsx': () => `import React, { useEffect, useRef } from "react";
import {
  loadMap,
  getImageData,
  visibilityForCoordinate,
  polar2Cartesian,
  ROTATION,
} from "../utilities/globe";
import { BufferAttribute } from "three";
import { globeConfig } from "../config/globeConfig";

const Land = () => {
  const geometryRef = useRef();
  const { landColor, landPointSize } = globeConfig;

  useEffect(() => {
    const load = async () => {
      const image = await loadMap();
      const imageData = getImageData(image);

      const vertices = [];
      const D2R = Math.PI / 180;
      const rows = 200;
      for (let lat = -90; lat <= 90; lat += 180 / rows) {
        const t = Math.cos(Math.abs(lat) * D2R) * 25 * Math.PI * 2 * 2;
        for (let r = 0; r < t; r++) {
          const lng = (360 * r) / t - 180;
          if (!visibilityForCoordinate(lng, lat, imageData)) continue;

          const c = polar2Cartesian(lat, lng);
          vertices.push(c.x, c.y, c.z);
        }
      }
      
      if (geometryRef.current) {
        const positions = new Float32Array(vertices);
        geometryRef.current.setAttribute('position', new BufferAttribute(positions, 3));
      }
    };

    load();
  }, []);

  return (
    <points rotation={ROTATION} name="land">
      <bufferGeometry ref={geometryRef} />
      <pointsMaterial size={landPointSize} color={landColor} />
    </points>
  );
};

export default Land;
`,

  'src/components/Globe.jsx': () => `import React from "react";
import { OrbitControls } from "@react-three/drei";

import Earth from "./Earth";
import Land from "./Land";
import Curve from "./Curve";

import { travels } from "../utilities/travels";
import { globeConfig } from "../config/globeConfig";

const Globe = () => {
  const { autoRotate, autoRotateSpeed } = globeConfig;

  return (
    <>
      {travels.map((travel) => {
        return <Curve key={travel.name} travel={travel} />;
      })}
      <Land />
      <Earth />

      <OrbitControls 
        enableRotate 
        autoRotate={autoRotate} 
        autoRotateSpeed={autoRotateSpeed} 
      />
    </>
  );
};

export default Globe;
`,

  'src/components/Curve.jsx': () => `/* eslint-disable react-hooks/exhaustive-deps */
import React, { useMemo, useRef, useEffect } from "react";
import { CubicBezierCurve3 } from "three";
import { RADIUS, toVector, ROTATION } from "../utilities/globe";
import { geoInterpolate } from "d3";
import { useFrame } from "@react-three/fiber";
import { globeConfig } from "../config/globeConfig";

const TUBE_SEGMENTS = 44;
const RADIAL_SEGMENTS = 8;
const TOTAL_DRAW_COUNT = TUBE_SEGMENTS * RADIAL_SEGMENTS * 6;

const Curve = ({ travel }) => {
  const { 
    lineColor, 
    originDotColor, 
    destinationDotColor, 
    dotSize,
    lineDrawDuration,
    pauseDuration,
    fadeDuration 
  } = globeConfig;

  const stateRef = useRef({
    currentSegment: -1,
    dotsVisible: [],
    opacity: 1,
    phase: 'waiting',
    animationStartTime: null,
    segmentStartTime: null,
    initialized: false,
  });
  
  const geometries = useRef([]);
  const materialsRef = useRef([]);
  const curveMeshesRef = useRef([]);
  const dotMaterialsRef = useRef([]);
  const dotMeshesRef = useRef([]);

  const curves = useMemo(() => {
    if (!travel.stops || travel.stops.length < 2) {
      const startXYZ = toVector(travel.start.lat, travel.start.lng, RADIUS);
      const endXYZ = toVector(travel.end.lat, travel.end.lng, RADIUS);

      const d3Interpolate = geoInterpolate(
        [travel.start.lng, travel.start.lat],
        [travel.end.lng, travel.end.lat]
      );
      const c1 = d3Interpolate(0.3);
      const c2 = d3Interpolate(0.7);

      const arcHeight = startXYZ.distanceTo(endXYZ) * 0.4 + RADIUS;
      const controlXYZ1 = toVector(c1[1], c1[0], arcHeight);
      const controlXYZ2 = toVector(c2[1], c2[0], arcHeight);

      return [new CubicBezierCurve3(startXYZ, controlXYZ1, controlXYZ2, endXYZ)];
    }

    const segments = [];
    for (let i = 0; i < travel.stops.length - 1; i++) {
      const start = travel.stops[i];
      const end = travel.stops[i + 1];

      const startXYZ = toVector(start.lat, start.lng, RADIUS);
      const endXYZ = toVector(end.lat, end.lng, RADIUS);

      const d3Interpolate = geoInterpolate([start.lng, start.lat], [end.lng, end.lat]);
      const c1 = d3Interpolate(0.3);
      const c2 = d3Interpolate(0.7);

      const arcHeight = startXYZ.distanceTo(endXYZ) * 0.4 + RADIUS;
      const controlXYZ1 = toVector(c1[1], c1[0], arcHeight);
      const controlXYZ2 = toVector(c2[1], c2[0], arcHeight);

      segments.push(new CubicBezierCurve3(startXYZ, controlXYZ1, controlXYZ2, endXYZ));
    }
    return segments;
  }, [travel]);

  const startPoints = useMemo(() => {
    if (travel.stops && travel.stops.length > 1) {
      return travel.stops.map((stop) => {
        const p = toVector(stop.lat, stop.lng, RADIUS);
        return [p.x, p.y, p.z];
      });
    } else {
      const p = toVector(travel.start.lat, travel.start.lng, RADIUS);
      const endP = toVector(travel.end.lat, travel.end.lng, RADIUS);
      return [[p.x, p.y, p.z], [endP.x, endP.y, endP.z]];
    }
  }, [travel]);

  useEffect(() => {
    const state = stateRef.current;
    const numDots = startPoints.length;
    state.dotsVisible = [1, ...Array(numDots - 1).fill(0)];
    state.currentSegment = -1;
    state.opacity = 1;
    state.phase = 'waiting';
    state.animationStartTime = Date.now() + Math.random() * 3000;
    state.initialized = true;
    
    geometries.current.forEach((geo) => {
      if (geo) geo.setDrawRange(0, 0);
    });
  }, [travel, startPoints.length]);

  useFrame(() => {
    const state = stateRef.current;
    if (!state.initialized) return;

    const now = Date.now();

    switch (state.phase) {
      case 'waiting':
        if (now >= state.animationStartTime) {
          state.phase = 'drawing';
          state.currentSegment = 0;
          state.segmentStartTime = now;
        }
        break;

      case 'drawing': {
        const elapsed = now - state.segmentStartTime;
        const duration = lineDrawDuration;
        const progress = Math.min(elapsed / duration, 1);
        const segmentIndex = state.currentSegment;

        const geometry = geometries.current[segmentIndex];
        if (geometry) {
          geometry.setDrawRange(0, Math.floor(progress * TOTAL_DRAW_COUNT));
        }

        if (progress >= 1) {
          state.dotsVisible[segmentIndex + 1] = 1;

          if (segmentIndex >= curves.length - 1) {
            state.phase = 'pausing';
            state.animationStartTime = now + pauseDuration;
          } else {
            state.currentSegment++;
            state.segmentStartTime = now + 50;
          }
        }
        break;
      }

      case 'pausing':
        if (now >= state.animationStartTime) {
          state.phase = 'fading';
          state.animationStartTime = now;
          state.dotsVisible = state.dotsVisible.map(() => -1);
        }
        break;

      case 'fading': {
        const elapsed = now - state.animationStartTime;
        const duration = fadeDuration;
        const progress = Math.min(elapsed / duration, 1);
        const newOpacity = 1 - progress;
        state.opacity = newOpacity;

        materialsRef.current.forEach((mat) => {
          if (mat) mat.opacity = newOpacity;
        });

        state.dotsVisible = state.dotsVisible.map((v) => {
          if (v === -1 || v > 0) return Math.max(0, 1 - progress);
          return 0;
        });

        if (progress >= 1) {
          state.currentSegment = -1;
          state.opacity = 1;
          state.dotsVisible = [1, ...Array(startPoints.length - 1).fill(0)];
          state.phase = 'waiting';
          state.animationStartTime = now + 500 + Math.random() * 3000;

          geometries.current.forEach((geo) => {
            if (geo) geo.setDrawRange(0, 0);
          });

          materialsRef.current.forEach((mat) => {
            if (mat) mat.opacity = 1;
          });
        }
        break;
      }
      default:
        break;
    }

    curveMeshesRef.current.forEach((mesh, index) => {
      if (mesh) {
        mesh.visible = index <= state.currentSegment;
      }
    });

    dotMaterialsRef.current.forEach((mat, index) => {
      if (mat) {
        const visibility = state.dotsVisible[index] || 0;
        mat.opacity = Math.max(0, visibility);
      }
    });

    dotMeshesRef.current.forEach((mesh, index) => {
      if (mesh) {
        const visibility = state.dotsVisible[index] || 0;
        const baseScale = Math.max(0, visibility);
        const pulseScale = visibility >= 1 ? 1 + 0.35 * Math.sin(now * 0.005) : 1;
        const finalScale = baseScale * pulseScale;
        mesh.scale.set(finalScale, finalScale, finalScale);
      }
    });
  });

  return (
    <>
      {curves.map((curve, index) => (
        <mesh
          rotation={ROTATION}
          key={\`curve-\${travel.name}-\${index}\`}
          visible={false}
          ref={(el) => {
            if (el) curveMeshesRef.current[index] = el;
          }}
        >
          <tubeGeometry
            args={[curve, TUBE_SEGMENTS, 0.2, RADIAL_SEGMENTS]}
            ref={(el) => {
              if (el) {
                geometries.current[index] = el;
                el.setDrawRange(0, 0);
              }
            }}
          />
          <meshBasicMaterial
            color={lineColor}
            transparent
            ref={(el) => {
              if (el) materialsRef.current[index] = el;
            }}
          />
        </mesh>
      ))}

      {startPoints.map((point, index) => (
        <mesh rotation={ROTATION} key={\`dot-wrapper-\${travel.name}-\${index}\`}>
          <mesh
            position={point}
            ref={(el) => {
              if (el) dotMeshesRef.current[index] = el;
            }}
          >
            <sphereGeometry args={[dotSize, 15, 15]} />
            <meshBasicMaterial
              color={index === 0 ? originDotColor : destinationDotColor}
              transparent
              ref={(el) => {
                if (el) dotMaterialsRef.current[index] = el;
              }}
            />
          </mesh>
        </mesh>
      ))}
    </>
  );
};

export default Curve;
`,

  'src/utilities/globe.js': () => `import { Vector3 } from "three";

const RADIUS = 80;

const visibilityForCoordinate = (t, e, n) => {
  const i = 4 * n.width,
    r = parseInt(((t + 180) / 360) * n.width + 0.5),
    s = n.height - parseInt(((e + 90) / 180) * n.height - 0.5),
    o = parseInt(i * (s - 1) + 4 * r) + 3;
  return n.data[o] > 90;
};

const getImageData = (t) => {
  const e = document.createElement("canvas").getContext("2d");
  return (
    (e.canvas.width = t.width),
    (e.canvas.height = t.height),
    e.drawImage(t, 0, 0, t.width, t.height),
    e.getImageData(0, 0, t.width, t.height)
  );
};

const loadMap = () =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.addEventListener("load", () => resolve(img));
    img.addEventListener("error", (err) => reject(err));
    img.src = \`\${process.env.PUBLIC_URL}/images/map.png\`;
  });

const polar2Cartesian = (lat, lng, rad = RADIUS, relAltitude = 0.005) => {
  const phi = ((90 - lat) * Math.PI) / 180;
  const theta = ((90 - lng) * Math.PI) / 180;
  const r = rad * (1 + relAltitude);
  return {
    x: r * Math.sin(phi) * Math.cos(theta),
    y: r * Math.cos(phi),
    z: r * Math.sin(phi) * Math.sin(theta),
  };
};

const toVector = (lat, lng, rad, relAltitude = 0) => {
  const c = polar2Cartesian(lat, lng, rad, relAltitude);
  return new Vector3(c.x, c.y, c.z);
};

const date = new Date();
const timeZoneOffset = date.getTimezoneOffset() || 0;
const timeZoneMaxOffset = 60 * 12;
const ROTATION = [0, Math.PI * (timeZoneOffset / timeZoneMaxOffset), 0];

export {
  RADIUS,
  visibilityForCoordinate,
  getImageData,
  loadMap,
  polar2Cartesian,
  toVector,
  ROTATION,
};
`,

  'src/utilities/travels.js': (travels) => `// Travel Routes Configuration
// Customize these routes for your needs

const pointOfOrigin = { lat: 57.70887, lng: 11.97456 }; // Gothenburg, Sweden

export const travels = ${JSON.stringify(travels, null, 2)};
`,

  'src/GlobeAnimation.jsx': () => `import React, { useRef, useEffect, useState } from "react";
import Globe from "./components/Globe";
import { Canvas } from "@react-three/fiber";

const getZoom = (width) => {
  if (width < 576) return 3;
  if (width < 768) return 3;
  if (width < 992) return 3.5;
  if (width < 1400) return 4;
  return 4.5;
};

const GlobeAnimation = () => {
  const containerRef = useRef();
  const [key, setKey] = useState(0);
  const [zoom, setZoom] = useState(getZoom(window.innerWidth));

  useEffect(() => {
    let resizeTimeout;
    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        setZoom(getZoom(window.innerWidth));
        setKey(prev => prev + 1);
      }, 150);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(resizeTimeout);
    };
  }, []);

  return (
    <div ref={containerRef} style={{ width: '100%', height: '100%' }}>
      <Canvas
        key={key}
        orthographic
        camera={{ position: [150, 200, 200], zoom: zoom }}
        style={{ background: "transparent" }}
      >
        <Globe />
      </Canvas>
    </div>
  );
};

export default GlobeAnimation;
`,

  'src/HeroSection.jsx': (heading, config) => `import React from "react";
import GlobeAnimation from "./GlobeAnimation";
import "./HeroSection.css";

const HeroSection = () => {
  return (
    <div className="hero-container" style={{ backgroundColor: '${config.backgroundColor}' }}>
      <div className="text-container">
${heading.split('\n').map(line => `        <h1 className="hero-text">${line}</h1>`).join('\n')}
      </div>
      <div className="globe-container">
        <GlobeAnimation />
      </div>
    </div>
  );
};

export default HeroSection;
`,

  'src/HeroSection.css': () => `@import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700&display=swap');

.hero-container {
  position: relative;
  height: 100vh;
  width: 100vw;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: flex-start;
}

.globe-container {
  position: absolute;
  top: 50%;
  right: -10%;
  transform: translateY(-50%);
  width: 80%;
  aspect-ratio: 1 / 1;
}

.text-container {
  position: relative;
  z-index: 10;
  padding-left: 5%;
  max-width: 45%;
}

.hero-text {
  font-family: 'Orbitron', sans-serif;
  font-size: clamp(2rem, 5vw, 4rem);
  font-weight: 700;
  color: white;
  text-transform: uppercase;
  margin: 0;
  line-height: 1.1;
}

/* Tablet */
@media (max-width: 992px) {
  .globe-container {
    width: 85%;
    right: -15%;
  }
  
  .text-container {
    max-width: 50%;
  }
}

/* Mobile */
@media (max-width: 576px) {
  .hero-container {
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
  }

  .text-container {
    padding-top: 0;
    padding-left: 5%;
    max-width: 55%;
  }

  .hero-text {
    font-size: clamp(1.3rem, 7vw, 2rem);
  }

  .globe-container {
    top: 50%;
    bottom: auto;
    right: -40%;
    transform: translateY(-50%);
    width: 100%;
  }
}
`,

  'README.md': (heading, config) => `# 3D Globe Component

Generated from 3D Globe Demo on ${new Date().toISOString().split('T')[0]}

## Installation

1. Install dependencies:

\`\`\`bash
# Using yarn
yarn add three @react-three/fiber @react-three/drei d3

# Using npm  
npm install three @react-three/fiber @react-three/drei d3
\`\`\`

2. Copy the following folders to your project's \`src\` directory:
   - \`components/\`
   - \`utilities/\`
   - \`config/\`
   - \`GlobeAnimation.jsx\`
   - \`HeroSection.jsx\`
   - \`HeroSection.css\`

3. Copy \`public/images/map.png\` to your project's public folder.

## Usage

\`\`\`jsx
import HeroSection from './HeroSection';

function App() {
  return <HeroSection />;
}
\`\`\`

## Configuration

Edit \`src/config/globeConfig.js\` to customize colors and animations:

\`\`\`javascript
export const globeConfig = ${JSON.stringify(config, null, 2)};
\`\`\`

## Customize Routes

Edit \`src/utilities/travels.js\` to add your own travel routes.

## Current Heading

${heading.split('\n').map(line => `- ${line}`).join('\n')}
`,
};

// Countries data (abbreviated for export)
const countriesData = `export const countries = {
  fl: ["27.9506", "-82.4572"],
  ad: ["42.5000", "1.5000"],
  ae: ["24.0000", "54.0000"],
  af: ["33.0000", "65.0000"],
  ag: ["17.0500", "-61.8000"],
  al: ["41.0000", "20.0000"],
  ar: ["-34.0000", "-64.0000"],
  at: ["47.3333", "13.3333"],
  au: ["-27.0000", "133.0000"],
  be: ["50.8333", "4.0000"],
  br: ["-10.0000", "-55.0000"],
  ca: ["54.0000", "-100.0000"],
  ch: ["47.0000", "8.0000"],
  cn: ["35.0000", "105.0000"],
  de: ["51.0000", "9.0000"],
  dk: ["56.0000", "10.0000"],
  eg: ["27.0000", "30.0000"],
  es: ["40.0000", "-4.0000"],
  fi: ["64.0000", "26.0000"],
  fr: ["46.0000", "2.0000"],
  gb: ["54.0000", "-2.0000"],
  gr: ["39.0000", "22.0000"],
  hk: ["22.2500", "114.1667"],
  id: ["-5.0000", "120.0000"],
  ie: ["53.0000", "-8.0000"],
  il: ["31.5000", "34.7500"],
  in: ["20.0000", "77.0000"],
  it: ["42.8333", "12.8333"],
  jp: ["36.0000", "138.0000"],
  kr: ["37.0000", "127.5000"],
  mx: ["23.0000", "-102.0000"],
  nl: ["52.5000", "5.7500"],
  no: ["62.0000", "10.0000"],
  nz: ["-41.0000", "174.0000"],
  pl: ["52.0000", "20.0000"],
  pt: ["39.5000", "-8.0000"],
  ru: ["60.0000", "100.0000"],
  se: ["62.0000", "15.0000"],
  sg: ["1.3667", "103.8000"],
  th: ["15.0000", "100.0000"],
  tr: ["39.0000", "35.0000"],
  ua: ["49.0000", "32.0000"],
  us: ["38.0000", "-97.0000"],
  za: ["-29.0000", "24.0000"],
};
`;

export const exportProject = async (config, heading, travels) => {
  const zip = new JSZip();
  
  // Add source files
  zip.file('src/config/globeConfig.js', templates['src/config/globeConfig.js'](config));
  zip.file('src/components/Earth.jsx', templates['src/components/Earth.jsx']());
  zip.file('src/components/Land.jsx', templates['src/components/Land.jsx']());
  zip.file('src/components/Globe.jsx', templates['src/components/Globe.jsx']());
  zip.file('src/components/Curve.jsx', templates['src/components/Curve.jsx']());
  zip.file('src/utilities/globe.js', templates['src/utilities/globe.js']());
  zip.file('src/utilities/travels.js', templates['src/utilities/travels.js'](travels));
  zip.file('src/utilities/countries.js', countriesData);
  zip.file('src/GlobeAnimation.jsx', templates['src/GlobeAnimation.jsx']());
  zip.file('src/HeroSection.jsx', templates['src/HeroSection.jsx'](heading, config));
  zip.file('src/HeroSection.css', templates['src/HeroSection.css']());
  zip.file('README.md', templates['README.md'](heading, config));
  
  // Fetch and add map.png
  try {
    const mapResponse = await fetch(`${process.env.PUBLIC_URL}/images/map.png`);
    if (mapResponse.ok) {
      const mapBlob = await mapResponse.blob();
      zip.file('public/images/map.png', mapBlob);
    } else {
      zip.file('public/images/README.txt', 'Could not include map.png automatically.\nPlease copy map.png from the demo project to this folder.');
    }
  } catch (error) {
    console.error('Failed to fetch map.png:', error);
    zip.file('public/images/README.txt', 'Could not include map.png automatically.\nPlease copy map.png from the demo project to this folder.');
  }
  
  // Generate and download
  const content = await zip.generateAsync({ type: 'blob' });
  saveAs(content, 'globe-component.zip');
};

export { defaultConfig };
