import '@testing-library/jest-dom'
import { vi } from 'vitest'
import React from 'react'

// Make React globally available for JSX
global.React = React

// Mock window.speechSynthesis for text-to-speech tests
Object.defineProperty(window, 'speechSynthesis', {
  writable: true,
  value: {
    speak: vi.fn(),
    cancel: vi.fn(),
    pause: vi.fn(),
    resume: vi.fn(),
    getVoices: vi.fn(() => []),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  },
})

// Mock SpeechSynthesisUtterance
global.SpeechSynthesisUtterance = vi.fn().mockImplementation(() => ({
  text: '',
  lang: '',
  voice: null,
  volume: 1,
  rate: 1,
  pitch: 1,
  onend: null,
  onerror: null,
  onstart: null,
}))

// Mock FileReader for file upload tests
global.FileReader = vi.fn().mockImplementation(() => ({
  readAsText: vi.fn(),
  readAsDataURL: vi.fn(),
  onload: null,
  onerror: null,
  result: null,
}))

// Mock fetch for API calls
global.fetch = vi.fn()

// Mock console methods to avoid noise in tests
global.console = {
  ...console,
  log: vi.fn(),
  error: vi.fn(),
  warn: vi.fn(),
}