import React, { useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";

const PulsingDot = ({ position, rotation, color, visible, globalOpacity = 1 }) => {
  const meshRef = useRef();
  const materialRef = useRef();
  const fadeState = useRef({
    localOpacity: 0,
    targetOpacity: 0,
    isPulsing: false,
    fadeStartTime: null,
    wasPreviouslyVisible: false,
  });

  // Handle visibility changes - trigger fade in/out
  useEffect(() => {
    const state = fadeState.current;
    if (visible && !state.wasPreviouslyVisible) {
      // Start fade in
      state.fadeStartTime = Date.now();
      state.targetOpacity = 1;
      state.isPulsing = false;
    } else if (!visible && state.wasPreviouslyVisible) {
      // Start fade out
      state.fadeStartTime = Date.now();
      state.targetOpacity = 0;
      state.isPulsing = false;
    }
    state.wasPreviouslyVisible = visible;
  }, [visible]);

  useFrame(() => {
    if (!meshRef.current || !materialRef.current) return;

    const state = fadeState.current;
    const fadeDuration = 600; // 600ms for both fade-in and fade-out

    // Handle fading animation
    if (state.fadeStartTime !== null) {
      const elapsed = Date.now() - state.fadeStartTime;
      const progress = Math.min(elapsed / fadeDuration, 1);

      if (state.targetOpacity === 1) {
        // Fading in
        state.localOpacity = progress;
      } else {
        // Fading out
        state.localOpacity = 1 - progress;
      }

      // Apply opacity (combine local and global)
      materialRef.current.opacity = state.localOpacity * globalOpacity;

      // Handle scale during fade
      const scale = state.localOpacity;
      meshRef.current.scale.set(scale, scale, scale);

      // Check if fade is complete
      if (progress >= 1) {
        if (state.targetOpacity === 1) {
          state.isPulsing = true;
        }
        state.fadeStartTime = null;
      }
    } else if (state.isPulsing && visible) {
      // Apply pulsing effect
      const pulseScale = 1 + 0.35 * Math.sin(Date.now() * 0.005);
      meshRef.current.scale.set(pulseScale, pulseScale, pulseScale);
      
      // Keep updating opacity for global fade-out
      materialRef.current.opacity = state.localOpacity * globalOpacity;
    } else if (!visible && state.localOpacity <= 0) {
      // Fully hidden
      meshRef.current.scale.set(0, 0, 0);
      materialRef.current.opacity = 0;
    } else {
      // Update opacity for global changes
      materialRef.current.opacity = state.localOpacity * globalOpacity;
    }
  });

  return (
    <mesh rotation={rotation}>
      <mesh
        position={position}
        ref={meshRef}
      >
        <sphereGeometry args={[1, 15, 15]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0}
          ref={materialRef}
        />
      </mesh>
    </mesh>
  );
};

export default PulsingDot;
