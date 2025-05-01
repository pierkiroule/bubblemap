// src/utils/createCleanMarker.js
import L from 'leaflet';

export function createCleanMarker(latlng, options = {}) {
  const whiteIcon = L.divIcon({
    className: 'custom-div-icon',
    html: "<div class='bubble-marker'></div>",
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });

  return L.marker(latlng, {
    icon: whiteIcon,
    draggable: options.draggable || false,
    ...options,
  });
}