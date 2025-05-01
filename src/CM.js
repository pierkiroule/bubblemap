import { useEffect } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

function CM({ mapRef, userPositionRef, setMapReady }) {
  useEffect(() => {
    // Nettoyage propre AVANT toute création
    if (mapRef.current && mapRef.current._container) {
      mapRef.current.remove();
      mapRef.current = null;
    }

    const map = L.map('map', {
      zoomControl: true,
      attributionControl: false,
    }).setView([48.85, 2.35], 18); // Paris par défaut

    mapRef.current = map;

    // Ajoute les tuiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 20,
    }).addTo(map);

    map.once('load', () => {
      setMapReady(true);

      map.locate({ watch: true, enableHighAccuracy: true });

      map.on('locationfound', (e) => {
        if (mapRef.current && mapRef.current._panes) {
          userPositionRef.current = e.latlng;
          mapRef.current.setView(e.latlng, 18);
        }
      });

      map.on('locationerror', () => {
        console.log('GPS non disponible.');
      });
    });

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
      }
    };
  }, [mapRef, userPositionRef, setMapReady]);

  return null;
}

export default CM;