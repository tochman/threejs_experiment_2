import { Vector3, SphereGeometry, MeshBasicMaterial, Mesh  } from "three";

const RADIUS = 80;

// Function to create a dot on the globe
const createDot = (lat, lng, radius = 1, color = 0xff0000) => {
  const geometry = new SphereGeometry(radius, 32, 32);
  const material = new MeshBasicMaterial({ color });
  const sphere = new Mesh(geometry, material);

  // Position the sphere using the polar2Cartesian function
  const { x, y, z } = polar2Cartesian(lat, lng, RADIUS, 0.005);
  sphere.position.set(x, y, z);

  return sphere;
};

const visibilityForCoordinate = (t, e, n) => {
  const i = 4 * n.width,
    r = parseInt(((t + 180) / 360) * n.width + 0.5),
    s = n.height - parseInt(((e + 90) / 180) * n.height - 0.5),
    o = parseInt(i * (s - 1) + 4 * r) + 3;
  return n.data[o] > 90;
};

const getImageData = (t) => {
  const e = document.createElement("canvas").getContext("2d");
  return (
    (e.canvas.width = t.width),
    (e.canvas.height = t.height),
    e.drawImage(t, 0, 0, t.width, t.height),
    e.getImageData(0, 0, t.width, t.height)
  );
};

const loadMap = () =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.addEventListener("load", () => resolve(img));
    img.addEventListener("error", (err) => reject(err));
    img.src = `${process.env.PUBLIC_URL}/images/map.png`;
  });

const polar2Cartesian = (lat, lng, rad = RADIUS, relAltitude = 0.005) => {
  const phi = ((90 - lat) * Math.PI) / 180;
  const theta = ((90 - lng) * Math.PI) / 180;
  const r = rad * (1 + relAltitude);
  return {
    x: r * Math.sin(phi) * Math.cos(theta),
    y: r * Math.cos(phi),
    z: r * Math.sin(phi) * Math.sin(theta),
  };
};

const toVector = (lat, lng, rad, relAltitude = 0) => {
  const c = polar2Cartesian(lat, lng, rad, relAltitude);
  return new Vector3(c.x, c.y, c.z);
};

const date = new Date();
const timeZoneOffset = date.getTimezoneOffset() || 0;
const timeZoneMaxOffset = 60 * 12;
const ROTATION = [0, Math.PI * (timeZoneOffset / timeZoneMaxOffset), 0];

export {
  RADIUS,
  createDot,
  visibilityForCoordinate,
  getImageData,
  loadMap,
  polar2Cartesian,
  toVector,
  ROTATION,
};
