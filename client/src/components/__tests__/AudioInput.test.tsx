import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import AudioInput from '../AudioInput';

// Mock Speech Recognition API
const mockSpeechRecognition = {
  continuous: false,
  interimResults: false,
  lang: 'en-US',
  onresult: null,
  onend: null,
  onerror: null,
  start: vi.fn(),
  stop: vi.fn(),
};

Object.defineProperty(window, 'webkitSpeechRecognition', {
  writable: true,
  value: vi.fn().mockImplementation(() => mockSpeechRecognition),
});

describe('AudioInput Component', () => {
  const mockOnTranscriptionChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders audio input interface', () => {
    render(
      <AudioInput 
        onTranscriptionChange={mockOnTranscriptionChange}
        transcribedText=""
      />
    );
    
    expect(screen.getByText('🎤 Start Recording')).toBeInTheDocument();
  });

  it('initializes speech recognition on mount', () => {
    render(
      <AudioInput 
        onTranscriptionChange={mockOnTranscriptionChange}
        transcribedText=""
      />
    );
    
    expect(window.webkitSpeechRecognition).toHaveBeenCalled();
  });

  it('starts recording when button is clicked', async () => {
    render(
      <AudioInput 
        onTranscriptionChange={mockOnTranscriptionChange}
        transcribedText=""
      />
    );
    
    const recordButton = screen.getByText('🎤 Start Recording');
    fireEvent.click(recordButton);
    
    await waitFor(() => {
      expect(mockSpeechRecognition.start).toHaveBeenCalled();
    });
  });

  it('shows stop button when recording', async () => {
    render(
      <AudioInput 
        onTranscriptionChange={mockOnTranscriptionChange}
        transcribedText=""
      />
    );
    
    const recordButton = screen.getByText('🎤 Start Recording');
    fireEvent.click(recordButton);
    
    await waitFor(() => {
      expect(screen.getByText('🛑 Stop Recording')).toBeInTheDocument();
    });
  });

  it('handles speech recognition results', async () => {
    render(
      <AudioInput 
        onTranscriptionChange={mockOnTranscriptionChange}
        transcribedText=""
      />
    );
    
    const recordButton = screen.getByText('🎤 Start Recording');
    fireEvent.click(recordButton);
    
    // Simulate speech recognition result
    const mockEvent = {
      resultIndex: 0,
      results: [
        [{
          transcript: 'Test menu item'
        }]
      ]
    };
    
    if (mockSpeechRecognition.onresult) {
      mockSpeechRecognition.onresult(mockEvent);
    }
    
    await waitFor(() => {
      expect(mockOnTranscriptionChange).toHaveBeenCalledWith('Test menu item');
    });
  });

  it('displays transcribed text', () => {
    render(
      <AudioInput 
        onTranscriptionChange={mockOnTranscriptionChange}
        transcribedText="Grilled Salmon with herbs"
      />
    );
    
    expect(screen.getByDisplayValue('Grilled Salmon with herbs')).toBeInTheDocument();
  });

  it('handles speech recognition errors', async () => {
    render(
      <AudioInput 
        onTranscriptionChange={mockOnTranscriptionChange}
        transcribedText=""
      />
    );
    
    const recordButton = screen.getByText('🎤 Start Recording');
    fireEvent.click(recordButton);
    
    // Simulate speech recognition error
    if (mockSpeechRecognition.onerror) {
      mockSpeechRecognition.onerror(new Error('Permission denied'));
    }
    
    await waitFor(() => {
      expect(screen.getByText('🎤 Start Recording')).toBeInTheDocument();
    });
  });
});