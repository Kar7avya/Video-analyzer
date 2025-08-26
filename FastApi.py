from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
import httpx
import os
import json
from typing import List, Optional
import io
from pathlib import Path

app = FastAPI(title="Voice Cloning API", description="ElevenLabs Voice Cloning Service")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # React frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ElevenLabs API configuration
ELEVENLABS_API_KEY = os.getenv("ELEVENLABS_API_KEY", "your-api-key-here")
ELEVENLABS_BASE_URL = "https://api.elevenlabs.io/v1"

# Create uploads directory if it doesn't exist
UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)

@app.get("/")
def read_root():
    return {"message": "Voice Cloning API is running"}

@app.get("/voices")
async def get_available_voices():
    """Get list of available voices from ElevenLabs"""
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{ELEVENLABS_BASE_URL}/voices",
                headers={"xi-api-key": ELEVENLABS_API_KEY}
            )
            response.raise_for_status()
            return response.json()
    except httpx.HTTPError as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch voices: {str(e)}")

@app.post("/voices/clone")
async def clone_voice(
    name: str = Form(...),
    description: str = Form("Custom cloned voice"),
    files: List[UploadFile] = File(...)
):
    """Clone a voice using uploaded audio files"""
    if not files:
        raise HTTPException(status_code=400, detail="At least one audio file is required")
    
    try:
        # Prepare files for ElevenLabs API
        voice_files = []
        for file in files:
            content = await file.read()
            voice_files.append(("files", (file.filename, content, file.content_type)))
        
        # Create voice clone
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{ELEVENLABS_BASE_URL}/voices/add",
                headers={"xi-api-key": ELEVENLABS_API_KEY},
                data={
                    "name": name,
                    "description": description
                },
                files=voice_files
            )
            response.raise_for_status()
            return response.json()
    
    except httpx.HTTPError as e:
        raise HTTPException(status_code=500, detail=f"Failed to clone voice: {str(e)}")

@app.post("/generate-speech")
async def generate_speech(
    voice_id: str = Form(...),
    text: str = Form(...),
    model_id: str = Form("eleven_monolingual_v1"),
    voice_settings: Optional[str] = Form(None)
):
    """Generate speech from text using a specific voice"""
    try:
        # Parse voice settings if provided
        settings = {}
        if voice_settings:
            settings = json.loads(voice_settings)
        else:
            settings = {
                "stability": 0.5,
                "similarity_boost": 0.5,
                "style": 0.0,
                "use_speaker_boost": True
            }
        
        # Prepare request data
        tts_data = {
            "text": text,
            "model_id": model_id,
            "voice_settings": settings
        }
        
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{ELEVENLABS_BASE_URL}/text-to-speech/{voice_id}",
                headers={
                    "xi-api-key": ELEVENLABS_API_KEY,
                    "Content-Type": "application/json"
                },
                json=tts_data
            )
            response.raise_for_status()
            
            # Return audio as streaming response
            audio_content = response.content
            return StreamingResponse(
                io.BytesIO(audio_content),
                media_type="audio/mpeg",
                headers={"Content-Disposition": "attachment; filename=generated_speech.mp3"}
            )
    
    except httpx.HTTPError as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate speech: {str(e)}")

@app.post("/upload-script")
async def upload_script(file: UploadFile = File(...)):
    """Upload and save a script file"""
    try:
        content = await file.read()
        
        # Save file
        file_path = UPLOAD_DIR / file.filename
        with open(file_path, "wb") as f:
            f.write(content)
        
        # If it's a text file, return the content
        if file.content_type and "text" in file.content_type:
            text_content = content.decode("utf-8")
            return {
                "filename": file.filename,
                "content": text_content,
                "message": "Script uploaded successfully"
            }
        else:
            return {
                "filename": file.filename,
                "message": "File uploaded successfully"
            }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to upload script: {str(e)}")

@app.delete("/voices/{voice_id}")
async def delete_voice(voice_id: str):
    """Delete a cloned voice"""
    try:
        async with httpx.AsyncClient() as client:
            response = await client.delete(
                f"{ELEVENLABS_BASE_URL}/voices/{voice_id}",
                headers={"xi-api-key": ELEVENLABS_API_KEY}
            )
            response.raise_for_status()
            return {"message": "Voice deleted successfully"}
    
    except httpx.HTTPError as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete voice: {str(e)}")

@app.get("/voices/{voice_id}")
async def get_voice_details(voice_id: str):
    """Get details of a specific voice"""
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{ELEVENLABS_BASE_URL}/voices/{voice_id}",
                headers={"xi-api-key": ELEVENLABS_API_KEY}
            )
            response.raise_for_status()
            return response.json()
    
    except httpx.HTTPError as e:
        raise HTTPException(status_code=500, detail=f"Failed to get voice details: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)