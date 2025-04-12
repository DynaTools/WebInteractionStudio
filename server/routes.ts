import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import multer from "multer";
import { z } from "zod";
import { AgoraTokenGenerator } from "./agora";
import { transcribeAudio, generateAIResponse, generateSpeech } from "./openai";
import { ChatRequest, TTSRequest } from "@shared/schema";

// Define interface for Request with file from multer
interface MulterRequest extends Request {
  file?: Express.Multer.File;
}

// Configure multer for audio uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max file size
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Agora token generation endpoint
  app.get("/api/agora-token", async (req: Request, res: Response) => {
    try {
      if (!process.env.AGORA_APP_ID || !process.env.AGORA_APP_CERT) {
        throw new Error("Agora credentials not configured");
      }
      
      console.log("Generating Agora token with APP ID:", process.env.AGORA_APP_ID);

      // Create a token generator
      const tokenGenerator = new AgoraTokenGenerator(
        process.env.AGORA_APP_ID,
        process.env.AGORA_APP_CERT
      );

      // Use fixed channel name for consistency
      const channelName = "italian-tutor-main-channel";
      
      // Generate a uid (using a fixed number for the server)
      const uid = 9999;
      
      // Generate token with expiration time (1 hour)
      const token = tokenGenerator.generateToken(channelName, uid.toString(), 3600);
      
      console.log("Token generated successfully for channel:", channelName);
      
      // Return token information
      res.json({
        token,
        channelName,
        uid,
        appId: process.env.AGORA_APP_ID,
      });
    } catch (error) {
      console.error("Error generating Agora token:", error);
      res.status(500).json({ 
        error: "Failed to generate Agora token", 
        details: error.message 
      });
    }
  });

  // Transcribe speech to text endpoint
  app.post("/api/stt", upload.single("audio"), async (req: MulterRequest, res: Response) => {
    try {
      // Check if audio file was uploaded
      if (!req.file || !req.file.buffer) {
        return res.status(400).json({ error: "No audio file provided" });
      }

      console.log("Processing STT request, audio size:", req.file.buffer.length);
      
      // Transcribe audio using OpenAI Whisper
      const transcription = await transcribeAudio(req.file.buffer);
      
      console.log("Transcription result:", transcription);
      
      res.json({ text: transcription });
    } catch (error: any) {
      console.error("Error transcribing audio:", error);
      res.status(500).json({ error: "Failed to transcribe audio", details: error.message });
    }
  });

  // Chat with AI endpoint
  app.post("/api/chat", async (req: Request, res: Response) => {
    try {
      // Validate request
      const schema = z.object({
        userMessage: z.string().min(1),
      });
      
      const validationResult = schema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({ error: "Invalid request body" });
      }
      
      const { userMessage } = validationResult.data as ChatRequest;
      
      console.log("Chat request:", userMessage);
      
      // Generate AI response using OpenAI
      const aiResponse = await generateAIResponse(userMessage);
      
      console.log("AI response:", aiResponse);
      
      res.json({ response: aiResponse });
    } catch (error) {
      console.error("Error generating AI response:", error);
      res.status(500).json({ error: "Failed to generate AI response" });
    }
  });

  // Text to speech endpoint
  app.post("/api/tts", async (req: Request, res: Response) => {
    try {
      // Validate request
      const schema = z.object({
        text: z.string().min(1),
      });
      
      const validationResult = schema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({ error: "Invalid request body" });
      }
      
      const { text } = validationResult.data as TTSRequest;
      
      console.log("TTS request:", text);
      
      // Generate speech using OpenAI TTS
      const audioBuffer = await generateSpeech(text);
      
      // Set appropriate headers for audio response
      res.set({
        "Content-Type": "audio/mpeg",
        "Content-Length": audioBuffer.length,
      });
      
      // Send audio data
      res.send(audioBuffer);
    } catch (error) {
      console.error("Error generating speech:", error);
      res.status(500).json({ error: "Failed to generate speech" });
    }
  });

  // Combined endpoint for processing audio and getting response (for efficiency)
  app.post("/api/process-audio", upload.single("audio"), async (req: MulterRequest, res: Response) => {
    try {
      // Check if audio file was uploaded
      if (!req.file || !req.file.buffer) {
        return res.status(400).json({ error: "No audio file provided" });
      }

      console.log("Processing combined audio request, size:", req.file.buffer.length);
      
      // 1. Transcribe audio
      const transcription = await transcribeAudio(req.file.buffer);
      console.log("Transcription:", transcription);
      
      // 2. Generate AI response
      const aiResponse = await generateAIResponse(transcription);
      console.log("AI response:", aiResponse);
      
      // 3. Generate speech from AI response
      const audioBuffer = await generateSpeech(aiResponse);
      
      // Create a multipart response with both text and audio
      res.json({
        transcription,
        response: aiResponse,
        audioUrl: `data:audio/mpeg;base64,${audioBuffer.toString('base64')}`
      });
    } catch (error: any) {
      console.error("Error processing audio:", error);
      res.status(500).json({ 
        error: "Failed to process audio", 
        details: error.message 
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
