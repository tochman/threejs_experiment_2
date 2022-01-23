/* eslint-disable react-hooks/exhaustive-deps */
import React, { useMemo, useRef, useState, useEffect } from "react";
import { CubicBezierCurve3 } from "three";
import {
  RADIUS,
  toVector,
  ROTATION,
  polar2Cartesian,
} from "../utilities/globe";
import { geoInterpolate } from "d3";
const Curve = ({ travel }) => {
  const [isShown, setIsShown] = useState(true);

  let time;
  const drawAnimatedLine = () => {
    setIsShown(true);
    time = 0;
    // timeRandom = parseInt(Math.random() * 4000)

    const interval = setInterval(() => {
      time += 100;
      geometry?.current?.setDrawRange(0, time);
      if (time >= 3500) {
        time = 0;
        clearInterval(interval);
      }
    }, 50);
  };

  useEffect(() => {
    drawAnimatedLine();
  }, []);

  const geometry = useRef();
  const curve = useMemo(() => {
    const { start, end } = travel;

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
    return curve;
  }, [travel]);

  const point = useMemo(() => {
    const p = polar2Cartesian(travel.start.lat, travel.start.lng, RADIUS);

    return [p.x, p.y, p.z];
  }, [travel]);

  useMemo(() => {
    if (geometry.current) {
      void (
        // geometry.current.setDrawRange(0, 0);
        drawAnimatedLine()
      );
    }
  }, [travel]);

  return (
    <>
      {isShown && (
        <>
          <mesh rotation={ROTATION}>
            <mesh position={point}>
              <sphereBufferGeometry args={[1, 15, 15]} />
              <meshBasicMaterial color="lightgrey" />
            </mesh>
            <tubeBufferGeometry args={[curve, 44, 0.2, 8]} ref={geometry} />
            <meshBasicMaterial color="grey" />
          </mesh>
        </>
      )}
    </>
  );
};

export default Curve;
