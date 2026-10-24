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
  Mail,
  Phone,
  CreditCard,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  ArrowRight,
  Shield,
  Smartphone,
  Sparkles,
  AlertTriangle,
} from 'lucide-react';

import GoogleAuthModal, { GoogleIcon } from '@/components/auth/GoogleAuthModal';

export default function RegisterPage() {
  const [accountType, setAccountType] = useState<'citizen' | 'official' | 'ngo'>('citizen');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [aadhaar, setAadhaar] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreedTerms, setAgreedTerms] = useState(true);
  const [subscribedAlerts, setSubscribedAlerts] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const { register } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    if (!agreedTerms) {
      setError('You must accept the terms of use');
      return;
    }

    setLoading(true);
    try {
      await register({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        password,
        role: accountType === 'ngo' ? 'ngo' : accountType === 'official' ? 'official' : 'citizen',
      });
      router.push('/dashboard');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="gov-auth-wrapper">
      {/* Top Bar matching official government portal */}
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
            <div className="gov-lang-select">
              <Globe size={14} />
              <span>English</span>
              <ChevronDown size={12} />
            </div>
            <Link href="/login" className="gov-back-btn" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <ArrowLeft size={14} />
              <span>Back to Login</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main split layout container */}
      <div className="gov-auth-container">
        {/* Left Side: Dehradun Imagery & Civic Pulse Branding (Clean, no blue overlay) */}
        <div className="gov-hero-side">
          <div className="gov-hero-bg-overlay"></div>
          
          <div className="gov-hero-content">

            {/* Motivational Tag */}
            <div className="gov-quote-bubble">
              <div className="gov-quote-text">&ldquo;Jan Bhagidari se Hi Viksit Bharat&rdquo;</div>
              <div className="gov-tricolor-line"></div>
            </div>

            {/* Headline */}
            <div className="gov-hero-titles">
              <h1 className="gov-hero-headline">
                Register for a<br />
                <span className="gov-hero-city-name">Better Dehradun</span>
              </h1>
              <p className="gov-hero-desc">
                Join CivicPulse and be a part of a cleaner, safer,
                more transparent, and more connected Dehradun.
              </p>
            </div>

            {/* Feature Pills */}
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
                <div className="gov-pill-sub">Discuss and share ideas</div>
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

            {/* Bottom Location Tag */}
            <div className="gov-location-footer">
              <div className="gov-loc-pin" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <MapPin size={15} color="#fed7aa" />
                <span className="loc-name">Dehradun, Uttarakhand</span>
              </div>
              <div className="gov-city-pillars">
                Clean City <span>|</span> Green City <span>|</span> Smart City <span>|</span> People&apos;s City
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Create Your Account Form */}
        <div className="gov-form-side">
          <div className="gov-form-card">
            <div className="gov-card-header">
              <div className="gov-header-title-row">
                <h2 className="gov-card-title">Create Your Account</h2>
                <div className="gov-login-prompt">
                  Already have an account? <Link href="/login" className="gov-link-blue">Login</Link>
                </div>
              </div>
              <p className="gov-card-subtitle">Join CivicPulse and make your voice count.</p>
            </div>

            {/* Account Type Tabs */}
            <div className="gov-role-selector">
              <button
                type="button"
                className={`gov-role-tab ${accountType === 'citizen' ? 'active' : ''}`}
                onClick={() => setAccountType('citizen')}
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
                className={`gov-role-tab ${accountType === 'official' ? 'active' : ''}`}
                onClick={() => setAccountType('official')}
              >
                <span className="role-icon" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Landmark size={18} />
                </span>
                <div className="role-title">Government Official</div>
              </button>

              <button
                type="button"
                className={`gov-role-tab ${accountType === 'ngo' ? 'active' : ''}`}
                onClick={() => setAccountType('ngo')}
              >
                <span className="role-icon" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Users size={18} />
                </span>
                <div className="role-title">Organization / NGO</div>
              </button>
            </div>

            {error && (
              <div className="gov-alert-error" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AlertTriangle size={16} color="#ef4444" style={{ flexShrink: 0 }} />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="gov-form-grid">
              {/* Row 1: Full Name & Email */}
              <div className="gov-input-group">
                <label className="gov-label" htmlFor="reg-name">
                  Full Name <span className="req">*</span>
                </label>
                <div className="gov-input-wrap">
                  <span className="input-icon" style={{ display: 'flex', alignItems: 'center' }}>
                    <User size={16} color="#94a3b8" />
                  </span>
                  <input
                    id="reg-name"
                    type="text"
                    className="gov-input"
                    placeholder="Enter your full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="gov-input-group">
                <label className="gov-label" htmlFor="reg-email">
                  Email Address <span className="req">*</span>
                </label>
                <div className="gov-input-wrap">
                  <span className="input-icon" style={{ display: 'flex', alignItems: 'center' }}>
                    <Mail size={16} color="#94a3b8" />
                  </span>
                  <input
                    id="reg-email"
                    type="email"
                    className="gov-input"
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                  />
                </div>
              </div>

              {/* Row 2: Mobile Number & Aadhaar */}
              <div className="gov-input-group">
                <label className="gov-label" htmlFor="reg-phone">
                  Mobile Number <span className="req">*</span>
                </label>
                <div className="gov-input-wrap">
                  <span className="input-icon" style={{ display: 'flex', alignItems: 'center' }}>
                    <Phone size={16} color="#94a3b8" />
                  </span>
                  <input
                    id="reg-phone"
                    type="tel"
                    className="gov-input"
                    placeholder="+91 98765 43210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="gov-input-group">
                <label className="gov-label" htmlFor="reg-aadhaar">
                  Aadhaar Number <span className="opt">(Optional)</span>
                </label>
                <div className="gov-input-wrap">
                  <span className="input-icon" style={{ display: 'flex', alignItems: 'center' }}>
                    <CreditCard size={16} color="#94a3b8" />
                  </span>
                  <input
                    id="reg-aadhaar"
                    type="text"
                    className="gov-input"
                    placeholder="XXXX XXXX XXXX"
                    value={aadhaar}
                    onChange={(e) => setAadhaar(e.target.value)}
                  />
                </div>
                <div className="gov-field-secure-badge" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <CheckCircle2 size={13} color="#16a34a" />
                  <span>Your data is encrypted and secure</span>
                </div>
              </div>

              {/* Row 3: Password & Confirm Password */}
              <div className="gov-input-group">
                <label className="gov-label" htmlFor="reg-pass">
                  Password <span className="req">*</span>
                </label>
                <div className="gov-input-wrap">
                  <span className="input-icon" style={{ display: 'flex', alignItems: 'center' }}>
                    <Lock size={16} color="#94a3b8" />
                  </span>
                  <input
                    id="reg-pass"
                    type={showPassword ? 'text' : 'password'}
                    className="gov-input"
                    placeholder="Create a strong password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="toggle-eye-btn"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? <EyeOff size={16} color="#64748b" /> : <Eye size={16} color="#64748b" />}
                  </button>
                </div>
              </div>

              <div className="gov-input-group">
                <label className="gov-label" htmlFor="reg-confirm-pass">
                  Confirm Password <span className="req">*</span>
                </label>
                <div className="gov-input-wrap">
                  <span className="input-icon" style={{ display: 'flex', alignItems: 'center' }}>
                    <Lock size={16} color="#94a3b8" />
                  </span>
                  <input
                    id="reg-confirm-pass"
                    type={showConfirmPassword ? 'text' : 'password'}
                    className="gov-input"
                    placeholder="Confirm your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="toggle-eye-btn"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    aria-label="Toggle confirm password visibility"
                  >
                    {showConfirmPassword ? <EyeOff size={16} color="#64748b" /> : <Eye size={16} color="#64748b" />}
                  </button>
                </div>
              </div>

              {/* Checkboxes */}
              <div className="gov-checkbox-section">
                <label className="gov-checkbox-label">
                  <input
                    type="checkbox"
                    checked={agreedTerms}
                    onChange={(e) => setAgreedTerms(e.target.checked)}
                  />
                  <span>
                    I agree to the <Link href="/terms" className="gov-link-blue">Terms of Use</Link> and <Link href="/privacy" className="gov-link-blue">Privacy Policy</Link>
                  </span>
                </label>

                <label className="gov-checkbox-label">
                  <input
                    type="checkbox"
                    checked={subscribedAlerts}
                    onChange={(e) => setSubscribedAlerts(e.target.checked)}
                  />
                  <span>I want to receive updates, newsletters and important alerts</span>
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="gov-btn-submit"
                disabled={loading}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
              >
                <span>{loading ? 'Creating Account...' : 'Create Account'}</span>
                {!loading && <ArrowRight size={16} />}
              </button>
            </form>

            {/* Alternative Register Divider */}
            <div className="gov-divider-text">
              <span>OR CREATE ACCOUNT WITH</span>
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

            {/* Secondary SSO Options */}
            <div className="gov-sso-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
              <button
                type="button"
                className="gov-sso-btn"
                onClick={() => alert('Aadhaar verification is connected for registered Indian citizens via DigiLocker.')}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', justifyContent: 'center' }}
              >
                <CreditCard size={15} color="#2563eb" />
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
              mode="register"
            />

            {/* Security Guarantee Box */}
            <div className="gov-security-box">
              <div className="gov-security-icon" style={{ display: 'flex', alignItems: 'center' }}>
                <Shield size={18} color="#1e3a8a" />
              </div>
              <div className="gov-security-content">
                <div className="gov-sec-title">Your information is safe with us.</div>
                <div className="gov-sec-desc">
                  We follow government data security standards and never share your personal details without consent.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer matching official portal */}
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
