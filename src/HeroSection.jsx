import React from "react";
import GlobeAnimation from "./GlobeAnimation";
import "./HeroSection.css"; // Import the SCSS file

const HeroSection = () => {
  return (
    <div className="hero-container">
      {/* Text Overlay */}
      <div className="text-container">
        <h1 className="hero-text">Local Focus</h1>
        <h1 className="hero-text">Global Presence</h1>
      </div>

      {/* Globe Animation - only part of the globe visible */}
      <div className="globe-container">
        <GlobeAnimation />
      </div>
    </div>
  );
};

export default HeroSection;
