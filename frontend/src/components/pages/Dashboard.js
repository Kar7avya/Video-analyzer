import React, { useState, useEffect } from 'react';

function Dashboard() {
  const [metadataList, setMetadataList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMetadata = async () => {
      const API_URL = 'http://localhost:8000/api/metadata';
      
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await fetch(API_URL);

        if (!response.ok) {
          const errorStatus = response.status;
          const errorMessage = await response.json().then(data => data.error || `HTTP error! Status: ${errorStatus}`);
          throw new Error(errorMessage);
        }

        const data = await response.json();
        
        if (data.success) {
          setMetadataList(data.data);
        } else {
          throw new Error(data.error || 'Failed to load metadata');
        }
      } catch (err) {
        console.error('Fetch error:', err);
        setError(err.message || 'An unexpected error occurred.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchMetadata();
  }, []);

  const countMetrics = (item) => {
    let fillerWordsCount = 0;
    let pausesCount = 0;

    if (item.deepgram_words && item.deepgram_words.length > 0) {
      const fillerWords = ['uh', 'um', 'like', 'you know', 'so', 'and', 'but', 'well'];
      fillerWordsCount = item.deepgram_words.filter(word => 
        fillerWords.includes(word.word.toLowerCase())
      ).length;
    }

    if (item.deepgram_transcript) {
      const pauses = item.deepgram_transcript.match(/\[PAUSE:.*?\]/g);
      if (pauses) {
        pausesCount = pauses.length;
      }
    }

    return { fillerWordsCount, pausesCount };
  };

  const getFluencyVariant = (score) => {
    if (score >= 90) return 'bg-success';
    if (score >= 70) return 'bg-warning';
    return 'bg-danger';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
      {/* Modern Header with Gradient Background */}
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '4rem 0',
        marginBottom: '2rem'
      }}>
        <div className="container">
          <div className="text-center text-white">
            <h1 className="display-4 fw-bold mb-4" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>
              📊 Video Analytics Dashboard
            </h1>
            <p className="lead mb-0" style={{ fontSize: '1.25rem', opacity: 0.9 }}>
              Professional insights from your video content with advanced speech analytics
            </p>
          </div>
        </div>
      </div>

      <div className="container pb-5">
        {/* Enhanced Loading State */}
        {isLoading && (
          <div className="text-center py-5">
            <div className="d-inline-flex align-items-center bg-white rounded-pill px-4 py-3 shadow-sm">
              <div className="spinner-border spinner-border-sm text-primary me-3" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <span className="h6 mb-0 text-primary">Analyzing your videos...</span>
            </div>
          </div>
        )}

        {/* Enhanced Error State */}
        {error && (
          <div className="alert alert-danger shadow-sm border-0 rounded-3" role="alert">
            <div className="d-flex">
              <div className="flex-shrink-0">
                <i className="fas fa-exclamation-triangle fa-2x text-danger"></i>
              </div>
              <div className="flex-grow-1 ms-3">
                <h4 className="alert-heading fw-bold">⚠️ Connection Error</h4>
                <p className="mb-0">Unable to fetch analytics data: <strong>{error}</strong></p>
                <hr />
                <p className="mb-0 small">Please check your connection and try refreshing the page.</p>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        {!isLoading && !error && (
          <>
            {metadataList.length > 0 ? (
              <div className="row g-4">
                {metadataList.map(item => {
                  const { fillerWordsCount, pausesCount } = countMetrics(item);
                  const totalWords = item.deepgram_words ? item.deepgram_words.length : 0;
                  const fluencyScore = totalWords > 0 
                    ? ((totalWords - fillerWordsCount) / totalWords) * 100 
                    : 100;

                  return (
                    <div key={item.id} className="col-12">
                      <div className="card shadow-lg border-0 rounded-4 overflow-hidden">
                        {/* Premium Card Header */}
                        <div style={{
                          background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                          padding: '1.5rem'
                        }}>
                          <div className="row align-items-center">
                            <div className="col">
                              <h3 className="text-white fw-bold mb-1">
                                🎥 {item.original_name}
                              </h3>
                              <p className="text-white-50 mb-0">
                                📅 Uploaded: {formatDate(item.created_at)}
                              </p>
                            </div>
                            <div className="col-auto">
                              <span className={`badge rounded-pill px-3 py-2 text-white ${getFluencyVariant(fluencyScore)}`}>
                                <i className="fas fa-chart-line me-2"></i>
                                {fluencyScore.toFixed(1)}% Fluency
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="card-body p-4">
                          <div className="row g-4">
                            {/* Video Preview Section */}
                            <div className="col-lg-6">
                              <div className="mb-4">
                                <h5 className="fw-bold text-dark mb-3">
                                  <i className="fas fa-play-circle text-primary me-2"></i>
                                  Video Preview
                                </h5>
                                <div className="ratio ratio-16x9 rounded-3 overflow-hidden shadow-sm">
                                  <video 
                                    controls 
                                    src={item.video_url} 
                                    className="rounded-3"
                                    style={{ objectFit: 'cover' }}
                                  />
                                </div>
                              </div>
                            </div>

                            {/* Analytics Metrics */}
                            <div className="col-lg-6">
                              <h5 className="fw-bold text-dark mb-3">
                                <i className="fas fa-chart-bar text-success me-2"></i>
                                Speech Analytics
                              </h5>
                              <div className="row g-3">
                                <div className="col-6">
                                  <div className="card bg-light border-0 h-100">
                                    <div className="card-body text-center p-3">
                                      <div className="text-primary display-6 fw-bold">{totalWords}</div>
                                      <small className="text-muted fw-semibold">Total Words</small>
                                    </div>
                                  </div>
                                </div>
                                <div className="col-6">
                                  <div className="card bg-warning bg-opacity-10 border-0 h-100">
                                    <div className="card-body text-center p-3">
                                      <div className="text-warning display-6 fw-bold">{fillerWordsCount}</div>
                                      <small className="text-warning fw-semibold">Filler Words</small>
                                      <div className="mt-1">
                                        <small className="badge bg-warning bg-opacity-20 text-warning">
                                          {totalWords > 0 ? `${((fillerWordsCount / totalWords) * 100).toFixed(1)}%` : '0%'}
                                        </small>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                <div className="col-12">
                                  <div className="card bg-info bg-opacity-10 border-0">
                                    <div className="card-body text-center p-3">
                                      <div className="text-info display-6 fw-bold">{pausesCount}</div>
                                      <small className="text-info fw-semibold">
                                        Speech Pause{pausesCount !== 1 ? 's' : ''}
                                      </small>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Transcript Section */}
                          <div className="mt-4">
                            <h5 className="fw-bold text-dark mb-3">
                              <i className="fas fa-quote-left text-info me-2"></i>
                              Transcript
                            </h5>
                            <div className="card bg-light border-0">
                              <div className="card-body">
                                <blockquote className="blockquote mb-0">
                                  <p className="text-dark" style={{ fontStyle: 'italic', lineHeight: '1.6' }}>
                                    "{item.deepgram_transcript || 'No transcript available.'}"
                                  </p>
                                </blockquote>
                              </div>
                            </div>
                          </div>

                          {/* Key Frames Section */}
                          <div className="mt-4">
                            <h5 className="fw-bold text-dark mb-3">
                              <i className="fas fa-images text-secondary me-2"></i>
                              Key Frames ({item.frames ? item.frames.length : 0})
                            </h5>
                            {item.frames && item.frames.length > 0 ? (
                              <div className="row g-3">
                                {item.frames.map((frame, index) => (
                                  <div key={index} className="col-6 col-md-4 col-lg-3 col-xl-2">
                                    <a 
                                      href={frame.frame_url} 
                                      target="_blank" 
                                      rel="noopener noreferrer"
                                      className="d-block text-decoration-none"
                                    >
                                      <div className="card border-0 shadow-sm h-100 hover-lift" style={{
                                        transition: 'transform 0.2s ease-in-out',
                                        cursor: 'pointer'
                                      }}
                                      onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
                                      onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                                      >
                                        <img
                                          src={frame.frame_url}
                                          alt={`Frame ${index + 1}`}
                                          className="card-img-top rounded-3"
                                          style={{ 
                                            height: '80px', 
                                            objectFit: 'cover',
                                            aspectRatio: '16/9'
                                          }}
                                        />
                                        <div className="card-body p-2 text-center">
                                          <small className="text-muted fw-semibold">Frame {index + 1}</small>
                                        </div>
                                      </div>
                                    </a>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="text-center py-4">
                                <i className="fas fa-image fa-3x text-muted mb-3"></i>
                                <p className="text-muted mb-0">No key frames extracted from this video.</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-5">
                <div className="card border-0 shadow-sm rounded-4 mx-auto" style={{ maxWidth: '500px' }}>
                  <div className="card-body p-5">
                    <i className="fas fa-video fa-4x text-muted mb-4"></i>
                    <h4 className="fw-bold text-dark mb-3">No Videos Found</h4>
                    <p className="text-muted mb-4">
                      Upload your first video to start analyzing speech patterns and extract valuable insights.
                    </p>
                    <button className="btn btn-primary btn-lg rounded-pill px-4">
                      <i className="fas fa-upload me-2"></i>
                      Upload Video
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Custom Styles */}
      <style jsx>{`
        .hover-lift:hover {
          transform: translateY(-5px);
          box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15) !important;
        }
        
        .card {
          transition: all 0.3s ease;
        }
        
        .display-6 {
          font-size: 2rem;
        }
        
        @media (max-width: 768px) {
          .display-4 {
            font-size: 2rem !important;
          }
          
          .lead {
            font-size: 1.1rem !important;
          }
        }
      `}</style>
    </div>
  );
}

export default Dashboard;
