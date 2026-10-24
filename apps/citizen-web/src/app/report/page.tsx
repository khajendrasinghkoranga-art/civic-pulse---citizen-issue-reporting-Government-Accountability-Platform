'use client';

import { useEffect, useState, type FormEvent } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { apiClient } from '@/lib/api-client';
import type { IssueCategory, ApiResponse } from '@/types';
import CameraCaptureModal, { type GeotagData } from '@/components/camera/CameraCaptureModal';
import { resolveSectorClient, DEHRADUN_SECTORS, type SectorDefinition } from '@/lib/sectors';

// Dynamically import real Dehradun Leaflet Map to avoid SSR window errors
const DehradunMap = dynamic(() => import('@/components/map/DehradunMap'), {
  ssr: false,
  loading: () => (
    <div style={{
      height: '260px',
      background: '#f1f5f9',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: '10px',
      color: '#64748b',
      fontSize: '0.85rem'
    }}>
      🗺️ Loading Dehradun Live GPS Map...
    </div>
  ),
});

import { Landmark, Globe, ChevronDown, MapPin, Bell, LogOut, Headphones } from 'lucide-react';

export default function ReportIssuePage() {
  const { user, isAuthenticated, isLoading: authLoading, logout } = useAuth();
  const router = useRouter();

  const [categories, setCategories] = useState<IssueCategory[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [subCategory, setSubCategory] = useState('');
  const [severity, setSeverity] = useState<'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'>('LOW');
  const [relatedDepartment, setRelatedDepartment] = useState('Auto-assigned based on category');

  // Location fields
  const [searchAddress, setSearchAddress] = useState('Ghanta Ghar, Rajpur Road, Dehradun');
  const [latitude, setLatitude] = useState(30.3244);
  const [longitude, setLongitude] = useState(78.0417);

  // Municipal Sector Load Balancing & Routing
  const [currentSector, setCurrentSector] = useState<SectorDefinition>(DEHRADUN_SECTORS[0]);
  const [isManualSector, setIsManualSector] = useState(false);

  // Evidence / Media files - STRICT LIVE CAMERA ONLY (Geotagged)
  const [files, setFiles] = useState<File[]>([]);
  const [filePreviews, setFilePreviews] = useState<string[]>([]);
  const [fileGeotags, setFileGeotags] = useState<GeotagData[]>([]);
  const [isCameraOpen, setIsCameraOpen] = useState(false);

  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Live real-time clock and date for authentic filing record
  const [liveDateTime, setLiveDateTime] = useState({
    date: '',
    time: '',
    full: '',
  });

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setLiveDateTime({
        date: now.toLocaleDateString('en-IN', {
          weekday: 'short',
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        }),
        time: now.toLocaleTimeString('en-IN', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true,
        }),
        full: now.toLocaleString('en-IN', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true,
        }),
      });
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  // Dynamically resolve Municipal Sector on coordinate or address update (Distributes city workload)
  useEffect(() => {
    if (!isManualSector) {
      const sec = resolveSectorClient(latitude, longitude, searchAddress);
      setCurrentSector(sec);
    }
  }, [latitude, longitude, searchAddress, isManualSector]);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, authLoading, router]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await apiClient.get<ApiResponse<IssueCategory[]>>('/issues/categories');
        if (res.data && res.data.length > 0) {
          setCategories(res.data);
          setCategoryId(res.data[0].id);
        }
      } catch {
        // Fallback demo categories
        setCategories([
          { id: 'cat-road', name: 'Roads & Infrastructure', icon: '🛣️', defaultPriority: 'MEDIUM', defaultSlaHours: 48 },
          { id: 'cat-light', name: 'Street Lighting', icon: '💡', defaultPriority: 'MEDIUM', defaultSlaHours: 24 },
          { id: 'cat-water', name: 'Water & Sanitation', icon: '🚰', defaultPriority: 'HIGH', defaultSlaHours: 12 },
          { id: 'cat-waste', name: 'Waste Management', icon: '🗑️', defaultPriority: 'LOW', defaultSlaHours: 48 },
          { id: 'cat-drain', name: 'Drainage & Sewerage', icon: '🌊', defaultPriority: 'HIGH', defaultSlaHours: 24 },
        ]);
        setCategoryId('cat-road');
      }
    };
    fetchCategories();
  }, []);

  // Update auto department based on category
  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = e.target.value;
    setCategoryId(selectedId);
    const cat = categories.find((c) => c.id === selectedId);
    if (cat?.name.includes('Road')) setRelatedDepartment('Public Works Department (PWD)');
    else if (cat?.name.includes('Light')) setRelatedDepartment('Electricity & Street Lighting Dept');
    else if (cat?.name.includes('Water')) setRelatedDepartment('Jal Sansthan (Water Supply)');
    else if (cat?.name.includes('Waste')) setRelatedDepartment('Nagar Nigam Sanitation Dept');
    else setRelatedDepartment('Municipal Corporation of Dehradun');
  };

  const handleUseMyLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLatitude(parseFloat(pos.coords.latitude.toFixed(4)));
          setLongitude(parseFloat(pos.coords.longitude.toFixed(4)));
          setSearchAddress('Dehradun Center, Rajpur Road, Dehradun');
        },
        () => {
          setLatitude(30.3165);
          setLongitude(78.0322);
        }
      );
    }
  };

  const handleMapLocationChange = (lat: number, lng: number, address?: string) => {
    setLatitude(lat);
    setLongitude(lng);
    if (address) {
      setSearchAddress(address);
    }
  };

  const handleCameraCapture = (file: File, previewUrl: string, geotag: GeotagData) => {
    setFiles((prev) => [...prev, file]);
    setFilePreviews((prev) => [...prev, previewUrl]);
    setFileGeotags((prev) => [...prev, geotag]);
  };

  const removeFile = (idx: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== idx));
    setFilePreviews((prev) => prev.filter((_, i) => i !== idx));
    setFileGeotags((prev) => prev.filter((_, i) => i !== idx));
  };

  // Helper to convert captured File to Base64 for the evidence upload endpoint
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!title.trim() || title.trim().length < 5) {
        throw new Error('Title must be at least 5 characters long.');
      }
      if (!description.trim() || description.trim().length < 10) {
        throw new Error('Description must be at least 10 characters long.');
      }
      if (!categoryId) {
        throw new Error('Please select a valid civic category.');
      }

      // 1. Save issue directly to PostgreSQL database via API with Sector Load Balancing
      const res = await apiClient.post<ApiResponse<any>>('/issues', {
        title: title.trim(),
        description: description.trim(),
        categoryId,
        priority: severity,
        latitude: parseFloat(latitude.toFixed(4)),
        longitude: parseFloat(longitude.toFixed(4)),
        address: searchAddress || 'Dehradun, Uttarakhand',
        sector: currentSector.name,
        locality: currentSector.zone,
        city: 'Dehradun',
        state: 'Uttarakhand',
        pincode: '248001',
      });

      const createdIssueId = res.data?.id;

      // 2. If citizen captured live photo/video evidence, upload directly to the database & file storage
      if (createdIssueId && files.length > 0) {
        for (const file of files) {
          try {
            const base64Data = await fileToBase64(file);
            await apiClient.post(`/uploads/issues/${createdIssueId}/evidence`, {
              contentBase64: base64Data,
              contentType: file.type || 'image/jpeg',
            });
          } catch (uploadErr) {
            console.error('Evidence upload warning:', uploadErr);
          }
        }
      }

      setSuccess(true);
      setTimeout(() => {
        router.push('/dashboard');
      }, 1500);
    } catch (err: unknown) {
      console.error('Submit issue error:', err);
      setError(err instanceof Error ? err.message : 'Failed to report civic issue to database.');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || !isAuthenticated) {
    return (
      <div className="gov-loading-screen">
        <div className="gov-spinner"></div>
      </div>
    );
  }

  return (
    <div className="gov-portal-wrapper">
      {/* 1. Global Official Header */}
      <header className="gov-header-global">
        <div className="gov-header-top">
          <div className="gov-container header-top-inner">
            <div className="gov-emblem-section">
              <span className="gov-emblem-icon" style={{ display: 'inline-flex', alignItems: 'center' }}>
                <img
                  src="/ashok-stambh.png"
                  alt="State Emblem of India"
                  style={{ height: '34px', width: 'auto', objectFit: 'contain' }}
                />
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
              <div className="gov-lang-select-pill">
                <Globe size={13} />
                <span>English</span>
                <ChevronDown size={11} />
              </div>
              <span className="gov-ctrl-link">हिंदी</span>
              <span className="gov-ctrl-link">Accessibility</span>
              <span className="gov-ctrl-link" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <Headphones size={13} />
                <span>Help</span>
              </span>
              <div className="gov-top-notif-bell">
                <Bell size={14} />
                <span className="notif-badge">3</span>
              </div>

              {/* User Profile Capsule */}
              <div className="gov-user-profile-capsule">
                <div className="user-avatar-circle">
                  {user?.name?.slice(0, 2).toUpperCase() || 'KS'}
                </div>
                <div className="user-info-text">
                  <div className="user-name">{user?.name || 'Citizen'}</div>
                  <div className="user-role-label">Citizen</div>
                </div>
              </div>

              {/* Direct Logout Button */}
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
              <span className="sub-search-icon">🔍</span>
              <input
                type="text"
                placeholder="Search for services, issues, campaigns, departments..."
                className="gov-sub-search-input"
              />
              <button type="button" className="gov-sub-search-btn">Search</button>
            </div>

            <div className="gov-district-pill">
              <span>📍</span>
              <span>Dehradun District, Uttarakhand</span>
              <span style={{ fontSize: '0.65rem' }}>▼</span>
            </div>

            <div className="gov-timestamp-pill">
              <span className="cal-icon">📅</span>
              <div>
                <div className="time-date">{liveDateTime.date || 'Live Date'}</div>
                <div className="time-clock">{liveDateTime.time || 'Live Clock (IST)'}</div>
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
            <Link href="/dashboard" className="gov-sidebar-item">
              <span className="item-icon">🏠</span>
              <span>Dashboard</span>
            </Link>

            <Link href="/report" className="gov-sidebar-item active">
              <span className="item-icon">📝</span>
              <span>Report an Issue</span>
            </Link>

            <Link href="/issues" className="gov-sidebar-item">
              <span className="item-icon">📋</span>
              <span>My Issues</span>
            </Link>

            <Link href="/issues" className="gov-sidebar-item">
              <span className="item-icon">🔍</span>
              <span>Track Complaint</span>
            </Link>

            <Link href="/services" className="gov-sidebar-item">
              <span className="item-icon">🏛️</span>
              <span>Local Services</span>
            </Link>

            <Link href="/community" className="gov-sidebar-item">
              <span className="item-icon">👥</span>
              <span>Community Forum</span>
            </Link>

            <Link href="/community" className="gov-sidebar-item">
              <span className="item-icon">📊</span>
              <span>Voting & Participation</span>
            </Link>

            <Link href="/notifications" className="gov-sidebar-item">
              <span className="item-icon">🔔</span>
              <span>Notifications</span>
              <span className="sidebar-badge">3</span>
            </Link>

            <Link href="/transparency" className="gov-sidebar-item">
              <span className="item-icon">📈</span>
              <span>Transparency</span>
            </Link>

            <Link href="/profile" className="gov-sidebar-item">
              <span className="item-icon">👤</span>
              <span>My Profile</span>
            </Link>

            <Link href="/settings" className="gov-sidebar-item">
              <span className="item-icon">⚙️</span>
              <span>Settings</span>
            </Link>
          </nav>

          {/* India Gate Sidebar Banner */}
          <div className="gov-sidebar-campaign-card">
            <div className="campaign-overlay"></div>
            <div className="campaign-content">
              <div className="campaign-title">Clean India</div>
              <div className="campaign-sub">Strong Communities</div>
              <div className="campaign-foot">Bright Future</div>
              <div className="campaign-tricolor"></div>
            </div>
          </div>
        </aside>

        {/* Main Form Content Workspace */}
        <main className="gov-main-content">
          {/* Breadcrumb */}
          <div className="gov-breadcrumb-bar">
            <span>Dashboard</span>
            <span className="b-sep">&gt;</span>
            <span className="b-curr">Report an Issue</span>
          </div>

          {/* Page Title Card with Stepper */}
          <div className="gov-report-header-card">
            <div className="report-header-info">
              <div className="report-doc-icon">📄</div>
              <div>
                <h1 className="report-page-title">Report a Civic Issue</h1>
                <p className="report-page-desc">
                  Help us build a cleaner, safer and better Dehradun.
                  Your report will be routed to the concerned department.
                </p>
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    marginTop: '6px',
                    fontSize: '0.75rem',
                    color: '#1e40af',
                    background: '#eff6ff',
                    border: '1px solid #bfdbfe',
                    padding: '3px 10px',
                    borderRadius: '16px',
                    fontWeight: 600,
                  }}
                >
                  <span>🕒 Filing Date &amp; Time:</span>
                  <span style={{ color: '#0f172a' }}>
                    {liveDateTime.full ? `${liveDateTime.full} (Official Real-Time Record)` : 'Live Timestamp'}
                  </span>
                </div>
              </div>
            </div>

            {/* Stepper matching screenshot */}
            <div className="gov-stepper-progress">
              <div className={`step-item ${currentStep >= 1 ? 'active' : ''}`}>
                <div className="step-circle">1</div>
                <div className="step-label">Issue Details</div>
              </div>
              <div className="step-line"></div>

              <div className={`step-item ${currentStep >= 2 ? 'active' : ''}`}>
                <div className="step-circle">2</div>
                <div className="step-label">Location &amp; Evidence</div>
              </div>
              <div className="step-line"></div>

              <div className={`step-item ${currentStep >= 3 ? 'active' : ''}`}>
                <div className="step-circle">3</div>
                <div className="step-label">Review &amp; Submit</div>
              </div>
            </div>
          </div>

          {error && (
            <div className="gov-alert-error">
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="gov-alert-success">
              <span>✅</span>
              <span>Issue reported successfully! Redirecting to tracking page...</span>
            </div>
          )}

          {/* Grid Layout: 2 Columns of Form + 1 Column of Sidebar Widgets */}
          <form onSubmit={handleSubmit} className="gov-report-form-layout">
            <div className="gov-report-form-columns">
              {/* Box 1: Issue Details */}
              <div className="gov-form-section-card">
                <h2 className="form-sec-title">1. Issue Details</h2>
                <p className="form-sec-sub">Provide accurate information to help us resolve the issue faster.</p>

                <div className="gov-field-group">
                  <div className="field-label-row">
                    <label className="field-label" htmlFor="issue-title">
                      Issue Title <span className="req">*</span>
                    </label>
                    <span className="char-count">{title.length}/150</span>
                  </div>
                  <input
                    id="issue-title"
                    type="text"
                    className="gov-field-input"
                    placeholder="E.g. Pothole near Rajpur Road"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </div>

                <div className="gov-field-group">
                  <div className="field-label-row">
                    <label className="field-label" htmlFor="issue-desc">
                      Description <span className="req">*</span>
                    </label>
                    <span className="char-count">{description.length}/1000</span>
                  </div>
                  <textarea
                    id="issue-desc"
                    className="gov-field-textarea"
                    rows={4}
                    placeholder="Describe the issue in detail..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                  ></textarea>
                </div>

                <div className="gov-dual-field-row">
                  <div className="gov-field-group">
                    <label className="field-label" htmlFor="issue-cat">
                      Category <span className="req">*</span>
                    </label>
                    <div className="gov-select-wrap">
                      <select
                        id="issue-cat"
                        className="gov-field-select"
                        value={categoryId}
                        onChange={handleCategoryChange}
                        required
                      >
                        {categories.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                      <span className="select-arrow">▼</span>
                    </div>
                  </div>

                  <div className="gov-field-group">
                    <label className="field-label" htmlFor="issue-subcat">
                      Sub-category
                    </label>
                    <div className="gov-select-wrap">
                      <select
                        id="issue-subcat"
                        className="gov-field-select"
                        value={subCategory}
                        onChange={(e) => setSubCategory(e.target.value)}
                      >
                        <option value="">Select sub-category</option>
                        <option value="pothole">Deep Pothole / Road Cave-in</option>
                        <option value="broken">Broken Asphalt</option>
                        <option value="manhole">Uncovered Manhole</option>
                      </select>
                      <span className="select-arrow">▼</span>
                    </div>
                  </div>
                </div>

                {/* Severity Badges matching screenshot */}
                <div className="gov-field-group">
                  <label className="field-label">
                    Severity <span className="req">*</span>
                  </label>
                  <div className="gov-severity-selector">
                    <button
                      type="button"
                      className={`severity-btn low ${severity === 'LOW' ? 'selected' : ''}`}
                      onClick={() => setSeverity('LOW')}
                    >
                      <span className="sev-dot green"></span>
                      <div>
                        <div className="sev-name">Low</div>
                        <div className="sev-desc">Minor issue</div>
                      </div>
                    </button>

                    <button
                      type="button"
                      className={`severity-btn med ${severity === 'MEDIUM' ? 'selected' : ''}`}
                      onClick={() => setSeverity('MEDIUM')}
                    >
                      <span className="sev-dot yellow"></span>
                      <div>
                        <div className="sev-name">Medium</div>
                        <div className="sev-desc">Needs attention</div>
                      </div>
                    </button>

                    <button
                      type="button"
                      className={`severity-btn high ${severity === 'HIGH' ? 'selected' : ''}`}
                      onClick={() => setSeverity('HIGH')}
                    >
                      <span className="sev-dot orange"></span>
                      <div>
                        <div className="sev-name">High</div>
                        <div className="sev-desc">Affects many people</div>
                      </div>
                    </button>

                    <button
                      type="button"
                      className={`severity-btn critical ${severity === 'URGENT' ? 'selected' : ''}`}
                      onClick={() => setSeverity('URGENT')}
                    >
                      <span className="sev-dot red"></span>
                      <div>
                        <div className="sev-name">Critical</div>
                        <div className="sev-desc">Urgent action required</div>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Related Department Auto Box */}
                <div className="gov-field-group">
                  <label className="field-label">Related Department</label>
                  <div className="gov-department-auto-box">
                    <span>🏢</span>
                    <span>{relatedDepartment}</span>
                  </div>
                </div>

                {/* Genuine Info Alert Notice */}
                <div className="gov-info-callout">
                  <span className="info-icon">ℹ️</span>
                  <span>
                    Please provide genuine information. False or misleading reports may lead to action against your account.
                  </span>
                </div>

                <div className="gov-form-action-row">
                  <button type="button" onClick={() => router.push('/dashboard')} className="gov-btn-cancel">
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="gov-btn-next-action"
                    disabled={loading}
                  >
                    {loading ? 'Submitting...' : 'Next: Location & Evidence →'}
                  </button>
                </div>
              </div>

              {/* Right Column Boxes: 2. Location & 3. Evidence */}
              <div className="gov-form-right-column">
                {/* 2. Real Interactive Location Map */}
                <div className="gov-form-section-card">
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                    <h2 className="form-sec-title">2. Location</h2>
                    <span style={{ fontSize: '0.725rem', color: '#16a34a', fontWeight: 700, background: '#dcfce7', padding: '2px 8px', borderRadius: '4px' }}>
                      ● Live GPS Active
                    </span>
                  </div>
                  <p className="form-sec-sub">Pinpoint the exact location on the real map of Dehradun (like Rapido &amp; Zomato).</p>

                  <div className="gov-loc-mode-toggle">
                    <button type="button" className="loc-mode-btn active">
                      🗺️ Interactive Dehradun Map
                    </button>
                    <button type="button" onClick={handleUseMyLocation} className="loc-mode-btn">
                      📍 GPS My Location
                    </button>
                  </div>

                  <div className="gov-loc-search-wrap">
                    <span className="search-pin">🔍</span>
                    <input
                      type="text"
                      className="gov-field-input"
                      placeholder="Selected address / landmark in Dehradun"
                      value={searchAddress}
                      onChange={(e) => setSearchAddress(e.target.value)}
                    />
                    {searchAddress && (
                      <button type="button" onClick={() => setSearchAddress('')} className="clear-search">✕</button>
                    )}
                  </div>

                  {/* Real Live Leaflet Map of Dehradun */}
                  <div style={{ margin: '0.75rem 0', borderRadius: '10px', overflow: 'hidden', border: '1px solid #cbd5e1' }}>
                    <DehradunMap
                      latitude={latitude}
                      longitude={longitude}
                      onLocationChange={handleMapLocationChange}
                      style={{ height: '280px' }}
                    />
                  </div>

                  <div className="gov-lat-long-row">
                    <div className="gov-coord-box">
                      <span className="coord-label">Latitude</span>
                      <div className="coord-value">{latitude}</div>
                    </div>
                    <div className="gov-coord-box">
                      <span className="coord-label">Longitude</span>
                      <div className="coord-value">{longitude}</div>
                    </div>
                  </div>

                  {/* Municipal Sector & Load Sharing Box */}
                  <div
                    style={{
                      marginTop: '0.85rem',
                      padding: '0.9rem',
                      background: 'linear-gradient(145deg, #f8fafc 0%, #eff6ff 100%)',
                      border: '1.5px solid #bfdbfe',
                      borderRadius: '10px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontSize: '1.1rem' }}>🏛️</span>
                        <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#1e3a8a' }}>
                          Municipal Sector Routing &amp; Load Balancing
                        </span>
                      </div>
                      <span
                        style={{
                          fontSize: '0.675rem',
                          fontWeight: 700,
                          color: '#0284c7',
                          background: '#e0f2fe',
                          padding: '2px 8px',
                          borderRadius: '4px',
                          border: '1px solid #bae6fd',
                        }}
                      >
                        ⚡ Smart Load Shared
                      </span>
                    </div>

                    <div style={{ fontSize: '0.78rem', color: '#334155', marginBottom: '0.5rem', lineHeight: '1.4' }}>
                      To prevent central bottleneck, this complaint is auto-assigned to the regional sector unit based on your coordinates:
                    </div>

                    {/* Sector Card */}
                    <div
                      style={{
                        background: '#ffffff',
                        border: '1px solid #cbd5e1',
                        borderRadius: '8px',
                        padding: '0.65rem 0.85rem',
                        marginBottom: '0.65rem',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ fontWeight: 800, fontSize: '0.875rem', color: '#0f172a' }}>
                          📍 {currentSector.name}
                        </div>
                        <span
                          style={{
                            fontSize: '0.7rem',
                            fontWeight: 700,
                            color: '#15803d',
                            background: '#dcfce7',
                            padding: '2px 6px',
                            borderRadius: '4px',
                          }}
                        >
                          🟢 Normal Load
                        </span>
                      </div>
                      <div style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '2px' }}>
                        Zone: <strong style={{ color: '#1e293b' }}>{currentSector.zone}</strong>
                      </div>
                      <div style={{ fontSize: '0.74rem', color: '#475569', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <span>🏢 Dispatch Unit:</span>
                        <strong style={{ color: '#0284c7' }}>{currentSector.dispatchUnit}</strong>
                      </div>
                      <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <span>📞 Sector Helpline:</span>
                        <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>{currentSector.helpline}</span>
                      </div>
                    </div>

                    {/* Sector Change Dropdown for user customization */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <label style={{ fontSize: '0.72rem', color: '#475569', fontWeight: 700, whiteSpace: 'nowrap' }}>
                        Manual Sector:
                      </label>
                      <select
                        value={currentSector.id}
                        onChange={(e) => {
                          const sec = DEHRADUN_SECTORS.find((s) => s.id === e.target.value);
                          if (sec) {
                            setIsManualSector(true);
                            setCurrentSector(sec);
                          }
                        }}
                        style={{
                          flex: 1,
                          fontSize: '0.75rem',
                          padding: '4px 8px',
                          borderRadius: '6px',
                          border: '1px solid #cbd5e1',
                          background: '#ffffff',
                          color: '#0f172a',
                          fontWeight: 600,
                        }}
                      >
                        {DEHRADUN_SECTORS.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.name}
                          </option>
                        ))}
                      </select>
                      {isManualSector && (
                        <button
                          type="button"
                          onClick={() => {
                            setIsManualSector(false);
                            const autoSec = resolveSectorClient(latitude, longitude, searchAddress);
                            setCurrentSector(autoSec);
                          }}
                          style={{
                            fontSize: '0.7rem',
                            color: '#2563eb',
                            background: 'transparent',
                            border: 'none',
                            textDecoration: 'underline',
                            cursor: 'pointer',
                            padding: '2px',
                          }}
                        >
                          Auto-Detect
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* 3. Live Site Camera & Video Evidence Box */}
                <div className="gov-form-section-card">
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                    <h2 className="form-sec-title">3. Geotagged Evidence (Photo / Video)</h2>
                    <span style={{ fontSize: '0.725rem', color: '#16a34a', fontWeight: 700, background: '#dcfce7', padding: '2px 8px', borderRadius: '4px' }}>
                      📍 Auto-Geotagged
                    </span>
                  </div>
                  <p className="form-sec-sub">Photos & videos are stamped with live GPS coordinates, timestamp & verification watermark — preventing fake or old uploads.</p>

                  {/* Direct Camera Button - No gallery uploads allowed */}
                  <div
                    onClick={() => setIsCameraOpen(true)}
                    style={{
                      background: 'linear-gradient(135deg, #1e40af 0%, #2563eb 100%)',
                      border: '2px dashed #93c5fd',
                      borderRadius: '12px',
                      padding: '1.5rem',
                      textAlign: 'center',
                      color: '#ffffff',
                      cursor: 'pointer',
                      transition: 'transform 0.15s, box-shadow 0.15s',
                      boxShadow: '0 4px 14px rgba(37, 99, 235, 0.25)',
                    }}
                  >
                    <div style={{ fontSize: '2.5rem', marginBottom: '0.4rem' }}>📍📷</div>
                    <div style={{ fontWeight: 800, fontSize: '1rem', letterSpacing: '0.01em' }}>
                      Capture Geotagged Photo or Video
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#bfdbfe', marginTop: '0.25rem' }}>
                      📍 GPS coordinates, date & time will be stamped directly on your photo/video
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsCameraOpen(true);
                      }}
                      style={{
                        marginTop: '0.85rem',
                        background: '#ffffff',
                        color: '#1d4ed8',
                        border: 'none',
                        fontWeight: 800,
                        fontSize: '0.85rem',
                        padding: '8px 18px',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
                      }}
                    >
                      Open Geotagged Camera
                    </button>
                  </div>

                  {/* Captured Live Evidence Thumbnails */}
                  <div style={{ marginTop: '1rem' }}>
                    <div style={{ fontSize: '0.775rem', fontWeight: 700, color: '#334155', marginBottom: '0.5rem' }}>
                      Captured Evidence ({filePreviews.length}):
                    </div>
                    <div className="gov-evidence-thumbnails">
                      {filePreviews.map((url, i) => {
                        const geotag = fileGeotags[i];
                        return (
                          <div key={i} style={{ position: 'relative', display: 'inline-block' }}>
                            {/* Media thumbnail */}
                            {files[i]?.type.includes('video') ? (
                              <video
                                src={url}
                                className="thumb-img"
                                style={{ width: '130px', height: '100px', objectFit: 'cover', borderRadius: '8px', border: '2px solid #334155' }}
                                controls
                              />
                            ) : (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={url}
                                alt={`Evidence ${i + 1}`}
                                className="thumb-img"
                                style={{ width: '130px', height: '100px', objectFit: 'cover', borderRadius: '8px', border: '2px solid #334155' }}
                              />
                            )}

                            {/* Geotag badge */}
                            {geotag && (
                              <div
                                style={{
                                  position: 'absolute',
                                  bottom: '0',
                                  left: '0',
                                  right: '0',
                                  background: 'linear-gradient(0deg, rgba(15,23,42,0.92) 0%, rgba(15,23,42,0.6) 70%, transparent 100%)',
                                  borderRadius: '0 0 6px 6px',
                                  padding: '14px 6px 5px',
                                  color: '#fff',
                                }}
                              >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '3px', fontSize: '0.58rem', fontWeight: 700 }}>
                                  <span style={{ color: '#22c55e' }}>📍</span>
                                  <span style={{ fontFamily: 'monospace', letterSpacing: '0.3px' }}>
                                    {geotag.latitude.toFixed(4)}°, {geotag.longitude.toFixed(4)}°
                                  </span>
                                </div>
                                <div style={{ fontSize: '0.5rem', color: '#94a3b8', marginTop: '1px' }}>
                                  {new Date(geotag.timestamp).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', second: '2-digit', day: '2-digit', month: 'short' })}
                                  {geotag.accuracy != null && <span> • ±{geotag.accuracy}m</span>}
                                </div>
                              </div>
                            )}

                            {/* Verified tag (top-left) */}
                            <div
                              style={{
                                position: 'absolute',
                                top: '4px',
                                left: '4px',
                                background: 'rgba(37, 99, 235, 0.85)',
                                color: '#fff',
                                fontSize: '0.5rem',
                                fontWeight: 700,
                                padding: '1px 5px',
                                borderRadius: '4px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '2px',
                              }}
                            >
                              📍 Geotagged
                            </div>

                            {/* Remove button */}
                            <button
                              type="button"
                              onClick={() => removeFile(i)}
                              title="Remove"
                              style={{
                                position: 'absolute',
                                top: '4px',
                                right: '4px',
                                background: 'rgba(239, 68, 68, 0.85)',
                                color: '#fff',
                                border: 'none',
                                borderRadius: '50%',
                                width: '20px',
                                height: '20px',
                                fontSize: '0.65rem',
                                fontWeight: 800,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}
                            >
                              ✕
                            </button>
                          </div>
                        );
                      })}

                      {filePreviews.length === 0 && (
                        <div style={{
                          padding: '0.85rem 1rem',
                          background: '#f8fafc',
                          border: '1px dashed #cbd5e1',
                          borderRadius: '10px',
                          fontSize: '0.75rem',
                          color: '#64748b',
                          width: '100%',
                          textAlign: 'center',
                        }}>
                          📷 No geotagged evidence captured yet. Tap the button above to record live geotagged photo or video.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Widget Rail */}
            <aside className="gov-widget-rail">
              {/* Tips for a Better Report Card */}
              <div className="gov-widget-card">
                <div className="widget-header">
                  <span className="widget-icon yellow">💡</span>
                  <h3 className="widget-title">Tips for a Better Report</h3>
                </div>
                <ul className="widget-checklist">
                  <li><span className="tick">✓</span> Provide clear and accurate details</li>
                  <li><span className="tick">✓</span> Add photos or videos</li>
                  <li><span className="tick">✓</span> Use exact location or landmark</li>
                  <li><span className="tick">✓</span> Select the correct category</li>
                  <li><span className="tick">✓</span> Mention impact on citizens (if any)</li>
                </ul>
              </div>

              {/* Common Issues Quick Menu */}
              <div className="gov-widget-card">
                <h3 className="widget-title-plain">Common Issues</h3>
                <div className="common-issues-list">
                  <button type="button" onClick={() => setTitle('Pothole on Rajpur Road')} className="common-issue-item">
                    <span className="c-icon blue">🛣️</span>
                    <span className="c-name">Pothole / Road Damage</span>
                    <span className="c-arrow">&gt;</span>
                  </button>

                  <button type="button" onClick={() => setTitle('Garbage heap not cleared')} className="common-issue-item">
                    <span className="c-icon green">🗑️</span>
                    <span className="c-name">Garbage / Waste</span>
                    <span className="c-arrow">&gt;</span>
                  </button>

                  <button type="button" onClick={() => setTitle('Street Light Not Working')} className="common-issue-item">
                    <span className="c-icon yellow">💡</span>
                    <span className="c-name">Street Light Not Working</span>
                    <span className="c-arrow">&gt;</span>
                  </button>

                  <button type="button" onClick={() => setTitle('Water pipeline leak')} className="common-issue-item">
                    <span className="c-icon cyan">🚰</span>
                    <span className="c-name">Water Supply Issues</span>
                    <span className="c-arrow">&gt;</span>
                  </button>

                  <button type="button" onClick={() => setTitle('Drain overflowing on road')} className="common-issue-item">
                    <span className="c-icon purple">🌊</span>
                    <span className="c-name">Drainage / Sewer</span>
                    <span className="c-arrow">&gt;</span>
                  </button>

                  <button type="button" onClick={() => setTitle('Illegal encroachment on footpath')} className="common-issue-item">
                    <span className="c-icon orange">🚧</span>
                    <span className="c-name">Encroachment</span>
                    <span className="c-arrow">&gt;</span>
                  </button>

                  <button type="button" onClick={() => setTitle('Stray cattle issue')} className="common-issue-item">
                    <span className="c-icon green">🐾</span>
                    <span className="c-name">Stray Animals</span>
                    <span className="c-arrow">&gt;</span>
                  </button>

                  <button type="button" onClick={() => setTitle('Park bench and equipment broken')} className="common-issue-item">
                    <span className="c-icon brown">🌳</span>
                    <span className="c-name">Park / Public Space</span>
                    <span className="c-arrow">&gt;</span>
                  </button>

                  <button type="button" onClick={() => setTitle('Excessive loudspeaker noise')} className="common-issue-item">
                    <span className="c-icon red">📢</span>
                    <span className="c-name">Noise Pollution</span>
                    <span className="c-arrow">&gt;</span>
                  </button>
                </div>
              </div>

              {/* Emergency Helpline Box */}
              <div className="gov-emergency-card">
                <div className="emg-header">
                  <span className="emg-icon">📞</span>
                  <div>
                    <div className="emg-title">Emergency?</div>
                    <div className="emg-desc">For urgent matters, contact district helpline immediately.</div>
                  </div>
                </div>
                <a href="tel:112" className="gov-emg-call-btn">
                  <span>📞</span>
                  <span>112</span>
                </a>
              </div>
            </aside>
          </form>
        </main>
      </div>

      {/* Geotagged Camera & Video Evidence Capture Modal */}
      <CameraCaptureModal
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onCapture={handleCameraCapture}
        initialLatitude={latitude}
        initialLongitude={longitude}
        initialAddress={searchAddress}
      />
    </div>
  );
}
