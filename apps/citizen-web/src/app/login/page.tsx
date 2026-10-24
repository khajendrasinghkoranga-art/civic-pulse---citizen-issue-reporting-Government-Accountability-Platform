'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import {
  Landmark,
  Globe,
  ChevronDown,
  ArrowLeft,
  MapPin,
  Megaphone,
  Users,
  BarChart3,
  User,
  Shield,
  AlertTriangle,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  KeyRound,
  Smartphone,
  Sparkles,
} from 'lucide-react';

import GoogleAuthModal, { GoogleIcon } from '@/components/auth/GoogleAuthModal';
import { useLanguage } from '@/hooks/useLanguage';

export default function LoginPage() {
  const { lang, toggleLang, t } = useLanguage();
  const [role, setRole] = useState<'citizen' | 'official' | 'ngo'>('citizen');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email.trim(), password);
      router.push('/dashboard');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="gov-auth-wrapper">
      {/* Top Bar matching government portal style */}
      <header className="gov-top-bar">
        <div className="gov-top-bar-inner">
          <div className="gov-emblem-section">
            <div className="gov-emblem-badge">
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
            </div>
            <div className="gov-initiative-divider"></div>
            <div className="gov-initiative-text">
              <div className="gov-initiative-title">A Digital India Initiative</div>
              <div className="gov-initiative-tagline">People • Process • Progress</div>
            </div>
          </div>

          <div className="gov-top-actions">
            <button
              type="button"
              onClick={toggleLang}
              className="gov-lang-select"
              title={lang === 'en' ? 'हिन्दी में बदलें (Switch to Hindi)' : 'Switch to English'}
              style={{ cursor: 'pointer', background: 'transparent', border: '1px solid rgba(255,255,255,0.2)' }}
            >
              <Globe size={14} />
              <span>{lang === 'en' ? 'English | हिन्दी' : 'हिन्दी | English'}</span>
            </button>
            <Link href="/" className="gov-back-btn" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <ArrowLeft size={14} />
              <span>{lang === 'hi' ? 'मुख्य पृष्ठ पर वापस' : 'Back to Home'}</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Split Layout */}
      <div className="gov-auth-container">
        {/* Left Visual Side (Dehradun Landscape, clear natural colors, no blue haze) */}
        <div className="gov-hero-side">
          <div className="gov-hero-bg-overlay"></div>
          <div className="gov-hero-content">

            {/* Motivational Tag & Title */}
            <div className="gov-hero-mid">
              <div className="gov-quote-bubble">
                <span className="gov-quote-text">&ldquo;Jan Bhagidari se Hi Viksit Bharat&rdquo;</span>
                <div className="gov-quote-tricolor"></div>
              </div>

              <h1 className="gov-hero-headline">
                Sign in to <br />
                <span className="gov-hero-city-name">CivicPulse</span>
              </h1>
              <p className="gov-hero-desc">
                Access your civic issues, track real-time government resolution progress,
                and participate in municipal initiatives for a better Dehradun.
              </p>

              <div className="gov-feature-pills">
                <div className="gov-feature-pill">
                  <div className="gov-pill-icon red-tint" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Megaphone size={18} color="#ef4444" />
                  </div>
                  <div className="gov-pill-title">Report Issues</div>
                  <div className="gov-pill-sub">Raise concerns easily</div>
                </div>
                <div className="gov-feature-pill">
                  <div className="gov-pill-icon blue-tint" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Users size={18} color="#3b82f6" />
                  </div>
                  <div className="gov-pill-title">Join Community</div>
                  <div className="gov-pill-sub">Discuss & share ideas</div>
                </div>
                <div className="gov-feature-pill">
                  <div className="gov-pill-icon purple-tint" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Landmark size={18} color="#a855f7" />
                  </div>
                  <div className="gov-pill-title">Access Services</div>
                  <div className="gov-pill-sub">Get info in one place</div>
                </div>
                <div className="gov-feature-pill">
                  <div className="gov-pill-icon cyan-tint" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <BarChart3 size={18} color="#06b6d4" />
                  </div>
                  <div className="gov-pill-title">Track Progress</div>
                  <div className="gov-pill-sub">See real-time updates</div>
                </div>
              </div>
            </div>

            {/* Footer Pin & Pillars */}
            <div className="gov-location-footer">
              <div className="gov-loc-pin" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <MapPin size={15} color="#fed7aa" />
                <span>Dehradun, Uttarakhand</span>
              </div>
              <div className="gov-city-pillars">
                Clean City <span>|</span> Green City <span>|</span> Smart City <span>|</span> People&apos;s City
              </div>
            </div>
          </div>
        </div>

        {/* Right Form Side */}
        <div className="gov-form-side">
          <div className="gov-form-card">
            <div className="gov-header-title-row">
              <h2 className="gov-card-title">Sign In to Your Account</h2>
              <div className="gov-login-prompt">
                New user? <Link href="/register" className="gov-link-blue">Register</Link>
              </div>
            </div>
            <p className="gov-card-subtitle">
              Enter your credentials to access your citizen workspace.
            </p>

            {/* Role / Account Type Selector Tabs */}
            <div className="gov-role-selector">
              <button
                type="button"
                className={`gov-role-tab ${role === 'citizen' ? 'active' : ''}`}
                onClick={() => setRole('citizen')}
              >
                <span className="role-icon" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                  <User size={18} />
                </span>
                <div>
                  <div className="role-title">Citizen</div>
                  <div className="role-sub">(General Public)</div>
                </div>
              </button>

              <button
                type="button"
                className={`gov-role-tab ${role === 'official' ? 'active' : ''}`}
                onClick={() => setRole('official')}
              >
                <span className="role-icon" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Landmark size={18} />
                </span>
                <div>
                  <div className="role-title">Government Official</div>
                  <div className="role-sub">(Staff / Admin)</div>
                </div>
              </button>

              <button
                type="button"
                className={`gov-role-tab ${role === 'ngo' ? 'active' : ''}`}
                onClick={() => setRole('ngo')}
              >
                <span className="role-icon" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Users size={18} />
                </span>
                <div>
                  <div className="role-title">Organization</div>
                  <div className="role-sub">(NGO / Partner)</div>
                </div>
              </button>
            </div>

            {error && (
              <div className="gov-alert-error" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AlertTriangle size={16} color="#ef4444" style={{ flexShrink: 0 }} />
                <span>{error}</span>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '1rem',
                  background: '#eff6ff',
                  border: '1px solid #bfdbfe',
                  borderRadius: '8px',
                  padding: '8px 12px',
                  fontSize: '0.8rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#1e3a8a' }}>
                  <Sparkles size={15} color="#2563eb" />
                  <span>
                    Citizen: <strong>khajendrasinghkoranga@gmail.com</strong>
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setEmail('khajendrasinghkoranga@gmail.com');
                    setPassword('CivicPulse@123');
                  }}
                  style={{
                    background: '#2563eb',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '4px 10px',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Quick Fill
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.25rem' }}>
                <div className="gov-input-group">
                  <label className="gov-label">
                    Email Address <span className="req">*</span>
                  </label>
                  <div className="gov-input-wrap">
                    <span className="input-icon" style={{ display: 'flex', alignItems: 'center' }}>
                      <Mail size={16} color="#94a3b8" />
                    </span>
                    <input
                      type="email"
                      className="gov-input"
                      placeholder="Enter your registered email address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="gov-input-group">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <label className="gov-label">
                      Password <span className="req">*</span>
                    </label>
                    <Link href="/login" style={{ fontSize: '0.75rem', color: '#2563eb', fontWeight: 600 }}>
                      Forgot Password?
                    </Link>
                  </div>
                  <div className="gov-input-wrap">
                    <span className="input-icon" style={{ display: 'flex', alignItems: 'center' }}>
                      <Lock size={16} color="#94a3b8" />
                    </span>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      className="gov-input"
                      placeholder="Enter your account password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      className="toggle-eye-btn"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff size={16} color="#64748b" /> : <Eye size={16} color="#64748b" />}
                    </button>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="gov-btn-submit"
                disabled={loading}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
              >
                <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
                {!loading && <ArrowRight size={16} />}
              </button>
            </form>

            {/* Quick Demo Credentials Help */}
            <div style={{
              marginTop: '1rem',
              padding: '0.75rem 0.85rem',
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              fontSize: '0.75rem',
              color: '#475569'
            }}>
              <div style={{ fontWeight: 700, color: '#0f172a', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <KeyRound size={14} color="#f59e0b" />
                <span>Default Logins:</span>
              </div>
              <div>• <strong>Your Google Account:</strong> khajendrasinghkoranga@gmail.com / CivicPulse@123</div>
              <div>• <strong>Citizen Demo:</strong> ananya@example.com / CivicPulse@123</div>
              <div>• <strong>Admin Demo:</strong> admin@civicpulse.in / CivicPulse@123</div>
            </div>

            {/* Divider */}
            <div className="gov-divider-text">
              <span>OR SIGN IN WITH</span>
            </div>

            {/* Prominent Google Authentication Button */}
            <button
              type="button"
              onClick={() => setShowGoogleModal(true)}
              className="gov-google-auth-btn"
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '12px',
                padding: '0.75rem 1rem',
                borderRadius: '10px',
                backgroundColor: '#ffffff',
                border: '1.5px solid #cbd5e1',
                color: '#1e293b',
                fontSize: '0.92rem',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 2px 6px rgba(0, 0, 0, 0.06)',
                transition: 'all 0.2s ease',
                marginBottom: '0.75rem',
              }}
            >
              <GoogleIcon size={20} />
              <span>Continue with Google</span>
            </button>

            {/* Secondary SSO / Alternative Login Options */}
            <div className="gov-sso-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
              <button
                type="button"
                className="gov-sso-btn"
                onClick={() => alert('Aadhaar OTP is connected for registered Indian citizens via DigiLocker.')}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', justifyContent: 'center' }}
              >
                <Shield size={15} color="#2563eb" />
                <span>Aadhaar DigiLocker</span>
              </button>

              <button
                type="button"
                className="gov-sso-btn"
                onClick={() => alert('Mobile OTP verification is active for verified Indian mobile numbers.')}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', justifyContent: 'center' }}
              >
                <Smartphone size={15} color="#16a34a" />
                <span>Mobile OTP</span>
              </button>
            </div>

            {/* Google Authentication Dialog Modal */}
            <GoogleAuthModal
              isOpen={showGoogleModal}
              onClose={() => setShowGoogleModal(false)}
              mode="login"
            />

            {/* Security Notice */}
            <div className="gov-security-box">
              <span className="gov-security-icon" style={{ display: 'flex', alignItems: 'center' }}>
                <Shield size={18} color="#1e3a8a" />
              </span>
              <div>
                <div className="gov-sec-title">Your information is safe with us.</div>
                <div className="gov-sec-desc">
                  We follow government data security standards and never share your personal details without consent.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Global Bottom Footer */}
      <footer className="gov-bottom-footer">
        <div className="gov-footer-inner">
          <div className="gov-footer-emblem-wrap">
            <span style={{ display: 'inline-flex', alignItems: 'center' }}>
              <img
                src="/ashok-stambh.png"
                alt="State Emblem of India"
                style={{ height: '28px', width: 'auto', objectFit: 'contain' }}
              />
            </span>
            <div>
              <div className="gov-satyameva">सत्यमेव जयते</div>
              <div className="gov-footer-tagline">Together for a Better Dehradun</div>
            </div>
          </div>

          <div className="gov-footer-links">
            <Link href="/">About</Link>
            <span className="sep">|</span>
            <Link href="/">Privacy Policy</Link>
            <span className="sep">|</span>
            <Link href="/">Terms of Use</Link>
            <span className="sep">|</span>
            <Link href="/">Help</Link>
            <span className="sep">|</span>
            <Link href="/">Contact</Link>
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
