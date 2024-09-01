/* eslint-disable react-hooks/exhaustive-deps */
import React, { useMemo, useRef, useState, useEffect } from "react";
import { CubicBezierCurve3 } from "three";
import { RADIUS, toVector, ROTATION } from "../utilities/globe";
import { geoInterpolate } from "d3";
import PulsingDot from "./PulsingDot";

const Curve = ({ travel }) => {
  const [currentSegment, setCurrentSegment] = useState(-1); // Track the current segment; start with -1 to hide all initially
  const [dotsVisible, setDotsVisible] = useState([]); // Track visibility of dots at each stop
  const geometries = useRef([]);

  const drawSegment = (index) => {
    let startTime = null;
    const duration = 3500; // Animation duration in ms

    const animate = (currentTime) => {
      if (!startTime) startTime = currentTime;
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1); // Ensure progress stays between 0 and 1

      geometries.current[index]?.setDrawRange(0, progress * 3500);

      if (progress < 1) {
        requestAnimationFrame(animate); // Continue the animation
      } else {
        setTimeout(() => {
          // Introduce a slight delay before moving to the next segment
          setDotsVisible((prev) => {
            const newDotsVisible = [...prev];
            newDotsVisible[index + 1] = true;
            return newDotsVisible;
          });
          setCurrentSegment((prev) => prev + 1);
        }, 50); // 50ms delay before starting the next segment
      }
    };

    requestAnimationFrame(animate);
  };

  useEffect(() => {
    // Initialize dotsVisible to true for the first dot (point of origin), false for others
    if (travel.stops && travel.stops.length > 1) {
      setDotsVisible([true, ...Array(travel.stops.length - 1).fill(false)]);
    } else {
      setDotsVisible([true, false]); // For single-leg travel
    }

    // Randomize delay before starting the animation for this trip
    const randomDelay = Math.random() * 3000;
    setTimeout(() => {
      setCurrentSegment(0); // Start with the first segment after the delay
    }, randomDelay);
  }, [travel]);

  useEffect(() => {
    if (currentSegment >= 0 && currentSegment < geometries.current.length) {
      drawSegment(currentSegment);
    }
  }, [currentSegment, travel]);

  const curves = useMemo(() => {
    if (!travel.stops || travel.stops.length < 2) {
      // Single leg travel
      setDotsVisible([true, false]);
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

      const curve = new CubicBezierCurve3(
        startXYZ,
        controlXYZ1,
        controlXYZ2,
        endXYZ
      );
      setDotsVisible([true, true]); // Ensure visibility of the end dot for single leg travel
      return [curve];
    }

    const segments = [];
    setDotsVisible(Array(travel.stops.length).fill(false)); // Initialize visibility state

    for (let i = 0; i < travel.stops.length - 1; i++) {
      const start = travel.stops[i];
      const end = travel.stops[i + 1];

      const startXYZ = toVector(start.lat, start.lng, RADIUS);
      const endXYZ = toVector(end.lat, end.lng, RADIUS);

      const d3Interpolate = geoInterpolate(
        [start.lng, start.lat],
        [end.lng, end.lat]
      );
      const c1 = d3Interpolate(0.3);
      const c2 = d3Interpolate(0.7);

      const arcHeight = startXYZ.distanceTo(endXYZ) * 0.4 + RADIUS;
      const controlXYZ1 = toVector(c1[1], c1[0], arcHeight);
      const controlXYZ2 = toVector(c2[1], c2[0], arcHeight);

      const curve = new CubicBezierCurve3(
        startXYZ,
        controlXYZ1,
        controlXYZ2,
        endXYZ
      );
      segments.push(curve);
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
      // Single leg travel
      const p = toVector(travel.start.lat, travel.start.lng, RADIUS);
      const endP = toVector(travel.end.lat, travel.end.lng, RADIUS);
      return [
        [p.x, p.y, p.z],
        [endP.x, endP.y, endP.z],
      ]; // Include end point
    }
  }, [travel]);

  return (
    <>
      {/* Render Curves */}
      {curves.map((curve, index) => (
        <mesh rotation={ROTATION} key={index} visible={index <= currentSegment}>
          <tubeBufferGeometry
            args={[curve, 44, 0.2, 8]}
            ref={(el) => (geometries.current[index] = el)}
          />
          <meshBasicMaterial color="grey" />
        </mesh>
      ))}

      {/* Spheres at Each Stop Point */}
      {startPoints.map((point, index) => (
        <>
          <PulsingDot
            position={point}
            key={index}
            rotation={ROTATION}
            color={index === 0 ? "white" : "lightgrey"} 
            visible={dotsVisible[index]}
          />
        </>
      ))}
    </>
  );
};

export default Curve;
