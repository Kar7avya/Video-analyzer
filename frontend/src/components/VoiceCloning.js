import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const API_BASE_URL = 'http://localhost:8000';

function VoiceCloning() {
  const [voices, setVoices] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState('');
  const [script, setScript] = useState('');
  const [voiceFiles, setVoiceFiles] = useState([]);
  const [scriptFile, setScriptFile] = useState(null);
  const [voiceName, setVoiceName] = useState('');
  const [voiceDescription, setVoiceDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('generate');
  const [generatedAudioUrl, setGeneratedAudioUrl] = useState('');

  useEffect(() => {
    fetchVoices();
  }, []);

  const fetchVoices = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/voices`);
      setVoices(response.data.voices || []);
    } catch (error) {
      toast.error('Failed to fetch voices. Make sure your API key is configured.');
    }
  };

  const handleVoiceFilesChange = (e) => {
    const files = Array.from(e.target.files);
    setVoiceFiles(files);
  };

  const handleScriptFileChange = (e) => {
    const file = e.target.files[0];
    setScriptFile(file);
    
    if (file && file.type.includes('text')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setScript(event.target.result);
      };
      reader.readAsText(file);
    }
  };

  const uploadScript = async () => {
    if (!scriptFile) {
      toast.error('Please select a script file');
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append('file', scriptFile);

    try {
      const response = await axios.post(`${API_BASE_URL}/upload-script`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      if (response.data.content) {
        setScript(response.data.content);
      }
      toast.success('Script uploaded successfully!');
    } catch (error) {
      toast.error('Failed to upload script');
    } finally {
      setLoading(false);
    }
  };

  const cloneVoice = async () => {
    if (!voiceName.trim()) {
      toast.error('Please enter a voice name');
      return;
    }
    
    if (voiceFiles.length === 0) {
      toast.error('Please select at least one audio file');
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append('name', voiceName);
    formData.append('description', voiceDescription);
    
    voiceFiles.forEach(file => {
      formData.append('files', file);
    });

    try {
      const response = await axios.post(`${API_BASE_URL}/voices/clone`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      toast.success('Voice cloned successfully!');
      setVoiceName('');
      setVoiceDescription('');
      setVoiceFiles([]);
      document.getElementById('voiceFiles').value = '';
      fetchVoices(); // Refresh voice list
    } catch (error) {
      toast.error('Failed to clone voice. Check your API key and file formats.');
    } finally {
      setLoading(false);
    }
  };

  const generateSpeech = async () => {
    if (!selectedVoice) {
      toast.error('Please select a voice');
      return;
    }
    
    if (!script.trim()) {
      toast.error('Please enter or upload a script');
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append('voice_id', selectedVoice);
    formData.append('text', script);
    formData.append('model_id', 'eleven_monolingual_v1');

    try {
      const response = await axios.post(`${API_BASE_URL}/generate-speech`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        responseType: 'blob'
      });
      
      const audioBlob = new Blob([response.data], { type: 'audio/mpeg' });
      const audioUrl = URL.createObjectURL(audioBlob);
      setGeneratedAudioUrl(audioUrl);
      toast.success('Speech generated successfully!');
    } catch (error) {
      toast.error('Failed to generate speech');
    } finally {
      setLoading(false);
    }
  };

  const downloadAudio = () => {
    if (generatedAudioUrl) {
      const link = document.createElement('a');
      link.href = generatedAudioUrl;
      link.download = 'generated_speech.mp3';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="voice-cloning-container">
      <header className="bg-primary text-white text-center py-4 mb-4">
        <h1 className="display-4">🎤 Voice Cloning Studio</h1>
        <p className="lead">Clone voices and generate speech with ElevenLabs AI</p>
      </header>

      <div className="container">
        {/* Navigation Tabs */}
        <ul className="nav nav-tabs mb-4" role="tablist">
          <li className="nav-item">
            <button 
              className={`nav-link ${activeTab === 'generate' ? 'active' : ''}`}
              onClick={() => setActiveTab('generate')}
            >
              🎵 Generate Speech
            </button>
          </li>
          <li className="nav-item">
            <button 
              className={`nav-link ${activeTab === 'clone' ? 'active' : ''}`}
              onClick={() => setActiveTab('clone')}
            >
              🎭 Clone Voice
            </button>
          </li>
          <li className="nav-item">
            <button 
              className={`nav-link ${activeTab === 'voices' ? 'active' : ''}`}
              onClick={() => setActiveTab('voices')}
            >
              📋 Voice Library
            </button>
          </li>
        </ul>

        {/* Generate Speech Tab */}
        {activeTab === 'generate' && (
          <div className="tab-content">
            <div className="row">
              <div className="col-md-6">
                <div className="card mb-4">
                  <div className="card-header">
                    <h5>📝 Script Input</h5>
                  </div>
                  <div className="card-body">
                    <div className="mb-3">
                      <label className="form-label">Upload Script File (Optional)</label>
                      <input
                        type="file"
                        className="form-control"
                        accept=".txt,.md"
                        onChange={handleScriptFileChange}
                      />
                      {scriptFile && (
                        <button 
                          className="btn btn-outline-primary btn-sm mt-2"
                          onClick={uploadScript}
                          disabled={loading}
                        >
                          Upload Script
                        </button>
                      )}
                    </div>
                    
                    <div className="mb-3">
                      <label className="form-label">Script Text</label>
                      <textarea
                        className="form-control"
                        rows="8"
                        value={script}
                        onChange={(e) => setScript(e.target.value)}
                        placeholder="Enter your script here or upload a text file..."
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-md-6">
                <div className="card mb-4">
                  <div className="card-header">
                    <h5>🎤 Voice Selection</h5>
                  </div>
                  <div className="card-body">
                    <div className="mb-3">
                      <label className="form-label">Select Voice</label>
                      <select
                        className="form-select"
                        value={selectedVoice}
                        onChange={(e) => setSelectedVoice(e.target.value)}
                      >
                        <option value="">Choose a voice...</option>
                        {voices.map((voice) => (
                          <option key={voice.voice_id} value={voice.voice_id}>
                            {voice.name} {voice.category === 'cloned' ? '(Cloned)' : '(Built-in)'}
                          </option>
                        ))}
                      </select>
                    </div>

                    <button
                      className="btn btn-success btn-lg w-100"
                      onClick={generateSpeech}
                      disabled={loading || !selectedVoice || !script.trim()}
                    >
                      {loading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" />
                          Generating...
                        </>
                      ) : (
                        '🎵 Generate Speech'
                      )}
                    </button>
                  </div>
                </div>

                {/* Audio Player */}
                {generatedAudioUrl && (
                  <div className="card">
                    <div className="card-header">
                      <h5>🔊 Generated Audio</h5>
                    </div>
                    <div className="card-body text-center">
                      <audio controls className="w-100 mb-3">
                        <source src={generatedAudioUrl} type="audio/mpeg" />
                        Your browser does not support the audio element.
                      </audio>
                      <button 
                        className="btn btn-primary"
                        onClick={downloadAudio}
                      >
                        📥 Download Audio
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Clone Voice Tab */}
        {activeTab === 'clone' && (
          <div className="tab-content">
            <div className="row justify-content-center">
              <div className="col-md-8">
                <div className="card">
                  <div className="card-header">
                    <h5>🎭 Clone a New Voice</h5>
                  </div>
                  <div className="card-body">
                    <div className="mb-3">
                      <label className="form-label">Voice Name *</label>
                      <input
                        type="text"
                        className="form-control"
                        value={voiceName}
                        onChange={(e) => setVoiceName(e.target.value)}
                        placeholder="Enter a name for the cloned voice"
                      />
                    </div>

                    <div className="mb-3">
                      <label className="form-label">Description</label>
                      <input
                        type="text"
                        className="form-control"
                        value={voiceDescription}
                        onChange={(e) => setVoiceDescription(e.target.value)}
                        placeholder="Optional description"
                      />
                    </div>

                    <div className="mb-3">
                      <label className="form-label">Voice Samples * (Multiple files supported)</label>
                      <input
                        id="voiceFiles"
                        type="file"
                        className="form-control"
                        multiple
                        accept=".mp3,.wav,.m4a,.flac"
                        onChange={handleVoiceFilesChange}
                      />
                      <div className="form-text">
                        Upload high-quality audio samples (at least 1 minute total). 
                        Supported formats: MP3, WAV, M4A, FLAC
                      </div>
                      {voiceFiles.length > 0 && (
                        <div className="mt-2">
                          <strong>Selected files:</strong>
                          <ul className="list-unstyled mt-1">
                            {voiceFiles.map((file, index) => (
                              <li key={index} className="text-muted">
                                📁 {file.name}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>

                    <button
                      className="btn btn-primary btn-lg w-100"
                      onClick={cloneVoice}
                      disabled={loading || !voiceName.trim() || voiceFiles.length === 0}
                    >
                      {loading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" />
                          Cloning Voice...
                        </>
                      ) : (
                        '🎭 Clone Voice'
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Voice Library Tab */}
        {activeTab === 'voices' && (
          <div className="tab-content">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h4>📋 Available Voices</h4>
              <button 
                className="btn btn-outline-primary"
                onClick={fetchVoices}
                disabled={loading}
              >
                🔄 Refresh
              </button>
            </div>
            
            <div className="row">
              {voices.map((voice) => (
                <div key={voice.voice_id} className="col-md-4 mb-3">
                  <div className="card h-100">
                    <div className="card-body">
                      <h6 className="card-title">
                        {voice.name}
                        {voice.category === 'cloned' && (
                          <span className="badge bg-success ms-2">Cloned</span>
                        )}
                      </h6>
                      <p className="card-text text-muted small">
                        {voice.description || 'No description available'}
                      </p>
                      <div className="d-flex gap-2">
                        <button
                          className="btn btn-sm btn-outline-primary"
                          onClick={() => {
                            setSelectedVoice(voice.voice_id);
                            setActiveTab('generate');
                          }}
                        >
                          Use Voice
                        </button>
                        {voice.category === 'cloned' && (
                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={async () => {
                              if (window.confirm('Are you sure you want to delete this voice?')) {
                                try {
                                  await axios.delete(`${API_BASE_URL}/voices/${voice.voice_id}`);
                                  toast.success('Voice deleted successfully');
                                  fetchVoices();
                                } catch (error) {
                                  toast.error('Failed to delete voice');
                                }
                              }
                            }}
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {voices.length === 0 && (
              <div className="text-center text-muted py-5">
                <h5>No voices available</h5>
                <p>Make sure your ElevenLabs API key is configured correctly.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default VoiceCloning;