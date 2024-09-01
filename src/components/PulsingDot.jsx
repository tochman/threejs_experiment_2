import React, { useRef } from "react";
import { useFrame } from "@react-three/fiber";

const PulsingDot = ({ position, rotation, color, visible }) => {
  const meshRef = useRef();

  useFrame(() => {
    if (meshRef.current) {
      const scale = 1 + 0.35 * Math.sin(Date.now() * 0.005);
      meshRef.current.scale.set(scale, scale, scale);
    }
  });

  return (
    <>
      {visible && (
       <mesh rotation={rotation} visible={visible}>

        <mesh position={position} ref={meshRef}>
          <sphereBufferGeometry args={[1, 15, 15]} />
          <meshBasicMaterial color={color} />
        </mesh>
        </mesh>
      )}
    </>
  );
};

export default PulsingDot;
