import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import Home from '../home';

// Mock the toast hook
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

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

// Mock window.SpeechRecognition
Object.defineProperty(window, 'webkitSpeechRecognition', {
  writable: true,
  value: vi.fn().mockImplementation(() => mockSpeechRecognition),
});

// Mock fetch for API calls
global.fetch = vi.fn();

describe('Home Component', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const renderWithQuery = (component: React.ReactElement) => {
    return render(
      <QueryClientProvider client={queryClient}>
        {component}
      </QueryClientProvider>
    );
  };

  it('renders all three input options', () => {
    renderWithQuery(<Home />);
    
    // Check for numbered options
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    
    // Check for option titles
    expect(screen.getByText('Paste Menu Text')).toBeInTheDocument();
    expect(screen.getByText('Upload Menu Image')).toBeInTheDocument();
    expect(screen.getByText('Speak Menu Items')).toBeInTheDocument();
  });

  it('shows the main headline', () => {
    renderWithQuery(<Home />);
    expect(screen.getByText('Transform your menu text into beautiful food images with AI')).toBeInTheDocument();
  });

  it('renders the visualize menu button', () => {
    renderWithQuery(<Home />);
    expect(screen.getByText('✨ Visualize Menu')).toBeInTheDocument();
  });

  it('allows text input in the textarea', () => {
    renderWithQuery(<Home />);
    const textarea = screen.getByPlaceholderText(/Paste your menu items here/);
    
    fireEvent.change(textarea, { target: { value: 'Grilled Salmon\nCaesar Salad' } });
    expect(textarea).toHaveValue('Grilled Salmon\nCaesar Salad');
  });

  it('renders the try sample menu button', () => {
    renderWithQuery(<Home />);
    expect(screen.getByText('Try a Sample Menu')).toBeInTheDocument();
  });

  it('shows audio recording button', () => {
    renderWithQuery(<Home />);
    expect(screen.getByText('🎤 Start Recording')).toBeInTheDocument();
  });

  it('initializes speech recognition when supported', () => {
    renderWithQuery(<Home />);
    expect(window.webkitSpeechRecognition).toHaveBeenCalled();
  });

  it('handles speech recognition start', async () => {
    renderWithQuery(<Home />);
    const recordButton = screen.getByText('🎤 Start Recording');
    
    fireEvent.click(recordButton);
    await waitFor(() => {
      expect(mockSpeechRecognition.start).toHaveBeenCalled();
    });
  });

  it('handles speech recognition results', async () => {
    renderWithQuery(<Home />);
    const recordButton = screen.getByText('🎤 Start Recording');
    
    fireEvent.click(recordButton);
    
    // Simulate speech recognition result
    const mockEvent = {
      resultIndex: 0,
      results: [
        [{
          transcript: 'Grilled Salmon with herbs'
        }]
      ]
    };
    
    // Trigger onresult callback
    if (mockSpeechRecognition.onresult) {
      mockSpeechRecognition.onresult(mockEvent);
    }
    
    await waitFor(() => {
      expect(screen.getByDisplayValue('Grilled Salmon with herbs')).toBeInTheDocument();
    });
  });

  it('handles file upload', () => {
    renderWithQuery(<Home />);
    const fileInput = screen.getByLabelText(/Upload Menu Photo/);
    
    const file = new File(['menu content'], 'menu.jpg', { type: 'image/jpeg' });
    fireEvent.change(fileInput, { target: { files: [file] } });
    
    expect(fileInput.files![0]).toBe(file);
  });

  it('submits form with text input', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ menuItems: [], success: true }),
    });

    renderWithQuery(<Home />);
    
    const textarea = screen.getByPlaceholderText(/Paste your menu items here/);
    const submitButton = screen.getByText('✨ Visualize Menu');
    
    fireEvent.change(textarea, { target: { value: 'Grilled Salmon' } });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/process-menu', expect.any(Object));
    });
  });

  it('submits form with audio text', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ menuItems: [], success: true }),
    });

    renderWithQuery(<Home />);
    
    const recordButton = screen.getByText('🎤 Start Recording');
    const submitButton = screen.getByText('✨ Visualize Menu');
    
    // Start recording
    fireEvent.click(recordButton);
    
    // Simulate speech recognition result
    const mockEvent = {
      resultIndex: 0,
      results: [
        [{
          transcript: 'Caesar Salad with croutons'
        }]
      ]
    };
    
    if (mockSpeechRecognition.onresult) {
      mockSpeechRecognition.onresult(mockEvent);
    }
    
    await waitFor(() => {
      expect(screen.getByDisplayValue('Caesar Salad with croutons')).toBeInTheDocument();
    });
    
    // Submit form
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/process-menu', expect.any(Object));
    });
  });

  it('prevents form submission without input', () => {
    renderWithQuery(<Home />);
    
    const submitButton = screen.getByText('✨ Visualize Menu');
    expect(submitButton).toBeDisabled();
  });

  it('shows loading state during processing', async () => {
    (global.fetch as any).mockImplementationOnce(() => 
      new Promise(resolve => setTimeout(resolve, 100))
    );

    renderWithQuery(<Home />);
    
    const textarea = screen.getByPlaceholderText(/Paste your menu items here/);
    const submitButton = screen.getByText('✨ Visualize Menu');
    
    fireEvent.change(textarea, { target: { value: 'Grilled Salmon' } });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('Processing...')).toBeInTheDocument();
    });
  });
});