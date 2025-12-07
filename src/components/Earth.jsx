import React from "react";
import { RADIUS, ROTATION } from "../utilities/globe";
import { useGlobeConfig } from "../config/GlobeConfigProvider";

const Earth = () => {
  const { globeColor, globeOpacity } = useGlobeConfig();

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
