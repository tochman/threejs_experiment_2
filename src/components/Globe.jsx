import React from "react";
import { OrbitControls } from "@react-three/drei";
import { useThree } from "@react-three/fiber";

import Earth from "./Earth";
import Land from "./Land";
import Curve from "./Curve";

import { travels } from "../utilities/travels";
const Globe = () => {
  const three = useThree();
  window.three = three
  const onWindowResize = () => {
    
    three.camera.aspect = window.innerWidth / window.innerHeight;
    three.camera.updateProjectionMatrix();
    three.gl.setSize(window.innerWidth, window.innerHeight);

    // three.scene.visible = false
    three.scene.updateMatrix()
    
  };

  window.addEventListener("resize", onWindowResize);


  return (
    <>
      {travels.map((travel) => {
        return <Curve key={travel.name} travel={travel} />;
      })}
      <Land />
      <Earth />

      <OrbitControls enableRotate autoRotate active />
    </>
  );
};

export default Globe;
