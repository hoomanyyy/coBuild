import "../styles/HomeScreen.css";
import React, { useState } from "react";
import { Link } from "react-router-dom";

const FEATURES = [
  {
    icon: "🧑‍🤝‍🧑",
    title: "Real Profiles",
    text: "Build a profile, add your interests, and find people to work with.",
  },
  {
    icon: "📡",
    title: "Live Rooms",
    text: "Join rooms over WebSocket and see who's there in real time.",
  },
  {
    icon: "📚",
    title: "Homework Help",
    text: "Study together, share notes, and get unstuck faster.",
  },
  {
    icon: "💻",
    title: "Code Together",
    text: "Pair up on projects, review code, and learn by building.",
  },
  {
    icon: "🎨",
    title: "Design & Music",
    text: "Rooms for design feedback, music practice, and more.",
  },
  {
    icon: "🔒",
    title: "Private or Public",
    text: "Open rooms for anyone, or invite-only rooms for your circle.",
  },
];

const STEPS = [
  { number: "01", title: "Create your profile", text: "Sign up in a minute and set up your profile." },
  { number: "02", title: "Find or create a room", text: "Browse live rooms by category, or start your own." },
  { number: "03", title: "Collaborate in real time", text: "Join over WebSocket and get things done together." },
];

function HomeScreen() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="landing">
      {/* Nav */}
      <nav className="landing-nav">
        <div className="landing-logo">
          <span className="landing-logo-mark">✦</span>
          RoomUp
        </div>

        <button
          className="nav-menu-toggle"
          type="button"
          aria-label="Toggle menu"
          onClick={() => setMenuOpen((prev) => !prev)}
        >
          ☰
        </button>

        <div className={`landing-nav-actions ${menuOpen ? "landing-nav-actions--open" : ""}`}>
          <Link to="/login" className="nav-link">
            Login
          </Link>
          <Link to="/signup" className="nav-cta">
            Sign Up
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="hero">
        <div className="hero-backdrop" />

        <span className="hero-eyebrow">Real-time collaboration</span>

        <h1 className="hero-title">
          Learn, code, and create — <span className="hero-highlight">together.</span>
        </h1>

        <p className="hero-subtitle">
          Build a profile, hop into live rooms over WebSocket, and work on homework, code, design or
          music with people in real time.
        </p>

        <div className="hero-actions">
          <Link to="/signup" className="hero-btn hero-btn--primary">
            Get Started Free
          </Link>
          <Link to="/login" className="hero-btn hero-btn--ghost">
            I already have an account
          </Link>
        </div>

        {/* Decorative mock room preview */}
        <div className="hero-mock">
          <div className="hero-mock-header">
            <span className="hero-mock-dot" />
            <span className="hero-mock-dot" />
            <span className="hero-mock-dot" />
            <span className="hero-mock-title">React Study Group</span>
            <span className="hero-mock-live">● LIVE</span>
          </div>
          <div className="hero-mock-body">
            <div className="hero-mock-avatars">
              <span className="hero-mock-avatar">N</span>
              <span className="hero-mock-avatar">S</span>
              <span className="hero-mock-avatar">K</span>
              <span className="hero-mock-avatar hero-mock-avatar--more">+6</span>
            </div>
            <p className="hero-mock-text">"Can someone review my useEffect cleanup?"</p>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="features">
        <h2 className="section-title">Everything you need to work together</h2>
        <p className="section-subtitle">One app for profiles, live rooms, and real-time collaboration.</p>

        <div className="features-grid">
          {FEATURES.map((feature) => (
            <div className="feature-card" key={feature.title}>
              <span className="feature-icon">{feature.icon}</span>
              <h3 className="feature-title">{feature.title}</h3>
              <p className="feature-text">{feature.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="how-it-works">
        <h2 className="section-title">How it works</h2>

        <div className="steps-grid">
          {STEPS.map((step) => (
            <div className="step-card" key={step.number}>
              <span className="step-number">{step.number}</span>
              <h3 className="step-title">{step.title}</h3>
              <p className="step-text">{step.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="final-cta">
        <h2 className="final-cta-title">Ready to jump in?</h2>
        <p className="final-cta-text">Create your free account and join your first room today.</p>
        <Link to="/signup" className="hero-btn hero-btn--primary">
          Create Free Account
        </Link>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <span>© {new Date().getFullYear()} RoomUp. All rights reserved.</span>
      </footer>
    </div>
  );
}

export default HomeScreen;
