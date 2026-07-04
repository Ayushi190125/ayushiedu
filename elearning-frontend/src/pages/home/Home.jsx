import React from "react";
import { useNavigate } from "react-router-dom";
import "./home.css";
import Testimonials from "../../components/testimonials/Testimonials";

const Home = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: "📚",
      title: "Self-Paced Video Lectures",
      desc: "Watch and rewatch high-quality educational videos on your own schedule."
    },
    {
      icon: "✍",
      title: "Interactive Quizzes",
      desc: "Verify your topic understanding instantly with course-specific testing checks."
    },
    {
      icon: "🎓",
      title: "Official Certificates",
      desc: "Complete courses, unlock quizzes, and download verified graduation credentials."
    },
    {
      icon: "📱",
      title: "Responsive Learning",
      desc: "Access your dashboard, workspace, and lectures smoothly on any mobile or desktop screen."
    }
  ];

  return (
    <div className="home-page-wrapper">
      {/* Hero Section */}
      <section className="home-hero-section">
        <div className="hero-glow-blob-1"></div>
        <div className="hero-glow-blob-2"></div>

        <div className="hero-content-wrapper">
          <h1 className="hero-title">
            Welcome to <span className="highlight-text">AyushiEdu</span> Platform
          </h1>
          <p className="hero-subtitle">
            Unlock your academic potential with professional video courses, integrated tests, and instant digital certifications.
          </p>
          <div className="hero-buttons-group">
            <button onClick={() => navigate("/courses")} className="common-btn hero-cta-btn">
              Explore Courses
            </button>
            <button onClick={() => navigate("/about")} className="secondary-btn hero-sec-btn">
              About Us
            </button>
          </div>
        </div>
      </section>

      {/* Stats Counter Section */}
      <section className="home-stats-section">
        <div className="stats-grid">
          <div className="stat-item">
            <div className="stat-number">5+</div>
            <div className="stat-label">Premium Courses</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">25+</div>
            <div className="stat-label">Lectures Selections</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">100%</div>
            <div className="stat-label">Self-Paced Study</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">Verified</div>
            <div className="stat-label">PNG Certificates</div>
          </div>
        </div>
      </section>

      {/* Core Features Grid Section */}
      <section className="home-features-section">
        <h2 className="section-title">Why Study With Us?</h2>
        <p className="section-subtitle">Experience a modern e-learning workspace designed for quick learning and skill growth.</p>

        <div className="features-grid">
          {features.map((feat, idx) => (
            <div className="feature-card" key={idx}>
              <div className="feature-icon-circle">{feat.icon}</div>
              <h3 className="feature-card-title">{feat.title}</h3>
              <p className="feature-card-desc">{feat.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Review Testimonials */}
      <Testimonials />

      {/* Bottom CTA Block */}
      <section className="home-bottom-cta-section">
        <div className="cta-inner-card">
          <h2>Ready to start your learning journey?</h2>
          <p>Get instant access to all lectures, tracking stats, and custom smart quizzes today.</p>
          <button onClick={() => navigate("/courses")} className="common-btn">
            Get Started Now
          </button>
        </div>
      </section>
    </div>
  );
};

export default Home;
