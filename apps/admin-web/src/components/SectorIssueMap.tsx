"use client";

import { useEffect, useRef } from "react";
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
  LOW: 6,
  MEDIUM: 8,
  HIGH: 10,
  URGENT: 13,
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

  useEffect(() => {
    let isMounted = true;

    async function initMap() {
      if (typeof window === "undefined" || !mapContainerRef.current) return;

      const L = (await import("leaflet")).default;

      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }

      // Find user's sector center or default to Dehradun center
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

      const map = L.map(mapContainerRef.current!, {
        center: mapCenter,
        zoom: mapZoom,
        zoomControl: true,
        scrollWheelZoom: true,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; OpenStreetMap contributors | CivicPulse Admin GIS',
        maxZoom: 19,
      }).addTo(map);

      // Draw sector boundary circles
      SECTOR_ZONES.forEach((sec) => {
        const isMySector = hasJurisdiction(sec.name);
        const circle = L.circle([sec.lat, sec.lng], {
          radius: sec.radius,
          color: isMySector ? sec.color : "#94a3b8",
          fillColor: isMySector ? sec.color : "#94a3b8",
          fillOpacity: isMySector ? 0.1 : 0.04,
          weight: isMySector ? 2.5 : 1,
          dashArray: isMySector ? undefined : "6, 8",
        }).addTo(map);

        circle.bindTooltip(
          `<b>🏛️ ${sec.name}</b><br/><span style="font-size:10px; color:#475569;">${
            isMySector ? "Your Jurisdiction Zone" : "Other Sector"
          }</span>`,
          { permanent: false, direction: "center" }
        );
      });

      // Filter issues with valid coordinates
      const geoIssues = issues.filter(
        (i) => i.latitude && i.longitude && i.latitude !== 0 && i.longitude !== 0
      );

      // Plot issue markers
      geoIssues.forEach((issue) => {
        const lat = issue.latitude!;
        const lng = issue.longitude!;
        const statusColor = STATUS_COLORS[issue.status] || "#64748b";
        const radius = PRIORITY_SIZES[issue.priority] || 8;
        const isInMySector = hasJurisdiction(issue.sector);

        const marker = L.circleMarker([lat, lng], {
          radius: radius,
          fillColor: statusColor,
          color: isInMySector ? "#ffffff" : "#e2e8f0",
          weight: isInMySector ? 2.5 : 1.5,
          opacity: 1,
          fillOpacity: isInMySector ? 0.9 : 0.5,
        }).addTo(map);

        // Tooltip with issue details
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
              ${isInMySector
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
      });

      mapInstanceRef.current = map;

      // Fix Leaflet sizing on next tick
      setTimeout(() => {
        if (isMounted && mapInstanceRef.current) {
          mapInstanceRef.current.invalidateSize();
        }
      }, 200);
    }

    initMap();

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [issues, userSector]);

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
        <span className="sector-map-legend-title">{lang === "hi" ? "आकार = प्राथमिकता" : "Size = Priority"}</span>
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
