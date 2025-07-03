import { pgTable, text, serial, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const imageAnalyses = pgTable("image_analyses", {
  id: serial("id").primaryKey(),
  imageData: text("image_data").notNull(), // base64 encoded image
  analysisText: text("analysis_text").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertImageAnalysisSchema = createInsertSchema(imageAnalyses).omit({
  id: true,
  createdAt: true,
});

export type InsertImageAnalysis = z.infer<typeof insertImageAnalysisSchema>;
export type ImageAnalysis = typeof imageAnalyses.$inferSelect;
