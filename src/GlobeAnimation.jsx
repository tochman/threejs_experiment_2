import React, { useRef, useEffect, useState } from "react";
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
