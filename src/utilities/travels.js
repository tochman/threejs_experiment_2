import { countries } from "./countries";

const pointOfOrigin = { lat: 57.70887, lng: 11.97456 };

export const travels = [
  {
    name: "Moscow",
    start: pointOfOrigin, // Change to pointOfOrigin instead of Brazil
    end: { lat: 55.751244, lng: 37.618423 },
  },

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
    name: "Sarajevo",
    start: pointOfOrigin,
    end: { lat: 43.85643, lng: 18.413029 },
  },
  {
    name: "Multi-stop",
    stops: [
      { lat: pointOfOrigin.lat, lng: pointOfOrigin.lng }, // Start
      { lat: 55.751244, lng: 37.618423 }, // Moscow
      { lat: -33.771, lng: 150.906296 }, // Sydney
    ],
  },
  {
    name: "New York to San Francisco to Point of Origin",
    stops: [
      { lat: 40.7128, lng: -74.006 }, // New York
      { lat: 37.7749, lng: -122.4194 }, // San Francisco
      { lat: -33.8688, lng: 151.2093 }, // Point of Origin (Sydney)
    ],
  },
  {
    name: "Sydney to Sao Paulo",
    start: { lat: -33.8688, lng: 151.2093 }, // Sydney
    end: { lat: -23.5505, lng: -46.6333 }, // Sao Paulo
  },
  {
    name: "Berlin to Paris",
    start: { lat: 52.52, lng: 13.405 }, // Berlin
    end: { lat: 48.8566, lng: 2.3522 }, // Paris
  },
  {
    name: "Warsaw to Cairo to Johannesburg",
    stops: [
      { lat: 52.2297, lng: 21.0122 }, // Warsaw
      { lat: 30.0444, lng: 31.2357 }, // Cairo
      { lat: -26.2041, lng: 28.0473 }, // Johannesburg
    ],
  },
];
