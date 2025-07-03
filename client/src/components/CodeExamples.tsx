import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface CodeExamplesProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CodeExamples({ isOpen, onClose }: CodeExamplesProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-semibold text-gray-900">
              Code Examples
            </DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="w-6 h-6" />
            </Button>
          </div>
        </DialogHeader>
        
        <div className="overflow-y-auto max-h-[calc(90vh-140px)] space-y-6">
          {/* Gemini Vision API Example */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3">Gemini Vision API Integration</h3>
            <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
              <pre className="text-green-400 text-sm">
                <code>{`// Example: Image analysis with Gemini Vision API
import { GoogleGenAI } from "@google/genai";

async function analyzeImage(imageFile) {
    const gemini = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY
    });
    
    const base64Image = await convertToBase64(imageFile);
    
    const contents = [{
        inlineData: {
            data: base64Image,
            mimeType: imageFile.type,
        },
    }, "Analyze this image in detail and describe its key elements."];

    const response = await gemini.models.generateContent({
        model: "gemini-2.5-flash",
        contents: contents,
    });

    return response.text;
}`}</code>
              </pre>
            </div>
          </div>

          {/* Text-to-Speech Example */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3">Text-to-Speech Implementation</h3>
            <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
              <pre className="text-green-400 text-sm">
                <code>{`// Example: Text-to-speech using Web Speech API
function textToSpeech(text) {
    if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        
        // Configure voice settings
        utterance.rate = 1;
        utterance.pitch = 1;
        utterance.volume = 1;
        
        // Optional: Select specific voice
        const voices = speechSynthesis.getVoices();
        utterance.voice = voices.find(voice => 
            voice.name.includes('Google') || voice.default
        );
        
        // Add event listeners
        utterance.onstart = () => console.log('Speech started');
        utterance.onend = () => console.log('Speech ended');
        utterance.onerror = (e) => console.error('Speech error:', e);
        
        // Speak the text
        speechSynthesis.speak(utterance);
    } else {
        console.log('Text-to-speech not supported');
    }
}`}</code>
              </pre>
            </div>
          </div>

          {/* File Upload Example */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3">File Upload Handling</h3>
            <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
              <pre className="text-green-400 text-sm">
                <code>{`// Example: File upload with drag and drop
const uploadArea = document.getElementById('upload-area');
const fileInput = document.getElementById('file-input');

// Handle drag and drop
uploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadArea.classList.add('border-blue-400', 'bg-blue-50');
});

uploadArea.addEventListener('dragleave', () => {
    uploadArea.classList.remove('border-blue-400', 'bg-blue-50');
});

uploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadArea.classList.remove('border-blue-400', 'bg-blue-50');
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
        handleFile(files[0]);
    }
});

// Handle file selection
fileInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
        handleFile(e.target.files[0]);
    }
});

// File processing function
async function handleFile(file) {
    // Validate file type
    if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
    }
    
    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
        alert('File too large. Please select an image under 10MB');
        return;
    }
    
    // Create FormData and upload
    const formData = new FormData();
    formData.append('image', file);
    
    try {
        const response = await fetch('/api/analyze-image', {
            method: 'POST',
            body: formData
        });
        
        const result = await response.json();
        console.log('Analysis result:', result);
    } catch (error) {
        console.error('Upload failed:', error);
    }
}`}</code>
              </pre>
            </div>
          </div>

          {/* React Component Example */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3">React Component Structure</h3>
            <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
              <pre className="text-green-400 text-sm">
                <code>{`// Example: React component for image upload
import { useState, useCallback } from 'react';

function ImageUpload({ onAnalysisComplete }) {
    const [selectedFile, setSelectedFile] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);
    
    const handleFileSelect = useCallback((file) => {
        if (file && file.type.startsWith('image/')) {
            setSelectedFile(file);
        }
    }, []);
    
    const handleAnalyze = async () => {
        if (!selectedFile) return;
        
        setIsProcessing(true);
        
        try {
            const formData = new FormData();
            formData.append('image', selectedFile);
            
            const response = await fetch('/api/analyze-image', {
                method: 'POST',
                body: formData,
            });
            
            const result = await response.json();
            onAnalysisComplete(result);
        } catch (error) {
            console.error('Analysis failed:', error);
        } finally {
            setIsProcessing(false);
        }
    };
    
    return (
        <div className="upload-container">
            <input 
                type="file" 
                accept="image/*" 
                onChange={(e) => handleFileSelect(e.target.files[0])}
            />
            <button 
                onClick={handleAnalyze} 
                disabled={!selectedFile || isProcessing}
            >
                {isProcessing ? 'Analyzing...' : 'Analyze Image'}
            </button>
        </div>
    );
}`}</code>
              </pre>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
