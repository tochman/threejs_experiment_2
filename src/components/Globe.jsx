import React from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import Earth from "./Earth";
import Land from "./Land";
import Curve from "./Curve";
import { countries } from "../utilities/countries";
const Globe = () => {
  const pointOfOrigin = { lat: 57.70887, lng: 11.97456 };
  const travels = [
    {
      name: "Brazil",
      start: pointOfOrigin,
      end: { lat: countries.br[0], lng: countries.br[1] },
    },
    {
      name: "Egypt",
      start: pointOfOrigin,
      end: { lat: countries.eg[0], lng: countries.eg[1] },
    },
    {
      name: "Johannesburg, South Africa",
      start: pointOfOrigin,
      end: { lat: -26.195246, lng: 28.034088 },
    },
    {
      name: "New York",
      start: pointOfOrigin,
      end: { lat: 40.71427, lng: -74.00597 },
    },
    {
      name: "Sydney",
      start: pointOfOrigin,
      end: { lat: -33.771, lng: 150.906296 },
    },
    {
      name: "Sarayevo",
      start: pointOfOrigin,
      end: { lat: 43.85643, lng: 18.413029 },
    },
    {
      name: "Moscow",
      start: pointOfOrigin,
      end: { lat: 55.751244, lng: 37.618423 },
    },
  ];
  return (
    <div
      style={{
        width: "100 vw",
        height: "100vh",
        backgroundColor: "rgb(11,20,24)",
      }}
    >
      <Canvas orthographic camera={{ position: [0, 0, 200], zoom: 3.5 }}>
        {travels.map((travel) => {
          
          return <Curve key={travel.name} travel={travel} />;
        })}
        <Land />
        <Earth />

        <OrbitControls enablePan enableRotate autoRotate passive />
      </Canvas>
    </div>
  );
};

export default Globe;
