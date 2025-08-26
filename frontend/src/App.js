import React, { useState } from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import VoiceCloning from './components/VoiceCloning';
import Karaoke from './components/Karaoke';

function App() {
  const [activeFeature, setActiveFeature] = useState('voice-cloning');

  return (
    <div className="App">
      <div className="container-fluid">
        {/* Main Navigation */}
        <nav className="navbar navbar-expand-lg navbar-dark bg-primary mb-0">
          <div className="container">
            <span className="navbar-brand">🎤 AI Speech Studio</span>
            <div className="navbar-nav">
              <button
                className={`nav-link btn btn-link text-white ${activeFeature === 'voice-cloning' ? 'active fw-bold' : ''}`}
                onClick={() => setActiveFeature('voice-cloning')}
              >
                🎭 Voice Cloning
              </button>
              <button
                className={`nav-link btn btn-link text-white ${activeFeature === 'karaoke' ? 'active fw-bold' : ''}`}
                onClick={() => setActiveFeature('karaoke')}
              >
                🎤 Speech Karaoke
              </button>
            </div>
          </div>
        </nav>

        {/* Feature Content */}
        {activeFeature === 'voice-cloning' && <VoiceCloning />}
        {activeFeature === 'karaoke' && <Karaoke />}
      </div>

      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </div>
  );
}

export default App;

