'use client';

import { useState, useRef, useEffect, useCallback } from 'react';

// ── Geotag metadata attached to every captured file ────────────────────
export interface GeotagData {
  latitude: number;
  longitude: number;
  accuracy?: number;
  altitude?: number;
  timestamp: string;       // ISO 8601
  address?: string;
}

interface CameraCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (file: File, previewUrl: string, geotag: GeotagData) => void;
  /** Prefilled GPS from the report-page map pin */
  initialLatitude?: number;
  initialLongitude?: number;
  initialAddress?: string;
}

export default function CameraCaptureModal({
  isOpen,
  onClose,
  onCapture,
  initialLatitude,
  initialLongitude,
  initialAddress,
}: CameraCaptureModalProps) {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [mode, setMode] = useState<'photo' | 'video'>('photo');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('');

  // ── Live GPS state ──────────────────────────────────────────────────
  const [gpsLat, setGpsLat] = useState<number>(initialLatitude ?? 30.3165);
  const [gpsLng, setGpsLng] = useState<number>(initialLongitude ?? 78.0322);
  const [gpsAccuracy, setGpsAccuracy] = useState<number | null>(null);
  const [gpsAltitude, setGpsAltitude] = useState<number | null>(null);
  const [gpsStatus, setGpsStatus] = useState<'acquiring' | 'active' | 'fallback'>('acquiring');
  const [liveTime, setLiveTime] = useState<string>('');

  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<any>(null);
  const gpsWatchRef = useRef<number | null>(null);
  const clockRef = useRef<any>(null);

  // ── Keep a live clock ticking every second ──────────────────────────
  useEffect(() => {
    if (!isOpen) return;
    const tick = () =>
      setLiveTime(
        new Date().toLocaleString('en-IN', {
          timeZone: 'Asia/Kolkata',
          day: '2-digit',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true,
        })
      );
    tick();
    clockRef.current = setInterval(tick, 1000);
    return () => clearInterval(clockRef.current);
  }, [isOpen]);

  // ── Acquire real-time GPS when the modal opens ──────────────────────
  useEffect(() => {
    if (!isOpen) return;

    // Seed from map pin if available
    if (initialLatitude != null) setGpsLat(initialLatitude);
    if (initialLongitude != null) setGpsLng(initialLongitude);

    if (!navigator.geolocation) {
      setGpsStatus('fallback');
      return;
    }

    setGpsStatus('acquiring');

    // High-accuracy continuous watch
    gpsWatchRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        setGpsLat(parseFloat(pos.coords.latitude.toFixed(6)));
        setGpsLng(parseFloat(pos.coords.longitude.toFixed(6)));
        setGpsAccuracy(pos.coords.accuracy ? Math.round(pos.coords.accuracy) : null);
        setGpsAltitude(pos.coords.altitude ? Math.round(pos.coords.altitude) : null);
        setGpsStatus('active');
      },
      () => {
        // If permission denied, fall back to initial map coords
        setGpsStatus('fallback');
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );

    return () => {
      if (gpsWatchRef.current != null) {
        navigator.geolocation.clearWatch(gpsWatchRef.current);
      }
    };
  }, [isOpen, initialLatitude, initialLongitude]);

  // ── Camera lifecycle ────────────────────────────────────────────────
  useEffect(() => {
    if (!isOpen) {
      stopCamera();
      return;
    }
    startCamera();
    return () => {
      stopCamera();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, selectedDeviceId]);

  const startCamera = async () => {
    setCameraError(null);
    try {
      if (stream) {
        stream.getTracks().forEach((t) => t.stop());
      }
      const constraints: MediaStreamConstraints = {
        video: selectedDeviceId
          ? { deviceId: { exact: selectedDeviceId }, width: { ideal: 1920 }, height: { ideal: 1080 } }
          : { facingMode: 'environment', width: { ideal: 1920 }, height: { ideal: 1080 } },
        audio: mode === 'video',
      };
      const newStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(newStream);
      if (videoRef.current) {
        videoRef.current.srcObject = newStream;
      }
      const allDevices = await navigator.mediaDevices.enumerateDevices();
      setDevices(allDevices.filter((d) => d.kind === 'videoinput'));
    } catch (err: any) {
      setCameraError(
        err.message || 'Camera access denied or unavailable. Please enable camera permissions.'
      );
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((t) => t.stop());
      setStream(null);
    }
    if (timerRef.current) clearInterval(timerRef.current);
    setIsRecording(false);
    setRecordingSeconds(0);
  };

  // ── Build current GeotagData snapshot ───────────────────────────────
  const buildGeotag = useCallback((): GeotagData => ({
    latitude: gpsLat,
    longitude: gpsLng,
    accuracy: gpsAccuracy ?? undefined,
    altitude: gpsAltitude ?? undefined,
    timestamp: new Date().toISOString(),
    address: initialAddress || undefined,
  }), [gpsLat, gpsLng, gpsAccuracy, gpsAltitude, initialAddress]);

  // ── Helper: direction label ─────────────────────────────────────────
  const fmtCoord = (val: number, posLabel: string, negLabel: string) => {
    const dir = val >= 0 ? posLabel : negLabel;
    return `${Math.abs(val).toFixed(6)}° ${dir}`;
  };

  // ── Capture geotagged photo ─────────────────────────────────────────
  const handleSnapPhoto = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 1920;
    canvas.height = video.videoHeight || 1080;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Draw the camera frame
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const now = new Date();
    const stampTime = now.toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    });
    const latStr = fmtCoord(gpsLat, 'N', 'S');
    const lngStr = fmtCoord(gpsLng, 'E', 'W');

    // ── Bottom-left geotag bar ──────────────────────────────────────
    const barH = 72;
    const barY = canvas.height - barH;
    const barGrad = ctx.createLinearGradient(0, barY, 0, canvas.height);
    barGrad.addColorStop(0, 'rgba(15, 23, 42, 0.0)');
    barGrad.addColorStop(0.25, 'rgba(15, 23, 42, 0.75)');
    barGrad.addColorStop(1, 'rgba(15, 23, 42, 0.92)');
    ctx.fillStyle = barGrad;
    ctx.fillRect(0, barY, canvas.width, barH);

    // GPS Pin icon (drawn manually)
    const pinX = 22;
    const pinY = barY + 20;
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(pinX, pinY, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(pinX, pinY, 3, 0, Math.PI * 2);
    ctx.fill();

    // Coordinates text
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 16px Inter, system-ui, sans-serif';
    ctx.fillText(`${latStr}  |  ${lngStr}`, pinX + 16, barY + 25);

    // Timestamp + accuracy
    ctx.fillStyle = '#94a3b8';
    ctx.font = '13px Inter, system-ui, sans-serif';
    let detailLine = `🕐 ${stampTime}`;
    if (gpsAccuracy != null) detailLine += `  •  Accuracy: ±${gpsAccuracy}m`;
    if (gpsAltitude != null) detailLine += `  •  Alt: ${gpsAltitude}m`;
    ctx.fillText(detailLine, pinX + 16, barY + 50);

    // ── Top-left live verified badge ────────────────────────────────
    ctx.fillStyle = 'rgba(15, 23, 42, 0.7)';
    roundRect(ctx, 12, 12, 260, 30, 15);
    ctx.fill();
    ctx.fillStyle = '#22c55e';
    ctx.beginPath();
    ctx.arc(30, 27, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 12px Inter, system-ui, sans-serif';
    ctx.fillText('GEOTAGGED  •  CivicPulse Live Evidence', 42, 32);

    // ── Bottom-right CivicPulse stamp ────────────────────────────────
    ctx.fillStyle = 'rgba(37, 99, 235, 0.85)';
    roundRect(ctx, canvas.width - 200, barY + 14, 185, 28, 6);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 12px Inter, system-ui, sans-serif';
    ctx.fillText('📍 CivicPulse Verified', canvas.width - 190, barY + 33);

    // Export as JPEG
    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        const geotag = buildGeotag();
        const fileName = `geotag_evidence_${gpsLat.toFixed(4)}_${gpsLng.toFixed(4)}_${Date.now()}.jpg`;
        const file = new File([blob], fileName, { type: 'image/jpeg' });
        const previewUrl = URL.createObjectURL(blob);
        onCapture(file, previewUrl, geotag);
        onClose();
      },
      'image/jpeg',
      0.93
    );
  };

  // ── Video recording (geotag metadata attached on stop) ─────────────
  const handleStartRecording = () => {
    if (!stream) return;
    recordedChunksRef.current = [];
    try {
      const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
        ? 'video/webm;codecs=vp9'
        : 'video/webm';
      const mr = new MediaRecorder(stream, { mimeType });
      mr.ondataavailable = (e) => {
        if (e.data.size > 0) recordedChunksRef.current.push(e.data);
      };
      mr.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
        const geotag = buildGeotag();
        const fileName = `geotag_video_${gpsLat.toFixed(4)}_${gpsLng.toFixed(4)}_${Date.now()}.webm`;
        const file = new File([blob], fileName, { type: 'video/webm' });
        const previewUrl = URL.createObjectURL(blob);
        onCapture(file, previewUrl, geotag);
        onClose();
      };
      mr.start();
      mediaRecorderRef.current = mr;
      setIsRecording(true);
      setRecordingSeconds(0);
      timerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => {
          if (prev >= 60) {
            handleStopRecording();
            return 60;
          }
          return prev + 1;
        });
      }, 1000);
    } catch (err: any) {
      alert(`Recording error: ${err.message}`);
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      if (timerRef.current) clearInterval(timerRef.current);
      setIsRecording(false);
    }
  };

  if (!isOpen) return null;

  // ── Status colours & labels ─────────────────────────────────────────
  const gpsIndicatorColor =
    gpsStatus === 'active' ? '#22c55e' : gpsStatus === 'acquiring' ? '#f59e0b' : '#ef4444';
  const gpsLabel =
    gpsStatus === 'active'
      ? 'GPS Locked'
      : gpsStatus === 'acquiring'
        ? 'Acquiring GPS…'
        : 'Map Coordinates';

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'rgba(15, 23, 42, 0.88)',
        backdropFilter: 'blur(10px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
      }}
    >
      <div
        style={{
          background: '#0f172a',
          borderRadius: '16px',
          overflow: 'hidden',
          width: '100%',
          maxWidth: '720px',
          boxShadow: '0 25px 60px -12px rgba(0,0,0,0.6)',
          border: '1px solid #334155',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* ── Header ─────────────────────────────────────────────────── */}
        <div
          style={{
            padding: '0.85rem 1.25rem',
            borderBottom: '1px solid #1e293b',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            color: '#ffffff',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '1.3rem' }}>📷</span>
            <div>
              <div style={{ fontWeight: 800, fontSize: '0.95rem' }}>
                Geotagged Evidence Recorder
              </div>
              <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                Photos &amp; videos are auto-stamped with GPS coordinates, date &amp; time
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: '#1e293b',
              border: 'none',
              color: '#fff',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              cursor: 'pointer',
              fontSize: '1rem',
            }}
          >
            ✕
          </button>
        </div>

        {/* ── Video Viewport ─────────────────────────────────────────── */}
        <div
          style={{
            position: 'relative',
            background: '#000',
            width: '100%',
            height: '380px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {cameraError ? (
            <div style={{ color: '#f87171', textAlign: 'center', padding: '1.5rem', maxWidth: '400px' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>📷🚫</div>
              <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '0.25rem' }}>
                Camera Permission Required
              </div>
              <div style={{ fontSize: '0.775rem', color: '#cbd5e1' }}>{cameraError}</div>
              <button
                type="button"
                onClick={startCamera}
                style={{
                  marginTop: '1rem',
                  background: '#2563eb',
                  color: '#fff',
                  border: 'none',
                  padding: '6px 16px',
                  borderRadius: '6px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Retry Camera
              </button>
            </div>
          ) : (
            <>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />

              {/* ── Live status badge (top-left) ───────────────────── */}
              <div
                style={{
                  position: 'absolute',
                  top: '12px',
                  left: '12px',
                  background: 'rgba(15, 23, 42, 0.78)',
                  color: '#fff',
                  padding: '4px 12px',
                  borderRadius: '9999px',
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  backdropFilter: 'blur(4px)',
                }}
              >
                <span
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: isRecording ? '#ef4444' : '#22c55e',
                    animation: 'pulse 1.5s infinite',
                  }}
                />
                <span>
                  {isRecording
                    ? `REC 00:${recordingSeconds.toString().padStart(2, '0')}`
                    : 'LIVE CAMERA'}
                </span>
              </div>

              {/* ── GPS Overlay (top-right) ─────────────────────────── */}
              <div
                style={{
                  position: 'absolute',
                  top: '12px',
                  right: '12px',
                  background: 'rgba(15, 23, 42, 0.82)',
                  color: '#fff',
                  padding: '6px 12px',
                  borderRadius: '10px',
                  fontSize: '0.68rem',
                  fontWeight: 600,
                  backdropFilter: 'blur(6px)',
                  border: `1px solid ${gpsIndicatorColor}44`,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '2px',
                  minWidth: '170px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                  <span
                    style={{
                      width: '7px',
                      height: '7px',
                      borderRadius: '50%',
                      background: gpsIndicatorColor,
                      boxShadow: `0 0 6px ${gpsIndicatorColor}`,
                      animation: gpsStatus === 'acquiring' ? 'pulse 1s infinite' : 'none',
                    }}
                  />
                  <span style={{ color: gpsIndicatorColor, fontWeight: 800, fontSize: '0.7rem' }}>
                    📍 {gpsLabel}
                  </span>
                </div>
                <div style={{ color: '#e2e8f0', fontFamily: 'monospace', fontSize: '0.72rem' }}>
                  {gpsLat.toFixed(6)}° {gpsLat >= 0 ? 'N' : 'S'}
                </div>
                <div style={{ color: '#e2e8f0', fontFamily: 'monospace', fontSize: '0.72rem' }}>
                  {gpsLng.toFixed(6)}° {gpsLng >= 0 ? 'E' : 'W'}
                </div>
                {gpsAccuracy != null && (
                  <div style={{ color: '#94a3b8', fontSize: '0.62rem' }}>
                    ±{gpsAccuracy}m accuracy
                    {gpsAltitude != null ? ` • ${gpsAltitude}m alt` : ''}
                  </div>
                )}
              </div>

              {/* ── Bottom geotag bar (live preview of watermark) ──── */}
              <div
                style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  background: 'linear-gradient(0deg, rgba(15,23,42,0.88) 0%, rgba(15,23,42,0.5) 70%, transparent 100%)',
                  padding: '24px 16px 12px',
                  display: 'flex',
                  alignItems: 'flex-end',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                    <span style={{ color: '#ef4444', fontSize: '1rem' }}>📍</span>
                    <span
                      style={{
                        color: '#ffffff',
                        fontWeight: 700,
                        fontSize: '0.82rem',
                        fontFamily: 'monospace',
                        letterSpacing: '0.5px',
                      }}
                    >
                      {fmtCoord(gpsLat, 'N', 'S')} &nbsp;|&nbsp; {fmtCoord(gpsLng, 'E', 'W')}
                    </span>
                  </div>
                  <div style={{ color: '#94a3b8', fontSize: '0.68rem' }}>
                    🕐 {liveTime}
                    {gpsAccuracy != null && <span> &nbsp;• &nbsp;±{gpsAccuracy}m</span>}
                  </div>
                </div>
                <div
                  style={{
                    background: 'rgba(37, 99, 235, 0.85)',
                    padding: '4px 10px',
                    borderRadius: '6px',
                    color: '#fff',
                    fontSize: '0.68rem',
                    fontWeight: 700,
                  }}
                >
                  📍 CivicPulse Verified
                </div>
              </div>

              {/* Camera Switcher */}
              {devices.length > 1 && (
                <button
                  type="button"
                  onClick={() => {
                    const idx = devices.findIndex((d) => d.deviceId === selectedDeviceId);
                    setSelectedDeviceId(devices[(idx + 1) % devices.length].deviceId);
                  }}
                  style={{
                    position: 'absolute',
                    top: '48px',
                    left: '12px',
                    background: 'rgba(15, 23, 42, 0.75)',
                    color: '#fff',
                    border: '1px solid rgba(255,255,255,0.2)',
                    padding: '5px 10px',
                    borderRadius: '8px',
                    fontSize: '0.72rem',
                    cursor: 'pointer',
                  }}
                >
                  🔄 Switch
                </button>
              )}
            </>
          )}
        </div>

        {/* ── Controls Bar ───────────────────────────────────────────── */}
        <div
          style={{
            padding: '1rem 1.25rem',
            background: '#0f172a',
            borderTop: '1px solid #1e293b',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '0.85rem',
          }}
        >
          {/* Mode Selector */}
          <div
            style={{
              display: 'flex',
              background: '#1e293b',
              padding: '4px',
              borderRadius: '9999px',
              gap: '4px',
            }}
          >
            <button
              type="button"
              disabled={isRecording}
              onClick={() => setMode('photo')}
              style={{
                background: mode === 'photo' ? '#2563eb' : 'transparent',
                color: mode === 'photo' ? '#fff' : '#94a3b8',
                border: 'none',
                padding: '6px 16px',
                borderRadius: '9999px',
                fontSize: '0.8rem',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              📸 Geotag Photo
            </button>
            <button
              type="button"
              disabled={isRecording}
              onClick={() => setMode('video')}
              style={{
                background: mode === 'video' ? '#2563eb' : 'transparent',
                color: mode === 'video' ? '#fff' : '#94a3b8',
                border: 'none',
                padding: '6px 16px',
                borderRadius: '9999px',
                fontSize: '0.8rem',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              🎥 Geotag Video (60s)
            </button>
          </div>

          {/* Trigger Button */}
          {mode === 'photo' ? (
            <button
              type="button"
              onClick={handleSnapPhoto}
              disabled={!!cameraError}
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: '#ffffff',
                border: '4px solid #2563eb',
                boxShadow: '0 0 0 4px rgba(37,99,235,0.4)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.5rem',
                transition: 'transform 0.1s',
              }}
              title="Capture Geotagged Photo"
            >
              📸
            </button>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              {!isRecording ? (
                <button
                  type="button"
                  onClick={handleStartRecording}
                  disabled={!!cameraError}
                  style={{
                    background: '#dc2626',
                    color: '#fff',
                    border: 'none',
                    padding: '10px 24px',
                    borderRadius: '9999px',
                    fontWeight: 800,
                    fontSize: '0.9rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    boxShadow: '0 4px 14px rgba(220,38,38,0.4)',
                  }}
                >
                  <span
                    style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#fff' }}
                  />
                  Start Geotagged Recording
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleStopRecording}
                  style={{
                    background: '#fff',
                    color: '#dc2626',
                    border: '2px solid #dc2626',
                    padding: '10px 24px',
                    borderRadius: '9999px',
                    fontWeight: 800,
                    fontSize: '0.9rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  <span
                    style={{ width: '12px', height: '12px', background: '#dc2626', borderRadius: '2px' }}
                  />
                  Stop &amp; Save (00:{recordingSeconds.toString().padStart(2, '0')})
                </button>
              )}
            </div>
          )}

          {/* Geotag verification footer */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              fontSize: '0.7rem',
              color: '#64748b',
              textAlign: 'center',
            }}
          >
            <span
              style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                background: gpsIndicatorColor,
                display: 'inline-block',
              }}
            />
            <span>
              Geotagged at {gpsLat.toFixed(4)}°, {gpsLng.toFixed(4)}° — Verified evidence with
              tamper-proof GPS watermark
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Canvas utility: rounded rectangle ─────────────────────────────────
function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}
