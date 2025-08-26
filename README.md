# 🎤 Voice Cloning Studio

A modern web application for voice cloning and text-to-speech generation using ElevenLabs AI. Upload voice samples, clone voices, and generate speech from text with a beautiful, user-friendly interface.

## ✨ Features

- **🎭 Voice Cloning**: Upload audio samples to create custom voice clones
- **📝 Script Upload**: Upload text files or type scripts directly
- **🎵 Speech Generation**: Convert text to speech using cloned or built-in voices
- **📋 Voice Library**: Manage your collection of cloned and built-in voices
- **🔊 Audio Playback**: Listen to generated audio with built-in player
- **📥 Download**: Save generated audio files
- **🎨 Modern UI**: Beautiful, responsive interface with Bootstrap

## 🚀 Quick Start

### Prerequisites

- Python 3.8+
- Node.js 16+
- ElevenLabs API key ([Get one here](https://elevenlabs.io/app/settings/api-keys))

### Backend Setup

1. **Install Python dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

2. **Set up environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env and add your ElevenLabs API key
   ```

3. **Start the backend server:**
   ```bash
   python FastApi.py
   ```
   
   The API will be available at `http://localhost:8000`

### Frontend Setup

1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm start
   ```
   
   The app will be available at `http://localhost:3000`

## 🛠️ API Endpoints

### Voice Management
- `GET /voices` - Get all available voices
- `POST /voices/clone` - Clone a voice from audio samples
- `GET /voices/{voice_id}` - Get voice details
- `DELETE /voices/{voice_id}` - Delete a cloned voice

### Speech Generation
- `POST /generate-speech` - Generate speech from text
- `POST /upload-script` - Upload a text script

## 📱 Usage

### 1. Clone a Voice
- Go to the "Clone Voice" tab
- Enter a name for your voice
- Upload high-quality audio samples (at least 1 minute total)
- Click "Clone Voice"

### 2. Generate Speech
- Go to the "Generate Speech" tab
- Select a voice from the dropdown
- Enter text or upload a script file
- Click "Generate Speech"
- Listen to or download the generated audio

### 3. Manage Voices
- Use the "Voice Library" tab to view all available voices
- Delete cloned voices you no longer need
- Quickly select voices for speech generation

## 🎯 Best Practices for Voice Cloning

1. **Audio Quality**: Use high-quality, clear audio samples
2. **Duration**: Provide at least 1 minute of total audio
3. **Variety**: Include different emotions and speaking styles
4. **Format**: Use MP3, WAV, M4A, or FLAC formats
5. **Background**: Minimize background noise

## 🔧 Configuration

### Environment Variables

- `ELEVENLABS_API_KEY`: Your ElevenLabs API key (required)

### Voice Settings

The application uses these default voice settings:
- **Stability**: 0.5
- **Similarity Boost**: 0.5
- **Style**: 0.0
- **Speaker Boost**: True

## 📦 Dependencies

### Backend
- FastAPI - Modern web framework
- httpx - HTTP client for API calls
- python-multipart - File upload support
- uvicorn - ASGI server

### Frontend
- React 19 - UI framework
- Axios - HTTP client
- Bootstrap 5 - UI components
- React Toastify - Notifications

## 🚨 Troubleshooting

### Common Issues

1. **"Failed to fetch voices"**
   - Check your ElevenLabs API key
   - Ensure the backend server is running
   - Verify your internet connection

2. **"Failed to clone voice"**
   - Check audio file formats (MP3, WAV, M4A, FLAC)
   - Ensure files are not corrupted
   - Verify sufficient audio duration

3. **CORS errors**
   - Ensure both frontend and backend are running
   - Check that frontend is running on port 3000

### Getting Help

1. Check the browser console for error messages
2. Check the backend logs in the terminal
3. Verify your ElevenLabs API key is valid
4. Ensure you have sufficient ElevenLabs credits

## 📄 License

This project is open source and available under the MIT License.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

**Note**: This application requires an active ElevenLabs API key and sufficient credits for voice cloning and speech generation.