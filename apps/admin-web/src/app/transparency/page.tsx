"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import AdminSidebar from "@/components/AdminSidebar";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { adminApi, TransparencyPost, getMediaUrl } from "@/lib/api";
import {
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Building2,
  Share2,
  MapPin,
  RefreshCw,
  ExternalLink,
} from "lucide-react";

export default function TransparencyFeedPage() {
  const { user, isAuthenticated } = useAdminAuth();
  const [posts, setPosts] = useState<TransparencyPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminApi.getTransparencyPosts();
      setPosts(data);
    } catch (err: any) {
      setError(err.message || "Failed to load transparency feed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-shell">
      <AdminSidebar />

      <main className="admin-main">
        {/* Page Title */}
        <div className="page-header">
          <div>
            <h1 className="page-title">Government Transparency Dashboard</h1>
            <p className="page-subtitle">
              Public accountability audit trail: Official issue resolutions broadcasted by Zonal Magistrates
            </p>
          </div>
          <button
            type="button"
            onClick={loadPosts}
            className="btn-action-primary"
            style={{ background: "#ffffff", color: "#0f172a", border: "1px solid #cbd5e1" }}
          >
            <RefreshCw size={14} />
            <span>Refresh Feed</span>
          </button>
        </div>

        {/* Info Banner */}
        <div style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)", color: "#ffffff", padding: "1.25rem 1.5rem", borderRadius: "12px", borderLeft: "5px solid #10b981", marginBottom: "2rem", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontSize: "1.05rem", fontWeight: 800 }}>
              Live Citizen Transparency & Magistrate Accountability Network
            </div>
            <div style={{ fontSize: "0.825rem", color: "#94a3b8", marginTop: "2px" }}>
              Every resolved issue posted here contains ground photographic evidence and official inspection notes logged by the territorial magistrate.
            </div>
          </div>
          <div style={{ background: "#10b981", color: "#ffffff", padding: "4px 12px", borderRadius: "16px", fontSize: "0.75rem", fontWeight: 700 }}>
            Publicly Audited
          </div>
        </div>

        {loading ? (
          <div style={{ padding: "4rem", textAlign: "center", color: "#64748b" }}>
            Loading transparency broadcasts...
          </div>
        ) : error ? (
          <div style={{ padding: "2rem", background: "#fef2f2", color: "#b91c1c", borderRadius: "10px" }}>
            {error}
          </div>
        ) : posts.length === 0 ? (
          <div style={{ padding: "4rem", textAlign: "center", background: "#ffffff", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
            <CheckCircle2 size={40} color="#94a3b8" style={{ margin: "0 auto 1rem auto", display: "block" }} />
            <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#0f172a" }}>
              No Resolution Broadcasts Recorded Yet
            </h3>
            <p style={{ fontSize: "0.85rem", color: "#64748b", marginTop: "4px" }}>
              When a Zonal Magistrate resolves an issue and submits photo proof from the action console, the resolution report will be permanently published here.
            </p>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(380px, 1fr))", gap: "1.5rem" }}>
            {posts.map((post) => (
              <div
                key={post.id}
                className="table-card"
                style={{ overflow: "hidden", display: "flex", flexDirection: "column" }}
              >
                {/* Photo of Solved Issue */}
                {post.imageUrl && (
                  <div style={{ position: "relative", height: "220px", background: "#0f172a" }}>
                    <img
                      src={getMediaUrl(post.imageUrl)}
                      alt="Resolution Proof"
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                    <div style={{ position: "absolute", top: "10px", right: "10px", background: "#10b981", color: "#ffffff", padding: "3px 9px", borderRadius: "6px", fontSize: "0.725rem", fontWeight: 800, display: "flex", alignItems: "center", gap: "4px" }}>
                      <CheckCircle2 size={12} />
                      <span>OFFICIAL RESOLUTION PROOF</span>
                    </div>
                  </div>
                )}

                <div style={{ padding: "1.5rem", flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                  <div>
                    {/* Header */}
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                      <span style={{ fontSize: "0.75rem", color: "#64748b", display: "flex", alignItems: "center", gap: "4px" }}>
                        <Calendar size={13} />
                        <span>{new Date(post.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
                      </span>
                      {post.locality && (
                        <span style={{ fontSize: "0.725rem", background: "#f1f5f9", padding: "2px 8px", borderRadius: "10px", color: "#475569", fontWeight: 600 }}>
                          {post.locality}
                        </span>
                      )}
                    </div>

                    <h3 style={{ fontSize: "1.1rem", fontWeight: 800, color: "#0f172a", marginBottom: "0.75rem", lineHeight: 1.3 }}>
                      {post.title}
                    </h3>

                    <p style={{ fontSize: "0.85rem", color: "#334155", lineHeight: 1.5, whiteSpace: "pre-line", marginBottom: "1.25rem" }}>
                      {post.content}
                    </p>
                  </div>

                  {/* Officer Footer Badge */}
                  <div style={{ paddingTop: "1rem", borderTop: "1px solid #f1f5f9", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "#eff6ff", border: "1px solid #93c5fd", display: "flex", alignItems: "center", justifyContent: "center", color: "#1d4ed8", fontWeight: 700, fontSize: "0.75rem" }}>
                        🏛️
                      </div>
                      <div>
                        <div style={{ fontSize: "0.8rem", fontWeight: 700, color: "#0f172a" }}>
                          {post.user?.name || "Zonal Magistrate"}
                        </div>
                        <div style={{ fontSize: "0.7rem", color: "#64748b" }}>
                          Verified Zonal Authority • DMC
                        </div>
                      </div>
                    </div>

                    <span style={{ fontSize: "0.75rem", color: "#2563eb", fontWeight: 700, display: "flex", alignItems: "center", gap: "2px" }}>
                      <span>Audit Valid</span>
                      <ShieldCheck size={14} color="#15803d" />
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
