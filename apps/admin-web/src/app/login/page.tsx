"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { adminApi, UserProfile } from "@/lib/api";
import {
  ShieldCheck,
  Lock,
  Mail,
  AlertCircle,
  ArrowRight,
  ChevronDown,
  Building2,
  MapPin,
  User,
  Loader2,
} from "lucide-react";

interface MagistrateEntry {
  id: string;
  name: string;
  email: string;
  organization?: string | null;
  sector?: string | null;
  designation?: string | null;
}

export default function AdminLoginPage() {
  const router = useRouter();
  const { login, isAuthenticated, loading } = useAdminAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Slide-hidden magistrate selector state
  const [selectorOpen, setSelectorOpen] = useState(false);
  const [magistrates, setMagistrates] = useState<MagistrateEntry[]>([]);
  const [magistratesLoading, setMagistratesLoading] = useState(false);
  const [magistratesError, setMagistratesError] = useState<string | null>(null);
  const [selectedMagistrate, setSelectedMagistrate] = useState<MagistrateEntry | null>(null);

  useEffect(() => {
    if (!loading && isAuthenticated) {
      router.replace("/dashboard");
    }
  }, [isAuthenticated, loading, router]);

  // Fetch magistrates from DB when selector opens for the first time
  useEffect(() => {
    if (selectorOpen && magistrates.length === 0 && !magistratesLoading) {
      fetchMagistrates();
    }
  }, [selectorOpen]);

  const fetchMagistrates = async () => {
    setMagistratesLoading(true);
    setMagistratesError(null);
    try {
      const data = await adminApi.getMagistrates();
      setMagistrates(data as MagistrateEntry[]);
    } catch (err: any) {
      setMagistratesError("Failed to load sector magistrates");
      console.error("Magistrate fetch error:", err);
    } finally {
      setMagistratesLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      await login(email, password);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Failed to authenticate magistrate credentials");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSelectMagistrate = (mag: MagistrateEntry) => {
    setSelectedMagistrate(mag);
    setEmail(mag.email);
    setPassword("");
    setSelectorOpen(false);
  };

  // Extract short sector label (e.g. "Sector 1 (Central)")
  const getSectorShort = (sector?: string | null): string => {
    if (!sector) return "Unknown Sector";
    const match = sector.match(/^(Sector \d+)\s*\(([^:)]+)/);
    if (match) return `${match[1]} — ${match[2].trim()}`;
    return sector.length > 35 ? sector.substring(0, 35) + "…" : sector;
  };

  const sectorIcons: Record<string, string> = {
    "1": "🏛️",
    "2": "🏔️",
    "3": "🎓",
    "4": "🚌",
    "5": "💻",
    "6": "🏭",
  };

  const getSectorIcon = (sector?: string | null): string => {
    if (!sector) return "🏢";
    const num = sector.match(/Sector (\d+)/)?.[1];
    return num ? sectorIcons[num] || "🏢" : "🏢";
  };

  return (
    <div className="admin-login-wrapper">
      <div className="admin-login-container">
        <div className="admin-login-card">
          {/* Header */}
          <div className="login-header-banner">
            <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "rgba(249, 115, 22, 0.15)", border: "1px solid rgba(249, 115, 22, 0.3)", padding: "4px 12px", borderRadius: "16px", color: "#fdba74", fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", marginBottom: "0.75rem" }}>
              <ShieldCheck size={14} />
              <span>Zonal Jurisdiction Control</span>
            </div>
            <h1 style={{ fontSize: "1.45rem", fontWeight: 800, letterSpacing: "-0.3px" }}>
              Magistrate & Organization Portal
            </h1>
            <p style={{ fontSize: "0.825rem", color: "#94a3b8", marginTop: "4px" }}>
              Dehradun Municipal Corporation • Decentralized Zonal Operations
            </p>
          </div>

          <div className="login-body">
            {error && (
              <div style={{ background: "#fef2f2", border: "1px solid #fecaca", padding: "0.75rem 1rem", borderRadius: "8px", color: "#b91c1c", fontSize: "0.825rem", display: "flex", alignItems: "center", gap: "8px", marginBottom: "1.25rem" }}>
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            {/* Selected Magistrate Info Chip */}
            {selectedMagistrate && (
              <div className="selected-magistrate-chip">
                <div className="selected-mag-icon">{getSectorIcon(selectedMagistrate.sector)}</div>
                <div className="selected-mag-info">
                  <span className="selected-mag-name">{selectedMagistrate.name}</span>
                  <span className="selected-mag-sector">{getSectorShort(selectedMagistrate.sector)}</span>
                </div>
                <button
                  type="button"
                  className="selected-mag-clear"
                  onClick={() => {
                    setSelectedMagistrate(null);
                    setEmail("");
                    setPassword("");
                  }}
                  title="Clear selection"
                >
                  ✕
                </button>
              </div>
            )}

            {/* Standard Login Form */}
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Magistrate Official Email</label>
                <div style={{ position: "relative" }}>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. magistrate.sector1@civicpulse.gov.in"
                    className="form-input"
                    style={{ paddingLeft: "2.5rem" }}
                  />
                  <Mail size={16} color="#94a3b8" style={{ position: "absolute", left: "0.85rem", top: "50%", transform: "translateY(-50%)" }} />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Security Authorization Password</label>
                <div style={{ position: "relative" }}>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="form-input"
                    style={{ paddingLeft: "2.5rem" }}
                  />
                  <Lock size={16} color="#94a3b8" style={{ position: "absolute", left: "0.85rem", top: "50%", transform: "translateY(-50%)" }} />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="btn-action-primary"
                style={{ width: "100%", justifyContent: "center", padding: "0.75rem", fontSize: "0.925rem" }}
              >
                <span>{submitting ? "Verifying Authorization..." : "Access Zonal Administration"}</span>
                {submitting ? <Loader2 size={16} className="spin-icon" /> : <ArrowRight size={16} />}
              </button>
            </form>

            {/* ─── Slide-Hidden Sector Magistrate Selector ─── */}
            <div className="magistrate-selector-wrapper">
              <button
                type="button"
                className={`magistrate-selector-toggle ${selectorOpen ? "open" : ""}`}
                onClick={() => setSelectorOpen(!selectorOpen)}
              >
                <div className="selector-toggle-left">
                  <Building2 size={14} />
                  <span>Sector Magistrate Directory</span>
                </div>
                <ChevronDown size={16} className={`selector-chevron ${selectorOpen ? "rotated" : ""}`} />
              </button>

              <div className={`magistrate-selector-panel ${selectorOpen ? "expanded" : ""}`}>
                <div className="selector-panel-inner">
                  {magistratesLoading && (
                    <div className="selector-loading">
                      <Loader2 size={20} className="spin-icon" />
                      <span>Loading sector magistrates from database…</span>
                    </div>
                  )}

                  {magistratesError && (
                    <div className="selector-error">
                      <AlertCircle size={14} />
                      <span>{magistratesError}</span>
                      <button type="button" onClick={fetchMagistrates} className="selector-retry-btn">Retry</button>
                    </div>
                  )}

                  {!magistratesLoading && !magistratesError && magistrates.length === 0 && selectorOpen && (
                    <div className="selector-empty">
                      <span>No sector magistrates found in database.</span>
                    </div>
                  )}

                  {!magistratesLoading && magistrates.length > 0 && (
                    <div className="selector-list">
                      {magistrates.map((mag) => (
                        <button
                          key={mag.id}
                          type="button"
                          className={`selector-item ${selectedMagistrate?.id === mag.id ? "selected" : ""}`}
                          onClick={() => handleSelectMagistrate(mag)}
                        >
                          <div className="selector-item-icon">{getSectorIcon(mag.sector)}</div>
                          <div className="selector-item-info">
                            <span className="selector-item-sector">{getSectorShort(mag.sector)}</span>
                            <span className="selector-item-name">
                              <User size={11} />
                              {mag.name}
                            </span>
                            <span className="selector-item-email">{mag.email}</span>
                          </div>
                          <div className="selector-item-arrow">
                            <ArrowRight size={12} />
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
