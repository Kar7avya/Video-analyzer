import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';

function Karaoke() {
  const [script, setScript] = useState('');
  const [scriptFile, setScriptFile] = useState(null);
  const [words, setWords] = useState([]);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recognition, setRecognition] = useState(null);
  const [transcript, setTranscript] = useState('');
  const [scores, setScores] = useState({
    speed: 0,
    accuracy: 0,
    fluency: 0,
    overall: 0
  });
  const [sessionStarted, setSessionStarted] = useState(false);
  const [sessionComplete, setSessionComplete] = useState(false);
  const [spokenWords, setSpokenWords] = useState([]);
  const [startTime, setStartTime] = useState(null);
  const [wordTimings, setWordTimings] = useState([]);
  
  const recognitionRef = useRef(null);
  const intervalRef = useRef(null);

  useEffect(() => {
    // Initialize speech recognition
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      
      recognitionInstance.continuous = true;
      recognitionInstance.interimResults = true;
      recognitionInstance.lang = 'en-US';
      
      recognitionInstance.onresult = handleSpeechResult;
      recognitionInstance.onerror = handleSpeechError;
      recognitionInstance.onend = handleSpeechEnd;
      
      setRecognition(recognitionInstance);
      recognitionRef.current = recognitionInstance;
    } else {
      toast.error('Speech recognition not supported in this browser');
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const handleScriptFileChange = (e) => {
    const file = e.target.files[0];
    setScriptFile(file);
    
    if (file && file.type.includes('text')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target.result;
        setScript(text);
        processScript(text);
      };
      reader.readAsText(file);
    }
  };

  const handleScriptChange = (e) => {
    const text = e.target.value;
    setScript(text);
    processScript(text);
  };

  const processScript = (text) => {
    // Split script into words and clean them
    const wordArray = text
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 0);
    
    setWords(wordArray);
    setCurrentWordIndex(0);
    setSpokenWords([]);
    setWordTimings([]);
    setSessionComplete(false);
  };

  const handleSpeechResult = (event) => {
    let interimTranscript = '';
    let finalTranscript = '';

    for (let i = event.resultIndex; i < event.results.length; i++) {
      const result = event.results[i];
      if (result.isFinal) {
        finalTranscript += result[0].transcript;
      } else {
        interimTranscript += result[0].transcript;
      }
    }

    setTranscript(finalTranscript + interimTranscript);

    if (finalTranscript) {
      processSpokenText(finalTranscript);
    }
  };

  const processSpokenText = (spokenText) => {
    const spokenWordsArray = spokenText
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 0);

    const currentTime = Date.now();
    const newSpokenWords = [...spokenWords];
    const newWordTimings = [...wordTimings];

    spokenWordsArray.forEach(spokenWord => {
      if (currentWordIndex < words.length) {
        const expectedWord = words[currentWordIndex];
        const isMatch = calculateWordSimilarity(spokenWord, expectedWord) > 0.7;
        
        newSpokenWords.push({
          spoken: spokenWord,
          expected: expectedWord,
          correct: isMatch,
          timestamp: currentTime
        });

        newWordTimings.push({
          word: expectedWord,
          timestamp: currentTime,
          correct: isMatch
        });

        if (isMatch) {
          setCurrentWordIndex(prev => prev + 1);
        }
      }
    });

    setSpokenWords(newSpokenWords);
    setWordTimings(newWordTimings);

    // Check if session is complete
    if (currentWordIndex >= words.length - 1) {
      completeSession();
    }
  };

  const calculateWordSimilarity = (word1, word2) => {
    // Simple similarity calculation using Levenshtein distance
    const matrix = Array(word2.length + 1).fill().map(() => Array(word1.length + 1).fill(0));
    
    for (let i = 0; i <= word1.length; i++) matrix[0][i] = i;
    for (let j = 0; j <= word2.length; j++) matrix[j][0] = j;
    
    for (let j = 1; j <= word2.length; j++) {
      for (let i = 1; i <= word1.length; i++) {
        if (word1[i - 1] === word2[j - 1]) {
          matrix[j][i] = matrix[j - 1][i - 1];
        } else {
          matrix[j][i] = Math.min(
            matrix[j - 1][i] + 1,
            matrix[j][i - 1] + 1,
            matrix[j - 1][i - 1] + 1
          );
        }
      }
    }
    
    const maxLength = Math.max(word1.length, word2.length);
    return maxLength === 0 ? 1 : (maxLength - matrix[word2.length][word1.length]) / maxLength;
  };

  const handleSpeechError = (event) => {
    console.error('Speech recognition error:', event.error);
    toast.error(`Speech recognition error: ${event.error}`);
  };

  const handleSpeechEnd = () => {
    if (isRecording && !isPaused) {
      // Restart recognition if it stops unexpectedly
      setTimeout(() => {
        if (recognitionRef.current && isRecording) {
          recognitionRef.current.start();
        }
      }, 100);
    }
  };

  const startKaraoke = () => {
    if (!script.trim()) {
      toast.error('Please upload or enter a script first');
      return;
    }

    if (!recognition) {
      toast.error('Speech recognition not available');
      return;
    }

    setSessionStarted(true);
    setIsRecording(true);
    setStartTime(Date.now());
    setCurrentWordIndex(0);
    setSpokenWords([]);
    setWordTimings([]);
    setTranscript('');
    setSessionComplete(false);

    try {
      recognition.start();
      toast.success('Karaoke started! Start speaking...');
    } catch (error) {
      toast.error('Failed to start speech recognition');
      console.error(error);
    }
  };

  const pauseKaraoke = () => {
    setIsPaused(true);
    setIsRecording(false);
    if (recognition) {
      recognition.stop();
    }
    toast.info('Karaoke paused');
  };

  const resumeKaraoke = () => {
    setIsPaused(false);
    setIsRecording(true);
    if (recognition) {
      recognition.start();
    }
    toast.success('Karaoke resumed');
  };

  const stopKaraoke = () => {
    setIsRecording(false);
    setIsPaused(false);
    if (recognition) {
      recognition.stop();
    }
    completeSession();
  };

  const resetKaraoke = () => {
    setIsRecording(false);
    setIsPaused(false);
    setSessionStarted(false);
    setSessionComplete(false);
    setCurrentWordIndex(0);
    setSpokenWords([]);
    setWordTimings([]);
    setTranscript('');
    setStartTime(null);
    setScores({
      speed: 0,
      accuracy: 0,
      fluency: 0,
      overall: 0
    });
    
    if (recognition) {
      recognition.stop();
    }
    toast.info('Karaoke reset');
  };

  const completeSession = () => {
    setIsRecording(false);
    setSessionComplete(true);
    
    if (recognition) {
      recognition.stop();
    }

    // Calculate scores
    const endTime = Date.now();
    const totalTime = (endTime - startTime) / 1000; // in seconds
    const expectedTime = words.length * 0.6; // assuming 0.6 seconds per word
    
    // Speed score (words per minute)
    const wordsPerMinute = (words.length / totalTime) * 60;
    const idealWPM = 150;
    const speedScore = Math.min(100, Math.max(0, (wordsPerMinute / idealWPM) * 100));
    
    // Accuracy score
    const correctWords = spokenWords.filter(w => w.correct).length;
    const accuracyScore = words.length > 0 ? (correctWords / words.length) * 100 : 0;
    
    // Fluency score (based on timing consistency)
    const avgTimeBetweenWords = wordTimings.length > 1 
      ? wordTimings.slice(1).reduce((sum, timing, i) => 
          sum + (timing.timestamp - wordTimings[i].timestamp), 0) / (wordTimings.length - 1)
      : 0;
    
    const fluencyScore = Math.max(0, 100 - (avgTimeBetweenWords / 100));
    
    // Overall score
    const overallScore = (speedScore * 0.3 + accuracyScore * 0.5 + fluencyScore * 0.2);

    setScores({
      speed: Math.round(speedScore),
      accuracy: Math.round(accuracyScore),
      fluency: Math.round(fluencyScore),
      overall: Math.round(overallScore)
    });

    toast.success('Karaoke session completed!');
  };

  const getWordClassName = (index) => {
    if (index < currentWordIndex) {
      return 'karaoke-word completed';
    } else if (index === currentWordIndex) {
      return 'karaoke-word current';
    } else {
      return 'karaoke-word upcoming';
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'success';
    if (score >= 60) return 'warning';
    return 'danger';
  };

  return (
    <div className="karaoke-container">
      <div className="container mt-4">
        {!sessionStarted ? (
          // Script Upload Section
          <div className="row justify-content-center mb-4">
            <div className="col-md-10">
              <div className="card">
                <div className="card-header">
                  <h5>📝 Upload Your Script</h5>
                </div>
                <div className="card-body">
                  <div className="mb-3">
                    <label className="form-label">Upload Script File</label>
                    <input
                      type="file"
                      className="form-control"
                      accept=".txt,.md"
                      onChange={handleScriptFileChange}
                    />
                  </div>
                  
                  <div className="mb-3">
                    <label className="form-label">Or Enter Script Text</label>
                    <textarea
                      className="form-control"
                      rows="8"
                      value={script}
                      onChange={handleScriptChange}
                      placeholder="Enter your script here..."
                    />
                  </div>

                  {words.length > 0 && (
                    <div className="mb-3">
                      <small className="text-muted">
                        Script loaded: {words.length} words
                      </small>
                    </div>
                  )}

                  <button
                    className="btn btn-success btn-lg w-100"
                    onClick={startKaraoke}
                    disabled={!script.trim()}
                  >
                    🎤 Start Karaoke
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          // Karaoke Session Section
          <div>
            {/* Control Buttons */}
            <div className="row mb-4">
              <div className="col-12 text-center">
                <div className="btn-group" role="group">
                  {!isRecording && !isPaused && (
                    <button className="btn btn-success" onClick={startKaraoke}>
                      🎤 Start
                    </button>
                  )}
                  {isRecording && (
                    <button className="btn btn-warning" onClick={pauseKaraoke}>
                      ⏸️ Pause
                    </button>
                  )}
                  {isPaused && (
                    <button className="btn btn-success" onClick={resumeKaraoke}>
                      ▶️ Resume
                    </button>
                  )}
                  <button className="btn btn-danger" onClick={stopKaraoke}>
                    ⏹️ Stop
                  </button>
                  <button className="btn btn-secondary" onClick={resetKaraoke}>
                    🔄 Reset
                  </button>
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="row mb-4">
              <div className="col-12">
                <div className="progress" style={{height: '30px'}}>
                  <div 
                    className="progress-bar bg-success" 
                    style={{width: `${(currentWordIndex / words.length) * 100}%`}}
                  >
                    {currentWordIndex} / {words.length} words
                  </div>
                </div>
              </div>
            </div>

            {/* Script Display with Word Highlighting */}
            <div className="row mb-4">
              <div className="col-12">
                <div className="card">
                  <div className="card-header">
                    <h5>📖 Script</h5>
                  </div>
                  <div className="card-body karaoke-script">
                    {words.map((word, index) => (
                      <span
                        key={index}
                        className={getWordClassName(index)}
                      >
                        {word}{' '}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Live Transcript */}
            <div className="row mb-4">
              <div className="col-12">
                <div className="card">
                  <div className="card-header">
                    <h5>🎙️ Live Transcript</h5>
                  </div>
                  <div className="card-body">
                    <p className="mb-0">{transcript || 'Start speaking...'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Recording Status */}
            <div className="row mb-4">
              <div className="col-12 text-center">
                {isRecording && (
                  <div className="alert alert-success">
                    <strong>🔴 Recording...</strong> Speak clearly and follow the highlighted words
                  </div>
                )}
                {isPaused && (
                  <div className="alert alert-warning">
                    <strong>⏸️ Paused</strong> Click Resume to continue
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Results Section */}
        {sessionComplete && (
          <div className="row mt-4">
            <div className="col-12">
              <div className="card">
                <div className="card-header">
                  <h5>📊 Performance Results</h5>
                </div>
                <div className="card-body">
                  <div className="row">
                    <div className="col-md-3 text-center mb-3">
                      <h3 className={`text-${getScoreColor(scores.speed)}`}>
                        {scores.speed}%
                      </h3>
                      <p className="mb-0"><strong>Speed</strong></p>
                      <small className="text-muted">Speaking pace</small>
                    </div>
                    <div className="col-md-3 text-center mb-3">
                      <h3 className={`text-${getScoreColor(scores.accuracy)}`}>
                        {scores.accuracy}%
                      </h3>
                      <p className="mb-0"><strong>Accuracy</strong></p>
                      <small className="text-muted">Word precision</small>
                    </div>
                    <div className="col-md-3 text-center mb-3">
                      <h3 className={`text-${getScoreColor(scores.fluency)}`}>
                        {scores.fluency}%
                      </h3>
                      <p className="mb-0"><strong>Fluency</strong></p>
                      <small className="text-muted">Flow consistency</small>
                    </div>
                    <div className="col-md-3 text-center mb-3">
                      <h3 className={`text-${getScoreColor(scores.overall)}`}>
                        {scores.overall}%
                      </h3>
                      <p className="mb-0"><strong>Overall</strong></p>
                      <small className="text-muted">Total score</small>
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <h6>Feedback:</h6>
                    <ul className="list-unstyled">
                      {scores.speed < 60 && (
                        <li className="text-warning">• Try to speak at a more consistent pace</li>
                      )}
                      {scores.accuracy < 70 && (
                        <li className="text-danger">• Focus on pronouncing words more clearly</li>
                      )}
                      {scores.fluency < 70 && (
                        <li className="text-warning">• Work on maintaining steady rhythm</li>
                      )}
                      {scores.overall >= 80 && (
                        <li className="text-success">• Excellent performance! Keep it up!</li>
                      )}
                    </ul>
                  </div>

                  <div className="mt-3">
                    <button className="btn btn-primary me-2" onClick={resetKaraoke}>
                      🔄 Try Again
                    </button>
                    <button 
                      className="btn btn-outline-secondary"
                      onClick={() => {
                        setScript('');
                        setWords([]);
                        resetKaraoke();
                      }}
                    >
                      📝 New Script
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Custom Styles */}
      <style jsx>{`
        .karaoke-script {
          font-size: 1.2rem;
          line-height: 2;
          padding: 20px;
          background: #f8f9fa;
          border-radius: 10px;
        }

        .karaoke-word {
          padding: 4px 8px;
          margin: 2px;
          border-radius: 5px;
          transition: all 0.3s ease;
        }

        .karaoke-word.completed {
          background-color: #d4edda;
          color: #155724;
          border: 2px solid #c3e6cb;
        }

        .karaoke-word.current {
          background-color: #fff3cd;
          color: #856404;
          border: 2px solid #ffeaa7;
          animation: pulse 1s infinite;
        }

        .karaoke-word.upcoming {
          background-color: #f8f9fa;
          color: #6c757d;
          border: 2px solid #dee2e6;
        }

        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.05); }
          100% { transform: scale(1); }
        }

        .karaoke-container {
          min-height: 100vh;
          background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
        }

        .card {
          border: none;
          border-radius: 15px;
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
        }

        .card-header {
          background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
          color: white;
          border-radius: 15px 15px 0 0 !important;
          border: none;
          font-weight: 600;
        }
      `}</style>
    </div>
  );
}

export default Karaoke;