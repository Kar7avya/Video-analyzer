import React, { useState, useRef, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaCloudUploadAlt } from "react-icons/fa";
import styled from 'styled-components';
import mic from "../pages/mic.png";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.REACT_APP_SUPABASEANONKEY
);

export default function Upload() {
  const [file, setFile] = useState(null);
  const [filename, setFilename] = useState("");
  const [publicUrl, setPublicUrl] = useState("");
  const [responses, setResponses] = useState([]);
  const [elevenLabsTranscript, setElevenLabsTranscript] = useState("");
  const [deepgramTranscript, setDeepgramTranscript] = useState("");
  const [llmAnalysisResult, setLlmAnalysisResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [showTextArea, setShowTextArea] = useState(false);
  const [manualTranscript, setManualTranscript] = useState("");
  const fileInputRef = useRef(null);
  const [userId, setUserId] = useState(null);

  const getValidToken = () => {
    try {
      const token = localStorage.getItem("supabase.auth.token");
      
      if (!token) {
        console.warn("No token found in localStorage");
        return null;
      }

      // Parse and validate token structure if it's a JSON object
      let accessToken;
      try {
        const parsedToken = JSON.parse(token);
        accessToken = parsedToken.access_token;
        
        // Check if token is expired
        if (parsedToken.expires_at && Date.now() / 1000 > parsedToken.expires_at) {
          console.warn("Token has expired");
          localStorage.removeItem("supabase.auth.token");
          return null;
        }
      } catch (parseError) {
        // If it's not JSON, assume it's the raw token
        accessToken = token;
      }

      return accessToken;
    } catch (error) {
      console.error("Error getting token:", error);
      return null;
    }
  };

  useEffect(() => {
    const fetchUserId = async () => {
      try {
        // Get token from localStorage with additional validation
        const token = localStorage.getItem("supabase.auth.token");
        
        // Enhanced token validation
        if (!token) {
          console.warn("No token found in localStorage");
          toast.error("Please log in to upload files.");
          return;
        }

        // Parse and validate token structure if it's a JSON object
        let accessToken;
        try {
          const parsedToken = JSON.parse(token);
          accessToken = parsedToken.access_token;
          
          // Check if token is expired
          if (parsedToken.expires_at && Date.now() / 1000 > parsedToken.expires_at) {
            console.warn("Token has expired");
            toast.error("Session expired. Please log in again.");
            localStorage.removeItem("supabase.auth.token");
            return;
          }
        } catch (parseError) {
          // If it's not JSON, assume it's the raw token
          accessToken = token;
        }

        if (!accessToken) {
          console.warn("No access token found");
          toast.error("Invalid session. Please log in again.");
          return;
        }

        console.log("Using token:", accessToken.substring(0, 20) + "..."); // Debug log (partial token)

        // Fetch data from the backend
        const response = await fetch("http://localhost:8000/getUser", {
          method: "GET",
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          },
        });
        
        console.log("Response status:", response.status); // Debug log
        
        if (response.ok) {
          const data = await response.json();
          console.log("Response data:", data); // Debug log
          
          if (data.user && data.user.id) {
            setUserId(data.user.id);
            console.log("Fetched User ID:", data.user.id);
          } else {
            console.warn("No user data found in response");
            toast.error("User not logged in. Please log in to upload files.");
          }
        } else {
          // Handle specific error cases
          if (response.status === 401) {
            console.error("Authentication failed - token may be invalid or expired");
            toast.error("Session expired. Please log in again.");
            localStorage.removeItem("supabase.auth.token"); // Clear invalid token
          } else {
            console.error("Failed to fetch user:", response.status, response.statusText);
            toast.error("Failed to fetch user info. Please try again.");
          }
          
          // Try to get error details from response
          try {
            const errorData = await response.json();
            console.error("Error details:", errorData);
          } catch (e) {
            // Response might not be JSON
          }
        }
      } catch (error) {
        console.error("Network error fetching user:", error);
        toast.error("Network error. Please check your connection.");
      }
    };

    fetchUserId();
  }, []);

  useEffect(() => {
    if (file) {
      handleUpload({ preventDefault: () => {} });
    }
  }, [file]);

  const handleFileSelect = (selectedFile) => {
    const maxSize = 500 * 1024 * 1024;
    const allowedTypes = [
      "video/mp4",
      "video/quicktime",
      "video/x-msvideo",
      "audio/mpeg",
      "audio/wav",
    ];

    if (selectedFile.size > maxSize) {
      toast.error("File Too Large: Please select a file smaller than 500MB.");
      return;
    }

    if (!allowedTypes.includes(selectedFile.type)) {
      toast.error(
        "Invalid File Type: Please select a video (.mp4, .mov, .avi) or audio (.mp3, .wav) file."
      );
      return;
    }

    setFile(selectedFile);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const droppedFiles = Array.from(e.dataTransfer.files);
    if (droppedFiles.length > 0) {
      handleFileSelect(droppedFiles[0]);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleFileInputChange = (e) => {
    const selectedFiles = e.target.files;
    if (selectedFiles && selectedFiles.length > 0) {
      handleFileSelect(selectedFiles[0]);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();

    if (!file) {
      toast.error("Please select a video or audio file!");
      return;
    }

    setLoading(true);
    setResponses([]);
    setElevenLabsTranscript("");
    setDeepgramTranscript("");
    setLlmAnalysisResult("");
    setPublicUrl("");

    try {
      toast.info("Uploading file to Supabase...");
      
      // Get valid token before upload
      const accessToken = getValidToken();
      
      if (!accessToken) {
        throw new Error("Authentication token not found. Please log in again.");
      }

      if (!userId) {
        throw new Error("User ID not found. Please refresh and try again.");
      }

      console.log("Starting upload with token:", accessToken.substring(0, 20) + "...");
      console.log("User ID:", userId);
      console.log("File:", file.name, file.size, "bytes");

      const formData = new FormData();
      formData.append("myvideo", file);
      formData.append("user_id", userId);

      const uploadRes = await fetch("http://localhost:8000/upload", {
        method: "POST",
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          // Don't set Content-Type - browser will set it automatically for FormData
        },
        body: formData,
      });

      console.log("Upload response status:", uploadRes.status);

      if (!uploadRes.ok) {
        let errorText;
        try {
          const errorJson = await uploadRes.json();
          errorText = errorJson.error || JSON.stringify(errorJson);
        } catch {
          errorText = await uploadRes.text();
        }
        
        console.error("Upload failed:", uploadRes.status, errorText);
        
        // Handle specific error cases
        if (uploadRes.status === 401) {
          toast.error("Authentication failed. Please log in again.");
          localStorage.removeItem("supabase.auth.token");
          return;
        }
        
        throw new Error(`Upload failed (${uploadRes.status}): ${errorText}`);
      }

      const uploadData = await uploadRes.json();
      console.log("Upload successful:", uploadData);
      
      const uploadedFilename = uploadData.videoName;
      const uploadPublicUrl = uploadData.publicUrl;

      if (!uploadedFilename) {
        throw new Error("No filename received from server");
      }

      setFilename(uploadedFilename);
      setPublicUrl(uploadPublicUrl);
      toast.success("File uploaded to Supabase and metadata saved successfully!");

      toast.info("Extracting frames (if video)...");
      const extractForm = new FormData();
      extractForm.append("videoName", uploadedFilename);

      const extractRes = await fetch("http://localhost:8000/extractFrames", {
        method: "POST",
        body: extractForm,
      });

      if (!extractRes.ok) {
        const errorText = await extractRes.text();
        console.warn(`Frame extraction might have failed or not applicable: ${errorText}`);
        toast.warn("Frame extraction skipped or failed (might be an audio file).");
      } else {
        toast.success("Frames extracted (if video)!");
      }

      toast.info("Analyzing frames with Gemini (if video)...");
      const analyzeRes = await fetch("http://localhost:8000/analyzeAllFrames");

      if (!analyzeRes.ok) {
        const errText = await analyzeRes.text();
        console.warn(`Frame analysis might have failed or not applicable: ${errText}`);
        toast.warn("Frame analysis skipped or failed (might be an audio file).");
      } else {
        const analyzeData = await analyzeRes.json();
        const frames = Array.isArray(analyzeData)
          ? analyzeData
          : analyzeData.responses || [];
        setResponses(frames.map((item) => `${item.file}: ${item.description}`));
        toast.success("Frame analysis complete (if video)!");
      }

      toast.info("Transcribing with ElevenLabs...");
      const elevenForm = new FormData();
      elevenForm.append("videoName", uploadedFilename);

      const elevenRes = await fetch("http://localhost:8000/transcribeWithElevenLabs", {
        method: "POST",
        body: elevenForm,
      });

      if (!elevenRes.ok) {
        const errText = await elevenRes.text();
        throw new Error(`ElevenLabs transcription failed: ${errText}`);
      }

      const elevenData = await elevenRes.json();
      const elevenTranscript =
        typeof elevenData.transcript === "string"
          ? elevenData.transcript
          : JSON.stringify(elevenData.transcript, null, 2);

      setElevenLabsTranscript(elevenTranscript);
      toast.success("ElevenLabs transcription done!");

      toast.info("Transcribing with Deepgram...");
      const deepgramForm = new FormData();
      deepgramForm.append("videoName", uploadedFilename);

      const deepgramRes = await fetch("http://localhost:8000/transcribeWithDeepgram", {
        method: "POST",
        body: deepgramForm,
      });

      if (!deepgramRes.ok) {
        const errText = await deepgramRes.text();
        throw new Error(`Deepgram transcription failed: ${errText}`);
      }

      const deepgramData = await deepgramRes.json();
      const deepgramTranscript = deepgramData.transcript || "No transcript from Deepgram";
      setDeepgramTranscript(deepgramTranscript);
      toast.success("Deepgram transcription done!");

      if (deepgramTranscript && deepgramTranscript !== "No transcript from Deepgram") {
        toast.info("Analyzing speech with Gemini...");
        try {
          const analysisRes = await fetch("http://localhost:8000/analyzeSpeechWithGemini", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              transcript: deepgramTranscript,
              videoName: uploadedFilename,
            }),
          });

          if (!analysisRes.ok) {
            let errorMessage = analysisRes.statusText;
            try {
              const errorData = await analysisRes.json();
              errorMessage = errorData.error || errorMessage;
            } catch (parseError) {}
            throw new Error(`Gemini speech analysis failed: ${errorMessage}`);
          }

          const analysisData = await analysisRes.json();
          setLlmAnalysisResult(analysisData.analysis);
          toast.success("Speech analysis by Gemini complete!");
        } catch (analysisErr) {
          toast.error("Speech analysis failed. Check console for details.");
        }
      } else {
        toast.info("No Deepgram transcript found for speech analysis.");
      }
    } catch (err) {
      console.error("Upload/Processing Error:", err.message || err);
      toast.error(`Operation failed: ${err.message || "An unknown error occurred."}`);
    } finally {
      setLoading(false);
    }
  };

  const handleManualTextAnalysis = async () => {
    if (!manualTranscript.trim()) {
      toast.error("Please enter some text to analyze.");
      return;
    }

    setLoading(true);
    setLlmAnalysisResult("");

    try {
      toast.info("Analyzing text with Gemini...");
      const analysisRes = await fetch("http://localhost:8000/analyzeSpeechWithGemini", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ transcript: manualTranscript }),
      });

      if (!analysisRes.ok) {
        let errorMessage = analysisRes.statusText;
        try {
          const errorData = await analysisRes.json();
          errorMessage = errorData.error || errorMessage;
        } catch (parseError) {
          console.warn("Could not parse error response as JSON");
        }
        throw new Error(`Gemini text analysis failed: ${errorMessage}`);
      }

      const analysisData = await analysisRes.json();
      setLlmAnalysisResult(analysisData.analysis);
      toast.success("Text analysis by Gemini complete!");
      console.log("Text Analysis by Gemini:", analysisData.analysis);
    } catch (error) {
      console.error("Text Analysis Error:", error.message || error);
      toast.error(`Text analysis failed: ${error.message || "An unknown error occurred."}`);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <StyledWrapper>
        <section className="py-5 bg-white min-h-screen flex items-center justify-center" id="upload">
          <div className="container mx-auto">
            <div className="flex justify-center">
              <div className="w-full lg:w-3/4">
                <div className="card shadow-lg rounded-xl overflow-hidden">
                  <div className="card-body text-center p-8">
                    <div className="loader mb-6">
                      <span className="letter a">A</span>
                      <span className="letter n">N</span>
                      <span className="letter a">A</span>
                      <span className="letter l">L</span>
                      <span className="letter y">Y</span>
                      <span className="letter s">S</span>
                      <span className="letter i">I</span>
                      <span className="letter n">N</span>
                      <span className="letter g">G</span>
                      <img src={mic} alt="Mic" style={{ width: "55px", height: "50px" }} />
                    </div>

                    <h5 className="text-2xl font-semibold mb-4 text-gray-800">
                      Processing Your Presentation...
                    </h5>

                    <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
                      <div
                        className="bg-indigo-600 h-2.5 rounded-full animate-pulse"
                        style={{ width: '75%' }}
                      ></div>
                    </div>

                    <p className="text-muted text-gray-600 mb-0">
                      Analyzing your video/audio, extracting frames, transcribing, and generating insights...
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </StyledWrapper>
    );
  }

  return (
    <section className="py-8 bg-white min-h-screen" id="upload">
      <div className="container mx-auto px-4">
        <div className="flex justify-center">
          <div className="w-full lg:w-3/4">
            <div className="text-center mb-8">
              <h2 className="text-4xl font-extrabold mb-3 text-gray-900">Upload Your Presentation</h2>
              <p className="text-lg text-gray-600">Drag & drop your video or audio file, or click to browse</p>
            </div>

            <div
              className={`upload-area flex flex-col items-center justify-center p-10 mb-6 bg-white border-2 border-dashed rounded-lg cursor-pointer transition-colors duration-300
                ${dragOver ? 'border-indigo-600 bg-indigo-50' : 'border-gray-300 hover:border-indigo-400'}
              `}
              onClick={() => fileInputRef.current?.click()}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <FaCloudUploadAlt className="text-indigo-600 mb-4" style={{ fontSize: '4rem' }} />
              <h4 className="text-2xl font-semibold mb-3 text-gray-800">Drag & Drop Your File Here</h4>
              <p className="text-gray-600 mb-2">Supported formats: .mp4, .mov, .avi, .mp3, .wav</p>
              <p className="text-gray-500 text-sm mb-4">Max file size: 500MB</p>
              <button className="btn px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors shadow-md">
                <i className="bi bi-folder-plus mr-2"></i>Choose File
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".mp4,.mov,.avi,.mp3,.wav"
                style={{ display: 'none' }}
                onChange={handleFileInputChange}
              />
            </div>

            <div className="text-center mb-6">
              <button
                className="btn px-6 py-3 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-100 transition-colors shadow-sm"
                onClick={() => setShowTextArea(!showTextArea)}
              >
                Or, paste your transcript for text-only analysis
              </button>
            </div>

            {showTextArea && (
              <div className="mt-6 p-6 bg-white rounded-lg shadow-md border border-gray-200">
                <h3 className="text-xl font-semibold mb-4 text-gray-800">Paste Transcript for Analysis</h3>
                <textarea
                  className="form-control w-full p-3 border border-gray-300 rounded-md mb-4 resize-y"
                  rows={8}
                  placeholder="Paste your transcript here for text-only analysis..."
                  value={manualTranscript}
                  onChange={(e) => setManualTranscript(e.target.value)}
                />
                <button
                  className="btn px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors shadow-md"
                  onClick={handleManualTextAnalysis}
                  disabled={loading}
                >
                  <i className="bi bi-search mr-2"></i>
                  {loading ? 'Analyzing...' : 'Analyze Text'}
                </button>
              </div>
            )}

            {filename && publicUrl && (
              <div className="mt-8 p-6 bg-white rounded-lg shadow-md text-center border border-gray-200">
                <h4 className="text-2xl font-semibold mb-4 text-gray-800">Uploaded File: <span className="text-indigo-600">{filename}</span></h4>
                {file && file.type.startsWith("video/") ? (
                  <video
                    src={publicUrl}
                    controls
                    className="rounded-lg shadow-md max-w-full h-auto mx-auto border border-gray-300"
                    style={{ maxWidth: '600px' }}
                  />
                ) : (
                  <audio
                    src={publicUrl}
                    controls
                    className="w-full max-w-md mx-auto"
                  />
                )}
              </div>
            )}

            {responses.length > 0 && (
              <div className="mt-8 p-6 bg-white rounded-lg shadow-md border border-gray-200">
                <h3 className="text-3xl font-bold mb-6 text-gray-800">Gemini Frame Analysis</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                  {responses.map((res, index) => {
                    const [imgFile, ...desc] = res.split(": ");
                    return (
                      <div key={index} className="border border-gray-200 rounded-lg p-5 shadow-sm bg-gray-50 text-center flex flex-col items-center">
                        <img
                          src={`http://localhost:8000/frames/${imgFile}`}
                          alt={`Frame ${index}`}
                          className="w-full h-48 object-cover rounded-md mb-3 border border-gray-200"
                        />
                        <p className="text-gray-700 text-sm leading-relaxed">{desc.join(": ")}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {elevenLabsTranscript && (
              <div className="mt-8 p-6 bg-white rounded-lg shadow-md border border-gray-200">
                <h3 className="text-3xl font-bold mb-6 text-gray-800">ElevenLabs Transcript</h3>
                <div className="bg-gray-50 p-6 rounded-md overflow-auto max-h-96 border border-gray-200">
                  <pre className="whitespace-pre-wrap font-mono text-base text-gray-700 leading-relaxed">{elevenLabsTranscript}</pre>
                </div>
              </div>
            )}

            {deepgramTranscript && (
              <div className="mt-8 p-6 bg-white rounded-lg shadow-md border border-gray-200">
                <h3 className="text-3xl font-bold mb-6 text-gray-800">Deepgram Transcript (with filler words & pauses)</h3>
                <div className="bg-gray-50 p-6 rounded-md overflow-auto max-h-96 border border-gray-200">
                  <pre className="whitespace-pre-wrap font-mono text-base text-gray-700 leading-relaxed">{deepgramTranscript}</pre>
                </div>
              </div>
            )}

            {llmAnalysisResult && (
              <div id="speech-analysis-output" className="mt-8 p-8 bg-indigo-50 rounded-xl shadow-lg border border-indigo-200">
                <h3 className="text-3xl font-bold mb-6 text-indigo-800">Gemini AI Speech Analysis Report</h3>
                <div className="bg-white p-6 rounded-lg shadow-inner overflow-auto max-h-96 border border-indigo-300">
                  <pre className="whitespace-pre-wrap font-mono text-base text-gray-800 leading-relaxed">{llmAnalysisResult}</pre>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <ToastContainer position="top-center" autoClose={3000} theme="colored" />
    </section>
  );
}

const StyledWrapper = styled.div`
  .loader {
    --ANIMATION-DELAY-MULTIPLIER: 70ms;
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    gap: 0.5rem;
    overflow: hidden;
  }

  .loader span {
    display: inline-block;
    transform: translateY(4rem);
    animation: hideAndSeek 1s alternate infinite cubic-bezier(0.86, 0, 0.07, 1);
  }

  .loader .a { animation-delay: calc(var(--ANIMATION-DELAY-MULTIPLIER) * 0); }
  .loader .n { animation-delay: calc(var(--ANIMATION-DELAY-MULTIPLIER) * 1); }
  .loader .l { animation-delay: calc(var(--ANIMATION-DELAY-MULTIPLIER) * 2); }
  .loader .y { animation-delay: calc(var(--ANIMATION-DELAY-MULTIPLIER) * 3); }
  .loader .s { animation-delay: calc(var(--ANIMATION-DELAY-MULTIPLIER) * 4); }
  .loader .i { animation-delay: calc(var(--ANIMATION-DELAY-MULTIPLIER) * 5); }
  .loader .n { animation-delay: calc(var(--ANIMATION-DELAY-MULTIPLIER) * 6); }
  .loader .g { animation-delay: calc(var(--ANIMATION-DELAY-MULTIPLIER) * 7); }

  .letter {
    width: fit-content;
    height: 4rem;
    font-size: 3rem;
    font-weight: 900;
    color: #16b499ff;
  }

  .loader .i {
    margin-inline: 5px;
  }

  @keyframes hideAndSeek {
    0% { transform: translateY(4rem); opacity: 0.3; }
    100% { transform: translateY(0); opacity: 1; }
  }
`;
