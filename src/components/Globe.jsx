import React from "react";
import { OrbitControls } from "@react-three/drei";

import Earth from "./Earth";
import Land from "./Land";
import Curve from "./Curve";

import { travels } from "../utilities/travels";

const Globe = () => {
  return (
    <>
      {travels.map((travel) => {
        return <Curve key={travel.name} travel={travel} />;
      })}
      <Land />
      <Earth />

      <OrbitControls enableRotate autoRotate />
    </>
  );
};

export default Globe;
