import React from "react";
import GlobeAnimation from "./GlobeAnimation";
import "./HeroSection.css";
import { GlobeConfigProvider, useGlobeConfig } from "./config/GlobeConfigProvider";
import ExportPanel from "./config/ExportPanel";
import { useControls, folder } from "leva";

const HeroContent = () => {
  const config = useGlobeConfig();
  const { backgroundColor } = config;

  const { headingLine1, headingLine2 } = useControls({
    Heading: folder({
      headingLine1: { value: 'Local Focus', label: 'Line 1' },
      headingLine2: { value: 'Global Presence', label: 'Line 2' },
    }),
  });

  return (
    <div className="hero-container" style={{ backgroundColor }}>
      {/* Export Panel (renders Leva controls only) */}
      <ExportPanel config={config} headingLine1={headingLine1} headingLine2={headingLine2} />
      
      {/* Text Overlay */}
      <div className="text-container">
        {headingLine1 && <h1 className="hero-text">{headingLine1}</h1>}
        {headingLine2 && <h1 className="hero-text">{headingLine2}</h1>}
      </div>

      {/* Globe Animation */}
      <div className="globe-container">
        <GlobeAnimation />
      </div>
    </div>
  );
};

const HeroSection = () => {
  return (
    <GlobeConfigProvider>
      <HeroContent />
    </GlobeConfigProvider>
  );
};

export default HeroSection;
