# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Architecture

This is a video analysis application with three main components:

### 1. Frontend (React App)
- **Location**: `frontend/` directory 
- **Tech Stack**: React 19.1.0, React Router, Bootstrap/Reactstrap, Axios
- **Pages**: Home, Upload, Dashboard, SignUp
- **Key Features**: Video/audio upload with drag-and-drop, real-time processing feedback

### 2. API Backend (Node.js/Express)
- **Location**: `APIBuild/` directory
- **Tech Stack**: Express, Multer for file uploads, FFmpeg for video processing
- **AI Services**: Google Gemini, ElevenLabs, Deepgram for transcription and analysis
- **Storage**: Supabase for file storage and metadata
- **Database**: PostgreSQL via Supabase

### 3. FastAPI Backend (Python)
- **Location**: `FastApi.py` (minimal implementation, appears to be a placeholder)

## Core Workflow

The application processes videos/audio through these stages:
1. **Upload**: Files uploaded to Supabase storage via Express backend
2. **Frame Extraction**: FFmpeg extracts frames from videos (1 per 5 seconds)
3. **Frame Analysis**: Google Gemini analyzes extracted frames
4. **Transcription**: Both ElevenLabs and Deepgram transcribe audio
5. **Speech Analysis**: Gemini analyzes transcripts for filler words, pauses, fluency
6. **Storage**: All results stored in Supabase metadata table

## Development Commands

### Frontend Development
```bash
cd frontend
npm start        # Start development server on localhost:3000
npm test         # Run tests
npm run build    # Build for production
```

### Backend Development
```bash
cd APIBuild
npm start        # Start Express server on localhost:8000
```

### FastAPI (if developed further)
```bash
python FastApi.py  # Start FastAPI server
```

## Environment Configuration

### Required Environment Variables (.env in APIBuild/)
- `GEMINI_API_KEY` - Google Gemini API key
- `ELEVENLABS_API_KEY` - ElevenLabs API key  
- `DEEPGRAM_API_KEY` - Deepgram API key
- `REACT_APP_SUPABASE_URL` - Supabase project URL
- `REACT_APP_SUPABASEANONKEY` - Supabase anonymous key
- `DATABASE_URL` - PostgreSQL connection string (Supabase)

## Key File Locations

- **Main Express API**: `APIBuild/index.js`
- **React App Entry**: `frontend/src/App.js`
- **Upload Component**: `frontend/src/components/pages/Upload.js`
- **Dashboard**: `frontend/src/components/pages/Dashboard.js`
- **Supabase Client**: `APIBuild/supabaseClient.js` and `frontend/src/components/pages/supabaseClient.js`

## Database Schema

The application uses a `metadata` table with these key fields:
- `video_name` - Filename in storage
- `original_name` - Original uploaded filename
- `video_url` - Public Supabase URL
- `frames` - JSON array of frame metadata
- `deepgram_transcript` - Transcript with filler words/pauses
- `deepgram_words` - Word-level timing data
- `gemini_speech_analysis` - AI analysis of speech patterns

## Dependencies & Tools

### Critical Dependencies
- **FFmpeg**: Required for video processing (frame extraction, audio extraction)
- **Multer**: File upload handling
- **Supabase**: File storage and database
- **Google Generative AI**: Frame and speech analysis
- **Deepgram SDK**: Speech transcription
- **ElevenLabs**: Alternative transcription service

### File Processing
- Supports video formats: .mp4, .mov, .avi
- Supports audio formats: .mp3, .wav
- Max file size: 500MB
- Frame extraction rate: 1 frame per 5 seconds

## Common Development Patterns

1. **File Upload Flow**: Frontend → Express backend → Supabase storage → Metadata creation
2. **Processing Pipeline**: Sequential API calls for each analysis step
3. **Error Handling**: Toast notifications in frontend, detailed logging in backend
4. **State Management**: React useState for component state, no global state manager
5. **Routing**: React Router with Layout wrapper for authenticated pages

## Testing

Frontend uses Create React App testing setup with Jest and React Testing Library. No backend tests are currently implemented.