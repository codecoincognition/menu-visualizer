import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { GoogleGenAI } from "@google/genai";
import multer from "multer";

// Configure multer for memory storage
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  },
});

// Initialize Gemini client
const gemini = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || "",
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Image analysis endpoint
  app.post("/api/analyze-image", upload.single("image"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No image file provided" });
      }

      if (!process.env.GEMINI_API_KEY) {
        return res.status(500).json({ error: "Gemini API key not configured" });
      }

      // Convert buffer to base64
      const base64Image = req.file.buffer.toString('base64');
      
      // Analyze image with Gemini Vision API
      const contents = [
        {
          inlineData: {
            data: base64Image,
            mimeType: req.file.mimetype,
          },
        },
        "Analyze this image in a concise paragraph. Describe the key elements, colors, and mood. Keep it engaging but brief, as this will be converted to speech. Use markdown formatting for emphasis.",
      ];

      const response = await gemini.models.generateContent({
        model: "gemini-2.5-pro",
        contents: contents,
      });

      const analysisText = response.text;
      
      if (!analysisText) {
        return res.status(500).json({ error: "Failed to generate analysis" });
      }

      // Store the analysis
      const analysis = await storage.createImageAnalysis({
        imageData: base64Image,
        analysisText,
      });

      res.json({
        id: analysis.id,
        analysisText: analysis.analysisText,
        success: true,
      });

    } catch (error) {
      console.error("Error analyzing image:", error);
      
      if (error instanceof Error) {
        if (error.message.includes('API key')) {
          return res.status(500).json({ error: "Gemini API key is invalid or missing" });
        }
        if (error.message.includes('rate limit') || error.message.includes('quota')) {
          return res.status(429).json({ error: "Rate limit exceeded. Please try again later." });
        }
        if (error.message.includes('image')) {
          return res.status(400).json({ error: "Invalid image format or image too large" });
        }
      }
      
      res.status(500).json({ error: "Failed to analyze image. Please try again." });
    }
  });

  // Get analysis by ID
  app.get("/api/analysis/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid analysis ID" });
      }

      const analysis = await storage.getImageAnalysis(id);
      if (!analysis) {
        return res.status(404).json({ error: "Analysis not found" });
      }

      res.json(analysis);
    } catch (error) {
      console.error("Error fetching analysis:", error);
      res.status(500).json({ error: "Failed to fetch analysis" });
    }
  });

  // Get all analyses
  app.get("/api/analyses", async (req, res) => {
    try {
      const analyses = await storage.getAllImageAnalyses();
      res.json(analyses);
    } catch (error) {
      console.error("Error fetching analyses:", error);
      res.status(500).json({ error: "Failed to fetch analyses" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
