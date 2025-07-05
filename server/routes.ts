import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { GoogleGenAI } from "@google/genai";

// Initialize Gemini client
const gemini = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

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

async function generateFoodImage(foodName: string): Promise<string> {
  // For now, use high-quality food placeholders 
  // In production, you'd integrate with DALL-E or similar image generation service
  const cleanName = encodeURIComponent(foodName);
  return `https://picsum.photos/400/300?random=${Date.now()}&text=${cleanName}`;
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Process menu text endpoint
  app.post("/api/process-menu", async (req, res) => {
    try {
      const { menuText } = req.body;

      if (!menuText || typeof menuText !== 'string') {
        return res.status(400).json({ error: "Menu text is required" });
      }

      if (!process.env.GEMINI_API_KEY) {
        return res.status(500).json({ error: "Gemini API key not configured" });
      }

      // Parse menu text to extract food items
      const parsedItems = await parseMenuText(menuText);
      
      if (parsedItems.length === 0) {
        return res.status(400).json({ error: "No valid food items found in the menu text" });
      }

      // Create menu session
      const session = await storage.createMenuSession({
        originalText: menuText,
      });

      // Generate images and create menu items
      const menuItems = [];
      for (const item of parsedItems) {
        const imageUrl = await generateFoodImage(item.name);
        
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

  const httpServer = createServer(app);
  return httpServer;
}
