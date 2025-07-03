import { imageAnalyses, type ImageAnalysis, type InsertImageAnalysis } from "@shared/schema";

export interface IStorage {
  createImageAnalysis(analysis: InsertImageAnalysis): Promise<ImageAnalysis>;
  getImageAnalysis(id: number): Promise<ImageAnalysis | undefined>;
  getAllImageAnalyses(): Promise<ImageAnalysis[]>;
}

export class MemStorage implements IStorage {
  private analyses: Map<number, ImageAnalysis>;
  private currentId: number;

  constructor() {
    this.analyses = new Map();
    this.currentId = 1;
  }

  async createImageAnalysis(insertAnalysis: InsertImageAnalysis): Promise<ImageAnalysis> {
    const id = this.currentId++;
    const analysis: ImageAnalysis = {
      ...insertAnalysis,
      id,
      createdAt: new Date(),
    };
    this.analyses.set(id, analysis);
    return analysis;
  }

  async getImageAnalysis(id: number): Promise<ImageAnalysis | undefined> {
    return this.analyses.get(id);
  }

  async getAllImageAnalyses(): Promise<ImageAnalysis[]> {
    return Array.from(this.analyses.values());
  }
}

export const storage = new MemStorage();
