"use client";

import React from "react";
import Link from "next/link";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { useAdminLanguage, AdminLanguageSwitcher } from "@/hooks/useAdminLanguage";
import { Shield, UserCheck, MapPin } from "lucide-react";

export default function AdminNavbar() {
  const { user } = useAdminAuth();
  const { t } = useAdminLanguage();

  return (
    <header className="admin-gov-bar">
      <div className="admin-gov-bar-inner">
        {/* Government Emblem & Ministry info */}
        <div className="gov-emblem-badge">
          <img
            src="/ashok-stambh.png"
            alt="State Emblem of India"
            className="gov-emblem-img"
          />
          <div className="gov-titles">
            <div className="gov-title-en">{t("gov_title_en")}</div>
            <div className="gov-title-hi">{t("gov_title_hi")}</div>
            <div className="gov-sub-dept">{t("gov_sub_dept")}</div>
          </div>
        </div>

        {/* Right Status Badges & Language Switcher */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
          {/* Bilingual Language Switcher */}
          <AdminLanguageSwitcher />

          {user && (
            <div className="admin-portal-badge" style={{ background: "#f0fdf4", borderColor: "#86efac" }}>
              <Shield size={14} color="#15803d" />
              <span style={{ color: "#166534" }}>{t("session_active")}</span>
            </div>
          )}

          {user?.sector && (
            <div className="admin-portal-badge" style={{ background: "#eff6ff", borderColor: "#93c5fd" }}>
              <MapPin size={14} color="#1d4ed8" />
              <span style={{ color: "#1e40af", fontWeight: 700 }}>{user.sector}</span>
            </div>
          )}

          <div className="admin-portal-badge">
            <UserCheck size={14} color="#0f172a" />
            <span>{t("rbac_protected")}</span>
          </div>
        </div>
      </div>
    </header>
  );
}
