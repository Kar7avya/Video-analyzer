// frontend/src/components/gemini.js
import React, { useState } from "react";

function Gemini() {
  const [file, setFile] = useState(null);
  const [prompt, setPrompt] = useState("Ask anything about this image");
  const [output, setOutput] = useState("");

  const toBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result.split(",")[1]);
      reader.onerror = reject;
    });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!file) {
      alert("Please upload an image.");
      return;
    }

    const base64Image = await toBase64(file);

    try {
      const res = await fetch("http://localhost:5000/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: base64Image, prompt }),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `HTTP error ${res.status}`);
      }

      const data = await res.json();
      setOutput(data.response);
    } catch (error) {
      console.error("Error:", error);
      setOutput("❌ Failed to analyze image. Please try again.");
    }
  };

  return (
    <div>
      <h1>🧠 AI Image Analyzer</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setFile(e.target.files[0])}
        />
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Ask anything about this image"
        />
        <button type="submit">Go</button>
      </form>
      <p>{output}</p>
    </div>
  );
}

export default Gemini;
