import { pgTable, text, serial, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const menuItems = pgTable("menu_items", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  imageUrl: text("image_url").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const menuSessions = pgTable("menu_sessions", {
  id: serial("id").primaryKey(),
  originalText: text("original_text").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertMenuItemSchema = createInsertSchema(menuItems).omit({
  id: true,
  createdAt: true,
});

export const insertMenuSessionSchema = createInsertSchema(menuSessions).omit({
  id: true,
  createdAt: true,
});

export type InsertMenuItem = z.infer<typeof insertMenuItemSchema>;
export type MenuItem = typeof menuItems.$inferSelect;
export type InsertMenuSession = z.infer<typeof insertMenuSessionSchema>;
export type MenuSession = typeof menuSessions.$inferSelect;
