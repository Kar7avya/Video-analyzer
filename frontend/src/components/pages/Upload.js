import React, { useState, useRef, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaCloudUploadAlt } from "react-icons/fa"; // Import the cloud upload icon
import supabase from "./supabaseClient";

export default function Upload() {
  const [file, setFile] = useState(null);
  const [filename, setFilename] = useState("");
  const [publicUrl, setPublicUrl] = useState(""); // Store Supabase public URL
  const [responses, setResponses] = useState([]); // Stores Gemini frame analysis responses
  const [elevenLabsTranscript, setElevenLabsTranscript] = useState("");
  const [deepgramTranscript, setDeepgramTranscript] = useState("");
  const [llmAnalysisResult, setLlmAnalysisResult] = useState(""); // State for LLM speech analysis result
  const [loading, setLoading] = useState(false); // Manages loading state for the entire process
  const [dragOver, setDragOver] = useState(false); // State for drag-over effect
  const [showTextArea, setShowTextArea] = useState(false); // State to show/hide text area
  const fileInputRef = useRef(null); // Ref for the hidden file input

  useEffect(() => {
    if (file) {
      handleUpload({ preventDefault: () => {} }); // dummy event
    }
  }, [file]);

  // Function to handle file selection (from drag/drop or click)
  const handleFileSelect = (selectedFile) => {
    const maxSize = 500 * 1024 * 1024; // 500MB
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

  // Drag & Drop Handlers
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
    e.preventDefault(); // Keep this for form submission, but the auto-trigger passes a dummy

    if (!file) {
      toast.error("❗ Please select a video or audio file!");
      return;
    }

    setLoading(true);
    // Clear previous results
    setResponses([]);
    setElevenLabsTranscript("");
    setDeepgramTranscript("");
    setLlmAnalysisResult("");
    setPublicUrl("");

    try {
      // 1️⃣ Upload file to backend (which uploads to Supabase and creates metadata)
      toast.info("⬆️ Uploading file to Supabase...");
      const formData = new FormData();
      formData.append("myvideo", file);

      const uploadRes = await fetch("http://localhost:8000/upload", {
        method: "POST",
        body: formData,
      });

      if (!uploadRes.ok) {
        const errorText = await uploadRes.text();
        throw new Error(`Upload failed (${uploadRes.status}): ${errorText}`);
      }

      const uploadData = await uploadRes.json();
      const uploadedFilename = uploadData.videoName;
      const uploadPublicUrl = uploadData.publicUrl;

      if (!uploadedFilename) {
        throw new Error("No filename received from server");
      }

      setFilename(uploadedFilename);
      setPublicUrl(uploadPublicUrl);
      toast.success("✅ File uploaded to Supabase and metadata saved successfully!");

      // 2️⃣ Extract frames (only for video, backend should handle audio gracefully)
      toast.info("🖼️ Extracting frames (if video)...");
      const extractForm = new FormData();
      extractForm.append("videoName", uploadedFilename);

      const extractRes = await fetch("http://localhost:8000/extractFrames", {
        method: "POST",
        body: extractForm,
      });

      if (!extractRes.ok) {
        const errorText = await extractRes.text();
        console.warn(`Frame extraction might have failed or not applicable: ${errorText}`);
        toast.warn("🖼️ Frame extraction skipped or failed (might be an audio file).");
      } else {
        toast.success("✅ Frames extracted (if video)!");
      }

      // 3️⃣ Analyze frames using Gemini (only for video)
      toast.info("🤖 Analyzing frames with Gemini (if video)...");
      const analyzeRes = await fetch("http://localhost:8000/analyzeAllFrames");

      if (!analyzeRes.ok) {
        const errText = await analyzeRes.text();
        console.warn(`Frame analysis might have failed or not applicable: ${errText}`);
        toast.warn("🤖 Frame analysis skipped or failed (might be an audio file).");
      } else {
        const analyzeData = await analyzeRes.json();
        const frames = Array.isArray(analyzeData)
          ? analyzeData
          : analyzeData.responses || [];
        setResponses(frames.map((item) => `${item.file}: ${item.description}`));
        toast.success("✅ Frame analysis complete (if video)!");
      }

      // 4️⃣ Transcribe with ElevenLabs
      toast.info("🗣️ Transcribing with ElevenLabs...");
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
      toast.success("✅ ElevenLabs transcription done!");

      // 5️⃣ Transcribe with Deepgram
      toast.info("🧠 Transcribing with Deepgram...");
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
      toast.success("✅ Deepgram transcription done!");

      // 6️⃣ Call LLM for Speech Analysis using the Deepgram transcript
      if (deepgramTranscript && deepgramTranscript !== "No transcript from Deepgram") {
        toast.info("✨ Analyzing speech with Gemini...");
        try {
          const analysisRes = await fetch("http://localhost:8000/analyzeSpeechWithGemini", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ transcript: deepgramTranscript, videoName: uploadedFilename }),
          });

          if (!analysisRes.ok) {
            let errorMessage = analysisRes.statusText;
            try {
              const errorData = await analysisRes.json();
              errorMessage = errorData.error || errorMessage;
            } catch (parseError) {
              console.warn("Could not parse error response as JSON");
            }
            throw new Error(`Gemini speech analysis failed: ${errorMessage}`);
          }

          const analysisData = await analysisRes.json();
          setLlmAnalysisResult(analysisData.analysis);
          toast.success("✅ Speech analysis by Gemini complete!");
          console.log("Speech Analysis by Gemini:", analysisData.analysis);

        } catch (analysisErr) {
          console.error("Speech Analysis Error:", analysisErr.message || analysisErr);
          toast.error("❌ Speech analysis failed. Check console for details.");
        }
      } else {
        console.warn("No Deepgram transcript available for LLM analysis. Skipping speech analysis.");
        toast.info("ℹ️ No Deepgram transcript found for speech analysis.");
      }

    } catch (err) {
      console.error("Upload/Processing Error:", err.message || err);
      toast.error(`❌ Operation failed: ${err.message || "An unknown error occurred."}`);
    } finally {
      setLoading(false);
    }
  };

  // State for manual transcript
  const [manualTranscript, setManualTranscript] = useState("");

  const handleManualTextAnalysis = async () => {
    if (!manualTranscript.trim()) {
      toast.error("Please enter some text to analyze.");
      return;
    }

    setLoading(true);
    setLlmAnalysisResult(""); // Clear previous results

    try {
      toast.info("✨ Analyzing text with Gemini...");
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
      toast.success("✅ Text analysis by Gemini complete!");
      console.log("Text Analysis by Gemini:", analysisData.analysis);

    } catch (error) {
      console.error("Text Analysis Error:", error.message || error);
      toast.error(`❌ Text analysis failed: ${error.message || "An unknown error occurred."}`);
    } finally {
      setLoading(false);
    }
  };

  // Show loading/processing state
  if (loading) {
    return (
      <section className="py-5 bg-white min-h-screen flex items-center justify-center" id="upload">
        <div className="container mx-auto">
          <div className="flex justify-center">
            <div className="w-full lg:w-3/4">
              <div className="card shadow-lg rounded-xl overflow-hidden">
                <div className="card-body text-center p-8">
                  <div className="spinner-border text-indigo-600 mb-4 animate-spin" role="status" style={{ width: '3rem', height: '3rem' }}>
                    <span className="sr-only">Loading...</span>
                  </div>
                  <h5 className="text-2xl font-semibold mb-4 text-gray-800">Processing Your Presentation...</h5>
                  <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
                    <div
                      className="bg-indigo-600 h-2.5 rounded-full animate-pulse"
                      style={{ width: '75%' }} // Simulating progress
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

            {/* Upload Area */}
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

            {/* Manual Transcript Option */}
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
                  disabled={loading} // Use general loading state
                >
                  <i className="bi bi-search mr-2"></i>
                  {loading ? 'Analyzing...' : 'Analyze Text'}
                </button>
              </div>
            )}

            {/* Display sections for results (video, frame, transcripts, LLM analysis) */}
            {filename && publicUrl && (
              <div className="mt-8 p-6 bg-white rounded-lg shadow-md text-center border border-gray-200">
                <h4 className="text-2xl font-semibold mb-4 text-gray-800">🎬 Uploaded File: <span className="text-indigo-600">{filename}</span></h4>
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
                <h3 className="text-3xl font-bold mb-6 text-gray-800">🖼️ Gemini Frame Analysis</h3>
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
                <h3 className="text-3xl font-bold mb-6 text-gray-800">🗣️ ElevenLabs Transcript</h3>
                <div className="bg-gray-50 p-6 rounded-md overflow-auto max-h-96 border border-gray-200">
                  <pre className="whitespace-pre-wrap font-mono text-base text-gray-700 leading-relaxed">{elevenLabsTranscript}</pre>
                </div>
              </div>
            )}

            {deepgramTranscript && (
              <div className="mt-8 p-6 bg-white rounded-lg shadow-md border border-gray-200">
                <h3 className="text-3xl font-bold mb-6 text-gray-800">🧠 Deepgram Transcript (with filler words & pauses)</h3>
                <div className="bg-gray-50 p-6 rounded-md overflow-auto max-h-96 border border-gray-200">
                  <pre className="whitespace-pre-wrap font-mono text-base text-gray-700 leading-relaxed">{deepgramTranscript}</pre>
                </div>
              </div>
            )}

            {llmAnalysisResult && (
              <div id="speech-analysis-output" className="mt-8 p-8 bg-indigo-50 rounded-xl shadow-lg border border-indigo-200">
                <h3 className="text-3xl font-bold mb-6 text-indigo-800">✨ Gemini AI Speech Analysis Report</h3>
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
