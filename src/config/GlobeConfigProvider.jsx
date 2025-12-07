import React, { createContext, useContext } from 'react';
import { useControls, folder } from 'leva';
import { defaultConfig } from './globeConfig';

const GlobeConfigContext = createContext(defaultConfig);

export const useGlobeConfig = () => useContext(GlobeConfigContext);

export const GlobeConfigProvider = ({ children }) => {
  const config = useControls({
    Background: folder({
      backgroundColor: { value: defaultConfig.backgroundColor, label: 'Color' },
    }),
    Globe: folder({
      globeColor: { value: defaultConfig.globeColor, label: 'Color' },
      globeOpacity: { value: defaultConfig.globeOpacity, min: 0, max: 1, step: 0.05, label: 'Opacity' },
    }),
    Continents: folder({
      landColor: { value: defaultConfig.landColor, label: 'Color' },
      landPointSize: { value: defaultConfig.landPointSize, min: 0.5, max: 3, step: 0.1, label: 'Point Size' },
    }),
    'Travel Lines': folder({
      lineColor: { value: defaultConfig.lineColor, label: 'Color' },
    }),
    Dots: folder({
      originDotColor: { value: defaultConfig.originDotColor, label: 'Origin Color' },
      destinationDotColor: { value: defaultConfig.destinationDotColor, label: 'Destination Color' },
      dotSize: { value: defaultConfig.dotSize, min: 0.5, max: 3, step: 0.1, label: 'Size' },
    }),
    Animation: folder({
      lineDrawDuration: { value: defaultConfig.lineDrawDuration, min: 1000, max: 8000, step: 100, label: 'Draw Duration (ms)' },
      pauseDuration: { value: defaultConfig.pauseDuration, min: 500, max: 5000, step: 100, label: 'Pause Duration (ms)' },
      fadeDuration: { value: defaultConfig.fadeDuration, min: 500, max: 5000, step: 100, label: 'Fade Duration (ms)' },
    }),
    Rotation: folder({
      autoRotate: { value: defaultConfig.autoRotate, label: 'Auto Rotate' },
    }),
  });

  // Separate useControls for speed so it can react to autoRotate
  const rotationSpeed = useControls('Rotation', {
    autoRotateSpeed: { 
      value: defaultConfig.autoRotateSpeed, 
      min: 0.1, 
      max: 5, 
      step: 0.1, 
      label: 'Speed',
      disabled: !config.autoRotate,
    },
  }, [config.autoRotate]);

  const fullConfig = { ...config, ...rotationSpeed };

  return (
    <GlobeConfigContext.Provider value={fullConfig}>
      {children}
    </GlobeConfigContext.Provider>
  );
};
