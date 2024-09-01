import React from "react";
import Globe from "./components/Globe";
import { Canvas } from "@react-three/fiber";

const GlobeAnimation = () => {
  return (
    <Canvas
      orthographic
      camera={{ position: [150, 200, 200], zoom: 4.5 }} // Adjust camera position to show part of the globe
      style={{ background: "transparent" }} // Transparent background for integration with hero section
    >
      <Globe />
    </Canvas>
  );
};

export default GlobeAnimation;
