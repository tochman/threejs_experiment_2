import { countries } from "./countries";

const pointOfOrigin = { lat: 57.70887, lng: 11.97456 };

export const travels = [
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