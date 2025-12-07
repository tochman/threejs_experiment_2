/* eslint-disable react-hooks/exhaustive-deps */
import React, { useMemo, useRef, useEffect } from "react";
import { CubicBezierCurve3 } from "three";
import { RADIUS, toVector, ROTATION } from "../utilities/globe";
import { geoInterpolate } from "d3";
import { useFrame } from "@react-three/fiber";

const TUBE_SEGMENTS = 44;
const RADIAL_SEGMENTS = 8;
const TOTAL_DRAW_COUNT = TUBE_SEGMENTS * RADIAL_SEGMENTS * 6;

const Curve = ({ travel }) => {
  // Use refs for animation state to avoid re-renders
  const stateRef = useRef({
    currentSegment: -1,
    dotsVisible: [],
    opacity: 1,
    phase: 'waiting', // 'waiting', 'drawing', 'pausing', 'fading'
    animationStartTime: null,
    segmentStartTime: null,
    initialized: false,
  });
  
  const geometries = useRef([]);
  const materialsRef = useRef([]);
  const curveMeshesRef = useRef([]);
  const dotMaterialsRef = useRef([]);
  const dotMeshesRef = useRef([]);

  // Calculate curves
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

  // Initialize on mount
  useEffect(() => {
    const state = stateRef.current;
    const numDots = startPoints.length;
    state.dotsVisible = [1, ...Array(numDots - 1).fill(0)]; // 1 = visible, 0 = hidden, values in between for fading
    state.currentSegment = -1;
    state.opacity = 1;
    state.phase = 'waiting';
    state.animationStartTime = Date.now() + Math.random() * 3000; // Random delay
    state.initialized = true;
    
    // Initialize geometries
    geometries.current.forEach((geo) => {
      if (geo) geo.setDrawRange(0, 0);
    });
  }, [travel, startPoints.length]);

  // Main animation loop using useFrame
  useFrame(() => {
    const state = stateRef.current;
    if (!state.initialized) return;

    const now = Date.now();

    switch (state.phase) {
      case 'waiting':
        // Wait for random delay before starting
        if (now >= state.animationStartTime) {
          state.phase = 'drawing';
          state.currentSegment = 0;
          state.segmentStartTime = now;
        }
        break;

      case 'drawing': {
        const elapsed = now - state.segmentStartTime;
        const duration = 3500;
        const progress = Math.min(elapsed / duration, 1);
        const segmentIndex = state.currentSegment;

        // Update geometry draw range
        const geometry = geometries.current[segmentIndex];
        if (geometry) {
          geometry.setDrawRange(0, Math.floor(progress * TOTAL_DRAW_COUNT));
        }

        // When segment completes
        if (progress >= 1) {
          // Show the destination dot (fade in)
          state.dotsVisible[segmentIndex + 1] = 1;

          if (segmentIndex >= curves.length - 1) {
            // All segments done, pause before fading
            state.phase = 'pausing';
            state.animationStartTime = now + 2000;
          } else {
            // Move to next segment
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
          // Start fading all dots
          state.dotsVisible = state.dotsVisible.map(() => -1); // -1 signals start of fade out
        }
        break;

      case 'fading': {
        const elapsed = now - state.animationStartTime;
        const duration = 2500;
        const progress = Math.min(elapsed / duration, 1);
        const newOpacity = 1 - progress;
        state.opacity = newOpacity;

        // Update line materials
        materialsRef.current.forEach((mat) => {
          if (mat) mat.opacity = newOpacity;
        });

        // Update dot opacities (fading out)
        state.dotsVisible = state.dotsVisible.map((v) => {
          if (v === -1 || v > 0) return Math.max(0, 1 - progress);
          return 0;
        });

        if (progress >= 1) {
          // Reset everything for next cycle
          state.currentSegment = -1;
          state.opacity = 1;
          state.dotsVisible = [1, ...Array(startPoints.length - 1).fill(0)];
          state.phase = 'waiting';
          state.animationStartTime = now + 500 + Math.random() * 3000;

          // Reset geometries
          geometries.current.forEach((geo) => {
            if (geo) geo.setDrawRange(0, 0);
          });

          // Reset materials
          materialsRef.current.forEach((mat) => {
            if (mat) mat.opacity = 1;
          });
        }
        break;
      }
      default:
        break;
    }

    // Update curve mesh visibility
    curveMeshesRef.current.forEach((mesh, index) => {
      if (mesh) {
        mesh.visible = index <= state.currentSegment;
      }
    });

    // Update dot visuals
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
      {/* Render Curves */}
      {curves.map((curve, index) => (
        <mesh
          rotation={ROTATION}
          key={`curve-${travel.name}-${index}`}
          visible={false}
          ref={(el) => {
            if (el) {
              curveMeshesRef.current[index] = el;
            }
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
            color="grey"
            transparent
            ref={(el) => {
              if (el) materialsRef.current[index] = el;
            }}
          />
        </mesh>
      ))}

      {/* Render Dots */}
      {startPoints.map((point, index) => (
        <mesh rotation={ROTATION} key={`dot-wrapper-${travel.name}-${index}`}>
          <mesh
            position={point}
            ref={(el) => {
              if (el) dotMeshesRef.current[index] = el;
            }}
          >
            <sphereGeometry args={[1, 15, 15]} />
            <meshBasicMaterial
              color={index === 0 ? "white" : "lightgrey"}
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
