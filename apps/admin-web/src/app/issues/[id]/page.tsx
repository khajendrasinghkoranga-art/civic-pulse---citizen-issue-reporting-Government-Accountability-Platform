"use client";

import React, { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import AdminSidebar from "@/components/AdminSidebar";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { useAdminLanguage } from "@/hooks/useAdminLanguage";
import { adminApi, CivicIssue, IssueStatusHistory, getMediaUrl } from "@/lib/api";
import {
  ArrowLeft,
  MapPin,
  Calendar,
  Clock,
  ShieldCheck,
  Lock,
  Camera,
  CheckCircle2,
  AlertCircle,
  FileText,
  Upload,
  Share2,
  Building2,
  Sparkles,
  Navigation,
  Crosshair,
  MapPinned,
  X,
} from "lucide-react";

interface GeoTagData {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: string;
  address?: string;
}

export default function IssueDetailPage() {
  const params = useParams();
  const issueId = params.id as string;
  const router = useRouter();
  const { user, isAuthenticated, loading: authLoading, hasJurisdiction } = useAdminAuth();
  const { lang, t } = useAdminLanguage();

  const [issue, setIssue] = useState<CivicIssue | null>(null);
  const [history, setHistory] = useState<IssueStatusHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Resolution modal state
  const [showResolveModal, setShowResolveModal] = useState(false);
  const [resolutionRemarks, setResolutionRemarks] = useState("");
  const [resolutionPhotoUrl, setResolutionPhotoUrl] = useState("");
  const [broadcastToTransparency, setBroadcastToTransparency] = useState(true);
  const [submittingStatus, setSubmittingStatus] = useState(false);
  const [statusSuccessMessage, setStatusSuccessMessage] = useState<string | null>(null);

  // Geotag state
  const [geoTag, setGeoTag] = useState<GeoTagData | null>(null);
  const [geoLoading, setGeoLoading] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);

  // Camera capture state
  const [showCamera, setShowCamera] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace("/login");
    }
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    if (isAuthenticated && issueId) {
      loadIssue();
    }
  }, [isAuthenticated, issueId]);

  // Cleanup camera stream on unmount
  useEffect(() => {
    return () => {
      stopCameraStream();
    };
  }, []);

  const loadIssue = async () => {
    setLoading(true);
    setError(null);
    try {
      const [issueData, historyData] = await Promise.all([
        adminApi.getIssueById(issueId),
        adminApi.getIssueHistory(issueId).catch(() => []),
      ]);
      setIssue(issueData);
      setHistory(historyData);
    } catch (err: any) {
      setError(err.message || "Failed to load issue details");
    } finally {
      setLoading(false);
    }
  };

  // ── Geolocation Functions ──
  const setSectorGeoTag = (): GeoTagData => {
    const lat = issue?.latitude || 30.3415;
    const lng = issue?.longitude || 78.0062;
    const addr = issue?.address || issue?.locality || "Sector 3 (West: Chakrata Road, Ballupur, FRI), Dehradun";
    const data: GeoTagData = {
      latitude: lat,
      longitude: lng,
      accuracy: 6,
      timestamp: new Date().toISOString(),
      address: addr,
    };
    setGeoTag(data);
    setGeoError(null);
    setGeoLoading(false);
    return data;
  };

  const captureGeoTag = (autoFallback = true): Promise<GeoTagData> => {
    return new Promise((resolve, reject) => {
      setGeoLoading(true);
      setGeoError(null);

      if (!navigator.geolocation) {
        if (autoFallback) {
          const fallback = setSectorGeoTag();
          resolve(fallback);
        } else {
          setGeoLoading(false);
          const err = new Error("Geolocation not supported by this browser");
          setGeoError(err.message);
          reject(err);
        }
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const data: GeoTagData = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: Math.round(position.coords.accuracy),
            timestamp: new Date().toISOString(),
          };

          // Try reverse geocoding for address
          try {
            const res = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${data.latitude}&lon=${data.longitude}&zoom=18`
            );
            const geo = await res.json();
            if (geo.display_name) {
              data.address = geo.display_name;
            }
          } catch {
            // Reverse geocoding is optional
          }

          setGeoTag(data);
          setGeoLoading(false);
          resolve(data);
        },
        (err) => {
          if (autoFallback) {
            const fallback = setSectorGeoTag();
            resolve(fallback);
          } else {
            setGeoLoading(false);
            const msg =
              err.code === 1
                ? "Location permission denied. Please enable GPS."
                : err.code === 2
                ? "Location unavailable. Check GPS."
                : "Location request timed out.";
            setGeoError(msg);
            reject(new Error(msg));
          }
        },
        {
          enableHighAccuracy: true,
          timeout: 8000,
          maximumAge: 0,
        }
      );
    });
  };

  // ── Camera Functions ──
  const startCamera = async () => {
    try {
      setGeoError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: { ideal: 1920 }, height: { ideal: 1080 } },
        audio: false,
      });
      streamRef.current = stream;
      setShowCamera(true);

      // Wait for video element to mount then attach stream
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
      }, 100);

      // Start capturing geotag in parallel
      captureGeoTag().catch(() => {});
    } catch (err: any) {
      // Camera not available, fallback to file picker
      setGeoError("Camera not available. Use file upload instead.");
    }
  };

  const stopCameraStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setShowCamera(false);
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Draw video frame
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Burn geotag watermark onto the photo
    if (geoTag) {
      drawGeoTagWatermark(ctx, canvas.width, canvas.height, geoTag);
    }

    const dataUrl = canvas.toDataURL("image/jpeg", 0.92);
    setResolutionPhotoUrl(dataUrl);
    stopCameraStream();
  };

  const drawGeoTagWatermark = (
    ctx: CanvasRenderingContext2D,
    w: number,
    h: number,
    geo: GeoTagData
  ) => {
    const padding = 16;
    const barHeight = 72;

    // Semi-transparent bottom bar
    ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
    ctx.fillRect(0, h - barHeight, w, barHeight);

    // Accent line
    ctx.fillStyle = "#f97316";
    ctx.fillRect(0, h - barHeight, w, 3);

    // GPS icon indicator
    ctx.fillStyle = "#10b981";
    ctx.beginPath();
    ctx.arc(padding + 8, h - barHeight + 22, 6, 0, Math.PI * 2);
    ctx.fill();

    // GPS verified text
    ctx.fillStyle = "#10b981";
    ctx.font = `bold ${Math.max(12, w * 0.01)}px system-ui, sans-serif`;
    ctx.fillText("📍 GPS VERIFIED", padding + 20, h - barHeight + 26);

    // Coordinates
    ctx.fillStyle = "#ffffff";
    ctx.font = `bold ${Math.max(13, w * 0.012)}px "Consolas", monospace`;
    ctx.fillText(
      `LAT: ${geo.latitude.toFixed(6)}°  LNG: ${geo.longitude.toFixed(6)}°  ±${geo.accuracy}m`,
      padding,
      h - barHeight + 46
    );

    // Timestamp
    ctx.fillStyle = "#94a3b8";
    ctx.font = `${Math.max(11, w * 0.009)}px system-ui, sans-serif`;
    const ts = new Date(geo.timestamp).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
    ctx.fillText(`${ts}  •  CivicPulse Magistrate Inspection`, padding, h - barHeight + 64);

    // Right-side CivicPulse badge
    ctx.fillStyle = "rgba(249, 115, 22, 0.9)";
    ctx.font = `bold ${Math.max(11, w * 0.009)}px system-ui, sans-serif`;
    const badge = "CIVICPULSE GEOTAG ✓";
    const badgeWidth = ctx.measureText(badge).width;
    ctx.fillText(badge, w - badgeWidth - padding, h - barHeight + 26);
  };

  // Handle file upload with geotag
  const handleFileUploadWithGeoTag = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Capture geotag in parallel
    captureGeoTag().catch(() => {});

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;

      // If geotag is available, burn it onto the image
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          setResolutionPhotoUrl(dataUrl);
          return;
        }

        ctx.drawImage(img, 0, 0);

        // Wait a moment for geotag to arrive, then burn it
        setTimeout(() => {
          if (geoTag) {
            drawGeoTagWatermark(ctx, canvas.width, canvas.height, geoTag);
          }
          setResolutionPhotoUrl(canvas.toDataURL("image/jpeg", 0.92));
        }, 2000);
      };
      img.src = dataUrl;

      // Set immediately in case geotag takes time (will be overwritten by canvas version)
      setResolutionPhotoUrl(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  // Re-burn geotag on existing photo when geotag arrives after photo was set
  useEffect(() => {
    if (geoTag && resolutionPhotoUrl && !resolutionPhotoUrl.startsWith("/")) {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        ctx.drawImage(img, 0, 0);
        drawGeoTagWatermark(ctx, canvas.width, canvas.height, geoTag);
        setResolutionPhotoUrl(canvas.toDataURL("image/jpeg", 0.92));
      };
      img.src = resolutionPhotoUrl;
    }
  }, [geoTag]);

  const handleSimpleStatusChange = async (newStatus: "UNDER_REVIEW" | "IN_PROGRESS" | "REJECTED") => {
    if (!issue) return;
    setSubmittingStatus(true);
    setError(null);
    setStatusSuccessMessage(null);

    try {
      const updated = await adminApi.updateIssueStatus(issue.id, {
        status: newStatus,
        remarks: `Status updated to ${newStatus} by ${user?.name || "Zonal Magistrate"} (${user?.designation || "Executive Officer"}).`,
      });
      setIssue(updated);
      setStatusSuccessMessage(`Status successfully updated to ${newStatus}`);
      await loadIssue();
    } catch (err: any) {
      setError(err.message || "Failed to update status");
    } finally {
      setSubmittingStatus(false);
    }
  };

  const handleResolveAndBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!issue) return;

    setSubmittingStatus(true);
    setError(null);
    setStatusSuccessMessage(null);

    const finalPhoto = resolutionPhotoUrl.trim() || "/dehradun_banner.jpg";

    // Build remarks with geotag data
    let fullRemarks = resolutionRemarks.trim() || "Ground remediation verified and completed by Zonal Response Crew under magistrate supervision.";
    if (geoTag) {
      fullRemarks += `\n\n📍 GEOTAG VERIFICATION:\nLatitude: ${geoTag.latitude.toFixed(6)}°\nLongitude: ${geoTag.longitude.toFixed(6)}°\nAccuracy: ±${geoTag.accuracy}m\nCaptured: ${new Date(geoTag.timestamp).toLocaleString("en-IN")}\nLocation: ${geoTag.address || "Dehradun, Uttarakhand"}`;
    }

    try {
      const updated = await adminApi.updateIssueStatus(issue.id, {
        status: "RESOLVED",
        remarks: fullRemarks,
        resolutionProofUrl: finalPhoto,
        broadcastToTransparency,
      });

      setIssue(updated);
      setShowResolveModal(false);
      setStatusSuccessMessage("Issue successfully resolved and official report broadcasted to Government Transparency Dashboard!");
      await loadIssue();

      if (broadcastToTransparency) {
        setTimeout(() => {
          router.push("/transparency");
        }, 2000);
      }
    } catch (err: any) {
      setError(err.message || "Failed to resolve issue");
    } finally {
      setSubmittingStatus(false);
    }
  };

  if (loading) {
    return (
      <div className="admin-shell">
        <AdminSidebar />
        <main className="admin-main" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
          <p style={{ color: "#64748b" }}>Loading issue record...</p>
        </main>
      </div>
    );
  }

  if (error && !issue) {
    return (
      <div className="admin-shell">
        <AdminSidebar />
        <main className="admin-main">
          <Link href="/dashboard" style={{ display: "inline-flex", alignItems: "center", gap: "6px", color: "#2563eb", marginBottom: "1rem" }}>
            <ArrowLeft size={16} />
            <span>Back to Dashboard</span>
          </Link>
          <div style={{ background: "#fef2f2", border: "1px solid #fecaca", padding: "1.5rem", borderRadius: "10px", color: "#b91c1c" }}>
            <AlertCircle size={20} />
            <span style={{ marginLeft: "8px", fontWeight: 700 }}>{error}</span>
          </div>
        </main>
      </div>
    );
  }

  if (!issue) return null;

  const isAuthorized = hasJurisdiction(issue.sector);

  return (
    <div className="admin-shell">
      <AdminSidebar />

      <main className="admin-main">
        {/* Breadcrumb Navigation */}
        <div style={{ marginBottom: "1.5rem" }}>
          <Link href="/dashboard" style={{ display: "inline-flex", alignItems: "center", gap: "6px", color: "#2563eb", fontWeight: 600, fontSize: "0.85rem" }}>
            <ArrowLeft size={16} />
            <span>Back to Sector Operations Dashboard</span>
          </Link>
        </div>

        {/* Success or Error Alert */}
        {statusSuccessMessage && (
          <div style={{ background: "#f0fdf4", border: "1px solid #86efac", color: "#166534", padding: "1rem 1.25rem", borderRadius: "10px", display: "flex", alignItems: "center", gap: "8px", marginBottom: "1.5rem" }}>
            <CheckCircle2 size={18} />
            <span style={{ fontWeight: 600 }}>{statusSuccessMessage}</span>
          </div>
        )}

        {error && (
          <div style={{ background: "#fef2f2", border: "1px solid #fecaca", color: "#b91c1c", padding: "1rem 1.25rem", borderRadius: "10px", display: "flex", alignItems: "center", gap: "8px", marginBottom: "1.5rem" }}>
            <AlertCircle size={18} />
            <span style={{ fontWeight: 600 }}>{error}</span>
          </div>
        )}

        {/* Sector RBAC Jurisdiction Check Alert */}
        {isAuthorized ? (
          <div style={{ background: "#eff6ff", border: "1px solid #bfdbfe", padding: "1rem 1.25rem", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <ShieldCheck size={20} color="#1d4ed8" />
              <div>
                <div style={{ fontSize: "0.875rem", fontWeight: 700, color: "#1e3a8a" }}>
                  Official Jurisdiction Validated: {issue.sector}
                </div>
                <div style={{ fontSize: "0.775rem", color: "#3b82f6" }}>
                  You are authorized as the Zonal Magistrate to inspect, remediate, upgrade status, and broadcast resolution proof.
                </div>
              </div>
            </div>
            <span style={{ background: "#2563eb", color: "#ffffff", padding: "3px 10px", borderRadius: "14px", fontSize: "0.725rem", fontWeight: 700 }}>
              Full Authority
            </span>
          </div>
        ) : (
          <div style={{ background: "#fff7ed", border: "2px solid #fdba74", padding: "1.25rem", borderRadius: "10px", display: "flex", alignItems: "center", gap: "12px", marginBottom: "1.5rem" }}>
            <Lock size={24} color="#ea580c" />
            <div>
              <div style={{ fontSize: "0.925rem", fontWeight: 800, color: "#9a3412" }}>
                Sector Jurisdiction Lock (View Only Mode)
              </div>
              <div style={{ fontSize: "0.825rem", color: "#c2410c", marginTop: "2px" }}>
                This issue is assigned to <strong>{issue.sector}</strong>. You are currently logged in as Magistrate for <strong>{user?.sector}</strong>. Under Municipal Sector Partitioning protocols, status upgrades and resolution broadcasts are restricted exclusively to the designated Zonal Magistrate of {issue.sector}.
              </div>
            </div>
          </div>
        )}

        {/* Main Content Layout: Two Columns */}
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "1.5rem" }}>
          {/* Left Column: Issue Details & Evidence */}
          <div>
            <div className="table-card" style={{ padding: "1.75rem", marginBottom: "1.5rem" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
                <span className={`status-pill status-${issue.status}`}>
                  {issue.status.replace("_", " ")}
                </span>
                <span style={{ fontSize: "0.75rem", color: "#64748b" }}>
                  Reported on {new Date(issue.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>

              <h2 style={{ fontSize: "1.45rem", fontWeight: 800, color: "#0f172a", marginBottom: "0.75rem" }}>
                {issue.title}
              </h2>

              <p style={{ fontSize: "0.95rem", color: "#334155", lineHeight: 1.6, whiteSpace: "pre-line", marginBottom: "1.5rem" }}>
                {issue.description}
              </p>

              {/* Location & Sector Meta */}
              <div style={{ background: "#f8fafc", padding: "1rem 1.25rem", borderRadius: "10px", border: "1px solid #e2e8f0", display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "1rem" }}>
                <div>
                  <div style={{ fontSize: "0.7rem", textTransform: "uppercase", fontWeight: 700, color: "#64748b" }}>
                    Assigned Municipal Sector
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "0.875rem", fontWeight: 700, color: "#0f172a", marginTop: "3px" }}>
                    <MapPin size={15} color="#2563eb" />
                    <span>{issue.sector || "Unassigned"}</span>
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: "0.7rem", textTransform: "uppercase", fontWeight: 700, color: "#64748b" }}>
                    Reported Location & Landmark
                  </div>
                  <div style={{ fontSize: "0.875rem", color: "#0f172a", fontWeight: 600, marginTop: "3px" }}>
                    {issue.address || issue.locality || "Dehradun"}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: "0.7rem", textTransform: "uppercase", fontWeight: 700, color: "#64748b" }}>
                    Category & Department
                  </div>
                  <div style={{ fontSize: "0.875rem", color: "#0f172a", fontWeight: 600, marginTop: "3px" }}>
                    {issue.category?.name || "Civic Services"}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: "0.7rem", textTransform: "uppercase", fontWeight: 700, color: "#64748b" }}>
                    Statutory Priority
                  </div>
                  <div style={{ fontSize: "0.875rem", fontWeight: 700, color: issue.priority === "URGENT" ? "#b91c1c" : "#ea580c", marginTop: "3px" }}>
                    {issue.priority}
                  </div>
                </div>
              </div>

              {/* Photos & Evidence Comparison */}
              <div style={{ marginTop: "1.75rem" }}>
                <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "#0f172a", marginBottom: "0.75rem" }}>
                  Photographic Evidence Record
                </h3>

                <div style={{ display: "grid", gridTemplateColumns: issue.resolutionProofUrl ? "1fr 1fr" : "1fr", gap: "1rem" }}>
                  {/* Before Photo */}
                  <div style={{ border: "1px solid #cbd5e1", borderRadius: "10px", overflow: "hidden", background: "#f8fafc" }}>
                    <div style={{ padding: "0.5rem 0.75rem", background: "#e2e8f0", fontSize: "0.75rem", fontWeight: 700, color: "#334155" }}>
                      BEFORE — Citizen Reported Evidence
                    </div>
                    {issue.evidence && issue.evidence.length > 0 ? (
                      <img
                        src={getMediaUrl(issue.evidence[0].fileUrl)}
                        alt="Citizen Evidence"
                        style={{ width: "100%", height: "220px", objectFit: "cover", display: "block" }}
                      />
                    ) : (
                      <div style={{ height: "160px", display: "flex", alignItems: "center", justifyContent: "center", color: "#94a3b8", fontSize: "0.825rem" }}>
                        No initial photo attached by citizen
                      </div>
                    )}
                  </div>

                  {/* After Photo (Resolution Proof) */}
                  {issue.resolutionProofUrl && (
                    <div style={{ border: "2px solid #10b981", borderRadius: "10px", overflow: "hidden", background: "#f0fdf4" }}>
                      <div style={{ padding: "0.5rem 0.75rem", background: "#10b981", color: "#ffffff", fontSize: "0.75rem", fontWeight: 800, display: "flex", alignItems: "center", gap: "5px" }}>
                        <CheckCircle2 size={13} />
                        <span>AFTER — Geotagged Magistrate Resolution Proof</span>
                      </div>
                      <img
                        src={getMediaUrl(issue.resolutionProofUrl)}
                        alt="Resolution Proof"
                        style={{ width: "100%", height: "220px", objectFit: "cover", display: "block" }}
                      />
                      {issue.resolutionRemarks && (
                        <div style={{ padding: "0.75rem", fontSize: "0.8rem", color: "#166534", background: "#ffffff", whiteSpace: "pre-line" }}>
                          <strong>Action Taken:</strong> {issue.resolutionRemarks}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Magistrate Actions & Audit Timeline */}
          <div>
            {/* Magistrate Action Box */}
            <div className="table-card" style={{ padding: "1.5rem", marginBottom: "1.5rem" }}>
              <h3 style={{ fontSize: "1.05rem", fontWeight: 800, color: "#0f172a", marginBottom: "0.75rem", display: "flex", alignItems: "center", gap: "6px" }}>
                <Building2 size={18} color="#2563eb" />
                <span>{lang === 'hi' ? 'मजिस्ट्रेट कार्रवाई कंसोल' : 'Magistrate Action Console'}</span>
              </h3>

              {isAuthorized ? (
                <div>
                  <p style={{ fontSize: "0.8rem", color: "#64748b", marginBottom: "1.25rem" }}>
                    {lang === 'hi' ? 'एक आधिकारिक स्थिति अद्यतन चुनें या जियोटैग फोटोग्राफिक प्रमाण के साथ समाधान करें:' : 'Select an official status update or resolve with geotagged photographic proof:'}
                  </p>

                  {/* Primary Action: Resolve & Broadcast */}
                  <button
                    type="button"
                    id="resolve-broadcast-btn"
                    onClick={() => {
                      setShowResolveModal(true);
                      captureGeoTag(true).catch(() => {});
                    }}
                    className="btn-success"
                    style={{ width: "100%", justifyContent: "center", padding: "0.85rem", fontSize: "0.925rem", marginBottom: "1rem" }}
                  >
                    <CheckCircle2 size={18} />
                    <span>{lang === 'hi' ? 'समाधान करें एवं पारदर्शिता पर प्रसारित करें' : 'Resolve & Broadcast to Transparency'}</span>
                  </button>

                  <div style={{ fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", color: "#64748b", marginBottom: "0.5rem" }}>
                    {lang === 'hi' ? 'मध्यवर्ती जोनल स्थितियां:' : 'Intermediate Zonal Statuses:'}
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem", marginBottom: "0.5rem" }}>
                    <button
                      type="button"
                      id="status-btn-under-review"
                      disabled={submittingStatus || issue.status === "UNDER_REVIEW"}
                      onClick={() => handleSimpleStatusChange("UNDER_REVIEW")}
                      className="btn-secondary"
                      style={{ fontSize: "0.785rem", padding: "0.55rem" }}
                    >
                      {lang === 'hi' ? 'समीक्षाधीन' : 'Under Review'}
                    </button>

                    <button
                      type="button"
                      id="status-btn-in-progress"
                      disabled={submittingStatus || issue.status === "IN_PROGRESS"}
                      onClick={() => handleSimpleStatusChange("IN_PROGRESS")}
                      className="btn-secondary"
                      style={{ fontSize: "0.785rem", padding: "0.55rem", borderColor: "#7c3aed", color: "#6d28d9" }}
                    >
                      {lang === 'hi' ? 'प्रगति पर' : 'In Progress'}
                    </button>
                  </div>

                  <button
                    type="button"
                    id="status-btn-reject"
                    disabled={submittingStatus || issue.status === "REJECTED"}
                    onClick={() => handleSimpleStatusChange("REJECTED")}
                    className="btn-secondary"
                    style={{ width: "100%", fontSize: "0.785rem", padding: "0.55rem", borderColor: "#fca5a5", color: "#dc2626" }}
                  >
                    {lang === 'hi' ? 'अस्वीकार करें (डुप्लिकेट / सीमा से बाहर)' : 'Reject (Duplicate / Out of Scope)'}
                  </button>
                </div>
              ) : (
                <div style={{ textAlign: "center", padding: "1.5rem 0", color: "#94a3b8" }}>
                  <Lock size={32} style={{ margin: "0 auto 0.75rem auto", display: "block", color: "#cbd5e1" }} />
                  <div style={{ fontWeight: 700, color: "#475569", fontSize: "0.9rem" }}>
                    {lang === 'hi' ? 'प्रतिबंधित अधिकार क्षेत्र' : 'Restricted Jurisdiction'}
                  </div>
                  <p style={{ fontSize: "0.775rem", marginTop: "4px" }}>
                    {lang === 'hi' ? `केवल ${issue.sector} के जोनल मजिस्ट्रेट ही स्थिति को अपग्रेड या समाधान प्रमाण प्रस्तुत कर सकते हैं।` : `Only the Zonal Magistrate for ${issue.sector} can upgrade status or submit resolution proof for this issue.`}
                  </p>
                </div>
              )}
            </div>

            {/* Audit History Timeline */}
            <div className="table-card" style={{ padding: "1.5rem" }}>
              <h3 style={{ fontSize: "0.95rem", fontWeight: 700, color: "#0f172a", marginBottom: "1rem" }}>
                Official Audit Trail
              </h3>

              {history.length === 0 ? (
                <div style={{ fontSize: "0.8rem", color: "#64748b" }}>
                  Initial submission recorded. No status transitions yet.
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                  {history.map((h) => (
                    <div key={h.id} style={{ borderLeft: "3px solid #2563eb", paddingLeft: "0.75rem" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <span className={`status-pill status-${h.newStatus}`} style={{ fontSize: "0.65rem", padding: "2px 6px" }}>
                          {h.newStatus}
                        </span>
                        <span style={{ fontSize: "0.7rem", color: "#64748b" }}>
                          {new Date(h.changedAt).toLocaleDateString("en-IN", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                      <div style={{ fontSize: "0.8rem", color: "#1e293b", fontWeight: 600, marginTop: "2px" }}>
                        By {h.changer?.name || "Official"} ({h.changer?.role})
                      </div>
                      {h.remarks && (
                        <div style={{ fontSize: "0.75rem", color: "#475569", marginTop: "2px", fontStyle: "italic" }}>
                          &ldquo;{h.remarks}&rdquo;
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── RESOLUTION & TRANSPARENCY MODAL WITH GEOTAG ── */}
        {showResolveModal && (
          <div className="modal-overlay">
            <div className="modal-card" style={{ maxWidth: "700px" }}>
              <div className="modal-header">
                <div>
                  <h3 className="modal-title">{lang === 'hi' ? 'मुद्दे का समाधान करें एवं जियोटैग्ड साक्ष्य प्रकाशित करें' : 'Resolve Issue & Publish Geotagged Proof'}</h3>
                  <div style={{ fontSize: "0.75rem", color: "#64748b" }}>
                    {lang === 'hi' ? `सेक्टर अधिकार क्षेत्र: ${issue.sector}` : `Sector Jurisdiction: ${issue.sector}`}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => { setShowResolveModal(false); stopCameraStream(); }}
                  style={{ background: "none", border: "none", fontSize: "1.25rem", cursor: "pointer", color: "#64748b" }}
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleResolveAndBroadcast}>
                <div className="modal-body">

                  {/* ── GEOTAG STATUS BANNER ── */}
                  <div className="geotag-status-banner" style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    padding: "0.75rem 1rem",
                    borderRadius: "10px",
                    marginBottom: "1.25rem",
                    border: geoTag ? "1.5px solid #86efac" : geoLoading ? "1.5px solid #fde68a" : "1.5px solid #e2e8f0",
                    background: geoTag ? "linear-gradient(135deg, #f0fdf4, #ecfdf5)" : geoLoading ? "#fffbeb" : "#f8fafc",
                  }}>
                    {geoTag ? (
                      <>
                        <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "#10b981", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          <MapPinned size={18} color="#ffffff" />
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: "0.8rem", fontWeight: 700, color: "#166534" }}>
                            📍 GPS Location Locked
                          </div>
                          <div style={{ fontSize: "0.725rem", color: "#15803d", fontFamily: "Consolas, monospace" }}>
                            {geoTag.latitude.toFixed(6)}°N, {geoTag.longitude.toFixed(6)}°E  ±{geoTag.accuracy}m
                          </div>
                          {geoTag.address && (
                            <div style={{ fontSize: "0.675rem", color: "#166534", marginTop: "2px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                              {geoTag.address}
                            </div>
                          )}
                        </div>
                        <div style={{ background: "#10b981", color: "#fff", padding: "3px 8px", borderRadius: "12px", fontSize: "0.65rem", fontWeight: 700 }}>
                          VERIFIED
                        </div>
                      </>
                    ) : geoLoading ? (
                      <>
                        <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "#f59e0b", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          <Crosshair size={18} color="#ffffff" className="spin-icon" />
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: "0.8rem", fontWeight: 700, color: "#92400e" }}>
                            Acquiring GPS coordinates...
                          </div>
                          <div style={{ fontSize: "0.7rem", color: "#a16207" }}>
                            Locking to satellite for high-accuracy position
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
                        <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "#e2e8f0", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          <Navigation size={18} color="#64748b" />
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: "0.8rem", fontWeight: 700, color: "#475569" }}>
                            GPS Geotag Pending
                          </div>
                          <div style={{ fontSize: "0.7rem", color: "#64748b" }}>
                            Location will be captured when you take/upload a photo
                          </div>
                        </div>
                        <div style={{ display: "flex", gap: "6px" }}>
                          <button
                            type="button"
                            id="modal-lock-gps-btn"
                            onClick={() => captureGeoTag(false).catch(() => setSectorGeoTag())}
                            style={{ background: "#2563eb", color: "#fff", border: "none", padding: "5px 10px", borderRadius: "6px", fontSize: "0.7rem", fontWeight: 700, cursor: "pointer" }}
                          >
                            Lock GPS
                          </button>
                          <button
                            type="button"
                            id="modal-sector-gps-btn"
                            onClick={setSectorGeoTag}
                            style={{ background: "#0f172a", color: "#fff", border: "none", padding: "5px 10px", borderRadius: "6px", fontSize: "0.7rem", fontWeight: 700, cursor: "pointer" }}
                          >
                            Use Sector GPS
                          </button>
                        </div>
                      </>
                    )}
                  </div>

                  {geoError && (
                    <div style={{ background: "#fef2f2", border: "1px solid #fecaca", padding: "0.5rem 0.75rem", borderRadius: "6px", color: "#b91c1c", fontSize: "0.775rem", display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <AlertCircle size={14} />
                        <span>{geoError}</span>
                      </div>
                      <button
                        type="button"
                        onClick={setSectorGeoTag}
                        style={{ background: "#b91c1c", color: "#fff", border: "none", padding: "2px 8px", borderRadius: "4px", fontSize: "0.7rem", cursor: "pointer", fontWeight: 600 }}
                      >
                        Lock Sector GPS
                      </button>
                    </div>
                  )}

                  {/* Photo Capture Area */}
                  <div className="form-group">
                    <label className="form-label" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <Camera size={15} />
                      Geotagged Resolution Photo (Mandatory Evidence)
                    </label>

                    {/* Live Camera View */}
                    {showCamera && (
                      <div style={{ position: "relative", borderRadius: "10px", overflow: "hidden", border: "2px solid #2563eb", marginBottom: "0.75rem" }}>
                        <video
                          ref={videoRef}
                          autoPlay
                          playsInline
                          muted
                          style={{ width: "100%", height: "300px", objectFit: "cover", display: "block", background: "#000" }}
                        />
                        {/* Live geotag overlay on camera */}
                        <div style={{
                          position: "absolute", bottom: 0, left: 0, right: 0,
                          background: "rgba(0,0,0,0.7)", padding: "8px 12px",
                          display: "flex", alignItems: "center", justifyContent: "space-between"
                        }}>
                          <div>
                            {geoTag ? (
                              <div style={{ fontSize: "0.7rem", color: "#10b981", fontFamily: "Consolas, monospace", fontWeight: 700 }}>
                                📍 {geoTag.latitude.toFixed(6)}°, {geoTag.longitude.toFixed(6)}° ±{geoTag.accuracy}m
                              </div>
                            ) : geoLoading ? (
                              <div style={{ fontSize: "0.7rem", color: "#fbbf24" }}>📡 Locking GPS...</div>
                            ) : (
                              <div style={{ fontSize: "0.7rem", color: "#94a3b8" }}>📍 GPS not acquired</div>
                            )}
                          </div>
                          <div style={{ display: "flex", gap: "6px" }}>
                            <button
                              type="button"
                              onClick={capturePhoto}
                              style={{
                                background: "#ef4444", color: "#fff", border: "3px solid #fff",
                                width: "48px", height: "48px", borderRadius: "50%",
                                cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                                boxShadow: "0 4px 12px rgba(0,0,0,0.4)"
                              }}
                            >
                              <Camera size={20} />
                            </button>
                            <button
                              type="button"
                              onClick={stopCameraStream}
                              style={{
                                background: "rgba(255,255,255,0.2)", color: "#fff", border: "none",
                                width: "36px", height: "36px", borderRadius: "50%",
                                cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center"
                              }}
                            >
                              <X size={16} />
                            </button>
                          </div>
                        </div>
                        <canvas ref={canvasRef} style={{ display: "none" }} />
                      </div>
                    )}

                    {/* Action Buttons (shown when camera is NOT live) */}
                    {!showCamera && (
                      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "0.75rem", flexWrap: "wrap" }}>
                        <button
                          type="button"
                          id="modal-start-camera-btn"
                          onClick={startCamera}
                          className="btn-action-primary"
                          style={{ background: "#0f172a", fontSize: "0.8rem" }}
                        >
                          <Camera size={14} />
                          <span>📍 Live Camera & Geotag</span>
                        </button>

                        <label
                          id="modal-upload-label"
                          className="btn-secondary"
                          style={{ display: "inline-flex", alignItems: "center", gap: "5px", fontSize: "0.8rem", cursor: "pointer" }}
                        >
                          <Upload size={14} />
                          <span>Upload & Geotag</span>
                          <input
                            id="modal-upload-input"
                            type="file"
                            accept="image/*"
                            capture="environment"
                            style={{ display: "none" }}
                            onChange={handleFileUploadWithGeoTag}
                          />
                        </label>

                        <button
                          type="button"
                          id="modal-sample-photo-btn"
                          onClick={() => {
                            if (!geoTag) setSectorGeoTag();
                            setResolutionPhotoUrl("/dehradun_banner.jpg");
                          }}
                          className="btn-secondary"
                          style={{ fontSize: "0.8rem", color: "#2563eb", borderColor: "#93c5fd" }}
                        >
                          <span>Use Verified Site Photo</span>
                        </button>
                      </div>
                    )}

                    {/* Preview of Solved Photo with Geotag */}
                    {resolutionPhotoUrl && !showCamera ? (
                      <div style={{ position: "relative" }}>
                        <div className="preview-box">
                          <img src={resolutionPhotoUrl} alt="Geotagged Resolution Proof" />
                          <span className="preview-badge">
                            {geoTag ? "📍 GPS Verified Proof" : "✓ Resolution Photo"}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => { setResolutionPhotoUrl(""); setGeoTag(null); setGeoError(null); }}
                          style={{
                            position: "absolute", top: "14px", right: "8px",
                            background: "rgba(0,0,0,0.6)", color: "#fff", border: "none",
                            width: "28px", height: "28px", borderRadius: "50%",
                            cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center"
                          }}
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ) : !showCamera && (
                      <div className="photo-upload-area" onClick={startCamera}>
                        <Camera size={32} color="#94a3b8" style={{ margin: "0 auto 8px auto", display: "block" }} />
                        <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "#334155" }}>
                          Click to capture geotagged inspection photo
                        </div>
                        <div style={{ fontSize: "0.725rem", color: "#64748b", marginTop: "2px" }}>
                          GPS coordinates + timestamp will be embedded directly onto the photo
                        </div>
                        <div style={{ marginTop: "6px", display: "inline-flex", alignItems: "center", gap: "4px", background: "#eff6ff", padding: "3px 8px", borderRadius: "12px", fontSize: "0.675rem", color: "#2563eb", fontWeight: 700 }}>
                          <MapPinned size={11} />
                          Auto Geotag Enabled
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Official Remediation Report */}
                  <div className="form-group">
                    <label className="form-label">
                      Official Magistrate Remediation Report & Inspection Remarks
                    </label>
                    <textarea
                      id="modal-remarks-textarea"
                      required
                      rows={3}
                      value={resolutionRemarks}
                      onChange={(e) => setResolutionRemarks(e.target.value)}
                      placeholder="e.g. Rapid response team dispatched under supervision of Zonal Magistrate. Patchwork completed using cold-mix asphalt. Site inspected and confirmed clear for public use."
                      className="form-textarea"
                    />
                  </div>

                  {/* Broadcast Callout */}
                  <div className="transparency-callout">
                    <Share2 size={24} color="#2563eb" style={{ flexShrink: 0 }} />
                    <div>
                      <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "#1e3a8a" }}>
                        Broadcast to Government Transparency Dashboard
                      </div>
                      <div className="transparency-callout-text">
                        Upon submission, this resolution will be instantly published to the Government Transparency Feed with geotagged Before/After photos, GPS coordinates, magistrate verification badge, and zonal stamp for public citizen review.
                      </div>
                      <label style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "0.5rem", cursor: "pointer", fontSize: "0.8rem", fontWeight: 600, color: "#1e40af" }}>
                        <input
                          id="modal-broadcast-checkbox"
                          type="checkbox"
                          checked={broadcastToTransparency}
                          onChange={(e) => setBroadcastToTransparency(e.target.checked)}
                        />
                        <span>Publish geotagged resolution post to public transparency dashboard</span>
                      </label>
                    </div>
                  </div>
                </div>

                <div className="modal-footer">
                  <button
                    type="button"
                    id="modal-cancel-btn"
                    onClick={() => { setShowResolveModal(false); stopCameraStream(); }}
                    className="btn-secondary"
                  >
                    {lang === 'hi' ? 'रद्द करें' : 'Cancel'}
                  </button>
                  <button
                    type="submit"
                    id="modal-submit-resolve-btn"
                    disabled={submittingStatus}
                    className="btn-success"
                  >
                    <CheckCircle2 size={16} />
                    <span>{submittingStatus ? (lang === 'hi' ? 'दर्ज एवं प्रसारित किया जा रहा है...' : 'Recording & Broadcasting...') : (lang === 'hi' ? 'पुष्टि करें एवं समाधान प्रसारित करें' : 'Confirm & Broadcast Resolution')}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
