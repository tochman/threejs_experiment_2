import React, { useEffect, useRef } from "react";
import {
  loadMap,
  getImageData,
  visibilityForCoordinate,
  polar2Cartesian,
  ROTATION,
} from "../utilities/globe";
import { BufferAttribute } from "three";

const Land = () => {
  const geometryRef = useRef();

  useEffect(() => {
    const load = async () => {
      const image = await loadMap();
      const imageData = getImageData(image);

      const vertices = [];
      const D2R = Math.PI / 180;
      const rows = 200;
      for (let lat = -90; lat <= 90; lat += 180 / rows) {
        const t = Math.cos(Math.abs(lat) * D2R) * 25 * Math.PI * 2 * 2;
        for (let r = 0; r < t; r++) {
          const lng = (360 * r) / t - 180;
          if (!visibilityForCoordinate(lng, lat, imageData)) continue;

          const c = polar2Cartesian(lat, lng);
          vertices.push(c.x, c.y, c.z);
        }
      }
      
      if (geometryRef.current) {
        const positions = new Float32Array(vertices);
        geometryRef.current.setAttribute('position', new BufferAttribute(positions, 3));
      }
    };

    load();
  }, []);

  return (
    <points rotation={ROTATION} name="land">
      <bufferGeometry ref={geometryRef} />
      <pointsMaterial size={1} color="rgb(154,174,182)" />
    </points>
  );
};

export default Land;
