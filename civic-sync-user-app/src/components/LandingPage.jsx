import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Camera, MapPin, Shield, CheckCircle, Star, Trophy, ArrowRight, Menu, X, Code, ChevronUp, Zap, Users, Award } from 'lucide-react';
import heroImage from '../assets/hero-illustration.png';
import './LandingPage.css';

function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const statsRef = useRef(null);
  const [countersVisible, setCountersVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Intersection observer for stats counter animation
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setCountersVisible(true);
        }
      },
      { threshold: 0.3 }
    );
    if (statsRef.current) observer.observe(statsRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="landing-page">
      {/* ===== NAVBAR ===== */}
      <nav className={`landing-nav ${scrolled ? 'nav-scrolled' : ''}`}>
        <div className="nav-container">
          <Link to="/" className="nav-logo" id="nav-logo">
            <Zap size={24} />
            Civic-Sync
          </Link>

          <div className="nav-auth-buttons desktop-only">
            <Link to="/login" className="btn-ghost" id="nav-login-btn">Log In</Link>
            <Link to="/register" className="btn-primary" id="nav-signup-btn">Sign Up</Link>
          </div>

          <button
            className="hamburger"
            id="hamburger-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="mobile-menu" id="mobile-menu">
            <Link to="/login" className="mobile-menu-link" onClick={() => setMobileMenuOpen(false)}>Log In</Link>
            <Link to="/register" className="mobile-menu-link btn-primary" onClick={() => setMobileMenuOpen(false)}>Sign Up</Link>
          </div>
        )}
      </nav>

      {/* ===== HERO SECTION ===== */}
      <section className="hero-section" id="hero">
        <div className="hero-container">
          <div className="hero-content">
            <h1>
              Report Issues.<br />
              <span className="highlight">Earn Rewards.</span><br />
              Improve Your City.
            </h1>
            <p className="hero-subtitle">
              Civic-Sync is a community-driven platform that connects citizens
              directly with administrators to track, verify, and resolve local issues.
            </p>
            <Link to="/register" className="hero-cta" id="hero-cta-btn">
              Start Reporting Now
              <ArrowRight size={20} />
            </Link>
          </div>
          <div className="hero-visual">
            <img src={heroImage} alt="Civic-Sync app showing issue reporting" className="hero-image" />
            <div className="hero-badge">
              <Trophy size={18} />
              <span>+50 Points</span>
            </div>
          </div>
        </div>
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section className="how-it-works" id="how-it-works">
        <div className="section-header">
          <span className="section-label">How It Works</span>
          <h2 className="section-title">Three Simple Steps</h2>
          <p className="section-subtitle">
            From spotting an issue to earning rewards — here's how Civic-Sync empowers your community.
          </p>
        </div>

        <div className="steps-grid">
          <div className="step-card">
            <div className="step-icon step-icon-purple">
              <Camera size={28} />
            </div>
            <span className="step-number">01</span>
            <h3>Snap & Submit</h3>
            <p>
              Capture photo evidence of civic issues — potholes, broken lights,
              illegal dumping — and submit with GPS coordinates for precise tracking.
            </p>
          </div>

          <div className="step-card">
            <div className="step-icon step-icon-blue">
              <Shield size={28} />
            </div>
            <span className="step-number">02</span>
            <h3>Admin Action</h3>
            <p>
              City administrators review reports prioritized by community upvotes
              and must upload their own photo proof of the resolution.
            </p>
          </div>

          <div className="step-card">
            <div className="step-icon step-icon-green">
              <Award size={28} />
            </div>
            <span className="step-number">03</span>
            <h3>Earn Rewards</h3>
            <p>
              Earn points for every report, climb the real-time leaderboard, and
              redeem rewards from the community store.
            </p>
          </div>
        </div>
      </section>

      {/* ===== FEATURE SPOTLIGHT ===== */}
      <section className="features-section" id="features">
        <div className="section-header">
          <span className="section-label">Features</span>
          <h2 className="section-title">Built for Accountability</h2>
          <p className="section-subtitle">
            Every feature is designed to create a transparent loop between citizens and their city.
          </p>
        </div>

        <div className="feature-block">
          <div className="feature-content">
            <span className="feature-tag feature-tag-purple">Accountability</span>
            <h3>User Rating System</h3>
            <p>
              After an admin marks an issue as resolved, the original reporter can
              rate the resolution from 1 to 5 stars. Low ratings automatically
              reopen the ticket, ensuring real accountability and quality work.
            </p>
            <div className="feature-stars">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} size={24} fill={s <= 4 ? '#f59e0b' : 'none'} color={s <= 4 ? '#f59e0b' : '#d1d5db'} />
              ))}
            </div>
          </div>
          <div className="feature-visual">
            <div className="feature-card rating-card">
              <div className="rating-card-header">
                <CheckCircle size={20} color="#10b981" />
                <span>Issue Resolved</span>
              </div>
              <p className="rating-card-title">Pothole on Main Street</p>
              <div className="rating-card-stars">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} size={20} fill={s <= 4 ? '#f59e0b' : 'none'} color={s <= 4 ? '#f59e0b' : '#d1d5db'} />
                ))}
              </div>
              <p className="rating-card-feedback">"Great repair work, thank you!"</p>
            </div>
          </div>
        </div>

        <div className="feature-block feature-block-reverse">
          <div className="feature-content">
            <span className="feature-tag feature-tag-green">Transparency</span>
            <h3>Live Interactive Map</h3>
            <p>
              Every reported issue is pinned on a live interactive map powered by
              Leaflet. Visualize problem hotspots, track resolution progress
              across neighborhoods, and see your city improve in real-time.
            </p>
          </div>
          <div className="feature-visual">
            <div className="feature-card map-card">
              <div className="map-mockup">
                <div className="map-pin map-pin-1">
                  <MapPin size={24} color="#ef4444" fill="#fecaca" />
                </div>
                <div className="map-pin map-pin-2">
                  <MapPin size={24} color="#f59e0b" fill="#fef3c7" />
                </div>
                <div className="map-pin map-pin-3">
                  <MapPin size={24} color="#10b981" fill="#d1fae5" />
                </div>
                <div className="map-grid-lines"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== STATS BANNER ===== */}
      <section className="stats-section" id="stats" ref={statsRef}>
        <div className="stats-grid">
          <div className="stat-item">
            <span className={`stat-number ${countersVisible ? 'animate' : ''}`}>1,200+</span>
            <span className="stat-label">Issues Resolved</span>
          </div>
          <div className="stat-item">
            <span className={`stat-number ${countersVisible ? 'animate' : ''}`}>5,000+</span>
            <span className="stat-label">Active Citizens</span>
          </div>
          <div className="stat-item">
            <span className={`stat-number ${countersVisible ? 'animate' : ''}`}>500K+</span>
            <span className="stat-label">Points Awarded</span>
          </div>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="landing-footer" id="footer">
        <div className="footer-container">
          <div className="footer-top">
            <div className="footer-brand">
              <div className="footer-logo">
                <Zap size={20} />
                <span>Civic-Sync</span>
              </div>
              <p className="footer-tagline">Empowering citizens to build better cities, one report at a time.</p>
            </div>
            <div className="footer-links">
              <a href="#">About Us</a>
              <a href="#">Terms of Service</a>
              <a href="https://github.com" target="_blank" rel="noopener noreferrer">
                <Code size={16} />
                GitHub
              </a>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; {new Date().getFullYear()} Civic-Sync. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;
