import React from "react";
import { Link } from "react-router-dom";

export default function LandingPage() {
  return (
    <div style={styles.container}>
      {/* Dynamic CSS rules for Responsive Media Queries */}
      <style>{`
        @media (max-width: 900px) {
          .responsive-hero-visuals {
            display: none !important;
          }
        }
      `}</style>

      {/* Top Floating Header Bar */}
      <header style={styles.navbar}>
        {/* Logo Section */}
        <div style={styles.logoContainer}>
          <div style={styles.logoIcon}>
            <div style={styles.dropShape}>
              <div style={styles.dropInnerWave} />
            </div>
          </div>
          <div style={styles.logoTextGroup}>
            <span style={styles.logoTitle}>Blood Donate</span>
            <span style={styles.logoSubtitle}></span>
          </div>
        </div>

        {/* Navigation Links */}

        {/* Action Controls */}
        <div style={styles.navActions}>
          {/* <div style={styles.langSelector}>
            <span style={{ fontSize: "16px" }}>🇩🇪</span>
            <span style={{ fontSize: "10px", color: "#666" }}>▼</span>
          </div> */}
          <Link to="/login">
            {" "}
            <button style={styles.loginBtn}>Log In</button>
          </Link>
          <Link to="/register/donor">
            <button style={styles.signUpBtn}>Sign Up</button>
          </Link>
        </div>
      </header>

      {/* Hero Body Content */}
      <div style={styles.heroSection}>
        {/* Left Hero Text Column */}
        <div style={styles.heroContent}>
          <h1 style={styles.heroHeading}>
            Get instant alerts when your blood type is needed.
          </h1>
          <p style={styles.heroDescription}>
            Blood Donate makes donating simple and timely. Register your blood
            group to receive instant notifications as soon as Federal Medical
            Care Umuahia faces a shortage or emergency request, allowing you to
            donate right when it's needed most.
          </p>

          {/* App Store Download Badges */}
          <div style={styles.badgeContainer}>
            <Link to="/register/donor">
              <button style={styles.appBadge}>
                <span style={{ fontSize: "20px", marginRight: "8px" }}></span>
                <div style={{ textAlign: "left" }}>
                  <div
                    style={{
                      fontSize: "9px",
                      textTransform: "uppercase",
                      opacity: 0.8,
                    }}
                  ></div>
                  <div
                    style={{
                      fontSize: "16px",
                      fontWeight: "bold",
                      padding: "10px",
                      textDecoration: "none",
                    }}
                  >
                    Get Started Now
                  </div>
                </div>
              </button>
            </Link>

            {/* <button style={styles.appBadge}>
              <span style={{ fontSize: "18px", marginRight: "8px" }}>▶</span>
              <div style={{ textAlign: "left" }}>
                <div
                  style={{
                    fontSize: "9px",
                    textTransform: "uppercase",
                    opacity: 0.8,
                  }}
                >
                  GET IT ON
                </div>
                <div style={{ fontSize: "13px", fontWeight: "bold" }}>
                  Google Play
                </div>
              </div>
            </button> */}
          </div>
        </div>

        {/* Right Hero Phone Mockups */}
        <div className="responsive-hero-visuals" style={styles.heroVisuals}>
          {/* Back Phone Shadow Mockup */}
          <div style={styles.backPhoneMockup} />

          {/* Main Front Phone Mockup */}
          <div style={styles.frontPhoneMockup}>
            {/* Phone Screen UI Header */}
            <div style={styles.phoneHeader}>
              <div style={styles.phoneSubHeader}>GIVE THE GIFT OF LIFE</div>
              <div style={styles.phoneMainHeader}>DONATE BLOOD</div>
            </div>

            {/* Metrics Display */}
            <div style={styles.statsContainer}>
              <div style={styles.statBox}>
                <div style={styles.statNumber}>1020</div>
                <div style={styles.statLabel}>Blood requests</div>
              </div>
              <div style={styles.statDivider} />
              <div style={styles.statBox}>
                <div style={styles.statNumber}>129</div>
                <div style={styles.statLabel}>Registered users</div>
              </div>
            </div>

            {/* Blood Type Card */}
            <div style={styles.bloodTypeSection}>
              <div style={styles.bloodTypeCard}>
                <span style={{ fontSize: "11px", color: "#666" }}>
                  Blood balance
                </span>
                <div
                  style={{
                    fontSize: "22px",
                    fontWeight: "bold",
                    color: "#333",
                    marginTop: "4px",
                  }}
                >
                  A<sup style={{ fontSize: "14px" }}>RhD-</sup>
                </div>
                <span
                  style={{
                    fontSize: "10px",
                    color: "#ff4d4d",
                    marginTop: "4px",
                    display: "block",
                  }}
                >
                  Most Request Blood Type
                </span>
              </div>

              <div style={styles.totalDonationsCard}>
                <span style={{ fontSize: "11px", color: "#fff", opacity: 0.9 }}>
                  Total Donations
                </span>
                <div
                  style={{
                    fontSize: "24px",
                    fontWeight: "bold",
                    color: "#fff",
                    marginTop: "2px",
                  }}
                >
                  8L
                </div>
                <span style={{ fontSize: "10px", color: "#fff", opacity: 0.9 }}>
                  12 Units
                </span>
              </div>
            </div>

            {/* Hospital Listing Item */}
            <div style={styles.hospitalCard}>
              <div style={styles.hospitalHeader}>
                <div style={styles.avatarCircle} />
                <div>
                  <div
                    style={{
                      fontSize: "11px",
                      fontWeight: "bold",
                      color: "#333",
                    }}
                  >
                    General Hospital
                  </div>
                  <div style={{ fontSize: "9px", color: "#999" }}>20m ago</div>
                </div>
              </div>
              <p style={{ fontSize: "9px", color: "#666", margin: "6px 0" }}>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit...
              </p>
              <div style={styles.cardImagePlaceholder} />
            </div>

            {/* Bottom Nav Icons */}
            <div style={styles.phoneBottomNav}>
              <span style={{ color: "#ff4d4d" }}>🏠</span>
              <span style={{ color: "#ccc" }}>🔍</span>
              <div style={styles.plusButton}>+</div>
              <span style={{ color: "#ccc" }}>🔔</span>
              <span style={{ color: "#ccc" }}>⚙️</span>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative Wave Overlays */}
      <div style={styles.waveLayer1} />
      <div style={styles.waveLayer2} />

      {/* Footer Title */}
      <div style={styles.footerSection}>
        <h2 style={styles.footerTitle}>
          &copy;2026 Federal Medical Care Umuahia
        </h2>
      </div>
    </div>
  );
}

// Inline Styles Object
const styles = {
  container: {
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    minHeight: "100vh",
    background:
      "linear-gradient(135deg, #a780d8 0%, #7681f2 40%, #52a6ff 70%, #99d2ff 100%)",
    position: "relative",
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "30px 20px",
    boxSizing: "border-box",
  },

  /* Navigation Bar Styles */
  navbar: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#ffffff",
    width: "100%",
    maxWidth: "1100px",
    height: "70px",
    borderRadius: "35px",
    padding: "0 15px 0 25px",
    boxShadow: "0 10px 25px rgba(0, 0, 0, 0.08)",
    zIndex: 10,
    boxSizing: "border-box",
  },
  logoContainer: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  logoIcon: {
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    backgroundColor: "#f8f9fa",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  dropShape: {
    width: "22px",
    height: "26px",
    backgroundColor: "#ff3b30",
    borderTopLeftRadius: "50%",
    borderTopRightRadius: "50%",
    borderBottomLeftRadius: "50%",
    borderBottomRightRadius: "50%",
    transform: "rotate(45deg)",
    overflow: "hidden",
    position: "relative",
  },
  dropInnerWave: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    height: "50%",
    backgroundColor: "#007aff",
  },
  logoTextGroup: {
    display: "flex",
    flexDirection: "column",
  },
  logoTitle: {
    fontWeight: "800",
    fontSize: "12px",
    color: "#333",
    letterSpacing: "0.5px",
  },
  logoSubtitle: {
    fontSize: "9px",
    color: "#888",
    direction: "rtl",
  },
  navLinks: {
    display: "flex",
    gap: "24px",
  },
  navItem: {
    textDecoration: "none",
    fontSize: "13px",
    fontWeight: "500",
  },
  navActions: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  langSelector: {
    display: "flex",
    alignItems: "center",
    gap: "4px",
    padding: "4px 8px",
    border: "1px solid #eee",
    borderRadius: "12px",
    cursor: "pointer",
  },
  loginBtn: {
    border: "none",
    background: "none",
    color: "#ff4d4d",
    fontWeight: "600",
    fontSize: "13px",
    cursor: "pointer",
    padding: "8px 12px",
  },
  signUpBtn: {
    border: "none",
    backgroundColor: "#3b82f6",
    color: "#ffffff",
    fontWeight: "600",
    fontSize: "13px",
    padding: "10px 22px",
    borderRadius: "20px",
    cursor: "pointer",
    boxShadow: "0 4px 12px rgba(59, 130, 246, 0.3)",
  },

  /* Hero Main Content */
  heroSection: {
    display: "flex",
    justifyContent: "space-between",
    width: "100%",
    maxWidth: "1100px",
    marginTop: "60px",
    position: "relative",
    zIndex: 5,
  },
  heroContent: {
    maxWidth: "480px",
    marginTop: "30px",
  },
  heroHeading: {
    fontSize: "44px",
    fontWeight: "800",
    color: "#ffffff",
    lineHeight: "1.2",
    margin: "0 0 20px 0",
  },
  heroDescription: {
    color: "rgba(255, 255, 255, 0.85)",
    fontSize: "14px",
    lineHeight: "1.6",
    margin: "0 0 32px 0",
  },
  badgeContainer: {
    display: "flex",
    gap: "14px",
  },
  appBadge: {
    display: "flex",
    alignItems: "center",
    backgroundColor: "#000000",
    color: "#ffffff",
    border: "none",
    borderRadius: "8px",
    padding: "8px 16px",
    cursor: "pointer",
  },

  /* Right Phone Elements */
  heroVisuals: {
    position: "relative",
    width: "450px",
    height: "520px",
  },
  backPhoneMockup: {
    position: "absolute",
    left: "20px",
    top: "20px",
    width: "240px",
    height: "460px",
    backgroundColor: "#ffffff",
    borderRadius: "36px",
    boxShadow: "0 20px 40px rgba(0,0,0,0.15)",
    transform: "rotate(-10deg)",
    opacity: 0.9,
  },
  frontPhoneMockup: {
    position: "absolute",
    right: "20px",
    top: "0px",
    width: "250px",
    height: "490px",
    backgroundColor: "#ffffff",
    borderRadius: "36px",
    border: "8px solid #ffffff",
    boxShadow: "0 25px 50px rgba(0,0,0,0.2)",
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
  },
  phoneHeader: {
    backgroundColor: "#ff4d5a",
    color: "#ffffff",
    textAlign: "center",
    padding: "20px 10px 15px 10px",
  },
  phoneSubHeader: {
    fontSize: "8px",
    letterSpacing: "1px",
    opacity: 0.9,
  },
  phoneMainHeader: {
    fontSize: "16px",
    fontWeight: "900",
    letterSpacing: "0.5px",
  },
  statsContainer: {
    display: "flex",
    justifyContent: "space-around",
    alignItems: "center",
    padding: "12px 10px",
    backgroundColor: "#fff",
    borderBottom: "1px solid #f0f0f0",
  },
  statBox: {
    textAlign: "center",
  },
  statNumber: {
    fontSize: "16px",
    fontWeight: "bold",
    color: "#333",
  },
  statLabel: {
    fontSize: "8px",
    color: "#888",
  },
  statDivider: {
    width: "1px",
    height: "20px",
    backgroundColor: "#eee",
  },
  bloodTypeSection: {
    display: "flex",
    padding: "10px",
    gap: "8px",
  },
  bloodTypeCard: {
    flex: 1.2,
    border: "1px dashed #ff4d4d",
    borderRadius: "10px",
    padding: "8px",
    backgroundColor: "#fff",
  },
  totalDonationsCard: {
    flex: 0.8,
    backgroundColor: "#ff4d5a",
    borderRadius: "10px",
    padding: "8px",
  },
  hospitalCard: {
    margin: "0 10px",
    padding: "10px",
    backgroundColor: "#f9f9f9",
    borderRadius: "10px",
  },
  hospitalHeader: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  avatarCircle: {
    width: "24px",
    height: "24px",
    borderRadius: "50%",
    backgroundColor: "#ddd",
  },
  cardImagePlaceholder: {
    width: "100%",
    height: "45px",
    borderRadius: "6px",
    backgroundColor: "#3b82f6",
    marginTop: "6px",
  },
  phoneBottomNav: {
    marginTop: "auto",
    display: "flex",
    justifyContent: "space-around",
    alignItems: "center",
    padding: "10px 0",
    borderTop: "1px solid #eee",
    backgroundColor: "#fff",
  },
  plusButton: {
    width: "24px",
    height: "24px",
    borderRadius: "50%",
    backgroundColor: "#ff4d5a",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "14px",
  },

  /* Background Wavy Elements */
  waveLayer1: {
    position: "absolute",
    bottom: "-10%",
    right: "-5%",
    width: "70%",
    height: "350px",
    background: "rgba(255, 255, 255, 0.2)",
    borderRadius: "40% 60% 70% 30% / 40% 50% 60% 50%",
    transform: "rotate(-10deg)",
    zIndex: 1,
  },
  waveLayer2: {
    position: "absolute",
    bottom: "-15%",
    right: "0%",
    width: "60%",
    height: "300px",
    background: "rgba(255, 255, 255, 0.4)",
    borderRadius: "50% 50% 30% 70% / 50% 30% 70% 50%",
    zIndex: 2,
  },

  /* Footer Title Section */
  footerSection: {
    marginTop: "auto",
    paddingTop: "40px",
    zIndex: 5,
  },
  footerTitle: {
    fontSize: "28px",
    fontWeight: "800",
    color: "#1a2b4c",
    letterSpacing: "-0.5px",
  },
};
