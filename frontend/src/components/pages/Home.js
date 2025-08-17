import React from "react";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();

  const goToUpload = () => {
    navigate("/upload");
  };

  return (
    <>
      {/* Hero Section */}
      {/* The 'hero-section' class is defined in src/index.css for its gradient background. */}
      <section className="hero-section text-white py-5 py-md-5" id="home">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-6 text-center text-lg-start mb-4 mb-lg-0">
              <h1 className="display-3 fw-bold mb-4">Speak with Unwavering Confidence</h1>
              <p className="lead mb-4" style={{ opacity: 0.9 }}>
                Harness AI for actionable insights on your voice, gestures, and content.<br />
                Elevate every presentation with data-driven feedback powered by our backend API.
              </p>
              <div className="d-flex flex-column flex-sm-row justify-content-center justify-content-lg-start gap-3 mb-4">
                <button
                  className="btn btn-light btn-lg me-sm-3"
                  onClick={goToUpload}
                >
                  <i className="bi bi-play-circle me-2"></i>Get Started - It's Free!
                </button>
                <button
                  className="btn btn-outline-light btn-lg"
                  onClick={() => window.open("https://www.youtube.com/results?search_query=public+speaking+demo", "_blank")}
                >
                  <i className="bi bi-play-circle me-2"></i>Watch Demo
                </button>
              </div>
            
            </div>
            <div className="col-lg-6 d-flex justify-content-center justify-content-lg-end">
              <img
                src="https://images.unsplash.com/photo-1556761175-b413da4baf72?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=600"
                alt="Professional speaker presenting with confidence"
                className="img-fluid rounded-4 shadow-lg"
                style={{ maxWidth: '100%', height: 'auto' }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-5 py-md-5 bg-light" id="features">
  <div className="container">

    {/* Centered Heading and Subheading */}
    <div className="text-center mb-5">
      <h2 className="display-5 fw-bold mb-3">Unlock Every Dimension of Your Delivery</h2>
      <p className="lead text-muted">
        Our AI analyzes what matters most for impactful public speaking
      </p>
    </div>

    {/* Feature Cards */}
    <div className="row g-4">
      <div className="col-md-4 col-12">
        <div className="card h-100 shadow-sm feature-card">
          <div className="card-body text-center p-4">
            <div className="text-primary mb-3">
              <i className="bi bi-chat-text-fill" style={{ fontSize: '3rem' }}></i>
            </div>
            <h4 className="fw-bold mb-3">Filler Word Mastery</h4>
            <p className="text-muted">
              Identify and reduce "um," "uh," and other speech disfluencies with precise tracking and actionable feedback.
            </p>
          </div>
        </div>
      </div>

      <div className="col-md-4 col-12">
        <div className="card h-100 shadow-sm feature-card">
          <div className="card-body text-center p-4">
            <div className="text-success mb-3">
              <i className="bi bi-hand-index-thumb-fill" style={{ fontSize: '3rem' }}></i>
            </div>
            <h4 className="fw-bold mb-3">Body Language Insights</h4>
            <p className="text-muted">
              Analyze gestures, posture, and movement patterns to enhance your non-verbal communication impact.
            </p>
          </div>
        </div>
      </div>

      <div className="col-md-4 col-12">
        <div className="card h-100 shadow-sm feature-card">
          <div className="card-body text-center p-4">
            <div className="text-warning mb-3">
              <i className="bi bi-graph-up" style={{ fontSize: '3rem' }}></i>
            </div>
            <h4 className="fw-bold mb-3">Confidence Analytics</h4>
            <p className="text-muted">
              Track vocal tone, pacing, and delivery strength with detailed confidence scoring and improvement trends.
            </p>
          </div>
        </div>
      </div>
    </div>

  </div>
</section>

    </>
  );
}