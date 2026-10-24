"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { useAdminLanguage } from "@/hooks/useAdminLanguage";
import {
  LayoutDashboard,
  ShieldAlert,
  ClipboardCheck,
  Building2,
  Share2,
  LogOut,
  MapPin,
  CheckCircle2,
} from "lucide-react";

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAdminAuth();
  const { t } = useAdminLanguage();

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const navItems = [
    { label: t("nav_dashboard"), href: "/dashboard", icon: LayoutDashboard },
    { label: t("nav_my_sector"), href: "/dashboard?filter=my-sector", icon: ShieldAlert },
    { label: t("nav_all_issues"), href: "/dashboard?filter=all", icon: ClipboardCheck },
    { label: t("nav_transparency"), href: "/transparency", icon: Share2 },
  ];

  return (
    <aside className="admin-sidebar">
      <div>
        {/* Brand Header */}
        <div className="sidebar-brand">
          <Link href="/dashboard" className="brand-row">
            <img
              src="/civicpulse-logo.png"
              alt="CivicPulse"
              className="brand-logo-img"
            />
            <div className="brand-text-col">
              <span className="brand-title">CivicPulse</span>
              <span className="brand-tag">{t("brand_sub")}</span>
            </div>
          </Link>
        </div>

        {/* Magistrate Identity Card */}
        {user && (
          <div className="sidebar-officer-card">
            <div className="officer-rank-badge">
              <CheckCircle2 size={12} />
              <span>{user.role === "SUPER_ADMIN" ? t("rank_super_admin") : t("rank_magistrate")}</span>
            </div>
            <div className="officer-name">{user.name}</div>
            <div className="officer-desig">{user.designation || "Executive Zonal Officer"}</div>
            <div className="officer-sector">
              <MapPin size={13} />
              <span>{user.sector || t("all_sectors_hq")}</span>
            </div>
          </div>
        )}

        {/* Navigation Links */}
        <nav className="sidebar-nav">
          <div className="nav-group-title">{t("zonal_operations")}</div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href === "/dashboard" && pathname === "/dashboard");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`nav-link ${isActive ? "active" : ""}`}
              >
                <Icon size={16} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Logout */}
      <div className="sidebar-footer">
        <button type="button" onClick={handleLogout} className="btn-logout">
          <LogOut size={14} />
          <span>{t("exit_session")}</span>
        </button>
      </div>
    </aside>
  );
}
