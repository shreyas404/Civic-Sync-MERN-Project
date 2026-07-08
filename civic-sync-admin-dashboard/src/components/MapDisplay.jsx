import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

function MapDisplay({ issues }) {
  const mapRef = useRef(null);
  const leafletMapInstanceRef = useRef(null);
  const markersRef = useRef([]); // To keep track of markers

  // 1. Initialize the map ONCE
  useEffect(() => {
    if (leafletMapInstanceRef.current) return;

    const map = L.map(mapRef.current, {
      center: [28.6692, 77.4538], // Default center
      zoom: 12,
      zoomControl: true,
      // Scroll hijack prevention on mobile
      dragging: !L.Browser.mobile,
      tap: !L.Browser.mobile
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);

    leafletMapInstanceRef.current = map;

    return () => {
      if (leafletMapInstanceRef.current) {
        leafletMapInstanceRef.current.remove();
        leafletMapInstanceRef.current = null;
      }
    };
  }, []); // Runs only ONCE

  // 2. Update markers when 'issues' prop changes
  useEffect(() => {
    const map = leafletMapInstanceRef.current;
    if (!map) return;

    // Clear old markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    let validBounds = [];

    // Add new markers for each issue
    issues.forEach(issue => {
      if (issue.location && issue.location.coordinates) {
        const lat = issue.location.coordinates[1];
        const lng = issue.location.coordinates[0];
        validBounds.push([lat, lng]);

        const popupContent = `
          <div class="max-w-[200px] md:max-w-[250px]">
            <b class="text-sm block truncate">${issue.title}</b>
            <span class="text-xs uppercase font-bold text-gray-500">${issue.status}</span><br>
            <a href="#issue-${issue._id}" class="text-purple-600 font-semibold text-xs mt-1 inline-block">View Details</a>
          </div>
        `;

        const marker = L.marker([lat, lng])
          .addTo(map)
          .bindPopup(popupContent, { maxWidth: 250, minWidth: 150 });
          
        markersRef.current.push(marker);
      }
    });

    // Re-center map if there are issues
    if (validBounds.length > 0) {
      const bounds = L.latLngBounds(validBounds);
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
    }

  }, [issues]); // Runs every time the issues list changes

  return (
    <div 
      ref={mapRef} 
      className="w-full h-[50vh] md:h-[600px] rounded-xl z-0 border border-gray-200 shadow-sm"
    >
      {/* Map will render inside this div */}
    </div>
  );
}

export default MapDisplay;