import { useEffect, useRef } from 'react';
import L from 'leaflet';
import './MapDisplay.css'; // We'll create this next

function MapDisplay({ issues }) {
  const mapRef = useRef(null);
  const leafletMapInstanceRef = useRef(null);
  const markersRef = useRef([]); // To keep track of markers

  // 1. Initialize the map ONCE
  useEffect(() => {
    if (leafletMapInstanceRef.current) return;

    const map = L.map(mapRef.current, {
      center: [28.75, 77.58], // Muradnagar
      zoom: 12,
      zoomControl: true,
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

    // Add new markers for each issue
    issues.forEach(issue => {
      if (issue.lat && issue.lng) {
        const marker = L.marker([issue.lat, issue.lng])
          .addTo(map)
          .bindPopup(`
            <b>${issue.title}</b><br>
            Status: ${issue.status}<br>
            <a href="#issue-${issue._id}">View Details</a>
          `);
        markersRef.current.push(marker);
      }
    });

    // Re-center map if there are issues
    if (issues.length > 0) {
      const validIssues = issues.filter(i => i.lat && i.lng);
      if (validIssues.length > 0) {
        const bounds = L.latLngBounds(validIssues.map(i => [i.lat, i.lng]));
        map.fitBounds(bounds, { padding: [50, 50] });
      }
    }

  }, [issues]); // Runs every time the issues list changes

  return (
    <div ref={mapRef} className="admin-map-container">
      {/* Map will render inside this div */}
    </div>
  );
}

export default MapDisplay;