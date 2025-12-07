import React from "react";
import { OrbitControls } from "@react-three/drei";

import Earth from "./Earth";
import Land from "./Land";
import Curve from "./Curve";

import { travels } from "../utilities/travels";
import { useGlobeConfig } from "../config/GlobeConfigProvider";

const Globe = () => {
  const { autoRotate, autoRotateSpeed } = useGlobeConfig();

  return (
    <>
      {travels.map((travel) => {
        return <Curve key={travel.name} travel={travel} />;
      })}
      <Land />
      <Earth />

      <OrbitControls 
        enableRotate 
        autoRotate={autoRotate} 
        autoRotateSpeed={autoRotateSpeed} 
      />
    </>
  );
};

export default Globe;
