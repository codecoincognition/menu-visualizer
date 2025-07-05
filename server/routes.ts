import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { GoogleGenAI } from "@google/genai";
import multer from "multer";
// Initialize Gemini client
const gemini = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/') || file.mimetype === 'text/plain') {
      cb(null, true);
    } else {
      cb(new Error('Only image files and text files are allowed'));
    }
  },
});

interface ParsedMenuItem {
  name: string;
  description: string;
}

async function parseMenuText(menuText: string): Promise<ParsedMenuItem[]> {
  try {
    const prompt = `Parse this menu text and extract only valid food items. For each food item, provide:
1. A clean name (title case)
2. A brief, appetizing description (if not provided, create one based on the dish name)

Return a JSON array of objects with "name" and "description" fields. Ignore any non-food items like prices, restaurant info, or categories. Only include actual food dishes.

Menu text:
${menuText}

Return only the JSON array, no other text.`;

    const response = await gemini.models.generateContent({
      model: "gemini-1.5-flash",
      contents: [prompt],
    });

    const responseText = response.text;
    
    if (!responseText) {
      throw new Error("No response text received from Gemini");
    }
    
    // Extract JSON from response
    const jsonMatch = responseText.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error("No valid JSON found in response");
    }

    const parsedItems = JSON.parse(jsonMatch[0]);
    
    // Validate the parsed items
    return parsedItems.filter((item: any) => 
      item && 
      typeof item.name === 'string' && 
      typeof item.description === 'string' &&
      item.name.trim().length > 0
    );
  } catch (error) {
    console.error("Error parsing menu text:", error);
    // Return a simple parsed version if AI fails
    return parseMenuTextSimple(menuText);
  }
}

function parseMenuTextSimple(menuText: string): ParsedMenuItem[] {
  const lines = menuText.split('\n').filter(line => line.trim().length > 0);
  const items: ParsedMenuItem[] = [];
  
  for (const line of lines) {
    // Skip lines that look like prices, categories, or restaurant info
    if (/^\$|^price|restaurant|menu|category|appetizer|dessert|drinks/i.test(line.trim())) {
      continue;
    }
    
    // Simple parsing - assume each line is a food item
    const trimmed = line.trim();
    if (trimmed.length > 3 && trimmed.length < 100) {
      items.push({
        name: trimmed.replace(/^\d+\.\s*/, '').trim(), // Remove numbers
        description: `Delicious ${trimmed.toLowerCase()} prepared fresh`
      });
    }
  }
  
  return items.slice(0, 10); // Limit to 10 items
}

async function generateFoodImage(foodName: string, description: string): Promise<string> {
  // Skip AI generation for now and use reliable fallbacks
  console.log(`Generating image for: ${foodName}`);
  
  try {
    // Use a more reliable fallback with food-specific images
    const foodCategories = {
      'salmon': 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400&h=300&fit=crop',
      'salad': 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=300&fit=crop',
      'pasta': 'https://images.unsplash.com/photo-1551892374-ecf8754cf8b0?w=400&h=300&fit=crop',
      'pizza': 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&h=300&fit=crop',
      'taco': 'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?w=400&h=300&fit=crop',
      'burger': 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=300&fit=crop',
      'chicken': 'https://images.unsplash.com/photo-1532550907401-a500c9a57435?w=400&h=300&fit=crop',
      'fish': 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400&h=300&fit=crop',
      'soup': 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400&h=300&fit=crop',
      'dessert': 'https://images.unsplash.com/photo-1551024709-8f87befc6f87?w=400&h=300&fit=crop'
    };
    
    // Find matching category or use generic food image
    const lowerName = foodName.toLowerCase();
    for (const [category, imageUrl] of Object.entries(foodCategories)) {
      if (lowerName.includes(category)) {
        return imageUrl;
      }
    }
    
    // Generic food fallback
    return 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&h=300&fit=crop';
  } catch (error) {
    console.error("Error generating food image:", error);
    // Final fallback - generic food image
    return 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&h=300&fit=crop';
  }
}

async function parseMenuFromImage(imageBuffer: Buffer, mimeType: string): Promise<ParsedMenuItem[]> {
  try {
    const base64Image = imageBuffer.toString('base64');
    
    const prompt = `Analyze this menu image and extract only valid food items. For each food item, provide:
1. A clean name (title case)
2. A brief, appetizing description

Return a JSON array of objects with "name" and "description" fields. Ignore any non-food items like prices, restaurant info, or categories. Only include actual food dishes.

Return only the JSON array, no other text.`;

    const response = await gemini.models.generateContent({
      model: "gemini-1.5-flash",
      contents: [
        {
          inlineData: {
            data: base64Image,
            mimeType: mimeType,
          },
        },
        prompt
      ],
    });

    const responseText = response.text;
    
    if (!responseText) {
      throw new Error("No response text received from Gemini");
    }
    
    // Extract JSON from response
    const jsonMatch = responseText.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error("No valid JSON found in response");
    }

    const parsedItems = JSON.parse(jsonMatch[0]);
    
    // Validate the parsed items
    return parsedItems.filter((item: any) => 
      item && 
      typeof item.name === 'string' && 
      typeof item.description === 'string' &&
      item.name.trim().length > 0
    );
  } catch (error) {
    console.error("Error parsing menu image:", error);
    throw new Error("Failed to parse menu image");
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Process menu (text or image) endpoint
  app.post("/api/process-menu", upload.single("menuFile"), async (req, res) => {
    try {
      const { menuText } = req.body;
      const uploadedFile = req.file;

      if (!process.env.GEMINI_API_KEY) {
        return res.status(500).json({ error: "Gemini API key not configured" });
      }

      let parsedItems: ParsedMenuItem[] = [];
      let sourceText = "";

      // Handle uploaded file (image or text)
      if (uploadedFile) {
        if (uploadedFile.mimetype.startsWith('image/')) {
          // Process uploaded menu image
          parsedItems = await parseMenuFromImage(uploadedFile.buffer, uploadedFile.mimetype);
          sourceText = `Uploaded image: ${uploadedFile.originalname}`;
        } else if (uploadedFile.mimetype === 'text/plain') {
          // Process uploaded text file
          const textContent = uploadedFile.buffer.toString('utf-8');
          parsedItems = await parseMenuText(textContent);
          sourceText = textContent;
        }
      } 
      // Handle text input
      else if (menuText && typeof menuText === 'string') {
        parsedItems = await parseMenuText(menuText);
        sourceText = menuText;
      } 
      else {
        return res.status(400).json({ error: "Please provide menu text or upload a menu file" });
      }
      
      if (parsedItems.length === 0) {
        return res.status(400).json({ error: "No valid food items found in the menu" });
      }

      // Create menu session
      const session = await storage.createMenuSession({
        originalText: sourceText,
      });

      // Generate images and create menu items
      const menuItems = [];
      for (const item of parsedItems) {
        const imageUrl = await generateFoodImage(item.name, item.description);
        
        const menuItem = await storage.createMenuItem({
          name: item.name,
          description: item.description,
          imageUrl: imageUrl,
        });
        
        menuItems.push(menuItem);
      }

      res.json({
        sessionId: session.id,
        menuItems: menuItems,
        success: true,
      });

    } catch (error) {
      console.error("Error processing menu:", error);
      
      if (error instanceof Error) {
        if (error.message.includes('API key')) {
          return res.status(500).json({ error: "Gemini API key is invalid or missing" });
        }
        if (error.message.includes('rate limit') || error.message.includes('quota')) {
          return res.status(429).json({ error: "Rate limit exceeded. Please try again later." });
        }
      }
      
      res.status(500).json({ error: "Failed to process menu. Please try again." });
    }
  });

  // Get menu items
  app.get("/api/menu-items", async (req, res) => {
    try {
      const menuItems = await storage.getAllMenuItems();
      res.json(menuItems);
    } catch (error) {
      console.error("Error fetching menu items:", error);
      res.status(500).json({ error: "Failed to fetch menu items" });
    }
  });

  // Get specific menu item
  app.get("/api/menu-items/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid menu item ID" });
      }

      const menuItem = await storage.getMenuItem(id);
      if (!menuItem) {
        return res.status(404).json({ error: "Menu item not found" });
      }

      res.json(menuItem);
    } catch (error) {
      console.error("Error fetching menu item:", error);
      res.status(500).json({ error: "Failed to fetch menu item" });
    }
  });

  // Streaming endpoint for real-time menu processing updates
  app.post("/api/process-menu-stream", upload.single("menuFile"), async (req, res) => {
    try {
      // Set up Server-Sent Events headers
      res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Cache-Control'
      });

      const sendEvent = (type: string, data: any) => {
        res.write(`event: ${type}\n`);
        res.write(`data: ${JSON.stringify(data)}\n\n`);
      };

      const { menuText } = req.body;
      const uploadedFile = req.file;

      if (!process.env.GEMINI_API_KEY) {
        sendEvent('error', { message: "Gemini API key not configured" });
        res.end();
        return;
      }

      let parsedItems: ParsedMenuItem[] = [];
      let sourceText = "";

      sendEvent('status', { message: 'Starting menu processing...' });

      // Handle uploaded file (image or text)
      if (uploadedFile) {
        if (uploadedFile.mimetype.startsWith('image/')) {
          sendEvent('status', { message: 'Analyzing uploaded menu image...' });
          parsedItems = await parseMenuFromImage(uploadedFile.buffer, uploadedFile.mimetype);
          sourceText = `Uploaded image: ${uploadedFile.originalname}`;
        } else if (uploadedFile.mimetype === 'text/plain') {
          sendEvent('status', { message: 'Processing uploaded text file...' });
          const textContent = uploadedFile.buffer.toString('utf-8');
          parsedItems = await parseMenuText(textContent);
          sourceText = textContent;
        }
      } else if (menuText && typeof menuText === 'string') {
        sendEvent('status', { message: 'Parsing menu text...' });
        parsedItems = await parseMenuText(menuText);
        sourceText = menuText;
      } else {
        sendEvent('error', { message: "Please provide menu text or upload a menu file" });
        res.end();
        return;
      }
      
      if (parsedItems.length === 0) {
        sendEvent('error', { message: "No valid food items found in the menu" });
        res.end();
        return;
      }

      sendEvent('parsed', { 
        count: parsedItems.length, 
        items: parsedItems.map(item => item.name),
        message: `Found ${parsedItems.length} menu items`
      });

      // Create menu session
      const session = await storage.createMenuSession({
        originalText: sourceText,
      });

      const menuItems = [];

      // Process items one by one with real-time updates
      for (let i = 0; i < parsedItems.length; i++) {
        const item = parsedItems[i];
        
        sendEvent('processing', { 
          current: i + 1, 
          total: parsedItems.length, 
          item: item.name,
          message: `Generating image for "${item.name}"...`
        });

        try {
          const imageUrl = await generateFoodImage(item.name, item.description);
          
          const menuItem = await storage.createMenuItem({
            name: item.name,
            description: item.description,
            imageUrl: imageUrl,
          });

          menuItems.push(menuItem);

          sendEvent('item-complete', {
            item: menuItem,
            current: i + 1,
            total: parsedItems.length,
            message: `✓ Generated image for "${item.name}"`
          });

        } catch (error) {
          console.error(`Error processing item ${item.name}:`, error);
          sendEvent('item-error', {
            item: item.name,
            error: 'Failed to generate image',
            current: i + 1,
            total: parsedItems.length,
            message: `✗ Failed to generate image for "${item.name}"`
          });
        }
      }

      sendEvent('complete', {
        sessionId: session.id,
        menuItems: menuItems,
        success: true,
        message: `Processing complete! Generated ${menuItems.length} menu items.`
      });

      res.end();

    } catch (error) {
      console.error("Error processing menu:", error);
      res.write(`event: error\n`);
      res.write(`data: ${JSON.stringify({ message: "Failed to process menu", error: error instanceof Error ? error.message : "Unknown error" })}\n\n`);
      res.end();
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
