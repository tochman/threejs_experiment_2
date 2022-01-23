import React from "react";
import { RADIUS, ROTATION } from "../utilities/globe";

const Earth = () => (
  <mesh rotation={ROTATION}>
    <sphereBufferGeometry args={[RADIUS, 64, 64]} />
    <meshBasicMaterial
      color="rgb(28,49,58)"
      opacity="0.85"
      transparent={true}
      dithering="true"
    />
  </mesh>
);

export default Earth;
