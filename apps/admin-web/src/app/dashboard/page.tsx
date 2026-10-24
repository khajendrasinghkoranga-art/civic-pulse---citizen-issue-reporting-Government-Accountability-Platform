"use client";

import React, { useState, useEffect, Suspense } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import AdminSidebar from "@/components/AdminSidebar";

const SectorIssueMap = dynamic(() => import("@/components/SectorIssueMap"), {
  ssr: false,
  loading: () => (
    <div style={{ height: "420px", display: "flex", alignItems: "center", justifyContent: "center", background: "#f8fafc", borderRadius: "12px", border: "1px solid #e2e8f0", color: "#64748b", marginBottom: "1.5rem" }}>
      <span>🗺️ Loading Sector GIS Map...</span>
    </div>
  ),
});
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { useAdminLanguage } from "@/hooks/useAdminLanguage";
import { adminApi, CivicIssue } from "@/lib/api";
import { DEHRADUN_SECTORS } from "@/lib/constants";
import {
  Shield,
  MapPin,
  CheckCircle2,
  Clock,
  AlertTriangle,
  FileText,
  Lock,
  ArrowRight,
  Filter,
  RefreshCw,
  Building2,
  BarChart2,
} from "lucide-react";

function DashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isAuthenticated, loading: authLoading, hasJurisdiction } = useAdminAuth();
  const { lang, t } = useAdminLanguage();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const [issues, setIssues] = useState<CivicIssue[]>([]);
  const [sectorWorkload, setSectorWorkload] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter mode: "my-sector" | "all"
  const urlFilter = searchParams.get("filter");
  const [filterMode, setFilterMode] = useState<"my-sector" | "all">(
    urlFilter === "all" ? "all" : "my-sector"
  );
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace("/login");
    }
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    if (isAuthenticated) {
      loadData();
    }
  }, [isAuthenticated]);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [issuesRes, workloadRes] = await Promise.all([
        adminApi.getIssues({ limit: 100 }),
        adminApi.getSectorWorkload().catch(() => ({ sectors: [] })),
      ]);
      setIssues(issuesRes.issues);
      // The workload API returns { totalIssues, totalActive, sectorCount, sectors: [...] }
      const sectors = Array.isArray(workloadRes) ? workloadRes : (workloadRes?.sectors || []);
      setSectorWorkload(sectors);
    } catch (err: any) {
      setError(err.message || "Failed to load zonal issue data");
    } finally {
      setLoading(false);
    }
  };

  // Filter issues based on active sector mode
  const displayedIssues = issues.filter((issue) => {
    if (filterMode === "my-sector" && user?.sector && user.role !== "SUPER_ADMIN") {
      if (!hasJurisdiction(issue.sector)) return false;
    }
    if (statusFilter !== "ALL" && issue.status !== statusFilter) {
      return false;
    }
    return true;
  });

  // Calculate stats for logged in magistrate
  const mySectorIssues = issues.filter((i) => hasJurisdiction(i.sector));
  const myPending = mySectorIssues.filter((i) => i.status !== "RESOLVED" && i.status !== "REJECTED").length;
  const myResolved = mySectorIssues.filter((i) => i.status === "RESOLVED").length;
  const myTotal = mySectorIssues.length;

  return (
    <div className="admin-shell">
      <AdminSidebar />

      <main className="admin-main">
        {/* Page Title */}
        <div className="page-header">
          <div>
            <h1 className="page-title">{lang === "hi" ? "जोनल संचालन एवं कार्यभार नियंत्रण केंद्र" : "Sector Operations Control Center"}</h1>
            <p className="page-subtitle">
              {lang === "hi"
                ? "विकेंद्रीकृत नगर निगम कार्यभार प्रशासन एवं वैधानिक शिकायत निवारण कंसोल"
                : "Decentralized municipal load governance and statutory issue remediation console"}
            </p>
          </div>
          <button
            type="button"
            onClick={loadData}
            className="btn-action-primary"
            style={{ background: "#ffffff", color: "#0f172a", border: "1px solid #cbd5e1" }}
          >
            <RefreshCw size={14} className={loading ? "spin-icon" : ""} />
            <span>{lang === "hi" ? "डेटा रीफ्रेश करें" : "Refresh Data"}</span>
          </button>
        </div>

        {/* Magistrate Jurisdiction Banner */}
        {user && (
          <div className="jurisdiction-banner">
            <div className="jurisdiction-left">
              <div className="jurisdiction-icon">🏛️</div>
              <div>
                <div className="jurisdiction-title">
                  {user.organization || (lang === "hi" ? "नगर निगम जोनल संचालन प्रभाग" : "Municipal Zonal Operations Division")}
                </div>
                <div className="jurisdiction-desc">
                  {lang === "hi" ? "अधिकारी" : "Officer"}: <strong>{user.name}</strong> • {lang === "hi" ? "पद" : "Designation"}: <strong>{user.designation || (lang === "hi" ? "जोनल मजिस्ट्रेट" : "Zonal Magistrate")}</strong>
                </div>
              </div>
            </div>

            <div>
              <div className="jurisdiction-badge-pill">
                <MapPin size={14} />
                <span>{lang === "hi" ? "क्षेत्राधिकार" : "Jurisdiction"}: {user.sector || (lang === "hi" ? "समस्त नगर निगम सेक्टर (मुख्यालय)" : "All Municipal Sectors (HQ)")}</span>
              </div>
            </div>
          </div>
        )}

        {/* Zonal Key Metric Cards */}
        <div className="stats-grid">
          <div className="stat-card">
            <div>
              <div className="stat-val">{myTotal}</div>
              <div className="stat-label">{lang === "hi" ? "मेरे सेक्टर को आवंटित कुल शिकायतें" : "Total Assigned to My Sector"}</div>
            </div>
            <div className="stat-icon-wrap" style={{ background: "#eff6ff", color: "#2563eb" }}>
              <FileText size={22} />
            </div>
          </div>

          <div className="stat-card">
            <div>
              <div className="stat-val" style={{ color: "#d97706" }}>{myPending}</div>
              <div className="stat-label">{lang === "hi" ? "लंबित / प्रगति पर है" : "Pending / In-Progress"}</div>
            </div>
            <div className="stat-icon-wrap" style={{ background: "#fef3c7", color: "#d97706" }}>
              <Clock size={22} />
            </div>
          </div>

          <div className="stat-card">
            <div>
              <div className="stat-val" style={{ color: "#15803d" }}>{myResolved}</div>
              <div className="stat-label">{lang === "hi" ? "समाधान हुआ एवं प्रसारित" : "Resolved & Broadcasted"}</div>
            </div>
            <div className="stat-icon-wrap" style={{ background: "#dcfce7", color: "#15803d" }}>
              <CheckCircle2 size={22} />
            </div>
          </div>

          <div className="stat-card">
            <div>
              <div className="stat-val" style={{ color: "#7c3aed" }}>
                {myTotal > 0 ? `${Math.round((myResolved / myTotal) * 100)}%` : "100%"}
              </div>
              <div className="stat-label">{lang === "hi" ? "क्षेत्रीय समाधान दर" : "Zonal Resolution Rate"}</div>
            </div>
            <div className="stat-icon-wrap" style={{ background: "#f3e8ff", color: "#7c3aed" }}>
              <BarChart2 size={22} />
            </div>
          </div>
        </div>

        {/* Real-Time Municipal Sector Workload Distribution */}
        <div className="workload-card">
          <div className="workload-header">
            <div className="workload-title">
              <Building2 size={18} color="#2563eb" />
              <span>Municipal Sector Load Balancing Monitor (Dehradun Zonal Matrix)</span>
            </div>
            <span style={{ fontSize: "0.75rem", color: "#64748b" }}>Live Zonal Capacity</span>
          </div>

          <div className="workload-grid">
            {DEHRADUN_SECTORS.map((sec) => {
              // Backend returns sectors with 'id' and 'activeCount' fields
              const wl = sectorWorkload.find((w: any) => w.id === sec.id);
              const count = wl?.activeCount || wl?.totalCount || 0;
              const percent = Math.min(Math.round((count / sec.capacityThreshold) * 100), 100);
              const isMySec = hasJurisdiction(sec.name);
              const loadStatus = wl?.loadStatus || "OPTIMAL";

              let fillColor = "#10b981";
              if (percent > 65) fillColor = "#f59e0b";
              if (percent > 85) fillColor = "#ef4444";

              return (
                <div key={sec.id} className={`sector-tile ${isMySec ? "my-sector" : ""}`}>
                  <div className="sector-tile-top">
                    <span className="sector-tile-name">{sec.id}: {sec.zone.split(" ")[0]}</span>
                    {isMySec && (
                      <span className="sector-tile-badge" style={{ background: "#2563eb", color: "#ffffff" }}>
                        My Sector
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: "0.725rem", color: "#64748b", marginBottom: "4px" }}>
                    {sec.office}
                  </div>
                  <div className="meter-track">
                    <div className="meter-fill" style={{ width: `${percent}%`, backgroundColor: fillColor }}></div>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.7rem", color: "#475569" }}>
                    <span>Load: <strong>{count}</strong> active</span>
                    <span>{loadStatus}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Sector Geo-Spatial Issue Map */}
        <SectorIssueMap
          issues={displayedIssues}
          userSector={user?.sector}
          hasJurisdiction={hasJurisdiction}
          lang={lang}
        />

        {/* Issues List with Jurisdiction Controls */}
        <div className="table-card">
          <div className="table-filter-bar">
            {/* Jurisdiction scope toggle */}
            <div className="filter-pills">
              <button
                type="button"
                onClick={() => setFilterMode("my-sector")}
                className={`filter-btn ${filterMode === "my-sector" ? "active" : ""}`}
              >
                <span>{lang === "hi" ? `केवल मेरे सेक्टर की समस्याएं (${myTotal})` : `My Sector Issues Only (${myTotal})`}</span>
              </button>
              <button
                type="button"
                onClick={() => setFilterMode("all")}
                className={`filter-btn ${filterMode === "all" ? "active" : ""}`}
              >
                <span>{lang === "hi" ? `सभी नगर निगम सेक्टर (${issues.length})` : `All Municipal Sectors (${issues.length})`}</span>
              </button>
            </div>

            {/* Status filters */}
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <Filter size={14} color="#64748b" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="form-select"
                style={{ width: "auto", padding: "0.4rem 0.8rem", fontSize: "0.8rem" }}
              >
                <option value="ALL">{lang === "hi" ? "सभी स्थितियां" : "All Statuses"}</option>
                <option value="SUBMITTED">{lang === "hi" ? "दर्ज की गई" : "Submitted"}</option>
                <option value="UNDER_REVIEW">{lang === "hi" ? "समीक्षाधीन" : "Under Review"}</option>
                <option value="IN_PROGRESS">{lang === "hi" ? "प्रगति पर है" : "In Progress"}</option>
                <option value="RESOLVED">{lang === "hi" ? "समाधान हुआ" : "Resolved"}</option>
                <option value="REJECTED">{lang === "hi" ? "निरस्त" : "Rejected"}</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div style={{ padding: "3rem", textAlign: "center", color: "#64748b" }}>
              {lang === "hi" ? "नगर निगम डेटाबेस से जोनल शिकायतें लोड हो रही हैं..." : "Loading sector issues from municipal database..."}
            </div>
          ) : displayedIssues.length === 0 ? (
            <div style={{ padding: "3rem", textAlign: "center", color: "#64748b" }}>
              {lang === "hi" ? "चयनित फिल्टर के लिए कोई समस्या नहीं मिली।" : "No issues found for the selected filter criteria."}
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table className="gov-table">
                <thead>
                  <tr>
                    <th>{lang === "hi" ? "शिकायत विवरण" : "Issue Details"}</th>
                    <th>{lang === "hi" ? "नगर निगम सेक्टर" : "Municipal Sector"}</th>
                    <th>{lang === "hi" ? "श्रेणी" : "Category"}</th>
                    <th>{lang === "hi" ? "प्राथमिकता" : "Priority"}</th>
                    <th>{lang === "hi" ? "वर्तमान स्थिति" : "Current Status"}</th>
                    <th>{lang === "hi" ? "आरबीएसी अधिकार" : "RBAC Authorization"}</th>
                    <th>{lang === "hi" ? "कार्रवाई" : "Action"}</th>
                  </tr>
                </thead>
                <tbody>
                  {displayedIssues.map((issue) => {
                    const isAuthorized = hasJurisdiction(issue.sector);
                    return (
                      <tr key={issue.id}>
                        <td style={{ maxWidth: "280px" }}>
                          <div style={{ fontWeight: 700, color: "#0f172a" }}>{issue.title}</div>
                          <div style={{ fontSize: "0.75rem", color: "#64748b", marginTop: "2px" }}>
                            {issue.address || issue.locality || "Dehradun"}
                          </div>
                        </td>
                        <td>
                          <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", fontSize: "0.8rem", fontWeight: 600, color: isAuthorized ? "#1d4ed8" : "#475569" }}>
                            <MapPin size={13} />
                            {issue.sector || (lang === "hi" ? "अनावंटित" : "Unassigned")}
                          </span>
                        </td>
                        <td>
                          <span style={{ fontSize: "0.8rem", color: "#475569" }}>
                            {issue.category?.name || "General"}
                          </span>
                        </td>
                        <td>
                          <span
                            style={{
                              fontSize: "0.725rem",
                              fontWeight: 700,
                              color: issue.priority === "URGENT" ? "#b91c1c" : issue.priority === "HIGH" ? "#ea580c" : "#475569",
                            }}
                          >
                            {issue.priority === "URGENT" && lang === "hi"
                              ? "अति आवश्यक"
                              : issue.priority === "HIGH" && lang === "hi"
                              ? "उच्च"
                              : issue.priority === "MEDIUM" && lang === "hi"
                              ? "मध्यम"
                              : issue.priority === "LOW" && lang === "hi"
                              ? "सामान्य"
                              : issue.priority}
                          </span>
                        </td>
                        <td>
                          <span className={`status-pill status-${issue.status}`}>
                            {issue.status === "RESOLVED" && lang === "hi"
                              ? "समाधान हुआ"
                              : issue.status === "IN_PROGRESS" && lang === "hi"
                              ? "प्रगति पर है"
                              : issue.status === "UNDER_REVIEW" && lang === "hi"
                              ? "समीक्षाधीन"
                              : issue.status === "SUBMITTED" && lang === "hi"
                              ? "दर्ज"
                              : issue.status === "REJECTED" && lang === "hi"
                              ? "निरस्त"
                              : issue.status.replace("_", " ")}
                          </span>
                        </td>
                        <td>
                          {isAuthorized ? (
                            <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", color: "#15803d", fontSize: "0.75rem", fontWeight: 700 }}>
                              <CheckCircle2 size={13} />
                              <span>{lang === "hi" ? "अधिकृत मजिस्ट्रेट" : "Authorized Magistrate"}</span>
                            </span>
                          ) : (
                            <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", color: "#94a3b8", fontSize: "0.75rem", fontWeight: 600 }}>
                              <Lock size={13} />
                              <span>{lang === "hi" ? "क्षेत्राधिकार सीमित" : "Sector Restricted"}</span>
                            </span>
                          )}
                        </td>
                        <td>
                          <Link
                            href={`/issues/${issue.id}`}
                            className={isAuthorized ? "btn-action-primary" : "btn-action-locked"}
                          >
                            <span>
                              {isAuthorized
                                ? (lang === "hi" ? "निरीक्षण एवं कार्रवाई" : "Inspect & Upgrade")
                                : (lang === "hi" ? "केवल देखें" : "View Only")}
                            </span>
                            <ArrowRight size={13} />
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="admin-shell">
          <AdminSidebar />
          <main className="admin-main" style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh" }}>
            <div style={{ color: "#64748b" }}>Loading Sector Operations Control Center...</div>
          </main>
        </div>
      }
    >
      <DashboardContent />
    </Suspense>
  );
}
