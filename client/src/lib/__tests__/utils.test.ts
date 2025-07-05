import { describe, it, expect, vi } from 'vitest'
import { cn, convertToBase64, validateImageFile } from '../utils'

describe('Utils', () => {
  describe('cn (className utility)', () => {
    it('should merge class names correctly', () => {
      const result = cn('base-class', 'additional-class')
      expect(result).toContain('base-class')
      expect(result).toContain('additional-class')
    })

    it('should handle conditional classes', () => {
      const condition = true
      const result = cn('base-class', condition && 'conditional-class')
      expect(result).toContain('conditional-class')
    })

    it('should handle falsy conditional classes', () => {
      const condition = false
      const result = cn('base-class', condition && 'conditional-class')
      expect(result).not.toContain('conditional-class')
      expect(result).toContain('base-class')
    })

    it('should handle empty inputs', () => {
      const result = cn('', null, undefined)
      expect(result).toBe('')
    })
  })

  describe('convertToBase64', () => {
    it('should convert file to base64', async () => {
      const mockFile = new File(['test content'], 'test.txt', { type: 'text/plain' })
      
      // Mock FileReader with proper result
      const mockFileReader = {
        readAsDataURL: vi.fn(),
        result: 'data:text/plain;base64,dGVzdCBjb250ZW50',
        onload: null as any,
        onerror: null as any,
      }

      vi.spyOn(global, 'FileReader').mockImplementation(() => mockFileReader as any)

      const promise = convertToBase64(mockFile)
      
      // Simulate FileReader onload with correct result
      setTimeout(() => {
        if (mockFileReader.onload) {
          mockFileReader.onload({} as any)
        }
      }, 0)

      const result = await promise
      expect(result).toBe('data:text/plain;base64,dGVzdCBjb250ZW50')
      expect(mockFileReader.readAsDataURL).toHaveBeenCalledWith(mockFile)
    })

    it('should handle file reading errors', async () => {
      const mockFile = new File(['test content'], 'test.txt', { type: 'text/plain' })
      
      const mockFileReader = {
        readAsDataURL: vi.fn(),
        result: null,
        onload: null as any,
        onerror: null as any,
      }

      vi.spyOn(global, 'FileReader').mockImplementation(() => mockFileReader as any)

      const promise = convertToBase64(mockFile)
      
      // Simulate FileReader onerror
      setTimeout(() => {
        if (mockFileReader.onerror) {
          mockFileReader.onerror({} as any)
        }
      }, 0)

      await expect(promise).rejects.toThrow('Failed to read file')
    })
  })

  describe('validateImageFile', () => {
    it('should accept valid image files', () => {
      const validFile = new File([''], 'image.jpg', { type: 'image/jpeg' })
      Object.defineProperty(validFile, 'size', { value: 1024 * 1024 }) // 1MB

      const result = validateImageFile(validFile)
      expect(result.isValid).toBe(true)
      expect(result.error).toBeUndefined()
    })

    it('should reject files that are too large', () => {
      const largeFile = new File([''], 'large.jpg', { type: 'image/jpeg' })
      Object.defineProperty(largeFile, 'size', { value: 20 * 1024 * 1024 }) // 20MB

      const result = validateImageFile(largeFile)
      expect(result.isValid).toBe(false)
      expect(result.error).toContain('File too large. Please select an image smaller than 10MB')
    })

    it('should reject non-image files', () => {
      const textFile = new File([''], 'document.txt', { type: 'text/plain' })
      Object.defineProperty(textFile, 'size', { value: 1024 })

      const result = validateImageFile(textFile)
      expect(result.isValid).toBe(false)
      expect(result.error).toContain('Please select a valid image file')
    })

    it('should accept various image formats', () => {
      const formats = [
        { name: 'image.jpg', type: 'image/jpeg' },
        { name: 'image.png', type: 'image/png' },
        { name: 'image.webp', type: 'image/webp' },
      ]

      formats.forEach(({ name, type }) => {
        const file = new File([''], name, { type })
        Object.defineProperty(file, 'size', { value: 1024 })

        const result = validateImageFile(file)
        expect(result.isValid).toBe(true)
      })
    })
  })
})