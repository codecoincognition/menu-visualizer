import { describe, it, expect, beforeEach } from 'vitest'
import { MemStorage } from '../storage'
import type { InsertMenuItem, InsertMenuSession } from '../../shared/schema'

describe('MemStorage', () => {
  let storage: MemStorage

  beforeEach(() => {
    storage = new MemStorage()
  })

  describe('Menu Sessions', () => {
    it('should create a menu session', async () => {
      const sessionData: InsertMenuSession = {
        originalText: 'Pizza\nBurger\nSalad'
      }

      const session = await storage.createMenuSession(sessionData)

      expect(session.id).toBe(1)
      expect(session.originalText).toBe('Pizza\nBurger\nSalad')
      expect(session.createdAt).toBeInstanceOf(Date)
    })

    it('should get a menu session by id', async () => {
      const sessionData: InsertMenuSession = {
        originalText: 'Test menu'
      }

      const created = await storage.createMenuSession(sessionData)
      const retrieved = await storage.getMenuSession(created.id)

      expect(retrieved).toEqual(created)
    })

    it('should return undefined for non-existent session', async () => {
      const result = await storage.getMenuSession(999)
      expect(result).toBeUndefined()
    })

    it('should auto-increment session IDs', async () => {
      const session1 = await storage.createMenuSession({ originalText: 'Menu 1' })
      const session2 = await storage.createMenuSession({ originalText: 'Menu 2' })

      expect(session1.id).toBe(1)
      expect(session2.id).toBe(2)
    })
  })

  describe('Menu Items', () => {
    it('should create a menu item', async () => {
      const session = await storage.createMenuSession({ originalText: 'Test' })
      
      const itemData: InsertMenuItem = {
        sessionId: session.id,
        name: 'Pizza Margherita',
        description: 'Classic pizza with tomato and mozzarella',
        imageUrl: 'data:image/jpeg;base64,/9j/4AAQSkZJRgAB...'
      }

      const item = await storage.createMenuItem(itemData)

      expect(item.id).toBe(1)
      expect(item.sessionId).toBe(session.id)
      expect(item.name).toBe('Pizza Margherita')
      expect(item.description).toBe('Classic pizza with tomato and mozzarella')
      expect(item.imageUrl).toBe('data:image/jpeg;base64,/9j/4AAQSkZJRgAB...')
      expect(item.createdAt).toBeInstanceOf(Date)
    })

    it('should get a menu item by id', async () => {
      const session = await storage.createMenuSession({ originalText: 'Test' })
      const itemData: InsertMenuItem = {
        sessionId: session.id,
        name: 'Test Item',
        description: 'Test Description',
        imageUrl: 'test-url'
      }

      const created = await storage.createMenuItem(itemData)
      const retrieved = await storage.getMenuItem(created.id)

      expect(retrieved).toEqual(created)
    })

    it('should return undefined for non-existent item', async () => {
      const result = await storage.getMenuItem(999)
      expect(result).toBeUndefined()
    })

    it('should auto-increment item IDs', async () => {
      const session = await storage.createMenuSession({ originalText: 'Test' })
      
      const item1 = await storage.createMenuItem({
        sessionId: session.id,
        name: 'Item 1',
        description: 'Description 1',
        imageUrl: 'url1'
      })
      
      const item2 = await storage.createMenuItem({
        sessionId: session.id,
        name: 'Item 2',
        description: 'Description 2',
        imageUrl: 'url2'
      })

      expect(item1.id).toBe(1)
      expect(item2.id).toBe(2)
    })

    it('should get menu items by session ID', async () => {
      const session1 = await storage.createMenuSession({ originalText: 'Menu 1' })
      const session2 = await storage.createMenuSession({ originalText: 'Menu 2' })

      // Create items for session 1
      const item1 = await storage.createMenuItem({
        sessionId: session1.id,
        name: 'Item 1',
        description: 'Description 1',
        imageUrl: 'url1'
      })

      const item2 = await storage.createMenuItem({
        sessionId: session1.id,
        name: 'Item 2',
        description: 'Description 2',
        imageUrl: 'url2'
      })

      // Create item for session 2
      await storage.createMenuItem({
        sessionId: session2.id,
        name: 'Item 3',
        description: 'Description 3',
        imageUrl: 'url3'
      })

      const session1Items = await storage.getMenuItemsBySession(session1.id)
      const session2Items = await storage.getMenuItemsBySession(session2.id)

      expect(session1Items).toHaveLength(2)
      expect(session1Items[0]).toEqual(item1)
      expect(session1Items[1]).toEqual(item2)

      expect(session2Items).toHaveLength(1)
      expect(session2Items[0].name).toBe('Item 3')
    })

    it('should return empty array for session with no items', async () => {
      const session = await storage.createMenuSession({ originalText: 'Empty menu' })
      const items = await storage.getMenuItemsBySession(session.id)
      
      expect(items).toEqual([])
    })

    it('should get all menu items', async () => {
      const session = await storage.createMenuSession({ originalText: 'Test' })

      await storage.createMenuItem({
        sessionId: session.id,
        name: 'Item 1',
        description: 'Description 1',
        imageUrl: 'url1'
      })

      await storage.createMenuItem({
        sessionId: session.id,
        name: 'Item 2',
        description: 'Description 2',
        imageUrl: 'url2'
      })

      const allItems = await storage.getAllMenuItems()
      expect(allItems).toHaveLength(2)
    })
  })
})