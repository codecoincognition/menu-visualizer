import { 
  type MenuItem, 
  type InsertMenuItem, 
  type MenuSession, 
  type InsertMenuSession 
} from "@shared/schema";

export interface IStorage {
  createMenuSession(session: InsertMenuSession): Promise<MenuSession>;
  getMenuSession(id: number): Promise<MenuSession | undefined>;
  createMenuItem(item: InsertMenuItem): Promise<MenuItem>;
  getMenuItem(id: number): Promise<MenuItem | undefined>;
  getMenuItemsBySession(sessionId: number): Promise<MenuItem[]>;
  getAllMenuItems(): Promise<MenuItem[]>;
}

export class MemStorage implements IStorage {
  private menuSessions: Map<number, MenuSession>;
  private menuItems: Map<number, MenuItem>;
  private currentSessionId: number;
  private currentItemId: number;

  constructor() {
    this.menuSessions = new Map();
    this.menuItems = new Map();
    this.currentSessionId = 1;
    this.currentItemId = 1;
  }

  async createMenuSession(insertSession: InsertMenuSession): Promise<MenuSession> {
    const id = this.currentSessionId++;
    const session: MenuSession = {
      ...insertSession,
      id,
      createdAt: new Date(),
    };
    this.menuSessions.set(id, session);
    return session;
  }

  async getMenuSession(id: number): Promise<MenuSession | undefined> {
    return this.menuSessions.get(id);
  }

  async createMenuItem(insertItem: InsertMenuItem): Promise<MenuItem> {
    const id = this.currentItemId++;
    const item: MenuItem = {
      ...insertItem,
      id,
      createdAt: new Date(),
    };
    this.menuItems.set(id, item);
    return item;
  }

  async getMenuItem(id: number): Promise<MenuItem | undefined> {
    return this.menuItems.get(id);
  }

  async getMenuItemsBySession(sessionId: number): Promise<MenuItem[]> {
    // For now, return all items since we don't have session linking in the schema
    // In a real app, you'd add a sessionId foreign key to menuItems
    return Array.from(this.menuItems.values());
  }

  async getAllMenuItems(): Promise<MenuItem[]> {
    return Array.from(this.menuItems.values());
  }
}

export const storage = new MemStorage();
