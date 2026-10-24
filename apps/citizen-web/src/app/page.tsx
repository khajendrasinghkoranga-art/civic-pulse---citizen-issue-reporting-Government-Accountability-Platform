'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import {
  Landmark,
  MapPin,
  Globe,
  ChevronDown,
  Megaphone,
  Search,
  Users,
  ShieldCheck,
  FileText,
  CheckCircle2,
  Building2,
  Star,
  Receipt,
  FileCheck,
  BarChart3,
  TrendingUp,
  ArrowRight,
  LogOut,
  Sparkles,
  TreePine,
  Bell,
  ArrowUpRight,
} from 'lucide-react';

export default function HomePage() {
  const { isAuthenticated, logout } = useAuth();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/issues?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <div className="gov-landing-wrapper">
      {/* 1. Indian Government Header Banner */}
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
              <div className="gov-font-size-toggles">
                <button type="button" className="gov-font-btn">A-</button>
                <button type="button" className="gov-font-btn">A</button>
                <button type="button" className="gov-font-btn">A+</button>
              </div>

              <div className="gov-lang-select-pill">
                <Globe size={13} />
                <span>English</span>
                <ChevronDown size={11} />
              </div>

              {isAuthenticated ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Link href="/dashboard" className="gov-btn-login">
                    Dashboard
                  </Link>
                  <button
                    type="button"
                    onClick={() => logout()}
                    className="gov-btn-logout"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                      background: '#fef2f2',
                      color: '#dc2626',
                      border: '1px solid #fecaca',
                      padding: '0.4rem 0.85rem',
                      borderRadius: '6px',
                      fontWeight: 600,
                      fontSize: '0.8rem',
                      cursor: 'pointer',
                      transition: 'all 0.15s'
                    }}
                    title="Sign Out"
                  >
                    <LogOut size={13} />
                    <span>Logout</span>
                  </button>
                </div>
              ) : (
                <>
                  <Link href="/login" className="gov-btn-login">
                    Login
                  </Link>
                  <Link href="/register" className="gov-btn-register">
                    Register
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>

        {/* 2. Main Navigation Bar */}
        <nav className="gov-main-navbar">
          <div className="gov-container navbar-inner">
            <Link href="/" className="gov-brand-header" style={{ display: 'inline-flex', alignItems: 'center' }}>
              <img
                src="/civicpulse-logo.png"
                alt="CivicPulse - Your Voice. Your City. Your Future."
                style={{ height: '80px', width: 'auto', objectFit: 'contain' }}
              />
            </Link>

            <div className="gov-nav-menu">
              <Link href="/" className="gov-nav-item active">Home</Link>
              <Link href="/about" className="gov-nav-item">About</Link>
              <Link href="/report" className="gov-nav-item">Report an Issue</Link>
              <Link href="/issues" className="gov-nav-item">Track Complaint</Link>
              <Link href="/services" className="gov-nav-item">Local Services</Link>
              <Link href="/community" className="gov-nav-item">Community</Link>
              <Link href="/transparency" className="gov-nav-item">Transparency</Link>
              <Link href="/resources" className="gov-nav-item">Resources</Link>
              <Link href="/contact" className="gov-nav-item">Contact</Link>
            </div>
          </div>
        </nav>
      </header>

      {/* 3. Hero Section with Dehradun Landscape Background (Natural color, no blue haze) */}
      <section className="gov-hero-banner">
        <div className="gov-hero-bg-overlay"></div>
        <div className="gov-container gov-hero-inner">
          <div className="gov-hero-left">
            <h1 className="gov-hero-heading">
              A Cleaner, Safer,<br />
              Stronger Dehradun<br />
              Starts with You
            </h1>
            <p className="gov-hero-subtext">
              Report issues, track progress, access local services,
              and be part of a transparent and responsive governance system.
            </p>

            <div className="gov-hero-actions">
              <Link href="/report" className="gov-btn-action-primary">
                <span>Report an Issue</span>
                <ArrowRight size={16} />
              </Link>
              <Link href="/issues" className="gov-btn-action-outline">
                <span>Track Your Complaint</span>
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>

          <div className="gov-hero-right">
            <div className="gov-hero-quote-card">
              <div className="gov-quote-headline">
                &ldquo;Stronger Communities<br />
                Brighter Dehradun&rdquo;
              </div>
              <div className="gov-quote-tricolor"></div>
            </div>

            {/* 4 Feature Badges in Hero */}
            <div className="gov-hero-feature-row">
              <div className="gov-hero-feat-item">
                <div className="feat-icon" style={{ display: 'flex', justifyContent: 'center' }}>
                  <Megaphone size={22} color="#2563eb" />
                </div>
                <div className="feat-title">Report</div>
                <div className="feat-desc">Tell us what&apos;s wrong</div>
              </div>

              <div className="gov-hero-feat-item">
                <div className="feat-icon" style={{ display: 'flex', justifyContent: 'center' }}>
                  <Search size={22} color="#16a34a" />
                </div>
                <div className="feat-title">Track</div>
                <div className="feat-desc">See real-time progress</div>
              </div>

              <div className="gov-hero-feat-item">
                <div className="feat-icon" style={{ display: 'flex', justifyContent: 'center' }}>
                  <Users size={22} color="#9333ea" />
                </div>
                <div className="feat-title">Participate</div>
                <div className="feat-desc">Join discussions & polls</div>
              </div>

              <div className="gov-hero-feat-item">
                <div className="feat-icon" style={{ display: 'flex', justifyContent: 'center' }}>
                  <ShieldCheck size={22} color="#f97316" />
                </div>
                <div className="feat-title">Create Change</div>
                <div className="feat-desc">Better Dehradun together</div>
              </div>
            </div>
          </div>
        </div>

        {/* 4. Prominent Search Bar floating below hero */}
        <div className="gov-search-floater-container">
          <div className="gov-container">
            <form onSubmit={handleSearch} className="gov-search-bar-wrap">
              <Search size={20} color="#64748b" style={{ flexShrink: 0 }} />
              <input
                type="text"
                className="gov-search-input"
                placeholder="Search for services, issues, departments... (e.g. water supply, road, electricity)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button type="submit" className="gov-search-submit-btn">
                Search
              </button>
            </form>

            <div className="gov-popular-tags">
              <span className="popular-label">Popular:</span>
              <button type="button" onClick={() => setSearchQuery('Water Supply')} className="popular-tag">Water Supply</button>
              <button type="button" onClick={() => setSearchQuery('Road Maintenance')} className="popular-tag">Road Maintenance</button>
              <button type="button" onClick={() => setSearchQuery('Street Light')} className="popular-tag">Street Light</button>
              <button type="button" onClick={() => setSearchQuery('Garbage Collection')} className="popular-tag">Garbage Collection</button>
              <button type="button" onClick={() => setSearchQuery('Birth Certificate')} className="popular-tag">Birth Certificate</button>
              <button type="button" onClick={() => setSearchQuery('Property Tax')} className="popular-tag">Property Tax</button>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Metrics Banner */}
      <section className="gov-stats-section">
        <div className="gov-container">
          <div className="gov-stats-grid">
            <div className="gov-stat-card">
              <div className="stat-icon-wrap blue-bg" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Users size={22} color="#2563eb" />
              </div>
              <div className="stat-content">
                <div className="stat-number">50,000+</div>
                <div className="stat-label">Active Citizens</div>
              </div>
            </div>

            <div className="gov-stat-card">
              <div className="stat-icon-wrap cyan-bg" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <FileText size={22} color="#0891b2" />
              </div>
              <div className="stat-content">
                <div className="stat-number">25,000+</div>
                <div className="stat-label">Issues Reported</div>
              </div>
            </div>

            <div className="gov-stat-card">
              <div className="stat-icon-wrap green-bg" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CheckCircle2 size={22} color="#16a34a" />
              </div>
              <div className="stat-content">
                <div className="stat-number">92%</div>
                <div className="stat-label">Resolved on Time</div>
              </div>
            </div>

            <div className="gov-stat-card">
              <div className="stat-icon-wrap purple-bg" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Building2 size={22} color="#9333ea" />
              </div>
              <div className="stat-content">
                <div className="stat-number">25+</div>
                <div className="stat-label">Departments Connected</div>
              </div>
            </div>

            <div className="gov-stat-card">
              <div className="stat-icon-wrap orange-bg" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <MapPin size={22} color="#ea580c" />
              </div>
              <div className="stat-content">
                <div className="stat-number">248</div>
                <div className="stat-label">Local Services</div>
              </div>
            </div>

            <div className="gov-stat-card">
              <div className="stat-icon-wrap yellow-bg" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Star size={22} color="#ca8a04" />
              </div>
              <div className="stat-content">
                <div className="stat-number">4.6/5</div>
                <div className="stat-label">Citizen Satisfaction</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Explore Our Services Grid */}
      <section className="gov-services-section">
        <div className="gov-container">
          <div className="gov-section-header">
            <div>
              <h2 className="gov-section-title">Explore Our Services</h2>
              <p className="gov-section-subtitle">Quick access to the most used citizen services</p>
            </div>
            <Link href="/services" className="gov-view-all-link" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <span>View All Services</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          <div className="gov-services-grid">
            <Link href="/report" className="gov-service-tile">
              <div className="tile-icon red-light">
                <Megaphone size={22} />
              </div>
              <div className="tile-title">Report an Issue</div>
            </Link>

            <Link href="/issues" className="gov-service-tile">
              <div className="tile-icon green-light">
                <Search size={22} />
              </div>
              <div className="tile-title">Track Complaint</div>
            </Link>

            <Link href="/services" className="gov-service-tile">
              <div className="tile-icon purple-light">
                <Landmark size={22} />
              </div>
              <div className="tile-title">Local Services</div>
            </Link>

            <Link href="/services" className="gov-service-tile">
              <div className="tile-icon orange-light">
                <Receipt size={22} />
              </div>
              <div className="tile-title">Pay Utility Bills</div>
            </Link>

            <Link href="/services" className="gov-service-tile">
              <div className="tile-icon magenta-light">
                <FileCheck size={22} />
              </div>
              <div className="tile-title">Apply for Certificate</div>
            </Link>

            <Link href="/community" className="gov-service-tile">
              <div className="tile-icon blue-light">
                <Users size={22} />
              </div>
              <div className="tile-title">Community Forum</div>
            </Link>

            <Link href="/community" className="gov-service-tile">
              <div className="tile-icon cyan-light">
                <BarChart3 size={22} />
              </div>
              <div className="tile-title">Participate in Polls</div>
            </Link>

            <Link href="/transparency" className="gov-service-tile">
              <div className="tile-icon indigo-light">
                <TrendingUp size={22} />
              </div>
              <div className="tile-title">View Dashboard</div>
            </Link>
          </div>
        </div>
      </section>

      {/* 7. Bottom Three Action Cards */}
      <section className="gov-bottom-cards-section">
        <div className="gov-container">
          <div className="gov-bottom-grid">
            {/* Card 1: Clean Dehradun Green Dehradun Banner */}
            <div className="gov-promo-card-dehradun">
              <div className="promo-overlay"></div>
              <div className="promo-content">
                <h3 className="promo-title">Clean Dehradun</h3>
                <h4 className="promo-subtitle">Green Dehradun</h4>
              </div>
            </div>

            {/* Card 2: Latest Updates List */}
            <div className="gov-card-updates">
              <div className="updates-header">
                <h3 className="updates-title">Latest Updates</h3>
                <Link href="/notifications" className="updates-view-all" style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                  <span>View All</span>
                  <ArrowRight size={13} />
                </Link>
              </div>

              <div className="updates-list">
                <div className="update-item">
                  <div className="update-date">17 Sep 2026</div>
                  <div className="update-text">Water supply will be temporarily disrupted in Indira Nagar</div>
                  <span className="update-badge badge-announcement">Announcement</span>
                </div>

                <div className="update-item">
                  <div className="update-date">15 Sep 2026</div>
                  <div className="update-text">New park development approved in Clementown</div>
                  <span className="update-badge badge-goodnews">Good News</span>
                </div>

                <div className="update-item">
                  <div className="update-date">12 Sep 2026</div>
                  <div className="update-text">Street light maintenance drive starts next week</div>
                  <span className="update-badge badge-service">Service Update</span>
                </div>
              </div>
            </div>

            {/* Card 3: Be the Change / Take Part in Civic Polls */}
            <div className="gov-promo-card-polls">
              <div className="polls-promo-content">
                <div className="polls-quote-tag">
                  &ldquo;People Participation Progress&rdquo;
                </div>
                <h3 className="polls-promo-title">
                  Be the Change<br />
                  Take Part in Civic Polls
                </h3>
                <p className="polls-promo-desc">
                  Share your opinion on civic issues and help shape a better Dehradun.
                </p>
                <Link href="/community" className="gov-btn-poll-action" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  <span>View Active Polls</span>
                  <ArrowRight size={14} />
                </Link>
              </div>
              <div className="polls-plant-graphic" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <TreePine size={40} color="#16a34a" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 8. Global Official Footer */}
      <footer className="gov-bottom-footer">
        <div className="gov-footer-inner">
          <div className="gov-footer-emblem-wrap">
            <span className="gov-emblem-icon" style={{ display: 'inline-flex', alignItems: 'center' }}>
              <img
                src="/ashok-stambh.png"
                alt="State Emblem of India"
                style={{ height: '28px', width: 'auto', objectFit: 'contain' }}
              />
            </span>
            <div>
              <div className="gov-satyameva">Government of India • सत्यमेव जयते</div>
              <div className="gov-footer-tagline">CivicPulse • A Digital India Initiative</div>
            </div>
          </div>

          <div className="gov-footer-links">
            <Link href="/about">About</Link>
            <span className="sep">|</span>
            <Link href="/help">Help</Link>
            <span className="sep">|</span>
            <Link href="/privacy">Privacy Policy</Link>
            <span className="sep">|</span>
            <Link href="/terms">Terms of Use</Link>
            <span className="sep">|</span>
            <Link href="/feedback">Feedback</Link>
            <span className="sep">|</span>
            <Link href="/sitemap">Sitemap</Link>
          </div>

          <div className="gov-footer-social">
            <span className="follow-label">Follow Us</span>
            <span className="social-icon">𝕏</span>
            <span className="social-icon">f</span>
            <span className="social-icon">in</span>
          </div>

          <div className="gov-digital-india-logo">
            <span className="di-emblem" style={{ display: 'inline-flex', alignItems: 'center' }}>
              <Sparkles size={18} color="#f97316" />
            </span>
            <div>
              <div className="di-title">Digital India</div>
              <div className="di-tagline">Power To Empower</div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
