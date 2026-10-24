"use client";

import { useEffect, useRef, useCallback } from "react";
import "leaflet/dist/leaflet.css";
import { CivicIssue } from "@/lib/api";

interface SectorIssueMapProps {
  issues: CivicIssue[];
  userSector?: string | null;
  hasJurisdiction: (sector?: string | null) => boolean;
  lang?: string;
}

// Status → color mapping for markers
const STATUS_COLORS: Record<string, string> = {
  SUBMITTED: "#f59e0b",
  UNDER_REVIEW: "#3b82f6",
  IN_PROGRESS: "#8b5cf6",
  RESOLVED: "#10b981",
  REJECTED: "#ef4444",
};

const PRIORITY_SIZES: Record<string, number> = {
  LOW: 7,
  MEDIUM: 9,
  HIGH: 11,
  URGENT: 14,
};

// Municipal sector zone definitions (for sector boundary circles)
const SECTOR_ZONES = [
  { name: "Sector 1 (Central: Clock Tower)", lat: 30.3244, lng: 78.0417, radius: 1800, color: "#3b82f6" },
  { name: "Sector 2 (North: Rajpur Road)", lat: 30.3650, lng: 78.0720, radius: 2400, color: "#10b981" },
  { name: "Sector 3 (West: Chakrata Road / FRI)", lat: 30.3420, lng: 77.9920, radius: 2500, color: "#8b5cf6" },
  { name: "Sector 4 (South: ISBT / Clement Town)", lat: 30.2850, lng: 78.0050, radius: 2700, color: "#f59e0b" },
  { name: "Sector 5 (East: Raipur / IT Park)", lat: 30.3380, lng: 78.0820, radius: 2600, color: "#06b6d4" },
  { name: "Sector 6 (Outer Suburbs: Harrawala)", lat: 30.2500, lng: 78.1000, radius: 3000, color: "#ec4899" },
];

export default function SectorIssueMap({
  issues,
  userSector,
  hasJurisdiction,
  lang = "en",
}: SectorIssueMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const zonesLayerRef = useRef<any>(null);
  const markersLayerRef = useRef<any>(null);
  const LRef = useRef<any>(null);

  // Helper: Draw Sector Circles with dotted borders for other sectors and solid for officer's sector
  const renderSectorZones = useCallback(
    (L: any, zonesLayer: any) => {
      if (!zonesLayer) return;
      zonesLayer.clearLayers();

      SECTOR_ZONES.forEach((sec) => {
        const isMySector = hasJurisdiction(sec.name);

        const circle = L.circle([sec.lat, sec.lng], {
          radius: sec.radius,
          color: isMySector ? "#1d4ed8" : sec.color,
          fillColor: sec.color,
          fillOpacity: isMySector ? 0.14 : 0.05,
          weight: isMySector ? 3 : 2,
          dashArray: isMySector ? undefined : "6, 8", // Dotted boundary circles
        });

        circle.bindTooltip(
          `<b>🏛️ ${sec.name}</b><br/><span style="font-size:11px; color:${isMySector ? "#15803d" : "#475569"}; font-weight:600;">${
            isMySector ? "✅ In Your Jurisdiction" : "📍 Sector Boundary Zone"
          }</span>`,
          { permanent: false, direction: "center" }
        );

        zonesLayer.addLayer(circle);
      });
    },
    [hasJurisdiction]
  );

  // Helper: Draw Issue Markers
  const renderIssueMarkers = useCallback(
    (L: any, markersLayer: any, currentIssues: CivicIssue[]) => {
      if (!markersLayer) return;
      markersLayer.clearLayers();

      const geoIssues = currentIssues.filter(
        (i) => i.latitude && i.longitude && i.latitude !== 0 && i.longitude !== 0
      );

      geoIssues.forEach((issue) => {
        const lat = issue.latitude!;
        const lng = issue.longitude!;
        const statusColor = STATUS_COLORS[issue.status] || "#64748b";
        const radius = PRIORITY_SIZES[issue.priority] || 9;
        const isInMySector = hasJurisdiction(issue.sector);

        const marker = L.circleMarker([lat, lng], {
          radius: radius,
          fillColor: statusColor,
          color: isInMySector ? "#ffffff" : "#cbd5e1",
          weight: isInMySector ? 2.5 : 1.5,
          opacity: 1,
          fillOpacity: isInMySector ? 0.95 : 0.6,
        });

        const priorityLabel =
          issue.priority === "URGENT"
            ? "🔴 URGENT"
            : issue.priority === "HIGH"
            ? "🟠 HIGH"
            : issue.priority === "MEDIUM"
            ? "🟡 MEDIUM"
            : "🟢 LOW";

        const statusLabel = issue.status.replace("_", " ");

        marker.bindPopup(
          `<div style="min-width: 220px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
            <div style="font-weight: 700; font-size: 13px; color: #0f172a; margin-bottom: 6px; line-height: 1.3;">
              ${issue.title}
            </div>
            <div style="display: flex; flex-direction: column; gap: 3px; font-size: 11px; color: #475569;">
              <div>📍 <strong>Sector:</strong> ${issue.sector || "Unassigned"}</div>
              <div>📋 <strong>Category:</strong> ${issue.category?.name || "General"}</div>
              <div>⚡ <strong>Priority:</strong> ${priorityLabel}</div>
              <div style="display: inline-flex; align-items: center; gap: 4px;">
                <span style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; background: ${statusColor};"></span>
                <strong>Status:</strong> ${statusLabel}
              </div>
              <div>🏠 <strong>Address:</strong> ${issue.address || issue.locality || "Dehradun"}</div>
              ${
                isInMySector
                  ? `<div style="margin-top: 4px; padding: 3px 6px; background: #f0fdf4; color: #15803d; border-radius: 4px; font-weight: 600; font-size: 10px; text-align: center;">✅ In Your Jurisdiction</div>`
                  : `<div style="margin-top: 4px; padding: 3px 6px; background: #f8fafc; color: #94a3b8; border-radius: 4px; font-weight: 600; font-size: 10px; text-align: center;">🔒 Other Sector</div>`
              }
            </div>
          </div>`,
          { maxWidth: 280 }
        );

        marker.bindTooltip(issue.title, {
          permanent: false,
          direction: "top",
          offset: [0, -radius],
        });

        markersLayer.addLayer(marker);
      });
    },
    [hasJurisdiction]
  );

  // 1. Initialize Leaflet Map instance and render immediately
  useEffect(() => {
    let isMounted = true;

    async function initMap() {
      if (typeof window === "undefined" || !mapContainerRef.current) return;
      if (mapInstanceRef.current) return;

      const L = (await import("leaflet")).default;
      if (!isMounted || !mapContainerRef.current) return;
      LRef.current = L;

      // Clean container if already initialized
      if ((mapContainerRef.current as any)._leaflet_id) {
        (mapContainerRef.current as any)._leaflet_id = null;
      }

      let mapCenter: [number, number] = [30.3165, 78.0322];
      let mapZoom = 13;

      if (userSector) {
        const sectorMatch = userSector.match(/sector[-\s]*(\d+)/i);
        if (sectorMatch) {
          const sectorNum = parseInt(sectorMatch[1]);
          const zone = SECTOR_ZONES[sectorNum - 1];
          if (zone) {
            mapCenter = [zone.lat, zone.lng];
            mapZoom = 14;
          }
        }
      }

      const map = L.map(mapContainerRef.current, {
        center: mapCenter,
        zoom: mapZoom,
        zoomControl: true,
        scrollWheelZoom: true,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; OpenStreetMap contributors | CivicPulse Admin GIS',
        maxZoom: 19,
      }).addTo(map);

      const zonesLayer = L.layerGroup().addTo(map);
      const markersLayer = L.layerGroup().addTo(map);
      zonesLayerRef.current = zonesLayer;
      markersLayerRef.current = markersLayer;
      mapInstanceRef.current = map;

      // Ensure sector dotted boundary circles and markers are rendered immediately
      renderSectorZones(L, zonesLayer);
      renderIssueMarkers(L, markersLayer, issues);

      setTimeout(() => {
        if (isMounted && mapInstanceRef.current) {
          mapInstanceRef.current.invalidateSize();
        }
      }, 250);
    }

    initMap();

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.remove();
        } catch {}
        mapInstanceRef.current = null;
      }
      if (mapContainerRef.current) {
        (mapContainerRef.current as any)._leaflet_id = null;
      }
    };
  }, []); // Run on mount

  // 2. React to userSector changes
  useEffect(() => {
    if (mapInstanceRef.current && zonesLayerRef.current && LRef.current) {
      renderSectorZones(LRef.current, zonesLayerRef.current);

      if (userSector) {
        const sectorMatch = userSector.match(/sector[-\s]*(\d+)/i);
        if (sectorMatch) {
          const sectorNum = parseInt(sectorMatch[1]);
          const zone = SECTOR_ZONES[sectorNum - 1];
          if (zone && mapInstanceRef.current) {
            mapInstanceRef.current.setView([zone.lat, zone.lng], 14, { animate: true });
          }
        }
      }
    }
  }, [userSector, renderSectorZones]);

  // 3. React to issues changes
  useEffect(() => {
    if (mapInstanceRef.current && markersLayerRef.current && LRef.current) {
      renderIssueMarkers(LRef.current, markersLayerRef.current, issues);
    }
  }, [issues, renderIssueMarkers]);

  // Count issues with geo data
  const geoCount = issues.filter(
    (i) => i.latitude && i.longitude && i.latitude !== 0 && i.longitude !== 0
  ).length;

  return (
    <div className="sector-map-card">
      <div className="sector-map-header">
        <div className="sector-map-title">
          <span style={{ fontSize: "1.1rem" }}>🗺️</span>
          <span>{lang === "hi" ? "सेक्टर शिकायत मानचित्र" : "Sector Issue Location Map"}</span>
        </div>
        <div className="sector-map-stats">
          <span className="sector-map-badge">
            📍 {geoCount} {lang === "hi" ? "स्थान चिन्हित" : "geo-tagged"}
          </span>
          <span className="sector-map-badge" style={{ background: "#f0fdf4", color: "#15803d" }}>
            🏛️ {issues.filter((i) => hasJurisdiction(i.sector)).length}{" "}
            {lang === "hi" ? "मेरे सेक्टर में" : "in your sector"}
          </span>
        </div>
      </div>

      {/* Legend */}
      <div className="sector-map-legend">
        <span className="sector-map-legend-title">{lang === "hi" ? "स्थिति" : "Status"}:</span>
        {Object.entries(STATUS_COLORS).map(([status, color]) => (
          <span key={status} className="sector-map-legend-item">
            <span
              style={{
                display: "inline-block",
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: color,
              }}
            />
            <span>{status.replace("_", " ")}</span>
          </span>
        ))}
        <span className="sector-map-legend-divider">|</span>
        <span className="sector-map-legend-title">{lang === "hi" ? "सीमाएं" : "Boundaries"}:</span>
        <span className="sector-map-legend-item">
          <span style={{ display: "inline-block", width: 14, height: 0, borderTop: "2px dashed #94a3b8" }} />
          <span>{lang === "hi" ? "सेक्टर ज़ोन सीमा (Dotted)" : "Sector Zone (Dotted)"}</span>
        </span>
      </div>

      {/* Map container */}
      <div
        ref={mapContainerRef}
        className="sector-map-container"
        style={{ height: "420px" }}
      />

      {geoCount === 0 && (
        <div className="sector-map-empty">
          <span>📍</span>
          <span>
            {lang === "hi"
              ? "कोई भौगोलिक-चिह्नित शिकायत उपलब्ध नहीं है।"
              : "No geo-tagged issues available to display on the map."}
          </span>
        </div>
      )}
    </div>
  );
}
