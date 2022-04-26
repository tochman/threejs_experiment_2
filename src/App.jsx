import React from "react";
import Globe from "./components/Globe";
import { Canvas } from "@react-three/fiber";

const App = () => {
  return (
    <div
      style={{
        width: "100 vw",
        height: "100vh",
        backgroundColor: "rgb(11,20,24)",
      }}
    >
      <Canvas orthographic camera={{ position: [0, 0, 200], zoom: 3.5 }}>
        <Globe />
      </Canvas>
    </div>
  );
};

export default App;
