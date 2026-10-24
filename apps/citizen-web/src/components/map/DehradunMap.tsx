'use client';

import { useEffect, useRef } from 'react';
import 'leaflet/dist/leaflet.css';

interface DehradunMapProps {
  latitude: number;
  longitude: number;
  onLocationChange: (lat: number, lng: number, address?: string) => void;
  style?: React.CSSProperties;
}

export default function DehradunMap({
  latitude,
  longitude,
  onLocationChange,
  style,
}: DehradunMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);

  useEffect(() => {
    let isMounted = true;

    async function initMap() {
      if (typeof window === 'undefined' || !mapContainerRef.current) return;
      
      const L = (await import('leaflet')).default;

      // Custom Rapido / Zomato style high-visibility GPS pin
      const pulsePinIcon = L.divIcon({
        className: 'dehradun-custom-pin',
        html: `
          <div style="position: relative; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center;">
            <div style="
              position: absolute;
              width: 28px;
              height: 28px;
              border-radius: 50%;
              background: rgba(37, 99, 235, 0.25);
              animation: dehradunPinPulse 1.8s infinite ease-out;
            "></div>
            <div style="
              position: relative;
              width: 34px;
              height: 34px;
              background: #2563eb;
              border: 3px solid #ffffff;
              box-shadow: 0 4px 12px rgba(0,0,0,0.35);
              border-radius: 50% 50% 50% 0;
              transform: rotate(-45deg);
              display: flex;
              align-items: center;
              justify-content: center;
            ">
              <span style="transform: rotate(45deg); font-size: 16px; color: #ffffff;">📍</span>
            </div>
          </div>
        `,
        iconSize: [40, 40],
        iconAnchor: [20, 36],
      });

      if (!mapInstanceRef.current && mapContainerRef.current) {
        // Initialize real leaflet map centered on Dehradun
        const map = L.map(mapContainerRef.current, {
          center: [latitude || 30.3165, longitude || 78.0322],
          zoom: 14,
          zoomControl: true,
        });

        // OpenStreetMap Crisp Street Tiles (same base mapping provider used across food delivery / logistics)
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; OpenStreetMap contributors | Dehradun Smart City GIS',
          maxZoom: 19,
        }).addTo(map);

        // Add Draggable Location Marker
        const marker = L.marker([latitude || 30.3165, longitude || 78.0322], {
          icon: pulsePinIcon,
          draggable: true,
        }).addTo(map);

        // Reverse geocoding helper via OSM Nominatim
        const fetchAddress = async (lat: number, lng: number) => {
          try {
            const res = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`
            );
            const data = await res.json();
            const addr = data.display_name || `Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}`;
            onLocationChange(lat, lng, addr);
          } catch {
            onLocationChange(lat, lng);
          }
        };

        // When user drags marker
        marker.on('dragend', () => {
          const pos = marker.getLatLng();
          const lat = parseFloat(pos.lat.toFixed(4));
          const lng = parseFloat(pos.lng.toFixed(4));
          fetchAddress(lat, lng);
        });

        // When user clicks anywhere on the real Dehradun map
        map.on('click', (e: any) => {
          const lat = parseFloat(e.latlng.lat.toFixed(4));
          const lng = parseFloat(e.latlng.lng.toFixed(4));
          marker.setLatLng([lat, lng]);
          fetchAddress(lat, lng);
        });

        // Key Dehradun Landmark reference points
        const dehradunLandmarks = [
          { name: 'Clock Tower (Ghanta Ghar)', lat: 30.3244, lng: 78.0417, tag: 'Sector 1: Central Core' },
          { name: 'Paltan Bazar', lat: 30.3218, lng: 78.0401, tag: 'Sector 1: Central Commercial' },
          { name: 'ISBT Dehradun', lat: 30.2867, lng: 77.9996, tag: 'Sector 4: South Transit Hub' },
          { name: 'Forest Research Institute (FRI)', lat: 30.3427, lng: 77.9986, tag: 'Sector 3: West Division' },
          { name: 'Rajpur Road Crossing', lat: 30.3650, lng: 78.0720, tag: 'Sector 2: North Division' },
          { name: 'IT Park / Sahastradhara', lat: 30.3380, lng: 78.0820, tag: 'Sector 5: East Tech Corridor' },
        ];

        // Draw Municipal Sectors Load-Distribution Zones on Map
        const municipalSectors = [
          { name: 'Sector 1 (Central: Clock Tower)', lat: 30.3244, lng: 78.0417, radius: 1800, color: '#3b82f6' },
          { name: 'Sector 2 (North: Rajpur Road)', lat: 30.3650, lng: 78.0720, radius: 2400, color: '#10b981' },
          { name: 'Sector 3 (West: Chakrata Road / FRI)', lat: 30.3420, lng: 77.9920, radius: 2500, color: '#8b5cf6' },
          { name: 'Sector 4 (South: ISBT / Clement Town)', lat: 30.2850, lng: 78.0050, radius: 2700, color: '#f59e0b' },
          { name: 'Sector 5 (East: Raipur / IT Park)', lat: 30.3380, lng: 78.0820, radius: 2600, color: '#06b6d4' },
          { name: 'Sector 6 (Outer Suburbs: Harrawala)', lat: 30.2500, lng: 78.1000, radius: 3000, color: '#ec4899' },
        ];

        municipalSectors.forEach((sec) => {
          const circle = L.circle([sec.lat, sec.lng], {
            radius: sec.radius,
            color: sec.color,
            fillColor: sec.color,
            fillOpacity: 0.08,
            weight: 1.5,
            dashArray: '4, 6',
          }).addTo(map);

          circle.bindTooltip(`<b>🏛️ ${sec.name}</b><br/><span style="font-size:10px; color:#475569;">Load-Distributed Municipal Zone</span>`, {
            permanent: false,
            direction: 'center',
          });
        });

        dehradunLandmarks.forEach((lm) => {
          const landmarkDot = L.circleMarker([lm.lat, lm.lng], {
            radius: 5,
            fillColor: '#f97316',
            color: '#ffffff',
            weight: 2,
            opacity: 1,
            fillOpacity: 0.85,
          }).addTo(map);

          landmarkDot.bindTooltip(`<b>${lm.name}</b><br/><span style="font-size:10px; color:#64748b;">${lm.tag}</span>`, {
            permanent: false,
            direction: 'top',
          });
        });

        mapInstanceRef.current = map;
        markerRef.current = marker;
      }
    }

    initMap();

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update marker position when external coords change
  useEffect(() => {
    if (markerRef.current && mapInstanceRef.current) {
      markerRef.current.setLatLng([latitude, longitude]);
      mapInstanceRef.current.panTo([latitude, longitude], { animate: true });
    }
  }, [latitude, longitude]);

  return (
    <div style={{ position: 'relative', width: '100%', borderRadius: '10px', overflow: 'hidden', ...style }}>
      <div ref={mapContainerRef} style={{ width: '100%', height: '100%', minHeight: '260px', zIndex: 1 }} />
      <div
        style={{
          position: 'absolute',
          bottom: '8px',
          left: '8px',
          zIndex: 1000,
          background: 'rgba(15, 23, 42, 0.82)',
          color: '#ffffff',
          padding: '4px 8px',
          borderRadius: '4px',
          fontSize: '0.675rem',
          fontWeight: 600,
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          pointerEvents: 'none',
        }}
      >
        <span>📍 Click or drag pin to select issue spot</span>
      </div>
    </div>
  );
}
