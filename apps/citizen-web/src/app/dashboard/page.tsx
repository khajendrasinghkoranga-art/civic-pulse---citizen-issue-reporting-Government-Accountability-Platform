'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/hooks/useLanguage';
import { apiClient } from '@/lib/api-client';
import type { Issue, ApiResponse, SectorWorkloadResponse, SectorInfo } from '@/types';
import { DEHRADUN_SECTORS } from '@/lib/sectors';
import {
  Landmark,
  Globe,
  ChevronDown,
  MapPin,
  Search,
  Calendar,
  LayoutDashboard,
  FilePlus2,
  ClipboardList,
  TrendingUp,
  Users,
  User,
  RefreshCw,
  FileText,
  Clock,
  Wrench,
  CheckCircle2,
  Megaphone,
  LogOut,
  Camera,
  PhoneCall,
  Lightbulb,
  ArrowRight,
  Shield,
  Activity,
  Layers,
  Compass,
} from 'lucide-react';

interface ExtendedIssue extends Issue {
  reporter?: {
    id: string;
    name: string;
    email: string;
  };
}

export default function DashboardPage() {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const { lang, toggleLang, t } = useLanguage();
  const router = useRouter();

  // Tab: 'all' (Live City Issues from Supabase) or 'my' (Current Citizen's issues)
  const [activeTab, setActiveTab] = useState<'all' | 'my'>('all');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [sectorFilter, setSectorFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [sectorWorkload, setSectorWorkload] = useState<SectorWorkloadResponse | null>(null);

  // Live Database stats
  const [stats, setStats] = useState({
    totalCityIssues: 0,
    underReview: 0,
    inProgress: 0,
    resolved: 0,
    myTotal: 0,
  });

  const [allIssues, setAllIssues] = useState<ExtendedIssue[]>([]);
  const [myIssues, setMyIssues] = useState<ExtendedIssue[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<string>('');

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  // Fetch real-time issues from Supabase database
  const fetchDashboardData = useCallback(async (showRefreshIndicator = false) => {
    if (!isAuthenticated) return;
    if (showRefreshIndicator) setIsRefreshing(true);

    try {
      // 1. Fetch all city issues across Dehradun from Supabase
      const allRes = await apiClient.get<ApiResponse<ExtendedIssue[]>>(
        '/issues?limit=50&sortBy=createdAt&sortOrder=desc'
      );
      const cityIssues = allRes.data || [];
      setAllIssues(cityIssues);

      // 2. Fetch logged-in citizen's personal complaints
      const myRes = await apiClient.get<ApiResponse<ExtendedIssue[]>>(
        '/issues/my?limit=50&sortBy=createdAt&sortOrder=desc'
      );
      const userIssues = myRes.data || [];
      setMyIssues(userIssues);

      // 3. Fetch real-time municipal sector workload distribution
      try {
        const secRes = await apiClient.get<ApiResponse<SectorWorkloadResponse>>('/issues/sectors/workload');
        if (secRes.data) {
          setSectorWorkload(secRes.data);
        }
      } catch (secErr) {
        console.error('Failed to load sector workload:', secErr);
      }

      // 3. Calculate real-time database counts
      const total = cityIssues.length;
      const resolved = cityIssues.filter((i) => i.status === 'RESOLVED').length;
      const inProgress = cityIssues.filter((i) => i.status === 'IN_PROGRESS').length;
      const underReview = cityIssues.filter(
        (i) => i.status === 'UNDER_REVIEW' || i.status === 'SUBMITTED'
      ).length;

      setStats({
        totalCityIssues: total,
        underReview,
        inProgress,
        resolved,
        myTotal: userIssues.length,
      });

      const now = new Date();
      setLastSyncTime(
        now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      );
    } catch (err) {
      console.error('Failed to fetch real-time dashboard data:', err);
    } finally {
      setDataLoading(false);
      setIsRefreshing(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchDashboardData();
    }
  }, [isAuthenticated, fetchDashboardData]);

  // Filter issues based on activeTab (All vs My) and statusFilter
  const baseIssues = activeTab === 'all' ? allIssues : myIssues;
  const filteredIssues = baseIssues.filter((issue) => {
    const matchesStatus =
      statusFilter === 'ALL'
        ? true
        : statusFilter === 'UNDER_REVIEW'
          ? issue.status === 'UNDER_REVIEW' || issue.status === 'SUBMITTED'
          : issue.status === statusFilter;

    const cleanText = (str?: string) => (str || '').toLowerCase().replace(/[^a-z0-9]/g, '');
    const matchesSector =
      sectorFilter === 'ALL'
        ? true
        : cleanText(issue.sector).includes(cleanText(sectorFilter)) ||
        cleanText(issue.locality).includes(cleanText(sectorFilter));

    const matchesSearch = searchQuery.trim()
      ? issue.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      issue.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      issue.locality?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      issue.sector?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      issue.trackingId?.toLowerCase().includes(searchQuery.toLowerCase())
      : true;

    return matchesStatus && matchesSector && matchesSearch;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'RESOLVED':
        return <span className="gov-dash-badge green">✓ {lang === 'hi' ? 'समाधान हुआ' : 'Resolved'}</span>;
      case 'IN_PROGRESS':
        return <span className="gov-dash-badge cyan">{lang === 'hi' ? 'प्रगति पर है' : 'In Progress'}</span>;
      case 'UNDER_REVIEW':
        return <span className="gov-dash-badge yellow">{lang === 'hi' ? 'समीक्षाधीन' : 'Under Review'}</span>;
      case 'SUBMITTED':
        return <span className="gov-dash-badge blue">{lang === 'hi' ? 'दर्ज की गई' : 'Submitted'}</span>;
      case 'REJECTED':
        return <span className="gov-dash-badge red">{lang === 'hi' ? 'निरस्त' : 'Rejected'}</span>;
      default:
        return <span className="gov-dash-badge gray">{status}</span>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'URGENT':
        return <span className="gov-dash-badge red">{lang === 'hi' ? 'अति आवश्यक' : 'Urgent'}</span>;
      case 'HIGH':
        return <span className="gov-dash-badge orange">{lang === 'hi' ? 'उच्च' : 'High'}</span>;
      case 'MEDIUM':
        return <span className="gov-dash-badge yellow">{lang === 'hi' ? 'मध्यम' : 'Medium'}</span>;
      default:
        return <span className="gov-dash-badge gray">{lang === 'hi' ? 'सामान्य' : 'Low'}</span>;
    }
  };

  const formatCategoryName = (name?: string) => {
    if (!name) return 'General Civic';
    return name.replace(/_/g, ' ');
  };

  return (
    <div className="gov-portal-wrapper">
      {/* 1. Global Official Government Header */}
      <header className="gov-header-global">
        <div className="gov-header-top">
          <div className="gov-container header-top-inner">
            <div className="gov-emblem-section">
              <span className="gov-emblem-icon" style={{ display: 'inline-flex', alignItems: 'center' }}>
                <Landmark size={20} color="#1e3a8a" />
              </span>
              <div>
                <div className="gov-emblem-title">Government of India</div>
                <div className="gov-emblem-hindi">सत्यमेव जयते</div>
              </div>
              <div className="gov-initiative-divider"></div>
              <div className="gov-initiative-text">
                <div className="gov-initiative-title">A Digital India Initiative</div>
                <div className="gov-initiative-tagline">People • Process • Progress</div>
              </div>
            </div>

            <div className="gov-top-controls">
              {/* Database Status Indicator */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: '#ecfdf5',
                  border: '1px solid #10b981',
                  color: '#065f46',
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  padding: '3px 9px',
                  borderRadius: '20px',
                }}
              >
                <span
                  style={{
                    display: 'inline-block',
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: '#10b981',
                    boxShadow: '0 0 6px #10b981',
                  }}
                ></span>
                <span>Live Supabase DB</span>
              </div>

              <button
                type="button"
                id="dashboard-lang-switcher"
                onClick={toggleLang}
                className="gov-lang-select-pill"
                style={{
                  cursor: 'pointer',
                  background: lang === 'hi' ? '#fef3c7' : '#ffffff',
                  border: lang === 'hi' ? '1.5px solid #f59e0b' : '1px solid #cbd5e1',
                  transition: 'all 0.2s',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '4px 10px',
                  borderRadius: '20px',
                }}
                title={lang === 'en' ? 'हिन्दी में बदलें (Switch to Hindi)' : 'Switch to English'}
              >
                <Globe size={13} color={lang === 'hi' ? '#d97706' : '#2563eb'} />
                <span style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.78rem' }}>
                  {lang === 'en' ? 'English | हिन्दी' : 'हिन्दी | English'}
                </span>
              </button>

              {/* User Profile Capsule */}
              <div className="gov-user-profile-capsule">
                <div className="user-avatar-circle">
                  {user?.name?.slice(0, 2).toUpperCase() || 'CT'}
                </div>
                <div className="user-info-text">
                  <div className="user-name">{user?.name || 'Citizen'}</div>
                  <div className="user-role-label">Citizen</div>
                </div>
              </div>

              {/* Logout Button */}
              <button
                type="button"
                onClick={() => logout()}
                className="gov-logout-btn"
                title="Sign Out"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  background: '#fef2f2',
                  color: '#dc2626',
                  border: '1px solid #fecaca',
                  padding: '4px 10px',
                  borderRadius: '6px',
                  fontWeight: 600,
                  fontSize: '0.78rem',
                  cursor: 'pointer',
                  transition: 'all 0.15s'
                }}
              >
                <LogOut size={13} />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>

        {/* 2. Global Portal Header Bar */}
        <div className="gov-sub-bar">
          <div className="gov-container sub-bar-inner">
            <Link href="/" className="gov-brand-header" style={{ display: 'inline-flex', alignItems: 'center' }}>
              <img
                src="/civicpulse-logo.png"
                alt="CivicPulse - Your Voice. Your City. Your Future."
                style={{ height: '46px', width: 'auto', objectFit: 'contain' }}
              />
            </Link>

            <div className="gov-sub-bar-search">
              <Search size={16} color="#64748b" style={{ flexShrink: 0 }} />
              <input
                type="text"
                placeholder="Search for services, issues, campaigns, departments..."
                className="gov-sub-search-input"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button type="button" className="gov-sub-search-btn">
                Search
              </button>
            </div>

            <div className="gov-district-pill">
              <MapPin size={14} color="#ea580c" />
              <span>Dehradun District, Uttarakhand</span>
            </div>

            <div className="gov-timestamp-pill">
              <Calendar size={15} color="#475569" />
              <div>
                <div className="time-date">
                  {new Date().toLocaleDateString('en-IN', {
                    weekday: 'short',
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </div>
                <div className="time-clock">
                  {lastSyncTime ? `Synced: ${lastSyncTime}` : 'Live'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* 3. Main Dashboard Workspace Layout */}
      <div className="gov-dashboard-layout">
        {/* Left Sidebar */}
        <aside className="gov-sidebar">
          <nav className="gov-sidebar-nav">
            <Link href="/dashboard" className="gov-sidebar-item active">
              <span className="item-icon" style={{ display: 'inline-flex', alignItems: 'center' }}>
                <LayoutDashboard size={18} />
              </span>
              <span>{lang === 'hi' ? 'डैशबोर्ड' : 'Dashboard'}</span>
            </Link>

            <Link href="/report" className="gov-sidebar-item">
              <span className="item-icon" style={{ display: 'inline-flex', alignItems: 'center' }}>
                <FilePlus2 size={18} />
              </span>
              <span>{lang === 'hi' ? 'समस्या दर्ज करें' : 'Report an Issue'}</span>
            </Link>

            <Link href="/issues" className="gov-sidebar-item">
              <span className="item-icon" style={{ display: 'inline-flex', alignItems: 'center' }}>
                <ClipboardList size={18} />
              </span>
              <span>{lang === 'hi' ? 'मेरी शिकायतें' : 'My Issues'}</span>
              {stats.myTotal > 0 && <span className="sidebar-badge">{stats.myTotal}</span>}
            </Link>

            <Link href="/transparency" className="gov-sidebar-item">
              <span className="item-icon" style={{ display: 'inline-flex', alignItems: 'center' }}>
                <TrendingUp size={18} />
              </span>
              <span>{lang === 'hi' ? 'पारदर्शिता' : 'Transparency'}</span>
            </Link>

            <Link href="/community" className="gov-sidebar-item">
              <span className="item-icon" style={{ display: 'inline-flex', alignItems: 'center' }}>
                <Users size={18} />
              </span>
              <span>{lang === 'hi' ? 'नागरिक मंच' : 'Community Forum'}</span>
            </Link>

            <Link href="/profile" className="gov-sidebar-item">
              <span className="item-icon" style={{ display: 'inline-flex', alignItems: 'center' }}>
                <User size={18} />
              </span>
              <span>{lang === 'hi' ? 'मेरी प्रोफ़ाइल' : 'My Profile'}</span>
            </Link>
          </nav>

          {/* India Banner */}
          <div className="gov-sidebar-campaign-card">
            <div className="campaign-overlay"></div>
            <div className="campaign-content">
              <div className="campaign-title">{lang === 'hi' ? 'स्वच्छ देहरादून' : 'Clean Dehradun'}</div>
              <div className="campaign-sub">{lang === 'hi' ? 'स्मार्ट सुशासन' : 'Smart Governance'}</div>
              <div className="campaign-foot">{lang === 'hi' ? 'पारदर्शी जवाबदेही' : 'Real-Time Accountability'}</div>
              <div className="campaign-tricolor"></div>
            </div>
          </div>
        </aside>

        {/* Main Dashboard Workspace */}
        <main className="gov-main-content">
          {/* Breadcrumb */}
          <div className="gov-breadcrumb-bar">
            <span>{lang === 'hi' ? 'होम' : 'Home'}</span>
            <span className="b-sep">&gt;</span>
            <span className="b-curr">{lang === 'hi' ? 'नागरिक शिकायत एवं जवाबदेही डैशबोर्ड' : 'Citizen Grievance & Accountability Dashboard'}</span>
          </div>

          {/* Top Welcome Action Banner */}
          <div className="gov-dash-welcome-card">
            <div className="welcome-info-col">
              <div className="welcome-hello-tag">
                <span>{lang === 'hi' ? 'नमस्ते' : 'Namaste'}</span>, {user?.name || (lang === 'hi' ? 'नागरिक' : 'Citizen')}!
              </div>
              <h1 className="welcome-headline">{lang === 'hi' ? 'नागरिक समस्या निवारण एवं जवाबदेही केंद्र' : 'Live Municipal Grievance & Accountability Hub'}</h1>
              <p className="welcome-sub">
                {lang === 'hi'
                  ? 'नगर निगम देहरादून एवं सुपबेस डाटाबेस से सीधे सिंक की गई नागरिक समस्याओं की वास्तविक समय ट्रैकिंग।'
                  : 'Real-time tracking of civic complaints directly synced with Dehradun Municipal Corporation and Supabase database.'}
              </p>
            </div>

            <div className="welcome-action-buttons">
              <button
                type="button"
                onClick={() => fetchDashboardData(true)}
                className="gov-btn-dash-outline"
                style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                disabled={isRefreshing}
              >
                <RefreshCw size={14} className={isRefreshing ? 'animate-spin' : ''} />
                <span>{isRefreshing ? (lang === 'hi' ? 'सिंक हो रहा है...' : 'Syncing...') : (lang === 'hi' ? 'लाइव डेटा रीफ्रेश' : 'Refresh Live DB')}</span>
              </button>
              <Link href="/report" className="gov-btn-dash-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <Megaphone size={15} />
                <span>{lang === 'hi' ? 'नई समस्या दर्ज करें' : 'Report New Issue'}</span>
              </Link>
            </div>
          </div>

          {/* 4 Real-Time Database Metric Cards */}
          <div className="gov-dash-metrics-grid">
            <div className="gov-dash-metric-card">
              <div className="metric-icon-wrap blue" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <FileText size={20} color="#2563eb" />
              </div>
              <div className="metric-info">
                <div className="metric-value">{stats.totalCityIssues}</div>
                <div className="metric-title">{lang === 'hi' ? 'कुल दर्ज शहर शिकायतें' : 'Total City Issues in DB'}</div>
                <div className="metric-foot">
                  {stats.myTotal > 0 ? (lang === 'hi' ? `आपकी शिकायतें: ${stats.myTotal}` : `Your complaints: ${stats.myTotal}`) : (lang === 'hi' ? 'लाइव डेटाबेस रिकॉर्ड' : 'Live Supabase records')}
                </div>
              </div>
            </div>

            <div className="gov-dash-metric-card">
              <div className="metric-icon-wrap yellow" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Clock size={20} color="#d97706" />
              </div>
              <div className="metric-info">
                <div className="metric-value">{stats.underReview}</div>
                <div className="metric-title">{lang === 'hi' ? 'समीक्षाधीन / दर्ज' : 'Under Review / Submitted'}</div>
                <div className="metric-foot">{lang === 'hi' ? 'सत्यापन प्रतीक्षारत' : 'Awaiting verification'}</div>
              </div>
            </div>

            <div className="gov-dash-metric-card">
              <div className="metric-icon-wrap cyan" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Wrench size={20} color="#0891b2" />
              </div>
              <div className="metric-info">
                <div className="metric-value">{stats.inProgress}</div>
                <div className="metric-title">{lang === 'hi' ? 'प्रगति पर है' : 'In Progress'}</div>
                <div className="metric-foot">{lang === 'hi' ? 'संबंधित विभाग आवंटित' : 'Department assigned'}</div>
              </div>
            </div>

            <div className="gov-dash-metric-card">
              <div className="metric-icon-wrap green" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CheckCircle2 size={20} color="#16a34a" />
              </div>
              <div className="metric-info">
                <div className="metric-value">{stats.resolved}</div>
                <div className="metric-title">{lang === 'hi' ? 'समाधान हुआ एवं बंद' : 'Resolved & Closed'}</div>
                <div className="metric-foot">{lang === 'hi' ? 'प्राधिकरण द्वारा पूर्ण' : 'Completed by authorities'}</div>
              </div>
            </div>
          </div>

          {/* Municipal Sector Load Balancing & Workload Distribution Bar */}
          <div
            style={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              padding: '1.25rem',
              marginBottom: '1.5rem',
              boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1rem' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '1.25rem' }}>🏛️</span>
                  <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#0f172a' }}>
                    Dehradun Municipal Sector Load Balancing &amp; Decentralized Queues
                  </h3>
                  <span
                    style={{
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      background: '#dcfce7',
                      color: '#15803d',
                      padding: '2px 8px',
                      borderRadius: '12px',
                      border: '1px solid #bbf7d0',
                    }}
                  >
                    ● Load Balancing Active
                  </span>
                </div>
                <p style={{ margin: '4px 0 0', fontSize: '0.78rem', color: '#64748b' }}>
                  Complaints are automatically partitioned by municipal zone to prevent central bottlenecks and route tickets directly to localized field divisions.
                </p>
              </div>

              {sectorFilter !== 'ALL' && (
                <button
                  type="button"
                  onClick={() => setSectorFilter('ALL')}
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    color: '#2563eb',
                    background: '#eff6ff',
                    border: '1px solid #bfdbfe',
                    padding: '4px 10px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                  }}
                >
                  ✕ Clear Sector Filter ({sectorFilter})
                </button>
              )}
            </div>

            {/* 6 Interactive Sector Cards Grid */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                gap: '0.85rem',
              }}
            >
              {(sectorWorkload?.sectors || DEHRADUN_SECTORS.map(s => ({
                id: s.id,
                name: s.name,
                zone: s.zone,
                center: s.center,
                dispatchUnit: s.dispatchUnit,
                office: s.office,
                helpline: s.helpline,
                totalCount: 0,
                activeCount: 0,
                resolvedCount: 0,
                urgentCount: 0,
                capacityThreshold: s.capacityThreshold,
                loadRatio: 0,
                loadPercentage: 0,
                loadStatus: 'OPTIMAL' as const,
                statusBadgeColor: '#10b981',
              }))).map((sec) => {
                const isSelected = sectorFilter.toLowerCase().includes(sec.id.toLowerCase()) || sectorFilter.toLowerCase().includes(sec.name.toLowerCase());
                return (
                  <div
                    key={sec.id}
                    onClick={() => {
                      if (isSelected) {
                        setSectorFilter('ALL');
                      } else {
                        setSectorFilter(sec.id);
                      }
                    }}
                    style={{
                      border: isSelected ? '2px solid #2563eb' : '1px solid #e2e8f0',
                      background: isSelected ? '#eff6ff' : '#f8fafc',
                      borderRadius: '10px',
                      padding: '0.85rem',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      position: 'relative',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                      <span style={{ fontSize: '0.725rem', fontWeight: 800, color: '#1e3a8a' }}>
                        {sec.id}
                      </span>
                      <span
                        style={{
                          fontSize: '0.675rem',
                          fontWeight: 700,
                          padding: '2px 6px',
                          borderRadius: '4px',
                          background: `${sec.statusBadgeColor}20`,
                          color: sec.statusBadgeColor,
                          border: `1px solid ${sec.statusBadgeColor}40`,
                        }}
                      >
                        {sec.loadStatus}
                      </span>
                    </div>

                    <div style={{ fontSize: '0.84rem', fontWeight: 700, color: '#0f172a', lineHeight: '1.25', marginBottom: '0.25rem' }}>
                      {sec.name.replace(/^Sector \d+ \((.*?)\)$/, '$1')}
                    </div>

                    <div style={{ fontSize: '0.72rem', color: '#64748b', marginBottom: '0.5rem' }}>
                      {sec.zone}
                    </div>

                    {/* Progress Bar of Load Capacity */}
                    <div style={{ width: '100%', height: '5px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden', marginBottom: '0.4rem' }}>
                      <div
                        style={{
                          width: `${Math.min(100, (sec.activeCount / sec.capacityThreshold) * 100)}%`,
                          height: '100%',
                          background: sec.statusBadgeColor,
                          borderRadius: '4px',
                        }}
                      />
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.72rem', color: '#475569' }}>
                      <span>Active Queue: <strong style={{ color: '#0f172a' }}>{sec.activeCount} issues</strong></span>
                      <span>Cap: {sec.capacityThreshold}</span>
                    </div>

                    <div style={{ marginTop: '0.45rem', paddingTop: '0.45rem', borderTop: '1px solid #e2e8f0', fontSize: '0.69rem', color: '#64748b' }}>
                      🏢 <strong>{sec.dispatchUnit}</strong>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Dual Column Layout: Issues Table + City Quick Insights */}
          <div className="gov-dash-content-grid">
            {/* Left Main Table: Real-Time Complaints */}
            <div className="gov-dash-table-card">
              <div className="dash-table-header" style={{ flexWrap: 'wrap', gap: '0.75rem' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <h2 className="table-card-title">{lang === 'hi' ? 'वास्तविक समय नागरिक समस्याएं' : 'Real-Time Civic Issues'}</h2>
                    <span
                      style={{
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        background: '#dbeafe',
                        color: '#1d4ed8',
                        padding: '2px 8px',
                        borderRadius: '12px',
                      }}
                    >
                      {filteredIssues.length} {lang === 'hi' ? 'उपलब्ध' : 'Found'}
                    </span>
                  </div>
                  <p className="table-card-sub">
                    {lang === 'hi'
                      ? `डाटाबेस से सीधा लाइव कनेक्शन (अंतिम अपडेट: ${lastSyncTime || 'अभी'})`
                      : `Direct live connection to PostgreSQL database (Updated ${lastSyncTime || 'now'})`}
                  </p>
                </div>

                {/* Tab Switcher: All City Issues vs My Issues */}
                <div
                  style={{
                    display: 'flex',
                    background: '#f1f5f9',
                    padding: '3px',
                    borderRadius: '8px',
                    gap: '4px',
                  }}
                >
                  <button
                    type="button"
                    onClick={() => setActiveTab('all')}
                    style={{
                      border: 'none',
                      background: activeTab === 'all' ? '#ffffff' : 'transparent',
                      color: activeTab === 'all' ? '#0f172a' : '#64748b',
                      fontWeight: activeTab === 'all' ? 700 : 500,
                      fontSize: '0.78rem',
                      padding: '5px 12px',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      boxShadow: activeTab === 'all' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                    }}
                  >
                    <Globe size={13} />
                    <span>{lang === 'hi' ? 'समस्त शहर की शिकायतें' : 'All City Issues'} ({allIssues.length})</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('my')}
                    style={{
                      border: 'none',
                      background: activeTab === 'my' ? '#ffffff' : 'transparent',
                      color: activeTab === 'my' ? '#0f172a' : '#64748b',
                      fontWeight: activeTab === 'my' ? 700 : 500,
                      fontSize: '0.78rem',
                      padding: '5px 12px',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      boxShadow: activeTab === 'my' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                    }}
                  >
                    <User size={13} />
                    <span>{lang === 'hi' ? 'मेरी शिकायतें' : 'My Complaints'} ({myIssues.length})</span>
                  </button>
                </div>
              </div>

              {/* Status Filter Chips + Sector Quick Filters */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '0.75rem 1.25rem',
                  borderBottom: '1px solid #f1f5f9',
                  background: '#f8fafc',
                  overflowX: 'auto',
                  flexWrap: 'wrap',
                }}
              >
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', marginRight: '4px' }}>
                  {lang === 'hi' ? 'स्थिति:' : 'Status:'}
                </span>
                {[
                  { key: 'ALL', label: lang === 'hi' ? 'सभी स्थितियां' : 'All Statuses' },
                  { key: 'SUBMITTED', label: lang === 'hi' ? 'दर्ज की गई' : 'Submitted' },
                  { key: 'UNDER_REVIEW', label: lang === 'hi' ? 'समीक्षाधीन' : 'Under Review' },
                  { key: 'IN_PROGRESS', label: lang === 'hi' ? 'प्रगति पर है' : 'In Progress' },
                  { key: 'RESOLVED', label: lang === 'hi' ? 'समाधान हुआ' : 'Resolved' },
                ].map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => setStatusFilter(item.key)}
                    style={{
                      border: statusFilter === item.key ? '1px solid #2563eb' : '1px solid #e2e8f0',
                      background: statusFilter === item.key ? '#eff6ff' : '#ffffff',
                      color: statusFilter === item.key ? '#1d4ed8' : '#475569',
                      fontSize: '0.73rem',
                      fontWeight: statusFilter === item.key ? 700 : 500,
                      padding: '3px 10px',
                      borderRadius: '16px',
                      cursor: 'pointer',
                    }}
                  >
                    {item.label}
                  </button>
                ))}

                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', marginLeft: '12px', marginRight: '4px' }}>
                  {lang === 'hi' ? 'सेक्टर:' : 'Sector:'}
                </span>
                {[
                  { key: 'ALL', label: lang === 'hi' ? 'सभी सेक्टर' : 'All Sectors' },
                  { key: 'SECTOR-1', label: lang === 'hi' ? 'सेक्टर 1 (केंद्रीय)' : 'Sec 1 (Central)' },
                  { key: 'SECTOR-2', label: lang === 'hi' ? 'सेक्टर 2 (उत्तर)' : 'Sec 2 (North)' },
                  { key: 'SECTOR-3', label: lang === 'hi' ? 'सेक्टर 3 (पश्चिम)' : 'Sec 3 (West)' },
                  { key: 'SECTOR-4', label: lang === 'hi' ? 'सेक्टर 4 (दक्षिण)' : 'Sec 4 (South)' },
                  { key: 'SECTOR-5', label: lang === 'hi' ? 'सेक्टर 5 (पूर्व)' : 'Sec 5 (East)' },
                  { key: 'SECTOR-6', label: lang === 'hi' ? 'सेक्टर 6 (बाहरी)' : 'Sec 6 (Outer)' },
                ].map((sec) => (
                  <button
                    key={sec.key}
                    type="button"
                    onClick={() => setSectorFilter(sec.key)}
                    style={{
                      border: sectorFilter === sec.key ? '1px solid #0284c7' : '1px solid #e2e8f0',
                      background: sectorFilter === sec.key ? '#e0f2fe' : '#ffffff',
                      color: sectorFilter === sec.key ? '#0369a1' : '#475569',
                      fontSize: '0.73rem',
                      fontWeight: sectorFilter === sec.key ? 700 : 500,
                      padding: '3px 10px',
                      borderRadius: '16px',
                      cursor: 'pointer',
                    }}
                  >
                    {sec.label}
                  </button>
                ))}
              </div>

              {dataLoading ? (
                <div className="gov-loading-spinner-wrap">
                  <div className="gov-spinner"></div>
                </div>
              ) : (
                <div className="gov-table-wrapper">
                  <table className="gov-dash-table">
                    <thead>
                      <tr>
                        <th>{lang === 'hi' ? 'ट्रैकिंग आईडी' : 'Tracking ID'}</th>
                        <th>{lang === 'hi' ? 'श्रेणी एवं समस्या विवरण' : 'Category & Issue Summary'}</th>
                        <th>{lang === 'hi' ? 'नगर निगम सेक्टर' : 'Municipal Sector'}</th>
                        <th>{lang === 'hi' ? 'क्षेत्र' : 'Locality'}</th>
                        <th>{lang === 'hi' ? 'प्राथमिकता' : 'Priority'}</th>
                        <th>{lang === 'hi' ? 'स्थिति' : 'Status'}</th>
                        <th>{lang === 'hi' ? 'कार्रवाई' : 'Action'}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredIssues.length === 0 ? (
                        <tr>
                          <td
                            colSpan={7}
                            style={{ textAlign: 'center', padding: '2.5rem 1rem', color: '#64748b' }}
                          >
                            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.5rem' }}>
                              <ClipboardList size={32} color="#94a3b8" />
                            </div>
                            <div style={{ fontWeight: 700, color: '#0f172a', marginBottom: '0.2rem' }}>
                              {lang === 'hi' ? 'चयनित फ़िल्टर के लिए कोई समस्या नहीं मिली' : 'No Issues Found for Selected Filter'}
                            </div>
                            <div style={{ fontSize: '0.775rem' }}>
                              {activeTab === 'my'
                                ? (lang === 'hi' ? 'आपने अभी तक इस फ़िल्टर से संबंधित कोई समस्या दर्ज नहीं की है।' : 'You have not reported issues matching this filter yet.')
                                : (lang === 'hi' ? 'वर्तमान में कोई नागरिक शिकायत इस स्थिति से मेल नहीं खाती।' : 'No city complaints currently match this status filter.')}
                            </div>
                            <Link
                              href="/report"
                              className="gov-btn-action-primary"
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '6px',
                                marginTop: '0.85rem',
                                fontSize: '0.8rem',
                                padding: '6px 14px',
                              }}
                            >
                              <Megaphone size={14} />
                              <span>{lang === 'hi' ? 'नई समस्या दर्ज करें' : 'Report New Issue'}</span>
                            </Link>
                          </td>
                        </tr>
                      ) : (
                        filteredIssues.map((issue) => (
                          <tr key={issue.id}>
                            <td>
                              <span className="tracking-code">
                                {issue.trackingId || `CP-${issue.id.slice(0, 8).toUpperCase()}`}
                              </span>
                            </td>
                            <td>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <div style={{
                                  width: '32px',
                                  height: '32px',
                                  borderRadius: '8px',
                                  background: '#eff6ff',
                                  color: '#2563eb',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  flexShrink: 0
                                }}>
                                  <FileText size={16} />
                                </div>
                                <div>
                                  <div className="issue-table-title" style={{ fontWeight: 600 }}>
                                    {issue.title}
                                  </div>
                                  <div
                                    style={{
                                      fontSize: '0.7rem',
                                      color: '#64748b',
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: '6px',
                                      marginTop: '2px',
                                    }}
                                  >
                                    <span style={{ fontWeight: 600, color: '#2563eb' }}>
                                      {formatCategoryName(issue.category?.name)}
                                    </span>
                                    <span>•</span>
                                    <span title={new Date(issue.createdAt).toLocaleString('en-IN')}>
                                      {new Date(issue.createdAt).toLocaleDateString('en-IN', {
                                        day: 'numeric',
                                        month: 'short',
                                        year: 'numeric',
                                      })}
                                      {', '}
                                      {new Date(issue.createdAt).toLocaleTimeString('en-IN', {
                                        hour: '2-digit',
                                        minute: '2-digit',
                                        hour12: true,
                                      })}
                                    </span>
                                    {issue.evidence && issue.evidence.length > 0 && (
                                      <>
                                        <span>•</span>
                                        <span style={{ color: '#059669', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                                          <Camera size={11} />
                                          <span>{issue.evidence.length} Photo</span>
                                        </span>
                                      </>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                <span
                                  style={{
                                    fontSize: '0.72rem',
                                    fontWeight: 700,
                                    color: '#1e3a8a',
                                    background: '#eff6ff',
                                    padding: '2px 6px',
                                    borderRadius: '4px',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '3px',
                                    maxWidth: 'fit-content',
                                  }}
                                >
                                  📍 {issue.sector ? issue.sector.split('(')[0].trim() : 'Sector 1'}
                                </span>
                                <span style={{ fontSize: '0.675rem', color: '#64748b' }}>
                                  {issue.sector ? (issue.sector.match(/\((.*?)\)/)?.[1] || issue.sector) : 'Central Dehradun'}
                                </span>
                              </div>
                            </td>
                            <td>
                              <span className="locality-pill" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                <MapPin size={11} />
                                <span>{issue.locality || issue.address?.slice(0, 25) || 'Dehradun'}</span>
                              </span>
                            </td>
                            <td>{getPriorityBadge(issue.priority)}</td>
                            <td>{getStatusBadge(issue.status)}</td>
                            <td>
                              <Link href={`/issues/${issue.id}`} className="table-track-btn" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                <span>{lang === 'hi' ? 'ट्रैक करें' : 'Track'}</span>
                                <ArrowRight size={12} />
                              </Link>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Right Widget Rail */}
            <aside className="gov-dash-sidebar-rail">
              {/* Quick Actions Card */}
              <div className="gov-dash-card-widget">
                <h3 className="widget-card-title">{lang === 'hi' ? 'त्वरित सेवाएं' : 'Quick Actions'}</h3>
                <div className="quick-action-list">
                  <Link href="/report" className="qa-item">
                    <span className="qa-icon red" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Megaphone size={16} />
                    </span>
                    <div>
                      <div className="qa-title">{lang === 'hi' ? 'नई समस्या दर्ज करें' : 'Report New Issue'}</div>
                      <div className="qa-sub">{lang === 'hi' ? 'लाइव जीपीएस मैप के साथ शिकायत दर्ज करें' : 'File a complaint with live GPS map'}</div>
                    </div>
                  </Link>

                  <Link href="/issues" className="qa-item">
                    <span className="qa-icon green" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Search size={16} />
                    </span>
                    <div>
                      <div className="qa-title">{lang === 'hi' ? 'शिकायत स्थिति ट्रैक करें' : 'Track Complaint Status'}</div>
                      <div className="qa-sub">{lang === 'hi' ? 'अपनी ट्रैकिंग आईडी का उपयोग करें' : 'Using your Tracking ID'}</div>
                    </div>
                  </Link>

                  <Link href="/transparency" className="qa-item">
                    <span className="qa-icon purple" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <TrendingUp size={16} />
                    </span>
                    <div>
                      <div className="qa-title">{lang === 'hi' ? 'शहर पारदर्शिता मेट्रिक्स' : 'City Transparency Metrics'}</div>
                      <div className="qa-sub">{lang === 'hi' ? 'विभागीय एसएलए प्रदर्शन' : 'Department SLA performance'}</div>
                    </div>
                  </Link>
                </div>
              </div>

              {/* Citizen Advisory / Guidelines */}
              <div className="gov-dash-card-widget">
                <div className="widget-header">
                  <span className="widget-icon yellow" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Lightbulb size={16} color="#d97706" />
                  </span>
                  <h3 className="widget-card-title">{lang === 'hi' ? 'देहरादून नगर निगम सेवा मानक (SLA)' : 'Dehradun Municipal SLA Standards'}</h3>
                </div>
                <div className="sla-guidelines-box">
                  <div className="sla-item">
                    <span className="sla-badge orange">{lang === 'hi' ? 'अति आवश्यक (12 घंटे)' : 'Urgent (12h)'}</span>
                    <span className="sla-text">{lang === 'hi' ? 'पानी की पाइपलाइन फूटना, खुला बिजली का तार' : 'Water pipeline burst, open live wire'}</span>
                  </div>
                  <div className="sla-item">
                    <span className="sla-badge yellow">{lang === 'hi' ? 'उच्च (24 घंटे)' : 'High (24h)'}</span>
                    <span className="sla-text">{lang === 'hi' ? 'सड़क पर बड़ा गड्ढा, सीवर ओवरफ्लो' : 'Major road crater, sewer overflow'}</span>
                  </div>
                  <div className="sla-item">
                    <span className="sla-badge blue">{lang === 'hi' ? 'मध्यम (48 घंटे)' : 'Medium (48h)'}</span>
                    <span className="sla-text">{lang === 'hi' ? 'स्ट्रीटलाइट खराब, कचरा उठाव' : 'Broken streetlights, garbage clearance'}</span>
                  </div>
                </div>
              </div>

              {/* District Emergency Hotline */}
              <div className="gov-emergency-card">
                <div className="emg-header">
                  <span className="emg-icon" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <PhoneCall size={18} color="#dc2626" />
                  </span>
                  <div>
                    <div className="emg-title">{lang === 'hi' ? 'देहरादून नागरिक हेल्पलाइन' : 'Dehradun Citizen Helpline'}</div>
                    <div className="emg-desc">{lang === 'hi' ? '24x7 केंद्रीकृत नगर निगम सहायता' : '24x7 Centralized Municipal Assistance'}</div>
                  </div>
                </div>
                <a href="tel:112" className="gov-emg-call-btn" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
                  <PhoneCall size={15} />
                  <span>112 / 1800-180-2525</span>
                </a>
              </div>
            </aside>
          </div>
        </main>
      </div>
    </div>
  );
}
