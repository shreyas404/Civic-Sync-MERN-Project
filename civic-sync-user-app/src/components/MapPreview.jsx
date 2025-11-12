import { useEffect, useRef } from 'react';
import L from 'leaflet';
import './MapPreview.css';

function MapPreview({ lat, lng, onClick }) {
  const mapRef = useRef(null);
  const leafletMapInstanceRef = useRef(null);
  const markerRef = useRef(null);
  
  // 1. Initialization Effect: Runs ONCE on mount
  useEffect(() => {
    if (leafletMapInstanceRef.current) return;

    // --- LEAFLET INITIALIZATION ---
    const map = L.map(mapRef.current, {
      center: [lat, lng],
      zoom: 16,
      zoomControl: false,
      scrollWheelZoom: false,
      dragging: false,
      touchZoom: false,
      doubleClickZoom: false,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);

    const marker = L.marker([lat, lng]).addTo(map);

    leafletMapInstanceRef.current = map;
    markerRef.current = marker;
    
    // --- FINAL FIX: Force the map to check its size immediately ---
    map.invalidateSize(); 

    return () => {
      if (leafletMapInstanceRef.current) {
        leafletMapInstanceRef.current.remove();
        leafletMapInstanceRef.current = null;
      }
    };
  }, []); // Runs only ONCE on mount

  // 2. Update Effect: Runs when coordinates change
  useEffect(() => {
    const map = leafletMapInstanceRef.current;
    const marker = markerRef.current;
    
    if (map && marker) {
      const newLatLng = [lat, lng];
      
      marker.setLatLng(newLatLng);
      
      // Update the view smoothly
      map.setView(newLatLng, map.getZoom(), { animate: true }); 
    }
  }, [lat, lng]); // Runs every time location state updates

  if (!lat || !lng) return null;

  return (
    <div 
      ref={mapRef} 
      className="map-preview-container" 
      onClick={onClick}
    >
      {/* Map will render inside this div */}
    </div>
  );
}

export default MapPreview;