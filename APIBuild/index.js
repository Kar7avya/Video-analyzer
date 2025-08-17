
// Import necessary modules
import fs from "fs"; // for sync methods like existsSync and mkdirSync
import { promises as fsp } from "fs"; // for async methods like readFile, writeFile
import express from "express";
import multer from "multer";
import path from "path";
import cors from "cors";
import { exec } from "child_process";
import { fileURLToPath } from "url";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";
import { createClient as createDeepgramClient } from "@deepgram/sdk";
import { config } from 'dotenv';
import { Blob } from "buffer";
import { createClient } from "@supabase/supabase-js";
import pkg, { defaults } from 'pg'; // Import the entire pg package
const { Pool } = pkg; // Extract Pool from the package

config();

// Initialize database pool - FIXED: Proper Pool initialization
// const pool = new Pool({
//   connectionString: process.env.DATABASE_URL,
//   // or individual connection parameters:
//   // user: process.env.DB_USER,
//   // host: process.env.DB_HOST,
//   // database: process.env.DB_NAME,
//   // password: process.env.DB_PASSWORD,
//   // port: process.env.DB_PORT,
// });
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false } // Supabase needs SSL
});

export default pool;

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL || process.env.REACT_APP_SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY || process.env.REACT_APP_SUPABASEANONKEY
);

// Get __filename and __dirname for ES module compatibility
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Express app
const app = express();
const port = 8000;

// Define a constant for pause detection threshold (in seconds)
const PAUSE_THRESHOLD = 0.5;

// Middleware setup
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Ensure necessary upload directories exist
["uploads", "frames"].forEach((folder) => {
  const dir = path.join(__dirname, folder);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir);
});

// Serve static files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/frames", express.static(path.join(__dirname, "frames")));


const videoUpload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      console.log("🔄 Upload started for:", file.originalname);
      cb(null, path.join(__dirname, "uploads"));
    },
    filename: (req, file, cb) => {
      const filename = `${Date.now()}-${file.originalname}`;
      cb(null, filename);
      console.log("✅ Upload finished with filename:", filename);
    },
  }),
});

// Initialize AI clients
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const elevenlabs = new ElevenLabsClient({ apiKey: process.env.ELEVENLABS_API_KEY });
const deepgram = createDeepgramClient(process.env.DEEPGRAM_API_KEY);

console.log("✅ API keys loaded successfully");

////////////////////////////////////////////////////////////////////////////////////////
// ROUTES
////////////////////////////////////////////////////////////////////////////////////////

// Upload a video, then upload it to Supabase
// app.post("/upload", videoUpload.single("myvideo"), async (req, res) => {
//   try {
//     const file = req.file;
//     if (!file) {
//       return res.status(400).send("No file uploaded");
//     }
//     console.log("File received for upload");

//     const fileBuffer = await fsp.readFile(file.path);
//     console.log("File buffer created");

//     const { error } = await supabase.storage
//       .from("projectai")
//       .upload(`videos/${file.originalname}`, fileBuffer, {
//         contentType: file.mimetype,
//         upsert: true,
//       });

//     if (error) {
//       console.error("Supabase upload error:", error);
//       return res.status(500).send("Upload to Supabase failed");
//     }

//     // Get public URL for the uploaded file
//     const { data: publicUrlData } = supabase
//       .storage
//       .from("projectai")
//       .getPublicUrl(`videos/${file.originalname}`);

//     const publicUrl = publicUrlData.publicUrl;

//     // Insert metadata into database
//     const { data: insertData, error: insertError } = await supabase
//       .from("metadata")
//       .insert([{
//         user_id: 1, // For now hardcoded
//         video_name: file.originalname,
//         video_url: publicUrl,
//         video_path: `videos/${file.originalname}`,
//         frames: [],
//         elevanlabs_transcript: null,
//         deepgram_transcript: null
//       }]);

//     if (insertError) {
//       console.error("Error inserting metadata:", insertError.message);
//       return res.status(500).send("Failed to save metadata");
//     }

//     console.log("✅ Metadata saved:", insertData);

//     // Delete local file after upload
//     await fsp.unlink(file.path);

//     // FIXED: Single response only
//     res.status(200).json({ 
//       message: "Upload successful!", 
//       videoName: file.originalname,
//       publicUrl: publicUrl 
//     });

//   } catch (err) {
//     console.error(err);
//     res.status(500).send("Server error");
//   }
// });
app.post("/upload", videoUpload.single("myvideo"), async (req, res) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).send("No file uploaded");
    }
    console.log("File received for upload");
    console.log("Original filename:", file.originalname);

    const fileBuffer = await fsp.readFile(file.path);
    console.log("File buffer created");

    // 🔧 GENERATE THE SAME FILENAME FORMAT AS YOUR FRONTEND
    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
    const randomId = Math.random().toString(36).substring(2, 15);
    const fileExtension = path.extname(file.originalname);
    const baseName = path.basename(file.originalname, fileExtension);
    
    // Create the renamed filename that matches your frontend format
    const renamedFilename = `${timestamp}-${randomId}-${baseName}${fileExtension}`;
    
    console.log("Renamed filename:", renamedFilename);

    // Upload with the renamed filename
    const { error } = await supabase.storage
      .from("projectai")
      .upload(`videos/${renamedFilename}`, fileBuffer, {
        contentType: file.mimetype,
        upsert: true,
      });

    if (error) {
      console.error("Supabase upload error:", error);
      return res.status(500).send("Upload to Supabase failed");
    }

    // Get public URL for the uploaded file
    const { data: publicUrlData } = supabase
      .storage
      .from("projectai")
      .getPublicUrl(`videos/${renamedFilename}`);

    const publicUrl = publicUrlData.publicUrl;

    console.log("TRYING TO INSERT IN SUPABASE METATABLE");

    // 🔧 FIXED: Insert metadata with the SAME filename used in storage
    const { data: insertData, error: insertError } = await supabase
      .from("metadata")
      .insert([{
        user_id: 1, // For now hardcoded
        video_name: renamedFilename, // 🚨 Use renamed filename, not original
        original_name: file.originalname, // Keep original name for reference
        video_url: publicUrl,
        // video_path: `videos/${renamedFilename}`, // 🚨 Use renamed filename
        // frames: [],
        // elevanlabs_transcript: null,
        // deepgram_transcript: null
      }]);

      console.log("INSERTING IN META TABLE ELSE ERROR");
    if (insertError) {
      console.error("Error inserting metadata:", insertError.message);
      console.error("Insert error details:", insertError);
      return res.status(500).send("Failed to save metadata");
    }

    console.log("✅ Metadata saved with filename:", renamedFilename);

    // Delete local file after upload
    await fsp.unlink(file.path);

    // Return the renamed filename so frontend knows what to use
    res.status(200).json({ 
      message: "Upload successful!", 
      videoName: renamedFilename, // 🚨 Return renamed filename
      originalName: file.originalname,
      publicUrl: publicUrl 
    });

  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).send("Server error");
  }
});

// Extracts frames from a video in Supabase, uploads them back, and cleans up.
app.post("/extractFrames", videoUpload.none(), async (req, res) => {
    console.log("Extracting frames!");
    const { videoName } = req.body;

    if (!videoName) {
        return res.status(400).send("videoName is required");
    }

    const videoPath = path.join(__dirname, "uploads", videoName);
    const framesDir = path.join(__dirname, 'frames');

    try {
        // 1. Download video from Supabase
        const { data, error: downloadError } = await supabase.storage
            .from('projectai')
            .download(`videos/${videoName}`);

        if (downloadError || !data) {
            console.error("Failed to download video from Supabase", downloadError);
            return res.status(404).send("Failed to download video from Supabase");
        }

        // 2. Save video locally
        await fsp.writeFile(videoPath, Buffer.from(await data.arrayBuffer()));

        // 3. Extract frames using FFmpeg
        const command = `ffmpeg -i "${videoPath}" -vf "fps=1/5" "${path.join(framesDir, 'frame_%04d.jpg')}"`;
        
        exec(command, async (err) => {
            if (err) {
                console.error("FFmpeg error:", err);
                await fsp.unlink(videoPath); // Clean up downloaded video
                return res.status(500).send("Failed to extract frames");
            }

            try {
                // FIXED: Initialize frameMetadata array
                const frameMetadata = [];
                
                // 4. Upload frames to Supabase and build metadata
                const frameFiles = fs.readdirSync(framesDir);
                
                for (const file of frameFiles) {
                    const fullPath = path.join(framesDir, file);
                    const fileBuffer = fs.readFileSync(fullPath);
                    const storagePath = `frames/${file}`; // FIXED: Define storagePath

                    const { error: uploadError } = await supabase.storage
                        .from('projectai')
                        .upload(storagePath, fileBuffer, {
                            contentType: 'image/jpeg',
                            upsert: true,
                        });

                    if (uploadError) {
                        console.error(`Failed to upload ${file}`, uploadError);
                        continue; // Continue with other frames even if one fails
                    }

                    // Get public URL for each frame
                    const { data: publicUrlData } = supabase
                        .storage
                        .from("projectai")
                        .getPublicUrl(storagePath);

                    // FIXED: Build frame metadata correctly
                    frameMetadata.push({
                        frame_id: file,
                        frame_path: storagePath,
                        frame_created_at: new Date().toISOString(),
                        frame_analysis: null,
                        frame_url: publicUrlData.publicUrl
                    });
                    
                    fs.unlinkSync(fullPath); // Delete local frame after upload
                }

                // FIXED: Update metadata in database
                const { error: updateError } = await supabase
                    .from("metadata")
                    .update({ frames: frameMetadata })
                    .eq("video_name", videoName);

                if (updateError) {
                    console.error("Error updating metadata:", updateError);
                    return res.status(500).send("Failed to update metadata");
                }

                // Clean up local video file
                await fsp.unlink(videoPath);

                // FIXED: Single response
                res.json({
                    message: "Frames extracted and metadata updated",
                    frames: frameMetadata
                });

            } catch (uploadErr) {
                console.error(uploadErr);
                res.status(500).send("Upload failed");
            }
        });
    } catch (err) {
        console.error("Error during frame extraction:", err);
        res.status(500).send("Internal server error");
    }
});

// FIXED: Complete analyzeAllFrames function
app.get("/analyzeAllFrames", async (req, res) => {
    try {
        const { data: frameList, error: listError } = await supabase
            .storage
            .from("projectai")
            .list("frames", { limit: 100 });

        if (listError) {
            console.error("Supabase list error:", listError);
            return res.status(500).send("Could not list frames from Supabase.");
        }

        if (!frameList || frameList.length === 0) {
            return res.status(404).send("No frames found to analyze.");
        }

        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const analysisResults = []; // FIXED: Better variable name

        for (const item of frameList) {
            const { data, error: downloadError } = await supabase
                .storage
                .from("projectai")
                .download(`frames/${item.name}`);

            if (downloadError) {
                console.error(`Download error for ${item.name}:`, downloadError.message);
                continue;
            }

            // Read and validate buffer
            const arrayBuffer = await data.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);
            const base64 = buffer.toString("base64");

            // Validate non-empty image data
            if (!base64 || base64.length < 100) {
                console.warn(`Skipped ${item.name} due to empty or invalid image data.`);
                continue;
            }

            console.log(`Analyzing: ${item.name}, Base64 length: ${base64.length}`);

            const result = await model.generateContent([
                { text: "Describe this image" },
                { inlineData: { mimeType: "image/jpeg", data: base64 } },
            ]);

            const description = await result.response.text();
            analysisResults.push({ name: item.name, description });

            // FIXED: Update metadata for each frame
            try {
                const { data: allVideos, error: fetchError } = await supabase
                    .from("metadata")
                    .select("id, frames");

                if (fetchError) {
                    console.error("Error fetching videos:", fetchError);
                    continue;
                }

                // Find the video that contains this frame
                const video = allVideos.find(v => 
                    Array.isArray(v.frames) && 
                    v.frames.some(f => f.frame_id === item.name)
                );

                if (!video) {
                    console.warn('No video found for frame', item.name);
                    continue;
                }

                // Update the frame analysis in the frames array
                const updatedFrames = video.frames.map(f =>
                    f.frame_id === item.name
                        ? { ...f, frame_analysis: description }
                        : f
                );

                await supabase
                    .from("metadata")
                    .update({ frames: updatedFrames })
                    .eq("id", video.id);

            } catch (updateError) {
                console.error(`Error updating metadata for frame ${item.name}:`, updateError);
            }
        }

        res.json({
            message: "Analysis complete and metadata updated",
            analysisResults: analysisResults
        });

    } catch (err) {
        console.error("Gemini analysis failed:", err);
        res.status(500).json({ error: "Gemini analysis failed: " + err.message });
    }
});

// Transcribe video audio with Deepgram
// app.post("/transcribeWithDeepgram", videoUpload.none(), async (req, res) => {
//     const { videoName } = req.body;

//     console.log("✅ /transcribeWithDeepgram route HIT!");
//     console.log("📦 Request body:", req.body);
//     console.log("🎬 Video name received:", req.body.videoName);

//     if (!videoName) {
//         console.log("❌ No videoName provided");
//         return res.status(400).json({ error: "videoName is required" });
//     }
    
//     console.log(`🔍 Looking for metadata for video: ${videoName}`)

//     // Find the metadata row for this video
//     const { data: metadataRows, error: metadataError } = await supabase
//         .from("metadata")
//         .select("id")
//         .eq("video_name", videoName)
//         .limit(1);

//     if (metadataError) {
//         console.error("Error fetching metadata row:", metadataError.message);
//         return res.status(500).json({ error: "Failed to find metadata row" });
//     }

//     if (!metadataRows || metadataRows.length === 0) {
        
//         console.log("❌ No metadata entry found for this video");

//         return res.status(404).json({ error: "No metadata entry found for this video" });
//     }

//     console.log(`✅ Found metadata row with ID: ${metadataRows[0].id}`);

//     const metadataId = metadataRows[0].id;
//     const videoPath = path.join(__dirname, "uploads", videoName);
//     const audioPath = path.join(__dirname, "uploads", `audio_for_deepgram_${Date.now()}.mp3`);



//     console.log(`📁 Video path: ${videoPath}`);
//     console.log(`🎵 Audio path: ${audioPath}`);

//     try {
//         const { data, error } = await supabase.storage
//             .from("projectai")
//             .download(`videos/${videoName}`);

//         if (error) {
//             console.error("Error downloading video from Supabase:", error.message);
//             return res.status(500).json({ error: "Failed to download video from Supabase" });
//         }

//         await fsp.writeFile(videoPath, Buffer.from(await data.arrayBuffer()));
//         console.log("Video downloaded and saved to:", videoPath);

//         const command = `ffmpeg -y -i "${videoPath}" -q:a 0 -map a "${audioPath}"`;
//         exec(command, async (error, _, stderr) => {
//             if (error) {
//                 console.error(`FFmpeg audio extraction failed: ${error.message}`);
//                 console.error(stderr);
//                 return res.status(500).json({ error: "Audio extraction failed" });
//             }
//             console.log("Audio extracted at:", audioPath);

//             try {
//                 const audioBuffer = fs.readFileSync(audioPath);
//                 const { result, error: deepgramError } = await deepgram.listen.prerecorded.transcribeFile(
//                     audioBuffer,
//                     {
//                         model: "nova-3",
//                         smart_format: true,
//                         disfluencies: true,
//                         punctuate: true,
//                         filler_words: true,
//                         word_details: true,
//                     }
//                 );

//                 if (deepgramError) {
//                     console.error("Deepgram API error:", deepgramError.message);
//                     return res.status(500).json({ error: "Deepgram API error: " + deepgramError.message });
//                 }

//                 // Get BOTH regular words AND filler words
//                 const words = result?.results?.channels?.[0]?.alternatives?.[0]?.words || [];
//                 const fillerWords = result?.results?.channels?.[0]?.alternatives?.[0]?.filler_words || [];

//                 // Combine and sort by timestamp
//                 const allWords = [...words, ...fillerWords].sort((a, b) => a.start - b.start);

//                 let currentTranscriptParts = [];
//                 for (let i = 0; i < allWords.length; i++) {
//                     if (i > 0) {
//                         const gap = allWords[i].start - allWords[i - 1].end;
//                         if (gap > PAUSE_THRESHOLD) {
//                             currentTranscriptParts.push(`[PAUSE:${gap.toFixed(2)}s]`);
//                         }
//                     }
//                     currentTranscriptParts.push(allWords[i].word);
//                 }
//                 const transcript = currentTranscriptParts.join(" ");


//                 console.log(`📄 Final transcript length: ${transcript.length} characters`);
//                 console.log("📝 Transcript preview:", transcript.substring(0, 100) + "...");

//                 console.log("💾 Updating metadata in database...");

//                 console.log(`🔍 Looking for metadata for video: ${videoName}`);

//                 // FIXED: Update metadata with transcript
//                 console.log("📋 Checking what's in the metadata table...");
//                 const { error: updateError } = await supabase
//                     .from("metadata")
//                     .update({
//                         deepgram_transcript: transcript,
//                         deepgram_words: allWords
//                     })
//                     .eq("id", metadataId);

//                 if (updateError) {
//                     console.error("Error updating metadata:", updateError.message);
//                     return res.status(500).json({ error: "Failed to update metadata" });
//                 }

//                 console.log("✅ Metadata updated successfully");
//                 console.log("🎉 Sending response to client");

//                 res.json({ transcript, words: allWords });

//             } catch (err) {
//                 console.error("Deepgram transcription failed:", err.message);
//                 res.status(500).json({ error: "Deepgram failed: " + err.message });
//             } finally {
//                 await fsp.unlink(audioPath).catch(e => console.error("Error deleting audio file", e));
//                 await fsp.unlink(videoPath).catch(e => console.error("Error deleting video file", e));
//             }
//         });
//     } catch (err) {
//         console.error("Unexpected error:", err.message);
//         res.status(500).json({ error: "Server error: " + err.message });
//     }
// });

app.post("/transcribeWithDeepgram", videoUpload.none(), async (req, res) => {
    const { videoName } = req.body;

    console.log("✅ /transcribeWithDeepgram route HIT!");
    console.log("📦 Request body:", req.body);
    console.log("🎬 Video name received:", req.body.videoName);

    if (!videoName) {
        console.log("❌ No videoName provided");
        return res.status(400).json({ error: "videoName is required" });
    }
    
    console.log(`🔍 Looking for metadata for video: ${videoName}`);

    // 🚨 ADD THIS DEBUG CODE - Let's see what's in the database first
    console.log("📋 Checking what's in the metadata table...");
    const { data: allMetadata, error: allError } = await supabase
        .from("metadata")
        .select("id, video_name, created_at")
        .order('created_at', { ascending: false })
        .limit(10);

    if (allError) {
        console.error("❌ Error fetching all metadata:", allError);
    } else {
        console.log("📋 Recent metadata entries:");
        if (allMetadata && allMetadata.length > 0) {
            allMetadata.forEach((row, index) => {
                console.log(`  ${index + 1}. ID: ${row.id}, Video: "${row.video_name}", Created: ${row.created_at}`);
            });
        } else {
            console.log("  📭 NO METADATA ENTRIES FOUND IN DATABASE!");
            console.log("  💡 This means no videos have been uploaded to the metadata table yet.");
        }
    }

    // Find the metadata row for this video
    console.log(`🔍 Searching for exact match: "${videoName}"`);
    let { data: metadataRows, error: metadataError } = await supabase
        .from("metadata")
        .select("id, video_name")
        .eq("video_name", videoName)
        .limit(1);

    console.log("🔍 Exact match result:", metadataRows);

    if (metadataError) {
        console.error("❌ Database query error:", metadataError.message);
        return res.status(500).json({ error: "Database query failed: " + metadataError.message });
    }

    // If no exact match, try variations
    if (!metadataRows || metadataRows.length === 0) {
        console.log("❌ No exact match found! Trying variations...");
        
        // Try without file extension
        const nameWithoutExt = videoName.replace(/\.[^/.]+$/, "");
        console.log(`🔍 Trying without extension: "${nameWithoutExt}"`);
        
        const { data: noExtRows, error: noExtError } = await supabase
            .from("metadata")
            .select("id, video_name")
            .eq("video_name", nameWithoutExt)
            .limit(1);
            
        if (noExtRows && noExtRows.length > 0) {
            console.log("✅ Found match without extension!");
            metadataRows = noExtRows;
        } else {
            // Try with just the base name (remove timestamp prefix)
            const baseName = videoName.split('-').pop(); // Gets "latestfiller.mp4" from "2025-08-14_12-03-33-ta6y6gysvqn-latestfiller.mp4"
            console.log(`🔍 Trying base name: "${baseName}"`);
            
            const { data: baseRows, error: baseError } = await supabase
                .from("metadata")
                .select("id, video_name")
                .eq("video_name", baseName)
                .limit(1);
                
            if (baseRows && baseRows.length > 0) {
                console.log("✅ Found match with base name!");
                metadataRows = baseRows;
            } else {
                // Try partial matching (LIKE query)
                console.log(`🔍 Trying partial match with LIKE...`);
                const { data: likeRows, error: likeError } = await supabase
                    .from("metadata")
                    .select("id, video_name")
                    .like("video_name", `%${baseName.replace('.mp4', '')}%`)
                    .limit(1);
                    
                if (likeRows && likeRows.length > 0) {
                    console.log("✅ Found partial match!");
                    metadataRows = likeRows;
                }
            }
        }
    }

    // Still no match found
    if (!metadataRows || metadataRows.length === 0) {
        console.log("❌ No metadata entry found for this video after all attempts!");
        console.log("📝 Searched for:");
        console.log(`  - Exact: "${videoName}"`);
        console.log(`  - Without ext: "${videoName.replace(/\.[^/.]+$/, "")}"`);
        console.log(`  - Base name: "${videoName.split('-').pop()}"`);
        console.log("📋 Available videos in database:");
        if (allMetadata && allMetadata.length > 0) {
            allMetadata.forEach(row => {
                console.log(`  - "${row.video_name}"`);
            });
        } else {
            console.log("  📭 No videos in database at all!");
        }
        
        return res.status(404).json({ 
            error: "No metadata entry found for this video",
            searchedFor: videoName,
            availableVideos: allMetadata?.map(row => row.video_name) || [],
            suggestion: "Make sure the video was uploaded successfully first"
        });
    }

    console.log(`✅ Found metadata row with ID: ${metadataRows[0].id} for video: "${metadataRows[0].video_name}"`);

    const metadataId = metadataRows[0].id;
    const videoPath = path.join(__dirname, "uploads", videoName);
    const audioPath = path.join(__dirname, "uploads", `audio_for_deepgram_${Date.now()}.mp3`);

    console.log(`📁 Video path: ${videoPath}`);
    console.log(`🎵 Audio path: ${audioPath}`);

    try {
        console.log("⬇️ Downloading video from Supabase storage...");
        const { data, error } = await supabase.storage
            .from("projectai")
            .download(`videos/${videoName}`);

        if (error) {
            console.error("❌ Error downloading video from Supabase:", error.message);
            return res.status(500).json({ error: "Failed to download video from Supabase" });
        }

        await fsp.writeFile(videoPath, Buffer.from(await data.arrayBuffer()));
        console.log("✅ Video downloaded and saved to:", videoPath);

        const command = `ffmpeg -y -i "${videoPath}" -q:a 0 -map a "${audioPath}"`;
        console.log("🎬 Starting FFmpeg audio extraction...");
        
        exec(command, async (error, _, stderr) => {
            if (error) {
                console.error(`❌ FFmpeg audio extraction failed: ${error.message}`);
                console.error("FFmpeg stderr:", stderr);
                return res.status(500).json({ error: "Audio extraction failed" });
            }
            console.log("✅ Audio extracted at:", audioPath);

            try {
                console.log("🧠 Starting Deepgram transcription...");
                const audioBuffer = fs.readFileSync(audioPath);
                console.log(`📊 Audio buffer size: ${audioBuffer.length} bytes`);

                const { result, error: deepgramError } = await deepgram.listen.prerecorded.transcribeFile(
                    audioBuffer,
                    {
                        model: "nova-3",
                        smart_format: true,
                        disfluencies: true,
                        punctuate: true,
                        filler_words: true,
                        word_details: true,
                    }
                );

                if (deepgramError) {
                    console.error("❌ Deepgram API error:", deepgramError.message);
                    return res.status(500).json({ error: "Deepgram API error: " + deepgramError.message });
                }

                console.log("✅ Deepgram transcription completed!");

                // Get BOTH regular words AND filler words
                const words = result?.results?.channels?.[0]?.alternatives?.[0]?.words || [];
                const fillerWords = result?.results?.channels?.[0]?.alternatives?.[0]?.filler_words || [];

                console.log(`📝 Regular words: ${words.length}, Filler words: ${fillerWords.length}`);

                // Combine and sort by timestamp
                const allWords = [...words, ...fillerWords].sort((a, b) => a.start - b.start);

                let currentTranscriptParts = [];
                for (let i = 0; i < allWords.length; i++) {
                    if (i > 0) {
                        const gap = allWords[i].start - allWords[i - 1].end;
                        if (gap > PAUSE_THRESHOLD) {
                            currentTranscriptParts.push(`[PAUSE:${gap.toFixed(2)}s]`);
                        }
                    }
                    currentTranscriptParts.push(allWords[i].word);
                }
                const transcript = currentTranscriptParts.join(" ");

                console.log(`📄 Final transcript length: ${transcript.length} characters`);
                console.log("📝 Transcript preview:", transcript.substring(0, 100) + "...");

                console.log("💾 Updating metadata in database...");

                // Update metadata with transcript
                const { error: updateError } = await supabase
                    .from("metadata")
                    .update({
                        deepgram_transcript: transcript,
                        deepgram_words: allWords
                    })
                    .eq("id", metadataId);

                if (updateError) {
                    console.error("❌ Error updating metadata:", updateError.message);
                    return res.status(500).json({ error: "Failed to update metadata" });
                }

                console.log("✅ Metadata updated successfully");
                console.log("🎉 Sending response to client");

                res.json({ transcript, words: allWords });

            } catch (err) {
                console.error("❌ Deepgram transcription failed:", err.message);
                res.status(500).json({ error: "Deepgram failed: " + err.message });
            } finally {
                console.log("🧹 Cleaning up temporary files...");
                await fsp.unlink(audioPath).catch(e => console.error("❌ Error deleting audio file", e));
                await fsp.unlink(videoPath).catch(e => console.error("❌ Error deleting video file", e));
                console.log("✅ Cleanup completed");
            }
        });
    } catch (err) {
        console.error("❌ Unexpected error:", err.message);
        res.status(500).json({ error: "Server error: " + err.message });
    }
});
// Transcribe video audio with ElevenLabs
app.post("/transcribeWithElevenLabs", videoUpload.none(), async (req, res) => {
    const { videoName } = req.body;
    if (!videoName) {
        return res.status(400).json({ error: "videoName is required" });
    }

    const videoPath = path.join(__dirname, "uploads", videoName);
    const audioPath = path.join(__dirname, "uploads", `audio_for_11labs_${Date.now()}.mp3`);

    try {
        const { data, error: downloadError } = await supabase.storage
            .from("projectai")
            .download(`videos/${videoName}`);

        if (downloadError) {
            console.error("Error downloading video from Supabase:", downloadError.message);
            return res.status(500).json({ error: "Failed to download video from Supabase" });
        }

        await fsp.writeFile(videoPath, Buffer.from(await data.arrayBuffer()));
        console.log("Video downloaded and saved to:", videoPath);

        const command = `ffmpeg -y -i "${videoPath}" -q:a 0 -map a "${audioPath}"`;
        exec(command, async (error, _, stderr) => {
            if (error) {
                console.error(`FFmpeg audio extraction failed for ElevenLabs: ${error.message}`);
                console.error(`FFmpeg stderr: ${stderr}`);
                return res.status(500).json({ error: "Audio extraction failed" });
            }
            console.log(`Audio extracted for ElevenLabs to: ${audioPath}`);

            try {
                const buffer = fs.readFileSync(audioPath);
                const audioBlob = new Blob([buffer], { type: "audio/mp3" });

                const transcriptionResult = await elevenlabs.speechToText.convert({
                    file: audioBlob,
                    modelId: "scribe_v1",
                    tagAudioEvents: true,
                    languageCode: "eng",
                    diarize: true,
                });

                let elevenLabsTranscript = "";
                if (transcriptionResult && transcriptionResult.words) {
                    const words = transcriptionResult.words;
                    let currentTranscriptParts = [];
                    for (let i = 0; i < words.length; i++) {
                        const word = words[i];
                        if (i > 0) {
                            const prevWord = words[i - 1];
                            const gap = word.start - prevWord.end;
                            if (gap > PAUSE_THRESHOLD) {
                                currentTranscriptParts.push(`[PAUSE:${gap.toFixed(2)}s]`);
                            }
                        }
                        currentTranscriptParts.push(word.text);
                    }
                    elevenLabsTranscript = currentTranscriptParts.join(' ');
                } else {
                    elevenLabsTranscript = transcriptionResult?.text || "";
                }
                res.json({ transcript: elevenLabsTranscript });
            } catch (err) {
                console.error("ElevenLabs transcription failed:", err.message);
                res.status(500).json({ error: "ElevenLabs failed: " + err.message });
            } finally {
                await fsp.unlink(audioPath).catch(e => console.error("Error deleting audio file", e));
                await fsp.unlink(videoPath).catch(e => console.error("Error deleting video file", e));
            }
        });
    } catch (err) {
        console.error("Unexpected error:", err.message);
        res.status(500).json({ error: "Server error: " + err.message });
    }
});

// Analyze speech transcript with Gemini
app.post("/analyzeSpeechWithGemini", async (req, res) => {
    const { transcript, videoName } = req.body; // FIXED: Get videoName from request

    if (!transcript) {
        return res.status(400).json({ error: "No transcript provided for analysis." });
    }

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const prompt = `Analyze the following speech transcript for the presence of filler words (like "uh", "um", "like", "you know") and pauses (marked as [PAUSE:X.XXs]).
        
        Based *only* on the textual content, provide insights on:
        1.  **Frequency of Filler Words:** Count and list the specific filler words used and their occurrences.
        2.  **Frequency of Pauses:** Count the number of pauses and note their average duration.
        3.  **Overall Fluency:** Comment on how the use of these filler words and pauses might affect the perceived fluency of the speech.
        4.  **Perceived Confidence (from text):** Based on word choice, sentence structure, and the presence/absence of filler words/pauses, assess the *perceived* confidence of the speaker. Provide a rating (e.g., Low, Medium, High) and justification.
        5.  **Perceived Clarity (from text):** Based on vocabulary, sentence complexity, and the presence/absence of disfluencies, assess the *perceived* clarity of the speech. Provide a rating (e.g., Low, Medium, High) and justification.
        6.  **Inferred Tone Modulation (from text):** While direct audio tone is not available, comment on any *inferred* tone modulation based on punctuation, word emphasis (if implied by context), or changes in sentence structure. For example, does the text suggest questions, exclamations, or a generally flat delivery? Provide a rating (e.g., Flat, Moderate, Expressive) and justification.
        7.  **Suggestions for Improvement:** Offer actionable advice on how to reduce filler words, improve pacing, enhance perceived confidence, and increase clarity.

        Transcript:
        "${transcript}"`;

        const result = await model.generateContent(prompt);
        const analysis = await result.response.text();

        // FIXED: Update metadata if videoName is provided
        if (videoName) {
            const { data: rows, error: fetchError } = await supabase
                .from("metadata")
                .select("id")
                .eq("video_name", videoName)
                .limit(1);

            if (!fetchError && rows && rows.length > 0) {
                const { error: updateError } = await supabase
                    .from("metadata")
                    .update({ gemini_speech_analysis: analysis })
                    .eq("id", rows[0].id);

                if (updateError) {
                    console.error("Error updating speech analysis:", updateError);
                }
            }
        }

        res.json({ analysis });
    } catch (err) {
        console.error("Gemini speech analysis failed:", err.message);
        if (err.message.includes("API key expired") || err.message.includes("API_KEY_INVALID")) {
            res.status(500).json({ error: "Gemini speech analysis failed: API key expired. Please renew your GEMINI_API_KEY." });
        } else {
            res.status(500).json({ error: "Gemini speech analysis failed: " + err.message });
        }
    }
});

// FIXED: Complete metadata endpoint
app.get('/api/metadata', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM metadata ORDER BY created_at DESC'); // FIXED: column name and syntax
        res.json({ success: true, data: result.rows });
    } catch (error) {
        console.error('Error fetching metadata:', error);
        res.status(500).json({ success: false, error: error.message }); // FIXED: Proper error message
    }
});

// Start the server
app.listen(port, () => {
  console.log(`✅ Server running at http://localhost:${port}`);
});



